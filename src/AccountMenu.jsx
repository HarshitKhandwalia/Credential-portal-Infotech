import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "./auth";
import { toast } from "./toast";

function roleLabel(role) {
  if (role === "superadmin") return "Superadmin";
  if (role === "chapter_admin") return "Chapter admin";
  return role || "Admin";
}

function ChangePasswordModal({ onClose }) {
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await changePassword(oldPassword, newPassword);
      toast.success("Password updated.");
      onClose();
    } catch (err) {
      setError(err.message || "Could not change password.");
      setSubmitting(false);
    }
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
        <h2 className="mb-4 text-lg font-bold text-slate-800">Change password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C5242A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C5242A]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#C5242A]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
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
              {submitting ? "Saving..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountMenu() {
  const { user, logout, isSuperadmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-red-50"
        >
          <span className="max-w-[10rem] truncate font-medium">{user.name || user.email}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
        {open && (
          <div className="absolute right-0 z-40 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="border-b border-slate-100 px-2 py-2">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name || "Admin"}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <p className="mt-1 text-xs font-medium text-[#C5242A]">
                {roleLabel(user.role)}
                {user.chapter_name ? ` · ${user.chapter_name}` : ""}
              </p>
            </div>
            {isSuperadmin && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShowPassword(true);
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <KeyRound size={15} />
                Change password
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        )}
      </div>
      {isSuperadmin && showPassword && (
        <ChangePasswordModal onClose={() => setShowPassword(false)} />
      )}
    </>
  );
}
