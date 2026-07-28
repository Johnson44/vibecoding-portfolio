from __future__ import annotations

import argparse
import re
from pathlib import Path

from pypdf import PdfReader


JUNIOR_MARKER = re.compile(r"招生地图及咨询电话\s*[（(]初中[）)]")


def clean_page_text(value: str) -> str:
    text = value.replace("\x00", "").replace("\u00ad", "")
    text = re.sub(r"-\s*\n\s*-", "-", text)
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


def find_junior_pages(source: Path) -> list[tuple[int, str]]:
    reader = PdfReader(str(source))
    pages: list[tuple[int, str]] = []
    start_index: int | None = None
    extracted: list[str] = []
    for index, page in enumerate(reader.pages, start=1):
        text = clean_page_text(page.extract_text() or "")
        extracted.append(text)
        if start_index is None and JUNIOR_MARKER.search(text):
            start_index = index - 1
    if start_index is None:
        raise ValueError(f"未找到初中章节: {source.name}")
    for index, text in enumerate(extracted[start_index:], start=start_index + 1):
        if text:
            pages.append((index, text))
    return pages


def convert_pdf(source: Path, target: Path) -> int:
    pages = find_junior_pages(source)
    area = source.stem
    output = [
        f"# {area} 2026 年公办义务教育阶段学校招生信息（初中）",
        "",
        f"> 来源文件：{source.name}",
        "> 处理方式：PDF 转 Markdown；仅保留原文件中的“初中”部分。",
        "",
    ]
    for page, text in pages:
        output.extend([f"## 原始 PDF 第 {page} 页", "", text, ""])
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(output), encoding="utf-8")
    return len(pages)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    for source in sorted(args.input.glob("*.pdf")):
        target = args.output / f"{source.stem}初中划片2026.md"
        pages = convert_pdf(source, target)
        print(f"{source.name}: {pages} pages -> {target.name}")


if __name__ == "__main__":
    main()
