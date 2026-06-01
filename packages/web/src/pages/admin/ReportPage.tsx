import { useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { DailyMealReport } from "../../api/types";
import { RoleNav } from "../../components/Layout";

export function ReportPage() {
  const [date, setDate] = useState(tomorrowDate);
  const [meals, setMeals] = useState<DailyMealReport[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { meals: m } = await api.dailyReport(date);
    setMeals(m);
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Daily meal report</h2>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Meal</th>
              <th>Registered</th>
              <th>Served</th>
              <th>No-show</th>
              <th>Veg reg.</th>
              <th>Non-veg reg.</th>
              <th>Veg served</th>
              <th>Non-veg served</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((m) => (
              <tr key={m.mealType}>
                <td style={{ textTransform: "capitalize" }}>{m.mealType}</td>
                <td>{m.registered}</td>
                <td>{m.served}</td>
                <td>{m.noShow}</td>
                <td>{m.vegRegistered}</td>
                <td>{m.nonVegRegistered}</td>
                <td>{m.vegServed}</td>
                <td>{m.nonVegServed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
