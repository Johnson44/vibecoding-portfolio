export type DataMode = "demo" | "research" | "cloud";

export interface SourceReference {
  title: string;
  publisher: string;
  publishedAt: string;
  url?: string;
  verified: boolean;
}

export type VerificationStatus = "verified" | "historical" | "needs-human-check";

export interface CompetitorSample {
  id: string;
  platform: "小红书" | "视频号" | "抖音" | "B站";
  category: "小升初" | "初升高" | "CS2" | "三角洲行动";
  title: string;
  body?: string;
  url: string;
  durationSec?: number;
  observedAt?: string;
  transcriptStatus?: "provided" | "burned-in-no-track" | "not-required";
  riskFlags: string[];
}

export interface EducationSampleAnnotation {
  sampleId: string;
  hookPattern: string;
  structureTags: string[];
  evidenceLevel: "A" | "B" | "C" | "混合";
  ctaPattern: string;
  reuseBoundary: string;
}

export interface EducationAcceptanceCase {
  id: string;
  title: string;
  topic: EducationTopic;
  hook: EducationHook;
  pageCount: number;
  deliverables: string[];
  sourceIds: string[];
  passedChecks: string[];
  openChecks: string[];
}

export interface PolicySource {
  id: string;
  title: string;
  publisher: string;
  publishedAt: string;
  url: string;
  scope: string;
  status: VerificationStatus;
  keyFacts: string[];
}

export interface ServicePackage {
  id: string;
  game: "CS2" | "三角洲行动";
  name: string;
  category: "陪玩" | "复盘" | "加项" | "特色挑战";
  description: string;
  priceLabel: string;
  manualConfirmation: boolean;
  riskFlags: string[];
}

export type EducationTopic = "房户一致分析" | "入学材料准备" | "重大事件时间轴" | "学校排名" | "摇号解析" | "报名教程";
export type EducationHook = "白皮书" | "校情表" | "入学测真题";

export interface EducationAgentInput {
  stage: "小升初" | "初升高";
  district: string;
  parentProfile: string;
  goal: "涨粉" | "互动" | "留资";
  accountTone: string;
  forbiddenExpressions: string[];
  topic?: EducationTopic;
  hook?: EducationHook;
  competitorSamples?: CompetitorSample[];
  policySources?: PolicySource[];
}

export interface ContentCard {
  page: number;
  headline: string;
  body: string;
  layoutHint: string;
}

export interface EducationContentPlan {
  id: string;
  topic: EducationTopic;
  hook: EducationHook;
  title: string;
  cover: { primary: string; secondary: string };
  insight: string;
  cards: ContentCard[];
  postBody: string;
  tags: string[];
  cta: string;
  comments: string[];
  privateMessages: string[];
  leadRules: Array<{ level: "A" | "B" | "C"; signal: string; reply: string }>;
  sources: SourceReference[];
  manualChecks: string[];
}

export interface EducationAgentOutput {
  title: string;
  cover: { primary: string; secondary: string };
  insight: string;
  cards: ContentCard[];
  postBody: string;
  tags: string[];
  cta: string;
  comments: string[];
  privateMessages: string[];
  leadRules: Array<{ level: "A" | "B" | "C"; signal: string; reply: string }>;
  sources: SourceReference[];
  manualChecks: string[];
  materialStats: {
    competitorCount: number;
    policyCount: number;
    verifiedPolicyCount: number;
    annotatedSampleCount: number;
    acceptanceCaseCount: number;
  };
  contentRisks: string[];
  topicIdeas: Array<{ topic: EducationTopic; angle: string; recommendedPages: number }>;
  plans: EducationContentPlan[];
  revisionNotes: Array<{ draft: string; revision: string; reason: string }>;
  failureCases: Array<{ input: string; blockedOutput: string; fallback: string }>;
  mode: DataMode;
}

export interface EsportsAgentInput {
  game: "CS2" | "三角洲行动";
  persona: string;
  audience: string;
  goal: "咨询" | "下单" | "复购";
  subtitleText?: string;
  competitorVideos?: CompetitorSample[];
  servicePackages?: ServicePackage[];
}

export interface VideoShot {
  time: string;
  narration: string;
  visual: string;
  subtitle: string;
  transition: string;
}

export interface EsportsAgentOutput {
  topics: string[];
  scripts: Array<{
    title: string;
    duration: number;
    hook: string;
    shots: VideoShot[];
  }>;
  packageSuggestion: string;
  quoteTemplate: string;
  operationSop: string[];
  humanHandoff: string[];
  sourceInsights: string[];
  complianceWarnings: string[];
  materialStats: {
    competitorCount: number;
    captionTrackCount: number;
    safePackageCount: number;
  };
  mode: DataMode;
}

export type ViralPlatform = "小红书" | "抖音" | "视频号" | "B站" | "公众号";
export type ViralGoal = "拆解" | "仿写" | "复盘";

export interface ViralAgentInput {
  platform: ViralPlatform;
  title: string;
  contentUrl?: string;
  content: string;
  goal: ViralGoal;
}

export interface ViralProcessStep {
  id: "capture" | "hook" | "structure" | "rewrite" | "safety";
  label: string;
  status: "completed" | "needs-input";
  summary: string;
  evidence: string[];
}

export interface ViralAgentOutput {
  source: {
    platform: ViralPlatform;
    title: string;
    contentUrl?: string;
    contentLength: number;
    evidenceStatus: "title-only" | "text-provided";
    metricsStatus: "not-provided" | "provided";
  };
  process: ViralProcessStep[];
  hook: {
    type: string;
    pattern: string;
    evidence: string;
    boundary: string;
  };
  structure: Array<{
    stage: string;
    role: string;
    observation: string;
    takeaway: string;
  }>;
  rewritePlan: {
    titles: string[];
    outline: string[];
    originalityRules: string[];
  };
  riskFlags: string[];
  nextActions: string[];
  mode: DataMode;
}

export interface Dish {
  id: string;
  name: string;
  category: "主食" | "蛋白" | "蔬菜" | "饮品";
  price: number;
  calories: number;
  tags: string[];
  allergens: string[];
}

export interface MealPreference {
  goal: "均衡" | "高蛋白" | "低负担";
  budget: number;
  flavors: string[];
  exclusions: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  dishes: Dish[];
  totalPrice: number;
  totalCalories: number;
  reason: string;
  allergenNotice: string;
}

export interface TeamStats {
  id: string;
  name: string;
  strength: number;
  recentForm: number;
  goalDifference: number;
  headToHead: number;
  updatedAt: string;
}

export interface MatchAnalysis {
  home: TeamStats;
  away: TeamStats;
  score: { home: number; away: number };
  probability: { homeWin: number; draw: number; awayWin: number };
  factors: string[];
  report: string;
  method: string;
  disclaimer: string;
}

export type Formation = "4-3-3" | "4-4-2" | "3-5-2";
export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  cost: number;
  rating: number;
}

export interface Lineup {
  id: string;
  nickname: string;
  slogan: string;
  formation: Formation;
  playerIds: string[];
  captainId: string;
  createdAt: string;
  likes: number;
}

export interface LineupValidation {
  valid: boolean;
  cost: number;
  errors: string[];
}

export type ApiAction =
  | "educationAgent"
  | "esportsAgent"
  | "viralAgent"
  | "generateMealPlan"
  | "analyzeMatch"
  | "createLineup"
  | "publishLineup"
  | "likeLineup";

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
  meta: { mode: DataMode; requestId: string; generatedAt: string };
}
