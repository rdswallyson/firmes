"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const colors = {
    danger:  { btn: "#DC2626", hover: "#B91C1C", icon: "#DC2626", bg: "#FEF2F2" },
    warning: { btn: "#D97706", hover: "#B45309", icon: "#D97706", bg: "#FFFBEB" },
    info:    { btn: "#2563EB", hover: "#1D4ED8", icon: "#2563EB", bg: "#EFF6FF" },
  }[variant];

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); } finally { setLoading(false); }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCancel}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9000, backdropFilter: "blur(2px)" }}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-msg"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9001,
          background: "#fff",
          borderRadius: 16,
          padding: "28px 28px 24px",
          width: "min(400px, calc(100vw - 32px))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <button
          onClick={onCancel}
          aria-label="Fechar"
          style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={22} strokeWidth={1.5} color={colors.icon} />
          </div>
          <div>
            <h2 id="confirm-title" style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#111827" }}>{title}</h2>
            <p id="confirm-msg" style={{ margin: 0, fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            aria-label={confirmLabel}
            style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: colors.btn, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, minWidth: 100 }}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

/** Hook para usar facilmente */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant?: "danger" | "warning" | "info";
    resolve?: (ok: boolean) => void;
  }>({ open: false, title: "", message: "" });

  const confirm = (title: string, message: string, variant?: "danger" | "warning" | "info") =>
    new Promise<boolean>((resolve) => {
      setState({ open: true, title, message, variant, resolve });
    });

  const dialog = (
    <ConfirmDialog
      isOpen={state.open}
      title={state.title}
      message={state.message}
      variant={state.variant}
      onConfirm={() => { setState((s) => ({ ...s, open: false })); state.resolve?.(true); }}
      onCancel={() => { setState((s) => ({ ...s, open: false })); state.resolve?.(false); }}
    />
  );

  return { confirm, dialog };
}
