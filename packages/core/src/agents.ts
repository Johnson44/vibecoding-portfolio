import type {
  EsportsAgentInput,
  EsportsAgentOutput,
  ViralAgentInput,
  ViralAgentOutput
} from "@portfolio/contracts";
import {
  esportsCompetitorVideos,
  excludedServiceTerms,
  safeServicePackages
} from "./researchData";

export function runEsportsAgent(input: EsportsAgentInput): EsportsAgentOutput {
  const game = input.game;
  const videos = input.competitorVideos?.length ? input.competitorVideos : esportsCompetitorVideos;
  const services = (input.servicePackages?.length ? input.servicePackages : safeServicePackages)
    .filter((service) => service.game === game);
  const subtitleProvided = Boolean(input.subtitleText?.trim());

  const topics = game === "CS2" ? [
    "陪玩价格为什么不能只看一个数字",
    "新手组队前必须确认的3件事",
    "一局服务结束后，正规售后怎么做",
    "跑图和看Demo分别适合谁",
    "俱乐部如何匹配沟通风格",
    "开局两分钟混乱的沟通修复法",
    "老板最常问的5个下单问题",
    "不同预算怎么选服务时长",
    "一次真实咨询如何完成需求澄清",
    "从评论到下单的完整服务边界"
  ] : [
    "特色挑战下单前必须确认什么",
    "机密与绝密场景如何选队伍配置",
    "鼠鼠撤离挑战的沟通分工",
    "收集类玩法如何设定合理过程目标",
    "老板倒地后的团队沟通示范",
    "同干员组队能拍出什么节目效果",
    "如何拒绝不合理结果承诺",
    "不同预算如何确定挑战时长",
    "特色单咨询的5个高频问题",
    "从需求确认到售后的完整流程"
  ];

  const makeShots = (variant: number) => [
    {
      time: "0–6s",
      narration: variant ? "报价前不问清这三件事，价格再低也可能不合适。" : `玩${game}总在开局两分钟乱掉？先别急着怪枪法。`,
      visual: "失败片段三连切 + 关键问题大字卡",
      subtitle: variant ? "游戏 / 人数 / 时段" : "问题可能不在枪法",
      transition: "音效卡点硬切"
    },
    {
      time: "6–28s",
      narration: "先展示常见错误，再给出一句可以直接照着说的报点或咨询表达。",
      visual: "第一视角游戏素材 + 关键区域框选",
      subtitle: "错误示范 → 可执行表达",
      transition: "左右对比"
    },
    {
      time: "28–56s",
      narration: "把任务拆成信息、决策和执行三步，同时明确不接代打、外挂和账号操作。",
      visual: "三段实战画面 + 服务边界清单",
      subtitle: "信息 / 决策 / 执行",
      transition: "节奏推进"
    },
    {
      time: "56–82s",
      narration: "价格表存在错位时不猜档位，只记录需求并由客服确认人员、时段和最终金额。",
      visual: "需求表单动效 + 人工确认标识",
      subtitle: "价格待人工确认｜不承诺胜率",
      transition: "放慢节奏"
    },
    {
      time: "82–96s",
      narration: "评论留下游戏、人数和时间，我先发你一份需求确认清单。",
      visual: "评论关键词 + 咨询流程收尾",
      subtitle: "先确认需求，再决定是否下单",
      transition: "淡出至封面"
    }
  ];

  return {
    topics: topics.map((topic) => `${game}｜${topic}`),
    scripts: [
      { title: `${game}开局不再乱：3步沟通法`, duration: 96, hook: "用失败画面制造认知反差", shots: makeShots(0) },
      { title: `${game}陪玩报价前，先问清这3件事`, duration: 96, hook: "从用户怕踩坑的价格问题切入", shots: makeShots(1) }
    ],
    packageSuggestion: services.length
      ? `当前仅从${services.length}个合规服务项中匹配：${services.map((service) => service.name).join("、")}。原表错位项和所有结果承诺均转人工确认。`
      : "当前没有可自动推荐的合规服务项，转人工确认需求与服务边界。",
    quoteTemplate: "已记录：{游戏}/{人数}/{日期时段}/{预计时长}/{偏好}。参考项目为{服务项}，价格{待人工确认}；确认人员、时段和服务边界后再下单，不承诺胜率或固定结果。",
    operationSop: [
      "咨询：收集游戏、分段、人数、时段和偏好",
      "风控：识别代打、外挂、账号操作及固定结果诉求并拒绝",
      "匹配：只从合规服务目录按人员特长与沟通风格筛选",
      "报价：原表错位或特色挑战统一由人工复核金额",
      "下单：确认服务边界、取消规则和售后时限",
      "交付：开始前二次确认，异常情况立即转人工",
      "评价：收集真实体验反馈，不诱导虚假好评"
    ],
    humanHandoff: [
      "价格档位、人员等级或特色挑战规则无法明确对应",
      `出现${excludedServiceTerms.join("、")}等请求`,
      "用户投诉、退款、未成年人或人身攻击场景",
      "要求承诺必胜、固定物资、固定撤离或其他结果"
    ],
    sourceInsights: [
      `已整理CS2星火电竞账号${videos.length}条公开视频元数据，样本以短剧情、关系梗和服务解释为主。`,
      `样本中${videos.filter((video) => (video.durationSec ?? 0) >= 60 && (video.durationSec ?? 0) <= 180).length}条处于60–180秒，可作为中视频节奏参照。`,
      subtitleProvided
        ? "已接收用户粘贴的字幕文本，可用于当前轮结构分析。"
        : "抽检视频没有B站机器可读字幕轨；画面烧录字幕尚未转成文本，当前不做逐字稿结论。"
    ],
    complianceWarnings: [
      "公开视频只提炼结构，不复刻标题、字幕或脚本",
      "原始CS价格矩阵排版错位，所有具体档位需人工确认",
      "三角洲特色项目不保物资、不保撤离、不保固定结果",
      "历史流水与账号数据不能作为Agent效果"
    ],
    materialStats: {
      competitorCount: videos.length,
      captionTrackCount: subtitleProvided ? 1 : 0,
      safePackageCount: services.length
    },
    mode: "research"
  };
}

function detectViralHook(title: string, content: string) {
  const source = `${title}\n${content.slice(0, 180)}`;
  if (/\d/.test(title) || /[一二三四五六七八九十]+[个步项种条件]/.test(source)) {
    return { type: "数字清单型", pattern: "用明确数量降低理解门槛，再承诺逐项展开。" };
  }
  if (/[?？]|为什么|怎么|如何|怎么办/.test(source)) {
    return { type: "问题切入型", pattern: "把受众正在犹豫的问题放到首屏，先制造继续阅读的理由。" };
  }
  if (/避坑|千万|别急|注意|真实|翻车|冲突/.test(source)) {
    return { type: "风险/反差型", pattern: "先给出风险或反常识判断，再补充判断依据。" };
  }
  return { type: "场景结果型", pattern: "从一个具体场景或结果进入，再逐步补充方法。" };
}

export function runViralAgent(input: ViralAgentInput): ViralAgentOutput {
  const title = input.title.trim() || "未命名素材";
  const content = input.content.trim();
  const hasText = Boolean(content);
  const hook = detectViralHook(title, content);
  const hasCta = /评论|私信|收藏|关注|领取|留言|转发/.test(content);
  const sourceEvidence = hasText ? `已读取用户粘贴的${content.length}字文本` : "当前只有标题，正文证据待补充";
  const structure = [
    {
      stage: "首屏 / 开头",
      role: "抓注意",
      observation: hasText ? `标题属于${hook.type}，正文开头需要验证是否兑现标题承诺。` : `标题显示为${hook.type}，尚不能判断开头是否真的有效。`,
      takeaway: "只复用问题意识或信息组织方式，不复用原句。"
    },
    {
      stage: "中段 / 证据",
      role: "建立理解",
      observation: hasText ? "将正文按事实、观点、案例和情绪表达分层，当前先标记为待人工确认。" : "未提供正文，无法判断证据密度、案例位置和节奏。",
      takeaway: "把可核验事实与作者判断分开，缺来源的结论留待复核。"
    },
    {
      stage: "后段 / 方法",
      role: "给出行动",
      observation: hasText ? "检查是否从观点过渡到步骤、清单或可执行建议。" : "待粘贴文本后识别方法段落与信息增量。",
      takeaway: "原创内容应重新组织方法，不按原内容逐段替换同义词。"
    },
    {
      stage: "结尾 / CTA",
      role: "承接互动",
      observation: hasText ? (hasCta ? "检测到互动或资料承接表达，需人工判断是否与正文价值匹配。" : "暂未检测到明显CTA，可能依赖收藏或自然讨论。") : "待文本补充后判断是否存在CTA。",
      takeaway: "CTA应承接真实资源或下一步动作，不制造虚假稀缺。"
    }
  ];
  const process = [
    {
      id: "capture" as const,
      label: "采集素材",
      status: title !== "未命名素材" ? "completed" as const : "needs-input" as const,
      summary: title !== "未命名素材" ? `已记录${input.platform}标题与来源` : "需要标题或素材来源",
      evidence: [input.contentUrl ? `来源链接：${input.contentUrl}` : "未提供来源链接", sourceEvidence]
    },
    {
      id: "hook" as const,
      label: "识别钩子",
      status: "completed" as const,
      summary: `${hook.type}：${hook.pattern}`,
      evidence: [`标题：${title}`, "仅基于标题和已粘贴文本识别，不等于平台数据结论"]
    },
    {
      id: "structure" as const,
      label: "拆解结构",
      status: hasText ? "completed" as const : "needs-input" as const,
      summary: hasText ? "已按开头、证据、方法、CTA四段拆解" : "正文不足，暂不能完成逐段拆解",
      evidence: [hasText ? "证据：用户粘贴文本" : "证据缺口：正文或授权字幕", "不推断未提供的镜头和数据"]
    },
    {
      id: "rewrite" as const,
      label: "生成原创方案",
      status: hasText ? "completed" as const : "needs-input" as const,
      summary: hasText ? "已生成原创标题方向与内容骨架" : "先补正文，再生成更可靠的改写方向",
      evidence: ["输出只抽象结构，不复制原文、页序或封面表达"]
    },
    {
      id: "safety" as const,
      label: "合规复核",
      status: "completed" as const,
      summary: "已加入来源、数据和反洗稿检查",
      evidence: ["未提供播放、点赞、完播数据时不下爆款结论", "外部链接只作记录，不自动抓取受限内容"]
    }
  ];
  return {
    source: {
      platform: input.platform,
      title,
      contentUrl: input.contentUrl?.trim() || undefined,
      contentLength: content.length,
      evidenceStatus: hasText ? "text-provided" : "title-only",
      metricsStatus: "not-provided"
    },
    process,
    hook: {
      type: hook.type,
      pattern: hook.pattern,
      evidence: sourceEvidence,
      boundary: "只提炼信息组织方式；不复制原文、字幕、封面构图或账号人设。"
    },
    structure,
    rewritePlan: {
      titles: [
        `${title}：拆出3个可复用判断点`.slice(0, 28),
        `别急着照搬“${title}”，先看这3个结构`.slice(0, 28),
        `把“${title}”改成一套原创内容`.slice(0, 28)
      ],
      outline: [
        `用${hook.type}提出新问题，不复述原标题`,
        "补充一个可核验事实或明确标注个人判断",
        "用三步方法完成信息增量",
        "给出与新内容匹配的自然CTA"
      ],
      originalityRules: [
        "不逐句改写，不替换同义词式洗稿",
        "不复制原账号的个人经历、封面构图和固定口头禅",
        "涉及排名、效果、时效和数据时补来源或改为待核验"
      ]
    },
    riskFlags: [
      "未提供播放、点赞、完播数据，不能仅凭标题称为爆款",
      hasText ? "正文已提供，但事实来源和镜头证据仍需人工复核" : "缺少正文或授权字幕，当前只能做标题级分析",
      "外部链接不代表已获得转载、抓取或改写授权"
    ],
    nextActions: [
      "补充已获授权的正文/字幕或逐段笔记",
      "补充播放、点赞、评论、收藏、发布时间等指标后再做表现复盘",
      "从原创选题和新证据重新写稿，再进行人工发布前检查"
    ],
    mode: "research"
  };
}
