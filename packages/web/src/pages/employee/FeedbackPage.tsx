import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { DietType, Feedback, MealType } from "../../api/types";
import { DietBadge, RoleNav } from "../../components/Layout";

export function FeedbackPage() {
  const [date, setDate] = useState(tomorrowDate);
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [dietType, setDietType] = useState<DietType>("veg");
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  const [facilityNotes, setFacilityNotes] = useState("");
  const [history, setHistory] = useState<Feedback[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    const { feedback } = await api.getMyFeedback();
    setHistory(feedback);
  }, []);

  useEffect(() => {
    loadHistory().catch((e) => setError(e.message));
  }, [loadHistory]);

  function startEdit(item: Feedback) {
    setEditingId(item.id);
    setDate(item.date);
    setMealType(item.mealType);
    setDietType(item.dietType);
    setRating(item.rating);
    setComment(item.comment ?? "");
    setFacilityNotes(item.facilityNotes ?? "");
    setMessage("");
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setComment("");
    setFacilityNotes("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingId) {
        await api.updateFeedback(editingId, {
          rating,
          comment: comment || undefined,
          facilityNotes: facilityNotes || undefined,
        });
        setMessage("Feedback updated.");
        setEditingId(null);
      } else {
        await api.submitFeedback({
          date,
          mealType,
          dietType,
          rating,
          comment: comment || undefined,
          facilityNotes: facilityNotes || undefined,
        });
        setMessage("Feedback submitted.");
        setComment("");
        setFacilityNotes("");
      }
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <div className="card">
        <h2>{editingId ? "Edit feedback" : "Submit feedback"}</h2>
        {editingId && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginBottom: "1rem" }}
            onClick={cancelEdit}
          >
            Cancel edit
          </button>
        )}
        <form onSubmit={handleSubmit}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!!editingId}
          />

          <div style={{ height: "0.75rem" }} />

          <div className="grid-2">
            <div>
              <label>Meal</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                disabled={!!editingId}
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
                disabled={!!editingId}
              >
                <option value="veg">Veg</option>
                <option value="non_veg">Non-Veg</option>
              </select>
            </div>
          </div>

          <div style={{ height: "0.75rem" }} />

          <label>Rating (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />

          <div style={{ height: "0.75rem" }} />

          <label>Food quality / taste</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. lunch was undercooked"
          />

          <div style={{ height: "0.75rem" }} />

          <label>Dining area needs</label>
          <textarea
            value={facilityNotes}
            onChange={(e) => setFacilityNotes(e.target.value)}
            placeholder="e.g. water dispenser empty"
          />

          <div style={{ height: "1rem" }} />

          <button type="submit" className="btn">
            {editingId ? "Update feedback" : "Submit feedback"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Your feedback history</h2>
        {history.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No feedback yet.</p>
        ) : (
          <ul className="booking-list">
            {history.map((f) => (
              <li key={f.id}>
                <div>
                  <strong style={{ textTransform: "capitalize" }}>{f.mealType}</strong>
                  {" · "}
                  {f.date}
                  {" · "}
                  <DietBadge diet={f.dietType} />
                  {" · "}
                  <span>★ {f.rating}/5</span>
                  {f.updatedAt && (
                    <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                      {" "}
                      (edited)
                    </span>
                  )}
                  {f.comment && (
                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem" }}>{f.comment}</p>
                  )}
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => startEdit(f)}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
