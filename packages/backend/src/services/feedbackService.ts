import { v4 as uuid } from "uuid";
import { feedbackRepo } from "../repositories/memory";
import type { DietType, MealType } from "@office-meal/shared";

export const feedbackService = {
  async submit(input: {
    employeeId: string;
    date: string;
    mealType: MealType;
    dietType: DietType;
    rating: number;
    tags?: string[];
    comment?: string;
    facilityNotes?: string;
  }) {
    const feedback = {
      id: uuid(),
      employeeId: input.employeeId,
      date: input.date,
      mealType: input.mealType,
      dietType: input.dietType,
      rating: input.rating,
      tags: input.tags ?? [],
      comment: input.comment,
      facilityNotes: input.facilityNotes,
      createdAt: new Date().toISOString(),
    };
    await feedbackRepo.save(feedback);
    return feedback;
  },

  async listByDate(date: string) {
    return feedbackRepo.findByDate(date);
  },
};
