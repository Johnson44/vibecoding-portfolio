import type { Dish, MealPlan, MealPreference } from "@portfolio/contracts";
import { dishes } from "./data";

const categories: Dish["category"][] = ["主食", "蛋白", "蔬菜", "饮品"];

function buildCandidate(preference: MealPreference, offset: number): Dish[] {
  const allowed = dishes.filter((dish) => !dish.allergens.some((item) => preference.exclusions.includes(item)));
  return categories.flatMap((category, index) => {
    const matches = allowed.filter((dish) => dish.category === category && dish.tags.includes(preference.goal));
    const fallback = allowed.filter((dish) => dish.category === category);
    const pool = matches.length ? matches : fallback;
    return pool.length ? [pool[(offset + index) % pool.length]] : [];
  });
}

export function generateMealPlans(preference: MealPreference): MealPlan[] {
  return [0, 1, 2].map((offset) => {
    let selected = buildCandidate(preference, offset);
    while (selected.reduce((sum, dish) => sum + dish.price, 0) > preference.budget && selected.length > 2) {
      selected = selected.slice(0, -1);
    }
    const allergens = [...new Set(selected.flatMap((dish) => dish.allergens))];
    return {
      id: `plan-${offset + 1}`,
      name: ["均衡首选", "风味替换", "预算友好"][offset],
      dishes: selected,
      totalPrice: selected.reduce((sum, dish) => sum + dish.price, 0),
      totalCalories: selected.reduce((sum, dish) => sum + dish.calories, 0),
      reason: `围绕“${preference.goal}”组合，并按${preference.budget}元预算筛选；热量为演示估算值。`,
      allergenNotice: allergens.length ? `含${allergens.join("、")}，下单前请再次确认。` : "当前预设菜品未标记常见过敏原，仍请以门店配料表为准。"
    };
  });
}
