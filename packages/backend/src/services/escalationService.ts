import { v4 as uuid } from "uuid";
import { bookingRepo, employeeRepo, escalationRepo, serveRepo } from "../repositories";
import { notificationService } from "./notificationService";

const NO_SHOW_THRESHOLD = 3;
const WINDOW_DAYS = 30;

/** Run end-of-day job: mark no-shows, notify, escalate */
export const escalationService = {
  async processNoShowsForDate(date: string): Promise<{ processed: number }> {
    const bookings = await bookingRepo.findByDate(date);
    const serves = await serveRepo.findByDate(date);
    const servedIds = new Set(serves.map((s) => s.bookingId));
    let processed = 0;

    for (const booking of bookings) {
      if (booking.status !== "booked") continue;
      if (servedIds.has(booking.id)) continue;

      booking.status = "no_show";
      await bookingRepo.save(booking);
      processed++;

      const employee = await employeeRepo.findById(booking.employeeId);
      if (!employee) continue;

      await notificationService.sendNoShowWarning(
        employee.email,
        employee.name,
        booking.mealType,
        booking.date
      );

      const since = new Date();
      since.setDate(since.getDate() - WINDOW_DAYS);
      const sinceDate = since.toISOString().slice(0, 10);
      const recentNoShows = await bookingRepo.countNoShowsByEmployeeSince(
        employee.id,
        sinceDate
      );

      if (recentNoShows >= NO_SHOW_THRESHOLD) {
        const level = Math.min(recentNoShows - NO_SHOW_THRESHOLD + 1, 3);
        const record = {
          id: uuid(),
          employeeId: employee.id,
          level,
          reason: `${recentNoShows} no-shows in window`,
          createdAt: new Date().toISOString(),
        };
        await escalationRepo.save(record);
        await notificationService.sendEscalation(
          employee.email,
          employee.name,
          level
        );
      }
    }

    return { processed };
  },
};
