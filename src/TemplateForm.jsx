import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import ApplePassPreview from "./ApplePassPreview";
import GooglePassPreview from "./GooglePassPreview";

function clampByte(n) {
  return Math.max(0, Math.min(255, Number(n) || 0));
}

export function rgbToHex(rgb) {
  const match = String(rgb || "")
    .trim()
    .match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!match) return "#ffffff";
  const r = clampByte(match[1]).toString(16).padStart(2, "0");
  const g = clampByte(match[2]).toString(16).padStart(2, "0");
  const b = clampByte(match[3]).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

export function hexToRgb(hex) {
  const cleaned = String(hex || "").trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgb(${r},${g},${b})`;
}

function normalizeHex(value) {
  let v = String(value || "").trim();
  if (!v) return "";
  if (!v.startsWith("#")) v = `#${v}`;
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [, a, b, c] = v;
    return `#${a}${a}${b}${b}${c}${c}`.toUpperCase();
  }
  return v;
}

function emptyApple() {
  return {
    foregroundColor: "",
    backgroundColor: "",
    labelColor: "",
    icon: null,
    strip: null,
    logoText: "",
  };
}

function emptyGoogle() {
  return {
    backgroundColor: "",
    heroImage: null,
    logo: null,
    cardTitle: "",
  };
}

function fromTemplate(template) {
  const apple = template?.apple || null;
  const google = template?.google || null;
  return {
    name: template?.name || "",
    apple: {
      foregroundColor: apple?.foregroundColor || "",
      backgroundColor: apple?.backgroundColor || "",
      labelColor: apple?.labelColor || "",
      logoText: apple?.logoText || "",
      icon: apple?.icon || null,
      strip: apple?.strip || null,
    },
    google: {
      backgroundColor: google?.backgroundColor || "",
      cardTitle: google?.cardTitle || "",
      heroImage: google?.heroImage || null,
      logo: google?.logo || null,
    },
  };
}

function hasAnyAppleValue(apple) {
  return Boolean(
    apple.foregroundColor.trim() ||
      apple.backgroundColor.trim() ||
      apple.labelColor.trim() ||
      apple.logoText.trim() ||
      apple.icon ||
      apple.strip
  );
}

function hasAnyGoogleValue(google) {
  return Boolean(
    google.backgroundColor.trim() ||
      google.cardTitle.trim() ||
      google.heroImage ||
      google.logo
  );
}

function isValidRgb(value) {
  return /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(
    String(value || "").trim()
  );
}

function isValidHex(value) {
  return /^#[0-9a-fA-F]{6}$/.test(normalizeHex(value));
}

function isAppleComplete(apple) {
  return (
    isValidRgb(apple.foregroundColor) &&
    isValidRgb(apple.backgroundColor) &&
    isValidRgb(apple.labelColor) &&
    Boolean(apple.icon) &&
    Boolean(apple.strip) &&
    Boolean(apple.logoText.trim())
  );
}

function isGoogleComplete(google) {
  return (
    isValidHex(google.backgroundColor) &&
    Boolean(google.heroImage) &&
    Boolean(google.logo) &&
    Boolean(google.cardTitle.trim())
  );
}

function previewSrc(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof File) return URL.createObjectURL(value);
  return null;
}

function ColorFieldRgb({ label, value, onChange }) {
  const hex = isValidRgb(value) ? rgbToHex(value) : "#ffffff";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(hexToRgb(e.target.value))}
          className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='rgb(255,255,255)'
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
        />
      </div>
    </div>
  );
}

function ColorFieldHex({ label, value, onChange }) {
  const pickerValue = isValidHex(value) ? normalizeHex(value) : "#ffffff";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-1"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            const normalized = normalizeHex(value);
            if (isValidHex(normalized)) onChange(normalized);
          }}
          placeholder="#C4242A"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
        />
      </div>
    </div>
  );
}

function ImageUploadField({ label, value, onChange, accept = "image/png,image/jpeg,image/webp" }) {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
  }, [value]);

  const src = value instanceof File ? objectUrl : previewSrc(value);

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-start gap-3">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 transition hover:border-[#2D5A5D] hover:bg-[#2D5A5D]/5 hover:text-[#2D5A5D]">
          <ImagePlus size={18} />
          <span>{value ? "Replace" : "Upload"}</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onChange(file);
              e.target.value = "";
            }}
          />
        </label>
        {src ? (
          <div className="relative">
            <img
              src={src}
              alt={`${label} preview`}
              className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 text-slate-500 shadow ring-1 ring-slate-200 hover:text-red-600"
              aria-label={`Remove ${label}`}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] text-slate-400">
            No image
          </div>
        )}
      </div>
    </div>
  );
}

export default function TemplateForm({
  initialTemplate = null,
  submitting = false,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState(() => fromTemplate(initialTemplate));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(fromTemplate(initialTemplate));
    setError("");
  }, [initialTemplate]);

  const appleTouched = hasAnyAppleValue(form.apple);
  const googleTouched = hasAnyGoogleValue(form.google);
  const appleComplete = isAppleComplete(form.apple);
  const googleComplete = isGoogleComplete(form.google);

  const canSave = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!appleComplete && !googleComplete) return false;
    if (appleTouched && !appleComplete) return false;
    if (googleTouched && !googleComplete) return false;
    return true;
  }, [form.name, appleComplete, googleComplete, appleTouched, googleTouched]);

  const validationHint = useMemo(() => {
    if (!form.name.trim()) return "Enter a template name.";
    if (appleTouched && !appleComplete) {
      return "Complete all Apple fields, or clear the Apple section.";
    }
    if (googleTouched && !googleComplete) {
      return "Complete all Google fields, or clear the Google section.";
    }
    if (!appleComplete && !googleComplete) {
      return "Fill either the Apple or Google section completely.";
    }
    return "";
  }, [form.name, appleTouched, appleComplete, googleTouched, googleComplete]);

  const updateApple = (key, value) => {
    setForm((prev) => ({
      ...prev,
      apple: { ...prev.apple, [key]: value },
    }));
  };

  const updateGoogle = (key, value) => {
    setForm((prev) => ({
      ...prev,
      google: { ...prev.google, [key]: value },
    }));
  };

  const clearApple = () => setForm((prev) => ({ ...prev, apple: emptyApple() }));
  const clearGoogle = () => setForm((prev) => ({ ...prev, google: emptyGoogle() }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave || submitting) return;
    setError("");

    const payload = {
      name: form.name.trim(),
      apple: appleComplete
        ? {
            foregroundColor: form.apple.foregroundColor.trim(),
            backgroundColor: form.apple.backgroundColor.trim(),
            labelColor: form.apple.labelColor.trim(),
            logoText: form.apple.logoText.trim(),
            icon: form.apple.icon,
            strip: form.apple.strip,
          }
        : null,
      google: googleComplete
        ? {
            backgroundColor: normalizeHex(form.google.backgroundColor),
            cardTitle: form.google.cardTitle.trim(),
            heroImage: form.google.heroImage,
            logo: form.google.logo,
          }
        : null,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Failed to save template.");
    }
  };

  const isEdit = Boolean(initialTemplate?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-[#2D5A5D]"
        >
          <ArrowLeft size={16} />
          Back to templates
        </button>
        <h2 className="text-lg font-semibold text-slate-800">
          {isEdit ? "Edit template" : "Create template"}
        </h2>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Template name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Enterprise Infotech Pass"
          required
          className="w-full max-w-xl rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
        />
      </div>

      {/*
        Layout (matches structure ref):
        Row 1 Apple:  [Pass details] | [Pass preview]
        Row 2 Google: [Pass details] | [Pass preview]
      */}
      <div className="space-y-6">
        {/* Apple row */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Apple
              </h3>
              <p className="text-xs text-slate-500">rgb(...) · PassKit colors</p>
            </div>
            {appleTouched && (
              <button
                type="button"
                onClick={clearApple}
                className="text-xs font-medium text-slate-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-row items-start">
            <div className="w-1/2 min-w-0 space-y-4 border-r border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pass details
              </p>
              <ColorFieldRgb
                label="Foreground color"
                value={form.apple.foregroundColor}
                onChange={(v) => updateApple("foregroundColor", v)}
              />
              <ColorFieldRgb
                label="Background color"
                value={form.apple.backgroundColor}
                onChange={(v) => updateApple("backgroundColor", v)}
              />
              <ColorFieldRgb
                label="Label color"
                value={form.apple.labelColor}
                onChange={(v) => updateApple("labelColor", v)}
              />
              <ImageUploadField
                label="Strip (strip.png)"
                value={form.apple.strip}
                onChange={(v) => updateApple("strip", v)}
              />
              <ImageUploadField
                label="Icon (icon.png)"
                value={form.apple.icon}
                onChange={(v) => updateApple("icon", v)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Logo text
                </label>
                <input
                  type="text"
                  value={form.apple.logoText}
                  onChange={(e) => updateApple("logoText", e.target.value)}
                  placeholder="Enterprise Infotech"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
                />
              </div>
              {appleComplete && (
                <p className="text-xs font-medium text-emerald-600">
                  Apple section complete
                </p>
              )}
            </div>

            <div className="w-1/2 min-w-0 bg-slate-50/60 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pass preview
              </p>
              <div className="sticky top-6">
                <ApplePassPreview
                  foregroundColor={form.apple.foregroundColor}
                  backgroundColor={form.apple.backgroundColor}
                  labelColor={form.apple.labelColor}
                  logoText={form.apple.logoText}
                  strip={form.apple.strip}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Google row */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Google
              </h3>
              <p className="text-xs text-slate-500">#hex colours</p>
            </div>
            {googleTouched && (
              <button
                type="button"
                onClick={clearGoogle}
                className="text-xs font-medium text-slate-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-row items-start">
            <div className="w-1/2 min-w-0 space-y-4 border-r border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pass details
              </p>
              <ColorFieldHex
                label="Background colour"
                value={form.google.backgroundColor}
                onChange={(v) => updateGoogle("backgroundColor", v)}
              />
              <ImageUploadField
                label="Hero image"
                value={form.google.heroImage}
                onChange={(v) => updateGoogle("heroImage", v)}
              />
              <ImageUploadField
                label="Logo"
                value={form.google.logo}
                onChange={(v) => updateGoogle("logo", v)}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Card title
                </label>
                <input
                  type="text"
                  value={form.google.cardTitle}
                  onChange={(e) => updateGoogle("cardTitle", e.target.value)}
                  placeholder="Visitor Pass"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#2D5A5D] focus:bg-white focus:ring-2 focus:ring-[#2D5A5D]/20"
                />
              </div>
              {googleComplete && (
                <p className="text-xs font-medium text-emerald-600">
                  Google section complete
                </p>
              )}
            </div>

            <div className="w-1/2 min-w-0 bg-slate-50/60 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pass preview
              </p>
              <div className="sticky top-6">
                <GooglePassPreview
                  backgroundColor={form.google.backgroundColor}
                  heroImage={form.google.heroImage}
                  logo={form.google.logo}
                  cardTitle={form.google.cardTitle}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {!canSave && validationHint && (
          <p className="mr-auto text-xs text-slate-500">{validationHint}</p>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave || submitting}
          className="rounded-lg bg-[#2D5A5D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#234749] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? "Update template" : "Save template"}
        </button>
      </div>
    </form>
  );
}
