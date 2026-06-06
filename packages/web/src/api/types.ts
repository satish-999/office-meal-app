export type Role = "employee" | "server" | "admin";
export type MealType = "breakfast" | "lunch" | "dinner";
export type DietType = "veg" | "non_veg";
export type BookingStatus = "booked" | "cancelled" | "served" | "no_show";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  defaultDiet: DietType;
}

export interface MealSchedule {
  id: string;
  date: string;
  mealType: MealType;
  menuVeg?: string;
  menuNonVeg?: string;
  menuVegItems?: string[];
  menuNonVegItems?: string[];
  cutoffAt: string;
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

export interface ServeEmployeeInfo {
  name: string;
  employeeCode: string;
  dietType: DietType;
  mealType: MealType;
  dietLabel: string;
}

export interface Feedback {
  id: string;
  employeeId: string;
  date: string;
  mealType: MealType;
  dietType: DietType;
  rating: number;
  tags: string[];
  comment?: string;
  facilityNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedbackWithEmployee extends Feedback {
  employee: {
    employeeCode: string;
    name: string;
    department: string;
  };
}

export interface BookingWithEmployee extends Booking {
  employee: {
    employeeCode: string;
    name: string;
    email: string;
    department: string;
  };
}

export interface AdminEmployee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  defaultDiet: DietType;
  role: Role;
  active: boolean;
}

export interface ManualServeRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  employeeEmail: string;
  date: string;
  mealType: MealType;
  dietType: DietType;
  servedAt: string;
  manualReason?: string;
  counterId?: string;
}
