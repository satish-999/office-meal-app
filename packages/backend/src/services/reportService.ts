import type { DailyMealReport, MealType } from "@office-meal/shared";
import { bookingRepo, serveRepo } from "../repositories";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

export const reportService = {
  async dailyReport(date: string): Promise<DailyMealReport[]> {
    const bookings = await bookingRepo.findByDate(date);
    const serves = await serveRepo.findByDate(date);
    const servedBookingIds = new Set(serves.map((s) => s.bookingId));

    return MEALS.map((mealType) => {
      const mealBookings = bookings.filter((b) => b.mealType === mealType);
      const booked = mealBookings.filter((b) => b.status === "booked");
      const served = mealBookings.filter((b) => b.status === "served");
      const cancelled = mealBookings.filter((b) => b.status === "cancelled");

      const registered = mealBookings.filter(
        (b) => b.status === "booked" || b.status === "served" || b.status === "no_show"
      );
      const noShow = mealBookings.filter(
        (b) =>
          (b.status === "booked" || b.status === "no_show") &&
          !servedBookingIds.has(b.id)
      );

      const activeRegistered = mealBookings.filter(
        (b) => b.status === "booked" || b.status === "served"
      );

      return {
        date,
        mealType,
        registered: activeRegistered.length,
        served: served.length,
        noShow: noShow.length,
        cancelled: cancelled.length,
        vegRegistered: activeRegistered.filter((b) => b.dietType === "veg").length,
        nonVegRegistered: activeRegistered.filter((b) => b.dietType === "non_veg")
          .length,
        vegServed: served.filter((b) => b.dietType === "veg").length,
        nonVegServed: served.filter((b) => b.dietType === "non_veg").length,
      };
    });
  },
};
