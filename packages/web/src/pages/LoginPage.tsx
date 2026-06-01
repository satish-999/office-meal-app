import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../api/types";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [employeeCode, setEmployeeCode] = useState("EMP001");
  const [role, setRole] = useState<Role>("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(employeeCode.trim().toUpperCase(), role);
      if (role === "employee") navigate("/employee");
      else if (role === "server") navigate("/server");
      else navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function quickFill(code: string, r: Role) {
    setEmployeeCode(code);
    setRole(r);
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

          <div style={{ height: "1rem" }} />

          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="employee">Employee</option>
            <option value="server">Server / Cafeteria</option>
            <option value="admin">Admin</option>
          </select>

          <div style={{ height: "1.25rem" }} />

          <button type="submit" className="btn" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem" }}>
          <label>Quick demo login</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickFill("EMP001", "employee")}
            >
              EMP001 — Employee
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickFill("SRV001", "server")}
            >
              SRV001 — Server
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => quickFill("ADM001", "admin")}
            >
              ADM001 — Admin
            </button>
          </div>
        </div>

        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "1.5rem" }}>
          API must be running: <code>npm run dev:api</code> in project folder.
          <br />
          Then open this app: <code>npm run dev:web</code>
        </p>
      </div>
    </div>
  );
}
