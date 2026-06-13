"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface Congregation {
  id: string;
  name: string;
}

interface Lancamento {
  id: string;
  description: string;
  type: string;
  amount: number;
  date: string | null;
  category: string | null;
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CongregacaoFinanceiroPage() {
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedCongregation, setSelectedCongregation] = useState<string>("");
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });

  useEffect(() => {
    fetch("/api/congregacoes")
      .then(r => r.json())
      .then((d: { congregations?: Congregation[] }) => setCongregations(d.congregations ?? []))
      .catch(() => null);
  }, []);

  const fetchFinanceiro = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCongregation) {
      params.set("congregationId", selectedCongregation === "sede" ? "sede" : selectedCongregation);
    }
    try {
      const res = await fetch(`/api/financeiro?${params}`);
      const data = await res.json() as { finances?: Lancamento[] };
      const list = data.finances ?? [];
      setLancamentos(list);

      const now = new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const mes = list.filter(f => f.date && new Date(f.date) >= inicioMes && new Date(f.date) < fimMes);
      const receitas = mes.filter(f => f.type === "RECEITA").reduce((s, f) => s + f.amount, 0);
      const despesas = mes.filter(f => f.type === "DESPESA").reduce((s, f) => s + f.amount, 0);
      setResumo({ receitas, despesas, saldo: receitas - despesas });
    } catch {
      setLancamentos([]);
      setResumo({ receitas: 0, despesas: 0, saldo: 0 });
    } finally {
      setLoading(false);
    }
  }, [selectedCongregation]);

  useEffect(() => { fetchFinanceiro(); }, [fetchFinanceiro]);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Financeiro do Mês</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Lançamentos por congregação</p>
        </div>
        <select
          value={selectedCongregation}
          onChange={(e) => setSelectedCongregation(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 14, minWidth: 180 }}
        >
          <option value="">Todas</option>
          <option value="sede">Sede</option>
          {congregations.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#F0FDF4", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#16A34A", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={14} /> Receitas</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A" }}>{brl(resumo.receitas)}</div>
        </div>
        <div style={{ background: "#FEF2F2", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#DC2626", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><TrendingDown size={14} /> Despesas</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#DC2626" }}>{brl(resumo.despesas)}</div>
        </div>
        <div style={{ background: "#EFF6FF", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#1A3C6E", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} /> Saldo</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0D2545" }}>{brl(resumo.saldo)}</div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #F3F4F6", fontWeight: 700, color: "#0D2545", fontSize: 16 }}>Últimos Lançamentos</div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : lancamentos.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum lançamento encontrado</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {lancamentos.slice(0, 10).map(l => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid #F3F4F6" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>{l.description}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{l.category ?? "Sem categoria"} · {l.date ? new Date(l.date).toLocaleDateString("pt-BR") : "—"}</div>
                </div>
                <div style={{ fontWeight: 700, color: l.type === "RECEITA" ? "#16A34A" : "#DC2626", fontSize: 14 }}>{l.type === "RECEITA" ? "+" : "-"} {brl(l.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
