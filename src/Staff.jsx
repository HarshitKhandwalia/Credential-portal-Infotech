import { useEffect, useState } from "react";
import { Plus, X, Users } from "lucide-react";
import logo from "./assets/BNI-LOGO.jpeg";
import { API_ROOT } from "./config";
import { apiFetch } from "./api";
import PortalNav from "./PortalNav";
import AccountMenu from "./AccountMenu";
import { toast } from "./toast";

async function errorMessage(res, fallback) {
  const data = await res.json().catch(() => ({}));
  const detail = data.detail || data.error || data.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.join(" ");
  if (detail && typeof detail === "object") {
    const first = Object.values(detail).flat()[0];
    if (typeof first === "string") return first;
  }
  return fallback;
}

function StaffModal({ staff, chapters, onClose, onSave }) {
  const isEdit = Boolean(staff);
  const [name, setName] = useState(staff?.name || "");
  const [email, setEmail] = useState(staff?.email || "");
  const [password, setPassword] = useState("");
  const [chapter, setChapter] = useState(staff?.chapter != null ? String(staff.chapter) : "");
  const [isActive, setIsActive] = useState(staff?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!chapter) {
      setError("Chapter is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        const payload = {
          name: name.trim(),
          chapter: Number(chapter),
          is_active: isActive,
        };
        if (password) payload.password = password;
        await onSave(payload);
      } else {
        await onSave({
          name: name.trim(),
          email: email.trim(),
          password,
          chapter: Number(chapter),
        });
      }
    } catch (err) {
      setError(err.message || "Failed to save chapter admin.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-[#C5242A] px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Users size={18} />
            </div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit chapter admin" : "New chapter admin"}
            </h2>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#C5242A] focus:bg-white focus:ring-2 focus:ring-[#C5242A]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEdit}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#C5242A] focus:bg-white focus:ring-2 focus:ring-[#C5242A]/20 disabled:cursor-not-allowed disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {isEdit ? "New password" : "Password"}{" "}
              {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              autoComplete="new-password"
              placeholder={isEdit ? "Leave blank to keep the current password" : ""}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#C5242A] focus:bg-white focus:ring-2 focus:ring-[#C5242A]/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Chapter <span className="text-red-500">*</span>
            </label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#C5242A] focus:bg-white focus:ring-2 focus:ring-[#C5242A]/20"
            >
              <option value="">Select chapter</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
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
              className="rounded-lg bg-[#C5242A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A81D23] disabled:opacity-50"
            >
              {submitting ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [staffRes, chapterRes] = await Promise.all([
        apiFetch(`${API_ROOT}/staff/`),
        apiFetch(`${API_ROOT}/chapters/`),
      ]);
      if (!staffRes.ok) throw new Error(await errorMessage(staffRes, "Failed to load chapter admins."));
      const staffData = await staffRes.json();
      setStaff(Array.isArray(staffData) ? staffData : staffData.results || []);
      if (chapterRes.ok) {
        const chapterData = await chapterRes.json();
        setChapters(Array.isArray(chapterData) ? chapterData : chapterData.results || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load chapter admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (payload) => {
    const res = await apiFetch(`${API_ROOT}/staff/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Failed to create chapter admin."));
    setShowCreate(false);
    toast.success("Chapter admin created.");
    await load();
  };

  const handleUpdate = async (payload) => {
    const res = await apiFetch(`${API_ROOT}/staff/${editing.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await errorMessage(res, "Failed to update chapter admin."));
    setEditing(null);
    toast.success("Chapter admin updated.");
    await load();
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-4 border-[#C5242A] bg-white">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <img src={logo} alt="BNI Logo" className="-my-3 h-16 w-auto object-contain sm:h-20" />
            <PortalNav />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-[#C5242A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#A81D23]"
            >
              <Plus size={16} />
              New chapter admin
            </button>
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#C5242A]">Chapter admins</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chapter admins can manage only the chapter assigned to them.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Loading chapter admins...
          </div>
        ) : staff.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            No chapter admins yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-red-100 bg-red-50 text-xs font-semibold uppercase tracking-wider text-red-900/70">
                <tr>
                  <th className="px-4 py-4">Name</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Chapter</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-red-50/50">
                    <td className="px-4 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-4 py-4">{member.email}</td>
                    <td className="px-4 py-4">{member.chapter_name || "—"}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          member.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {member.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(member)}
                        className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#C5242A] hover:bg-[#C5242A]/10"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showCreate && (
        <StaffModal chapters={chapters} onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editing && (
        <StaffModal
          staff={editing}
          chapters={chapters}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
