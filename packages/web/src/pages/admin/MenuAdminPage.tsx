import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { MealSchedule, MealType } from "../../api/types";
import { RoleNav } from "../../components/Layout";
import { MenuItemsList } from "../../components/MenuItemsList";
import { defaultMealCutoffLocal, toDatetimeLocalValue } from "../../utils/dates";
import {
  MEAL_ITEM_HINTS,
  getNonVegItems,
  getVegItems,
  itemsToText,
  parseMenuItems,
} from "../../utils/menuItems";

const MEALS: MealType[] = ["breakfast", "lunch", "dinner"];

const CUTOFF_HOURS: Record<MealType, number> = {
  breakfast: 6,
  lunch: 10,
  dinner: 16,
};

export function MenuAdminPage() {
  const [date, setDate] = useState(tomorrowDate);
  const [schedules, setSchedules] = useState<MealSchedule[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<MealType | null>(null);
  const [form, setForm] = useState({
    menuVegText: "",
    menuNonVegText: "",
    cutoffAt: "",
    capacity: 500,
  });

  const load = useCallback(async () => {
    const { schedules: s } = await api.listSchedules(date);
    setSchedules(s);
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  function startEdit(meal: MealType) {
    const existing = schedules.find((s) => s.mealType === meal && s.active);
    const hints = MEAL_ITEM_HINTS[meal];
    setEditing(meal);
    setForm({
      menuVegText: existing
        ? itemsToText(getVegItems(existing))
        : hints.veg,
      menuNonVegText: existing
        ? itemsToText(getNonVegItems(existing))
        : hints.nonVeg,
      cutoffAt: existing
        ? toDatetimeLocalValue(existing.cutoffAt)
        : defaultMealCutoffLocal(date, CUTOFF_HOURS[meal]),
      capacity: existing?.capacity ?? 500,
    });
    setMessage("");
    setError("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    const menuVegItems = parseMenuItems(form.menuVegText);
    const menuNonVegItems = parseMenuItems(form.menuNonVegText);
    if (menuVegItems.length === 0 && menuNonVegItems.length === 0) {
      setError("Add at least one veg or non-veg item.");
      return;
    }
    try {
      await api.saveSchedule({
        date,
        mealType: editing,
        menuVegItems,
        menuNonVegItems,
        cutoffAt: new Date(form.cutoffAt).toISOString(),
        capacity: form.capacity,
        active: true,
      });
      setMessage(`${editing} menu saved (${menuVegItems.length} veg, ${menuNonVegItems.length} non-veg items)`);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function deactivate(id: string, meal: MealType) {
    if (!confirm(`Deactivate ${meal} for ${date}?`)) return;
    setError("");
    try {
      await api.deleteSchedule(id);
      setMessage(`${meal} deactivated`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  const byMeal = (m: MealType) => schedules.find((s) => s.mealType === m && s.active);

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card">
        <h2>Menu & meal schedules</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Add dish names <strong>one per line</strong> (Idli, Sambar, Curd, etc.).
          Employees see items on the <strong>Menu</strong> tab and Register page.
        </p>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {MEALS.map((meal) => {
        const s = byMeal(meal);
        return (
          <div className="card" key={meal}>
            <h2 style={{ textTransform: "capitalize" }}>{meal}</h2>
            {s ? (
              <>
                <MenuItemsList schedule={s} />
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.75rem" }}>
                  Cutoff: {new Date(s.cutoffAt).toLocaleString()} · Capacity: {s.capacity}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                  <button type="button" className="btn" onClick={() => startEdit(meal)}>
                    Edit items
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deactivate(s.id, meal)}
                  >
                    Deactivate
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: "var(--muted)" }}>No active schedule</p>
                <button type="button" className="btn" onClick={() => startEdit(meal)}>
                  Add menu items
                </button>
              </>
            )}
          </div>
        );
      })}

      {editing && (
        <div className="card">
          <h2>Edit {editing} — dish list</h2>
          <form onSubmit={handleSave}>
            <label>Veg items (one per line)</label>
            <textarea
              value={form.menuVegText}
              onChange={(e) => setForm({ ...form, menuVegText: e.target.value })}
              placeholder={MEAL_ITEM_HINTS[editing].veg}
              rows={6}
            />
            <div style={{ height: "0.75rem" }} />
            <label>Non-veg items (one per line)</label>
            <textarea
              value={form.menuNonVegText}
              onChange={(e) => setForm({ ...form, menuNonVegText: e.target.value })}
              placeholder={MEAL_ITEM_HINTS[editing].nonVeg}
              rows={6}
            />
            <div style={{ height: "0.75rem" }} />
            <div className="grid-2">
              <div>
                <label>Registration cutoff</label>
                <input
                  type="datetime-local"
                  value={form.cutoffAt}
                  onChange={(e) => setForm({ ...form, cutoffAt: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
            <p style={{ marginTop: "0.75rem" }}>
              Preview: {parseMenuItems(form.menuVegText).length} veg ·{" "}
              {parseMenuItems(form.menuNonVegText).length} non-veg items
            </p>
            <div style={{ height: "1rem" }} />
            <button type="submit" className="btn">
              Save menu
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginLeft: "0.5rem" }}
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </>
  );
}
