import { describe, expect, it } from "vitest";
import { ExtractiveAnswerProvider } from "./answer.js";
import type { SearchHit } from "./types.js";

const provider = new ExtractiveAnswerProvider();

describe("extractive answer", () => {
  it("refuses when evidence is insufficient", () => {
    const answer = provider.answer("未知问题", []);
    expect(answer.confident).toBe(false);
    expect(answer.citations).toHaveLength(0);
  });

  it("returns source citations with evidence", () => {
    const hit: SearchHit = { id: "c1", documentId: "d1", sourceName: "资料.md", page: 3, section: "流程", text: "原文", score: 1.2, matchedTerms: ["流程"], snippet: "流程原文摘录" };
    const answer = provider.answer("流程是什么", [hit]);
    expect(answer.confident).toBe(true);
    expect(answer.text).toContain("资料显示");
    expect(answer.text).not.toContain("\n");
    expect(answer.text).not.toContain("原文摘录");
    expect(answer.citations[0]?.sourceName).toBe("资料.md");
  });
  it("refuses a high-scoring accidental single n-gram match", () => {
    const hit: SearchHit = { id: "c2", documentId: "d1", sourceName: "无关资料.md", page: 1, section: "正文", text: "只有一个偶然重合词", score: 8, matchedTerms: ["基地"], snippet: "只有一个偶然重合词" };
    const answer = provider.answer("火星基地午餐怎么申请", [hit]);
    expect(answer.confident).toBe(false);
    expect(answer.citations).toHaveLength(0);
  });

  it("uses the zoning map instead of the school summary for zoning questions", () => {
    const answer = provider.answer("81中划片", [
      { id: "summary", documentId: "d1", sourceName: "石家庄初中信息汇总表.table.cleaned.md", page: 1, section: "记录 2", text: "学校：81中 基本情况：属于公办划片学校。", score: 20, matchedTerms: ["81中", "划片"], snippet: "学校：81中 基本情况：属于公办划片学校。" },
      { id: "map", documentId: "d2", sourceName: "长安区初中划片2026.md", page: 11, section: "原始 PDF 第 11 页", text: "石家庄市第七中学 招生范围：北二环以北。石家庄市第八十一中学（育才校区）招生范围：华清北街至体育北大街，跃进路至石德铁路。", score: 10, matchedTerms: ["81中", "划片"], snippet: "石家庄市第七中学 招生范围：北二环以北。石家庄市第八十一中学（育才校区）招生范围：华清北街至体育北大街，跃进路至石德铁路。" },
    ]);
    expect(answer.citations[0]?.sourceName).toBe("长安区初中划片2026.md");
    expect(answer.text).toContain("华清北街");
    expect(answer.text).not.toContain("第七中学");
  });

  it("separates male and female lottery records and calculates the total", () => {
    const answer = provider.answer("一中东摇中率", [
      { id: "male", documentId: "d1", sourceName: "摇号.table.cleaned.md", page: 1, section: "记录 5", text: "学校信息: 一中东 - 公办/民办: 公办 - 排位计划数: 男 300 - 通过审核报名人数: 1277 - 摇中率: 23.49% - 走读/住宿: 住宿", score: 2, matchedTerms: ["一中东", "摇中率"], snippet: "学校信息: 一中东 - 排位计划数: 男 300 - 通过审核报名人数: 1277 - 摇中率: 23.49%" },
      { id: "female", documentId: "d1", sourceName: "摇号.table.cleaned.md", page: 1, section: "记录 6", text: "学校信息: 一中东 - 公办/民办: 公办 - 排位计划数: 女 300 - 通过审核报名人数: 1084 - 摇中率: 27.68% - 走读/住宿: 住宿", score: 1.9, matchedTerms: ["一中东", "摇中率"], snippet: "学校信息: 一中东 - 排位计划数: 女 300 - 通过审核报名人数: 1084 - 摇中率: 27.68%" },
    ]);
    expect(answer.text).toContain("男生排位计划300人");
    expect(answer.text).toContain("女生排位计划300人");
    expect(answer.text).toContain("合计排位计划600人");
    expect(answer.text).toContain("审核报名2361人");
    expect(answer.text).toContain("综合摇中率25.41%");
    expect(answer.citations).toHaveLength(2);
  });

  it("answers only the stable subject and requested metric", () => {
    const answer = provider.answer("48中摇中率", [
      { id: "school-48", documentId: "d1", sourceName: "摇号.table.cleaned.md", page: 1, section: "记录 1", text: "学校信息: 48中 - 公办/民办: 公办 - 报名条件: 城区户籍或居住证 - 排位计划数: 230 - 通过审核报名人数: 4653 - 摇中率: 4.94% - 走读/住宿: 住宿", score: 2, matchedTerms: ["48中", "摇中率"], snippet: "学校信息: 48中 - 报名条件: 城区户籍或居住证 - 摇中率: 4.94%" },
    ]);
    expect(answer.text).toBe("48中摇中率为4.94%。");
    expect(answer.text).not.toContain("城区户籍或居住证");
    expect(answer.citations[0]?.sourceName).toBe("摇号.table.cleaned.md");
  });

  it("answers Chinese-number high-school schedule from the exact school record", () => {
    const answer = provider.answer("石家庄二中作息", [
      { id: "high", documentId: "d1", sourceName: "高中校情.table.cleaned.md", page: 1, section: "记录 1", text: "- 学校: 二中（本部） - 作息/晚自习: 学生早晨约5:40起床，晚自习持续到22:00之后。", score: 4, matchedTerms: ["二中", "作息"], snippet: "- 学校: 二中（本部） - 作息/晚自习: 学生早晨约5:40起床，晚自习持续到22:00之后。" },
      { id: "middle", documentId: "d2", sourceName: "石家庄初中信息汇总表.table.cleaned.md", page: 1, section: "记录 84", text: "- 学校：42中锦尚 - 作息/晚自习：晚上有晚自习。", score: 4.2, matchedTerms: ["作息"], snippet: "- 学校：42中锦尚 - 作息/晚自习：晚上有晚自习。" },
    ]);
    expect(answer.text).toContain("二中（本部）作息");
    expect(answer.text).toContain("5:40");
    expect(answer.citations[0]?.sourceName).toBe("高中校情.table.cleaned.md");
  });
});
