export type TournamentStage = "小组赛" | "32强赛" | "16强赛" | "1/4决赛" | "半决赛" | "季军赛" | "决赛";

export interface WorldCupTeam {
  id: string;
  name: string;
  group: string;
  code: string;
  flag: string;
}

export interface WorldCupFixture {
  id: string;
  date: string;
  kickoff: string;
  stage: TournamentStage;
  group?: string;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  venue: string;
  note?: string;
  homePenalties?: number;
  awayPenalties?: number;
}

export interface WorldCupStanding {
  rank: number;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

const teamRows: Array<[string, string, string, string, string]> = [
  ["mex", "墨西哥", "A组", "MEX", "🇲🇽"], ["rsa", "南非", "A组", "RSA", "🇿🇦"], ["kor", "韩国", "A组", "KOR", "🇰🇷"], ["cze", "捷克", "A组", "CZE", "🇨🇿"],
  ["sui", "瑞士", "B组", "SUI", "🇨🇭"], ["can", "加拿大", "B组", "CAN", "🇨🇦"], ["bih", "波黑", "B组", "BIH", "🇧🇦"], ["qat", "卡塔尔", "B组", "QAT", "🇶🇦"],
  ["bra", "巴西", "C组", "BRA", "🇧🇷"], ["mar", "摩洛哥", "C组", "MAR", "🇲🇦"], ["sco", "苏格兰", "C组", "SCO", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"], ["hai", "海地", "C组", "HAI", "🇭🇹"],
  ["usa", "美国", "D组", "USA", "🇺🇸"], ["aus", "澳大利亚", "D组", "AUS", "🇦🇺"], ["par", "巴拉圭", "D组", "PAR", "🇵🇾"], ["tur", "土耳其", "D组", "TUR", "🇹🇷"],
  ["ger", "德国", "E组", "GER", "🇩🇪"], ["civ", "科特迪瓦", "E组", "CIV", "🇨🇮"], ["ecu", "厄瓜多尔", "E组", "ECU", "🇪🇨"], ["cuw", "库拉索", "E组", "CUW", "🇨🇼"],
  ["ned", "荷兰", "F组", "NED", "🇳🇱"], ["jpn", "日本", "F组", "JPN", "🇯🇵"], ["swe", "瑞典", "F组", "SWE", "🇸🇪"], ["tun", "突尼斯", "F组", "TUN", "🇹🇳"],
  ["bel", "比利时", "G组", "BEL", "🇧🇪"], ["egy", "埃及", "G组", "EGY", "🇪🇬"], ["irn", "伊朗", "G组", "IRN", "🇮🇷"], ["nzl", "新西兰", "G组", "NZL", "🇳🇿"],
  ["esp", "西班牙", "H组", "ESP", "🇪🇸"], ["cpv", "佛得角", "H组", "CPV", "🇨🇻"], ["uru", "乌拉圭", "H组", "URU", "🇺🇾"], ["ksa", "沙特阿拉伯", "H组", "KSA", "🇸🇦"],
  ["fra", "法国", "I组", "FRA", "🇫🇷"], ["nor", "挪威", "I组", "NOR", "🇳🇴"], ["sen", "塞内加尔", "I组", "SEN", "🇸🇳"], ["irq", "伊拉克", "I组", "IRQ", "🇮🇶"],
  ["arg", "阿根廷", "J组", "ARG", "🇦🇷"], ["aut", "奥地利", "J组", "AUT", "🇦🇹"], ["alg", "阿尔及利亚", "J组", "ALG", "🇩🇿"], ["jor", "约旦", "J组", "JOR", "🇯🇴"],
  ["col", "哥伦比亚", "K组", "COL", "🇨🇴"], ["por", "葡萄牙", "K组", "POR", "🇵🇹"], ["cod", "刚果（金）", "K组", "COD", "🇨🇩"], ["uzb", "乌兹别克斯坦", "K组", "UZB", "🇺🇿"],
  ["eng", "英格兰", "L组", "ENG", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"], ["cro", "克罗地亚", "L组", "CRO", "🇭🇷"], ["gha", "加纳", "L组", "GHA", "🇬🇭"], ["pan", "巴拿马", "L组", "PAN", "🇵🇦"]
];

export const worldCupTeams: WorldCupTeam[] = teamRows.map(([id, name, group, code, flag]) => ({ id, name, group, code, flag }));

export const worldCupTeamById = Object.fromEntries(worldCupTeams.map((team) => [team.id, team])) as Record<string, WorldCupTeam>;

const groupVenue = "美加墨世界杯官方赛场";

function match(
  id: number,
  date: string,
  kickoff: string,
  stage: TournamentStage,
  group: string | undefined,
  homeId: string,
  awayId: string,
  homeScore: number,
  awayScore: number,
  note?: string,
  homePenalties?: number,
  awayPenalties?: number
): WorldCupFixture {
  return { id: `wc-${String(id).padStart(3, "0")}`, date, kickoff, stage, group, homeId, awayId, homeScore, awayScore, venue: groupVenue, note, homePenalties, awayPenalties };
}

export const worldCupFixtures: WorldCupFixture[] = [
  // 小组赛：72 场，按比赛日顺序排列
  match(1, "2026-06-11", "15:00 ET", "小组赛", "A组", "mex", "rsa", 2, 0),
  match(2, "2026-06-11", "22:00 ET", "小组赛", "A组", "kor", "cze", 2, 1),
  match(3, "2026-06-12", "15:00 ET", "小组赛", "B组", "can", "bih", 1, 1),
  match(4, "2026-06-12", "21:00 ET", "小组赛", "D组", "usa", "par", 4, 1),
  match(5, "2026-06-13", "18:00 ET", "小组赛", "C组", "bra", "mar", 1, 1),
  match(6, "2026-06-13", "15:00 ET", "小组赛", "B组", "qat", "sui", 1, 1),
  match(7, "2026-06-13", "21:00 ET", "小组赛", "C组", "hai", "sco", 0, 1),
  match(8, "2026-06-14", "13:00 ET", "小组赛", "E组", "ger", "cuw", 7, 1),
  match(9, "2026-06-14", "00:00 ET", "小组赛", "D组", "aus", "tur", 2, 0),
  match(10, "2026-06-14", "15:00 ET", "小组赛", "F组", "ned", "jpn", 2, 2),
  match(11, "2026-06-14", "19:00 ET", "小组赛", "E组", "civ", "ecu", 1, 0),
  match(12, "2026-06-14", "20:00 ET", "小组赛", "F组", "swe", "tun", 5, 1),
  match(13, "2026-06-15", "12:00 ET", "小组赛", "G组", "bel", "egy", 1, 1),
  match(14, "2026-06-15", "12:00 ET", "小组赛", "H组", "esp", "cpv", 0, 0),
  match(15, "2026-06-15", "18:00 ET", "小组赛", "H组", "ksa", "uru", 1, 1),
  match(16, "2026-06-15", "18:00 ET", "小组赛", "G组", "irn", "nzl", 2, 2),
  match(17, "2026-06-16", "15:00 ET", "小组赛", "I组", "fra", "sen", 3, 1),
  match(18, "2026-06-16", "18:00 ET", "小组赛", "I组", "irq", "nor", 1, 4),
  match(19, "2026-06-16", "20:00 ET", "小组赛", "J组", "arg", "alg", 3, 0),
  match(20, "2026-06-16", "21:00 ET", "小组赛", "J组", "aut", "jor", 3, 1),
  match(21, "2026-06-17", "12:00 ET", "小组赛", "K组", "por", "cod", 1, 1),
  match(22, "2026-06-17", "15:00 ET", "小组赛", "L组", "eng", "cro", 4, 2),
  match(23, "2026-06-17", "19:00 ET", "小组赛", "L组", "gha", "pan", 1, 0),
  match(24, "2026-06-17", "20:00 ET", "小组赛", "K组", "uzb", "col", 1, 3),
  match(25, "2026-06-18", "12:00 ET", "小组赛", "B组", "sui", "bih", 4, 1),
  match(26, "2026-06-18", "12:00 ET", "小组赛", "A组", "cze", "rsa", 1, 1),
  match(27, "2026-06-18", "15:00 ET", "小组赛", "B组", "can", "qat", 6, 0),
  match(28, "2026-06-18", "19:00 ET", "小组赛", "A组", "mex", "kor", 1, 0),
  match(29, "2026-06-19", "18:00 ET", "小组赛", "C组", "sco", "mar", 0, 1),
  match(30, "2026-06-19", "20:30 ET", "小组赛", "C组", "bra", "hai", 3, 0),
  match(31, "2026-06-19", "12:00 ET", "小组赛", "D组", "usa", "aus", 2, 0),
  match(32, "2026-06-19", "23:00 ET", "小组赛", "D组", "tur", "par", 0, 1),
  match(33, "2026-06-20", "16:00 ET", "小组赛", "E组", "ger", "civ", 2, 1),
  match(34, "2026-06-20", "20:00 ET", "小组赛", "E组", "ecu", "cuw", 0, 0),
  match(35, "2026-06-20", "13:00 ET", "小组赛", "F组", "ned", "swe", 5, 1),
  match(36, "2026-06-21", "00:00 ET", "小组赛", "F组", "tun", "jpn", 0, 4),
  match(37, "2026-06-21", "12:00 ET", "小组赛", "H组", "esp", "ksa", 4, 0),
  match(38, "2026-06-21", "15:00 ET", "小组赛", "G组", "bel", "irn", 0, 0),
  match(39, "2026-06-21", "18:00 ET", "小组赛", "H组", "uru", "cpv", 2, 2),
  match(40, "2026-06-21", "21:00 ET", "小组赛", "G组", "nzl", "egy", 1, 3),
  match(41, "2026-06-22", "13:00 ET", "小组赛", "J组", "arg", "aut", 2, 0),
  match(42, "2026-06-22", "17:00 ET", "小组赛", "I组", "fra", "irq", 3, 0),
  match(43, "2026-06-22", "20:00 ET", "小组赛", "I组", "nor", "sen", 3, 2),
  match(44, "2026-06-22", "23:00 ET", "小组赛", "J组", "jor", "alg", 1, 2),
  match(45, "2026-06-23", "13:00 ET", "小组赛", "K组", "por", "uzb", 5, 0),
  match(46, "2026-06-23", "16:00 ET", "小组赛", "L组", "eng", "gha", 0, 0),
  match(47, "2026-06-23", "19:00 ET", "小组赛", "L组", "pan", "cro", 0, 1),
  match(48, "2026-06-23", "22:00 ET", "小组赛", "K组", "col", "cod", 1, 0),
  match(49, "2026-06-24", "15:00 ET", "小组赛", "B组", "bih", "qat", 3, 1),
  match(50, "2026-06-24", "15:00 ET", "小组赛", "B组", "sui", "can", 2, 1),
  match(51, "2026-06-24", "18:00 ET", "小组赛", "C组", "mar", "hai", 4, 2),
  match(52, "2026-06-24", "18:00 ET", "小组赛", "C组", "sco", "bra", 0, 3),
  match(53, "2026-06-24", "21:00 ET", "小组赛", "A组", "rsa", "kor", 1, 0),
  match(54, "2026-06-24", "21:00 ET", "小组赛", "A组", "cze", "mex", 0, 3),
  match(55, "2026-06-25", "16:00 ET", "小组赛", "E组", "ecu", "ger", 2, 1),
  match(56, "2026-06-25", "16:00 ET", "小组赛", "E组", "cuw", "civ", 0, 2),
  match(57, "2026-06-25", "19:00 ET", "小组赛", "F组", "tun", "ned", 1, 3),
  match(58, "2026-06-25", "19:00 ET", "小组赛", "F组", "jpn", "swe", 1, 1),
  match(59, "2026-06-25", "22:00 ET", "小组赛", "D组", "par", "aus", 0, 0),
  match(60, "2026-06-25", "22:00 ET", "小组赛", "D组", "tur", "usa", 3, 2),
  match(61, "2026-06-26", "15:00 ET", "小组赛", "I组", "sen", "irq", 5, 0),
  match(62, "2026-06-26", "15:00 ET", "小组赛", "I组", "nor", "fra", 1, 4),
  match(63, "2026-06-26", "20:00 ET", "小组赛", "H组", "uru", "esp", 0, 1),
  match(64, "2026-06-26", "20:00 ET", "小组赛", "H组", "cpv", "ksa", 0, 0),
  match(65, "2026-06-26", "23:00 ET", "小组赛", "G组", "nzl", "bel", 1, 5),
  match(66, "2026-06-26", "23:00 ET", "小组赛", "G组", "egy", "irn", 1, 1),
  match(67, "2026-06-27", "17:00 ET", "小组赛", "L组", "cro", "gha", 2, 1),
  match(68, "2026-06-27", "17:00 ET", "小组赛", "L组", "pan", "eng", 0, 2),
  match(69, "2026-06-27", "19:30 ET", "小组赛", "K组", "cod", "uzb", 3, 1),
  match(70, "2026-06-27", "19:30 ET", "小组赛", "K组", "col", "por", 0, 0),
  match(71, "2026-06-27", "22:00 ET", "小组赛", "J组", "jor", "arg", 1, 3),
  match(72, "2026-06-27", "22:00 ET", "小组赛", "J组", "alg", "aut", 3, 3),

  // 淘汰赛：32 强至决赛，共 32 场，比分均为最终赛果；括号内为点球结果
  match(73, "2026-06-28", "15:00 ET", "32强赛", undefined, "rsa", "can", 0, 1),
  match(74, "2026-06-29", "16:30 ET", "32强赛", undefined, "ger", "par", 1, 1, "点球 3:4", 3, 4),
  match(75, "2026-06-29", "21:00 ET", "32强赛", undefined, "ned", "mar", 1, 1, "点球 2:3", 2, 3),
  match(76, "2026-06-29", "13:00 ET", "32强赛", undefined, "bra", "jpn", 2, 1),
  match(77, "2026-06-30", "17:00 ET", "32强赛", undefined, "fra", "swe", 3, 0),
  match(78, "2026-06-30", "13:00 ET", "32强赛", undefined, "civ", "nor", 1, 2),
  match(79, "2026-06-30", "22:00 ET", "32强赛", undefined, "mex", "ecu", 2, 0),
  match(80, "2026-07-01", "12:00 ET", "32强赛", undefined, "eng", "cod", 2, 1),
  match(81, "2026-07-01", "20:00 ET", "32强赛", undefined, "usa", "bih", 2, 0),
  match(82, "2026-07-01", "16:00 ET", "32强赛", undefined, "bel", "sen", 3, 2),
  match(83, "2026-07-02", "19:00 ET", "32强赛", undefined, "por", "cro", 2, 1),
  match(84, "2026-07-02", "15:00 ET", "32强赛", undefined, "esp", "aut", 3, 0),
  match(85, "2026-07-02", "23:00 ET", "32强赛", undefined, "sui", "alg", 2, 0),
  match(86, "2026-07-03", "18:00 ET", "32强赛", undefined, "arg", "cpv", 3, 2),
  match(87, "2026-07-03", "14:00 ET", "32强赛", undefined, "aus", "egy", 1, 1, "点球 2:4", 2, 4),
  match(88, "2026-07-03", "21:30 ET", "32强赛", undefined, "col", "gha", 1, 0),
  match(89, "2026-07-04", "17:00 ET", "16强赛", undefined, "par", "fra", 0, 1),
  match(90, "2026-07-04", "13:00 ET", "16强赛", undefined, "can", "mar", 0, 3),
  match(91, "2026-07-05", "16:00 ET", "16强赛", undefined, "bra", "nor", 1, 2),
  match(92, "2026-07-05", "21:00 ET", "16强赛", undefined, "mex", "eng", 2, 3),
  match(93, "2026-07-06", "15:00 ET", "16强赛", undefined, "por", "esp", 0, 1),
  match(94, "2026-07-06", "20:00 ET", "16强赛", undefined, "usa", "bel", 1, 4),
  match(95, "2026-07-07", "12:00 ET", "16强赛", undefined, "arg", "egy", 3, 2),
  match(96, "2026-07-07", "16:00 ET", "16强赛", undefined, "sui", "col", 0, 0, "点球 4:3", 4, 3),
  match(97, "2026-07-09", "16:00 ET", "1/4决赛", undefined, "fra", "mar", 2, 0),
  match(98, "2026-07-10", "15:00 ET", "1/4决赛", undefined, "esp", "bel", 2, 1),
  match(99, "2026-07-11", "17:00 ET", "1/4决赛", undefined, "nor", "eng", 1, 2),
  match(100, "2026-07-11", "21:00 ET", "1/4决赛", undefined, "arg", "sui", 3, 1),
  match(101, "2026-07-14", "15:00 ET", "半决赛", undefined, "fra", "esp", 0, 2),
  match(102, "2026-07-15", "15:00 ET", "半决赛", undefined, "eng", "arg", 1, 2),
  match(103, "2026-07-18", "17:00 ET", "季军赛", undefined, "fra", "eng", 4, 6),
  match(104, "2026-07-19", "15:00 ET", "决赛", undefined, "esp", "arg", 1, 0)
];

export function buildWorldCupStandings(fixtures: WorldCupFixture[] = worldCupFixtures): Record<string, WorldCupStanding[]> {
  const groups = Object.fromEntries([...new Set(worldCupTeams.map((team) => team.group))].map((group) => [group, [] as WorldCupStanding[]])) as Record<string, WorldCupStanding[]>;
  for (const team of worldCupTeams) {
    const row: WorldCupStanding = { rank: 0, teamId: team.id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    groups[team.group].push(row);
  }
  const rowsByTeam = Object.fromEntries(Object.values(groups).flat().map((row) => [row.teamId, row])) as Record<string, WorldCupStanding>;
  for (const fixture of fixtures.filter((item) => item.stage === "小组赛")) {
    const home = rowsByTeam[fixture.homeId];
    const away = rowsByTeam[fixture.awayId];
    home.played += 1; away.played += 1;
    home.goalsFor += fixture.homeScore; home.goalsAgainst += fixture.awayScore;
    away.goalsFor += fixture.awayScore; away.goalsAgainst += fixture.homeScore;
    if (fixture.homeScore > fixture.awayScore) { home.won += 1; home.points += 3; away.lost += 1; }
    else if (fixture.homeScore < fixture.awayScore) { away.won += 1; away.points += 3; home.lost += 1; }
    else { home.drawn += 1; away.drawn += 1; home.points += 1; away.points += 1; }
  }
  for (const [group, rows] of Object.entries(groups)) {
    rows.forEach((row) => { row.goalDifference = row.goalsFor - row.goalsAgainst; });
    rows.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    rows.forEach((row, index) => { row.rank = index + 1; });
    groups[group] = rows;
  }
  return groups;
}

export const worldCupStandings = buildWorldCupStandings();

export const worldCupSources = {
  format: "https://www.sport.gov.cn/n20001280/n20067662/n20067613/c25342613/content.html",
  standings: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/final-tournament-standings",
  fixtures: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums"
};
