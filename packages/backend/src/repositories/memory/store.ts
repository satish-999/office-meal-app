import type {
  Booking,
  Employee,
  EscalationRecord,
  Feedback,
  MealSchedule,
  ServeEvent,
} from "@office-meal/shared";

/** In-memory store — replace with PostgreSQL adapters later */
export const memoryStore = {
  employees: new Map<string, Employee>(),
  schedules: new Map<string, MealSchedule>(),
  bookings: new Map<string, Booking>(),
  serveEvents: new Map<string, ServeEvent>(),
  feedback: new Map<string, Feedback>(),
  escalations: new Map<string, EscalationRecord>(),
};
