import { API_ROOT } from "./config";

const ACCESS_KEY = "portal_access";
const REFRESH_KEY = "portal_refresh";

let accessToken = null;
let refreshToken = null;
let refreshPromise = null;
let onSessionCleared = null;

function readStored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* private mode or blocked storage */
  }
}

accessToken = readStored(ACCESS_KEY);
refreshToken = readStored(REFRESH_KEY);

export function setSessionClearedHandler(handler) {
  onSessionCleared = handler;
}

export function hasStoredSession() {
  return Boolean(accessToken || refreshToken);
}

function setTokens(access, refresh) {
  if (access !== undefined) {
    accessToken = access || null;
    writeStored(ACCESS_KEY, accessToken);
  }
  if (refresh !== undefined) {
    refreshToken = refresh || null;
    writeStored(REFRESH_KEY, refreshToken);
  }
}

export function clearSession() {
  accessToken = null;
  refreshToken = null;
  writeStored(ACCESS_KEY, null);
  writeStored(REFRESH_KEY, null);
  onSessionCleared?.();
}

export function unwrapUser(data) {
  if (data && typeof data === "object" && data.user && typeof data.user === "object") {
    return data.user;
  }
  return data;
}

async function refreshAccess() {
  if (!refreshToken) {
    clearSession();
    return false;
  }
  if (!refreshPromise) {
    const tokenUsed = refreshToken;
    refreshPromise = (async () => {
      const res = await fetch(`${API_ROOT}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: tokenUsed }),
      });
      if (!res.ok) {
        clearSession();
        return false;
      }
      const data = await res.json().catch(() => ({}));
      if (!data.access) {
        clearSession();
        return false;
      }
      setTokens(data.access, data.refresh || tokenUsed);
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch(url, options = {}) {
  const { skipAuthRefresh, ...init } = options;
  const headers = new Headers(init.headers || {});
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(url, { ...init, headers });
  if (res.status !== 401 || skipAuthRefresh) return res;

  const refreshed = await refreshAccess();
  if (!refreshed) return res;

  const retryHeaders = new Headers(init.headers || {});
  if (accessToken) retryHeaders.set("Authorization", `Bearer ${accessToken}`);
  return fetch(url, { ...init, headers: retryHeaders });
}

export async function loginRequest(email, password) {
  const res = await fetch(`${API_ROOT}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(
      res.status === 429
        ? data.detail || "Too many login attempts. Try again in a minute."
        : data.detail || "Invalid email or password."
    );
    error.status = res.status;
    throw error;
  }
  if (!data.access || !data.refresh) {
    throw new Error("Login did not return access and refresh tokens.");
  }
  setTokens(data.access, data.refresh);
  return unwrapUser(data);
}

export async function logoutRequest() {
  const send = async () => {
    if (!accessToken || !refreshToken) return;
    await apiFetch(`${API_ROOT}/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
      skipAuthRefresh: true,
    });
  };

  try {
    if (accessToken && refreshToken) {
      const res = await fetch(`${API_ROOT}/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (res.status === 401) {
        const refreshed = await refreshAccess();
        if (refreshed) await send();
      }
    }
  } catch {
    /* still clear local tokens */
  } finally {
    clearSession();
  }
}

export function isSuperadmin(user) {
  return user?.role === "superadmin";
}
