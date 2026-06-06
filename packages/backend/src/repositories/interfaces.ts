import type {
  Booking,
  Employee,
  EscalationRecord,
  Feedback,
  MealSchedule,
  ServeEvent,
} from "@office-meal/shared";

export interface EmployeeRepository {
  findById(id: string): Promise<Employee | null>;
  findByCode(code: string): Promise<Employee | null>;
  list(): Promise<Employee[]>;
  save(employee: Employee): Promise<void>;
}

export interface MealScheduleRepository {
  findById(id: string): Promise<MealSchedule | null>;
  findByDateAndMeal(
    date: string,
    mealType: string
  ): Promise<MealSchedule | null>;
  listByDate(date: string): Promise<MealSchedule[]>;
  save(schedule: MealSchedule): Promise<void>;
  delete(id: string): Promise<void>;
}
export interface BookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByEmployeeAndDate(
    employeeId: string,
    date: string
  ): Promise<Booking[]>;
  findByDate(date: string): Promise<Booking[]>;
  save(booking: Booking): Promise<void>;
  countActiveBySchedule(scheduleId: string): Promise<number>;
  countNoShowsByEmployeeSince(
    employeeId: string,
    sinceDate: string
  ): Promise<number>;
}

export interface ServeEventRepository {
  findByBookingId(bookingId: string): Promise<ServeEvent | null>;
  findByDate(date: string): Promise<ServeEvent[]>;
  findManualByDate(date: string): Promise<ServeEvent[]>;
  save(event: ServeEvent): Promise<void>;
}

export interface FeedbackRepository {
  findById(id: string): Promise<Feedback | null>;
  save(feedback: Feedback): Promise<void>;
  findByDate(date: string): Promise<Feedback[]>;
  findByEmployee(employeeId: string): Promise<Feedback[]>;
}

export interface EscalationRepository {
  save(record: EscalationRecord): Promise<void>;
  countRecentByEmployee(
    employeeId: string,
    sinceIso: string
  ): Promise<number>;
  listByEmployee(employeeId: string): Promise<EscalationRecord[]>;
}
