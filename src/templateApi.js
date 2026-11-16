import { API_ROOT, USE_TEMPLATE_API_STUB } from "./config";

const TEMPLATES_PATH = `${API_ROOT}/templates/`;
const UPLOAD_PATH = `${API_ROOT}/upload/`;

const STORAGE_KEY = "wallet_pass_templates_v1";

const APPLE_IMAGE_KEYS = ["icon", "strip"];
const GOOGLE_IMAGE_KEYS = ["heroImage", "logo"];

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    if (typeof file === "string") {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

async function normalizePlatformImages(platform) {
  if (!platform) return null;
  const next = { ...platform };
  if ("icon" in next) next.icon = await fileToDataUrl(next.icon);
  if ("strip" in next) next.strip = await fileToDataUrl(next.strip);
  if ("heroImage" in next) next.heroImage = await fileToDataUrl(next.heroImage);
  if ("logo" in next) next.logo = await fileToDataUrl(next.logo);
  return next;
}

function normalizeListItem(item) {
  return {
    id: item.id,
    name: item.name,
    created_at: item.created_at || item.createdAt || null,
    updated_at: item.updated_at || item.updatedAt || null,
    hasApple: item.hasApple ?? Boolean(item.apple),
    hasGoogle: item.hasGoogle ?? Boolean(item.google),
  };
}

function normalizeDetail(item) {
  if (!item || typeof item !== "object") return item;
  return {
    id: item.id,
    name: item.name || "",
    apple: item.apple || null,
    google: item.google || null,
    created_at: item.created_at || item.createdAt || null,
    updated_at: item.updated_at || item.updatedAt || null,
  };
}

async function stubListTemplates() {
  return readStore().map((t) => normalizeListItem(t));
}

async function stubGetTemplate(id) {
  const found = readStore().find((t) => String(t.id) === String(id));
  if (!found) throw new Error("Template not found.");
  return normalizeDetail(found);
}

async function stubCreateTemplate(payload) {
  const now = new Date().toISOString();
  const apple = await normalizePlatformImages(payload.apple || null);
  const google = await normalizePlatformImages(payload.google || null);
  const template = {
    id: Date.now(),
    name: payload.name.trim(),
    apple,
    google,
    created_at: now,
    updated_at: now,
  };
  const all = readStore();
  all.unshift(template);
  writeStore(all);
  return normalizeDetail(template);
}

async function stubUpdateTemplate(id, payload) {
  const all = readStore();
  const index = all.findIndex((t) => String(t.id) === String(id));
  if (index === -1) throw new Error("Template not found.");
  const existing = all[index];
  const apple =
    payload.apple === undefined
      ? existing.apple
      : await normalizePlatformImages(payload.apple);
  const google =
    payload.google === undefined
      ? existing.google
      : await normalizePlatformImages(payload.google);
  const updated = {
    ...existing,
    name: payload.name.trim(),
    apple,
    google,
    updated_at: new Date().toISOString(),
  };
  all[index] = updated;
  writeStore(all);
  return normalizeDetail(updated);
}

async function stubDeleteTemplate(id) {
  const all = readStore();
  const next = all.filter((t) => String(t.id) !== String(id));
  if (next.length === all.length) throw new Error("Template not found.");
  writeStore(next);
}

async function parseError(res) {
  const err = await res.json().catch(() => ({}));
  if (typeof err.error === "string") return err.error;
  if (typeof err.detail === "string") return err.detail;
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.non_field_errors) && err.non_field_errors[0]) {
    return String(err.non_field_errors[0]);
  }
  if (err && typeof err === "object") {
    const first = Object.values(err)[0];
    if (typeof first === "string") return first;
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (first && typeof first === "object") {
      const nested = Object.values(first)[0];
      if (typeof nested === "string") return nested;
      if (Array.isArray(nested) && nested[0]) return String(nested[0]);
    }
  }
  return `Request failed (${res.status})`;
}

async function uploadImage(file, templateName, asset) {
  const form = new FormData();
  form.append("file", file);
  form.append("template_name", templateName);
  if (asset) form.append("asset", asset);

  const res = await fetch(UPLOAD_PATH, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  if (!data?.url) throw new Error("Upload did not return a URL.");
  return data.url;
}

async function resolveImageField(value, templateName, asset) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof File) {
    return uploadImage(value, templateName, asset);
  }
  throw new Error(`Invalid image value for ${asset}.`);
}

async function resolvePlatformImages(platform, templateName, imageKeys) {
  if (!platform) return null;
  const next = { ...platform };
  for (const key of imageKeys) {
    if (key in next) {
      next[key] = await resolveImageField(next[key], templateName, key);
    }
  }
  return next;
}

async function buildJsonPayload(payload) {
  const name = payload.name.trim();
  const apple =
    payload.apple === undefined
      ? undefined
      : await resolvePlatformImages(payload.apple, name, APPLE_IMAGE_KEYS);
  const google =
    payload.google === undefined
      ? undefined
      : await resolvePlatformImages(payload.google, name, GOOGLE_IMAGE_KEYS);

  const body = { name };
  if (apple !== undefined) body.apple = apple;
  if (google !== undefined) body.google = google;
  return body;
}

async function apiListTemplates() {
  const res = await fetch(TEMPLATES_PATH);
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
  return items.map(normalizeListItem);
}

async function apiGetTemplate(id) {
  const res = await fetch(`${TEMPLATES_PATH}${id}/`);
  if (!res.ok) throw new Error(await parseError(res));
  return normalizeDetail(await res.json());
}

async function apiCreateTemplate(payload) {
  const body = await buildJsonPayload(payload);
  const res = await fetch(TEMPLATES_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return normalizeDetail(await res.json());
}

async function apiUpdateTemplate(id, payload) {
  const body = await buildJsonPayload(payload);
  const res = await fetch(`${TEMPLATES_PATH}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return normalizeDetail(await res.json());
}

async function apiDeleteTemplate(id) {
  const res = await fetch(`${TEMPLATES_PATH}${id}/`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(await parseError(res));
  }
}

export function listTemplates() {
  return USE_TEMPLATE_API_STUB ? stubListTemplates() : apiListTemplates();
}

export function getTemplate(id) {
  return USE_TEMPLATE_API_STUB ? stubGetTemplate(id) : apiGetTemplate(id);
}

export function createTemplate(payload) {
  return USE_TEMPLATE_API_STUB ? stubCreateTemplate(payload) : apiCreateTemplate(payload);
}

export function updateTemplate(id, payload) {
  return USE_TEMPLATE_API_STUB
    ? stubUpdateTemplate(id, payload)
    : apiUpdateTemplate(id, payload);
}

export function deleteTemplate(id) {
  return USE_TEMPLATE_API_STUB ? stubDeleteTemplate(id) : apiDeleteTemplate(id);
}
