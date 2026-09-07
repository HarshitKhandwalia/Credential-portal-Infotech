import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Loader,
} from "lucide-react";
import { API_BASE_URL } from "./config";

export default function Scanner({ onBack }) {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState("");

  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  /*
   * Process credential code
   */
  const processScan = async (credential) => {
    if (processingRef.current) return;

    processingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}scan/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credential,
          device_id: "gate-1",
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      setScanResult(data);
    } catch (err) {
      console.error("Scan error:", err);
      setError("Failed to connect to backend. Is Django running?");
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  };

  /*
   * Initialize QR scanner
   */
  useEffect(() => {
    // Don't create scanner while result screen is visible
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 300,
      },
      false
    );

    const onScanSuccess = (decodedText) => {
      const credential = decodedText.trim();

      if (!credential) return;

      processScan(credential);
    };

    const onScanError = () => {
      // Normal scanning errors are ignored.
    };

    scanner.render(onScanSuccess, onScanError);

    scannerRef.current = scanner;

    /*
     * IMPORTANT:
     * Clean up THIS scanner instance.
     * Don't use scannerRef.current here because React can
     * create another instance during development/StrictMode.
     */
    return () => {
      scanner
        .clear()
        .catch((err) => {
          console.error("Scanner cleanup error:", err);
        });

      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }
    };
  }, [scanResult]);

  /*
   * Manual 6-digit entry
   */
  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      setError("Please enter a 6-digit code");
      return;
    }

    if (manualCode.length !== 6) {
      setError("Code must be exactly 6 digits");
      return;
    }

    processScan(manualCode.trim());
    setManualCode("");
  };

  /*
   * Reset scanner/result
   */
  const handleReset = () => {
    setScanResult(null);
    setError(null);
    setManualCode("");
    processingRef.current = false;
  };

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />

            <span className="text-sm font-medium">
              Back to Portal
            </span>
          </button>

          <h1 className="text-2xl font-bold text-slate-800">
            QR Scanner
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-8">
        {!scanResult ? (
          <>
            {/* Camera Scanner */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-slate-800">
                Scan Credential
              </h2>

              <p className="mb-6 text-sm text-slate-600">
                Point your camera at the employee's credential code
              </p>

              {/* Error */}
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle
                    size={20}
                    className="text-red-600"
                  />

                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* QR Scanner */}
              <div
                id="qr-reader"
                className="w-full overflow-hidden rounded-lg"
              />

              {/* Loading */}
              {loading && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Loader
                    size={18}
                    className="animate-spin text-slate-600"
                  />

                  <p className="text-sm text-slate-600">
                    Processing scan...
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 border-t border-slate-200" />

              <span className="text-sm text-slate-500">
                OR
              </span>

              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Manual Entry */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <QrCode
                    size={20}
                    className="text-amber-600"
                  />
                </div>

                <h2 className="text-lg font-semibold text-slate-800">
                  Manual Entry
                </h2>
              </div>

              <p className="mb-4 text-sm text-slate-600">
                If camera isn't working, enter 6-digit code manually:
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setManualCode(value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      manualCode.length === 6 &&
                      !loading
                    ) {
                      handleManualSubmit();
                    }
                  }}
                  placeholder="e.g., 123456"
                  maxLength={6}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-center text-lg font-semibold outline-none focus:border-[#2D5A5D] focus:ring-2 focus:ring-[#2D5A5D]/20 disabled:bg-slate-100"
                />

                <button
                  onClick={handleManualSubmit}
                  disabled={manualCode.length !== 6 || loading}
                  className="rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#234749] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "..." : "Submit"}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* RESULT CARD */
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {scanResult.status === "SUCCESS" ? (
              /* SUCCESS */
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2
                      size={32}
                      className="text-emerald-600"
                    />
                  </div>
                </div>

                <h2 className="mb-2 text-2xl font-bold text-emerald-600">
                  ✓ Attendance Marked
                </h2>

                <p className="mb-6 text-slate-600">
                  {scanResult.message}
                </p>

                {scanResult.employee && (
                  <div className="mb-6 rounded-lg bg-slate-50 p-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Name
                        </p>

                        <p className="text-lg font-semibold text-slate-800">
                          {scanResult.employee.name}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Credential
                        </p>

                        <p className="text-sm text-slate-600">
                          {scanResult.employee.credential}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Email
                        </p>

                        <p className="text-sm text-slate-600">
                          {scanResult.employee.email || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Membership ID
                        </p>

                        <p className="text-sm text-slate-600">
                          {scanResult.employee.membership_id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
                >
                  Scan Next Employee
                </button>
              </div>
            ) : scanResult.status === "DUPLICATE" ? (
              /* DUPLICATE */
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle
                      size={32}
                      className="text-amber-600"
                    />
                  </div>
                </div>

                <h2 className="mb-2 text-2xl font-bold text-amber-600">
                  ⚠ Already Scanned
                </h2>

                <p className="mb-6 text-slate-600">
                  This employee has already marked attendance.
                </p>

                {scanResult.employee && (
                  <div className="mb-6 rounded-lg bg-slate-50 p-6">
                    <p className="text-lg font-semibold text-slate-800">
                      {scanResult.employee.name}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
                >
                  Scan Another Code
                </button>
              </div>
            ) : (
              /* NOT FOUND */
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle
                      size={32}
                      className="text-red-600"
                    />
                  </div>
                </div>

                <h2 className="mb-2 text-2xl font-bold text-red-600">
                  ✗ Not Found
                </h2>

                <p className="mb-6 text-slate-600">
                  No employee found with this credential.
                </p>

                <button
                  onClick={handleReset}
                  className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
                >
                  Try Another Code
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}