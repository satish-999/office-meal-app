import { useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { Booking, DietType, MealSchedule, MealType } from "../../api/types";
import { DietBadge, RoleNav, StatusBadge } from "../../components/Layout";
import { MenuItemsList } from "../../components/MenuItemsList";
import { useAuth } from "../../auth/AuthContext";
import { isBeforeCutoff } from "../../utils/dates";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

export function RegisterPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(tomorrowDate);
  const [schedules, setSchedules] = useState<MealSchedule[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [diet, setDiet] = useState<DietType>(user?.defaultDiet ?? "veg");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingMeal, setLoadingMeal] = useState<MealType | null>(null);

  const load = useCallback(async () => {
    const [{ schedules: s }, { bookings: b }] = await Promise.all([
      api.getSchedules(date),
      api.getBookings(date),
    ]);
    setSchedules(s.filter((x) => x.active));
    setBookings(b);
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  function scheduleFor(meal: MealType): MealSchedule | undefined {
    return schedules.find((s) => s.mealType === meal && s.active);
  }

  function bookingFor(meal: MealType): Booking | undefined {
    return bookings.find(
      (b) =>
        b.mealType === meal &&
        (b.status === "booked" || b.status === "served" || b.status === "no_show")
    );
  }

  function isRegistered(meal: MealType): boolean {
    const b = bookingFor(meal);
    return b?.status === "booked" || b?.status === "served";
  }

  function canCancel(meal: MealType): boolean {
    const b = bookingFor(meal);
    const s = scheduleFor(meal);
    if (!b || b.status !== "booked" || !s) return false;
    return isBeforeCutoff(s.cutoffAt);
  }

  async function book(mealType: MealType) {
    if (isRegistered(mealType)) return;
    setError("");
    setMessage("");
    setLoadingMeal(mealType);
    try {
      await api.createBooking({ date, mealType, dietType: diet });
      setMessage(`Registered for ${mealType} (${diet === "veg" ? "Veg" : "Non-Veg"})`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setLoadingMeal(null);
    }
  }

  async function cancel(mealType: MealType) {
    const b = bookingFor(mealType);
    if (!b || !canCancel(mealType)) return;
    if (!confirm(`Cancel ${mealType} registration for ${date}?`)) return;
    setError("");
    setMessage("");
    setLoadingMeal(mealType);
    try {
      await api.cancelBooking(b.id);
      setMessage(`${mealType} registration cancelled.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setLoadingMeal(null);
    }
  }

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card">
        <h2>Register for meals</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Select <strong>Veg</strong> or <strong>Non-Veg</strong> to see only those menu
          items below. Same choice is used when you register.
        </p>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <div style={{ height: "1rem" }} />

        <label>Diet preference for new registrations</label>
        <div className="grid-2" style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className={`btn ${diet === "veg" ? "btn-veg" : "btn-secondary"}`}
            onClick={() => setDiet("veg")}
          >
            Vegetarian
          </button>
          <button
            type="button"
            className={`btn ${diet === "non_veg" ? "btn-nonveg" : "btn-secondary"}`}
            onClick={() => setDiet("non_veg")}
          >
            Non-Vegetarian
          </button>
        </div>
        <p>
          Selected: <DietBadge diet={diet} />
        </p>
      </div>

      {MEALS.map((meal) => {
        const s = scheduleFor(meal);
        const b = bookingFor(meal);
        const registered = isRegistered(meal);
        const cancellable = canCancel(meal);

        return (
          <div className="card" key={meal}>
            <h2 style={{ textTransform: "capitalize" }}>{meal}</h2>
            {!s ? (
              <>
                <p style={{ color: "var(--muted)" }}>
                  No menu for {date}. Admin must add schedule in{" "}
                  <strong>Menu admin</strong> for this date.
                </p>
              </>
            ) : (
              <>
                <MenuItemsList schedule={s} dietFilter={diet} />
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.75rem" }}>
                  Cutoff: {new Date(s.cutoffAt).toLocaleString()}
                  {!isBeforeCutoff(s.cutoffAt) && (
                    <span style={{ color: "var(--danger)" }}> (passed)</span>
                  )}
                </p>
                {b && (
                  <p style={{ marginTop: "0.5rem" }}>
                    <DietBadge diet={b.dietType} /> <StatusBadge status={b.status} />
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginTop: "0.75rem",
                  }}
                >
                  {!registered && (
                    <button
                      type="button"
                      className="btn"
                      disabled={
                        loadingMeal !== null || !isBeforeCutoff(s.cutoffAt)
                      }
                      onClick={() => book(meal)}
                    >
                      {loadingMeal === meal
                        ? "Working…"
                        : !isBeforeCutoff(s.cutoffAt)
                          ? "Cutoff passed"
                          : `Register ${meal}`}
                    </button>
                  )}
                  {registered && b?.status === "booked" && (
                    <button type="button" className="btn btn-registered" disabled>
                      Registered ✓
                    </button>
                  )}
                  {registered && b?.status === "served" && (
                    <button type="button" className="btn btn-registered" disabled>
                      Served ✓
                    </button>
                  )}
                  {cancellable && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      disabled={loadingMeal !== null}
                      onClick={() => cancel(meal)}
                    >
                      Cancel registration
                    </button>
                  )}
                  {b?.status === "booked" && !cancellable && (
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Cancel closed (cutoff passed)
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
