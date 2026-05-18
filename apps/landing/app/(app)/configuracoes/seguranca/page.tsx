"use client";

import { useState } from "react";
import { ArrowLeft, Shield, Smartphone, Check } from "lucide-react";
import Link from "next/link";

export default function ConfigSegurancaPage() {
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/configuracoes" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Segurança</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Autenticação de dois fatores</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={24} style={{ color: "#1A3C6E" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Autenticação de Dois Fatores (2FA)</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>Adicione uma camada extra de segurança à sua conta.</p>
          </div>
          <button
            onClick={() => setTwoFA(!twoFA)}
            style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              border: "none",
              background: twoFA ? "#16A34A" : "#D1D5DB",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: 3,
                left: twoFA ? 23 : 3,
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>

        {twoFA && (
          <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 20 }}>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: "#374151" }}>Escaneie o QR Code com seu app autenticador:</p>
            <div style={{ width: 160, height: 160, background: "#E5E7EB", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Smartphone size={32} style={{ color: "#9CA3AF" }} />
            </div>
            <button
              onClick={() => alert("2FA ativado!")}
              style={{ padding: "10px 20px", background: "#16A34A", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              <Check size={16} style={{ display: "inline", marginRight: 6 }} />
              Confirmar ativação
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
