import path from "node:path";
import pdfParse from "pdf-parse";
import * as mammoth from "mammoth";
import type { PageText, TextChunk } from "./types.js";

const MAX_CHUNK_LENGTH = 720;
const CHUNK_OVERLAP = 90;

export async function parseDocument(buffer: Buffer, fileName: string, mimeType: string): Promise<PageText[]> {
  const extension = path.extname(fileName).toLowerCase();
  if (mimeType === "application/pdf" || extension === ".pdf") {
    const parsed = await pdfParse(buffer);
    const pages = parsed.text.split(/\f/).map((text) => cleanText(text)).filter(Boolean);
    return (pages.length ? pages : [cleanText(parsed.text)]).map((text, index) => ({ page: index + 1, text }));
  }
  if (mimeType.includes("wordprocessingml") || extension === ".docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return [{ page: 1, text: cleanText(parsed.value) }];
  }
  if ([".md", ".markdown", ".txt"].includes(extension) || mimeType.startsWith("text/")) {
    const text = cleanText(buffer.toString("utf8"));
    return parseMarkdownPages(text) ?? [{ page: 1, text }];
  }
  throw new Error("暂不支持该文件类型，请上传 PDF、DOCX、Markdown 或 TXT。");
}

function parseMarkdownPages(text: string): PageText[] | null {
  const marker = /^##\s+原始\s+PDF\s+第\s*(\d+)\s*页\s*$/gim;
  const matches = [...text.matchAll(marker)];
  if (!matches.length) return null;
  const pages: PageText[] = [];
  matches.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const pageText = cleanText(text.slice(start, end));
    if (pageText) pages.push({ page: Number(match[1]), text: pageText });
  });
  return pages.length ? pages : null;
}

export function makeChunks(pages: PageText[], documentId: string, sourceName: string): TextChunk[] {
  const chunks: TextChunk[] = [];
  for (const page of pages) {
    const sections = splitSections(page.text);
    for (const section of sections) {
      const pieces = splitLongText(section.text);
      pieces.forEach((text, index) => {
        chunks.push({
          id: `${documentId}-${chunks.length + 1}`,
          documentId,
          sourceName,
          page: page.page,
          section: section.title,
          text,
        });
      });
    }
  }
  return chunks;
}

function splitSections(text: string): Array<{ title: string; text: string }> {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const sections: Array<{ title: string; text: string }> = [];
  let title = "正文";
  let buffer: string[] = [];
  const flush = () => {
    const value = cleanText(buffer.join(" "));
    if (value) sections.push({ title, text: value });
    buffer = [];
  };
  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s+(.+)$/) ?? line.match(/^【(.+)】$/);
    if (heading) {
      flush();
      title = heading[1].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections.length ? sections : [{ title: "正文", text: cleanText(text) }];
}

function splitLongText(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];
  const pieces: string[] = [];
  let start = 0;
  while (start < text.length) {
    const targetEnd = Math.min(start + MAX_CHUNK_LENGTH, text.length);
    const end = findSchoolBoundary(text, start, targetEnd);
    pieces.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }
  return pieces.filter(Boolean);
}

function findSchoolBoundary(text: string, start: number, targetEnd: number): number {
  const boundaryWindowEnd = Math.min(text.length, targetEnd + 160);
  const schoolPattern = /\d{1,3}中/g;
  schoolPattern.lastIndex = start;
  let boundary = targetEnd;
  let match = schoolPattern.exec(text);
  while (match && match.index < boundaryWindowEnd) {
    const candidate = match.index + match[0].length;
    if (candidate >= start + 180 && candidate <= boundaryWindowEnd) boundary = candidate;
    match = schoolPattern.exec(text);
  }
  return boundary;
}

export function cleanText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
