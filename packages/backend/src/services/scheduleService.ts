import { v4 as uuid } from "uuid";
import type { MealSchedule, MealType } from "@office-meal/shared";
import { AppError } from "../domain/errors";
import { scheduleRepo } from "../repositories";

export const scheduleService = {
  async listByDate(date: string) {
    return scheduleRepo.listByDate(date);
  },

  async upsert(input: {
    date: string;
    mealType: MealType;
    menuVeg?: string;
    menuNonVeg?: string;
    menuVegItems?: string[];
    menuNonVegItems?: string[];
    cutoffAt: string;
    capacity: number;
    active?: boolean;
  }) {
    const existing = await scheduleRepo.findByDateAndMeal(
      input.date,
      input.mealType
    );

    const menuVegItems =
      input.menuVegItems ??
      (input.menuVeg
        ? input.menuVeg.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
        : undefined);
    const menuNonVegItems =
      input.menuNonVegItems ??
      (input.menuNonVeg
        ? input.menuNonVeg.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
        : undefined);

    if (existing) {
      const updated: MealSchedule = {
        ...existing,
        menuVegItems: menuVegItems ?? existing.menuVegItems ?? [],
        menuNonVegItems: menuNonVegItems ?? existing.menuNonVegItems ?? [],
        menuVeg: menuVegItems?.join(", ") ?? existing.menuVeg,
        menuNonVeg: menuNonVegItems?.join(", ") ?? existing.menuNonVeg,
        cutoffAt: input.cutoffAt,
        capacity: input.capacity,
        active: input.active !== undefined ? input.active : true,
      };
      await scheduleRepo.save(updated);
      return updated;
    }

    const schedule: MealSchedule = {
      id: uuid(),
      date: input.date,
      mealType: input.mealType,
      menuVegItems: menuVegItems ?? [],
      menuNonVegItems: menuNonVegItems ?? [],
      menuVeg: menuVegItems?.join(", "),
      menuNonVeg: menuNonVegItems?.join(", "),
      cutoffAt: input.cutoffAt,
      capacity: input.capacity,
      active: input.active ?? true,
    };
    await scheduleRepo.save(schedule);
    return schedule;
  },

  async remove(id: string) {
    const schedule = await scheduleRepo.findById(id);
    if (!schedule) {
      throw new AppError("Schedule not found", 404);
    }
    await scheduleRepo.save({ ...schedule, active: false });
    return { id, deactivated: true };
  },
};
