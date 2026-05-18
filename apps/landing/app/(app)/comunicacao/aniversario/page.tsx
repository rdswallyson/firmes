"use client";

import { ArrowLeft, Cake, Send } from "lucide-react";
import Link from "next/link";

export default function ComunicacaoAniversarioPage() {
  return (
    <div className="page-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/comunicacao" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Parabéns Automático</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Configure na página de Comunicação</p>
        </div>
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Cake size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
        <p style={{ color: "#6B7280", marginBottom: 16 }}>A funcionalidade de parabéns automático está centralizada na página de Comunicação.</p>
        <Link href="/comunicacao" style={{ padding: "10px 20px", background: "#1A3C6E", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Send size={16} />
          Ir para Comunicação
        </Link>
      </div>
    </div>
  );
}
