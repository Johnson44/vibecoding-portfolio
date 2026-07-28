import { tokenize } from "./rewrite.js";
import type { SearchHit, TextChunk } from "./types.js";

interface IndexedChunk {
  chunk: TextChunk;
  terms: string[];
  counts: Map<string, number>;
}

function indexChunks(chunks: TextChunk[]): IndexedChunk[] {
  return chunks.map((chunk) => {
    const terms = tokenize(chunk.text);
    const counts = new Map<string, number>();
    for (const term of terms) counts.set(term, (counts.get(term) ?? 0) + 1);
    return { chunk, terms, counts };
  });
}

function rankOne(query: string, indexed: IndexedChunk[], limit: number): SearchHit[] {
  const queryTerms = [...new Set(tokenize(query))];
  const exactPhrases = extractExactPhrases(query);
  if (!queryTerms.length) return [];
  const documentFrequency = new Map<string, number>();
  for (const item of indexed) {
    for (const term of new Set(item.terms)) documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
  }
  const averageLength = indexed.reduce((total, item) => total + item.terms.length, 0) / Math.max(indexed.length, 1);
  const totalDocuments = indexed.length;
  const scored: SearchHit[] = [];
  for (const item of indexed) {
    const matchedTerms = queryTerms.filter((term) => item.counts.has(term));
    const phraseMatches = exactPhrases.filter((phrase) => item.chunk.text.includes(phrase));
    const schoolMatches = exactPhrases.filter((phrase) => schoolAppearsInText(phrase, item.chunk.text));
    matchedTerms.push(...phraseMatches.filter((phrase) => !matchedTerms.includes(phrase)));
    matchedTerms.push(...schoolMatches.filter((phrase) => !matchedTerms.includes(phrase)));
    if (!matchedTerms.length) continue;
    const length = Math.max(item.terms.length, 1);
    let score = 0;
    for (const term of queryTerms) {
      const frequency = item.counts.get(term) ?? 0;
      if (!frequency) continue;
      const df = documentFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (totalDocuments - df + 0.5) / (df + 0.5));
      const k1 = 1.35;
      const b = 0.72;
      score += idf * ((frequency * (k1 + 1)) / (frequency + k1 * (1 - b + b * (length / Math.max(averageLength, 1)))));
    }
    const exactPhrase = item.chunk.text.includes(query.trim()) && query.trim().length >= 3;
    if (exactPhrase) score += 1.4;
    score += phraseMatches.length * 4;
    score += schoolMatches.length * 6;
    score += schoolFieldBoost(query, item.chunk.text);
    score += matchedTerms.length / Math.max(queryTerms.length, 1);
    score += zoningSourceBoost(query, item.chunk);
    scored.push({
      ...item.chunk,
      score,
      matchedTerms,
      snippet: makeSnippet(item.chunk.text, matchedTerms),
    });
  }
  return scored.sort((left, right) => right.score - left.score).slice(0, limit);
}

function schoolAppearsInText(school: string, text: string): boolean {
  const digits = school.match(/\d+/)?.[0];
  if (!digits) return false;
  return text.includes(school) || text.includes(`第${toChineseNumber(Number(digits))}中学`);
}

function toChineseNumber(value: number): string {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (value < 10) return digits[value];
  if (value < 20) return `十${value === 10 ? "" : digits[value - 10]}`;
  if (value < 100) return `${digits[Math.floor(value / 10)]}十${value % 10 === 0 ? "" : digits[value % 10]}`;
  return String(value);
}

function zoningSourceBoost(query: string, chunk: TextChunk): number {
  const zoningIntent = ["划片", "招生范围", "学区", "招生地图", "对口"].some((term) => query.includes(term));
  if (!zoningIntent) return 0;
  if (chunk.sourceName.includes("初中划片")) return 14;
  if (chunk.sourceName.includes("小学划片")) return 4;
  return 0;
}

function schoolFieldBoost(query: string, text: string): number {
  const school = query.match(/(?:\d{1,3}|[一二三四五六七八九十百]+)中/)?.[0];
  if (!school) return 0;
  const field = text.match(/(?:学校信息|学校)[：:]\s*([^\n]+)/)?.[1]?.trim() ?? "";
  const schoolName = field.split(/\s+-\s+|\s+(?=(?:基本情况|性质|教育集团|作息|学费|25级班级数|报名条件|招生范围)[：:])/)[0]?.trim() ?? "";
  if (!schoolName || !schoolName.includes(school)) return 0;
  if (query.includes("本部") && schoolName.includes("本部")) return 18;
  if (query.includes("实验") && schoolName.includes("实验")) return 16;
  if (schoolName === school || schoolName === `${school}（本部）` || schoolName === `${school}(本部)`) return 14;
  return 5;
}

function extractExactPhrases(query: string): string[] {
  return [...new Set(query.match(/(?:\d{1,3}|[一二三四五六七八九十百]+)中/g) ?? [])].filter((phrase) => phrase.length >= 2);
}

export function searchChunks(queries: string[], chunks: TextChunk[], limit = 5): SearchHit[] {
  const indexed = indexChunks(chunks);
  const merged = new Map<string, SearchHit>();
  queries.forEach((query, queryIndex) => {
    for (const hit of rankOne(query, indexed, limit * 2)) {
      const blendedScore = hit.score / (1 + queryIndex * 0.16);
      const existing = merged.get(hit.id);
      if (!existing || blendedScore > existing.score) merged.set(hit.id, { ...hit, score: blendedScore });
    }
  });
  return [...merged.values()].sort((left, right) => right.score - left.score).slice(0, limit);
}

function makeSnippet(text: string, matchedTerms: string[]): string {
  const firstMatch = matchedTerms.map((term) => text.toLowerCase().indexOf(term.toLowerCase())).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, firstMatch - 80);
  const end = Math.min(text.length, start + 260);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}
