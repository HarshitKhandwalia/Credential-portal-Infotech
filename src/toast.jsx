import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const DISMISS_MS = 4000;
const listeners = new Set();
let nextId = 1;

function pushToast(message, variant) {
  const text = typeof message === "string" ? message.trim() : String(message ?? "");
  if (!text) return;
  const item = { id: nextId++, message: text, variant };
  listeners.forEach((listener) => listener(item));
}

export const toast = {
  success(message) {
    pushToast(message, "success");
  },
  error(message) {
    pushToast(message, "error");
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  const dismiss = (id) => {
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const listener = (item) => {
      setToasts((current) => [...current, item]);
      const timeoutId = window.setTimeout(() => {
        timeoutsRef.current.delete(item.id);
        setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id));
      }, DISMISS_MS);
      timeoutsRef.current.set(item.id, timeoutId);
    };

    listeners.add(listener);
    const timeouts = timeoutsRef.current;
    return () => {
      listeners.delete(listener);
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(100%-2rem,24rem)] flex-col gap-2">
      {toasts.map((item) => {
        const isSuccess = item.variant === "success";
        return (
          <div
            key={item.id}
            role={isSuccess ? "status" : "alert"}
            className={`toast-in pointer-events-auto flex items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg ${
              isSuccess ? "border-emerald-200" : "border-red-200"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            )}
            <p
              className={`flex-1 text-sm font-medium leading-snug ${
                isSuccess ? "text-emerald-800" : "text-red-700"
              }`}
            >
              {item.message}
            </p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
