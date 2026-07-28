import { tokenize } from "./rewrite.js";
import type { AnswerProvider, AnswerResult, Citation, SearchHit } from "./types.js";

const MIN_CONFIDENT_SCORE = 0.72;

export class ExtractiveAnswerProvider implements AnswerProvider {
  answer(question: string, hits: SearchHit[]): AnswerResult {
    const queryPhrases = [...new Set(tokenize(question).filter((term) => term.length >= 2))];
    const minimumPhraseMatches = queryPhrases.length <= 2 ? 1 : Math.max(2, Math.ceil(queryPhrases.length * 0.4));
    const confidentHits = hits
      .filter((hit) => hit.score >= MIN_CONFIDENT_SCORE)
      .filter((hit) => hit.matchedTerms.filter((term) => term.length >= 2).length >= minimumPhraseMatches)
      .slice(0, 4);
    if (!confidentHits.length) {
      return {
        mode: "extractive",
        confident: false,
        text: "目前资料库没有找到足够依据，请换一种问法或补充相关资料。",
        citations: [],
      };
    }
    const focusedHits = focusHits(question, confidentHits);
    const genderSummary = summarizeGenderEvidence(question, focusedHits);
    const targetedSummary = genderSummary ? null : summarizeTargetedEvidence(question, focusedHits);
    const answerHits = genderSummary?.hits ?? targetedSummary?.hits ?? focusedHits;
    return {
      mode: "extractive",
      confident: true,
      text: genderSummary?.text ?? targetedSummary?.text ?? composeSingleSentence(question, focusedHits),
      citations: answerHits.map<Citation>((hit) => ({
        chunkId: hit.id,
        sourceName: hit.sourceName,
        page: hit.page,
        section: hit.section,
        snippet: hit.snippet,
      })),
    };
  }
}

interface GenderEvidence {
  school: string;
  gender: "男" | "女";
  plan: number;
  applicants: number;
  rate: number;
  hit: SearchHit;
}

function summarizeGenderEvidence(question: string, hits: SearchHit[]): { text: string; hits: SearchHit[] } | null {
  if (!/(摇中率|中签率|报名人数|招生计划|排位计划)/.test(question)) return null;
  const records = hits.map(parseGenderEvidence).filter((record): record is GenderEvidence => Boolean(record));
  const groups = new Map<string, GenderEvidence[]>();
  for (const record of records) groups.set(record.school, [...(groups.get(record.school) ?? []), record]);
  const candidate = [...groups.entries()]
    .filter(([, values]) => new Set(values.map((value) => value.gender)).size === 2)
    .sort(([left], [right]) => Number(question.includes(right)) - Number(question.includes(left)))[0];
  if (!candidate) return null;
  const [school, values] = candidate;
  const byGender = new Map(values.map((value) => [value.gender, value]));
  const male = byGender.get("男");
  const female = byGender.get("女");
  if (!male || !female) return null;
  const totalPlan = male.plan + female.plan;
  const totalApplicants = male.applicants + female.applicants;
  const totalRate = totalApplicants ? (totalPlan / totalApplicants) * 100 : 0;
  const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2);
  return {
    text: [
      `${school}男生排位计划${format(male.plan)}人 审核报名${format(male.applicants)}人 摇中率${format(male.rate)}%`,
      `${school}女生排位计划${format(female.plan)}人 审核报名${format(female.applicants)}人 摇中率${format(female.rate)}%`,
      `合计排位计划${format(totalPlan)}人 审核报名${format(totalApplicants)}人 综合摇中率${format(totalRate)}%`,
    ].join("\n"),
    hits: [male.hit, female.hit],
  };
}

function parseGenderEvidence(hit: SearchHit): GenderEvidence | null {
  const school = extractSchoolName(hit.text);
  const gender = hit.text.match(/排位计划数[:：]\s*(男|女)\s*([\d,]+)/)?.[1] as "男" | "女" | undefined;
  const plan = Number((hit.text.match(/排位计划数[:：]\s*(?:男|女)\s*([\d,]+)/)?.[1] ?? "").replace(/,/g, ""));
  const applicants = Number((hit.text.match(/通过审核报名人数[:：]\s*([\d,]+)/)?.[1] ?? "").replace(/,/g, ""));
  const rate = Number(hit.text.match(/摇中率[:：]\s*([\d.]+)%/)?.[1] ?? "");
  if (!school || !gender || !Number.isFinite(plan) || !Number.isFinite(applicants) || !Number.isFinite(rate)) return null;
  return { school, gender, plan, applicants, rate, hit };
}

interface TargetedEvidence {
  school: string;
  metric: string;
  value: string;
  hit: SearchHit;
}

function summarizeTargetedEvidence(question: string, hits: SearchHit[]): { text: string; hits: SearchHit[] } | null {
  const metric = requestedMetric(question);
  if (!metric) return null;
  const candidates = hits
    .map((hit) => {
      const school = extractSchoolName(hit.text);
      const value = hit.text.match(metric.pattern)?.[1]?.trim();
      return school && value ? { school, metric: metric.label, value, hit } : null;
    })
    .filter((candidate): candidate is TargetedEvidence => Boolean(candidate));
  if (!candidates.length) return null;
  const exact = candidates.filter((candidate) => schoolNameMatches(question, candidate.school));
  const selected = exact[0] ?? candidates[0];
  return {
    text: `${selected.school}${selected.metric}为${tidyAnswerLine(selected.value)}。`,
    hits: [selected.hit],
  };
}

function requestedMetric(question: string): { label: string; pattern: RegExp } | null {
  if (/(摇中率|中签率)/.test(question)) return { label: "摇中率", pattern: /摇中率[:：]\s*([\d.]+%)/ };
  if (/通过审核报名人数|审核报名人数|报名人数/.test(question)) return { label: "通过审核报名人数", pattern: /通过审核报名人数[:：]\s*([\d,]+)/ };
  if (/排位计划数|招生计划|计划数/.test(question)) return { label: "排位计划数", pattern: /排位计划数[:：]\s*(?:男|女)?\s*([\d,]+)/ };
  if (/走读\/住宿|住宿|住校/.test(question)) return { label: "住宿情况", pattern: /走读\/住宿[:：]\s*([^\-]+)/ };
  if (/报名条件|报名资格/.test(question)) return { label: "报名条件", pattern: /报名条件[:：]\s*([^\-]+)/ };
  if (/作息|晚自习|早自习/.test(question)) return { label: "作息", pattern: /作息\/晚自习[^:：]*[:：]\s*(.*?)(?=\s+-\s+[^-:：]+[:：]|$)/ };
  return null;
}

function composeSingleSentence(question: string, hits: SearchHit[]): string {
  const summaries = hits
    .map((hit) => summarizeEvidence(question, hit))
    .filter((line, index, all) => all.indexOf(line) === index);
  if (!summaries.length) return "目前资料库没有找到足够依据，请换一种问法或补充相关资料。";
  if (question.includes("途径") || question.includes("有哪些")) {
    const summary = summaries.find((line) => line.includes("【总结】"));
    if (summary) {
      const list = summary.split("【总结】")[1]?.replace(/^[^：:]*[：:]/, "").split("纵观")[0].trim();
      if (list) return `资料显示 石家庄小升初入学途径包括${tidyAnswerLine(list)}`;
    }
  }
  return `资料显示 ${tidyAnswerLine(summaries[0])}`;
}

function tidyAnswerLine(line: string): string {
  return line
    .replace(/^资料标注[：:]\s*/, "")
    .replace(/^\s*(?:[-*•·]|\d+[.](?=\s)|\d+[、)]|[一二三四五六七八九十]+[、.)])\s*/, "")
    .replace(/\s+[-—–]\s+/g, " ")
    .replace(/[；;]+/g, " ")
    .replace(/[，,]+/g, " ")
    .replace(/([^\d])[:：]\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .replace(/^[。！？!?；;，,\s]+|[。！？!?；;，,\s]+$/g, "")
    .trim();
}

function focusHits(question: string, hits: SearchHit[]): SearchHit[] {
  const school = question.match(/(?:\d{1,3}|[一二三四五六七八九十百]+)中/)?.[0];
  const zoningQuestion = ["划片", "招生范围", "学区", "招生地图", "对口"].some((term) => question.includes(term));
  if (zoningQuestion) {
    const zoningHits = hits.filter((hit) => hit.sourceName.includes("初中划片"));
    if (school) {
      const exactZoningHits = zoningHits.filter((hit) => schoolAppearsInText(school, hit.text));
      if (exactZoningHits.length) return exactZoningHits;
    }
    if (zoningHits.length) return zoningHits;
  }
  if (school) {
    const exact = hits.filter((hit) => schoolNameMatches(school, extractSchoolName(hit.text)));
    if (exact.length) return exact;
    const loose = hits.filter((hit) => schoolAppearsInText(school, hit.text));
    if (loose.length) return loose;
  }
  if (question.includes("二中") && question.includes("一统线")) {
    const exact = hits.filter((hit) => /(?:^|\s)二中\s+一统线/.test(hit.text));
    if (exact.length) return exact;
  }
  if (question.includes("途径") || question.includes("有哪些")) {
    const focused = hits.filter((hit) => hit.text.includes("学校性质") && hit.text.includes("公办升学"));
    if (focused.length) return focused;
    const fallback = hits.filter((hit) => hit.text.includes("升学途径"));
    if (fallback.length) return fallback;
  }
  return hits;
}

function schoolAppearsInText(school: string, text: string): boolean {
  const digits = school.match(/\d+/)?.[0];
  if (!digits) return text.includes(school);
  return text.includes(school) || text.includes(`第${toChineseNumber(Number(digits))}中学`);
}

function extractSchoolName(text: string): string {
  const field = text.match(/(?:学校信息|学校)[：:]\s*([^\n]+)/)?.[1]?.trim() ?? "";
  return field.split(/\s+-\s+|\s+(?=(?:基本情况|性质|教育集团|作息|学费|25级班级数|报名条件|招生范围)[：:])/)[0]?.trim() ?? "";
}

function schoolNameMatches(query: string, school: string): boolean {
  if (!query || !school) return false;
  const baseSchool = school.replace(/[（(].*?[）)]/g, "").trim();
  return query.includes(school) || query.includes(baseSchool);
}

function toChineseNumber(value: number): string {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (value < 10) return digits[value];
  if (value < 20) return `十${value === 10 ? "" : digits[value - 10]}`;
  if (value < 100) return `${digits[Math.floor(value / 10)]}十${value % 10 === 0 ? "" : digits[value % 10]}`;
  return String(value);
}

function summarizeEvidence(question: string, hit: SearchHit): string {
  const cleaned = hit.snippet
    .replace(/^[…鈥\s]+|[…鈥\s]+$/g, "")
    .replace(/原文摘录/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const fullText = hit.text.replace(/\s+/g, " ");
  const school = question.match(/(?:\d{1,3}|[一二三四五六七八九十百]+)中/)?.[0];
  const zoningQuestion = ["划片", "招生范围", "学区", "招生地图", "对口"].some((term) => question.includes(term));
  if (zoningQuestion && school && schoolAppearsInText(school, fullText)) {
    const zoningEvidence = extractZoningEvidence(school, fullText);
    if (zoningEvidence) return zoningEvidence;
  }
  if (school && new RegExp(`学校[：:]\\s*${school}`).test(fullText)) {
    const classes = fullText.match(/25级班级数[：:]\s*([^\-]{1,80})/)?.[1]?.trim();
    const excellent = fullText.match(/25出口\/优秀率[：:]\s*([^\-]{1,100})/)?.[1]?.trim().replace(/^优秀率[：:]?\s*/, "");
    if (classes && excellent) return `${school}25级班级数为${classes}，优秀率为${excellent}。`;
    if (classes) return `${school}25级班级数为${classes}。`;
    if (excellent) return `${school}优秀率为${excellent}。`;
  }
  if (/一统线/.test(question) && /一统线/.test(fullText)) {
    const score = fullText.match(/一统线\s*[:：]?\s*(\d{3})/);
    if (score) return `资料标注：2025 年一统线为 ${score[1]} 分。`;
  }
  if (/二统线/.test(question) && /二统线/.test(fullText)) {
    const score = fullText.match(/二统线\s*[:：]?\s*(\d{3})/);
    if (score) return `资料标注：2025 年二统线为 ${score[1]} 分。`;
  }
  if ((question.includes("途径") || question.includes("有哪些")) && fullText.includes("升学途径")) {
    const methods = fullText.match(/升学途径\s+(.{0,180})/);
    if (methods) return `资料将升学途径整理为：${methods[1].replace(/…+$/, "").trim()}。`;
  }
  const queryPhrases = [...new Set(tokenize(question).filter((term) => term.length >= 2))];
  const phrase = [...queryPhrases].reverse().find((term) => cleaned.includes(term));
  if (phrase) {
    const position = cleaned.indexOf(phrase);
    const start = Math.max(0, position - 42);
    const end = Math.min(cleaned.length, start + 118);
    return `${start > 0 ? "…" : ""}${cleaned.slice(start, end).trim()}${end < cleaned.length ? "…" : ""}`;
  }
  const sentences = cleaned.split(/[。！？；;]+/).map((sentence) => sentence.trim()).filter(Boolean);
  const matched = sentences.sort((left, right) => matchCount(right, hit.matchedTerms) - matchCount(left, hit.matchedTerms))[0] ?? cleaned;
  return matched.length > 150 ? `${matched.slice(0, 147)}…` : matched;
}

function extractZoningEvidence(school: string, text: string): string | null {
  const digits = school.match(/\d+/)?.[0];
  if (!digits) return null;
  const marker = `第${toChineseNumber(Number(digits))}中学`;
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) return null;
  const cityStart = text.lastIndexOf("石家庄市", markerIndex);
  const start = cityStart >= 0 ? cityStart : Math.max(0, markerIndex - 12);
  const nextSchool = text.indexOf("石家庄市第", markerIndex + marker.length);
  const end = nextSchool > markerIndex ? nextSchool : Math.min(text.length, start + 300);
  return text.slice(start, end).trim();
}

function matchCount(text: string, terms: string[]): number {
  return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
}
