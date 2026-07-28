import type {
  EducationAgentInput,
  EducationAgentOutput,
  EducationContentPlan,
  EducationHook,
  EducationTopic,
  PolicySource,
  SourceReference
} from "@portfolio/contracts";
import {
  educationAcceptanceCases,
  educationCompetitorSamples,
  educationPolicySources,
  educationSampleAnnotations
} from "./researchData";

function asSourceReference(source: PolicySource): SourceReference {
  return {
    title: source.title,
    publisher: source.publisher,
    publishedAt: source.publishedAt,
    url: source.url,
    verified: source.status === "verified"
  };
}

const educationTopicIdeas: EducationAgentOutput["topicIdeas"] = [
  { topic: "房户一致分析", angle: "用家庭情况自测拆解户籍、住址、住宅产权和区县适用范围", recommendedPages: 4 },
  { topic: "入学材料准备", angle: "把基础信息、分类材料、提交节点和缺件补救做成清单", recommendedPages: 4 },
  { topic: "重大事件时间轴", angle: "按政策发布、信息采集、审核与录取节点排列", recommendedPages: 5 },
  { topic: "学校排名", angle: "改做非官方校情对比，公开评价维度与证据等级", recommendedPages: 5 },
  { topic: "摇号解析", angle: "解释适用条件、统一报名、随机派位和结果查询", recommendedPages: 4 },
  { topic: "报名教程", angle: "按官方入口、选择区域、填报、提交与异常求助拆解", recommendedPages: 5 }
];

const topicSourceIds: Record<EducationTopic, string[]> = {
  房户一致分析: ["sjz-edu-2026-compulsory-plan", "sjz-qa-2026-gaoxin-household"],
  入学材料准备: ["sjz-edu-2026-compulsory-plan", "sjz-edu-2026-collection", "sjz-edu-2026-primary-tutorial"],
  重大事件时间轴: ["hebei-edu-2026-admission", "sjz-edu-2026-collection", "sjz-edu-2026-compulsory-plan", "sjz-edu-2026-primary-tutorial"],
  学校排名: ["sjz-edu-2026-compulsory-plan", "sjz-edu-2026-sunshine"],
  摇号解析: ["hebei-edu-2026-admission", "sjz-edu-2026-compulsory-plan", "sjz-edu-2026-collection"],
  报名教程: ["sjz-edu-2026-collection", "sjz-edu-2026-primary-tutorial", "sjz-edu-2026-shimin"]
};

function buildEducationCards(topic: EducationTopic, district: string, stage: EducationAgentInput["stage"], hook: EducationHook) {
  const coverBody = hook === "入学测真题"
    ? "3道家庭情况自测题；这是政策理解自测，不是学校考试真题。"
    : `领取型内容钩子：${hook}；结论均标注来源与核验状态。`;
  const cardMap: Record<EducationTopic, Array<[string, string, string]>> = {
    房户一致分析: [
      ["封面｜房户一致怎么判断", coverBody, "结论式主标题 + 钩子角标"],
      ["先看四个信息", `核对孩子户口、父母或监护人户口、实际住址及住宅产权。${district}具体口径仍要看区级通知。`, "四象限自查表"],
      ["高新区2026答复怎么说", "当前官方个案答复提到：户口随父母双方或一方且户口、住址一致，可按划片就近入学；该口径不能直接外推其他区。", "原文要点 + 适用范围标签"],
      ["三类情况怎么行动", "信息一致先准备证明；信息不一致先问所属区；产权、落户或学位情况特殊时留存官方答复。", "绿/黄/红三档行动卡"]
    ],
    入学材料准备: [
      ["封面｜入学材料清单", coverBody, "清单式主标题 + PDF角标"],
      ["先准备基础信息", "户籍、房产或居住、学籍及监护关系信息按家庭情况分类准备；系统实际字段以当年页面为准。", "四栏勾选清单"],
      ["这些材料别过度准备", "2026方案强调清理无谓证明；预防接种证明不作为入学报名前置条件，开学后可按要求提供。", "需要 / 非前置对照卡"],
      ["提交前做一次复核", "检查姓名证件号、区县、学校类别、图片清晰度和提交状态；特殊家庭可到线下服务点咨询。", "提交前5项检查"]
    ],
    重大事件时间轴: [
      ["封面｜2026入学时间轴", coverBody, "纵向时间轴封面"],
      ["6月3日—7月6日", "6月3日省级招生通知发布；7月4日信息采集时间公布；7月6日石家庄招生方案解读发布。", "三节点时间线"],
      ["7月14日—18日", "五城区公办小学一年级进行网上信息采集；7月18日为本轮采集结束节点。", "小学节点高亮"],
      ["7月19日—23日", "五城区公办初中信息采集。民办报名、派位和录取节点应继续查看招生系统通知。", "初中节点 + 待更新标识"],
      ["错过或异常怎么办", "先查看系统状态，再联系拟报名区服务点；不要用往年时间替代本年安排。", "异常处理流程"]
    ],
    学校排名: [
      ["封面｜学校怎么比较", coverBody, "排名词制造注意 + 非官方说明"],
      ["先说结论", "教育部门没有发布学校综合排名。网络梯队、升学率和家长口碑不能直接拼成官方榜单。", "醒目结论卡"],
      ["校情表看这5项", "招生范围与方式、招生计划、收费、通勤与住宿、公开办学特色；每一项记录来源和年份。", "五维校情表"],
      ["证据分三级", "A级：当年政府或教育部门；B级：备案招生简章或学校公开信息；C级：家长体验，仅作线索。", "A/B/C证据等级"],
      ["选适合，不造榜单", `结合孩子情况和${district}招生规则做匹配；无法核实的数据留空，不输出“最好”或“稳进”。`, "家庭匹配决策卡"]
    ],
    摇号解析: [
      ["封面｜民办摇号看懂", coverBody, "问句标题 + 流程钩子"],
      ["什么情况会随机派位", "民办学校报名人数超过核定招生计划数时，由审批地教育行政部门统一组织电脑随机派位。", "条件判断卡"],
      ["报名入口只有一个", "通过石家庄市义务教育招生入学服务系统报名；学校不得提前预报名，私下预录取无效。", "正确 / 错误入口对照"],
      ["家长重点盯三件事", "招生范围和对象、报名及派位节点、官方录取结果；任何“保摇中”说法都不可信。", "三项核验 + 风险提醒"]
    ],
    报名教程: [
      ["封面｜网上报名教程", coverBody, "步骤型封面 + 截图位置预留"],
      ["第1步：进入官方系统", "从石家庄市教育局官网或石i民App进入义务教育招生入学服务系统，核对网址和当年入口。", "入口截图 + 防钓鱼提示"],
      ["第2步：选择区域和类别", `选择拟登记学校所在区，再根据${stage}和公办/民办类别进入对应入口。`, "路径面包屑"],
      ["第3步：填写并提交", "按页面字段填写家庭与入学信息，上传清晰材料；提交后截图保存状态，不重复填报。", "表单检查清单"],
      ["遇到异常怎么办", "先看系统提示；不方便上网或情况特殊，可到报名服务点由工作人员协助。", "常见异常 + 求助入口"]
    ]
  };
  return cardMap[topic].map(([headline, body, layoutHint], index) => ({ page: index + 1, headline, body, layoutHint }));
}

function makeEducationPlan(
  input: EducationAgentInput,
  district: string,
  topic: EducationTopic,
  hook: EducationHook,
  policies: PolicySource[],
  index: number
): EducationContentPlan {
  const cards = buildEducationCards(topic, district, input.stage, hook);
  const keyword = hook === "入学测真题" ? "测一测" : hook;
  const sourcePool = policies.filter((source) => topicSourceIds[topic].includes(source.id));
  const planSources = (sourcePool.length ? sourcePool : policies.filter((source) => source.status === "verified").slice(0, 3)).map(asSourceReference);
  const safeTopic = topic === "学校排名" ? "学校对比" : topic.replace("解析", "");
  const coverPrimary = hook === "入学测真题" ? `${district}${safeTopic}测一测` : `${district}${safeTopic}${hook}`;
  const title = (hook === "入学测真题" ? `${district}${safeTopic}，3题测清` : `${district}${safeTopic}${hook}`).slice(0, 20);
  const scopeNote = topic === "学校排名" ? "本内容不是官方学校排名，只提供公开信息对比框架。" : "具体结论以当年官方页面和所属区答复为准。";
  const privateMessages = [
    "您这个情况有点特殊，要不您留个电话？我让升学那边的老师具体给您想想对策。号码仅用于本次咨询。",
    `有的，我们把${hook}整理成PDF了，小红书里不方便完整发送。您愿意的话可以留个电话，由老师发给您；号码仅用于这次资料发送。`,
    `先麻烦您说下孩子学段、所在区和最想解决的问题，我帮您判断更适合发${hook}还是转老师具体沟通。`
  ];
  return {
    id: `education-plan-${index + 1}`,
    topic,
    hook,
    title,
    cover: {
      primary: coverPrimary,
      secondary: hook === "入学测真题" ? "政策理解自测｜非学校考试真题" : `2026公开信息整理｜${cards.length}页读懂`
    },
    insight: `${topic}适合用“结论先行—情形拆分—行动建议—资料承接”的短页序，当前方案共${cards.length}页。`,
    cards,
    postBody: `最近不少${district}${input.stage}家长在问${topic}。这篇按2026年公开政策做了一个短版整理：${cards.slice(1).map((card) => card.headline.replace(/^.*：/, "")).join("、")}。\n\n${scopeNote}\n\n想要完整版${hook}的家长，评论区扣“${keyword}”，我会私信您。请不要在公开评论区留下手机号。`,
    tags: ["石家庄升学", input.stage, district, topic, hook],
    cta: `评论区扣“${keyword}”，我私信您完整版${hook}；特殊情况再由升学老师一对一核对。`,
    comments: ["已私信您，请查收", `需要${hook}的家长扣“${keyword}”，我按顺序私发。`, "手机号不要发在公开评论区，具体情况可以私信说。"],
    privateMessages,
    leadRules: [
      { level: "A", signal: "明确学段、区县、学校或时间节点，并说明特殊情况或主动愿意留电话", reply: privateMessages[0] },
      { level: "B", signal: `明确索要${hook}/PDF，但尚未说明家庭情况或联系方式`, reply: privateMessages[1] },
      { level: "C", signal: "只回复关键词、泛问学校好不好或尚无明确时间", reply: privateMessages[2] }
    ],
    sources: planSources,
    manualChecks: [
      `发布前确认${district}是否有区级补充通知`,
      topic === "学校排名" ? "不得出现官方排名、保进、最好学校等结论" : "数字、日期和适用范围逐条对照来源",
      hook === "入学测真题" ? "必须标注为政策理解自测，不得冒充学校考试真题" : `确认${hook}文件确实存在且可交付`,
      "收集电话前说明用途，不在评论区引导公开手机号"
    ]
  };
}

export function runEducationAgent(input: EducationAgentInput): EducationAgentOutput {
  const district = input.district.trim() || "目标区县";
  const topic = input.topic ?? "房户一致分析";
  const selectedHook = input.hook ?? "白皮书";
  const competitors = (input.competitorSamples?.length ? input.competitorSamples : educationCompetitorSamples)
    .filter((sample) => sample.category === input.stage);
  const policies = input.policySources?.length ? input.policySources : educationPolicySources;
  const verifiedPolicies = policies.filter((source) => source.status === "verified");
  const sampleRisks = [...new Set(competitors.flatMap((sample) => sample.riskFlags))];
  const hooks: EducationHook[] = [selectedHook, ...(["白皮书", "校情表", "入学测真题"] as EducationHook[]).filter((hook) => hook !== selectedHook)];
  const plans = hooks.map((hook, index) => makeEducationPlan(input, district, topic, hook, policies, index));
  const selectedPlan = plans[0];

  return {
    ...selectedPlan,
    materialStats: {
      competitorCount: competitors.length,
      policyCount: policies.length,
      verifiedPolicyCount: verifiedPolicies.length,
      annotatedSampleCount: educationSampleAnnotations.filter((annotation) => competitors.some((sample) => sample.id === annotation.sampleId)).length,
      acceptanceCaseCount: educationAcceptanceCases.length
    },
    contentRisks: [
      ...sampleRisks,
      "禁止照搬竞品页序和文案",
      "禁止虚构家长或学生亲历",
      "不得使用谐音或变体刻意规避平台审核"
    ],
    topicIdeas: educationTopicIdeas,
    plans,
    revisionNotes: [
      { draft: "固定生成6页通用避坑内容", revision: "按选题自动生成2–5页短页序", reason: "贴近实际笔记长度" },
      { draft: "直接使用学校排名作为结论", revision: "改为非官方校情对比并公开证据等级", reason: "教育部门未发布综合排名" },
      { draft: "统一CTA为留下学段和区县", revision: `按${selectedHook}资源钩子评论承接，再在私信中判断线索`, reason: "让留资动机与内容钩子一致" }
    ],
    failureCases: [
      { input: "给我写石家庄最好的10所初中，保证准确", blockedOutput: "不生成官方口吻的综合排名", fallback: "输出校情对比表，列清来源、年份和待核验项" },
      { input: "写一套学校内部入学真题", blockedOutput: "不伪造学校命题或考试真题", fallback: "生成政策理解自测题，并明确非学校考试" },
      { input: "保证摇号成功并引导评论区留手机号", blockedOutput: "不承诺随机结果，不公开收集手机号", fallback: "说明随机派位规则，引导私信并告知号码用途" }
    ],
    mode: "research"
  };
}
