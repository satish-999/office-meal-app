import { Fragment, useCallback, useEffect, useState } from "react";
import { api, tomorrowDate } from "../../api/client";
import type { BookingWithEmployee } from "../../api/types";
import { DietBadge, RoleNav, StatusBadge } from "../../components/Layout";

export function BookingsListPage() {
  const [date, setDate] = useState(tomorrowDate);
  const [bookings, setBookings] = useState<BookingWithEmployee[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { bookings: b } = await api.listBookings(date);
    setBookings(b);
  }, [date]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}

      <div className="card">
        <h2>All bookings (admin)</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Employee details are visible to admin only. Click a row for full details.
        </p>
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="card table-wrap">
        {bookings.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No bookings</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Meal</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Diet</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <Fragment key={b.id}>
                  <tr>
                    <td style={{ textTransform: "capitalize" }}>{b.mealType}</td>
                    <td>
                      <strong>{b.employee.employeeCode}</strong>
                    </td>
                    <td>{b.employee.name}</td>
                    <td>
                      <DietBadge diet={b.dietType} />
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: "0.35rem 0.6rem", fontSize: "0.8rem" }}
                        onClick={() =>
                          setExpandedId(expandedId === b.id ? null : b.id)
                        }
                      >
                        {expandedId === b.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === b.id && (
                    <tr>
                      <td colSpan={6}>
                        <div className="employee-detail-panel">
                          <p>
                            <strong>Email:</strong> {b.employee.email}
                          </p>
                          <p>
                            <strong>Department:</strong> {b.employee.department}
                          </p>
                          <p>
                            <strong>Booked at:</strong>{" "}
                            {new Date(b.bookedAt).toLocaleString()}
                          </p>
                          {b.servedAt && (
                            <p>
                              <strong>Served at:</strong>{" "}
                              {new Date(b.servedAt).toLocaleString()}
                            </p>
                          )}
                          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                            Internal ID: {b.employeeId}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
