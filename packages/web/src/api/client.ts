import type {
  Booking,
  BookingWithEmployee,
  DailyMealReport,
  DietType,
  Feedback,
  ManualServeRecord,
  MealSchedule,
  MealType,
  Role,
  ServeEmployeeInfo,
  User,
} from "./types";

const TOKEN_KEY = "office_meal_token";
const USER_KEY = "office_meal_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function saveAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

import { tomorrowDate } from "../utils/dates";

export { tomorrowDate };

export const api = {
  devLogin(employeeCode: string, role: Role) {
    return request<{ token: string; user: User }>("/api/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ employeeCode, role }),
    });
  },

  getSchedules(date: string) {
    return request<{ date: string; schedules: MealSchedule[] }>(
      `/api/employee/schedules?date=${date}`
    );
  },

  createBooking(body: {
    date: string;
    mealType: MealType;
    dietType: DietType;
  }) {
    return request<Booking>("/api/employee/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getBookings(date: string) {
    return request<{ bookings: Booking[] }>(
      `/api/employee/bookings?date=${date}`
    );
  },

  cancelBooking(id: string) {
    return request<Booking>(`/api/employee/bookings/${id}`, {
      method: "DELETE",
    });
  },

  getQr(bookingId: string) {
    return request<{
      bookingId: string;
      mealType: MealType;
      dietType: DietType;
      dietLabel: string;
      qrToken: string;
    }>(`/api/employee/bookings/${bookingId}/qr`);
  },

  getMyFeedback() {
    return request<{ feedback: Feedback[] }>("/api/employee/feedback");
  },

  submitFeedback(body: {
    date: string;
    mealType: MealType;
    dietType: DietType;
    rating: number;
    tags?: string[];
    comment?: string;
    facilityNotes?: string;
  }) {
    return request<Feedback>("/api/employee/feedback", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateFeedback(
    id: string,
    body: {
      rating: number;
      comment?: string;
      facilityNotes?: string;
    }
  ) {
    return request<Feedback>(`/api/employee/feedback/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  scanQr(qrToken: string, counterId?: string) {
    return request<{
      success: boolean;
      employee: ServeEmployeeInfo;
    }>("/api/server/scan", {
      method: "POST",
      body: JSON.stringify({ qrToken, counterId }),
    });
  },

  manualServe(body: {
    employeeCode: string;
    date: string;
    mealType: MealType;
    dietType: DietType;
    reason: string;
    counterId?: string;
  }) {
    return request<{
      success: boolean;
      employee: ServeEmployeeInfo;
    }>("/api/server/manual-serve", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getManualServeHistory(date: string) {
    return request<{ date: string; history: ManualServeRecord[] }>(
      `/api/server/manual-history?date=${date}`
    );
  },

  dailyReport(date: string) {
    return request<{ date: string; meals: DailyMealReport[] }>(
      `/api/admin/reports/daily?date=${date}`
    );
  },

  listBookings(date: string) {
    return request<{ date: string; bookings: BookingWithEmployee[] }>(
      `/api/admin/bookings?date=${date}`
    );
  },

  listSchedules(date: string) {
    return request<{ date: string; schedules: MealSchedule[] }>(
      `/api/admin/schedules?date=${date}`
    );
  },

  saveSchedule(body: {
    date: string;
    mealType: MealType;
    menuVegItems?: string[];
    menuNonVegItems?: string[];
    cutoffAt: string;
    capacity: number;
    active?: boolean;
  }) {
    return request<MealSchedule>("/api/admin/schedules", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  deleteSchedule(id: string) {
    return request<{ id: string; deactivated: boolean }>(
      `/api/admin/schedules/${id}`,
      { method: "DELETE" }
    );
  },
};
