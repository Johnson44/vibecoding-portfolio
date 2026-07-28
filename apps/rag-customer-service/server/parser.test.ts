import { describe, expect, it } from "vitest";
import { makeChunks, parseDocument } from "./parser.js";

describe("school-aware chunking", () => {
  it("prefers a boundary after numeric-plus-middle-school markers", () => {
    const text = `${"普通资料内容 ".repeat(80)} 43中 ${"学校资料 ".repeat(80)}`;
    const chunks = makeChunks([{ page: 1, text }], "doc-1", "学校表格.md");
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.some((chunk) => chunk.text.trimEnd().endsWith("43中"))).toBe(true);
  });
});

describe("markdown page preservation", () => {
  it("keeps original PDF page numbers in prepared markdown", async () => {
    const markdown = Buffer.from("# 新华区初中划片\n\n## 原始 PDF 第 9 页\n\n石家庄市第九中学\n\n## 原始 PDF 第 10 页\n\n石家庄市第五中学", "utf8");
    const pages = await parseDocument(markdown, "新华区初中划片2026.md", "text/markdown");
    expect(pages.map((page) => page.page)).toEqual([9, 10]);
    expect(pages[0]?.text).toContain("石家庄市第九中学");
  });
});
