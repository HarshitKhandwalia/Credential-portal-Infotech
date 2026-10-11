import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_ROOT } from "./config";
import {
  apiFetch,
  clearSession,
  hasStoredSession,
  isSuperadmin,
  loginRequest,
  logoutRequest,
  setSessionClearedHandler,
  unwrapUser,
} from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionClearedHandler(() => setUser(null));
    return () => setSessionClearedHandler(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (!hasStoredSession()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const res = await apiFetch(`${API_ROOT}/auth/me/`);
        if (res.status === 401) {
          if (!cancelled) {
            clearSession();
            setUser(null);
          }
          return;
        }
        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setUser(unwrapUser(data));
      } catch {
        if (!cancelled) {
          clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isSuperadmin: isSuperadmin(user),
      async login(email, password) {
        const nextUser = await loginRequest(email, password);
        setUser(nextUser);
        return nextUser;
      },
      async logout() {
        await logoutRequest();
        setUser(null);
      },
      async changePassword(oldPassword, newPassword) {
        const res = await apiFetch(`${API_ROOT}/auth/change-password/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        });
        if (res.status === 204 || res.ok) return;
        const data = await res.json().catch(() => ({}));
        const detail = data.detail || data.old_password || data.new_password;
        const message = Array.isArray(detail)
          ? detail.join(" ")
          : typeof detail === "string"
            ? detail
            : "Could not change password.";
        const error = new Error(message);
        error.status = res.status;
        throw error;
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
