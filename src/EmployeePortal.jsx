import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Plus, Send, X, Mail, MessageSquare, 
  Smartphone, CheckCircle2, UserPlus, Edit, Trash2, 
  MoreVertical, ChevronDown, ChevronUp 
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
      await onSend(employee.id, { email: useEmail ? email : "", phone: useSms ? phone : "" });
    } finally {
      setSending(false);
    }
  };

  const displayName = employee.name || `${employee.first_name || ""} ${employee.last_name || ""}`.trim();

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
              <h2 className="text-lg font-semibold leading-tight">Send Credential</h2>
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
                useEmail ? "border-[#2D5A5D]/30 bg-[#2D5A5D]/5" : "border-slate-200 bg-slate-50"
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
                useSms ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
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

// Edit Employee Modal
function EditEmployeeModal({ employee, chapters, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: employee.name || `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
    membership_id: employee.membership_id || employee.membershipId || "",
    email: employee.email || "",
    phone: employee.phone || "",
    primary_credential: employee.primary_credential || employee.primaryCredential || "QR",
    secondary_credential: employee.secondary_credential || employee.secondaryCredential || "SMS",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Edit Employee Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Membership ID</label>
            <input
              type="text"
              value={formData.membership_id}
              onChange={(e) => setFormData({ ...formData, membership_id: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            >
              <option value="">Select chapter</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
              {formData.chapter &&
                !chapters.some((ch) => String(ch.id) === String(formData.chapter)) && (
                  <option value={formData.chapter}>
                    {employee.chapter_name || `Chapter #${formData.chapter}`} (inactive)
                  </option>
                )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D5A5D]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

// New Employee Modal
function NewEmployeeModal({ chapters, onClose, onAdd }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chapter, setChapter] = useState("");
  const [secondaryCredential, setSecondaryCredential] = useState("Email");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  const hasContactMethod = email.trim() !== "" || phone.trim() !== "";
  const canSubmit =
    firstName.trim() !== "" &&
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

    if (!chapter) {
      setValidationError("Please select a chapter.");
      return;
    }

    setSubmitting(true);
    setValidationError("");

    try {
      await onAdd({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        membershipId: membershipId.trim(),
        email: emailTrimmed,
        phone: phoneTrimmed,
        primaryCredential: "QR",
        secondaryCredential,
        chapter: Number(chapter),
      });
    } catch (err) {
      console.error("Failed to save employee:", err);
      setValidationError("An error occurred while saving. Please try again.");
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
              <h2 className="text-lg font-semibold leading-tight">New User Credential</h2>
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
                onChange={(e) => { setFirstName(e.target.value); setValidationError(""); }}
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
                onChange={(e) => { setLastName(e.target.value); setValidationError(""); }}
                placeholder="Enter last name"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Membership ID
            </label>
            <input
              type="text"
              value={membershipId}
              onChange={(e) => { setMembershipId(e.target.value); setValidationError(""); }}
              placeholder="MEM-67890"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Chapter <span className="text-red-500">*</span>
            </label>
            <select
              value={chapter}
              onChange={(e) => { setChapter(e.target.value); setValidationError(""); }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
            >
              <option value="">Select chapter</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
            {chapters.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No active chapters. Create one under Chapters first.
              </p>
            )}
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email Address 
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
              <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
            <span className="text-xs font-normal text-slate-400"><span className="text-red-500">*</span>At least one is required, Email or Phone</span>
          </div>

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
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState(null);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        setEmployees(Array.isArray(data) ? data : []);
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
      const fullName = e.name || `${e.first_name || ""} ${e.last_name || ""}`.trim();
      return fullName.toLowerCase().includes(search.toLowerCase());
    });
  }, [employees, search]);

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

      const response = await fetch(`${API_BASE_URL}${id}/generate-qr-passes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

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

      if (response.status === 502 && responseData.wallet_urls) {
        alert(
          responseData.error ||
            "Email delivery failed, but wallet links were generated. Please share the links manually."
        );
        return false;
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

  const handleAddEmployee = async (formData, e) => {
    if (e && e.preventDefault) e.preventDefault();

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

    const emailInput = (formData.email || "").trim().toLowerCase();
    const phoneInput = (formData.phone || "").replace(/[\s\-\(\)]/g, "");

    if (emailInput && !EMAIL_REGEX.test(emailInput)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (phoneInput && !PHONE_REGEX.test(phoneInput)) {
      alert("Please enter a valid phone number (7–15 digits).");
      return;
    }

    if (!emailInput && !phoneInput) {
      alert("At least one contact method (Email or Phone) is required.");
      return;
    }

    if (!formData.chapter) {
      alert("Chapter is required.");
      return;
    }

    const payload = {
      name: formData.name,
      first_name: formData.firstName,
      last_name: formData.lastName,
      membership_id: (formData.membershipId || "").trim(),
      email: emailInput || null,
      phone: phoneInput || null,
      primary_credential: formData.primaryCredential || "QR",
      secondary_credential: formData.secondaryCredential || "Email",
      status: "not_invited",
      chapter: formData.chapter,
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setEmployees((prev) => [newEntry, ...prev]);
        setShowNewEmployeeModal(false);
      } else {
        const errorData = await response.json();
        alert("Error: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please check your connection.");
    }
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
            <img src={logo} alt="Enterprise-Infotech Logo" className="h-14 w-auto object-contain" />
            <PortalNav />
          </div>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search User Credentials..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2D5A5D] focus:ring-2 focus:ring-[#2D5A5D]/20"
            />
          </div>
          <button
            onClick={() => setShowNewEmployeeModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#234749]"
          >
            <Plus size={16} />
            <span>New Invite</span>
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-4 sm:hidden">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Credential Portal</h1>
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
          <div>
            {/* MOBILE CARD VIEW (Shown strictly below 768px) */}
            <div className="space-y-4 md:hidden">
              {filteredEmployees.map((employee) => {
                const displayName = employee.name || `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
                const primary = employee.primary_credential || employee.primaryCredential || "QR";
                const secondary = employee.secondary_credential || employee.secondaryCredential || "Email";
                const sentAt = employee.formatted_created_at || employee.createdAt || "N/A";
                const buttonLabel = employee.status === "not_invited" ? "Send Credential" : "Resend Credential";
                const isExpanded = expandedDetailsId === employee.id;

                return (
                  <div key={employee.id} className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {/* Card Header: Avatar, Name & Actions Dropdown */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2D5A5D]/10 text-sm font-bold text-[#2D5A5D]">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-semibold text-slate-800 text-base leading-snug">{displayName}</h3>
                      </div>

                      {/* Action Menu (Edit / Delete) */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === employee.id ? null : employee.id);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                          title="More Actions"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openMenuId === employee.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)} 
                            />
                            
                            <div className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-slate-100 bg-white py-1 shadow-lg text-left">
                              <button
                                onClick={() => {
                                  setEditingEmployee(employee);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <Edit size={14} className="text-slate-500" />
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  handleDeleteEmployee(employee.id);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {isExpanded && (
                      <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-xs border border-slate-100 text-slate-600">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Chapter:</span>
                          <span className="font-semibold text-slate-700">{employee.chapter_name || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Phone:</span>
                          <span className="font-semibold text-slate-700">{employee.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Email:</span>
                          <span className="font-semibold text-slate-700">{employee.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Primary Credential:</span>
                          <span className="font-semibold text-slate-700">{primary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">MFA:</span>
                          <span className="font-semibold text-slate-700">{secondary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-400">Sent At:</span>
                          <span className="font-semibold text-slate-700">{sentAt}</span>
                        </div>
                      </div>
                    )}

                    {/* Card Footer: Show More Toggle & Send Button */}
                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setExpandedDetailsId(isExpanded ? null : employee.id)}
                        className="flex items-center gap-1 text-xs font-medium text-[#2D5A5D] hover:underline"
                      >
                        <span>{isExpanded ? "Hide details" : "More details"}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="flex items-center gap-1.5 rounded-full bg-[#2D5A5D] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#234749]"
                      >
                        <Send size={13} />
                        <span>{buttonLabel}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP & TABLET TABLE VIEW */}
           {/* DESKTOP TABLE VIEW */}
<div className="hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block w-full overflow-visible">
  <table className="w-full text-left text-xs sm:text-sm table-fixed">
    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      <tr>
        <th className="px-3 py-3.5 w-[15%]">Name</th>
        <th className="px-3 py-3.5 w-[11%]">Chapter</th>
        <th className="px-3 py-3.5 w-[12%]">Phone</th>
        <th className="px-3 py-3.5 w-[18%]">Email</th>
        <th className="px-3 py-3.5 w-[10%]">Primary</th>
        <th className="px-3 py-3.5 w-[8%]">MFA</th>
        <th className="px-3 py-3.5 w-[12%]">Sent At</th>
        <th className="px-3 py-3.5 w-[14%] text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-slate-700">
      {filteredEmployees.map((employee) => {
        const displayName = employee.name || `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
        
        // Format sent_at timestamp or display N/A
        // Extract timestamp from potential backend field names
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

        return (
          <tr key={employee.id} className="hover:bg-slate-50/80 transition">
            <td className="px-3 py-3.5 font-medium text-slate-900">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="truncate" title={displayName}>{displayName}</span>
              </div>
            </td>
            <td className="px-3 py-3.5 text-slate-600 truncate" title={employee.chapter_name || employee.chapter || "N/A"}>
              {employee.chapter_name || employee.chapter || "N/A"}
            </td>
            <td className="px-3 py-3.5 text-slate-500 truncate" title={employee.phone || "N/A"}>
              {employee.phone || "N/A"}
            </td>
            <td className="px-3 py-3.5 text-slate-500 truncate" title={employee.email || "N/A"}>
              {employee.email || "N/A"}
            </td>
            <td className="px-3 py-3.5 truncate">{employee.primary_credential || employee.primaryCredential || "QR"}</td>
            <td className="px-3 py-3.5 truncate">{employee.secondary_credential || employee.secondaryCredential || "Email"}</td>
            
            {/* SENT AT COLUMN */}
            <td className="px-3 py-3.5 text-slate-500 truncate" title={sentAtDisplay}>
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
                      setOpenMenuId(openMenuId === employee.id ? null : employee.id);
                    }}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenuId === employee.id && (
                    <div className="absolute right-0 top-full z-20 mt-1 w-28 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
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
        );
      })}
    </tbody>
  </table>
</div>
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

      {showNewEmployeeModal && (
        <NewEmployeeModal
          chapters={chapters}
          onClose={() => setShowNewEmployeeModal(false)}
          onAdd={handleAddEmployee}
        />
      )}
    </div>
  );
}