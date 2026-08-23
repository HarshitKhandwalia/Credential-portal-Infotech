import React, { useState, useEffect, useMemo } from "react";
import { Shield, Search, Plus, Send, X, Mail, MessageSquare, Smartphone, CheckCircle2, UserPlus, QrCode } from "lucide-react";
import logo from "./assets/logoEI.jpeg";

const API_BASE_URL = "http://127.0.0.1:8000/api/credentials/";

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
    await onSend(employee.id, { email: useEmail ? email : "", phone: useSms ? phone : "" });
    setSending(false);
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
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Send Credential</h2>
              <p className="text-sm text-white/80">Recipient: {employee.name}</p>
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
              <label className="mb-3 flex items-center justify-between cursor-pointer">
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
              <label className="mb-3 flex items-center justify-between cursor-pointer">
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

function NewEmployeeModal({ onClose, onAdd }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [secondaryCredential, setSecondaryCredential] = useState("Email");
  const [submitting, setSubmitting] = useState(false);

  const hasContactMethod = email.trim() !== "" || phone.trim() !== "";
  const canSubmit = firstName.trim() !== "" && lastName.trim() !== "" && hasContactMethod;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onAdd({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      primaryCredential: "QR",
      secondaryCredential,
    });
    setSubmitting(false);
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email Address <span className="text-slate-400 text-xs font-normal">(At least Email or Phone required)</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@convergint.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mobile Number <span className="text-slate-400 text-xs font-normal">(At least Email or Phone required)</span>
            </label>
            <div className="relative">
              <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
              />
            </div>
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
                Secondary Credential
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

function QrPassModal({ employee, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
        <p className="text-xs text-slate-400 mt-1">Digital Access Pass</p>
        <div className="my-6 flex justify-center">
          <div className="rounded-xl border-2 border-slate-900 p-4 bg-white shadow-inner">
            <QrCode size={140} className="text-slate-800" />
          </div>
        </div>
        <p className="text-xs text-slate-500 font-mono">ID: PASS-{employee.id}89234</p>
      </div>
    </div>
  );
}

function EmployeeCard({ employee, onInviteClick }) {
  const buttonLabel = employee.status === "not_invited" ? "Send Credential" : "Resend Credential";
  
  // Read either Django API snakes or JS camelCase properties
  const displayPrimary = employee.primary_credential || employee.primaryCredential || "QR / NFC";
  const displaySecondary = employee.secondary_credential || employee.secondaryCredential || "Email";
  const displayCreated = employee.formatted_created_at || employee.createdAt || "N/A";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
        
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="font-medium text-slate-400">Phone:</span>
            <span className="font-semibold text-slate-700">{employee.phone || "N/A"}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="font-medium text-slate-400">Email:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={employee.email}>
              {employee.email || "N/A"}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="font-medium text-slate-400">Primary Credential:</span>
            <span className="font-semibold text-slate-700">{displayPrimary}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="font-medium text-slate-400">Secondary Credential:</span>
            <span className="font-semibold text-slate-700">{displaySecondary}</span>
          </div>

          <div className="flex justify-between pb-1">
            <span className="font-medium text-slate-400">Sent at:</span>
            <span className="font-semibold text-slate-700">{displayCreated}</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <button
          onClick={() => onInviteClick(employee)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D5A5D] py-2 text-xs font-semibold text-white transition hover:bg-[#234749]"
        >
          <Send size={14} />
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export default function EmployeePortal() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [passEmployee, setPassEmployee] = useState(null);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);

  // Fetch employees from Django API
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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) =>
      (e.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  const handleSendInvite = async (id, updatedDetails) => {
    try {
      // POST payload back to backend
      const response = await fetch(`${API_BASE_URL}${id}/send/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedDetails),
      });

      if (response.ok) {
        const updatedRecord = await response.json();
        setEmployees((prev) =>
          prev.map((e) => (e.id === id ? updatedRecord : e))
        );
      } else {
        // Fallback local update if endpoint isn't fully implemented
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
      }
    } catch (error) {
      console.error("Error triggering invite:", error);
    } finally {
      setSelectedEmployee(null);
    }
  };

  const handleAddEmployee = async (formData, e) => {
    if (e && e.preventDefault) e.preventDefault();

    // 1. Regex definitions for validation
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

    // 2. Normalize inputs
    const normalizedEmail = (formData.email || "").trim().toLowerCase();
    const normalizedPhone = (formData.phone || "").replace(/[\s\-\(\)]/g, "");

    // 3. Frontend Validation Checks
    if (normalizedEmail && !EMAIL_REGEX.test(normalizedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (normalizedPhone && !PHONE_REGEX.test(normalizedPhone)) {
      alert("Please enter a valid phone number (7–15 digits).");
      return;
    }

    if (!normalizedEmail && !normalizedPhone) {
      alert("At least one contact method (Email or Phone) is required.");
      return;
    }

    // 4. Send normalized data to backend
    const payload = {
      name: formData.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      primary_credential: formData.primaryCredential || "QR / NFC",
      secondary_credential: formData.secondaryCredential || "Email",
      status: "not_invited",
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

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Enterprise-Infotech Logo" className="h-16 w-auto object-contain" />
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
            className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234749]"
          >
            <Plus size={16} />
            New Invite
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Credential Portal</h1>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onInviteClick={setSelectedEmployee}
                onViewPass={setPassEmployee}
              />
            ))}
          </div>
        )}
      </main>

      {selectedEmployee && (
        <SendInviteModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onSend={handleSendInvite}
        />
      )}

      {passEmployee && (
        <QrPassModal
          employee={passEmployee}
          onClose={() => setPassEmployee(null)}
        />
      )}

      {showNewEmployeeModal && (
        <NewEmployeeModal
          onClose={() => setShowNewEmployeeModal(false)}
          onAdd={handleAddEmployee}
        />
      )}
    </div>
  );
}