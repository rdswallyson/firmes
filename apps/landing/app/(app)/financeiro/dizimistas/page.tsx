"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingDown } from "lucide-react";

interface Dizimista { name: string; total: number; count: number; lastDate: string; }

export default function DizimistasPage() {
  const [dizimistas, setDizimistas] = useState<Dizimista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/financeiro?limit=1000&type=RECEITA");
        const d = await res.json();
        const finances = d.finances ?? [];

        const byMember: Record<string, { total: number; count: number; lastDate: string }> = {};
        for (const f of finances) {
          if (!f.memberName || (f.category !== "DIZIMO" && f.category !== "OFERTA")) continue;
          if (!byMember[f.memberName]) byMember[f.memberName] = { total: 0, count: 0, lastDate: f.date };
          const entry = byMember[f.memberName]!;
          entry.total += f.amount;
          entry.count += 1;
          if (f.date > entry.lastDate) entry.lastDate = f.date;
        }

        const list = Object.entries(byMember)
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.total - a.total);
        setDizimistas(list);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const now = Date.now();
  const inactive = dizimistas.filter(d => (now - new Date(d.lastDate).getTime()) > 60 * 86400000);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.25rem" }}>Dizimistas</h1>
      <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Ranking e acompanhamento de contribuintes</p>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={18} strokeWidth={1.5} color="#1A3C6E" />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Ranking de Dizimistas</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                {["#", "Nome", "Contribuições", "Total", "Último"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.6rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
              ) : dizimistas.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum dizimista registrado</td></tr>
              ) : dizimistas.map((d, i) => (
                <motion.tr key={d.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: "1px solid #F9FAFB" }}>
                  <td style={{ padding: "0.55rem 1rem", fontWeight: 700, color: i < 3 ? "#C8922A" : "#6B7280", fontSize: "0.8rem" }}>{i + 1}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#374151", fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{d.count}x</td>
                  <td style={{ padding: "0.55rem 1rem", fontWeight: 600, color: "#16A34A" }}>{fmt(d.total)}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{new Date(d.lastDate).toLocaleDateString("pt-BR")}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", alignSelf: "start" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingDown size={18} strokeWidth={1.5} color="#DC2626" />
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Pararam de Dizimar</h3>
          </div>
          <div style={{ padding: "0.5rem 0" }}>
            {inactive.length === 0 ? (
              <p style={{ padding: "1.5rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.85rem" }}>Nenhum alerta</p>
            ) : inactive.map(d => (
              <div key={d.name} style={{ padding: "0.6rem 1.25rem", borderBottom: "1px solid #F9FAFB" }}>
                <div style={{ fontWeight: 500, color: "#374151", fontSize: "0.85rem" }}>{d.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#DC2626" }}>Último: {new Date(d.lastDate).toLocaleDateString("pt-BR")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
