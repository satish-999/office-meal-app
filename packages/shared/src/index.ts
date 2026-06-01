export type Role = "employee" | "server" | "admin";

export type MealType = "breakfast" | "lunch" | "dinner";

/** Vegetarian vs non-vegetarian — required on every booking */
export type DietType = "veg" | "non_veg";

export type BookingStatus =
  | "booked"
  | "cancelled"
  | "served"
  | "no_show";

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  defaultDiet: DietType;
  active: boolean;
}

export interface MealSchedule {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  /** @deprecated use menuVegItems — kept for older data */
  menuVeg?: string;
  /** @deprecated use menuNonVegItems */
  menuNonVeg?: string;
  /** Individual veg dishes, e.g. Idli, Sambar */
  menuVegItems?: string[];
  /** Individual non-veg dishes, e.g. Egg curry */
  menuNonVegItems?: string[];
  cutoffAt: string; // ISO datetime
  capacity: number;
  active: boolean;
}

export interface Booking {
  id: string;
  employeeId: string;
  scheduleId: string;
  date: string;
  mealType: MealType;
  dietType: DietType;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string;
  servedAt?: string;
}

export interface ServeEvent {
  id: string;
  bookingId: string;
  employeeId: string;
  date: string;
  mealType: MealType;
  dietType: DietType;
  servedAt: string;
  servedBy: string;
  counterId?: string;
  manual: boolean;
  manualReason?: string;
}

export interface Feedback {
  id: string;
  employeeId: string;
  date: string;
  mealType: MealType;
  dietType: DietType;
  rating: number; // 1-5
  tags: string[];
  comment?: string;
  facilityNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EscalationRecord {
  id: string;
  employeeId: string;
  level: number;
  reason: string;
  createdAt: string;
}

export interface DailyMealReport {
  date: string;
  mealType: MealType;
  registered: number;
  served: number;
  noShow: number;
  cancelled: number;
  vegRegistered: number;
  nonVegRegistered: number;
  vegServed: number;
  nonVegServed: number;
}

export interface CreateBookingInput {
  date: string;
  mealType: MealType;
  dietType: DietType;
}

export interface ManualServeInput {
  employeeCode: string;
  date: string;
  mealType: MealType;
  dietType: DietType;
  reason: string;
  counterId?: string;
}
