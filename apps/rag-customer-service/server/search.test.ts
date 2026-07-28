import { describe, expect, it } from "vitest";
import { searchChunks } from "./search.js";
import type { TextChunk } from "./types.js";

const chunks: TextChunk[] = [
  { id: "expense", documentId: "doc-1", sourceName: "员工手册.md", page: 1, section: "费用报销", text: "费用报销审批通过后，财务通常在五个工作日内完成付款。" },
  { id: "leave", documentId: "doc-1", sourceName: "员工手册.md", page: 2, section: "请假申请", text: "员工需要提交休假申请，经直属主管审批后生效。" },
];

const zoningChunks: TextChunk[] = [
  { id: "school-summary", documentId: "doc-2", sourceName: "石家庄初中信息汇总表.table.cleaned.md", page: 1, section: "记录 2", text: "学校：81中 基本情况：属于公办划片学校。" },
  { id: "zoning-map", documentId: "doc-3", sourceName: "长安区初中划片2026.md", page: 11, section: "原始 PDF 第 11 页", text: "石家庄市第八十一中学（育才校区）81中划片招生范围：华清北街至体育北大街，跃进路至石德铁路。" },
  { id: "zoning-map-44", documentId: "doc-4", sourceName: "裕华区初中划片2026.md", page: 8, section: "原始 PDF 第 8 页", text: "石家庄市第四十四中学招生范围：北始槐安路，南止南二环及东延长线，西始翟营南大街，东止裕华区区域东界。" },
];

const highSchoolChunks: TextChunk[] = [
  { id: "high-school-main", documentId: "doc-5", sourceName: "高中校情.table.cleaned.md", page: 1, section: "记录 1", text: "- 学校: 二中（本部） - 作息/晚自习: 学生早晨约5:40起床，晚自习持续到22:00之后。" },
  { id: "middle-school-42", documentId: "doc-6", sourceName: "石家庄初中信息汇总表.table.cleaned.md", page: 1, section: "记录 84", text: "- 学校：42中锦尚 - 作息/晚自习：晚上有晚自习。" },
];

describe("local lexical search", () => {
  it("ranks the matching business section first", () => {
    const result = searchChunks(["费用报销多久到账", "报销付款时间"], chunks, 3);
    expect(result[0]?.id).toBe("expense");
    expect(result[0]?.snippet).toContain("五个工作日");
  });

  it("returns no result when there is no shared term", () => {
    expect(searchChunks(["出差住宿标准"], chunks)).toHaveLength(0);
  });

  it("prefers a junior-school zoning map for zoning questions", () => {
    const result = searchChunks(["81中划片"], zoningChunks, 2);
    expect(result[0]?.id).toBe("zoning-map");
  });

  it("matches Arabic school numbers to Chinese school names", () => {
    const result = searchChunks(["44中划片"], zoningChunks, 2);
    expect(result[0]?.id).toBe("zoning-map-44");
  });

  it("prioritizes the exact Chinese school field for high-school questions", () => {
    const result = searchChunks(["石家庄二中作息"], highSchoolChunks, 2);
    expect(result[0]?.id).toBe("high-school-main");
  });
});
