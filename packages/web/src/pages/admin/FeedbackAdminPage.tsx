import { useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { FeedbackWithEmployee } from "../../api/types";
import { DietBadge, RoleNav } from "../../components/Layout";

export function FeedbackAdminPage() {
  const [date, setDate] = useState(tomorrowDate);
  const [feedback, setFeedback] = useState<FeedbackWithEmployee[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { feedback: f } = await api.listAdminFeedback(date);
    setFeedback(f);
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>Employee feedback</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Meal ratings and dining-area notes for the selected date.
        </p>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="card table-wrap">
        {feedback.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No feedback for this date.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Meal</th>
                <th>Diet</th>
                <th>Rating</th>
                <th>Meal comment</th>
                <th>Dining area</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id}>
                  <td>
                    <strong>{f.employee.employeeCode}</strong>
                    <br />
                    <span style={{ fontSize: "0.85rem" }}>{f.employee.name}</span>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{f.mealType}</td>
                  <td>
                    <DietBadge diet={f.dietType} />
                  </td>
                  <td>{f.rating}/5</td>
                  <td>{f.comment || "—"}</td>
                  <td>{f.facilityNotes || "—"}</td>
                  <td>{new Date(f.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
