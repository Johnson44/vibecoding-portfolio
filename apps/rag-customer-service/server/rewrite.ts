import type { ConversationTurn, GlossaryEntry, RewriteProvider, RewriteResult } from "./types.js";

const STOPWORDS = new Set("的了呢啊吗请问一下怎么如何什么哪些是否可以能不能以及还有这个那个我们你我他它需要关于进行一个一种相关具体情况流程问题要求材料时间原因".split(""));

export function normalizeQuestion(question: string): string {
  return question
    .replace(/[“”"「」『』]/g, "")
    .replace(/[？?]+/g, "？")
    .replace(/[！!]+/g, "！")
    .replace(/[，,]+/g, "，")
    .replace(/\s+/g, " ")
    .replace(/咋/g, "怎么")
    .replace(/啥/g, "什么")
    .replace(/咋样/g, "怎么样")
    .replace(/能不能/g, "是否可以")
    .trim();
}

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const normalized = text.toLowerCase();
  const schoolPhraseMatches = [...normalized.matchAll(/(?:\d{1,3}|[一二三四五六七八九十百]+)中/g)];
  const schoolPhraseStarts = new Set(schoolPhraseMatches.map((match) => match.index ?? -1));
  const schoolMarkerPositions = new Set<number>();
  for (const match of schoolPhraseMatches) {
    const start = match.index ?? 0;
    [...match[0]].forEach((character, offset) => {
      if (/^[\u3400-\u9fff]$/.test(character)) schoolMarkerPositions.add(start + offset);
    });
  }
  for (const match of normalized.matchAll(/[a-z0-9][a-z0-9_-]*/g)) {
    if (match[0].length > 1 && !schoolPhraseStarts.has(match.index ?? -1)) tokens.push(match[0]);
  }
  for (const run of normalized.matchAll(/[\u3400-\u9fff]+/g)) {
    const value = run[0];
    const runStart = run.index ?? 0;
    for (let index = 0; index < value.length; index += 1) {
      const char = value[index];
      if (!STOPWORDS.has(char) && !schoolMarkerPositions.has(runStart + index)) tokens.push(char);
    }
    for (let index = 0; index < value.length - 1; index += 1) {
      const pair = value.slice(index, index + 2);
      const includesSchoolMarker = schoolMarkerPositions.has(runStart + index) || schoolMarkerPositions.has(runStart + index + 1);
      if (!includesSchoolMarker && ![...pair].some((char) => STOPWORDS.has(char))) tokens.push(pair);
    }
  }
  return [...new Set([...schoolPhraseMatches.map((match) => match[0]), ...tokens])];
}

function applyGlossary(text: string, glossary: GlossaryEntry[]): { text: string; applied: Array<{ source: string; target: string }> } {
  let result = text;
  const applied: Array<{ source: string; target: string }> = [];
  const sorted = [...glossary].sort((left, right) => right.source.length - left.source.length);
  for (const entry of sorted) {
    if (!entry.source || entry.source === entry.target || !result.includes(entry.source)) continue;
    result = result.split(entry.source).join(entry.target);
    applied.push({ source: entry.source, target: entry.target });
  }
  return { text: result, applied };
}

function topicTerms(text: string): string[] {
  const cleaned = normalizeQuestion(text)
    .replace(/(是什么|怎么做|怎么办|如何办理|如何申请|有哪些|需要什么材料)？?$/g, "")
    .trim();
  const phrases = cleaned.match(/[\u3400-\u9fff]{2,}/g) ?? [];
  return [...new Set(phrases.filter((phrase) => phrase.length >= 2))].slice(0, 3);
}

function splitSubQuestions(text: string): string[] {
  const pieces = text
    .split(/(?:，|；|;|\n)\s*(?:同时|另外|分别|还要|其次)?\s*|\s+(?:以及|并且|还是)\s+|(?:以及|并且|还是)/g)
    .map((piece) => piece.replace(/^[、，；;。\s]+|[，；;。\s]+$/g, "").trim())
    .filter((piece) => piece.length >= 3);
  return pieces.length > 1 ? [...new Set(pieces)] : [];
}

function hasContextPronoun(text: string): boolean {
  return /^(那|那如果|这个|它|这个流程|还要|还有|然后|另外|上述|前面)/.test(text);
}

export function rewriteQuestion(question: string, history: ConversationTurn[], glossary: GlossaryEntry[]): RewriteResult {
  const normalizedInput = normalizeQuestion(question);
  const applied = applyGlossary(normalizedInput, glossary);
  let standalone = applied.text;
  let usedContext = false;
  if (hasContextPronoun(standalone)) {
    const previousUser = [...history].reverse().find((turn) => turn.role === "user");
    if (previousUser) {
      const topics = topicTerms(previousUser.content);
      if (topics.length) {
        standalone = `关于${topics.join("、")}，${standalone}`;
        usedContext = true;
      }
    }
  }
  const subQuestions = splitSubQuestions(standalone);
  const keywords = [...new Set(tokenize(standalone).filter((token) => token.length >= 2))].slice(0, 18);
  const alternatives = [...new Set([
    standalone,
    applied.text,
    ...subQuestions,
    keywords.join(" "),
  ].filter(Boolean))].slice(0, 6);
  return {
    normalized: applied.text,
    standalone,
    subQuestions,
    alternatives,
    keywords,
    appliedTerms: applied.applied,
    usedContext,
  };
}

export class RuleRewriteProvider implements RewriteProvider {
  rewrite(question: string, history: ConversationTurn[], glossary: GlossaryEntry[]): RewriteResult {
    return rewriteQuestion(question, history, glossary);
  }
}
