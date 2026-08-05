export type MenuCategory = "荤菜" | "素菜" | "凉菜" | "主食";

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  enabled?: boolean;
};

export const menuCategories: MenuCategory[] = ["荤菜", "素菜", "凉菜", "主食"];

export const menuItems: MenuItem[] = [
  { id: "meat-01", name: "葱爆羊肉", category: "荤菜" },
  { id: "meat-02", name: "辣椒炒肉", category: "荤菜" },
  { id: "meat-03", name: "蒜苔炒肉", category: "荤菜" },
  { id: "meat-04", name: "红烧牛肉", category: "荤菜" },
  { id: "meat-05", name: "红烧排骨", category: "荤菜" },
  { id: "meat-06", name: "可乐鸡翅", category: "荤菜" },
  { id: "meat-07", name: "鱼香肉丝", category: "荤菜" },
  { id: "meat-08", name: "孜然羊肉", category: "荤菜" },
  { id: "meat-09", name: "宫保鸡丁", category: "荤菜" },
  { id: "meat-10", name: "盐焗虾", category: "荤菜" },
  { id: "meat-11", name: "炸鸡腿", category: "荤菜" },
  { id: "meat-12", name: "炸鸡块", category: "荤菜" },
  { id: "meat-13", name: "酱牛肉", category: "荤菜" },
  { id: "meat-14", name: "酱肘子", category: "荤菜" },
  { id: "meat-15", name: "酱猪肝", category: "荤菜" },
  { id: "veg-01", name: "苦瓜炒鸡蛋", category: "素菜" },
  { id: "veg-02", name: "黄瓜炒鸡蛋", category: "素菜" },
  { id: "veg-03", name: "辣椒炒鸡蛋", category: "素菜" },
  { id: "veg-04", name: "西红柿炒鸡蛋", category: "素菜" },
  { id: "veg-05", name: "地三鲜", category: "素菜" },
  { id: "veg-06", name: "炒合菜", category: "素菜" },
  { id: "veg-07", name: "香菇油菜", category: "素菜" },
  { id: "veg-08", name: "水煮西兰花", category: "素菜" },
  { id: "meat-16", name: "水煮虾仁", category: "荤菜" },
  { id: "veg-10", name: "豆角炒肉", category: "素菜" },
  { id: "veg-11", name: "白菜豆腐", category: "素菜" },
  { id: "veg-12", name: "炒芦笋", category: "素菜" },
  { id: "veg-13", name: "土豆丝", category: "素菜" },
  { id: "veg-14", name: "肉末豆腐", category: "素菜" },
  { id: "cold-01", name: "荆芥拍黄瓜", category: "凉菜" },
  { id: "cold-02", name: "小葱拌豆腐", category: "凉菜" },
  { id: "staple-01", name: "炒米饭", category: "主食" },
  { id: "staple-02", name: "煮方便面", category: "主食" },
  { id: "staple-03", name: "炒河粉", category: "主食" },
  { id: "staple-04", name: "炒饼", category: "主食" },
  { id: "staple-05", name: "炒米饭", category: "主食" },
  { id: "staple-06", name: "饺子", category: "主食" },
  { id: "staple-07", name: "米饭", category: "主食" },
  { id: "staple-08", name: "打卤面", category: "主食" },
  { id: "staple-09", name: "馅饼", category: "主食" },
  { id: "staple-10", name: "炒馍", category: "主食" },
  { id: "staple-11", name: "煎饼", category: "主食" },
];
