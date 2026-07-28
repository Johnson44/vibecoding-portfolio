from __future__ import annotations

import argparse
import math
import re
from pathlib import Path

import pandas as pd


def clean_text(value: object) -> str:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return ""
    return re.sub(r"\s+", " ", str(value).replace("\x00", "")).strip()


def first_header_row(frame: pd.DataFrame) -> int:
    for index, row in frame.iterrows():
        if sum(bool(clean_text(value)) for value in row.tolist()) >= 2:
            return int(index)
    return 0


def unique_headers(values: list[object]) -> list[str]:
    seen: dict[str, int] = {}
    headers: list[str] = []
    for index, value in enumerate(values, start=1):
        header = clean_text(value) or f"字段{index}"
        seen[header] = seen.get(header, 0) + 1
        headers.append(header if seen[header] == 1 else f"{header}_{seen[header]}")
    return headers


def is_repeated_header(row: pd.Series, headers: list[str]) -> bool:
    values = [clean_text(value) for value in row.tolist()]
    return values[: len(headers)] == headers and any(values)


def convert_csv(source: Path, target: Path) -> tuple[int, int]:
    raw = pd.read_csv(source, header=None, dtype=object, keep_default_na=False)
    raw = raw.dropna(axis=0, how="all").dropna(axis=1, how="all").reset_index(drop=True)
    if raw.empty:
        raise ValueError(f"表格为空: {source.name}")

    header_index = first_header_row(raw)
    header_values = raw.iloc[header_index].tolist()
    non_empty_header_indexes = [index for index, value in enumerate(header_values) if clean_text(value)]
    last_header_index = max(non_empty_header_indexes, default=0)
    raw = raw.iloc[:, : last_header_index + 1]
    headers = unique_headers(raw.iloc[header_index].tolist())
    keep_indexes: list[int] = []
    seen_base_headers: set[str] = set()
    for index, header in enumerate(headers):
        if "此列可删" in header:
            continue
        base_header = re.sub(r"_\d+$", "", header)
        if base_header in seen_base_headers:
            continue
        keep_indexes.append(index)
        seen_base_headers.add(base_header)
    raw = raw.iloc[:, keep_indexes]
    headers = [headers[index] for index in keep_indexes]
    data = raw.iloc[header_index + 1 :].copy()
    data = data.replace(r"^\s*$", pd.NA, regex=True)
    data = data.dropna(axis=0, how="all").dropna(axis=1, how="all")
    data = data.ffill().drop_duplicates().reset_index(drop=True)
    data = data[~data.apply(lambda row: is_repeated_header(row, headers), axis=1)]

    output = [
        f"# {source.stem.replace(' - Sheet1', '')}",
        "",
        "## Sheet1",
        "",
    ]
    record_count = 0
    for record_number, (_, row) in enumerate(data.iterrows(), start=1):
        fields = [
            f"- {header}: {clean_text(value)}"
            for header, value in zip(headers, row.tolist())
            if clean_text(value)
        ]
        if not fields:
            continue
        record_count += 1
        output.extend([f"### 记录 {record_number}", "", *fields, ""])
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(output), encoding="utf-8")
    return record_count, len(headers)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    for source in sorted(args.input.glob("*.csv")):
        target_name = source.name.replace(" - Sheet1.csv", ".table.cleaned.md").replace(".csv", ".table.cleaned.md")
        target = args.output / target_name
        records, fields = convert_csv(source, target)
        print(f"{source.name}: {records} records, {fields} fields -> {target.name}")


if __name__ == "__main__":
    main()
