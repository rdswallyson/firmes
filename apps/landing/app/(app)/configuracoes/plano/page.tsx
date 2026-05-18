"use client";

import { useState } from "react";
import { ArrowLeft, CreditCard, Check, X } from "lucide-react";
import Link from "next/link";

export default function ConfigPlanoPage() {
  const [plano] = useState({
    nome: "Ouro",
    preco: 99,
    periodo: "mensal",
    status: "Ativo",
    proximaCobranca: "15/06/2026",
  });

  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/configuracoes" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Meu Plano</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Gerencie sua assinatura</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #1A3C6E, #C8922A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={28} style={{ color: "white" }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>Plano {plano.nome}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6B7280" }}>R$ {plano.preco}/{plano.periodo}</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, padding: "4px 12px", borderRadius: 8, background: "#DCFCE7", color: "#16A34A", fontWeight: 700 }}>
            {plano.status}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Próxima cobrança</p>
            <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: "#111827" }}>{plano.proximaCobranca}</p>
          </div>
          <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Membros</p>
            <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 700, color: "#111827" }}>Ilimitado</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            "Dashboard completo",
            "Módulo Pessoas",
            "Módulo Financeiro",
            "Módulo Eventos",
            "Módulo Vendas",
            "Relatórios avançados",
            "Suporte prioritário",
          ].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" }}>
              <Check size={16} style={{ color: "#16A34A" }} />
              {f}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => alert("Funcionalidade em desenvolvimento")}
            style={{ flex: 1, padding: "10px 20px", background: "linear-gradient(135deg, #1A3C6E, #1E4A84)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Alterar Plano
          </button>
          <button
            onClick={() => alert("Funcionalidade em desenvolvimento")}
            style={{ flex: 1, padding: "10px 20px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Cancelar Assinatura
          </button>
        </div>
      </div>
    </div>
  );
}
