import { useMemo, useState } from "react";
import type { CompetitorSample, EducationAgentInput, EducationAgentOutput, EducationContentPlan, EsportsAgentInput, ViralAgentInput, ViralAgentOutput, ViralProcessStep } from "@portfolio/contracts";
import {
  educationCompetitorSamples,
  educationAcceptanceCases,
  educationPolicySources,
  educationSampleAnnotations,
  esportsCompetitorVideos,
  importEducationCompetitorCsv,
  researchMeta,
  runEducationAgent,
  runEsportsAgent,
  runViralAgent,
  safeServicePackages
} from "@portfolio/core";
import { callAigcFunction, getCloudbaseConfig } from "./cloudbase";

type Route = "education-agent" | "esports-agent" | "viral-agent";

function formatRequestError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== "{}") return serialized;
  } catch {
    // Fall through to String for non-serializable SDK errors.
  }
  return String(error);
}

function currentRoute(): Route {
  if (window.location.pathname.includes("viral")) return "viral-agent";
  return window.location.pathname.includes("esports") ? "esports-agent" : "education-agent";
}

function App() {
  const [route, setRoute] = useState<Route>(currentRoute);
  const cloudConfig = useMemo(() => getCloudbaseConfig(), []);
  const navigate = (next: Route) => {
    window.history.pushState({}, "", `/${next}`);
    setRoute(next);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">ZS</div>
        <div>
          <p className="eyebrow">AIGC PORTFOLIO</p>
          <h1>内容运营<br />Agent 工作台</h1>
        </div>
        <nav aria-label="项目导航">
          <button className={route === "education-agent" ? "active" : ""} onClick={() => navigate("education-agent")}>
            <span>01</span> 石家庄升学
          </button>
          <button className={route === "esports-agent" ? "active" : ""} onClick={() => navigate("esports-agent")}>
            <span>02</span> B站电竞视频
          </button>
          <button className={route === "viral-agent" ? "active" : ""} onClick={() => navigate("viral-agent")}>
            <span>03</span> 爆款拆解
          </button>
        </nav>
        <div className="status-card">
          <span className="status-dot" /> {cloudConfig.enabled ? "CloudBase体验模式" : "研究数据模式"}
          <small>{cloudConfig.enabled ? "升学与爆款 Agent 优先使用云端严格JSON，失败自动回退" : "真实公开材料已接入；模型调用使用本地确定性输出"}</small>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">张舜｜AI产品运营与AIGC应用作品集</p>
            <h2>{route === "education-agent" ? "升学图文与留资 Agent" : route === "esports-agent" ? "电竞视频与下单 Agent" : "爆款内容拆解 Agent"}</h2>
          </div>
          <span className={`mode-pill ${cloudConfig.enabled ? "cloud" : "research"}`}>{cloudConfig.enabled ? "CLOUD MODE" : "RESEARCH MODE"}</span>
        </header>
        {route === "education-agent" ? <EducationPage /> : route === "esports-agent" ? <EsportsPage /> : <ViralPage />}
      </main>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="field-label">{children}</label>;
}

function StatStrip({ items }: { items: Array<{ value: string | number; label: string }> }) {
  return <div className="stat-strip">{items.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>;
}

function planAsText(plan: EducationContentPlan) {
  return [
    `# ${plan.title}`,
    `封面：${plan.cover.primary}｜${plan.cover.secondary}`,
    "",
    ...plan.cards.flatMap((card) => [`## 第${card.page}页 ${card.headline}`, card.body, `排版：${card.layoutHint}`, ""]),
    "## 笔记正文",
    plan.postBody,
    "",
    `标签：${plan.tags.map((tag) => `#${tag}`).join(" ")}`,
    `CTA：${plan.cta}`,
    "",
    "## 评论互动",
    ...plan.comments.map((comment) => `- ${comment}`),
    "",
    "## 私信话术",
    ...plan.privateMessages.map((message) => `- ${message}`),
    "",
    "## 来源",
    ...plan.sources.map((source) => `- ${source.title}｜${source.publisher}｜${source.publishedAt}｜${source.url ?? "无链接"}`)
  ].join("\n");
}

function isEducationAgentOutput(value: unknown): value is EducationAgentOutput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<EducationAgentOutput>;
  return Array.isArray(candidate.cards)
    && candidate.cards.length >= 2
    && candidate.cards.length <= 5
    && Array.isArray(candidate.plans)
    && candidate.plans.length === 3
    && candidate.plans.every((plan) => Boolean(plan)
      && Array.isArray(plan.cards)
      && plan.cards.length >= 2
      && plan.cards.length <= 5
      && Array.isArray(plan.sources)
      && plan.sources.every((source) => Boolean(source?.url)));
}

function isViralAgentOutput(value: unknown): value is ViralAgentOutput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ViralAgentOutput>;
  const source = candidate.source;
  const hook = candidate.hook;
  const rewritePlan = candidate.rewritePlan;
  if (!source || !hook || !rewritePlan) return false;
  return Array.isArray(candidate.process)
    && candidate.process.length === 5
    && candidate.process.every((step) => Boolean(step)
      && ["completed", "needs-input"].includes(step.status)
      && Array.isArray(step.evidence))
    && Array.isArray(candidate.structure)
    && candidate.structure.length === 4
    && candidate.structure.every((row) => Boolean(row)
      && typeof row.stage === "string"
      && typeof row.observation === "string"
      && typeof row.takeaway === "string")
    && typeof hook.type === "string"
    && typeof hook.pattern === "string"
    && Array.isArray(rewritePlan.titles)
    && rewritePlan.titles.length > 0
    && Array.isArray(rewritePlan.outline)
    && rewritePlan.outline.length > 0
    && Array.isArray(rewritePlan.originalityRules)
    && rewritePlan.originalityRules.length > 0
    && Array.isArray(candidate.riskFlags)
    && Array.isArray(candidate.nextActions)
    && source.metricsStatus === "not-provided";
}

function EducationPage() {
  const [input, setInput] = useState<EducationAgentInput>({
    stage: "小升初",
    district: "长安区",
    parentProfile: "第一次准备升学、时间紧张、担心漏材料",
    goal: "留资",
    accountTone: "可靠、克制、清晰",
    forbiddenExpressions: ["保录", "内部名额", "百分百"],
    topic: "房户一致分析",
    hook: "白皮书"
  });
  const [samples, setSamples] = useState<CompetitorSample[]>(educationCompetitorSamples);
  const [importNote, setImportNote] = useState("已内置两张飞书表整理出的20条公开样本；原始CSV不会进入公开构建。 ");
  const [submitted, setSubmitted] = useState(input);
  const submittedInput = useMemo(() => ({
    ...submitted,
    competitorSamples: samples,
    policySources: educationPolicySources
  }), [samples, submitted]);
  const localOutput = useMemo(() => runEducationAgent(submittedInput), [submittedInput]);
  const [planIndex, setPlanIndex] = useState(0);
  const [actionNote, setActionNote] = useState("");
  const cloudConfig = useMemo(() => getCloudbaseConfig(), []);
  const [cloudOutput, setCloudOutput] = useState<EducationAgentOutput | null>(null);
  const [apiState, setApiState] = useState<"local" | "loading" | "cloud" | "fallback">("local");
  const output = cloudOutput ?? localOutput;
  const plan = output.plans[planIndex] ?? output.plans[0];
  const annotatedSamples = educationSampleAnnotations
    .filter((annotation) => educationCompetitorSamples.find((sample) => sample.id === annotation.sampleId)?.category === submitted.stage)
    .map((annotation) => ({
      ...annotation,
      title: educationCompetitorSamples.find((sample) => sample.id === annotation.sampleId)?.title ?? annotation.sampleId
    }));

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(input);
    setPlanIndex(0);
    setActionNote("");
    setCloudOutput(null);
    if (!cloudConfig.enabled) {
      setApiState("local");
      return;
    }
    setApiState("loading");
    try {
      const response = await callAigcFunction<EducationAgentOutput>("educationAgent", {
        ...input,
        competitorSamples: samples,
        policySources: educationPolicySources
      });
      if (!isEducationAgentOutput(response.data)) throw new Error("云端方案未通过2–5页与来源字段校验");
      setCloudOutput(response.data);
      setApiState("cloud");
    } catch (error) {
      setApiState("fallback");
      setActionNote(`CloudBase调用失败，已回退研究模式：${formatRequestError(error)}`);
    }
  };

  const handleCsv = async (file?: File) => {
    if (!file) return;
    try {
      const result = importEducationCompetitorCsv(await file.text(), file.name);
      setSamples((current) => [...current.filter((sample) => sample.category !== result.stage), ...result.samples]);
      setInput((current) => ({ ...current, stage: result.stage }));
      setSubmitted((current) => ({ ...current, stage: result.stage }));
      setImportNote(`${result.sheetName}：识别${result.totalRows}行，安全导入${result.samples.length}条公开样本。${result.warnings[0] ?? "内部分析列已排除。"}`);
    } catch (error) {
      setImportNote(`导入失败：${error instanceof Error ? error.message : "请检查CSV编码和表头"}`);
    }
  };

  const copyPost = async () => {
    try {
      await navigator.clipboard.writeText(planAsText(plan));
      setActionNote("完整方案已复制");
    } catch {
      setActionNote("浏览器未授权剪贴板，请使用导出方案");
    }
  };

  const exportPlan = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${plan.topic}-${plan.hook}-方案.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setActionNote("方案JSON已导出");
  };

  return (
    <section className="workspace-grid">
      <form className="panel form-panel" onSubmit={(event) => void handleGenerate(event)}>
        <div className="panel-heading"><span>输入配置</span><small>INPUT</small></div>
        <div className="two-columns">
          <FieldLabel>学段<select value={input.stage} onChange={(event) => setInput({ ...input, stage: event.target.value as EducationAgentInput["stage"] })}><option>小升初</option><option>初升高</option></select></FieldLabel>
          <FieldLabel>内容目标<select value={input.goal} onChange={(event) => setInput({ ...input, goal: event.target.value as EducationAgentInput["goal"] })}><option>留资</option><option>互动</option><option>涨粉</option></select></FieldLabel>
        </div>
        <div className="two-columns">
          <FieldLabel>选题<select value={input.topic} onChange={(event) => setInput({ ...input, topic: event.target.value as EducationAgentInput["topic"] })}><option>房户一致分析</option><option>入学材料准备</option><option>重大事件时间轴</option><option>学校排名</option><option>摇号解析</option><option>报名教程</option></select></FieldLabel>
          <FieldLabel>资源钩子<select value={input.hook} onChange={(event) => setInput({ ...input, hook: event.target.value as EducationAgentInput["hook"] })}><option>白皮书</option><option>校情表</option><option>入学测真题</option></select></FieldLabel>
        </div>
        <FieldLabel>区县<input value={input.district} onChange={(event) => setInput({ ...input, district: event.target.value })} /></FieldLabel>
        <FieldLabel>家长画像<textarea rows={3} value={input.parentProfile} onChange={(event) => setInput({ ...input, parentProfile: event.target.value })} /></FieldLabel>
        <FieldLabel>账号语气<input value={input.accountTone} onChange={(event) => setInput({ ...input, accountTone: event.target.value })} /></FieldLabel>
        <FieldLabel>禁止表达<input value={input.forbiddenExpressions.join("、")} onChange={(event) => setInput({ ...input, forbiddenExpressions: event.target.value.split(/[、，,]/).filter(Boolean) })} /></FieldLabel>
        <label className="upload-control">
          <b>导入飞书竞品 CSV</b>
          <span>支持“序号 / 链接 / 选题 / 文案”结构和多行单元格</span>
          <input type="file" accept=".csv,text/csv" onChange={(event) => void handleCsv(event.target.files?.[0])} />
        </label>
        <p className="import-note">{importNote}</p>
        <button className="primary-button" type="submit" disabled={apiState === "loading"}>{apiState === "loading" ? "CloudBase生成中…" : "生成图文方案"} <span>→</span></button>
        <p className="form-note">{cloudConfig.enabled ? (apiState === "cloud" ? "已使用 CloudBase 云函数；模型输出仍需人工复核。" : apiState === "fallback" ? "CloudBase暂不可用，当前显示本地研究模式结果。" : "已配置 CloudBase 云函数，提交后将优先调用云端。") : "当前为本地研究模式；配置VITE_API_MODE=cloud与环境ID后可调用CloudBase。"}</p>
      </form>

      <div className="results-stack">
        <StatStrip items={[
          { value: `${researchMeta.education.rawRows.primary + researchMeta.education.rawRows.middle}行`, label: "飞书原始研究" },
          { value: output.materialStats.competitorCount, label: `${submitted.stage}当前样本` },
          { value: output.materialStats.policyCount, label: "官方政策来源" },
          { value: output.materialStats.verifiedPolicyCount, label: "已核验发布页" }
        ]} />
        <article className="panel">
          <div className="panel-heading"><span>选题覆盖</span><small>TOPIC MAP</small></div>
          <div className="topic-coverage">{output.topicIdeas.map((item) => <button type="button" className={submitted.topic === item.topic ? "active" : ""} key={item.topic} onClick={() => { setInput({ ...input, topic: item.topic }); setSubmitted({ ...submitted, topic: item.topic }); setCloudOutput(null); setApiState("local"); setPlanIndex(0); }}><b>{item.topic}</b><span>{item.recommendedPages}页</span><small>{item.angle}</small></button>)}</div>
        </article>
        <article className="panel research-panel">
          <div className="panel-heading"><span>样本结构标签与验收</span><small>RESEARCH QA</small></div>
          <p className="research-summary">当前{submitted.stage}：{annotatedSamples.length}条样本已完成逐条标注；3套完整图文结果已登记为发布前验收基线。</p>
          <div className="annotation-grid">{annotatedSamples.map((sample) => <div className="annotation-row" key={sample.sampleId}><b>{sample.title}</b><span>{sample.hookPattern} · {sample.evidenceLevel}级证据</span><small>{sample.structureTags.join(" / ")}｜CTA：{sample.ctaPattern}</small></div>)}</div>
          <div className="acceptance-grid">{educationAcceptanceCases.map((item) => <div className="acceptance-card" key={item.id}><b>{item.title}</b><span>{item.topic} · {item.hook} · {item.pageCount}页</span><small>已通过：{item.passedChecks.slice(0, 2).join("、")}</small><em>待复核：{item.openChecks.join("；")}</em></div>)}</div>
        </article>
        <article className="panel plan-switcher">
          <div className="panel-heading"><span>3套完整方案</span><small>VARIANTS</small></div>
          <div className="script-tabs">{output.plans.map((item, index) => <button type="button" className={index === planIndex ? "active" : ""} onClick={() => setPlanIndex(index)} key={item.id}>方案{index + 1} · {item.hook}</button>)}</div>
        </article>
        <article className="panel hero-result">
          <div className="result-meta"><span>标题 · {plan.title.length}/20字</span><span className="success">{plan.cards.length}页短图文 · 来源已绑定</span></div>
          <h3>{plan.title}</h3>
          <p>{plan.insight}</p>
          <div className="cover-preview"><small>{plan.hook}封面预览</small><strong>{plan.cover.primary}</strong><span>{plan.cover.secondary}</span></div>
        </article>
        <article className="panel">
          <div className="panel-heading"><span>{plan.cards.length}页图文页序</span><small>CAROUSEL</small></div>
          <div className="card-sequence">
            {plan.cards.map((card) => <div className="content-card" key={card.page}><span>0{card.page}</span><h4>{card.headline}</h4><p>{card.body}</p><small>{card.layoutHint}</small></div>)}
          </div>
        </article>
        <div className="split-results">
          <article className="panel"><div className="panel-heading"><span>正文与CTA</span><small>POST</small></div><p className="preserve-lines">{plan.postBody}</p><div className="tag-row">{plan.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><blockquote>{plan.cta}</blockquote><div className="action-row"><button type="button" onClick={() => void copyPost()}>复制完整方案</button><button type="button" onClick={exportPlan}>导出JSON</button><small>{actionNote}</small></div></article>
          <article className="panel source-panel"><div className="panel-heading"><span>政策来源</span><small>VERIFY</small></div>{plan.sources.map((source) => <a className="source-row" href={source.url} target="_blank" rel="noreferrer" key={source.title}><span className={source.verified ? "verified-dot" : "warning-dot"} /><div><b>{source.title}</b><small>{source.publisher} · {source.publishedAt}</small></div></a>)}</article>
        </div>
        <div className="split-results">
          <article className="panel"><div className="panel-heading"><span>评论与私信</span><small>ENGAGEMENT</small></div><div className="message-section"><b>评论互动</b>{plan.comments.map((item) => <p key={item}>{item}</p>)}<b>私信话术</b>{plan.privateMessages.map((item) => <p key={item}>{item}</p>)}</div></article>
          <article className="panel"><div className="panel-heading"><span>A/B/C线索方向</span><small>LEADS</small></div><div className="lead-list">{plan.leadRules.map((rule) => <div key={rule.level}><strong>{rule.level}</strong><p>{rule.signal}</p><small>{rule.reply}</small></div>)}</div></article>
        </div>
        <article className="panel"><div className="panel-heading"><span>初稿与人工修订对比</span><small>EVALUATION</small></div><div className="revision-grid">{output.revisionNotes.map((item) => <div key={item.draft}><span>初稿：{item.draft}</span><b>修订：{item.revision}</b><small>{item.reason}</small></div>)}</div></article>
        <article className="panel"><div className="panel-heading"><span>失败案例记录</span><small>FAILURE CASES</small></div><div className="failure-grid">{output.failureCases.map((item) => <div key={item.input}><b>输入：{item.input}</b><span>拦截：{item.blockedOutput}</span><small>安全替代：{item.fallback}</small></div>)}</div></article>
        <article className="panel risk-panel"><div className="panel-heading"><span>发布前风控</span><small>GUARDRAILS</small></div><div className="risk-grid">{plan.manualChecks.map((item) => <span key={item}>{item}</span>)}</div></article>
      </div>
    </section>
  );
}

function EsportsPage() {
  const [input, setInput] = useState<EsportsAgentInput>({ game: "CS2", persona: "冷静指挥型队友", audience: "想改善组队体验的新手玩家", goal: "下单", subtitleText: "" });
  const [submitted, setSubmitted] = useState(input);
  const output = useMemo(() => runEsportsAgent({
    ...submitted,
    competitorVideos: esportsCompetitorVideos,
    servicePackages: safeServicePackages
  }), [submitted]);
  const [scriptIndex, setScriptIndex] = useState(0);
  const script = output.scripts[scriptIndex];
  const relevantServices = safeServicePackages.filter((service) => service.game === input.game);

  return (
    <section className="workspace-grid">
      <form className="panel form-panel" onSubmit={(event) => { event.preventDefault(); setSubmitted(input); }}>
        <div className="panel-heading"><span>视频任务</span><small>BRIEF</small></div>
        <FieldLabel>游戏<select value={input.game} onChange={(event) => setInput({ ...input, game: event.target.value as EsportsAgentInput["game"] })}><option>CS2</option><option>三角洲行动</option></select></FieldLabel>
        <FieldLabel>账号人设<input value={input.persona} onChange={(event) => setInput({ ...input, persona: event.target.value })} /></FieldLabel>
        <FieldLabel>目标用户<textarea rows={2} value={input.audience} onChange={(event) => setInput({ ...input, audience: event.target.value })} /></FieldLabel>
        <FieldLabel>运营目标<select value={input.goal} onChange={(event) => setInput({ ...input, goal: event.target.value as EsportsAgentInput["goal"] })}><option>下单</option><option>咨询</option><option>复购</option></select></FieldLabel>
        <FieldLabel>可选：粘贴已获授权的字幕文本<textarea rows={5} placeholder="B站抽检视频没有机器可读字幕轨；如手工取得字幕，可粘贴到这里。" value={input.subtitleText} onChange={(event) => setInput({ ...input, subtitleText: event.target.value })} /></FieldLabel>
        <div className="material-box"><b>{researchMeta.esports.accountName}</b><span>{esportsCompetitorVideos.length}条公开视频元数据已载入</span><small>{researchMeta.esports.captionNote}</small></div>
        <button className="primary-button esports" type="submit">生成视频方案 <span>→</span></button>
        <p className="form-note">禁止外挂、代练、代打、账号交易、DMA和虚假结果承诺；相关需求直接转人工拒绝。</p>
      </form>
      <div className="results-stack">
        <StatStrip items={[
          { value: output.materialStats.competitorCount, label: "B站公开视频" },
          { value: output.materialStats.captionTrackCount, label: "可读字幕文本" },
          { value: output.materialStats.safePackageCount, label: `${submitted.game}合规服务项` },
          { value: "60–180s", label: "脚本验收时长" }
        ]} />
        <article className="panel evidence-panel">
          <div className="panel-heading"><span>材料状态</span><small>EVIDENCE</small></div>
          {output.sourceInsights.map((insight) => <p key={insight}>{insight}</p>)}
          <a href={researchMeta.esports.accountUrl} target="_blank" rel="noreferrer">查看星火电竞公开空间 ↗</a>
        </article>
        <article className="panel">
          <div className="panel-heading"><span>10个视频选题</span><small>TOPICS</small></div>
          <div className="topic-grid">{output.topics.map((topic, index) => <div key={topic}><span>{String(index + 1).padStart(2, "0")}</span>{topic}</div>)}</div>
        </article>
        <article className="panel">
          <div className="script-tabs">{output.scripts.map((item, index) => <button type="button" className={index === scriptIndex ? "active" : ""} onClick={() => setScriptIndex(index)} key={item.title}>脚本 {index + 1}</button>)}</div>
          <div className="script-title"><div><small>{script.duration}秒 · 开头钩子</small><h3>{script.title}</h3><p>{script.hook}</p></div><span className="mode-pill">可拍摄</span></div>
          <div className="shot-table">
            {script.shots.map((shot) => <div className="shot-row" key={shot.time}><b>{shot.time}</b><div><small>旁白</small>{shot.narration}</div><div><small>画面 / 字幕</small>{shot.visual}<em>{shot.subtitle}</em></div><span>{shot.transition}</span></div>)}
          </div>
        </article>
        <div className="split-results">
          <article className="panel"><div className="panel-heading"><span>合规服务目录</span><small>ORDER</small></div>{relevantServices.map((service) => <div className="service-row" key={service.id}><b>{service.name}</b><span>{service.priceLabel}</span><small>{service.description}</small></div>)}<blockquote>{output.quoteTemplate}</blockquote></article>
          <article className="panel"><div className="panel-heading"><span>接单SOP</span><small>HANDOFF</small></div><ol>{output.operationSop.map((step) => <li key={step}>{step}</li>)}</ol></article>
        </div>
        <article className="panel risk-panel"><div className="panel-heading"><span>合规拦截</span><small>GUARDRAILS</small></div><div className="risk-grid">{output.complianceWarnings.map((item) => <span key={item}>{item}</span>)}</div></article>
      </div>
    </section>
  );
}

function ViralPage() {
  const [input, setInput] = useState<ViralAgentInput>({
    platform: "小红书",
    title: "演示样本｜别急着照搬爆款，先看这3个结构",
    contentUrl: "",
    content: "演示文本：很多人看到高互动内容，第一反应是改标题。更应该先看它怎么提出问题、怎么给证据、怎么让读者行动。拆解只是为了找到可复用的方法，最终要重新组织成自己的内容。",
    goal: "拆解"
  });
  const [submitted, setSubmitted] = useState(input);
  const [activeStep, setActiveStep] = useState<ViralProcessStep["id"]>("capture");
  const localOutput = useMemo(() => runViralAgent(submitted), [submitted]);
  const cloudConfig = useMemo(() => getCloudbaseConfig(), []);
  const [cloudOutput, setCloudOutput] = useState<ViralAgentOutput | null>(null);
  const [apiState, setApiState] = useState<"local" | "loading" | "cloud" | "fallback">("local");
  const [actionNote, setActionNote] = useState("");
  const output = cloudOutput ?? localOutput;
  const activeProcess = output.process.find((step) => step.id === activeStep) ?? output.process[0];

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(input);
    setActiveStep("capture");
    setCloudOutput(null);
    setActionNote("");
    if (!cloudConfig.enabled) {
      setApiState("local");
      return;
    }
    setApiState("loading");
    try {
      const response = await callAigcFunction<ViralAgentOutput>("viralAgent", input);
      if (!isViralAgentOutput(response.data)) throw new Error("云端拆解结果未通过证据范围与结构字段校验");
      setCloudOutput(response.data);
      setApiState("cloud");
    } catch (error) {
      setApiState("fallback");
      setActionNote(`CloudBase调用失败，已回退研究模式：${formatRequestError(error)}`);
    }
  };

  return (
    <section className="workspace-grid viral-workspace">
      <form className="panel form-panel viral-form" onSubmit={submit}>
        <div className="panel-heading"><span>素材输入</span><small>SOURCE INPUT</small></div>
        <FieldLabel>平台<select value={input.platform} onChange={(event) => setInput({ ...input, platform: event.target.value as ViralAgentInput["platform"] })}><option>小红书</option><option>抖音</option><option>视频号</option><option>B站</option><option>公众号</option></select></FieldLabel>
        <FieldLabel>分析目标<select value={input.goal} onChange={(event) => setInput({ ...input, goal: event.target.value as ViralAgentInput["goal"] })}><option>拆解</option><option>仿写</option><option>复盘</option></select></FieldLabel>
        <FieldLabel>标题<input value={input.title} onChange={(event) => setInput({ ...input, title: event.target.value })} placeholder="粘贴素材标题" /></FieldLabel>
        <FieldLabel>公开链接 / 来源记录<input value={input.contentUrl} onChange={(event) => setInput({ ...input, contentUrl: event.target.value })} placeholder="可选；只记录，不自动抓取受限内容" /></FieldLabel>
        <FieldLabel>正文 / 已获授权字幕<textarea rows={10} value={input.content} onChange={(event) => setInput({ ...input, content: event.target.value })} placeholder="粘贴公开或已获授权的正文、字幕或逐段笔记" /></FieldLabel>
        <button className="primary-button" type="submit" disabled={apiState === "loading"}>{apiState === "loading" ? "CloudBase拆解中…" : "开始拆解"} <span>→</span></button>
        <p className="form-note">{cloudConfig.enabled ? (apiState === "cloud" ? "已使用 CloudBase 云函数；输出仍需人工复核。" : apiState === "fallback" ? actionNote : "已配置 CloudBase 云函数，提交后将优先调用云端。") : "只处理公开或已获授权素材；没有互动指标时，不判断“是否爆款”。配置VITE_API_MODE=cloud与环境ID后可调用CloudBase。"}</p>
      </form>

      <div className="results-stack">
        <div className="stat-strip viral-stats">
          <div><strong>{output.source.contentLength}</strong><span>已读文本字数</span></div>
          <div><strong>{output.source.evidenceStatus === "text-provided" ? "正文" : "标题"}</strong><span>证据范围</span></div>
          <div><strong>{output.source.metricsStatus === "provided" ? "已提供" : "待补充"}</strong><span>互动指标</span></div>
          <div><strong>{output.process.filter((step) => step.status === "completed").length}/5</strong><span>流程已完成</span></div>
        </div>

        <article className="panel viral-flow-panel">
          <div className="panel-heading"><span>扒爆款流程</span><small>VISIBLE WORKFLOW</small></div>
          <p className="viral-flow-caption">每一步都显示当前证据和缺口，点击节点查看拆解依据。</p>
          <div className="viral-flow" role="list" aria-label="爆款拆解五步流程">
            {output.process.map((step, index) => <button type="button" role="listitem" className={`viral-flow-step ${step.id === activeStep ? "active" : ""} ${step.status === "needs-input" ? "needs-input" : ""}`} onClick={() => setActiveStep(step.id)} aria-pressed={step.id === activeStep} key={step.id}>
              <span className="viral-node">{String(index + 1).padStart(2, "0")}</span>
              <b>{step.label}</b>
              <small>{step.status === "completed" ? "已完成" : "待补证据"}</small>
              {index < output.process.length - 1 && <i aria-hidden="true">→</i>}
            </button>)}
          </div>
          {activeProcess && <div className="viral-flow-detail"><div><small>当前节点 · {activeProcess.label}</small><h3>{activeProcess.summary}</h3></div><div className="viral-evidence-list">{activeProcess.evidence.map((item) => <span key={item}>{item}</span>)}</div></div>}
        </article>

        <div className="split-results">
          <article className="panel hook-panel"><div className="panel-heading"><span>钩子识别</span><small>HOOK</small></div><span className="hook-type">{output.hook.type}</span><h3>{output.hook.pattern}</h3><p>{output.hook.evidence}</p><blockquote>{output.hook.boundary}</blockquote></article>
          <article className="panel source-panel"><div className="panel-heading"><span>素材证据</span><small>EVIDENCE</small></div><div className="source-fact"><b>{output.source.title}</b><span>{output.source.platform} · {output.source.contentLength}字 · {output.source.metricsStatus === "provided" ? "有互动指标" : "未提供互动指标"}</span>{output.source.contentUrl && <a href={output.source.contentUrl} target="_blank" rel="noreferrer">打开来源记录 ↗</a>}</div>{output.riskFlags.map((flag) => <p className="evidence-warning" key={flag}>{flag}</p>)}</article>
        </div>

        <article className="panel structure-panel"><div className="panel-heading"><span>结构拆解</span><small>DISSECTION</small></div><div className="viral-table-wrap"><table className="viral-table"><thead><tr><th>阶段</th><th>作用</th><th>观察</th><th>可迁移方法</th></tr></thead><tbody>{output.structure.map((row) => <tr key={row.stage}><th>{row.stage}</th><td>{row.role}</td><td>{row.observation}</td><td>{row.takeaway}</td></tr>)}</tbody></table></div></article>

        <div className="split-results">
          <article className="panel rewrite-panel"><div className="panel-heading"><span>原创选题与大纲</span><small>ORIGINAL PLAN</small></div><b className="subhead">标题方向</b>{output.rewritePlan.titles.map((title) => <p className="rewrite-item" key={title}>{title}</p>)}<b className="subhead">内容骨架</b><ol>{output.rewritePlan.outline.map((item) => <li key={item}>{item}</li>)}</ol></article>
          <article className="panel risk-panel"><div className="panel-heading"><span>合规复核与下一步</span><small>SAFETY GATE</small></div><div className="risk-grid">{output.rewritePlan.originalityRules.map((rule) => <span key={rule}>{rule}</span>)}</div><div className="next-actions">{output.nextActions.map((action) => <p key={action}>→ {action}</p>)}</div></article>
        </div>
      </div>
    </section>
  );
}

export default App;
