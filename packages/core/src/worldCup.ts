import type { Formation, LineupValidation, MatchAnalysis, Player, TeamStats } from "@portfolio/contracts";

export const formationRules: Record<Formation, Record<Player["position"], number>> = {
  "4-3-3": { GK: 1, DF: 4, MF: 3, FW: 3 },
  "4-4-2": { GK: 1, DF: 4, MF: 4, FW: 2 },
  "3-5-2": { GK: 1, DF: 3, MF: 5, FW: 2 }
};

export function teamScore(team: TeamStats): number {
  return Number((team.strength * 0.4 + team.recentForm * 0.3 + team.goalDifference * 0.2 + team.headToHead * 0.1).toFixed(1));
}

export function analyzeMatch(home: TeamStats, away: TeamStats): MatchAnalysis {
  const homeScore = teamScore(home);
  const awayScore = teamScore(away);
  const delta = homeScore - awayScore;
  const draw = Math.max(18, Math.min(30, 26 - Math.abs(delta) * 0.6));
  const remaining = 100 - draw;
  const homeShare = 1 / (1 + Math.exp(-delta / 7));
  const homeWin = Number((remaining * homeShare).toFixed(1));
  const awayWin = Number((100 - draw - homeWin).toFixed(1));
  const strongestKey = [
    ["实力排名", home.strength - away.strength],
    ["最近5场状态", home.recentForm - away.recentForm],
    ["最近5场净胜球", home.goalDifference - away.goalDifference],
    ["历史交锋", home.headToHead - away.headToHead]
  ].sort((a, b) => Math.abs(Number(b[1])) - Math.abs(Number(a[1])))[0];
  return {
    home,
    away,
    score: { home: homeScore, away: awayScore },
    probability: { homeWin, draw: Number(draw.toFixed(1)), awayWin },
    factors: [`最大差异项：${strongestKey[0]}`, `综合分差：${Math.abs(delta).toFixed(1)}`, `数据更新时间：${home.updatedAt}`],
    report: `${home.name}综合分${homeScore}，${away.name}综合分${awayScore}。模型据固定权重与演示概率映射，给出主胜${homeWin}%、平局${draw.toFixed(1)}%、客胜${awayWin}%。`,
    method: "综合分 = 40%实力排名 + 30%最近5场状态 + 20%最近5场净胜球 + 10%历史交锋；概率为演示映射。",
    disclaimer: "仅用于产品功能演示，不构成投注建议。"
  };
}

export function validateLineup(formation: Formation, selected: Player[], captainId: string): LineupValidation {
  const errors: string[] = [];
  const cost = selected.reduce((sum, player) => sum + player.cost, 0);
  const rules = formationRules[formation];
  if (selected.length !== 11) errors.push("必须选择11名球员");
  (Object.keys(rules) as Player["position"][]).forEach((position) => {
    const actual = selected.filter((player) => player.position === position).length;
    if (actual !== rules[position]) errors.push(`${position}需要${rules[position]}人，当前${actual}人`);
  });
  if (cost > 100) errors.push(`预算超出${cost - 100}点`);
  if (!captainId || !selected.some((player) => player.id === captainId)) errors.push("请选择阵容中的1名核心球星");
  if (new Set(selected.map((player) => player.id)).size !== selected.length) errors.push("不能重复选择球员");
  return { valid: errors.length === 0, cost, errors };
}
