import type { Booking, Employee, Feedback } from "@office-meal/shared";
import { bookingRepo, employeeRepo, feedbackRepo } from "../repositories";

export interface BookingWithEmployee extends Booking {
  employee: Pick<Employee, "employeeCode" | "name" | "email" | "department">;
}

export interface FeedbackWithEmployee extends Feedback {
  employee: Pick<Employee, "employeeCode" | "name" | "department">;
}

export const adminService = {
  async listBookingsWithEmployees(date: string): Promise<BookingWithEmployee[]> {
    const bookings = await bookingRepo.findByDate(date);
    const result: BookingWithEmployee[] = [];

    for (const booking of bookings) {
      const employee = await employeeRepo.findById(booking.employeeId);
      result.push({
        ...booking,
        employee: employee
          ? {
              employeeCode: employee.employeeCode,
              name: employee.name,
              email: employee.email,
              department: employee.department,
            }
          : {
              employeeCode: "—",
              name: "Unknown",
              email: "—",
              department: "—",
            },
      });
    }

    return result.sort((a, b) => a.mealType.localeCompare(b.mealType));
  },

  async listFeedbackWithEmployees(date: string): Promise<FeedbackWithEmployee[]> {
    const items = await feedbackRepo.findByDate(date);
    const result: FeedbackWithEmployee[] = [];

    for (const item of items) {
      const employee = await employeeRepo.findById(item.employeeId);
      result.push({
        ...item,
        employee: employee
          ? {
              employeeCode: employee.employeeCode,
              name: employee.name,
              department: employee.department,
            }
          : {
              employeeCode: "—",
              name: "Unknown",
              department: "—",
            },
      });
    }

    return result;
  },
};
