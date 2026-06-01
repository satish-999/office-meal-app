import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { DietType, ManualServeRecord, MealType, ServeEmployeeInfo } from "../../api/types";
import { DietBadge, RoleNav } from "../../components/Layout";

export function ManualServePage() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [date, setDate] = useState(tomorrowDate);
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [dietType, setDietType] = useState<DietType>("veg");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ServeEmployeeInfo | null>(null);
  const [history, setHistory] = useState<ManualServeRecord[]>([]);

  const loadHistory = useCallback(async () => {
    const { history: h } = await api.getManualServeHistory(date);
    setHistory(h);
  }, [date]);

  useEffect(() => {
    loadHistory().catch(() => setHistory([]));
  }, [loadHistory]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const res = await api.manualServe({
        employeeCode: employeeCode.trim().toUpperCase(),
        date,
        mealType,
        dietType,
        reason,
      });
      setResult(res.employee);
      setReason("");
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Manual serve failed");
    }
  }

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Manual register & serve</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          For network issues, emergencies, or hospitalization — requires a reason.
        </p>
        <form onSubmit={handleSubmit}>
          <label>Employee code</label>
          <input
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="EMP001"
            required
          />
          <div style={{ height: "0.75rem" }} />
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div style={{ height: "0.75rem" }} />
          <div className="grid-2">
            <div>
              <label>Meal</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div>
              <label>Diet</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as DietType)}
              >
                <option value="veg">Veg</option>
                <option value="non_veg">Non-Veg</option>
              </select>
            </div>
          </div>
          <div style={{ height: "0.75rem" }} />
          <label>Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. could not register — network down"
            required
            minLength={3}
          />
          <div style={{ height: "1rem" }} />
          <button type="submit" className="btn">
            Register & serve
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`card serve-result ${result.dietType === "veg" ? "veg" : "nonveg"}`}
        >
          <p className="success" style={{ margin: 0 }}>
            Served successfully
          </p>
          <h2 style={{ margin: "0.25rem 0" }}>{result.name}</h2>
          <p className="diet-big">{result.dietLabel}</p>
        </div>
      )}

      <div className="card">
        <h2>Manual serve history — {date}</h2>
        {history.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No manual serves on this date.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Employee</th>
                  <th>Meal</th>
                  <th>Diet</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{new Date(h.servedAt).toLocaleTimeString()}</td>
                    <td>
                      <strong>{h.employeeCode}</strong>
                      <br />
                      <span style={{ fontSize: "0.85rem" }}>{h.employeeName}</span>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{h.mealType}</td>
                    <td>
                      <DietBadge diet={h.dietType} />
                    </td>
                    <td>{h.manualReason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
