import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../api/types";

const isLocalDev =
  import.meta.env.DEV &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [employeeCode, setEmployeeCode] = useState("EMP001");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToRole(role: Role) {
    if (role === "employee") navigate("/employee");
    else if (role === "server") navigate("/server");
    else navigate("/admin");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(employeeCode.trim().toUpperCase());
      goToRole(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(code: string) {
    setEmployeeCode(code);
    setError("");
    setLoading(true);
    try {
      const user = await login(code);
      goToRole(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1 style={{ marginTop: 0 }}>Office Meal</h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          Register meals, scan QR at counter, view veg/non-veg counts.
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="code">Employee code</label>
          <input
            id="code"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="EMP001"
            required
          />

          <div style={{ height: "1.25rem" }} />

          <button type="submit" className="btn" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem" }}>
          <label>Quick demo login</label>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0.25rem 0 0.75rem" }}>
            Role is assigned automatically (employee / server / admin).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickLogin("EMP001")}
              disabled={loading}
            >
              EMP001 — Employee
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickLogin("SRV001")}
              disabled={loading}
            >
              SRV001 — Server
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickLogin("ADM001")}
              disabled={loading}
            >
              ADM001 — Admin
            </button>
          </div>
        </div>

        {isLocalDev && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "1.5rem" }}>
            Local dev: run <code>npm run dev</code> in the project folder.
          </p>
        )}
      </div>
    </div>
  );
}
