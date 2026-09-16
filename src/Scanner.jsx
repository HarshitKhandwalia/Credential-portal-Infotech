import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader,
  BookOpen,
  Calendar,
} from "lucide-react";
import { API_BASE_URL, API_ROOT } from "./config";
import PortalNav from "./PortalNav";

function formatDateTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Scanner() {
  const [step, setStep] = useState("chapter"); // chapter | session | scan
  const [chapters, setChapters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    const loadChapters = async () => {
      setLoadingLists(true);
      try {
        const res = await fetch(`${API_ROOT}/chapters/?is_active=true`);
        if (!res.ok) throw new Error(`Failed to load chapters (${res.status})`);
        const data = await res.json();
        setChapters(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load chapters. Is the backend running?");
      } finally {
        setLoadingLists(false);
      }
    };
    loadChapters();
  }, []);

  const selectChapter = async (chapter) => {
    setSelectedChapter(chapter);
    setSelectedSession(null);
    setScanResult(null);
    setError(null);
    setLoadingSessions(true);
    setStep("session");
    try {
      const res = await fetch(`${API_ROOT}/chapters/${chapter.id}/sessions/`);
      if (!res.ok) throw new Error(`Failed to load sessions (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setSessions(list.filter((s) => s.status !== "cancelled"));
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions for this chapter.");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const selectSession = (session) => {
    setSelectedSession(session);
    setScanResult(null);
    setError(null);
    setStep("scan");
  };

  const changeChapter = () => {
    setStep("chapter");
    setSelectedChapter(null);
    setSelectedSession(null);
    setSessions([]);
    setScanResult(null);
    setError(null);
  };

  const changeSession = () => {
    setStep("session");
    setSelectedSession(null);
    setScanResult(null);
    setError(null);
  };

  const processScan = async (credential) => {
    if (processingRef.current) return;
    if (!selectedSession?.id) {
      setError("Select a session before scanning.");
      return;
    }

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
          credential,
          session_id: selectedSession.id,
          device_id: "gate-1",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 400 || data.status === "INVALID") {
        setScanResult({
          status: "INVALID",
          message: data.message || data.detail || "Invalid scan request.",
          employee: data.employee || null,
        });
        return;
      }

      if (!response.ok && !data.status) {
        throw new Error(`Backend returned ${response.status}`);
      }

      setScanResult(data);
    } catch (err) {
      console.error("Scan error:", err);
      setError("Failed to connect to backend. Is Django running?");
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  };

  useEffect(() => {
    if (step !== "scan" || scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 300,
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText) => {
      const credential = decodedText.trim();
      if (!credential) return;
      processScan(credential);
    };

    const onScanError = () => {};

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch((err) => {
        console.error("Scanner cleanup error:", err);
      });
      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }
    };
  }, [step, scanResult, selectedSession]);

  const handleReset = () => {
    setScanResult(null);
    setError(null);
    processingRef.current = false;
  };

  const renderResult = () => {
    const status = scanResult?.status;
    const message = scanResult?.message;
    const person = scanResult?.employee || scanResult?.data || null;
    const personType = scanResult?.type || person?.type || "member";
    const typeLabel =
      personType === "visitor"
        ? "Visitor"
        : personType === "substitute"
          ? "Substitute"
          : "Member";

    if (status === "SUCCESS") {
      return (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-emerald-600">Attendance Marked</h2>
          <p className="mb-6 text-slate-600">{message || "First scan for this session."}</p>
          {person && (
            <div className="mb-6 rounded-lg bg-slate-50 p-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Name</p>
                  <p className="text-lg font-semibold text-slate-800">{person.name}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Type</p>
                  <p className="text-sm font-medium text-slate-700">{typeLabel}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Credential</p>
                  <p className="text-sm text-slate-600">{person.credential || "N/A"}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    {personType === "member" ? "Membership ID" : "For Member"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {personType === "member"
                      ? person.membership_id || "N/A"
                      : person.member_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Email</p>
                  <p className="text-sm text-slate-600">{person.email || "N/A"}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-500">Phone</p>
                  <p className="text-sm text-slate-600">{person.phone || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleReset}
            className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
          >
            Scan Next
          </button>
        </div>
      );
    }

    if (status === "DUPLICATE") {
      return (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-amber-600">Already Scanned</h2>
          <p className="mb-6 text-slate-600">
            {message || "This person has already marked attendance for this session."}
          </p>
          {person && (
            <div className="mb-6 rounded-lg bg-slate-50 p-6">
              <p className="text-lg font-semibold text-slate-800">{person.name}</p>
              <p className="mt-1 text-sm text-slate-500">{typeLabel}</p>
              {person.member_name && personType !== "member" && (
                <p className="mt-1 text-sm text-slate-500">For: {person.member_name}</p>
              )}
            </div>
          )}
          <button
            onClick={handleReset}
            className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
          >
            Scan Another Code
          </button>
        </div>
      );
    }

    if (status === "WRONG_CHAPTER") {
      return (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-amber-700">Wrong Chapter</h2>
          <p className="mb-6 text-slate-600">
            {message || "This credential belongs to a different chapter than this session."}
          </p>
          {person && (
            <div className="mb-6 rounded-lg bg-slate-50 p-6">
              <p className="text-lg font-semibold text-slate-800">{person.name}</p>
              {person.chapter_name && (
                <p className="mt-1 text-sm text-slate-500">Chapter: {person.chapter_name}</p>
              )}
            </div>
          )}
          <button
            onClick={handleReset}
            className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
          >
            Try Another Code
          </button>
        </div>
      );
    }

    if (status === "INVALID") {
      return (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle size={32} className="text-red-600" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-red-600">Invalid</h2>
          <p className="mb-6 text-slate-600">
            {message || "Bad credential, missing session, or cancelled session."}
          </p>
          <button
            onClick={handleReset}
            className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
          >
            Try Again
          </button>
        </div>
      );
    }

    // NOT_FOUND and fallback
    return (
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle size={32} className="text-red-600" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-red-600">Not Found</h2>
        <p className="mb-6 text-slate-600">
          {message || "No employee found with this credential."}
        </p>
        <button
          onClick={handleReset}
          className="w-full rounded-lg bg-[#2D5A5D] px-6 py-3 text-sm font-semibold text-white hover:bg-[#234749]"
        >
          Try Another Code
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2D5A5D]/40 hover:bg-[#2D5A5D]/5 hover:text-[#2D5A5D]"
            >
              <ArrowLeft size={16} />
              Back to Portal
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">QR Scanner</h1>
          </div>
          <PortalNav />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {(selectedChapter || selectedSession) && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                {selectedChapter && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <BookOpen size={15} className="shrink-0 text-[#2D5A5D]" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Chapter
                      </p>
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {selectedChapter.name}
                      </p>
                    </div>
                  </div>
                )}
                {selectedSession && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <Calendar size={15} className="shrink-0 text-[#2D5A5D]" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Session
                      </p>
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {selectedSession.title || `Session #${selectedSession.id}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedChapter && (
                  <button
                    type="button"
                    onClick={changeChapter}
                    className="inline-flex items-center justify-center rounded-lg border border-[#2D5A5D]/30 bg-white px-3 py-2 text-xs font-semibold text-[#2D5A5D] transition hover:bg-[#2D5A5D] hover:text-white"
                  >
                    Change Chapter
                  </button>
                )}
                {selectedSession && (
                  <button
                    type="button"
                    onClick={changeSession}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#2D5A5D]/40 hover:bg-[#2D5A5D]/5 hover:text-[#2D5A5D]"
                  >
                    Change Session
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === "chapter" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-800">Select Chapter</h2>
            <p className="mb-6 text-sm text-slate-600">
              Choose the chapter whose session you are scanning for.
            </p>
            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle size={20} className="text-red-600" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}
            {loadingLists ? (
              <p className="text-sm text-slate-500">Loading chapters...</p>
            ) : chapters.length === 0 ? (
              <p className="text-sm text-slate-400">
                No active chapters. Create one under Chapters first.
              </p>
            ) : (
              <ul className="space-y-2">
                {chapters.map((ch) => (
                  <li key={ch.id}>
                    <button
                      type="button"
                      onClick={() => selectChapter(ch)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:border-[#2D5A5D] hover:bg-[#2D5A5D]/5"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D5A5D]/10 text-[#2D5A5D]">
                          <BookOpen size={16} />
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{ch.name}</span>
                      </span>
                      <span className="rounded-lg bg-[#2D5A5D] px-3 py-1.5 text-xs font-semibold text-white">
                        Select
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === "session" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-800">Select Session</h2>
            <p className="mb-6 text-sm text-slate-600">
              Attendance is recorded per session. Cancelled sessions cannot be scanned.
            </p>
            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle size={20} className="text-red-600" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}
            {loadingSessions ? (
              <p className="text-sm text-slate-500">Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-slate-400">
                No scannable sessions for this chapter.
              </p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <button
                      type="button"
                      onClick={() => selectSession(session)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:border-[#2D5A5D] hover:bg-[#2D5A5D]/5"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2D5A5D]/10 text-[#2D5A5D]">
                          <Calendar size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-800">
                            {session.title || `Session #${session.id}`}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {formatDateTime(session.starts_at)}
                            {session.status ? ` · ${session.status}` : ""}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 rounded-lg bg-[#2D5A5D] px-3 py-1.5 text-xs font-semibold text-white">
                        Select
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === "scan" && (
          <>
            {!scanResult ? (
              <>
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h2 className="mb-2 text-lg font-semibold text-slate-800">Scan Credential</h2>
                  <p className="mb-6 text-sm text-slate-600">
                    Point your camera at the credential code for{" "}
                    <span className="font-medium text-slate-800">
                      {selectedSession?.title || `Session #${selectedSession?.id}`}
                    </span>
                    .
                  </p>

                  {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                      <AlertCircle size={20} className="text-red-600" />
                      <p className="text-sm font-medium text-red-600">{error}</p>
                    </div>
                  )}

                  <div id="qr-reader" className="w-full overflow-hidden rounded-lg" />

                  {loading && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Loader size={18} className="animate-spin text-slate-600" />
                      <p className="text-sm text-slate-600">Processing scan...</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                {renderResult()}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
