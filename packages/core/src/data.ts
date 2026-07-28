import type { Dish, Player, TeamStats } from "@portfolio/contracts";
import { worldCupTeams } from "./worldCupTournament";

export const dishes: Dish[] = [
  { id: "d1", name: "糙米饭", category: "主食", price: 6, calories: 210, tags: ["均衡", "低负担"], allergens: [] },
  { id: "d2", name: "玉米南瓜", category: "主食", price: 7, calories: 160, tags: ["低负担"], allergens: [] },
  { id: "d3", name: "全麦意面", category: "主食", price: 9, calories: 240, tags: ["均衡"], allergens: ["麸质"] },
  { id: "d4", name: "藜麦饭", category: "主食", price: 10, calories: 190, tags: ["高蛋白", "均衡"], allergens: [] },
  { id: "d5", name: "香煎鸡胸", category: "蛋白", price: 18, calories: 220, tags: ["高蛋白", "均衡"], allergens: [] },
  { id: "d6", name: "黑椒牛肉", category: "蛋白", price: 22, calories: 280, tags: ["高蛋白"], allergens: ["大豆"] },
  { id: "d7", name: "柠香巴沙鱼", category: "蛋白", price: 20, calories: 190, tags: ["高蛋白", "低负担"], allergens: ["鱼类"] },
  { id: "d8", name: "香菇豆腐", category: "蛋白", price: 14, calories: 180, tags: ["均衡", "低负担"], allergens: ["大豆"] },
  { id: "d9", name: "水煮蛋", category: "蛋白", price: 4, calories: 75, tags: ["高蛋白"], allergens: ["蛋类"] },
  { id: "d10", name: "西兰花", category: "蔬菜", price: 8, calories: 65, tags: ["均衡", "低负担"], allergens: [] },
  { id: "d11", name: "烤时蔬", category: "蔬菜", price: 9, calories: 90, tags: ["均衡"], allergens: [] },
  { id: "d12", name: "凉拌秋葵", category: "蔬菜", price: 8, calories: 55, tags: ["低负担"], allergens: ["芝麻"] },
  { id: "d13", name: "菠菜菌菇", category: "蔬菜", price: 9, calories: 70, tags: ["均衡", "低负担"], allergens: [] },
  { id: "d14", name: "紫甘蓝沙拉", category: "蔬菜", price: 10, calories: 85, tags: ["低负担"], allergens: [] },
  { id: "d15", name: "无糖豆浆", category: "饮品", price: 6, calories: 85, tags: ["高蛋白"], allergens: ["大豆"] },
  { id: "d16", name: "柠檬气泡水", category: "饮品", price: 6, calories: 5, tags: ["低负担"], allergens: [] },
  { id: "d17", name: "低脂酸奶", category: "饮品", price: 8, calories: 110, tags: ["均衡"], allergens: ["乳制品"] },
  { id: "d18", name: "美式咖啡", category: "饮品", price: 8, calories: 10, tags: ["低负担"], allergens: [] },
  { id: "d19", name: "鹰嘴豆泥", category: "蛋白", price: 12, calories: 150, tags: ["高蛋白", "均衡"], allergens: ["芝麻"] },
  { id: "d20", name: "鲜果杯", category: "蔬菜", price: 12, calories: 120, tags: ["均衡"], allergens: [] }
];

export const teams: TeamStats[] = [
  { id: "arg", name: "阿根廷", strength: 92, recentForm: 88, goalDifference: 84, headToHead: 78, updatedAt: "2026-07-01" },
  { id: "fra", name: "法国", strength: 91, recentForm: 85, goalDifference: 82, headToHead: 80, updatedAt: "2026-07-01" },
  { id: "esp", name: "西班牙", strength: 90, recentForm: 91, goalDifference: 86, headToHead: 76, updatedAt: "2026-07-01" },
  { id: "eng", name: "英格兰", strength: 88, recentForm: 82, goalDifference: 78, headToHead: 74, updatedAt: "2026-07-01" },
  { id: "bra", name: "巴西", strength: 89, recentForm: 79, goalDifference: 80, headToHead: 82, updatedAt: "2026-07-01" },
  { id: "ger", name: "德国", strength: 86, recentForm: 84, goalDifference: 76, headToHead: 79, updatedAt: "2026-07-01" },
  { id: "por", name: "葡萄牙", strength: 87, recentForm: 86, goalDifference: 81, headToHead: 73, updatedAt: "2026-07-01" },
  { id: "ned", name: "荷兰", strength: 85, recentForm: 83, goalDifference: 77, headToHead: 75, updatedAt: "2026-07-01" }
];

const additionalTeamStrength: Record<string, number> = {
  mex: 84, rsa: 68, kor: 76, cze: 74,
  sui: 82, can: 79, bih: 70, qat: 65,
  mar: 83, sco: 73, hai: 56,
  usa: 82, aus: 75, par: 77, tur: 78,
  civ: 72, ecu: 75, cuw: 65,
  jpn: 78, swe: 80, tun: 66,
  bel: 84, egy: 72, irn: 73, nzl: 62,
  cpv: 68, uru: 82, ksa: 64,
  nor: 80, sen: 79, irq: 63,
  aut: 80, alg: 72, jor: 64,
  col: 84, cod: 65, uzb: 70,
  cro: 85, gha: 71, pan: 67
};

const existingTeamIds = new Set(teams.map((team) => team.id));
teams.push(...worldCupTeams.filter((team) => !existingTeamIds.has(team.id)).map((team, index) => {
  const strength = additionalTeamStrength[team.id] ?? 68;
  return {
    id: team.id,
    name: team.name,
    strength,
    recentForm: Math.max(52, Math.min(91, strength + ((index * 7) % 9) - 4)),
    goalDifference: Math.max(50, Math.min(90, strength + ((index * 5) % 11) - 5)),
    headToHead: Math.max(48, Math.min(88, strength + ((index * 3) % 9) - 4)),
    updatedAt: "2026-07-01"
  };
}));

const names: Record<string, string[]> = {
  arg: ["马丁内斯", "莫利纳", "罗梅罗", "奥塔门迪", "塔利亚菲科", "德保罗", "麦卡利斯特", "恩佐", "梅西", "阿尔瓦雷斯", "劳塔罗"],
  fra: ["迈尼昂", "孔德", "萨利巴", "于帕梅卡诺", "特奥", "楚阿梅尼", "卡马文加", "格列兹曼", "登贝莱", "姆巴佩", "图拉姆"],
  esp: ["西蒙", "卡瓦哈尔", "勒诺尔芒", "拉波尔特", "库库雷利亚", "罗德里", "佩德里", "奥尔莫", "亚马尔", "莫拉塔", "尼科"],
  eng: ["皮克福德", "沃克", "斯通斯", "格伊", "肖", "赖斯", "贝林厄姆", "帕尔默", "萨卡", "凯恩", "福登"],
  bra: ["阿利松", "达尼洛", "马尔基尼奥斯", "加布里埃尔", "阿拉纳", "吉马良斯", "帕奎塔", "罗德里戈", "拉菲尼亚", "维尼修斯", "恩德里克"],
  ger: ["特尔施特根", "基米希", "吕迪格", "塔", "劳姆", "安德里希", "格雷茨卡", "穆西亚拉", "维尔茨", "哈弗茨", "萨内"],
  por: ["科斯塔", "坎塞洛", "迪亚斯", "伊纳西奥", "门德斯", "帕利尼亚", "B席", "B费", "莱奥", "若塔", "C罗"],
  ned: ["弗莱肯", "邓弗里斯", "范戴克", "德里赫特", "阿克", "德容", "赖因德斯", "西蒙斯", "加克波", "德佩", "马伦"]
};

const positions = ["GK", "DF", "DF", "DF", "DF", "MF", "MF", "MF", "FW", "FW", "FW"] as const;

export const players: Player[] = teams.filter((team) => names[team.id]).flatMap((team, teamIndex) =>
  names[team.id].map((name, index) => ({
    id: `${team.id}-${index + 1}`,
    name,
    team: team.name,
    position: positions[index],
    cost: Math.min(15, 5 + ((teamIndex * 2 + index) % 9)),
    rating: 75 + ((teamIndex * 3 + index * 2) % 18)
  }))
);
