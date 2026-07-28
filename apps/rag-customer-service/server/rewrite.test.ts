import { describe, expect, it } from "vitest";
import { normalizeQuestion, rewriteQuestion } from "./rewrite.js";

describe("rule rewrite", () => {
  it("normalizes conversational words and applies enterprise glossary terms", () => {
    const result = rewriteQuestion("咋报销，啥材料？", [], [{ id: "1", source: "报销", target: "费用报销", kind: "synonym" }]);
    expect(normalizeQuestion("咋报销，啥材料？")).toContain("怎么");
    expect(result.normalized).toContain("费用报销");
    expect(result.normalized).not.toContain("啥");
    expect(result.appliedTerms).toEqual([{ source: "报销", target: "费用报销" }]);
  });

  it("carries the previous topic into a pronoun follow-up", () => {
    const result = rewriteQuestion("那多久到账？", [{ role: "user", content: "费用报销流程是什么？" }], []);
    expect(result.usedContext).toBe(true);
    expect(result.standalone).toContain("费用报销");
  });

  it("splits multi-intent questions into sub-questions", () => {
    const result = rewriteQuestion("报销需要哪些材料，以及请假如何申请？", [], []);
    expect(result.subQuestions).toHaveLength(2);
    expect(result.subQuestions[0]).toContain("报销");
    expect(result.subQuestions[1]).toContain("请假");
  });

  it("keeps numeric middle-school names intact in keywords", () => {
    const result = rewriteQuestion("81中划片", [], []);
    expect(result.keywords).toContain("81中");
    expect(result.keywords).toContain("划片");
    expect(result.keywords).not.toContain("中划");
  });

  it("keeps Chinese-number school names intact in keywords", () => {
    const result = rewriteQuestion("石家庄二中作息", [], []);
    expect(result.keywords).toContain("二中");
    expect(result.keywords).toContain("作息");
    expect(result.keywords).not.toContain("中作");
  });
});
