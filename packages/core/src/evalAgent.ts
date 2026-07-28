import type {
  AgentEvalCandidate,
  AgentEvalInput,
  AgentEvalReport,
  AgentEvalTask,
  EvalDimension,
  EvalIssue,
  EvalScore
} from "@portfolio/contracts";

const dimensionLabels: Record<EvalDimension, string> = {
  "task-completion": "任务完成度",
  accuracy: "回答质量",
  stability: "稳定性",
  experience: "功能体验",
  "paid-value": "付费价值"
};

const allDimensions: EvalDimension[] = ["task-completion", "accuracy", "stability", "experience", "paid-value"];

function baseRubric(): AgentEvalTask["rubric"] {
  return allDimensions.map((dimension) => ({
    dimension,
    description: dimensionLabels[dimension]
  }));
}

export const agentEvalTasks: AgentEvalTask[] = [
  {
    id: "news-brief",
    title: "台风“巴威”预警摘要",
    category: "information",
    scenario: "凤凰网编辑收到一段关于台风“巴威”登陆地点的网传消息，需要整理成80字以内的编辑摘要，并明确哪些内容还没有官方来源。",
    expectedSignals: ["预警时间与地区", "官方来源", "待核验边界"],
    rubric: baseRubric()
  },
  {
    id: "trip-plan",
    title: "青岛周末两日行",
    category: "planning",
    scenario: "用户从北京出发，计划周末去青岛两天一夜，预算1500元，希望覆盖海边、城市地标和一顿本地海鲜。",
    expectedSignals: ["青岛两天一夜", "预算拆分", "雨天备选"],
    rubric: baseRubric()
  },
  {
    id: "content-rewrite",
    title: "小红书手机测评改写",
    category: "content",
    scenario: "运营人员要把一段 iPhone 与 OPPO Find 系列的参数测评改成小红书6页图文，面向第一次购买旗舰机的用户。",
    expectedSignals: ["小红书平台", "参数事实", "行动引导"],
    rubric: baseRubric()
  },
  {
    id: "image-prompt",
    title: "烟雨江南女子撑伞图",
    category: "image-generation",
    scenario: "视觉内容团队需要一条可直接交给图像模型的生成指令：画面是烟雨江南中的女子撑伞，需要明确主体、环境、风格与构图，避免只写成模糊的审美形容词。",
    expectedSignals: ["烟雨江南", "女子撑伞", "水乡建筑", "构图与光影"],
    rubric: baseRubric()
  }
];

function hasAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function scoreAnswer(task: AgentEvalTask, answer: string) {
  const text = answer.trim();
  const matched = task.expectedSignals.filter((signal) => text.includes(signal)).length;
  const coverage = matched / Math.max(task.expectedSignals.length, 1);
  const structured = /\n|：|:|第一|第二|步骤|清单|1\./.test(text);
  const uncertainty = hasAny(text, ["待核验", "无法确认", "需要来源", "人工复核", "不确定"]);
  const actionable = hasAny(text, ["建议", "下一步", "可以", "行动", "联系", "检查", "生成", "画面", "图片", "图像"]);
  const scores: EvalScore[] = [
    { dimension: "task-completion", label: dimensionLabels["task-completion"], score: Math.round(coverage * 100), reason: `覆盖${matched}/${task.expectedSignals.length}个任务信号` },
    { dimension: "accuracy", label: dimensionLabels.accuracy, score: Math.min(100, Math.round(coverage * 72 + (uncertainty ? 18 : 0))), reason: uncertainty ? "对不确定信息保留了证据边界" : "未明确说明不确定信息的处理方式" },
    { dimension: "stability", label: dimensionLabels.stability, score: text.length > 0 && text.length <= 800 ? 86 : text.length ? 62 : 0, reason: text.length <= 800 ? "输出长度处于演示任务可控范围" : "输出过长，增加复核成本" },
    { dimension: "experience", label: dimensionLabels.experience, score: Math.min(100, (structured ? 76 : 58) + (actionable ? 10 : 0)), reason: structured ? "信息分层清楚" : "缺少清晰的结构化表达" },
    { dimension: "paid-value", label: dimensionLabels["paid-value"], score: Math.min(100, Math.round(coverage * 62 + (actionable ? 24 : 0))), reason: actionable ? "给出下一步动作，具有交付价值" : "缺少可执行的下一步动作" }
  ];
  const issues: EvalIssue[] = [];
  if (!text) {
    issues.push({ type: "off-topic", label: "没有有效回答", severity: "high", evidence: "候选输出为空", recommendation: "在生成前校验输入，并在失败时返回可解释的人工承接提示。" });
  }
  if (matched < task.expectedSignals.length) {
    issues.push({ type: "off-topic", label: "任务信号缺失", severity: matched === 0 ? "high" : "medium", evidence: `只覆盖${matched}/${task.expectedSignals.length}个预期信号`, recommendation: "在提示词中显式列出交付字段，并在发布前做字段完整性校验。" });
  }
  if (hasAny(text, ["一定", "百分百", "绝对", "已证实"]) && !uncertainty) {
    issues.push({ type: "hallucination", label: "确定性过强", severity: "high", evidence: "出现未经证据约束的绝对化表达", recommendation: "要求模型绑定来源；没有来源时输出待核验或无法判断。" });
  }
  if (task.category === "information" && !hasAny(text, ["来源", "链接", "证据", "核验"])) {
    issues.push({ type: "factual-error", label: "缺少证据引用", severity: "medium", evidence: "信息类任务没有来源或核验字段", recommendation: "将来源引用和不确定性列为信息类任务的必填输出。" });
  }
  if (hasAny(text, ["工具调用失败", "工具异常", "无法调用"])) {
    issues.push({ type: "tool-failure", label: "工具失败未充分承接", severity: "medium", evidence: "输出暴露了工具错误，但没有说明替代路径", recommendation: "把工具状态、替代方案和人工承接拆成固定字段。" });
  }
  if (text.length > 800 || (!structured && text.length > 180)) {
    issues.push({ type: "format-error", label: "输出结构不稳定", severity: "low", evidence: "输出过长或缺少可扫描结构", recommendation: "使用固定标题、列表和长度上限，降低人工评测成本。" });
  }
  return { scores, issues, totalScore: Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length) };
}

function prioritySort(issue: EvalIssue) {
  return { high: 0, medium: 1, low: 2 }[issue.severity];
}

export function runAgentEval(input: AgentEvalInput): AgentEvalReport {
  const a = scoreAnswer(input.task, input.candidateA);
  const b = scoreAnswer(input.task, input.candidateB);
  const candidates: [AgentEvalCandidate, AgentEvalCandidate] = [
    { label: "豆包免费版", answer: input.candidateA, ...a },
    { label: "豆包收费版", answer: input.candidateB, ...b }
  ];
  const difference = a.totalScore - b.totalScore;
  const winner = Math.abs(difference) < 3 ? "tie" : difference > 0 ? "free" : "paid";
  const priorityIssues = [...a.issues, ...b.issues]
    .sort((left, right) => prioritySort(left) - prioritySort(right))
    .filter((issue, index, list) => list.findIndex((item) => item.type === issue.type && item.evidence === issue.evidence) === index)
    .slice(0, 5);
  const summary = winner === "tie"
    ? "两份回答总分接近，建议结合真实用户访谈或更多任务样本继续评测。"
    : `${winner === "free" ? "豆包免费版" : "豆包收费版"}在当前任务量表中领先${Math.abs(difference)}分，但仍需关注${priorityIssues[0]?.label ?? "人工复核项"}。`;
  return {
    task: input.task,
    candidates,
    winner,
    summary,
    priorityIssues,
    evaluationMethod: [
      "固定同一用户任务，仅依据同一量表对比两个版本",
      "任务完成度和证据边界优先于语言流畅度",
      "高风险问题进入人工复核，不用单一总分替代产品判断"
    ],
    mode: "research"
  };
}
