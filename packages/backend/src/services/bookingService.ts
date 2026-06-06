import { v4 as uuid } from "uuid";
import type { CreateBookingInput, DietType, MealType } from "@office-meal/shared";
import { AppError } from "../domain/errors";
import {
  bookingRepo,
  employeeRepo,
  scheduleRepo,
} from "../repositories";

export const bookingService = {
  async createBooking(employeeId: string, input: CreateBookingInput) {
    const employee = await employeeRepo.findById(employeeId);
    if (!employee?.active) {
      throw new AppError("Employee not found or inactive", 404);
    }

    const schedule = await scheduleRepo.findByDateAndMeal(
      input.date,
      input.mealType
    );
    if (!schedule?.active) {
      throw new AppError("No meal schedule for this date and meal type", 404);
    }

    if (new Date() > new Date(schedule.cutoffAt)) {
      throw new AppError("Registration cutoff has passed", 400, "CUTOFF_PASSED");
    }

    const existing = await bookingRepo.findByEmployeeAndDate(
      employeeId,
      input.date
    );
    const duplicate = existing.find(
      (b) => b.mealType === input.mealType && b.status === "booked"
    );
    if (duplicate) {
      throw new AppError("Already registered for this meal", 409);
    }

    const count = await bookingRepo.countActiveBySchedule(schedule.id);
    if (count >= schedule.capacity) {
      throw new AppError("Meal capacity reached", 400, "CAPACITY_FULL");
    }

    const booking = {
      id: uuid(),
      employeeId,
      scheduleId: schedule.id,
      date: input.date,
      mealType: input.mealType as MealType,
      dietType: input.dietType as DietType,
      status: "booked" as const,
      bookedAt: new Date().toISOString(),
    };

    await bookingRepo.save(booking);
    return booking;
  },

  async cancelBooking(employeeId: string, bookingId: string) {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking || booking.employeeId !== employeeId) {
      throw new AppError("Booking not found", 404);
    }
    if (booking.status !== "booked") {
      throw new AppError("Cannot cancel this booking", 400);
    }

    const schedule = await scheduleRepo.findById(booking.scheduleId);
    if (schedule && new Date() > new Date(schedule.cutoffAt)) {
      throw new AppError("Cancellation cutoff has passed", 400);
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date().toISOString();
    await bookingRepo.save(booking);
    return booking;
  },

  async listMyBookings(employeeId: string, date?: string) {
    if (date) {
      return bookingRepo.findByEmployeeAndDate(employeeId, date);
    }
    const all = await bookingRepo.findByDate(
      new Date().toISOString().slice(0, 10)
    );
    return all.filter((b) => b.employeeId === employeeId);
  },
};
