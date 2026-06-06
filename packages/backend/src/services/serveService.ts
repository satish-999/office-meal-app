import { v4 as uuid } from "uuid";
import type { ManualServeInput } from "@office-meal/shared";
import { AppError } from "../domain/errors";
import {
  bookingRepo,
  employeeRepo,
  scheduleRepo,
  serveRepo,
} from "../repositories";
import { qrService } from "./qrService";

export const serveService = {
  async scanAndServe(qrToken: string, servedBy: string, counterId?: string) {
    const payload = qrService.verifyToken(qrToken);
    const booking = await bookingRepo.findById(payload.bookingId);

    if (!booking || booking.employeeId !== payload.employeeId) {
      throw new AppError("Booking not found", 404);
    }
    if (booking.status !== "booked") {
      throw new AppError(`Cannot serve: status is ${booking.status}`, 400);
    }

    const existing = await serveRepo.findByBookingId(booking.id);
    if (existing) {
      throw new AppError("Meal already served for this booking", 409);
    }

    const employee = await employeeRepo.findById(booking.employeeId);
    const event = {
      id: uuid(),
      bookingId: booking.id,
      employeeId: booking.employeeId,
      date: booking.date,
      mealType: booking.mealType,
      dietType: booking.dietType,
      servedAt: new Date().toISOString(),
      servedBy,
      counterId,
      manual: false,
    };

    booking.status = "served";
    booking.servedAt = event.servedAt;
    await bookingRepo.save(booking);
    await serveRepo.save(event);

    return {
      event,
      employee: employee
        ? {
            name: employee.name,
            employeeCode: employee.employeeCode,
            dietType: booking.dietType,
            mealType: booking.mealType,
            dietLabel: booking.dietType === "veg" ? "VEGETARIAN" : "NON-VEGETARIAN",
          }
        : null,
    };
  },

  async manualServe(input: ManualServeInput, servedBy: string) {
    const employee = await employeeRepo.findByCode(input.employeeCode);
    if (!employee?.active) {
      throw new AppError("Employee not found", 404);
    }

    let booking = (await bookingRepo.findByEmployeeAndDate(employee.id, input.date)).find(
      (b) => b.mealType === input.mealType && b.status === "booked"
    );

    if (!booking) {
      const schedule = await scheduleRepo.findByDateAndMeal(
        input.date,
        input.mealType
      );
      if (!schedule) {
        throw new AppError("No schedule for manual serve", 404);
      }
      booking = {
        id: uuid(),
        employeeId: employee.id,
        scheduleId: schedule.id,
        date: input.date,
        mealType: input.mealType,
        dietType: input.dietType,
        status: "booked",
        bookedAt: new Date().toISOString(),
      };
      await bookingRepo.save(booking);
    }

    const existing = await serveRepo.findByBookingId(booking.id);
    if (existing) {
      throw new AppError("Already served", 409);
    }

    const event = {
      id: uuid(),
      bookingId: booking.id,
      employeeId: employee.id,
      date: input.date,
      mealType: input.mealType,
      dietType: input.dietType,
      servedAt: new Date().toISOString(),
      servedBy,
      counterId: input.counterId,
      manual: true,
      manualReason: input.reason,
    };

    booking.status = "served";
    booking.servedAt = event.servedAt;
    await bookingRepo.save(booking);
    await serveRepo.save(event);

    return {
      event,
      employee: {
        name: employee.name,
        employeeCode: employee.employeeCode,
        dietType: input.dietType,
        mealType: input.mealType,
        dietLabel: input.dietType === "veg" ? "VEGETARIAN" : "NON-VEGETARIAN",
      },
    };
  },
};
