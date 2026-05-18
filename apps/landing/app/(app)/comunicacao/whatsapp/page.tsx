"use client";

import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import Link from "next/link";

export default function ComunicacaoWhatsAppPage() {
  return (
    <div className="page-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/comunicacao" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>WhatsApp em Massa</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Use a página principal de Comunicação</p>
        </div>
      </div>
      <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <MessageCircle size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
        <p style={{ color: "#6B7280", marginBottom: 16 }}>A funcionalidade de WhatsApp em massa está centralizada na página de Comunicação.</p>
        <Link href="/comunicacao" style={{ padding: "10px 20px", background: "#25D366", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Send size={16} />
          Ir para Comunicação
        </Link>
      </div>
    </div>
  );
}
