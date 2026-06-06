import { v4 as uuid } from "uuid";
import { feedbackRepo } from "../repositories";
import type { DietType, MealType } from "@office-meal/shared";
import { AppError } from "../domain/errors";

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

  async listMine(employeeId: string) {
    return feedbackRepo.findByEmployee(employeeId);
  },

  async update(
    id: string,
    employeeId: string,
    input: {
      rating: number;
      tags?: string[];
      comment?: string;
      facilityNotes?: string;
    }
  ) {
    const existing = await feedbackRepo.findById(id);
    if (!existing || existing.employeeId !== employeeId) {
      throw new AppError("Feedback not found", 404);
    }
    const updated = {
      ...existing,
      rating: input.rating,
      tags: input.tags ?? existing.tags,
      comment: input.comment,
      facilityNotes: input.facilityNotes,
      updatedAt: new Date().toISOString(),
    };
    await feedbackRepo.save(updated);
    return updated;
  },

  async listByDate(date: string) {
    return feedbackRepo.findByDate(date);
  },
};
