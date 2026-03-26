"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart as RechartsPie, Pie, Cell
} from "recharts";

type Tab = "visao" | "dizimistas" | "fluxo";

interface MonthData { month: string; receitas: number; despesas: number; }
interface CategoryData { name: string; value: number; }
interface TopDizimista { name: string; total: number; }

const COLORS = ["#1A3C6E", "#C8922A", "#16A34A", "#DC2626", "#8B5CF6", "#EC4899", "#F59E0B", "#06B6D4"];

export default function RelatoriosPage() {
  const [tab, setTab] = useState<Tab>("visao");
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topDizimistas, setTopDizimistas] = useState<TopDizimista[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalReceitas: 0, totalDespesas: 0, saldo: 0, maiorDizimista: "", maiorCategoria: "" });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/financeiro?limit=1000");
        const d = await res.json();
        const finances = d.finances ?? [];

        const byMonth: Record<string, { receitas: number; despesas: number }> = {};
        const byCat: Record<string, number> = {};
        const byMember: Record<string, number> = {};
        let totalR = 0, totalD = 0;

        for (const f of finances) {
          const date = new Date(f.date);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (!byMonth[key]) byMonth[key] = { receitas: 0, despesas: 0 };

          if (f.type === "RECEITA") {
            byMonth[key].receitas += f.amount;
            totalR += f.amount;
            if (f.memberName) byMember[f.memberName] = (byMember[f.memberName] ?? 0) + f.amount;
          } else {
            byMonth[key].despesas += f.amount;
            totalD += f.amount;
            byCat[f.category] = (byCat[f.category] ?? 0) + f.amount;
          }
        }

        const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0])).slice(-12)
          .map(([m, v]) => ({ month: m.slice(5) + "/" + m.slice(2, 4), receitas: v.receitas, despesas: v.despesas }));
        setMonthlyData(months);

        const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
        setCategoryData(cats);

        const top = Object.entries(byMember).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, total]) => ({ name, total }));
        setTopDizimistas(top);

        setSummary({
          totalReceitas: totalR, totalDespesas: totalD, saldo: totalR - totalD,
          maiorDizimista: top[0]?.name ?? "—",
          maiorCategoria: cats[0]?.name ?? "—"
        });
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "visao", label: "Visão Geral", icon: <BarChart3 size={16} strokeWidth={1.5} /> },
    { key: "dizimistas", label: "Dizimistas", icon: <Users size={16} strokeWidth={1.5} /> },
    { key: "fluxo", label: "Fluxo de Caixa", icon: <TrendingUp size={16} strokeWidth={1.5} /> },
  ];

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.25rem" }}>Relatórios</h1>
      <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Análises financeiras detalhadas</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 600,
              background: tab === t.key ? "#1A3C6E" : "white", color: tab === t.key ? "white" : "#6B7280",
              boxShadow: tab === t.key ? "none" : "0 1px 3px rgba(0,0,0,0.06)" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{ padding: "3rem", color: "#9CA3AF", textAlign: "center" }}>Carregando...</div> : (
        <>
          {tab === "visao" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Total Receitas", value: fmt(summary.totalReceitas), color: "#16A34A" },
                  { label: "Total Despesas", value: fmt(summary.totalDespesas), color: "#DC2626" },
                  { label: "Saldo", value: fmt(summary.saldo), color: summary.saldo >= 0 ? "#16A34A" : "#DC2626" },
                  { label: "Maior Dizimista", value: summary.maiorDizimista, color: "#1A3C6E" },
                ].map((c, i) => (
                  <div key={i} style={{ background: "white", borderRadius: "10px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>{c.label}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: c.color }}>{c.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1rem" }}>
                <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700, color: "#0D2545" }}>Receitas vs Despesas (Mensal)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                      <Tooltip formatter={(v) => fmt(Number(v))} />
                      <Legend />
                      <Bar dataKey="receitas" name="Receitas" fill="#16A34A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesas" name="Despesas" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700, color: "#0D2545" }}>Despesas por Categoria</h3>
                  {categoryData.length === 0 ? <p style={{ color: "#9CA3AF", textAlign: "center", padding: "2rem 0" }}>Sem dados</p> : (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(Number(v))} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "dizimistas" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6" }}>
                  <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Top 10 Dizimistas</h3>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                      {["#", "Nome", "Total Contribuído"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "0.6rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topDizimistas.length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum dizimista registrado</td></tr>
                    ) : topDizimistas.map((d, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "0.6rem 1rem", fontWeight: 700, color: i < 3 ? "#C8922A" : "#6B7280" }}>{i + 1}</td>
                        <td style={{ padding: "0.6rem 1rem", color: "#374151", fontWeight: 500 }}>{d.name}</td>
                        <td style={{ padding: "0.6rem 1rem", fontWeight: 600, color: "#16A34A" }}>{fmt(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "fluxo" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "white", borderRadius: "10px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>Saldo Atual</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color: summary.saldo >= 0 ? "#16A34A" : "#DC2626" }}>{fmt(summary.saldo)}</div>
                </div>
                <div style={{ background: "white", borderRadius: "10px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>Categoria com Mais Gastos</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#DC2626" }}>{summary.maiorCategoria}</div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700, color: "#0D2545" }}>Evolução Mensal do Saldo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData.map(m => ({ ...m, saldo: m.receitas - m.despesas }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                    <Tooltip formatter={(v) => fmt(Number(v))} />
                    <Bar dataKey="saldo" name="Saldo" fill="#1A3C6E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
