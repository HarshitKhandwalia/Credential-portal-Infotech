import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Archive, X, BookOpen } from "lucide-react";
import logo from "./assets/logoEI.jpeg";
import { API_ROOT } from "./config";
import PortalNav from "./PortalNav";
import { toast } from "./toast";

function ChapterModal({ chapter, onClose, onSave }) {
  const [name, setName] = useState(chapter?.name || "");
  const [description, setDescription] = useState(chapter?.description || "");
  const [isActive, setIsActive] = useState(chapter?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(chapter);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || "",
        is_active: isActive,
      });
    } catch (err) {
      setError(err.message || "Failed to save chapter.");
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
              <BookOpen size={18} />
            </div>
            <h2 className="text-lg font-semibold leading-tight">
              {isEdit ? "Edit Chapter" : "New Chapter"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alpha Chapter"
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
            />
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#2D5A5D] focus:ring-[#2D5A5D]"
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
              disabled={!name.trim() || submitting}
              className="rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#234749] disabled:opacity-50"
            >
              {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Chapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_ROOT}/chapters/`);
      if (!res.ok) throw new Error(`Failed to load chapters (${res.status})`);
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chapters. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleCreate = async (payload) => {
    const res = await fetch(`${API_ROOT}/chapters/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, is_active: true }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err) || `Create failed (${res.status})`);
    }
    setShowCreate(false);
    await fetchChapters();
  };

  const handleUpdate = async (payload) => {
    const res = await fetch(`${API_ROOT}/chapters/${editing.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err) || `Update failed (${res.status})`);
    }
    setEditing(null);
    await fetchChapters();
  };

  const handleArchive = async (chapter) => {
    if (!window.confirm(`Archive "${chapter.name}"? It will no longer appear in active dropdowns.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_ROOT}/chapters/${chapter.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });
      if (!res.ok) throw new Error(`Archive failed (${res.status})`);
      await fetchChapters();
    } catch (err) {
      console.error(err);
      toast.error("Failed to archive chapter.");
    }
  };

  const handleDelete = async (chapter) => {
    if (!window.confirm(`Permanently delete "${chapter.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_ROOT}/chapters/${chapter.id}/`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
      await fetchChapters();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chapter.");
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
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234749]"
          >
            <Plus size={16} />
            New Chapter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Chapters</h1>
          <p className="mt-1 text-sm text-slate-500">
            Classes and cohorts. Each credential belongs to one chapter.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Loading chapters...
          </div>
        ) : chapters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            No chapters yet. Create one to get started.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {chapters.map((chapter) => (
                    <tr key={chapter.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <Link
                          to={`/chapters/${chapter.id}`}
                          className="text-[#2D5A5D] hover:underline"
                        >
                          {chapter.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {chapter.description || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            chapter.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {chapter.is_active ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(chapter.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/chapters/${chapter.id}`}
                            className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#2D5A5D] hover:bg-[#2D5A5D]/10"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => setEditing(chapter)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          {chapter.is_active && (
                            <button
                              onClick={() => handleArchive(chapter)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                              title="Archive"
                            >
                              <Archive size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(chapter)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showCreate && (
        <ChapterModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editing && (
        <ChapterModal
          chapter={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
