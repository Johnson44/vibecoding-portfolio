import type { CompetitorSample } from "@portfolio/contracts";

export interface EducationCsvImportResult {
  sheetName: string;
  stage: "小升初" | "初升高";
  totalRows: number;
  samples: CompetitorSample[];
  warnings: string[];
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function firstUrl(value: string): string {
  return value.match(/https?:\/\/[^\s，。]+/i)?.[0]?.replace(/[)）】]+$/, "") ?? "";
}

function inferPlatform(url: string): CompetitorSample["platform"] {
  if (/bilibili|b23\.tv/i.test(url)) return "B站";
  if (/douyin/i.test(url)) return "抖音";
  if (/weixin\.qq\.com/i.test(url)) return "视频号";
  return "小红书";
}

function classifyRisks(title: string, body: string): string[] {
  const text = `${title}\n${body}`;
  const flags = new Set<string>();
  if (/排名|梯队|最好|前十|前10/.test(text)) flags.add("unverified-ranking");
  if (/录取率|分数线|收分|\d+%|\d+人/.test(text)) flags.add("statistics-need-source");
  if (/作为.*学生|我家孩子|亲身|真实经历/.test(text)) flags.add("personal-anecdote-do-not-impersonate");
  if (/保录|内部名额|百分百|必上/.test(text)) flags.add("prohibited-admission-claim");
  if (/202[0-5]年|去年|往年/.test(text)) flags.add("historical-information");
  return [...flags];
}

export function importEducationCompetitorCsv(text: string, fileName = "飞书竞品表.csv"): EducationCsvImportResult {
  const rows = parseCsv(text);
  const titleText = `${fileName} ${rows.slice(0, 2).flat().join(" ")}`;
  const stage: EducationCsvImportResult["stage"] = /初升高|高中|中考/.test(titleText) ? "初升高" : "小升初";
  const headerIndex = rows.findIndex((row) => row.some((cell) => cell.trim() === "序号") && row.some((cell) => /链接/.test(cell)));
  const startIndex = headerIndex >= 0 ? headerIndex + 1 : 2;
  const warnings: string[] = [];

  if (headerIndex < 0) warnings.push("未识别到标准表头，已按飞书导出结构从第3行开始读取。");

  const samples = rows.slice(startIndex).flatMap((row, rowIndex): CompetitorSample[] => {
    const linkCell = row[1]?.trim() ?? "";
    const topic = row[2]?.trim() ?? "";
    const body = row[3]?.trim() ?? "";
    const url = firstUrl(linkCell);
    const title = (topic || body.split(/\r?\n/).find(Boolean) || `竞品样本${rowIndex + 1}`).replace(/\s+/g, " ").slice(0, 80);
    if (!url && !topic && !body) return [];
    if (!url) warnings.push(`第${startIndex + rowIndex + 1}行缺少公开链接，未导入。`);
    if (!url) return [];

    return [{
      id: `csv-${stage === "小升初" ? "primary" : "middle"}-${rowIndex + 1}`,
      platform: inferPlatform(url),
      category: stage,
      title,
      body: body.slice(0, 1200),
      url,
      transcriptStatus: "not-required",
      riskFlags: classifyRisks(title, body)
    }];
  });

  return {
    sheetName: fileName.replace(/\.csv$/i, ""),
    stage,
    totalRows: Math.max(0, rows.length - startIndex),
    samples,
    warnings: [...new Set(warnings)].slice(0, 8)
  };
}
