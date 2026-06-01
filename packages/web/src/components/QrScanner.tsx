import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const SCANNER_ID = "office-meal-qr-scanner";

interface QrScannerProps {
  onScan: (token: string) => void;
  onError?: (message: string) => void;
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [active, setActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const lastScanRef = useRef("");

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      /* ignore cleanup errors */
    }
    scannerRef.current = null;
    setActive(false);
  }

  async function startScanner() {
    setCameraError("");
    await stopScanner();

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          const token = decoded.trim();
          if (!token || token === lastScanRef.current) return;
          lastScanRef.current = token;
          onScan(token);
        },
        () => {
          /* scan attempt — no match yet */
        }
      );
      setActive(true);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Camera access denied or unavailable";
      setCameraError(msg);
      onError?.(msg);
      await stopScanner();
    }
  }

  return (
    <div className="qr-scanner-wrap">
      <div id={SCANNER_ID} className="qr-scanner-view" />
      {cameraError && (
        <p className="error" style={{ fontSize: "0.85rem" }}>
          {cameraError}. Use manual paste below or allow camera permission.
        </p>
      )}
      <button
        type="button"
        className={`btn ${active ? "btn-secondary" : ""}`}
        onClick={() => (active ? stopScanner() : startScanner())}
      >
        {active ? "Stop camera" : "Start camera scan"}
      </button>
    </div>
  );
}
