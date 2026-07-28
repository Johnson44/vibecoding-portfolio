import type {
  CompetitorSample,
  EducationAcceptanceCase,
  EducationSampleAnnotation,
  PolicySource,
  ServicePackage
} from "@portfolio/contracts";

export const educationPolicySources: PolicySource[] = [
  {
    id: "sjz-edu-2026-compulsory-plan",
    title: "全面落实义务教育免试就近入学政策——石家庄市2026年义务教育招生入学工作实施方案落地",
    publisher: "石家庄市人民政府（来源：石家庄日报）",
    publishedAt: "2026-07-06",
    url: "https://www.sjz.gov.cn/columns/839b1981-330e-4901-aba5-6c392154ce03/202607/06/3c9d574a-6987-45a1-8ace-8736e5da7639.html",
    scope: "石家庄市2026年义务教育招生",
    status: "verified",
    keyFacts: ["公办义务教育学校落实免试、就近入学", "民办义务教育招生统一通过官方平台组织", "接种证明不作为入学报名前置条件"]
  },
  {
    id: "sjz-edu-2026-collection",
    title: "石家庄市2026年义务教育招生信息采集7月14日开始",
    publisher: "石家庄市人民政府",
    publishedAt: "2026-07-04",
    url: "https://www.sjz.gov.cn/columns/b69e27e8-4d0f-4b31-a67c-06481996d304/202607/04/8c12ade7-2f70-4776-b04f-f0276674a6d6.html",
    scope: "五城区2026年义务教育信息采集时间",
    status: "verified",
    keyFacts: ["小学信息采集为7月14日至18日", "初中信息采集为7月19日至23日", "公办学校设置线下服务点"]
  },
  {
    id: "sjz-edu-2026-primary-tutorial",
    title: "长安区桥西区新华区裕华区高新区2026年公办小学报名7月18日结束",
    publisher: "石家庄市人民政府（来源：石家庄日报）",
    publishedAt: "2026-07-16",
    url: "https://www.sjz.gov.cn/columns/839b1981-330e-4901-aba5-6c392154ce03/202607/16/acc814b6-84ae-46db-a177-72f555e0e169.html",
    scope: "五城区2026年公办小学网上信息采集操作入口",
    status: "verified",
    keyFacts: ["可从市教育局官网或石i民App进入招生系统", "先选择登记学校所在区，再选择公办小学一年级报名", "具体拟登记学校和材料需按系统提示填报"]
  },
  {
    id: "sjz-edu-2026-sunshine",
    title: "2026年中小学阳光招生专项措施发布",
    publisher: "石家庄市人民政府（来源：石家庄日报）",
    publishedAt: "2026-05-08",
    url: "https://www.sjz.gov.cn/columns/839b1981-330e-4901-aba5-6c392154ce03/202605/08/0d962687-3687-405a-a355-a34ef4b579dc.html",
    scope: "2026年普通中小学招生规范",
    status: "verified",
    keyFacts: ["义务教育学校全面实施免试就近入学", "不得通过面试、评测或接收简历选拔学生", "学校比较内容不得包装成入学选拔攻略"]
  },
  {
    id: "hebei-edu-2026-admission",
    title: "河北省教育厅关于做好2026年普通中小学招生入学工作的通知",
    publisher: "石家庄市人民政府（转载河北省教育厅）",
    publishedAt: "2026-06-03",
    url: "https://www.sjz.gov.cn/columns/b69e27e8-4d0f-4b31-a67c-06481996d304/202606/03/dee79e6d-8085-4c00-b608-0e53aa48f966.html",
    scope: "河北省2026年普通中小学招生",
    status: "verified",
    keyFacts: ["招生政策应公开透明", "义务教育阶段落实免试入学", "严禁以考试、竞赛或培训成绩作为招生依据"]
  },
  {
    id: "sjz-edu-2026-exam-registration",
    title: "初中学业水平考试开始报名",
    publisher: "石家庄市人民政府",
    publishedAt: "2026-03-17",
    url: "https://www.sjz.gov.cn/columns/b69e27e8-4d0f-4b31-a67c-06481996d304/202603/17/2f299536-92ce-4df9-9ffc-f3eda25aa031.html",
    scope: "石家庄市2026年初中学业水平考试报名",
    status: "verified",
    keyFacts: ["页面用于核验当年度中考报名安排", "具体资格与办理方式需按考生类别核对"]
  },
  {
    id: "sjz-edu-2026-application",
    title: "2026年石家庄市中考志愿填报7月4日开始",
    publisher: "石家庄市人民政府",
    publishedAt: "2026-07-04",
    url: "https://www.sjz.gov.cn/columns/b69e27e8-4d0f-4b31-a67c-06481996d304/202607/04/8bbeb982-6706-4cde-a018-249231ddcd49.html",
    scope: "石家庄市2026年中考志愿填报",
    status: "verified",
    keyFacts: ["志愿填报时间为7月4日9时至7月7日9时", "填报前应阅读官方招生简章和招生计划"]
  },
  {
    id: "sjz-edu-2026-shimin",
    title: "便民不打烊！成绩查询、入学报名“石i民”平台一站服务",
    publisher: "石家庄市人民政府",
    publishedAt: "2026-07-03",
    url: "https://www.sjz.gov.cn/columns/5563be8a-06e0-4d51-a7d3-14fa681612d1/202607/03/95188d40-2529-4d18-8fae-6395b8bbcf1c.html",
    scope: "官方查询与报名服务入口",
    status: "verified",
    keyFacts: ["石i民平台提供相关查询和报名服务", "办理入口仍需以当年度官方页面为准"]
  },
  {
    id: "sjz-qa-2026-gaoxin-household",
    title: "高新区义务教育房户一致问题答复",
    publisher: "石家庄市教育局政民互动",
    publishedAt: "2026-07-06",
    url: "https://www.sjz.gov.cn/zmhd/zfxxdetail.jsp?id=585212",
    scope: "高新区个案咨询；不可直接外推到其他区县",
    status: "needs-human-check",
    keyFacts: ["答复涉及房户一致口径与统筹安排", "个案适用性需向所属区教育部门再次确认"]
  },
  {
    id: "sjz-qa-2026-exam-location",
    title: "户籍地与学籍地不同的中考报名问题答复",
    publisher: "石家庄市教育局政民互动",
    publishedAt: "2026-07-07",
    url: "https://www.sjz.gov.cn/zmhd/zfxxdetail.jsp?id=585400",
    scope: "中考报名地个案咨询",
    status: "needs-human-check",
    keyFacts: ["可在户籍地或学籍地报名的具体适用条件需核对", "五城区选项与后续资格应以官方答复为准"]
  },
  {
    id: "sjz-edu-2025-compulsory-plan",
    title: "石家庄市2025年义务教育招生入学工作实施方案",
    publisher: "石家庄市教育局",
    publishedAt: "2025-07-06",
    url: "https://sjzjyj.sjz.gov.cn/a/2025/07/06/1751775198674.html",
    scope: "2025年历史对照，不能替代2026年政策",
    status: "historical",
    keyFacts: ["仅用于观察政策结构与变化", "任何日期、范围和材料要求均需切换到当年来源"]
  },
  {
    id: "sjz-edu-2025-hotlines",
    title: "石家庄市2025年义务教育招生咨询电话",
    publisher: "石家庄市人民政府",
    publishedAt: "2025-07-12",
    url: "https://www.sjz.gov.cn/columns/b69e27e8-4d0f-4b31-a67c-06481996d304/202507/12/79f14837-0b3d-457c-ba0d-81a7650874d3.html",
    scope: "2025年历史咨询电话，使用前必须复核",
    status: "historical",
    keyFacts: ["仅作历史索引", "电话号码和服务时间可能变化，发布前必须人工确认"]
  }
];

export const educationCompetitorSamples: CompetitorSample[] = [
  ["edu-p-01", "视频号", "48中", "https://weixin.qq.com/sph/AmyfXK6S2Q", ["school-claim-needs-source"]],
  ["edu-p-02", "小红书", "准初一暑假学习规划", "https://www.xiaohongshu.com/discovery/item/6a3e5c0900000000060329fd", ["general-advice"]],
  ["edu-p-03", "小红书", "学霸的10种学习方法", "http://xhslink.com/o/7JSIhd6TKrM", ["effect-claim-needs-source"]],
  ["edu-p-04", "小红书", "石家庄英语六年级语法点", "http://xhslink.com/o/8bbfyQJZ8hJ", ["teaching-material-copyright"]],
  ["edu-p-05", "小红书", "石家庄民办初中排名", "http://xhslink.com/o/7UXboDUx21w", ["unverified-ranking"]],
  ["edu-p-06", "小红书", "石家庄初中前10名排名", "http://xhslink.com/o/34nBcAmv9mS", ["unverified-ranking", "unverified-statistics", "admission-claim"]],
  ["edu-p-07", "小红书", "石家庄小升初问答", "http://xhslink.com/o/7k9PqrkOuOE", ["community-question"]],
  ["edu-p-08", "小红书", "外国语考试英语词汇资料", "https://www.xiaohongshu.com/discovery/item/6961bdd7000000000a03fa4e", ["out-of-city", "teaching-material-copyright"]],
  ["edu-p-09", "小红书", "新生报到时间冲突怎么办", "https://www.xiaohongshu.com/discovery/item/6871c00f0000000024008c36", ["date-needs-official-source"]],
  ["edu-p-10", "小红书", "六升七暑假安排", "https://www.xiaohongshu.com/discovery/item/6a33ea260000000007028cb4", ["general-advice"]],
  ["edu-m-01", "小红书", "真实学生的学校经历", "http://xhslink.com/o/8U8SSawlFQy", ["personal-anecdote", "do-not-impersonate"]],
  ["edu-m-02", "小红书", "学校梯队讨论", "http://xhslink.com/o/AIy8alfBBF5", ["unverified-ranking", "reposted-image"]],
  ["edu-m-03", "小红书", "2024石家庄高中层次情况表是真的吗", "http://xhslink.com/o/2DVwF1rh4y7", ["historical-data", "unverified-ranking"]],
  ["edu-m-04", "小红书", "石家庄城市话题借势", "http://xhslink.com/o/8Zp7VdknLB3", ["weak-topic-fit"]],
  ["edu-m-05", "小红书", "哪次模考更接近中考", "http://xhslink.com/o/bYTN8s5Sv5", ["prediction-claim"]],
  ["edu-m-06", "抖音", "初二升初三暑假规划", "https://v.douyin.com/dOKj3BRM754/", ["personal-anecdote", "effect-claim-needs-source"]],
  ["edu-m-07", "小红书", "哪些初中学霸到高中依旧突出", "http://xhslink.com/o/6yZVb4oi6CU", ["community-question", "labeling-risk"]],
  ["edu-m-08", "小红书", "普高与中职升学路径", "https://www.xiaohongshu.com/explore/69a28b9a000000002801d496", ["policy-claim-needs-current-source"]],
  ["edu-m-09", "小红书", "初中阶段学习与家庭规划", "https://www.xiaohongshu.com/explore/6756a614000000000103c3cb", ["general-advice", "pressure-language"]],
  ["edu-m-10", "小红书", "河北高中选择讨论", "https://www.xiaohongshu.com/discovery/item/67983101000000001703a402", ["unverified-ranking", "community-question"]]
].map(([id, platform, title, url, riskFlags]) => ({
  id: id as string,
  platform: platform as CompetitorSample["platform"],
  category: (String(id).includes("-p-")) ? "小升初" : "初升高",
  title: title as string,
  url: url as string,
  transcriptStatus: "not-required",
  riskFlags: riskFlags as string[]
}));

export const educationSampleAnnotations: EducationSampleAnnotation[] = [
  {
    sampleId: "edu-p-01",
    hookPattern: "学校名/结果型",
    structureTags: ["单点切入", "先抛结论", "需补官方来源"],
    evidenceLevel: "C",
    ctaPattern: "围绕学校继续提问",
    reuseBoundary: "只能抽象为学校信息核验框架，不复述具体判断"
  },
  {
    sampleId: "edu-p-02",
    hookPattern: "时间节点型",
    structureTags: ["家长场景", "步骤清单", "暑假规划"],
    evidenceLevel: "C",
    ctaPattern: "收藏/领取安排",
    reuseBoundary: "只借鉴清单节奏，学习建议需重新组织"
  },
  {
    sampleId: "edu-p-03",
    hookPattern: "数字清单型",
    structureTags: ["数字开头", "方法罗列", "效果暗示"],
    evidenceLevel: "混合",
    ctaPattern: "收藏方法",
    reuseBoundary: "不沿用数字结论或效果承诺"
  },
  {
    sampleId: "edu-p-04",
    hookPattern: "资料型",
    structureTags: ["学科切口", "知识点罗列", "资料承接"],
    evidenceLevel: "C",
    ctaPattern: "索取资料",
    reuseBoundary: "不复制教材内容，需确认版权与公开来源"
  },
  {
    sampleId: "edu-p-05",
    hookPattern: "排名疑问型",
    structureTags: ["榜单期待", "学校对比", "结论风险"],
    evidenceLevel: "C",
    ctaPattern: "评论区问学校",
    reuseBoundary: "改造成非官方校情对比，不输出排名"
  },
  {
    sampleId: "edu-p-06",
    hookPattern: "前十榜单型",
    structureTags: ["强结论", "数字榜单", "录取暗示"],
    evidenceLevel: "C",
    ctaPattern: "引发争议讨论",
    reuseBoundary: "仅作为风险样本，不采用榜单结构生成"
  },
  {
    sampleId: "edu-p-07",
    hookPattern: "家长问答型",
    structureTags: ["问题开头", "情形拆分", "经验回复"],
    evidenceLevel: "C",
    ctaPattern: "补充个人情况",
    reuseBoundary: "不得伪装成真实家长或官方答复"
  },
  {
    sampleId: "edu-p-08",
    hookPattern: "资料领取型",
    structureTags: ["关键词切入", "资料展示", "地域错配"],
    evidenceLevel: "C",
    ctaPattern: "私信资料",
    reuseBoundary: "先核对地区与版权，再决定是否制作"
  },
  {
    sampleId: "edu-p-09",
    hookPattern: "异常求助型",
    structureTags: ["突发场景", "问题诊断", "时间核验"],
    evidenceLevel: "混合",
    ctaPattern: "留言具体节点",
    reuseBoundary: "日期必须绑定当年官方页面"
  },
  {
    sampleId: "edu-p-10",
    hookPattern: "计划模板型",
    structureTags: ["家庭场景", "日程拆分", "模板承接"],
    evidenceLevel: "C",
    ctaPattern: "领取模板",
    reuseBoundary: "借鉴日程拆分，不复制原计划内容"
  },
  {
    sampleId: "edu-m-01",
    hookPattern: "个人经历型",
    structureTags: ["第一人称", "经历叙事", "学校印象"],
    evidenceLevel: "C",
    ctaPattern: "评论分享经历",
    reuseBoundary: "不得虚构学生经历或把个案当普遍规律"
  },
  {
    sampleId: "edu-m-02",
    hookPattern: "梯队讨论型",
    structureTags: ["学校分层", "图片转述", "排名风险"],
    evidenceLevel: "C",
    ctaPattern: "争议讨论",
    reuseBoundary: "只能保留比较维度，删除未经核验的梯队结论"
  },
  {
    sampleId: "edu-m-03",
    hookPattern: "旧数据求证型",
    structureTags: ["年份标签", "表格证据", "真实性追问"],
    evidenceLevel: "混合",
    ctaPattern: "求证/补充数据",
    reuseBoundary: "历史数据只能做对照，不能替代当年政策"
  },
  {
    sampleId: "edu-m-04",
    hookPattern: "城市话题型",
    structureTags: ["地域标签", "泛话题", "弱选题关联"],
    evidenceLevel: "C",
    ctaPattern: "泛互动",
    reuseBoundary: "只在与升学任务有明确关联时使用地域标签"
  },
  {
    sampleId: "edu-m-05",
    hookPattern: "预测比较型",
    structureTags: ["考试节点", "横向比较", "预测风险"],
    evidenceLevel: "C",
    ctaPattern: "评论区投票",
    reuseBoundary: "不把模考感受写成录取预测"
  },
  {
    sampleId: "edu-m-06",
    hookPattern: "暑假焦虑型",
    structureTags: ["时间压力", "个人建议", "效果暗示"],
    evidenceLevel: "C",
    ctaPattern: "收藏计划",
    reuseBoundary: "避免制造掉队焦虑，改用可执行任务清单"
  },
  {
    sampleId: "edu-m-07",
    hookPattern: "人物比较型",
    structureTags: ["学生标签", "跨阶段比较", "标签风险"],
    evidenceLevel: "C",
    ctaPattern: "评论分享案例",
    reuseBoundary: "不对未授权学生做能力或学校标签判断"
  },
  {
    sampleId: "edu-m-08",
    hookPattern: "路径选择型",
    structureTags: ["升学分流", "政策解释", "路径对照"],
    evidenceLevel: "混合",
    ctaPattern: "领取路径表",
    reuseBoundary: "涉及政策与年份的内容必须重新核验"
  },
  {
    sampleId: "edu-m-09",
    hookPattern: "家庭规划型",
    structureTags: ["家庭场景", "目标拆分", "压力表达"],
    evidenceLevel: "C",
    ctaPattern: "评论区交流",
    reuseBoundary: "保留规划方法，删除过度比较和焦虑措辞"
  },
  {
    sampleId: "edu-m-10",
    hookPattern: "区域比较型",
    structureTags: ["地域对照", "学校讨论", "排名风险"],
    evidenceLevel: "C",
    ctaPattern: "补充区域情况",
    reuseBoundary: "改为公开维度对比，不生成学校梯队榜单"
  }
];

export const educationAcceptanceCases: EducationAcceptanceCase[] = [
  {
    id: "acceptance-household-whitepaper",
    title: "房户一致白皮书｜4页",
    topic: "房户一致分析",
    hook: "白皮书",
    pageCount: 4,
    deliverables: ["封面", "四项信息自查", "区级个案边界", "行动卡"],
    sourceIds: ["sjz-edu-2026-compulsory-plan", "sjz-qa-2026-gaoxin-household"],
    passedChecks: ["标题不超过20字", "个案已标注不可外推", "结论绑定来源", "评论区不收手机号"],
    openChecks: ["发布前复核目标区县补充通知"]
  },
  {
    id: "acceptance-school-comparison-table",
    title: "学校对比校情表｜5页",
    topic: "学校排名",
    hook: "校情表",
    pageCount: 5,
    deliverables: ["封面", "非官方声明", "五维校情表", "A/B/C证据等级", "家庭匹配卡"],
    sourceIds: ["sjz-edu-2026-compulsory-plan", "sjz-edu-2026-sunshine"],
    passedChecks: ["未输出综合排名", "未使用保进结论", "每项保留年份字段", "不把家长体验当官方事实"],
    openChecks: ["补充目标学校公开招生信息后再发布"]
  },
  {
    id: "acceptance-registration-self-test",
    title: "报名教程政策自测｜5页",
    topic: "报名教程",
    hook: "入学测真题",
    pageCount: 5,
    deliverables: ["封面", "官方入口", "区域与类别", "提交检查", "3题政策理解自测"],
    sourceIds: ["sjz-edu-2026-collection", "sjz-edu-2026-primary-tutorial", "sjz-edu-2026-shimin"],
    passedChecks: ["已标注非学校考试真题", "入口来自官方页面", "异常求助路径完整", "不承诺录取结果"],
    openChecks: ["上线当天重新确认报名入口和时间"]
  }
];

const bilibiliAccountUrl = "https://space.bilibili.com/3546936344840538";

export const esportsCompetitorVideos: CompetitorSample[] = [
  ["BV1hJNB6rEMQ", "为什么星火是全站知名度最高的CS俱乐部？", 48],
  ["BV1gfMp66EJT", "有那么多信任我们的客户 却输给了同行举报！致歉！", 77],
  ["BV17kVJ6WEba", "当两个魔王S演傻子整蛊陪玩", 580],
  ["BV1st5t6ZEDe", "被爱的人不用道歉", 23],
  ["BV1Xq5J6SEyV", "你以为我只带你一个妹吗？", 20],
  ["BV1V9dABuEvz", "我们一般管这个叫约会", 18],
  ["BV1yCRxBnEYs", "你当我龙吗！", 23],
  ["BV1YoRkB2E4B", "你转身就走的样子让我好狼狈", 25],
  ["BV1tiRqBREWA", "女友的惩罚", 20],
  ["BV1Mc9dBBEsL", "受害者发言", 40],
  ["BV15hREBjEsG", "舔狗的自觉", 18],
  ["BV1zWRuBFEMH", "我和男朋友说话你害羞什么", 17],
  ["BV1Yy98BVEvR", "你退半步的动作认真的吗？", 22],
  ["BV14G9DBREZk", "你的关心像毒药", 19],
  ["BV1u39rBvEZ2", "妈呀大姐", 24],
  ["BV1LJoBBVEaE", "让魔王叫出那两个字", 19],
  ["BV19zoZBcEh2", "我不演了！", 26],
  ["BV1p9o9BNEVg", "都是妹子凭啥我打突破？！", 19],
  ["BV1r7QFBaEaC", "连着干31把CS仍意犹未尽", 41],
  ["BV1zBDsBcEm9", "没有售后也敢说自己是俱乐部？！", 27],
  ["BV1e3DLBZETq", "陪玩到底是怎么定价的？学会不再当冤种！", 110],
  ["BV1mSuozmEFG", "大一学生花两千块开CS陪玩店？", 99]
].map(([bvid, title, durationSec], index) => ({
  id: `bili-${String(index + 1).padStart(2, "0")}`,
  platform: "B站",
  category: "CS2",
  title: title as string,
  url: `${bilibiliAccountUrl}/video/${bvid}`,
  durationSec: durationSec as number,
  observedAt: "2026-07-17",
  transcriptStatus: "burned-in-no-track",
  riskFlags: String(title).includes("魔王") ? ["rank-label-needs-context"] : []
}));

export const safeServicePackages: ServicePackage[] = [
  {
    id: "cs-companion",
    game: "CS2",
    name: "分段陪玩咨询",
    category: "陪玩",
    description: "按平台分段、陪玩类型、人数和时段匹配；原始价目矩阵排版错位，必须由客服复核具体单价。",
    priceLabel: "原表约20–120元/局，具体档位待人工确认",
    manualConfirmation: true,
    riskFlags: ["source-table-ambiguous", "no-win-promise"]
  },
  {
    id: "cs-demo-review",
    game: "CS2",
    name: "跑图 / 看 Demo",
    category: "复盘",
    description: "仅做地图讲解和对局复盘，不操作用户账号，不承诺段位或胜率。",
    priceLabel: "原表25–60元，按人员等级人工确认",
    manualConfirmation: true,
    riskFlags: ["no-rank-promise"]
  },
  {
    id: "cs-duel",
    game: "CS2",
    name: "娱乐单挑",
    category: "陪玩",
    description: "娱乐对局服务，开始前确认地图、时长与边界。",
    priceLabel: "原表10元/局，需人工确认",
    manualConfirmation: true,
    riskFlags: []
  },
  {
    id: "cs-multi-add-on",
    game: "CS2",
    name: "一陪多加项",
    category: "加项",
    description: "多一名共同参与者的加项，最终人数与排班由客服确认。",
    priceLabel: "+10元/局；加时赛+5元/轮",
    manualConfirmation: true,
    riskFlags: []
  },
  {
    id: "delta-themed",
    game: "三角洲行动",
    name: "特色挑战咨询",
    category: "特色挑战",
    description: "可咨询鼠鼠撤离、同干员组队、身份牌或收集类挑战；不作必出物资、必撤离或固定收益承诺。",
    priceLabel: "原表项目多且部分OCR错位，统一人工报价",
    manualConfirmation: true,
    riskFlags: ["remove-outcome-guarantee", "source-table-ambiguous"]
  },
  {
    id: "after-sale",
    game: "CS2",
    name: "售后说明",
    category: "加项",
    description: "结单后24小时内受理服务体验问题；外挂、代练、账号操作等请求直接拒绝。",
    priceLabel: "不单独计费",
    manualConfirmation: false,
    riskFlags: ["human-handoff-for-dispute"]
  }
];

export const excludedServiceTerms = ["代练", "代打", "外挂", "DMA", "账号交易", "包赢", "胜率赔付"] as const;

export const researchMeta = {
  education: {
    sourceSheets: ["小升初对标内容", "初升高竞品分析"],
    rawRows: { primary: 33, middle: 46 },
    bundledSamples: educationCompetitorSamples.length,
    privacyNote: "飞书原始CSV仅存放在data/private，不进入公开构建；公开样本只保留链接、题型和风险标签。"
  },
  esports: {
    accountName: "CS2星火电竞",
    accountUrl: bilibiliAccountUrl,
    observedAt: "2026-07-17",
    captionNote: "抽检视频未提供B站机器可读字幕轨；画面烧录字幕不能视为已取得文本。"
  }
};
