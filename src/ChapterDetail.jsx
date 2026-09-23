import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, ArrowLeft, X, Calendar, Repeat } from "lucide-react";
import logo from "./assets/logoEI.jpeg";
import { API_ROOT } from "./config";
import PortalNav from "./PortalNav";
import { toast } from "./toast";

function localInputToIso(localValue) {
  if (!localValue) return null;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function localDateFromDatetimeLocal(localValue) {
  if (!localValue) return null;
  return localValue.slice(0, 10);
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusBadge(status) {
  const styles = {
    scheduled: "bg-blue-50 text-blue-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-slate-100 text-slate-500",
  };
  return styles[status] || "bg-slate-100 text-slate-600";
}

function SessionModal({ mode, onClose, onSave, onSaveRecurring, onDone }) {
  const isRecurring = mode === "recurring";
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const startsIso = localInputToIso(startsAt);
    const endsIso = localInputToIso(endsAt);

    if (!startsIso || !endsIso) {
      setError("Start and end times are required.");
      return;
    }
    if (new Date(endsIso) <= new Date(startsIso)) {
      setError("End time must be after start time.");
      return;
    }

    if (isRecurring) {
      if (!title.trim()) {
        setError("Series title is required.");
        return;
      }
      if (!recurrenceEndDate) {
        setError("Recurrence end date is required.");
        return;
      }
      const startDate = localDateFromDatetimeLocal(startsAt);
      if (startDate && recurrenceEndDate < startDate) {
        setError("Recurrence end date must be on or after the first meeting date.");
        return;
      }

      setSubmitting(true);
      setError("");
      try {
        const data = await onSaveRecurring({
          title: title.trim(),
          starts_at: startsIso,
          ends_at: endsIso,
          recurrence_end_date: recurrenceEndDate,
        });
        setResult(data);
        setSubmitting(false);
      } catch (err) {
        setError(err.message || "Failed to create recurring sessions.");
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        starts_at: startsIso,
        ends_at: endsIso,
        status,
      };
      if (title.trim()) payload.title = title.trim();
      await onSave(payload);
    } catch (err) {
      setError(err.message || "Failed to create session.");
      setSubmitting(false);
    }
  };

  const handleDone = async () => {
    await onDone();
  };

  if (result) {
    const created = Array.isArray(result.sessions) ? result.sessions : [];
    const capped = result.count === result.capped_at;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-[#2D5A5D] px-6 py-5 text-white">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                <Repeat size={18} />
              </div>
              <h2 className="text-lg font-semibold leading-tight">
                Created {result.count ?? created.length} sessions
              </h2>
            </div>
          </div>

          <div className="px-6 py-6 space-y-4">
            {capped && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                Only the first {result.capped_at} sessions were created (series capped at{" "}
                {result.capped_at}).
              </div>
            )}

            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
              <ul className="divide-y divide-slate-100">
                {created.map((session) => (
                  <li key={session.id} className="px-4 py-3 text-sm">
                    <div className="font-medium text-slate-800">
                      {session.title || `Session #${session.id}`}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {formatDateTime(session.starts_at)} – {formatDateTime(session.ends_at)}
                      {session.status ? (
                        <span
                          className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusBadge(session.status)}`}
                        >
                          {session.status}
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleDone}
                className="rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#234749]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-[#2D5A5D] px-6 py-5 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              {isRecurring ? <Repeat size={18} /> : <Calendar size={18} />}
            </div>
            <h2 className="text-lg font-semibold leading-tight">
              {isRecurring ? "Recurring Sessions" : "New Session"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {isRecurring && (
            <p className="text-xs text-slate-500">
              Creates weekly sessions on the same weekday as the first start time, until the end
              date or a maximum of 10 sessions.
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isRecurring ? (
                <>
                  Series title <span className="text-red-500">*</span>
                </>
              ) : (
                "Title"
              )}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRecurring ? "Yoga Class" : "Week 1 (optional)"}
              required={isRecurring}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {isRecurring ? "First starts at" : "Starts at"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {isRecurring ? "First ends at" : "Ends at"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          </div>

          {isRecurring ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Recurrence end date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#234749] disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : isRecurring
                  ? "Create Recurring"
                  : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChapterDetail() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createMode, setCreateMode] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [chapterRes, sessionsRes] = await Promise.all([
        fetch(`${API_ROOT}/chapters/${chapterId}/`),
        fetch(`${API_ROOT}/chapters/${chapterId}/sessions/`),
      ]);
      if (!chapterRes.ok) throw new Error(`Chapter ${chapterRes.status}`);
      if (!sessionsRes.ok) throw new Error(`Sessions ${sessionsRes.status}`);
      const chapterData = await chapterRes.json();
      const sessionsData = await sessionsRes.json();
      setChapter(chapterData);
      setSessions(Array.isArray(sessionsData) ? sessionsData : sessionsData.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chapter details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [chapterId]);

  const handleCreateSession = async (payload) => {
    const res = await fetch(`${API_ROOT}/chapters/${chapterId}/sessions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err) || `Create failed (${res.status})`);
    }
    setCreateMode(null);
    await load();
  };

  const handleCreateRecurring = async (payload) => {
    const res = await fetch(`${API_ROOT}/chapters/${chapterId}/sessions/recurring/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err) || `Create failed (${res.status})`);
    }
    return res.json();
  };

  const handleRecurringDone = async () => {
    setCreateMode(null);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Enterprise-Infotech Logo" className="h-14 w-auto object-contain" />
            <PortalNav />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCreateMode("one-off")}
              className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234749]"
            >
              <Plus size={16} />
              New Session
            </button>
            <button
              onClick={() => setCreateMode("recurring")}
              className="flex items-center gap-2 rounded-lg border border-[#2D5A5D] bg-white px-4 py-2 text-sm font-semibold text-[#2D5A5D] transition hover:bg-[#EEF4F4]"
            >
              <Repeat size={16} />
              Recurring
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          to="/chapters"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#2D5A5D]"
        >
          <ArrowLeft size={16} />
          Back to Chapters
        </Link>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Loading...
          </div>
        ) : !chapter ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            Chapter not found.
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{chapter.name}</h1>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    chapter.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {chapter.is_active ? "Active" : "Archived"}
                </span>
              </div>
              {chapter.description && (
                <p className="mt-1 text-sm text-slate-500">{chapter.description}</p>
              )}
            </div>

            <h2 className="mb-3 text-lg font-semibold text-slate-800">Sessions</h2>

            {sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
                No sessions yet. Create a one-off or recurring series for this chapter.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Starts</th>
                        <th className="px-6 py-4">Ends</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-medium">
                            <Link
                              to={`/sessions/${session.id}`}
                              className="text-[#2D5A5D] hover:underline"
                            >
                              {session.title || `Session #${session.id}`}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                            {formatDateTime(session.starts_at)}
                          </td>
                          <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                            {formatDateTime(session.ends_at)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadge(session.status)}`}
                            >
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {createMode && (
        <SessionModal
          mode={createMode}
          onClose={() => setCreateMode(null)}
          onSave={handleCreateSession}
          onSaveRecurring={handleCreateRecurring}
          onDone={handleRecurringDone}
        />
      )}
    </div>
  );
}
