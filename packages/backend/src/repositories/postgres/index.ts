import type pg from "pg";
import type {
  Booking,
  Employee,
  EscalationRecord,
  Feedback,
  MealSchedule,
  Role,
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

function rowToEmployee(r: Record<string, unknown>): Employee {
  return {
    id: String(r.id),
    employeeCode: String(r.employee_code),
    name: String(r.name),
    email: String(r.email),
    department: String(r.department),
    defaultDiet: r.default_diet as Employee["defaultDiet"],
    role: r.role as Role,
    active: Boolean(r.active),
  };
}

function rowToSchedule(r: Record<string, unknown>): MealSchedule {
  const vegItems = r.menu_veg_items as string[] | null;
  const nonVegItems = r.menu_non_veg_items as string[] | null;
  const date =
    r.date instanceof Date
      ? r.date.toISOString().slice(0, 10)
      : String(r.date).slice(0, 10);
  return {
    id: String(r.id),
    date,
    mealType: r.meal_type as MealSchedule["mealType"],
    menuVegItems: vegItems ?? [],
    menuNonVegItems: nonVegItems ?? [],
    menuVeg: r.menu_veg ? String(r.menu_veg) : undefined,
    menuNonVeg: r.menu_non_veg ? String(r.menu_non_veg) : undefined,
    cutoffAt: new Date(String(r.cutoff_at)).toISOString(),
    capacity: Number(r.capacity),
    active: Boolean(r.active),
  };
}

function rowToBooking(r: Record<string, unknown>): Booking {
  const date =
    r.date instanceof Date
      ? r.date.toISOString().slice(0, 10)
      : String(r.date).slice(0, 10);
  return {
    id: String(r.id),
    employeeId: String(r.employee_id),
    scheduleId: String(r.schedule_id),
    date,
    mealType: r.meal_type as Booking["mealType"],
    dietType: r.diet_type as Booking["dietType"],
    status: r.status as Booking["status"],
    bookedAt: new Date(String(r.booked_at)).toISOString(),
    cancelledAt: r.cancelled_at
      ? new Date(String(r.cancelled_at)).toISOString()
      : undefined,
    servedAt: r.served_at
      ? new Date(String(r.served_at)).toISOString()
      : undefined,
  };
}

function rowToServe(r: Record<string, unknown>): ServeEvent {
  const date =
    r.date instanceof Date
      ? r.date.toISOString().slice(0, 10)
      : String(r.date).slice(0, 10);
  return {
    id: String(r.id),
    bookingId: String(r.booking_id),
    employeeId: String(r.employee_id),
    date,
    mealType: r.meal_type as ServeEvent["mealType"],
    dietType: r.diet_type as ServeEvent["dietType"],
    servedAt: new Date(String(r.served_at)).toISOString(),
    servedBy: String(r.served_by),
    counterId: r.counter_id ? String(r.counter_id) : undefined,
    manual: Boolean(r.manual),
    manualReason: r.manual_reason ? String(r.manual_reason) : undefined,
  };
}

function rowToFeedback(r: Record<string, unknown>): Feedback {
  const date =
    r.date instanceof Date
      ? r.date.toISOString().slice(0, 10)
      : String(r.date).slice(0, 10);
  return {
    id: String(r.id),
    employeeId: String(r.employee_id),
    date,
    mealType: r.meal_type as Feedback["mealType"],
    dietType: r.diet_type as Feedback["dietType"],
    rating: Number(r.rating),
    tags: (r.tags as string[]) ?? [],
    comment: r.comment ? String(r.comment) : undefined,
    facilityNotes: r.facility_notes ? String(r.facility_notes) : undefined,
    createdAt: new Date(String(r.created_at)).toISOString(),
    updatedAt: r.updated_at
      ? new Date(String(r.updated_at)).toISOString()
      : undefined,
  };
}

export function createPostgresRepos(pool: pg.Pool) {
  const employeeRepo: EmployeeRepository = {
    async findById(id) {
      const { rows } = await pool.query(
        "SELECT * FROM employees WHERE id = $1",
        [id]
      );
      return rows[0] ? rowToEmployee(rows[0]) : null;
    },
    async findByCode(code) {
      const { rows } = await pool.query(
        "SELECT * FROM employees WHERE employee_code = $1",
        [code]
      );
      return rows[0] ? rowToEmployee(rows[0]) : null;
    },
    async list() {
      const { rows } = await pool.query("SELECT * FROM employees ORDER BY employee_code");
      return rows.map(rowToEmployee);
    },
    async save(employee) {
      await pool.query(
        `INSERT INTO employees (id, employee_code, name, email, department, default_diet, role, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           employee_code = EXCLUDED.employee_code,
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           department = EXCLUDED.department,
           default_diet = EXCLUDED.default_diet,
           role = EXCLUDED.role,
           active = EXCLUDED.active`,
        [
          employee.id,
          employee.employeeCode,
          employee.name,
          employee.email,
          employee.department,
          employee.defaultDiet,
          employee.role,
          employee.active,
        ]
      );
    },
  };

  const scheduleRepo: MealScheduleRepository = {
    async findById(id) {
      const { rows } = await pool.query(
        "SELECT * FROM meal_schedules WHERE id = $1",
        [id]
      );
      return rows[0] ? rowToSchedule(rows[0]) : null;
    },
    async findByDateAndMeal(date, mealType) {
      const { rows } = await pool.query(
        "SELECT * FROM meal_schedules WHERE date = $1 AND meal_type = $2",
        [date, mealType]
      );
      return rows[0] ? rowToSchedule(rows[0]) : null;
    },
    async listByDate(date) {
      const { rows } = await pool.query(
        "SELECT * FROM meal_schedules WHERE date = $1 ORDER BY meal_type",
        [date]
      );
      return rows.map(rowToSchedule);
    },
    async save(schedule) {
      await pool.query(
        `INSERT INTO meal_schedules (id, date, meal_type, menu_veg_items, menu_non_veg_items, menu_veg, menu_non_veg, cutoff_at, capacity, active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (date, meal_type) DO UPDATE SET
           id = EXCLUDED.id,
           menu_veg_items = EXCLUDED.menu_veg_items,
           menu_non_veg_items = EXCLUDED.menu_non_veg_items,
           menu_veg = EXCLUDED.menu_veg,
           menu_non_veg = EXCLUDED.menu_non_veg,
           cutoff_at = EXCLUDED.cutoff_at,
           capacity = EXCLUDED.capacity,
           active = EXCLUDED.active`,
        [
          schedule.id,
          schedule.date,
          schedule.mealType,
          JSON.stringify(schedule.menuVegItems ?? []),
          JSON.stringify(schedule.menuNonVegItems ?? []),
          schedule.menuVeg ?? null,
          schedule.menuNonVeg ?? null,
          schedule.cutoffAt,
          schedule.capacity,
          schedule.active,
        ]
      );
    },
    async delete(id) {
      await pool.query("DELETE FROM meal_schedules WHERE id = $1", [id]);
    },
  };

  const bookingRepo: BookingRepository = {
    async findById(id) {
      const { rows } = await pool.query("SELECT * FROM bookings WHERE id = $1", [
        id,
      ]);
      return rows[0] ? rowToBooking(rows[0]) : null;
    },
    async findByEmployeeAndDate(employeeId, date) {
      const { rows } = await pool.query(
        "SELECT * FROM bookings WHERE employee_id = $1 AND date = $2 ORDER BY meal_type",
        [employeeId, date]
      );
      return rows.map(rowToBooking);
    },
    async findByDate(date) {
      const { rows } = await pool.query(
        "SELECT * FROM bookings WHERE date = $1 ORDER BY meal_type",
        [date]
      );
      return rows.map(rowToBooking);
    },
    async save(booking) {
      await pool.query(
        `INSERT INTO bookings (id, employee_id, schedule_id, date, meal_type, diet_type, status, booked_at, cancelled_at, served_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           cancelled_at = EXCLUDED.cancelled_at,
           served_at = EXCLUDED.served_at`,
        [
          booking.id,
          booking.employeeId,
          booking.scheduleId,
          booking.date,
          booking.mealType,
          booking.dietType,
          booking.status,
          booking.bookedAt,
          booking.cancelledAt ?? null,
          booking.servedAt ?? null,
        ]
      );
    },
    async countActiveBySchedule(scheduleId) {
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS c FROM bookings WHERE schedule_id = $1 AND status = 'booked'",
        [scheduleId]
      );
      return rows[0]?.c ?? 0;
    },
    async countNoShowsByEmployeeSince(employeeId, sinceDate) {
      const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS c FROM bookings
         WHERE employee_id = $1 AND status = 'no_show' AND date >= $2::date`,
        [employeeId, sinceDate]
      );
      return rows[0]?.c ?? 0;
    },
  };

  const serveRepo: ServeEventRepository = {
    async findByBookingId(bookingId) {
      const { rows } = await pool.query(
        "SELECT * FROM serve_events WHERE booking_id = $1",
        [bookingId]
      );
      return rows[0] ? rowToServe(rows[0]) : null;
    },
    async findByDate(date) {
      const { rows } = await pool.query(
        "SELECT * FROM serve_events WHERE date = $1",
        [date]
      );
      return rows.map(rowToServe);
    },
    async findManualByDate(date) {
      const { rows } = await pool.query(
        "SELECT * FROM serve_events WHERE date = $1 AND manual = TRUE ORDER BY served_at DESC",
        [date]
      );
      return rows.map(rowToServe);
    },
    async save(event) {
      await pool.query(
        `INSERT INTO serve_events (id, booking_id, employee_id, date, meal_type, diet_type, served_at, served_by, counter_id, manual, manual_reason)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [
          event.id,
          event.bookingId,
          event.employeeId,
          event.date,
          event.mealType,
          event.dietType,
          event.servedAt,
          event.servedBy,
          event.counterId ?? null,
          event.manual,
          event.manualReason ?? null,
        ]
      );
    },
  };

  const feedbackRepo: FeedbackRepository = {
    async findById(id) {
      const { rows } = await pool.query("SELECT * FROM feedback WHERE id = $1", [
        id,
      ]);
      return rows[0] ? rowToFeedback(rows[0]) : null;
    },
    async save(feedback) {
      await pool.query(
        `INSERT INTO feedback (id, employee_id, date, meal_type, diet_type, rating, tags, comment, facility_notes, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO UPDATE SET
           rating = EXCLUDED.rating,
           tags = EXCLUDED.tags,
           comment = EXCLUDED.comment,
           facility_notes = EXCLUDED.facility_notes,
           updated_at = EXCLUDED.updated_at`,
        [
          feedback.id,
          feedback.employeeId,
          feedback.date,
          feedback.mealType,
          feedback.dietType,
          feedback.rating,
          JSON.stringify(feedback.tags),
          feedback.comment ?? null,
          feedback.facilityNotes ?? null,
          feedback.createdAt,
          feedback.updatedAt ?? null,
        ]
      );
    },
    async findByDate(date) {
      const { rows } = await pool.query(
        "SELECT * FROM feedback WHERE date = $1 ORDER BY created_at DESC",
        [date]
      );
      return rows.map(rowToFeedback);
    },
    async findByEmployee(employeeId) {
      const { rows } = await pool.query(
        "SELECT * FROM feedback WHERE employee_id = $1 ORDER BY created_at DESC",
        [employeeId]
      );
      return rows.map(rowToFeedback);
    },
  };

  const escalationRepo: EscalationRepository = {
    async save(record) {
      await pool.query(
        `INSERT INTO escalations (id, employee_id, level, reason, created_at)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO NOTHING`,
        [
          record.id,
          record.employeeId,
          record.level,
          record.reason,
          record.createdAt,
        ]
      );
    },
    async countRecentByEmployee(employeeId, sinceIso) {
      const { rows } = await pool.query(
        "SELECT COUNT(*)::int AS c FROM escalations WHERE employee_id = $1 AND created_at >= $2",
        [employeeId, sinceIso]
      );
      return rows[0]?.c ?? 0;
    },
    async listByEmployee(employeeId) {
      const { rows } = await pool.query(
        "SELECT * FROM escalations WHERE employee_id = $1 ORDER BY created_at DESC",
        [employeeId]
      );
      return rows.map(
        (r): EscalationRecord => ({
          id: String(r.id),
          employeeId: String(r.employee_id),
          level: Number(r.level),
          reason: String(r.reason),
          createdAt: new Date(String(r.created_at)).toISOString(),
        })
      );
    },
  };

  return {
    employeeRepo,
    scheduleRepo,
    bookingRepo,
    serveRepo,
    feedbackRepo,
    escalationRepo,
  };
}
