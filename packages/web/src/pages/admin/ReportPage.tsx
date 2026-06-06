import { useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { DailyMealReport } from "../../api/types";
import { RoleNav } from "../../components/Layout";

export function ReportPage() {
  const [date, setDate] = useState(tomorrowDate);
  const [meals, setMeals] = useState<DailyMealReport[]>([]);
  const [error, setError] = useState("");
  const [jobMessage, setJobMessage] = useState("");
  const [jobLoading, setJobLoading] = useState(false);

  const load = useCallback(async () => {
    const { meals: m } = await api.dailyReport(date);
    setMeals(m);
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function processNoShows() {
    if (!confirm(`Mark no-shows for ${date}? (Registered but not served)`)) return;
    setJobLoading(true);
    setJobMessage("");
    setError("");
    try {
      const result = await api.processNoShows(date);
      setJobMessage(`Processed ${result.processed} no-show(s). Mock emails logged on server.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No-show job failed");
    } finally {
      setJobLoading(false);
    }
  }

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Daily meal report</h2>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div style={{ height: "1rem" }} />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={processNoShows}
          disabled={jobLoading}
        >
          {jobLoading ? "Processing…" : "Process no-shows for this date"}
        </button>
        {jobMessage && (
          <p className="success" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
            {jobMessage}
          </p>
        )}
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
