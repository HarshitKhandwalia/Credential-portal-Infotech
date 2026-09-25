import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, RefreshCw, Download } from "lucide-react";
import logo from "./assets/logoEI.jpeg";
import { API_ROOT } from "./config";
import PortalNav from "./PortalNav";
import { toast } from "./toast";

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(localValue) {
  if (!localValue) return null;
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function entrySessionId(entry) {
  if (entry?.session_id != null) return entry.session_id;
  if (typeof entry?.session === "object" && entry.session?.id != null) return entry.session.id;
  if (entry?.session != null && typeof entry.session !== "object") return entry.session;
  return null;
}

function isGuestScanned(entry) {
  if (entry?.scanned_at) return true;
  return String(entry?.status || "").toLowerCase() === "scanned";
}

function personTypeLabel(type) {
  if (type === "visitor") return "Visitor";
  if (type === "substitute") return "Substitute";
  return "Member";
}

function personTypeBadgeClass(type) {
  if (type === "visitor") return "bg-blue-100 text-blue-700";
  if (type === "substitute") return "bg-purple-100 text-purple-700";
  return "bg-slate-100 text-slate-600";
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCSV(report, sessionTitle) {
  if (!report) return;

  const headers = [
    "Status",
    "Type",
    "Name",
    "For Member",
    "Membership ID",
    "Email",
    "Phone",
    "Scanned At",
  ];
  const groups = [
    ["Attended", report.attended],
    ["Pending", report.pending],
    ["Absent", report.absent],
  ];
  const rows = [];

  for (const [status, people] of groups) {
    for (const person of people || []) {
      const type = person.type || "member";
      rows.push([
        status,
        personTypeLabel(type),
        person.name || "",
        type === "member" ? "" : person.member_name || "",
        person.membership_id || "",
        person.email || "",
        person.phone || "",
        person.scanned_at ? new Date(person.scanned_at).toLocaleString() : "",
      ]);
    }
  }

  const csvContent = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeTitle = String(sessionTitle || "attendance")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .trim();
  link.href = url;
  link.download = `${safeTitle || "attendance"}-report.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function collectSessionGuests(credentials, sessionId) {
  const guests = [];
  for (const member of credentials) {
    for (const visitor of member.visitors || []) {
      if (String(entrySessionId(visitor)) === String(sessionId)) {
        guests.push({
          ...visitor,
          type: "visitor",
          member_name: visitor.member_name || member.name,
        });
      }
    }
    for (const substitute of member.substitutes || []) {
      if (String(entrySessionId(substitute)) === String(sessionId)) {
        guests.push({
          ...substitute,
          type: "substitute",
          member_name: substitute.member_name || member.name,
        });
      }
    }
  }
  return guests;
}

function buildAttendanceLists(report, credentials, sessionId, sessionEndsAt) {
  const membersAttended = (report?.attended || []).map((person) => ({
    ...person,
    type: person.type || "member",
  }));
  const membersNotScanned = (report?.absent || []).map((person) => ({
    ...person,
    type: person.type || "member",
  }));

  // If report already includes typed guests, don't double-merge from credentials
  const reportHasGuests = [...membersAttended, ...membersNotScanned].some(
    (p) => p.type === "visitor" || p.type === "substitute"
  );

  let attended = membersAttended;
  let notScanned = membersNotScanned;

  if (!reportHasGuests && credentials?.length) {
    const guests = collectSessionGuests(credentials, sessionId);
    const guestsAttended = guests.filter(isGuestScanned);
    const guestsNotScanned = guests.filter((g) => !isGuestScanned(g));
    attended = [...membersAttended, ...guestsAttended];
    notScanned = [...membersNotScanned, ...guestsNotScanned];
  }

  const endsAtMs = sessionEndsAt ? new Date(sessionEndsAt).getTime() : NaN;
  const sessionEnded =
    !Number.isNaN(endsAtMs) && Date.now() >= endsAtMs;

  // Before session end: unscanned people are still pending, not absent
  const pending = sessionEnded ? [] : notScanned;
  const absent = sessionEnded ? notScanned : [];

  return {
    attended,
    pending,
    absent,
    session_ended: sessionEnded,
    expected_count: attended.length + notScanned.length,
    attended_count: attended.length,
    pending_count: pending.length,
    absent_count: absent.length,
  };
}

function PeopleTable({ title, people, emptyLabel }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
        <h3 className="text-sm font-semibold text-slate-800">
          {title}{" "}
          <span className="font-normal text-slate-500">({people?.length ?? 0})</span>
        </h3>
      </div>
      {!people || people.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">For Member</th>
                <th className="px-6 py-3">Membership ID</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {people.map((person) => {
                const type = person.type || "member";
                return (
                  <tr key={`${type}-${person.id}`} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-medium text-slate-900">{person.name}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${personTypeBadgeClass(type)}`}
                      >
                        {personTypeLabel(type)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {type === "member" ? "—" : person.member_name || "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {person.membership_id || "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{person.email || "—"}</td>
                    <td className="px-6 py-3 text-slate-600">{person.phone || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState("scheduled");

  const load = async () => {
    setLoading(true);
    try {
      const [sessionRes, reportRes, credentialsRes] = await Promise.all([
        fetch(`${API_ROOT}/sessions/${sessionId}/`),
        fetch(`${API_ROOT}/sessions/${sessionId}/report/`),
        fetch(`${API_ROOT}/credentials/`),
      ]);
      if (!sessionRes.ok) throw new Error(`Session ${sessionRes.status}`);
      const sessionData = await sessionRes.json();
      setSession(sessionData);
      setTitle(sessionData.title || "");
      setStartsAt(toLocalInputValue(sessionData.starts_at));
      setEndsAt(toLocalInputValue(sessionData.ends_at));
      setStatus(sessionData.status || "scheduled");

      let reportData = null;
      if (reportRes.ok) {
        reportData = await reportRes.json();
      }

      let credentials = [];
      if (credentialsRes.ok) {
        const raw = await credentialsRes.json();
        credentials = Array.isArray(raw) ? raw : raw.results || [];
      }

      if (reportData) {
        setReport(
          buildAttendanceLists(
            reportData,
            credentials,
            sessionId,
            sessionData.ends_at
          )
        );
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;

    const startsIso = localInputToIso(startsAt);
    const endsIso = localInputToIso(endsAt);
    if (!startsIso || !endsIso) {
      setFormError("Start and end times are required.");
      return;
    }
    if (new Date(endsIso) <= new Date(startsIso)) {
      setFormError("End time must be after start time.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const res = await fetch(`${API_ROOT}/sessions/${sessionId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          starts_at: startsIso,
          ends_at: endsIso,
          status,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err) || `Update failed (${res.status})`);
      }
      await load();
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to save session.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this session permanently?")) return;
    try {
      const res = await fetch(`${API_ROOT}/sessions/${sessionId}/`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
      navigate(session?.chapter ? `/chapters/${session.chapter}` : "/chapters");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete session.");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Enterprise-Infotech Logo" className="h-14 w-auto object-contain" />
            <PortalNav />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadCSV(report, session?.title)}
              disabled={!report}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} />
              Download CSV
            </button>
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {session?.chapter && (
          <Link
            to={`/chapters/${session.chapter}`}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#2D5A5D]"
          >
            <ArrowLeft size={16} />
            Back to {session.chapter_name || "Chapter"}
          </Link>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Loading session...
          </div>
        ) : !session ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            Session not found.
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {session.title || `Session #${session.id}`}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {session.chapter_name}
                {session.starts_at && ` · ${formatDateTime(session.starts_at)}`}
              </p>
            </div>

            <form
              onSubmit={handleSave}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
            >
              <h2 className="text-lg font-semibold text-slate-800">Edit Session</h2>
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                  {formError}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Starts at</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Ends at</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
                  />
                </div>
              </div>
              <div className="max-w-xs">
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
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#234749] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Attendance Report</h2>
              {!report ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
                  Report unavailable.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Expected
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-800">
                        {report.expected_count ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Attended
                      </p>
                      <p className="mt-1 text-2xl font-bold text-emerald-600">
                        {report.attended_count ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {report.session_ended ? "Absent" : "Pending"}
                      </p>
                      <p
                        className={`mt-1 text-2xl font-bold ${
                          report.session_ended ? "text-amber-600" : "text-slate-600"
                        }`}
                      >
                        {report.session_ended
                          ? report.absent_count ?? 0
                          : report.pending_count ?? 0}
                      </p>
                    </div>
                  </div>

                  <PeopleTable
                    title="Attended"
                    people={report.attended}
                    emptyLabel="No one has scanned in yet."
                  />
                  {report.session_ended ? (
                    <PeopleTable
                      title="Absent"
                      people={report.absent}
                      emptyLabel="No absences — everyone expected has attended."
                    />
                  ) : (
                    <PeopleTable
                      title="Pending (not scanned yet)"
                      people={report.pending}
                      emptyLabel="Everyone expected has already scanned in."
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
