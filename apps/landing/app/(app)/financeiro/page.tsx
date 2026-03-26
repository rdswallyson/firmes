"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FinData {
  saldo: number;
  totalReceitas: number;
  totalDespesas: number;
  finances: { id: string; type: string; category: string; amount: number; date: string; memberName: string | null; description: string | null }[];
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PIE_COLORS = ["#1A3C6E", "#C8922A", "#16A34A", "#7C3AED", "#DC2626", "#0891B2"];

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/financeiro?limit=100")
      .then((r) => r.json())
      .then((d: FinData) => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const saldo = data?.saldo ?? 0;
  const receitas = data?.totalReceitas ?? 0;
  const despesas = data?.totalDespesas ?? 0;
  const finances = data?.finances ?? [];

  const saldoCount = useCountUp(Math.abs(saldo));
  const receitasCount = useCountUp(receitas);
  const despesasCount = useCountUp(despesas);

  const monthlyData = MONTH_LABELS.map((mes, i) => {
    const rec = finances.filter(f => f.type === "RECEITA" && new Date(f.date).getMonth() === i).reduce((s, f) => s + f.amount, 0);
    const desp = finances.filter(f => f.type === "DESPESA" && new Date(f.date).getMonth() === i).reduce((s, f) => s + f.amount, 0);
    return { mes, receitas: rec, despesas: desp };
  });

  const categoryMap: Record<string, number> = {};
  finances.filter(f => f.type === "DESPESA").forEach(f => {
    categoryMap[f.category] = (categoryMap[f.category] ?? 0) + f.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const recentTransactions = finances.slice(0, 8);

  const stats = [
    { label: "Saldo Atual", value: `R$ ${saldoCount.toLocaleString("pt-BR")}`, icon: <Wallet size={20} strokeWidth={1.5} />, color: saldo >= 0 ? "#16A34A" : "#DC2626" },
    { label: "Receitas", value: `R$ ${receitasCount.toLocaleString("pt-BR")}`, icon: <TrendingUp size={20} strokeWidth={1.5} />, color: "#16A34A" },
    { label: "Despesas", value: `R$ ${despesasCount.toLocaleString("pt-BR")}`, icon: <TrendingDown size={20} strokeWidth={1.5} />, color: "#DC2626" },
    { label: "Lançamentos", value: String(finances.length), icon: <DollarSign size={20} strokeWidth={1.5} />, color: "#1A3C6E" },
  ];

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Financeiro</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Visão geral das finanças</p>
        </div>
        <Link href="/financeiro/lancamentos" style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", borderRadius: "8px", fontSize: "0.8375rem", fontWeight: 600, textDecoration: "none" }}>
          <DollarSign size={16} strokeWidth={1.5} /> Lançamentos
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ flex: 1, background: "white", borderRadius: "10px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ flex: "0 0 60%", background: "white", borderRadius: "12px", padding: "1.25rem 1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Receitas vs Despesas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} />
              <Bar dataKey="receitas" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={16} name="Receitas" />
              <Bar dataKey="despesas" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={16} name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ flex: 1, background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Despesas por Categoria</h3>
          {pieData.length === 0 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR")}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {pieData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#6B7280" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Últimos Lançamentos</h3>
          <Link href="/financeiro/lancamentos" style={{ display: "flex", alignItems: "center", gap: "2px", color: "#1A3C6E", fontSize: "0.8rem", fontWeight: 500, textDecoration: "none" }}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum lançamento registrado</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                {["Data", "Tipo", "Categoria", "Descrição", "Membro", "Valor"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.6rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(f => (
                <tr key={f.id} style={{ borderBottom: "1px solid #F9FAFB" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                  <td style={{ padding: "0.5rem 1rem", color: "#6B7280" }}>{new Date(f.date).toLocaleDateString("pt-BR")}</td>
                  <td style={{ padding: "0.5rem 1rem" }}>
                    <span style={{ background: f.type === "RECEITA" ? "#DCFCE7" : "#FEE2E2", color: f.type === "RECEITA" ? "#16A34A" : "#DC2626", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>
                      {f.type === "RECEITA" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 1rem", color: "#374151" }}>{f.category}</td>
                  <td style={{ padding: "0.5rem 1rem", color: "#6B7280", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.description ?? "—"}</td>
                  <td style={{ padding: "0.5rem 1rem", color: "#6B7280" }}>{f.memberName ?? "—"}</td>
                  <td style={{ padding: "0.5rem 1rem", fontWeight: 600, color: f.type === "RECEITA" ? "#16A34A" : "#DC2626" }}>
                    {f.type === "RECEITA" ? "+" : "-"} R$ {f.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
