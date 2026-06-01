import type { MealSchedule } from "../api/types";

/** Parse admin textarea (one item per line) into dish list */
export function parseMenuItems(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function itemsToText(items?: string[]): string {
  return (items ?? []).join("\n");
}

export function getVegItems(schedule: MealSchedule): string[] {
  if (schedule.menuVegItems?.length) return schedule.menuVegItems;
  if (schedule.menuVeg?.trim()) return parseMenuItems(schedule.menuVeg);
  return [];
}

export function getNonVegItems(schedule: MealSchedule): string[] {
  if (schedule.menuNonVegItems?.length) return schedule.menuNonVegItems;
  if (schedule.menuNonVeg?.trim()) return parseMenuItems(schedule.menuNonVeg);
  return [];
}

export const MEAL_ITEM_HINTS: Record<
  "breakfast" | "lunch" | "dinner",
  { veg: string; nonVeg: string }
> = {
  breakfast: {
    veg: "Idli\nVada\nSambar\nChutney\nTea/Coffee",
    nonVeg: "Egg dosa\nChicken sandwich\nTea/Coffee",
  },
  lunch: {
    veg: "Rice\nSambar\nDal\nMixed veg curry\nCurd\nPickle\nPapad",
    nonVeg: "Rice\nChicken curry\nDal\nCurd\nPickle\nPapad",
  },
  dinner: {
    veg: "Rice\nSambar\nDal\nVegetable curry\nCurd\nSalad",
    nonVeg: "Rice\nFish curry\nDal\nCurd\nSalad",
  },
};
