import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Send,
  X,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import logo from "./assets/logoEI.jpeg";
import { API_BASE_URL, API_ROOT } from "./config";
import PortalNav from "./PortalNav";

// Send Invite Modal Component
function SendInviteModal({ employee, onClose, onSend }) {
  const [useEmail, setUseEmail] = useState(!!employee.email);
  const [useSms, setUseSms] = useState(!employee.email);
  const [email, setEmail] = useState(employee.email || "");
  const [phone, setPhone] = useState(employee.phone || "");
  const [sending, setSending] = useState(false);

  const canSend = (useEmail && email.trim()) || (useSms && phone.trim());

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await onSend(employee.id, {
        email: useEmail ? email : "",
        phone: useSms ? phone : "",
      });
    } finally {
      setSending(false);
    }
  };

  const displayName =
    employee.name ||
    `${employee.first_name || ""} ${employee.last_name || ""}`.trim();

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
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                Send Credential
              </h2>
              <p className="text-sm text-white/80">Recipient: {displayName}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="mb-4 text-sm text-slate-500">
            Select delivery methods and verify contact details below before sending:
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              className={`rounded-xl border p-4 transition ${
                useEmail
                  ? "border-[#2D5A5D]/30 bg-[#2D5A5D]/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <label className="mb-3 flex cursor-pointer items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail size={16} className="text-[#2D5A5D]" />
                  Email
                </span>
                <input
                  type="checkbox"
                  checked={useEmail}
                  onChange={(e) => setUseEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#2D5A5D] focus:ring-[#2D5A5D]"
                />
              </label>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!useEmail}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:ring-2 focus:ring-[#2D5A5D]/20 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2D5A5D]">
                <CheckCircle2 size={14} />
                Portal Link Included
              </p>
            </div>

            <div
              className={`rounded-xl border p-4 transition ${
                useSms
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <label className="mb-3 flex cursor-pointer items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <MessageSquare size={16} className="text-emerald-600" />
                  SMS
                </span>
                <input
                  type="checkbox"
                  checked={useSms}
                  onChange={(e) => setUseSms(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Mobile / SMS Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!useSms}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <Smartphone size={14} />
                Instant SMS OTP / Link
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend || sending}
            className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#234749] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} />
            {sending ? "Sending..." : "Send Credential"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Employee Modal Component
function EditEmployeeModal({ employee, chapters, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name:
      employee.name ||
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
    membership_id: employee.membership_id || employee.membershipId || "",
    email: employee.email || "",
    phone: employee.phone || "",
    primary_credential:
      employee.primary_credential || employee.primaryCredential || "QR",
    secondary_credential:
      employee.secondary_credential || employee.secondaryCredential || "SMS",
    chapter: employee.chapter != null ? String(employee.chapter) : "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chapter) {
      alert("Chapter is required.");
      return;
    }
    setSubmitting(true);
    await onSave(employee.id, {
      ...formData,
      chapter: Number(formData.chapter),
    });
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Edit Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Membership ID
            </label>
            <input
              type="text"
              value={formData.membership_id}
              onChange={(e) =>
                setFormData({ ...formData, membership_id: e.target.value })
              }
              placeholder="MEM-67890"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Chapter <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.chapter}
              onChange={(e) =>
                setFormData({ ...formData, chapter: e.target.value })
              }
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            >
              <option value="">Select chapter</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
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
              className="rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#234749]"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatSessionOptionLabel(session) {
  const title = session.title || `Session #${session.id}`;
  let when = "";
  if (session.starts_at) {
    try {
      when = new Date(session.starts_at).toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      when = session.starts_at;
    }
  }
  const status = session.status
    ? session.status.charAt(0).toUpperCase() + session.status.slice(1)
    : "Scheduled";
  return when ? `${title} · ${when} · ${status}` : `${title} · ${status}`;
}

function isEligibleScheduledSession(session) {
  if (!session || session.status !== "scheduled" || !session.starts_at) return false;
  const startsAt = new Date(session.starts_at);
  if (Number.isNaN(startsAt.getTime())) return false;
  return startsAt > new Date();
}

function childSessionTitle(child) {
  return child.session_title || child.sessionTitle || child.session?.title || "N/A";
}

function childSessionId(child) {
  if (child.session_id != null) return child.session_id;
  if (child.sessionId != null) return child.sessionId;
  if (typeof child.session === "object" && child.session?.id != null) {
    return child.session.id;
  }
  if (child.session != null && typeof child.session !== "object") {
    return child.session;
  }
  return null;
}

function parseApiError(responseData, fallback) {
  const message =
    responseData?.detail ||
    responseData?.message ||
    responseData?.error ||
    (typeof responseData === "string" ? responseData : null) ||
    fallback;
  return typeof message === "string" ? message : JSON.stringify(message);
}

function ChildCredentialRow({
  child,
  type,
  badgeClass,
  badgeLabel,
  parentId,
  sendingKey,
  deletingKey,
  onSend,
  onDelete,
}) {
  const displayName =
    child.name ||
    `${child.first_name || ""} ${child.last_name || ""}`.trim();
  const actionKey = `${parentId}-${type}-${child.id}`;
  const isSending = sendingKey === actionKey;
  const isDeleting = deletingKey === actionKey;
  const isBusy = isSending || isDeleting;
  const sessionLabel = childSessionTitle(child);

  return (
    <tr className="bg-slate-50/70 text-xs text-slate-600 border-t border-slate-100">
      <td className="py-2.5 pl-10 pr-3 font-medium text-slate-700">
        ↳{" "}
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold mr-1 ${badgeClass}`}
        >
          {badgeLabel}
        </span>
        {displayName}
      </td>
      <td className="px-3 py-2.5" title={sessionLabel}>
        {sessionLabel}
      </td>
      <td className="px-3 py-2.5">{child.phone || "N/A"}</td>
      <td className="px-3 py-2.5">{child.email || "N/A"}</td>
      <td className="px-3 py-2.5">{child.primary_credential || "QR"}</td>
      <td className="px-3 py-2.5">
        {child.secondary_credential || "Email"}
      </td>
      <td className="px-3 py-2.5">{child.sent_at || "N/A"}</td>
      <td className="px-3 py-2.5 text-right">
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onSend(parentId, child, type)}
            disabled={isBusy}
            className="inline-flex items-center gap-1 rounded-lg bg-[#2D5A5D] px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-[#234749] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
          >
            <Send size={11} />
            {isSending ? "Sending..." : "Send Credential"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(parentId, child, type)}
            disabled={isBusy}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-[10px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            title={`Delete ${badgeLabel}`}
          >
            <Trash2 size={11} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// New Employee / Visitor / Substitute Modal Component
function NewEmployeeModal({ modalConfig, chapters, onClose, onAdd }) {
  const {
    parentUserId,
    entryType,
    chapterId: lockedChapterId,
    chapterName: lockedChapterName,
  } = modalConfig || {};
  const isVisitorOrSubstitute = Boolean(entryType);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chapter, setChapter] = useState(
    isVisitorOrSubstitute && lockedChapterId != null ? String(lockedChapterId) : ""
  );
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [secondaryCredential, setSecondaryCredential] = useState("Email");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const modalTitle = entryType
    ? `New ${entryType.charAt(0).toUpperCase() + entryType.slice(1)} Credential`
    : "New User Credential";

  const lockedChapterLabel =
    lockedChapterName ||
    chapters.find((c) => String(c.id) === String(lockedChapterId))?.name ||
    (lockedChapterId != null ? `Chapter #${lockedChapterId}` : "");

  useEffect(() => {
    if (!isVisitorOrSubstitute) return;

    if (lockedChapterId == null || lockedChapterId === "") {
      setSessions([]);
      setSessionId("");
      setValidationError(
        "This member has no chapter. Cannot create a visitor or substitute."
      );
      return;
    }

    let cancelled = false;
    const loadSessions = async () => {
      setLoadingSessions(true);
      setSessionId("");
      setValidationError("");
      try {
        const res = await fetch(
          `${API_ROOT}/chapters/${lockedChapterId}/sessions/`
        );
        if (!res.ok) throw new Error(`Failed to load sessions (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        const eligible = list.filter(isEligibleScheduledSession);
        if (!cancelled) {
          setSessions(eligible);
          if (eligible.length === 0) {
            setValidationError(
              "No upcoming scheduled sessions for this chapter. Create a session before adding a visitor or substitute."
            );
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setSessions([]);
          setValidationError("Failed to load sessions for this chapter.");
        }
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    };

    loadSessions();
    return () => {
      cancelled = true;
    };
  }, [isVisitorOrSubstitute, lockedChapterId]);

  const hasContactMethod = email.trim() !== "" || phone.trim() !== "";
  const canSubmit = isVisitorOrSubstitute
    ? firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      hasContactMethod &&
      lockedChapterId != null &&
      lockedChapterId !== "" &&
      sessionId !== "" &&
      !loadingSessions
    : firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      hasContactMethod &&
      chapter !== "";

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setValidationError("");
    if (val.trim() && !phone.trim()) {
      setSecondaryCredential("Email");
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    setValidationError("");
    if (val.trim() && !email.trim()) {
      setSecondaryCredential("SMS");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    const emailTrimmed = email.trim();
    const phoneTrimmed = phone.trim();

    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (phoneTrimmed && !/^\+?[0-9\s\-()]{7,15}$/.test(phoneTrimmed)) {
      setValidationError("Please enter a valid phone number.");
      return;
    }

    if (isVisitorOrSubstitute) {
      if (lockedChapterId == null || lockedChapterId === "") {
        setValidationError(
          "This member has no chapter. Cannot create a visitor or substitute."
        );
        return;
      }
      if (!sessionId) {
        setValidationError("Please select a session.");
        return;
      }
      if (sessions.length === 0) {
        setValidationError(
          "No upcoming scheduled sessions for this chapter. Create a session before adding a visitor or substitute."
        );
        return;
      }
    } else if (!chapter) {
      setValidationError("Please select a chapter.");
      return;
    }

    setSubmitting(true);
    setValidationError("");

    const selectedChapterObj = chapters.find(
      (c) => String(c.id) === String(isVisitorOrSubstitute ? lockedChapterId : chapter)
    );
    const selectedSession = sessions.find(
      (s) => String(s.id) === String(sessionId)
    );

    try {
      await onAdd({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        membershipId: isVisitorOrSubstitute ? "" : membershipId.trim(),
        email: emailTrimmed,
        phone: phoneTrimmed,
        primaryCredential: "QR",
        secondaryCredential: isVisitorOrSubstitute ? undefined : secondaryCredential,
        chapter: Number(isVisitorOrSubstitute ? lockedChapterId : chapter),
        chapter_name: isVisitorOrSubstitute
          ? lockedChapterLabel
          : selectedChapterObj
            ? selectedChapterObj.name
            : "",
        parentUserId,
        entryType,
        sessionId: isVisitorOrSubstitute ? Number(sessionId) : undefined,
        session_title: selectedSession
          ? selectedSession.title || `Session #${selectedSession.id}`
          : "",
      });
    } catch (err) {
      console.error("Failed to save:", err);
      setValidationError(
        err?.message || "An error occurred while saving. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                {modalTitle}
              </h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {validationError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setValidationError("");
                }}
                placeholder="Enter first name"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setValidationError("");
                }}
                placeholder="Enter last name"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          </div>

          {!isVisitorOrSubstitute && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Membership ID
              </label>
              <input
                type="text"
                value={membershipId}
                onChange={(e) => {
                  setMembershipId(e.target.value);
                  setValidationError("");
                }}
                placeholder="MEM-67890"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Chapter <span className="text-red-500">*</span>
            </label>
            {isVisitorOrSubstitute ? (
              <input
                type="text"
                value={lockedChapterLabel}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none"
              />
            ) : (
              <select
                value={chapter}
                onChange={(e) => {
                  setChapter(e.target.value);
                  setValidationError("");
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              >
                <option value="">Select chapter</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {isVisitorOrSubstitute && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Session <span className="text-red-500">*</span>
              </label>
              <select
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value);
                  setValidationError("");
                }}
                disabled={loadingSessions || sessions.length === 0}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {loadingSessions
                    ? "Loading sessions..."
                    : sessions.length === 0
                      ? "No upcoming scheduled sessions"
                      : "Select session"}
                </option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {formatSessionOptionLabel(session)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mobile Number
            </label>
            <div className="relative">
              <Smartphone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
            <span className="text-xs font-normal text-slate-400">
              <span className="text-red-500">*</span>At least one is required,
              Email or Phone
            </span>
          </div>

          {!isVisitorOrSubstitute && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Primary Credential
                </label>
                <select
                  disabled
                  value="QR"
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none"
                >
                  <option value="QR">QR</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  MFA
                </label>
                <select
                  value={secondaryCredential}
                  onChange={(e) => setSecondaryCredential(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#234749] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} />
            {submitting ? "Adding..." : "Add Credential"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Employee Portal Component
export default function EmployeePortal() {
  const [employees, setEmployees] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newModalConfig, setNewModalConfig] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedUserIds, setExpandedUserIds] = useState([]);
  const [sendingChildKey, setSendingChildKey] = useState(null);
  const [deletingChildKey, setDeletingChildKey] = useState(null);

  const toggleExpandUser = (id) => {
    setExpandedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const fetchEmployees = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (response.ok) {
      const rawData = await response.json();
      const items = Array.isArray(rawData) ? rawData : rawData.results || [];

      // 1. Separate parent users from child records (visitors/substitutes)
      const topLevelUsers = [];
      const childRecords = [];

      items.forEach((item) => {
        // Check if item has a parent reference or an entry type flag
        if (item.parent_user || item.parentUser || item.entry_type || item.entryType) {
          childRecords.push(item);
        } else {
          topLevelUsers.push({
            ...item,
            visitors: item.visitors || [],
            substitutes: item.substitutes || [],
          });
        }
      });

      // 2. Map child records into their respective parent's visitors/substitutes array
      childRecords.forEach((child) => {
        const parentId = child.parent_user || child.parentUser;
        const entryType = (child.entry_type || child.entryType || "visitor").toLowerCase();

        const parent = topLevelUsers.find(
          (u) => String(u.id) === String(parentId)
        );

        if (parent) {
          if (entryType === "visitor") {
            // Avoid duplicate additions
            if (!parent.visitors.some((v) => String(v.id) === String(child.id))) {
              parent.visitors.push(child);
            }
          } else if (entryType === "substitute") {
            if (!parent.substitutes.some((s) => String(s.id) === String(child.id))) {
              parent.substitutes.push(child);
            }
          }
        }
      });

      setEmployees(topLevelUsers);
    }
  } catch (error) {
    console.error("Error loading credentials from Django API:", error);
  } finally {
    setLoading(false);
  }
};

  const fetchChapters = async () => {
    try {
      const response = await fetch(`${API_ROOT}/chapters/?is_active=true`);
      if (response.ok) {
        const data = await response.json();
        setChapters(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error("Error loading chapters:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchChapters();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const fullName =
        e.name || `${e.first_name || ""} ${e.last_name || ""}`.trim();
      return fullName.toLowerCase().includes(search.toLowerCase());
    });
  }, [employees, search]);

  const handleSendVisitorSubstitute = async (parentId, child, type) => {
    const sessionId = childSessionId(child);
    if (!sessionId) {
      alert("Session is missing for this record. Cannot send credential.");
      return;
    }
    if (!child.id) {
      alert("Record id is missing. Cannot send credential.");
      return;
    }

    const sendKey = `${parentId}-${type}-${child.id}`;
    setSendingChildKey(sendKey);

    try {
      const response = await fetch(
        `${API_ROOT}/sessions/${sessionId}/visitor-substitute/${child.id}/send/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }
      );

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(
          parseApiError(
            responseData,
            `Failed to send ${type} credential (${response.status}).`
          )
        );
        return;
      }

      setEmployees((prev) =>
        prev.map((emp) => {
          if (String(emp.id) !== String(parentId)) return emp;
          const key = type === "visitor" ? "visitors" : "substitutes";
          return {
            ...emp,
            [key]: (emp[key] || []).map((item) =>
              String(item.id) === String(child.id)
                ? {
                    ...item,
                    ...responseData,
                    sent_at:
                      responseData.sent_at ||
                      responseData.sentAt ||
                      item.sent_at,
                    status: responseData.status || item.status,
                  }
                : item
            ),
          };
        })
      );

      alert(
        responseData.email_sent === false
          ? "Credential generated, but delivery may have failed."
          : "Credential sent successfully!"
      );
    } catch (error) {
      console.error("Error sending visitor/substitute credential:", error);
      alert("Failed to send credential. Please check your connection.");
    } finally {
      setSendingChildKey(null);
    }
  };

  const handleDeleteVisitorSubstitute = async (parentId, child, type) => {
    const sessionId = childSessionId(child);
    if (!sessionId) {
      alert("Session is missing for this record. Cannot delete.");
      return;
    }
    if (!child.id) {
      alert("Record id is missing. Cannot delete.");
      return;
    }

    const label = type === "substitute" ? "substitute" : "visitor";
    if (!window.confirm(`Delete this ${label} credential?`)) return;

    const deleteKey = `${parentId}-${type}-${child.id}`;
    setDeletingChildKey(deleteKey);

    try {
      const response = await fetch(
        `${API_ROOT}/sessions/${sessionId}/visitor-substitute/${child.id}/`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        }
      );

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(
          parseApiError(
            responseData,
            `Failed to delete ${label} (${response.status}).`
          )
        );
        return;
      }

      setEmployees((prev) =>
        prev.map((emp) => {
          if (String(emp.id) !== String(parentId)) return emp;
          const key = type === "visitor" ? "visitors" : "substitutes";
          return {
            ...emp,
            [key]: (emp[key] || []).filter(
              (item) => String(item.id) !== String(child.id)
            ),
          };
        })
      );
    } catch (error) {
      console.error("Error deleting visitor/substitute:", error);
      alert("Failed to delete. Please check your connection.");
    } finally {
      setDeletingChildKey(null);
    }
  };

  const handleSendInvite = async (id, updatedDetails) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) {
      alert("Employee record not found.");
      return false;
    }

    try {
      if (updatedDetails.email || updatedDetails.phone) {
        const sendResponse = await fetch(`${API_BASE_URL}${id}/send/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: updatedDetails.email || null,
            phone: updatedDetails.phone || null,
          }),
        });

        if (!sendResponse.ok) {
          let sendError = "Failed to update contact details.";
          try {
            const errorData = await sendResponse.json();
            sendError =
              errorData.detail ||
              errorData.message ||
              errorData.error ||
              sendError;
          } catch {
            sendError = `Failed to update contact details (${sendResponse.status}).`;
          }
          alert(sendError);
          return false;
        }
      }

      const response = await fetch(
        `${API_BASE_URL}${id}/generate-qr-passes/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "invite_sent",
                  email: updatedDetails.email || e.email,
                  phone: updatedDetails.phone || e.phone,
                }
              : e
          )
        );
        setSelectedEmployee(null);
        alert(
          responseData.email_sent
            ? "Wallet links sent successfully!"
            : "Wallet links generated, but the email could not be sent."
        );
        return true;
      }

      const errorMessage =
        responseData.detail ||
        responseData.message ||
        responseData.error ||
        `Failed to send credential (${response.status}).`;
      alert(errorMessage);
      return false;
    } catch (error) {
      console.error("Error triggering invite:", error);
      alert("Failed to send credential. Please check your connection.");
      return false;
    }
  };

  const handleAddEmployee = async (formData) => {
    // Visitor / Substitute: session-scoped create endpoint
    if (formData.parentUserId && formData.entryType) {
      if (!formData.sessionId) {
        throw new Error("Please select a session.");
      }

      const payload = {
        type: formData.entryType === "substitute" ? "substitute" : "visitor",
        name: formData.name,
        member_id: formData.parentUserId,
        email: formData.email || null,
        phone: formData.phone || null,
      };

      const response = await fetch(
        `${API_ROOT}/sessions/${formData.sessionId}/visitor-substitute/create/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message =
          responseData.detail ||
          responseData.message ||
          responseData.error ||
          (typeof responseData === "string" ? responseData : null) ||
          `Failed to create ${formData.entryType} (${response.status}).`;
        throw new Error(
          typeof message === "string" ? message : JSON.stringify(message)
        );
      }

      const newEntry = {
        ...responseData,
        name: responseData.name || formData.name,
        first_name: responseData.first_name || formData.firstName,
        last_name: responseData.last_name || formData.lastName,
        email: responseData.email ?? formData.email,
        phone: responseData.phone ?? formData.phone,
        chapter: responseData.chapter ?? formData.chapter,
        chapter_name: responseData.chapter_name || formData.chapter_name,
        session_id: responseData.session_id ?? formData.sessionId,
        session_title:
          responseData.session_title ||
          responseData.session?.title ||
          formData.session_title,
        entry_type: formData.entryType,
        primary_credential: responseData.primary_credential || "QR",
        secondary_credential: responseData.secondary_credential || "Email",
      };

      setEmployees((prev) =>
        prev.map((emp) => {
          if (String(emp.id) !== String(formData.parentUserId)) return emp;
          const key =
            formData.entryType === "visitor" ? "visitors" : "substitutes";
          const existingList = emp[key] || [];
          return {
            ...emp,
            [key]: [...existingList, newEntry],
          };
        })
      );

      setExpandedUserIds((prev) =>
        prev.includes(formData.parentUserId)
          ? prev
          : [...prev, formData.parentUserId]
      );
      setNewModalConfig(null);
      return;
    }

    // Normal member invite
    const payload = {
      name: formData.name,
      first_name: formData.firstName,
      last_name: formData.lastName,
      membership_id: (formData.membershipId || "").trim(),
      email: formData.email || null,
      phone: formData.phone || null,
      primary_credential: formData.primaryCredential || "QR",
      secondary_credential: formData.secondaryCredential || "Email",
      status: "not_invited",
      chapter: formData.chapter,
    };

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        responseData.detail ||
        responseData.message ||
        responseData.error ||
        `Failed to create credential (${response.status}).`;
      throw new Error(
        typeof message === "string" ? message : JSON.stringify(message)
      );
    }

    const newEntry = {
      ...payload,
      ...responseData,
      chapter_name: responseData.chapter_name || formData.chapter_name,
      visitors: [],
      substitutes: [],
    };

    setEmployees((prev) => [newEntry, ...prev]);
    setNewModalConfig(null);
  };

  const handleUpdateEmployee = async (id, updatedFields) => {
    try {
      const response = await fetch(`${API_BASE_URL}${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? updatedData : emp))
        );
        setEditingEmployee(null);
      } else {
        alert("Failed to update record.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}${id}/`, {
        method: "DELETE",
      });

      if (response.ok || response.status === 204) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      } else {
        alert("Failed to delete record.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="Enterprise-Infotech Logo"
              className="h-14 w-auto object-contain"
            />
            <PortalNav />
          </div>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search User Credentials..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2D5A5D] focus:ring-2 focus:ring-[#2D5A5D]/20"
            />
          </div>
          <button
            onClick={() => setNewModalConfig({})}
            className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#234749]"
          >
            <Plus size={16} />
            <span>New Invite</span>
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-4 sm:hidden">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search User Credentials..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2D5A5D] focus:ring-2 focus:ring-[#2D5A5D]/20"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[98%] px-2 sm:px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Credential Portal
          </h1>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Loading credentials from server...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            No employees match this search.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-visible">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3.5 font-semibold">User</th>
                  <th className="px-3 py-3.5 font-semibold">Chapter</th>
                  <th className="px-3 py-3.5 font-semibold">Phone</th>
                  <th className="px-3 py-3.5 font-semibold">Email</th>
                  <th className="px-3 py-3.5 font-semibold">Primary</th>
                  <th className="px-3 py-3.5 font-semibold">Secondary</th>
                  <th className="px-3 py-3.5 font-semibold">Sent At</th>
                  <th className="px-3 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((employee) => {
                  const displayName =
                    employee.name ||
                    `${employee.first_name || ""} ${employee.last_name || ""}`.trim();

                  const rawTimestamp =
                    employee.sent_at ||
                    employee.sentAt ||
                    employee.date_sent ||
                    employee.dateSent ||
                    employee.created_at ||
                    employee.invited_at;

                  const sentAtDisplay = rawTimestamp
                    ? new Date(rawTimestamp).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "N/A";

                  const hasSubordinates =
                    (employee.visitors && employee.visitors.length > 0) ||
                    (employee.substitutes && employee.substitutes.length > 0);

                  return (
                    <React.Fragment key={employee.id}>
                      {/* MAIN USER ROW */}
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="px-3 py-3.5 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate" title={displayName}>
                              {displayName}
                            </span>

                            {/* Dropdown Toggle Arrow renders ONLY when visitors/substitutes exist */}
                            {hasSubordinates && (
                              <button
                                onClick={() => toggleExpandUser(employee.id)}
                                className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition ml-1"
                                title="Toggle Visitor/Substitute details"
                              >
                                {expandedUserIds.includes(employee.id) ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td
                          className="px-3 py-3.5 text-slate-600 truncate"
                          title={
                            employee.chapter_name || employee.chapter || "N/A"
                          }
                        >
                          {employee.chapter_name || employee.chapter || "N/A"}
                        </td>
                        <td
                          className="px-3 py-3.5 text-slate-500 truncate"
                          title={employee.phone || "N/A"}
                        >
                          {employee.phone || "N/A"}
                        </td>
                        <td
                          className="px-3 py-3.5 text-slate-500 truncate"
                          title={employee.email || "N/A"}
                        >
                          {employee.email || "N/A"}
                        </td>
                        <td className="px-3 py-3.5 truncate">
                          {employee.primary_credential ||
                            employee.primaryCredential ||
                            "QR"}
                        </td>
                        <td className="px-3 py-3.5 truncate">
                          {employee.secondary_credential ||
                            employee.secondaryCredential ||
                            "Email"}
                        </td>
                        <td
                          className="px-3 py-3.5 text-slate-500 truncate"
                          title={sentAtDisplay}
                        >
                          {sentAtDisplay}
                        </td>

                        <td className="px-3 py-3.5 text-right relative">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedEmployee(employee)}
                              className="flex items-center gap-1 rounded-lg bg-[#2D5A5D] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#234749] whitespace-nowrap"
                            >
                              <Send size={12} />
                              <span>Send Credential</span>
                            </button>

                            {/* 3-Dots Action Dropdown */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === employee.id
                                      ? null
                                      : employee.id
                                  );
                                }}
                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {openMenuId === employee.id && (
                                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                  <button
                                    onClick={() => {
                                      setNewModalConfig({
                                        parentUserId: employee.id,
                                        entryType: "visitor",
                                        chapterId: employee.chapter,
                                        chapterName:
                                          employee.chapter_name || "",
                                      });
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                  >
                                    <UserPlus size={13} /> Visitor
                                  </button>
                                  <button
                                    onClick={() => {
                                      setNewModalConfig({
                                        parentUserId: employee.id,
                                        entryType: "substitute",
                                        chapterId: employee.chapter,
                                        chapterName:
                                          employee.chapter_name || "",
                                      });
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                  >
                                    <UserPlus size={13} /> Substitute
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <button
                                    onClick={() => {
                                      setEditingEmployee(employee);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                  >
                                    <Edit size={13} /> Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteEmployee(employee.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* VISITOR & SUBSTITUTE NESTED SUB-ROWS */}
                      {expandedUserIds.includes(employee.id) && (
                        <>
                          {employee.visitors?.map((visitor) => (
                            <ChildCredentialRow
                              key={`v-${visitor.id}`}
                              child={visitor}
                              type="visitor"
                              badgeClass="bg-blue-100 text-blue-700"
                              badgeLabel="Visitor"
                              parentId={employee.id}
                              sendingKey={sendingChildKey}
                              deletingKey={deletingChildKey}
                              onSend={handleSendVisitorSubstitute}
                              onDelete={handleDeleteVisitorSubstitute}
                            />
                          ))}

                          {employee.substitutes?.map((sub) => (
                            <ChildCredentialRow
                              key={`s-${sub.id}`}
                              child={sub}
                              type="substitute"
                              badgeClass="bg-purple-100 text-purple-700"
                              badgeLabel="Substitute"
                              parentId={employee.id}
                              sendingKey={sendingChildKey}
                              deletingKey={deletingChildKey}
                              onSend={handleSendVisitorSubstitute}
                              onDelete={handleDeleteVisitorSubstitute}
                            />
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedEmployee && (
        <SendInviteModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSend={handleSendInvite}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          chapters={chapters}
          onClose={() => setEditingEmployee(null)}
          onSave={handleUpdateEmployee}
        />
      )}

      {newModalConfig && (
        <NewEmployeeModal
          modalConfig={newModalConfig}
          chapters={chapters}
          onClose={() => setNewModalConfig(null)}
          onAdd={handleAddEmployee}
        />
      )}
    </div>
  );
}