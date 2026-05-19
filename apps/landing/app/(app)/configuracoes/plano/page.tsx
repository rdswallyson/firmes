"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import Link from "next/link";

interface PlanoInfo {
  nome: string;
  preco: number;
  periodo: string;
  status: string;
  proximaCobranca: string;
}

export default function ConfigPlanoPage() {
  const [plano, setPlano] = useState<PlanoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((data) => {
        if (data.tenant) {
          setPlano({
            nome: data.tenant.plan || "FREE",
            preco: data.tenant.plan === "FREE" ? 0 : data.tenant.plan === "PRATA" ? 49 : data.tenant.plan === "OURO" ? 99 : data.tenant.plan === "DIAMANTE" ? 199 : 99,
            periodo: "mensal",
            status: data.tenant.isActive ? "Ativo" : "Suspenso",
            proximaCobranca: data.tenant.trialEndsAt
              ? new Date(data.tenant.trialEndsAt).toLocaleDateString("pt-BR")
              : "---",
          });
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : !plano ? (
        <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <p style={{ color: "#6B7280" }}>Não foi possível carregar os dados do plano.</p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "linear-gradient(135deg, #1A3C6E, #C8922A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={28} style={{ color: "white" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>Plano {plano.nome}</h2>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6B7280" }}>R$ {plano.preco}/{plano.periodo}</p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 12, padding: "4px 12px", borderRadius: 8, background: plano.status === "Ativo" ? "#DCFCE7" : "#FEE2E2", color: plano.status === "Ativo" ? "#16A34A" : "#DC2626", fontWeight: 700 }}>
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
          </div>
        </div>
      )}
    </div>
  );
}
