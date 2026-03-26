"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckSquare } from "lucide-react";

export default function FrequenciaPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.8375rem", marginBottom: "1rem", padding: 0 }}>
        <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
      </button>
      <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.5rem" }}>Histórico de Frequência</h1>
      <div style={{ background: "white", borderRadius: "12px", padding: "3rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center" }}>
        <CheckSquare size={40} strokeWidth={1.5} color="#D1D5DB" />
        <p style={{ color: "#9CA3AF", marginTop: "1rem", fontSize: "0.9rem" }}>
          Nenhum registro de frequência encontrado.<br />
          Os check-ins aparecerão aqui quando o módulo de cultos estiver ativo.
        </p>
      </div>
    </div>
  );
}
