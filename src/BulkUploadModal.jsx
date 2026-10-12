import React, { useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { API_ROOT } from "./config";
import { toast } from "./toast";

export function BulkUploadModal({ chapters, onClose, onSuccess }) {
  const [step, setStep] = useState("chapter"); // "chapter" or "upload"
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleChapterSelect = (chapterId) => {
    setSelectedChapterId(chapterId);
    setStep("upload");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Please select a valid CSV file.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    if (!selectedChapterId) {
      setError("Please select a chapter.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chapter_id", selectedChapterId);

        try {
      const res = await fetch(`${API_ROOT}/credentials/bulk-upload/`, {
        method: "POST",
        body: formData,
        // No Content-Type header: the browser sets the multipart boundary itself
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.message ||
          (data.errors &&
            Object.entries(data.errors)
              .map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`)
              .join("; ")) ||
          "Failed to upload employees";
        throw new Error(msg);
      }

      setResponse(data);
      setFile(null);
      toast.success(`Successfully created ${data.created_count} employees!`);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Error uploading file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      "first_name,last_name,phone,email,membership_id\nJohn,Doe,+917981557871,john@example.com,MEM001\nJane,Smith,,jane@example.com,MEM002";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedChapter = chapters.find((c) => c.id === parseInt(selectedChapterId));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              <Upload size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">
                Bulk Upload Employees
              </h2>
              <p className="text-sm text-white/80">
                {step === "chapter"
                  ? "Step 1: Select a chapter"
                  : `Step 2: Upload CSV for ${selectedChapter?.name || "selected chapter"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* STEP 1: Chapter Selection */}
          {step === "chapter" && (
            <div>
              <p className="mb-4 text-sm text-slate-600">
                Choose which chapter to add employees to:
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterSelect(chapter.id)}
                    className="rounded-lg border-2 border-slate-200 p-4 text-left transition hover:border-[#2D5A5D]/50 hover:bg-[#2D5A5D]/5"
                  >
                    <p className="font-medium text-slate-900">{chapter.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {chapter.description || "No description"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: File Upload */}
          {step === "upload" && !response && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Back Button & Chapter Display */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep("chapter");
                    setError("");
                  }}
                  className="text-sm text-[#2D5A5D] hover:underline"
                >
                  ← Change chapter
                </button>
                <div className="rounded-lg bg-[#2D5A5D]/10 px-3 py-1.5">
                  <p className="text-sm font-medium text-[#2D5A5D]">
                    {selectedChapter?.name}
                  </p>
                </div>
              </div>

              {/* Template Download */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="mb-2 text-sm text-slate-700">
                  Need help formatting your CSV? Download our template:
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                >
                  <FileText size={16} /> Download CSV Template
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* File Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  CSV File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#2D5A5D] focus:ring-2 focus:ring-[#2D5A5D]/20"
                />
                {file && (
                  <p className="mt-2 text-sm text-emerald-600">
                    ✓ Selected: <strong>{file.name}</strong>
                  </p>
                )}
              </div>

              {/* CSV Format Info */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-slate-600">
                  CSV Format Required
                </p>
                <p className="text-xs text-slate-600">
                  Your CSV must contain columns: <code className="bg-slate-200 px-1">first_name</code>,{" "}
                  <code className="bg-slate-200 px-1">last_name</code>,{" "}
                  <code className="bg-slate-200 px-1">membership_id</code>, and at least one of{" "}
                  <code className="bg-slate-200 px-1">email</code> or{" "}
                  <code className="bg-slate-200 px-1">phone</code>.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="flex items-center gap-2 rounded-lg bg-[#2D5A5D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#234749] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload size={15} />
                  {loading ? "Uploading..." : "Upload Employees"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Results */}
          {response && (
            <div className="space-y-4">
              {/* Summary */}
              <div
                className={`rounded-lg border p-4 ${
                  response.failed_count === 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <h3 className="mb-3 font-semibold text-slate-900">
                  Upload Complete
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Total Rows</p>
                    <p className="text-xl font-bold text-slate-900">
                      {response.total_rows}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Created</p>
                    <p className="text-xl font-bold text-emerald-700">
                      {response.created_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Failed</p>
                    <p className="text-xl font-bold text-red-700">
                      {response.failed_count}
                    </p>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              {response.results.length > 0 && (
                <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-slate-600">Row</th>
                        <th className="px-4 py-2 font-semibold text-slate-600">Status</th>
                        <th className="px-4 py-2 font-semibold text-slate-600">Membership ID</th>
                        <th className="px-4 py-2 font-semibold text-slate-600">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {response.results.map((result, idx) => (
                        <tr
                          key={idx}
                          className={
                            result.status === "success"
                              ? "bg-emerald-50/30 hover:bg-emerald-50"
                              : "bg-red-50/30 hover:bg-red-50"
                          }
                        >
                          <td className="px-4 py-2 text-slate-700">
                            {result.row}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                                result.status === "success"
                                  ? "bg-emerald-200 text-emerald-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {result.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-700">
                            {result.membership_id}
                          </td>
                          <td className="px-4 py-2 text-slate-600">
                            {result.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button
                  onClick={() => {
                    setResponse(null);
                    setFile(null);
                    setStep("chapter");
                    setSelectedChapterId("");
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-[#2D5A5D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#234749]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}