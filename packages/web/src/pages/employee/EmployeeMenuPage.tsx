import { useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { DietType, MealSchedule, MealType } from "../../api/types";
import { MenuItemsList } from "../../components/MenuItemsList";
import { DietBadge, RoleNav } from "../../components/Layout";
import { useAuth } from "../../auth/AuthContext";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

export function EmployeeMenuPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(tomorrowDate);
  const [diet, setDiet] = useState<DietType>(user?.defaultDiet ?? "veg");
  const [schedules, setSchedules] = useState<MealSchedule[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { schedules: s } = await api.getSchedules(date);
    setSchedules(s.filter((x) => x.active));
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  const byMeal = (m: MealType) => schedules.find((s) => s.mealType === m);

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Today&apos;s menu</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Tap <strong>Veg</strong> or <strong>Non-Veg</strong> to see only those dishes
          for each meal.
        </p>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <div style={{ height: "1rem" }} />

        <label>Show menu for</label>
        <div className="grid-2">
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
        <p style={{ marginTop: "0.75rem" }}>
          Viewing: <DietBadge diet={diet} /> items only
        </p>
      </div>

      {MEALS.map((meal) => {
        const s = byMeal(meal);
        return (
          <div className="card" key={meal}>
            <h2 style={{ textTransform: "capitalize" }}>{meal}</h2>
            {!s ? (
              <p style={{ color: "var(--muted)" }}>
                No menu published for {date}. Admin can add items in Menu admin.
              </p>
            ) : (
              <>
                <MenuItemsList schedule={s} dietFilter={diet} />
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "1rem" }}>
                  Registration cutoff: {new Date(s.cutoffAt).toLocaleString()}
                </p>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
