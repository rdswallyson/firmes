"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck, UserPlus, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Culto {
  id: string;
  titulo: string;
  data: string;
  _count: { checkins: number };
  checkins: { tipo: string }[];
}

export default function MembrosVisitantesPage() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cultos/stats").then(r => r.json()).then(d => setCultos(d.cultos || [])).finally(() => setLoading(false));
  }, []);

  const chartData = cultos.map(c => ({
    name: c.titulo.length > 20 ? c.titulo.slice(0, 18) + "…" : c.titulo,
    Membros: c.checkins?.filter(ch => ch.tipo === "MEMBRO").length || 0,
    Visitantes: c.checkins?.filter(ch => ch.tipo === "VISITANTE").length || 0,
  })).slice(0, 12);

  const totalMembros = cultos.reduce((acc, c) => acc + (c.checkins?.filter(ch => ch.tipo === "MEMBRO").length || 0), 0);
  const totalVisitantes = cultos.reduce((acc, c) => acc + (c.checkins?.filter(ch => ch.tipo === "VISITANTE").length || 0), 0);
  const totalGeral = totalMembros + totalVisitantes;
  const pctMembros = totalGeral > 0 ? Math.round((totalMembros / totalGeral) * 100) : 0;
  const pctVisitantes = totalGeral > 0 ? Math.round((totalVisitantes / totalGeral) * 100) : 0;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Membros × Visitantes</h1>
        <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Comparativo geral por culto</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Membros", value: totalMembros, pct: pctMembros + "%", icon: <UserCheck size={18} />, bg: "#EEF2FA", color: NAVY },
          { label: "Total Visitantes", value: totalVisitantes, pct: pctVisitantes + "%", icon: <UserPlus size={18} />, bg: "#FFF8EE", color: GOLD },
          { label: "Cultos analisados", value: cultos.length, pct: "", icon: <BarChart2 size={18} />, bg: "#F3F4F6", color: "#374151" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0D2545" }}>{s.value} {s.pct && <span style={{ fontSize: 12, color: "#9CA3AF" }}>({s.pct})</span>}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráfico de barras */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: "0 0 20px" }}>Membros x Visitantes por Culto</h2>
        {loading ? (
          <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : chartData.length === 0 ? (
          <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Nenhum dado ainda</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Membros" fill={NAVY} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Visitantes" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabela por culto */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Detalhe por Culto</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Culto", "Data", "Membros", "Visitantes", "Total", "% Visitantes"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : cultos.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9CA3AF" }}>Nenhum culto cadastrado</td></tr>
            ) : cultos.map(c => {
              const m = c.checkins?.filter(ch => ch.tipo === "MEMBRO").length || 0;
              const v = c.checkins?.filter(ch => ch.tipo === "VISITANTE").length || 0;
              const t = m + v;
              const pct = t > 0 ? Math.round((v / t) * 100) : 0;
              return (
                <tr key={c.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0D2545", fontSize: 14 }}>{c.titulo}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>{new Date(c.data).toLocaleDateString("pt-BR")}</td>
                  <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 700, color: NAVY }}>{m}</span></td>
                  <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 700, color: GOLD }}>{v}</span></td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0D2545" }}>{t}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: GOLD, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#6B7280", width: 34 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
