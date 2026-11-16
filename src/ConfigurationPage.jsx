import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Plus, Settings, Trash2 } from "lucide-react";
import logo from "./assets/logoEI.jpeg";
import PortalNav from "./PortalNav";
import TemplateForm from "./TemplateForm";
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from "./templateApi";
import { toast } from "./toast";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function ConfigurationPage() {
  const [view, setView] = useState("list"); // list | create | edit
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load templates.");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const openCreate = () => {
    setEditingTemplate(null);
    setView("create");
  };

  const openEdit = async (id) => {
    setLoadingEdit(true);
    setView("edit");
    try {
      const template = await getTemplate(id);
      setEditingTemplate(template);
    } catch (err) {
      console.error(err);
      toast.error("Failed to open template.");
      setView("list");
      setEditingTemplate(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  const backToList = () => {
    setView("list");
    setEditingTemplate(null);
  };

  const handleSave = async (payload) => {
    setSubmitting(true);
    try {
      if (view === "edit" && editingTemplate?.id) {
        await updateTemplate(editingTemplate.id, payload);
        toast.success("Template updated.");
      } else {
        await createTemplate(payload);
        toast.success("Template created.");
      }
      await fetchTemplates();
      backToList();
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (template) => {
    if (
      !window.confirm(
        `Delete template "${template.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await deleteTemplate(template.id);
      toast.success("Template deleted.");
      if (editingTemplate?.id === template.id) backToList();
      await fetchTemplates();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete template.");
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF4F4]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <img
                src={logo}
                alt="Enterprise-Infotech Logo"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <PortalNav />
          </div>
          {view === "list" && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234749]"
            >
              <Plus size={16} />
              Create template
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {view === "list" ? (
          <>
            <div className="mb-6 flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D5A5D]/10 text-[#2D5A5D]">
                <Settings size={18} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Configuration</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage Apple and Google wallet pass templates.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <p className="text-sm text-slate-400">No templates yet.</p>
                <button
                  onClick={openCreate}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234749]"
                >
                  <Plus size={16} />
                  Create template
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-slate-700">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Updated</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {templates.map((template) => (
                        <tr
                          key={template.id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {template.name}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {formatDate(template.updated_at || template.updatedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEdit(template.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(template)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete
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
          </>
        ) : loadingEdit ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Loading template...
          </div>
        ) : (
          <TemplateForm
            initialTemplate={view === "edit" ? editingTemplate : null}
            submitting={submitting}
            onCancel={backToList}
            onSubmit={handleSave}
          />
        )}
      </main>
    </div>
  );
}
