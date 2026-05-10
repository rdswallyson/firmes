"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: <CheckCircle size={18} strokeWidth={1.5} />,
  error:   <XCircle    size={18} strokeWidth={1.5} />,
  warning: <AlertCircle size={18} strokeWidth={1.5} />,
  info:    <Info        size={18} strokeWidth={1.5} />,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: "#F0FDF4", border: "#16A34A", icon: "#16A34A", text: "#14532D" },
  error:   { bg: "#FEF2F2", border: "#DC2626", icon: "#DC2626", text: "#7F1D1D" },
  warning: { bg: "#FFFBEB", border: "#D97706", icon: "#D97706", text: "#78350F" },
  info:    { bg: "#EFF6FF", border: "#2563EB", icon: "#2563EB", text: "#1E3A8A" },
};

let externalToast: ((type: ToastType, title: string, message?: string) => void) | null = null;

// Hook para usar em qualquer componente
export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // Fallback se não estiver dentro do provider
  const fallback = (type: ToastType, title: string, message?: string) => {
    externalToast?.(type, title, message);
  };
  return {
    toast: fallback,
    success: (t: string, m?: string) => fallback("success", t, m),
    error:   (t: string, m?: string) => fallback("error",   t, m),
    warning: (t: string, m?: string) => fallback("warning", t, m),
    info:    (t: string, m?: string) => fallback("info",    t, m),
  };
}

// Versão standalone sem hook (para usar fora de componentes React se necessário)
export const toast = {
  success: (title: string, message?: string) => externalToast?.("success", title, message),
  error:   (title: string, message?: string) => externalToast?.("error",   title, message),
  warning: (title: string, message?: string) => externalToast?.("warning", title, message),
  info:    (title: string, message?: string) => externalToast?.("info",    title, message),
};

function ToastCard({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const c = COLORS[item.type];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [item.id, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        minWidth: 280,
        maxWidth: 360,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(.175,.885,.32,1.275), opacity 0.3s",
        pointerEvents: "all",
      }}
    >
      <span style={{ color: c.icon, flexShrink: 0, marginTop: 1 }}>{ICONS[item.type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: c.text, lineHeight: 1.3 }}>{item.title}</div>
        {item.message && (
          <div style={{ fontSize: 12, color: c.text, opacity: 0.8, marginTop: 2, lineHeight: 1.4 }}>{item.message}</div>
        )}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(item.id), 300); }}
        aria-label="Fechar notificação"
        style={{ background: "none", border: "none", cursor: "pointer", color: c.icon, padding: 0, flexShrink: 0, marginTop: 1 }}
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    externalToast = addToast;
    return () => { externalToast = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onRemove={removeToast} />
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    externalToast = addToast;
    return () => { externalToast = null; };
  }, [addToast]);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (t, m) => addToast("success", t, m),
    error:   (t, m) => addToast("error",   t, m),
    warning: (t, m) => addToast("warning", t, m),
    info:    (t, m) => addToast("info",    t, m),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
