import type { NewsAgentInput, NewsAgentOutput, NewsClaim, NewsSourceRecord } from "@portfolio/contracts";

export const newsSources: NewsSourceRecord[] = [
  {
    id: "news-source-government",
    title: "公开政策信息核验指南（演示来源）",
    publisher: "中国政府网公开信息",
    publishedAt: "2026-07-01",
    url: "https://www.gov.cn/",
    keyFacts: ["政策信息应以政府网站发布内容为准", "政策适用范围需要结合地区与日期核验"],
    scope: "政策类信息的来源与适用范围核验"
  },
  {
    id: "news-source-weather",
    title: "气象预警公开信息核验指南（演示来源）",
    publisher: "中国气象局公开信息",
    publishedAt: "2026-07-01",
    url: "https://www.cma.gov.cn/",
    keyFacts: ["天气预警需要结合发布时间和地区范围", "预警状态可能随时间更新"],
    scope: "天气与灾害信息的时效性核验"
  },
  {
    id: "news-source-health",
    title: "健康信息公开来源核验指南（演示来源）",
    publisher: "国家卫生健康委公开信息",
    publishedAt: "2026-07-01",
    url: "https://www.nhc.gov.cn/",
    keyFacts: ["健康信息应以权威机构发布内容为准", "个人健康问题不能只根据网络摘要判断"],
    scope: "健康类内容的风险提示与人工复核"
  }
];

function splitClaims(body: string) {
  return body
    .split(/[。！？!?；;\n]+/)
    .map((item) => item.trim().replace(/^[\-•·\d.、)）]+\s*/, ""))
    .filter(Boolean)
    .slice(0, 6);
}

function findSources(claim: string, sources: NewsSourceRecord[]) {
  if (/天气|台风|暴雨|预警|气象|登陆/.test(claim)) {
    return sources.filter((source) => source.id === "news-source-weather");
  }
  if (/健康|医疗|药|疫苗|疾病|医院/.test(claim)) {
    return sources.filter((source) => source.id === "news-source-health");
  }
  const keywordGroups = [
    { keywords: ["政策", "政府", "国务院", "教育", "规定"], id: "news-source-government" }
  ];
  const matchedIds = keywordGroups
    .filter((group) => group.keywords.some((keyword) => claim.includes(keyword)))
    .map((group) => group.id);
  return sources.filter((source) => matchedIds.includes(source.id));
}

function classifyClaim(claim: string, matchedSources: NewsSourceRecord[]) {
  if (/网传|据说|疑似|可能|尚无官方|未经证实/.test(claim)) return "needs-human-check" as const;
  if (/官方否认|与官方|相冲突|冲突|辟谣/.test(claim)) return "conflict" as const;
  if (/一定|百分百|绝对|已证实/.test(claim)) return "needs-human-check" as const;
  if (matchedSources.length) return "verified" as const;
  return "unsupported" as const;
}

function buildClaim(claim: string, index: number, sources: NewsSourceRecord[]): NewsClaim {
  const matchedSources = findSources(claim, sources);
  const status = classifyClaim(claim, matchedSources);
  const evidence = matchedSources.length
    ? matchedSources.flatMap((source) => source.keyFacts.slice(0, 1))
    : ["内置公开来源中没有匹配到可直接支持该主张的证据"];
  const rationale = status === "verified"
    ? "主张与内置公开来源的主题和关键事实一致，但发布前仍需确认时间与适用范围。"
    : status === "conflict"
      ? "文本出现与官方信息冲突的表述，不能自动生成确定性结论。"
      : status === "needs-human-check"
        ? "文本包含传闻、推测或过度确定性表达，需要补充原始来源并人工复核。"
        : "没有足够来源支持该主张，只能保留为待核验信息。";
  return {
    id: `claim-${index + 1}`,
    text: claim,
    status,
    evidence,
    sourceIds: matchedSources.map((source) => source.id),
    rationale
  };
}

export function runNewsAgent(input: NewsAgentInput): NewsAgentOutput {
  const title = input.title.trim() || "未命名新闻素材";
  const availableSources = input.sources?.length
    ? input.sources
    : newsSources.filter((source) => !input.sourceIds?.length || input.sourceIds.includes(source.id));
  const rawClaims = splitClaims(input.body.trim());
  const claims = rawClaims.length
    ? rawClaims.map((claim, index) => buildClaim(claim, index, availableSources))
    : [buildClaim("未提供正文，无法提取事实主张", 0, [])];
  const verifiedClaims = claims.filter((claim) => claim.status === "verified");
  const unresolvedClaims = claims.filter((claim) => claim.status !== "verified");
  const summary = verifiedClaims.length
    ? `已核验要点：${verifiedClaims.map((claim) => claim.text).join("；")}。${unresolvedClaims.length ? `仍有${unresolvedClaims.length}条主张待人工复核。` : ""}`
    : "当前没有足够来源支持确定性摘要，建议先补充原始链接或交由编辑人工核验。";
  const riskFlags = [
    unresolvedClaims.some((claim) => claim.status === "needs-human-check") ? "存在传闻、推测或过度确定性表达" : "",
    unresolvedClaims.some((claim) => claim.status === "conflict") ? "存在与来源冲突的主张" : "",
    unresolvedClaims.some((claim) => claim.status === "unsupported") ? "部分主张没有匹配到内置公开来源" : ""
  ].filter(Boolean);
  const manualChecks = [
    "发布前重新确认来源发布时间、地域范围和原文表述",
    unresolvedClaims.length ? "待核验主张不得写成确定性新闻结论" : "保留来源链接并完成编辑复核",
    claims.some((claim) => /健康|医疗|药|疫苗/.test(claim.text)) ? "健康类信息不得替代专业诊疗建议" : ""
  ].filter(Boolean);
  return {
    title,
    summary,
    claims,
    sources: availableSources,
    confidence: Math.round((verifiedClaims.length / Math.max(claims.length, 1)) * 100),
    riskFlags,
    manualChecks,
    mode: "research"
  };
}
