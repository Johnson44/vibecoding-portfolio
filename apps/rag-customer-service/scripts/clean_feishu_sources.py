from __future__ import annotations

import argparse
import math
import re
from pathlib import Path

import pandas as pd
from pypdf import PdfReader


def clean_text(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    text = str(value).replace("\u0000", "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def pdf_to_markdown(source: Path, target: Path) -> None:
    reader = PdfReader(str(source))
    pages: list[str] = [f"# {source.name}", "", "> 来源：指定飞书文件夹；本文件由 PDF 文本转换为 Markdown。", ""]
    for index, page in enumerate(reader.pages, start=1):
        text = clean_text(page.extract_text() or "")
        if not text:
            continue
        pages.extend([f"## 第 {index} 页", "", text, ""])
    target.write_text("\n".join(pages), encoding="utf-8")


def first_header_row(frame: pd.DataFrame) -> int:
    for index, row in frame.iterrows():
        if sum(bool(clean_text(value)) for value in row.tolist()) >= 2:
            return int(index)
    return 0


def xlsx_to_markdown(source: Path, target: Path) -> None:
    sheets = pd.read_excel(source, sheet_name=None, header=None, dtype=object, engine="openpyxl")
    output: list[str] = [f"# {source.name}", "", "> 来源：指定飞书文件夹；表格已清理空行空列，并按记录转换为可检索文本。", ""]
    for sheet_name, raw in sheets.items():
        frame = raw.dropna(axis=0, how="all").dropna(axis=1, how="all").reset_index(drop=True)
        if frame.empty:
            continue
        output.extend([f"## 工作表：{sheet_name}", ""])
        header_index = first_header_row(frame)
        headers = [clean_text(value) or f"列{index + 1}" for index, value in enumerate(frame.iloc[header_index].tolist())]
        seen: dict[str, int] = {}
        unique_headers: list[str] = []
        for header in headers:
            seen[header] = seen.get(header, 0) + 1
            unique_headers.append(header if seen[header] == 1 else f"{header}_{seen[header]}")
        for row_number, (_, row) in enumerate(frame.iloc[header_index + 1 :].iterrows(), start=1):
            fields = [
                f"{header}：{clean_text(value)}"
                for header, value in zip(unique_headers, row.tolist())
                if clean_text(value)
            ]
            if fields:
                output.extend([f"### 记录 {row_number}", "", *[f"- {field}" for field in fields], ""])
    target.write_text("\n".join(output), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    for source in sorted(args.input.iterdir()):
        if source.suffix.lower() == ".pdf":
            pdf_to_markdown(source, args.output / f"{source.stem}.pdf.cleaned.md")
        elif source.suffix.lower() in {".xlsx", ".xls", ".csv"}:
            if source.suffix.lower() == ".csv":
                frame = pd.read_csv(source, header=None, dtype=object)
                temporary = args.input / f"{source.stem}.xlsx"
                frame.to_excel(temporary, index=False, header=False)
                xlsx_to_markdown(temporary, args.output / f"{source.stem}.table.cleaned.md")
                temporary.unlink(missing_ok=True)
            else:
                xlsx_to_markdown(source, args.output / f"{source.stem}.table.cleaned.md")


if __name__ == "__main__":
    main()
