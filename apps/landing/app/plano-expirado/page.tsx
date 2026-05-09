"use client";

import Link from "next/link";
import { AlertTriangle, CreditCard, LogOut } from "lucide-react";

export default function PlanoExpiradoPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F0EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "3rem 2.5rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #FEE2E2",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            background: "#FEF2F2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <AlertTriangle size={36} strokeWidth={1.5} color="#DC2626" />
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", marginBottom: "0.75rem" }}>
          Conta suspensa
        </h1>
        <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          O acesso ao sistema foi suspenso por falta de pagamento ou cancelamento do plano.
          Para reativar sua conta, atualize seu plano abaixo.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/white-label/planos">
            <button
              style={{
                width: "100%",
                padding: "0.875rem 1.5rem",
                background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <CreditCard size={18} strokeWidth={1.5} />
              Ver planos e reativar
            </button>
          </Link>

          <Link href="/api/auth/logout">
            <button
              style={{
                width: "100%",
                padding: "0.875rem 1.5rem",
                background: "white",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <LogOut size={18} strokeWidth={1.5} />
              Sair da conta
            </button>
          </Link>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "#9CA3AF" }}>
          Dúvidas? Entre em contato:{" "}
          <a href="mailto:suporte@firmes.app" style={{ color: "#1A3C6E" }}>
            suporte@firmes.app
          </a>
        </p>
      </div>
    </div>
  );
}
