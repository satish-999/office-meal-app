import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../../api/client";
import type { AdminEmployee } from "../../api/types";
import { RoleNav } from "../../components/Layout";

const SAMPLE_CSV = `employeeCode,name,email,department,defaultDiet,role,active
EMP003,Anita Rao,anita@company.com,Finance,veg,employee,true
EMP004,Vikram Singh,vikram@company.com,Ops,non_veg,employee,true`;

export function EmployeesAdminPage() {
  const [csv, setCsv] = useState(SAMPLE_CSV);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { employees: list } = await api.listEmployees();
    setEmployees(list);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function handleImport(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await api.importEmployees(csv);
      setMessage(
        `Import done: ${result.created} created, ${result.updated} updated` +
          (result.errors.length
            ? `. ${result.errors.length} row error(s) — see below.`
            : ".")
      );
      if (result.errors.length) {
        setError(result.errors.join("\n"));
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <RoleNav />
      {error && (
        <div className="error" style={{ whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}
      {message && <div className="success">{message}</div>}

      <div className="card">
        <h2>Import employees (CSV)</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Paste HR export. Existing codes are updated; new codes are added.
        </p>
        <form onSubmit={handleImport}>
          <label htmlFor="csv">CSV text</label>
          <textarea
            id="csv"
            rows={8}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "0.85rem" }}
          />
          <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Columns: employeeCode, name, email, department, defaultDiet (veg/non_veg),
            role (employee/server/admin), active (true/false)
          </p>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Importing…" : "Import CSV"}
          </button>
        </form>
      </div>

      <div className="card table-wrap">
        <h2>All employees ({employees.length})</h2>
        {employees.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No employees yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Diet</th>
                <th>Role</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.employeeCode}</strong>
                  </td>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.department}</td>
                  <td>{e.defaultDiet}</td>
                  <td>{e.role}</td>
                  <td>{e.active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
