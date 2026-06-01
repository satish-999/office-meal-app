import { FormEvent, useCallback, useRef, useState } from "react";
import { api } from "../../api/client";
import type { ServeEmployeeInfo } from "../../api/types";
import { RoleNav } from "../../components/Layout";
import { QrScanner } from "../../components/QrScanner";

export function ScanPage() {
  const [qrToken, setQrToken] = useState("");
  const [counterId, setCounterId] = useState("counter-1");
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ServeEmployeeInfo | null>(null);
  const busyRef = useRef(false);

  const processScan = useCallback(
    async (token: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setScanning(true);
      setError("");
      setResult(null);
      try {
        const res = await api.scanQr(token.trim(), counterId || undefined);
        setResult(res.employee);
        setQrToken("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scan failed");
      } finally {
        busyRef.current = false;
        setScanning(false);
      }
    },
    [counterId]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await processScan(qrToken);
  }

  return (
    <>
      <RoleNav />
      {error && <div className="error">{error}</div>}
      {scanning && <div className="success">Validating QR…</div>}

      <div className="card">
        <h2>Scan employee QR</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Point camera at employee QR from <strong>My bookings → Show QR</strong>.
        </p>
        <label>Counter ID</label>
        <input
          value={counterId}
          onChange={(e) => setCounterId(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <QrScanner onScan={processScan} onError={setError} />
      </div>

      <div className="card">
        <h2>Or paste token manually</h2>
        <form onSubmit={handleSubmit}>
          <label>QR token</label>
          <textarea
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            placeholder="Paste JWT if camera unavailable"
            rows={3}
          />
          <div style={{ height: "1rem" }} />
          <button type="submit" className="btn btn-secondary" disabled={!qrToken.trim()}>
            Validate & serve
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`card serve-result ${result.dietType === "veg" ? "veg" : "nonveg"}`}
        >
          <p style={{ margin: 0, color: "var(--muted)" }}>Serve this meal</p>
          <h2 style={{ margin: "0.25rem 0" }}>{result.name}</h2>
          <p style={{ margin: 0 }}>{result.employeeCode}</p>
          <p className="diet-big">{result.dietLabel}</p>
          <p style={{ textTransform: "capitalize", margin: 0 }}>{result.mealType}</p>
        </div>
      )}
    </>
  );
}
