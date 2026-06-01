import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api, tomorrowDate } from "../../api/client";
import type { Booking } from "../../api/types";
import { DietBadge, RoleNav, StatusBadge } from "../../components/Layout";

export function BookingsPage() {
  const [date, setDate] = useState(tomorrowDate);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [qrData, setQrData] = useState<{
    token: string;
    label: string;
    meal: string;
  } | null>(null);

  const load = useCallback(async () => {
    const { bookings: b } = await api.getBookings(date);
    setBookings(b);
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function showQr(id: string) {
    setError("");
    try {
      const q = await api.getQr(id);
      setQrData({
        token: q.qrToken,
        label: q.dietLabel,
        meal: q.mealType,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load QR");
    }
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setError("");
    try {
      await api.cancelBooking(id);
      await load();
      setQrData(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed");
    }
  }

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>My bookings</h2>
        <label htmlFor="bdate">Date</label>
        <input
          id="bdate"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="card">
        {bookings.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No bookings for this date.</p>
        ) : (
          <ul className="booking-list">
            {bookings.map((b) => (
              <li key={b.id}>
                <div>
                  <strong style={{ textTransform: "capitalize" }}>{b.mealType}</strong>
                  {" · "}
                  <DietBadge diet={b.dietType} />
                  {" · "}
                  <StatusBadge status={b.status} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {b.status === "booked" && (
                    <>
                      <button type="button" className="btn" onClick={() => showQr(b.id)}>
                        Show QR
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => cancel(b.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {qrData && (
        <div className="card">
          <h2>Meal QR — {qrData.meal}</h2>
          <div className="qr-box">
            <QRCodeSVG value={qrData.token} size={220} level="M" />
            <p>{qrData.label}</p>
            <p style={{ fontSize: "0.75rem", wordBreak: "break-all", maxWidth: "100%" }}>
              Show this at the counter. Server scans the code.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: "1rem" }}
            onClick={() => setQrData(null)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
