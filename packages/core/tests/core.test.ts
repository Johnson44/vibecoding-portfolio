import { describe, expect, it } from "vitest";
import type { Formation, Player } from "@portfolio/contracts";
import {
  analyzeMatch,
  agentEvalTasks,
  runAgentEval,
  educationAcceptanceCases,
  educationCompetitorSamples,
  educationPolicySources,
  educationSampleAnnotations,
  esportsCompetitorVideos,
  excludedServiceTerms,
  formationRules,
  generateMealPlans,
  importEducationCompetitorCsv,
  players,
  runEducationAgent,
  runEsportsAgent,
  runNewsAgent,
  runViralAgent,
  safeServicePackages,
  teamScore,
  teams,
  validateLineup,
  worldCupFixtures,
  worldCupStandings,
  worldCupTeams
} from "../src";

describe("world cup scoring", () => {
  it("contains the complete 48-team, 104-match archive with flags", () => {
    expect(worldCupTeams).toHaveLength(48);
    expect(new Set(worldCupTeams.map((team) => team.flag)).size).toBe(48);
    expect(worldCupFixtures).toHaveLength(104);
    expect(worldCupFixtures.filter((fixture) => fixture.stage === "小组赛")).toHaveLength(72);
    expect(worldCupFixtures.every((fixture) => typeof fixture.homeScore === "number" && typeof fixture.awayScore === "number")).toBe(true);
    expect(worldCupStandings["C组"][0]).toMatchObject({ teamId: "bra", points: 7, goalDifference: 6 });
    expect(worldCupStandings["H组"][0]).toMatchObject({ teamId: "esp", points: 7, goalDifference: 5 });
  });

  it("recalculates the documented weighted score", () => {
    expect(teamScore(teams[0])).toBe(87.8);
  });

  it("keeps match probabilities at 100%", () => {
    const result = analyzeMatch(teams[0], teams[1]);
    expect(result.probability.homeWin + result.probability.draw + result.probability.awayWin).toBeCloseTo(100);
  });

  it("rejects an incomplete lineup", () => {
    const result = validateLineup("4-3-3", players.slice(0, 5), players[0].id);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("必须选择11名球员");
  });

  (["4-3-3", "4-4-2", "3-5-2"] as Formation[]).forEach((formation) => {
    it(`accepts a valid ${formation} lineup within budget`, () => {
      const selected = (Object.keys(formationRules[formation]) as Player["position"][]).flatMap((position) =>
        players.filter((player) => player.position === position).sort((a, b) => a.cost - b.cost).slice(0, formationRules[formation][position])
      );
      const result = validateLineup(formation, selected, selected[0].id);
      expect(result.cost).toBeLessThanOrEqual(100);
      expect(result).toMatchObject({ valid: true, errors: [] });
    });
  });
});

describe("meal plan", () => {
  it("returns three plans within the requested budget where possible", () => {
    const plans = generateMealPlans({ goal: "均衡", budget: 50, flavors: [], exclusions: [] });
    expect(plans).toHaveLength(3);
    plans.forEach((plan) => expect(plan.totalPrice).toBeLessThanOrEqual(50));
  });
});

describe("education research import", () => {
  it("parses Feishu multiline CSV without exposing the internal analysis column", () => {
    const csv = [
      '小升初对标内容,,,,,,,',
      '序号,链接,选题,文案,封面,内容页,内部分析,分析人',
      '1,"https://xhslink.com/a","暑假衔接","第一行\n第二行",,,"照搬页面并洗稿","某同事"'
    ].join("\n");
    const result = importEducationCompetitorCsv(csv, "小升初对标内容.csv");
    expect(result.samples).toHaveLength(1);
    expect(result.samples[0].body).toContain("第二行");
    expect(JSON.stringify(result.samples[0])).not.toContain("照搬");
    expect(JSON.stringify(result.samples[0])).not.toContain("某同事");
  });

  it("bundles 20 public samples and at least 10 official policy sources", () => {
    expect(educationCompetitorSamples).toHaveLength(20);
    expect(educationSampleAnnotations).toHaveLength(educationCompetitorSamples.length);
    expect(new Set(educationSampleAnnotations.map((annotation) => annotation.sampleId)).size).toBe(educationCompetitorSamples.length);
    expect(educationPolicySources.length).toBeGreaterThanOrEqual(10);
    educationPolicySources.forEach((source) => {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.publishedAt).toMatch(/^20\d{2}-\d{2}-\d{2}$/);
    });
  });

  it("passes real material counts into the education output", () => {
    const result = runEducationAgent({
      stage: "小升初",
      district: "长安区",
      parentProfile: "信息焦虑型家长",
      goal: "留资",
      accountTone: "克制",
      forbiddenExpressions: ["保录"]
    });
    expect(result.mode).toBe("research");
    expect(result.materialStats).toMatchObject({
      competitorCount: 10,
      policyCount: educationPolicySources.length,
      annotatedSampleCount: 10,
      acceptanceCaseCount: educationAcceptanceCases.length
    });
    expect(result.sources.every((source) => source.url)).toBe(true);
  });

  it("keeps three complete acceptance baselines within the 2-5 page rule", () => {
    expect(educationAcceptanceCases).toHaveLength(3);
    educationAcceptanceCases.forEach((item) => {
      expect(item.pageCount).toBeGreaterThanOrEqual(2);
      expect(item.pageCount).toBeLessThanOrEqual(5);
      expect(item.deliverables.length).toBe(item.pageCount);
      expect(item.sourceIds.length).toBeGreaterThan(0);
      expect(item.passedChecks.length).toBeGreaterThan(0);
      expect(item.openChecks.length).toBeGreaterThan(0);
    });
  });

  it("covers six topic directions and returns three 2-5 page plans", () => {
    const result = runEducationAgent({
      stage: "小升初",
      district: "长安区",
      parentProfile: "准备报名",
      goal: "留资",
      accountTone: "克制",
      forbiddenExpressions: [],
      topic: "报名教程",
      hook: "校情表"
    });
    expect(result.topicIdeas.map((item) => item.topic)).toEqual(["房户一致分析", "入学材料准备", "重大事件时间轴", "学校排名", "摇号解析", "报名教程"]);
    expect(result.plans).toHaveLength(3);
    result.plans.forEach((plan) => {
      expect(plan.cards.length).toBeGreaterThanOrEqual(2);
      expect(plan.cards.length).toBeLessThanOrEqual(5);
      expect(plan.title.length).toBeLessThanOrEqual(20);
      expect(plan.comments.join(" ")).not.toContain("嘶您了");
      expect(plan.sources.every((source) => source.url)).toBe(true);
    });
  });

  it("turns school ranking into a sourced comparison instead of an official ranking", () => {
    const result = runEducationAgent({
      stage: "小升初",
      district: "桥西区",
      parentProfile: "比较学校",
      goal: "互动",
      accountTone: "清晰",
      forbiddenExpressions: [],
      topic: "学校排名",
      hook: "入学测真题"
    });
    expect(result.cards).toHaveLength(5);
    expect(result.postBody).toContain("不是官方学校排名");
    expect(result.cover.secondary).toContain("非学校考试真题");
    expect(result.manualChecks.join(" ")).toContain("不得出现官方排名");
  });
});

describe("esports research guardrails", () => {
  it("contains enough public samples for the planned validation", () => {
    expect(esportsCompetitorVideos.length).toBeGreaterThanOrEqual(20);
    expect(esportsCompetitorVideos.filter((video) => (video.durationSec ?? 0) >= 60 && (video.durationSec ?? 0) <= 180).length).toBeGreaterThanOrEqual(2);
    expect(esportsCompetitorVideos.every((video) => video.transcriptStatus === "burned-in-no-track")).toBe(true);
  });

  it("keeps prohibited services out of package names and categories", () => {
    const searchableCatalog = safeServicePackages.map((service) => `${service.name} ${service.category}`).join(" ");
    excludedServiceTerms.forEach((term) => expect(searchableCatalog).not.toContain(term));
    expect(safeServicePackages.every((service) => service.manualConfirmation || service.priceLabel === "不单独计费")).toBe(true);
  });

  it("reports the missing caption track instead of inventing a transcript", () => {
    const result = runEsportsAgent({ game: "CS2", persona: "指挥型", audience: "新手", goal: "咨询" });
    expect(result.mode).toBe("research");
    expect(result.materialStats.captionTrackCount).toBe(0);
    expect(result.sourceInsights.join(" ")).toContain("没有B站机器可读字幕轨");
    expect(result.scripts.every((script) => script.duration >= 60 && script.duration <= 180)).toBe(true);
  });
});

describe("viral teardown workflow", () => {
  it("visualizes the five-step teardown and keeps the evidence boundary", () => {
    const result = runViralAgent({
      platform: "小红书",
      title: "3个动作把复杂问题讲清楚",
      contentUrl: "https://example.com/authorized-sample",
      content: "演示文本：先提出一个具体问题，再给出证据，最后让读者知道下一步怎么做。",
      goal: "拆解"
    });
    expect(result.process).toHaveLength(5);
    expect(result.process.filter((step) => step.status === "completed")).toHaveLength(5);
    expect(result.hook.type).toBe("数字清单型");
    expect(result.source.metricsStatus).toBe("not-provided");
    expect(result.riskFlags.join(" ")).toContain("不能仅凭标题称为爆款");
    expect(result.rewritePlan.originalityRules.join(" ")).toContain("不逐句改写");
  });

  it("does not pretend to dissect missing source text", () => {
    const result = runViralAgent({ platform: "B站", title: "一个标题", content: "", goal: "复盘" });
    expect(result.source.evidenceStatus).toBe("title-only");
    expect(result.process.find((step) => step.id === "structure")?.status).toBe("needs-input");
    expect(result.nextActions.join(" ")).toContain("补充已获授权");
  });
});

describe("news verification workflow", () => {
  it("separates supported claims from rumors and preserves the evidence boundary", () => {
    const result = runNewsAgent({
      title: "台风“巴威”预警信息如何避免被误读",
      body: "中国气象局提示，台风“巴威”预警信息需要结合发布时间和影响地区判断。网传台风“巴威”已经确定登陆上海，暂无官方来源。"
    });
    expect(result.claims).toHaveLength(2);
    expect(result.claims[0]).toMatchObject({ status: "verified", sourceIds: ["news-source-weather"] });
    expect(result.claims[1].status).toBe("needs-human-check");
    expect(result.summary).toContain("待人工复核");
    expect(result.riskFlags.join(" ")).toContain("传闻");
  });

  it("does not create a deterministic summary without a source", () => {
    const result = runNewsAgent({ title: "网传消息", body: "据说某产品已经百分百通过审核。" });
    expect(result.claims[0].status).toBe("needs-human-check");
    expect(result.confidence).toBe(0);
    expect(result.summary).toContain("没有足够来源");
  });

  it("returns an explicit empty-input state", () => {
    const result = runNewsAgent({ title: "", body: "" });
    expect(result.claims[0].status).toBe("unsupported");
    expect(result.manualChecks.join(" ")).toContain("发布前");
  });
});

describe("AI agent evaluation workflow", () => {
  it("scores two candidates on five dimensions and tags overconfident output", () => {
    const task = agentEvalTasks.find((item) => item.id === "news-brief")!;
    const result = runAgentEval({
      task,
      candidateA: "预警时间与地区：需要结合发布时间和影响地区判断。官方来源：中国气象局。台风“巴威”已证实会登陆上海。",
      candidateB: "预警时间与地区：结合发布时间和影响地区判断台风“巴威”的预警范围。官方来源：中国气象局公开信息。待核验边界：登陆地点没有原始链接，不能写成确定结论。建议编辑补充来源后再发布。"
    });
    expect(result.candidates[0].scores).toHaveLength(5);
    expect(result.candidates[1].totalScore).toBeGreaterThan(result.candidates[0].totalScore);
    expect(result.winner).toBe("paid");
    expect(result.candidates[0].issues.map((issue) => issue.type)).toContain("hallucination");
    expect(result.priorityIssues.length).toBeGreaterThan(0);
  });

  it("handles empty candidate answers without throwing", () => {
    const result = runAgentEval({ task: agentEvalTasks[0], candidateA: "", candidateB: "" });
    expect(result.candidates.every((candidate) => candidate.totalScore === 0 || candidate.totalScore < 60)).toBe(true);
    expect(result.candidates[0].issues.some((issue) => issue.severity === "high")).toBe(true);
  });

  it("evaluates an image-generation prompt by scene, subject, environment, and composition", () => {
    const task = agentEvalTasks.find((item) => item.id === "image-prompt")!;
    const result = runAgentEval({
      task,
      candidateA: "生成一张烟雨江南女子撑伞图，画面有水乡建筑，整体清雅朦胧。",
      candidateB: "生成一张烟雨江南女子撑伞图。烟雨江南：春日细雨中的江南水乡；女子撑伞：身穿淡青色汉服的女子；水乡建筑：白墙黛瓦、小桥和乌篷船；构图与光影：竖幅中景、侧光、浅景深，写实国风。"
    });
    expect(task.category).toBe("image-generation");
    expect(result.candidates[1].totalScore).toBeGreaterThan(result.candidates[0].totalScore);
    expect(result.winner).toBe("paid");
    expect(result.candidates[1].scores.find((score) => score.dimension === "task-completion")?.score).toBe(100);
  });
});
