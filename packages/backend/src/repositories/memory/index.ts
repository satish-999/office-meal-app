import type {
  Booking,
  Employee,
  EscalationRecord,
  Feedback,
  MealSchedule,
  ServeEvent,
} from "@office-meal/shared";
import type {
  BookingRepository,
  EmployeeRepository,
  EscalationRepository,
  FeedbackRepository,
  MealScheduleRepository,
  ServeEventRepository,
} from "../interfaces";
import { memoryStore } from "./store";

export const employeeRepo: EmployeeRepository = {
  async findById(id) {
    return memoryStore.employees.get(id) ?? null;
  },
  async findByCode(code) {
    for (const e of memoryStore.employees.values()) {
      if (e.employeeCode === code) return e;
    }
    return null;
  },
  async list() {
    return [...memoryStore.employees.values()];
  },
  async save(employee) {
    memoryStore.employees.set(employee.id, employee);
  },
};

export const scheduleRepo: MealScheduleRepository = {
  async findById(id) {
    return memoryStore.schedules.get(id) ?? null;
  },
  async findByDateAndMeal(date, mealType) {
    for (const s of memoryStore.schedules.values()) {
      if (s.date === date && s.mealType === mealType) return s;
    }
    return null;
  },
  async listByDate(date) {
    return [...memoryStore.schedules.values()].filter((s) => s.date === date);
  },
  async save(schedule) {
    memoryStore.schedules.set(schedule.id, schedule);
  },
  async delete(id) {
    memoryStore.schedules.delete(id);
  },
};

export const bookingRepo: BookingRepository = {
  async findById(id) {
    return memoryStore.bookings.get(id) ?? null;
  },
  async findByEmployeeAndDate(employeeId, date) {
    return [...memoryStore.bookings.values()].filter(
      (b) => b.employeeId === employeeId && b.date === date
    );
  },
  async findByDate(date) {
    return [...memoryStore.bookings.values()].filter((b) => b.date === date);
  },
  async save(booking) {
    memoryStore.bookings.set(booking.id, booking);
  },
  async countActiveBySchedule(scheduleId) {
    return [...memoryStore.bookings.values()].filter(
      (b) => b.scheduleId === scheduleId && b.status === "booked"
    ).length;
  },
  async countNoShowsByEmployeeSince(employeeId, sinceDate) {
    return [...memoryStore.bookings.values()].filter(
      (b) =>
        b.employeeId === employeeId &&
        b.status === "no_show" &&
        b.date >= sinceDate
    ).length;
  },
};

export const serveRepo: ServeEventRepository = {
  async findByBookingId(bookingId) {
    for (const e of memoryStore.serveEvents.values()) {
      if (e.bookingId === bookingId) return e;
    }
    return null;
  },
  async findByDate(date) {
    return [...memoryStore.serveEvents.values()].filter((e) => e.date === date);
  },
  async findManualByDate(date) {
    return [...memoryStore.serveEvents.values()].filter(
      (e) => e.date === date && e.manual
    );
  },
  async save(event) {
    memoryStore.serveEvents.set(event.id, event);
  },
};

export const feedbackRepo: FeedbackRepository = {
  async findById(id) {
    return memoryStore.feedback.get(id) ?? null;
  },
  async save(feedback) {
    memoryStore.feedback.set(feedback.id, feedback);
  },
  async findByDate(date) {
    return [...memoryStore.feedback.values()].filter((f) => f.date === date);
  },
  async findByEmployee(employeeId) {
    return [...memoryStore.feedback.values()]
      .filter((f) => f.employeeId === employeeId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },
};

export const escalationRepo: EscalationRepository = {
  async save(record) {
    memoryStore.escalations.set(record.id, record);
  },
  async countRecentByEmployee(employeeId, sinceIso) {
    const since = new Date(sinceIso).getTime();
    return [...memoryStore.escalations.values()].filter(
      (e) =>
        e.employeeId === employeeId &&
        new Date(e.createdAt).getTime() >= since
    ).length;
  },
  async listByEmployee(employeeId) {
    return [...memoryStore.escalations.values()].filter(
      (e) => e.employeeId === employeeId
    );
  },
};
