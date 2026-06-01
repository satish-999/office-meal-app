import type { Booking, Employee } from "@office-meal/shared";
import { bookingRepo, employeeRepo } from "../repositories/memory";

export interface BookingWithEmployee extends Booking {
  employee: Pick<Employee, "employeeCode" | "name" | "email" | "department">;
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
};
