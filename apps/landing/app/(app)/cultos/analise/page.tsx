"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, Users, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface DadosAssiduidade {
  totalCultos: number;
  mediaPorCulto: number;
  tendencia: "subindo" | "descendo" | "estavel";
  topMembro: { nome: string; pct: number } | null;
  chartData: { culto: string; presentes: number }[];
  distribuicao: { faixa: string; count: number; pct: number }[];
}

export default function AssiduidadePage() {
  const [dados, setDados] = useState<DadosAssiduidade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cultos/assiduidade").then(r => r.json()).then(d => setDados(d)).finally(() => setLoading(false));
  }, []);

  const tendenciaCor = dados?.tendencia === "subindo" ? "#16A34A" : dados?.tendencia === "descendo" ? "#DC2626" : GOLD;
  const tendenciaLabel = dados?.tendencia === "subindo" ? "↗ Crescendo" : dados?.tendencia === "descendo" ? "↘ Caindo" : "→ Estável";

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Análise de Assiduidade</h1>
        <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Visão geral da participação da congregação nos cultos</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total de cultos", value: dados?.totalCultos ?? "—", icon: <BarChart2 size={18} />, bg: "#EEF2FA", color: NAVY },
          { label: "Média por culto", value: dados?.mediaPorCulto ?? "—", icon: <Users size={18} />, bg: "#F3F4F6", color: "#374151" },
          { label: "Tendência", value: tendenciaLabel, icon: <TrendingUp size={18} />, bg: "#DCFCE7", color: tendenciaCor },
          { label: "Mais assíduo", value: dados?.topMembro ? `${dados.topMembro.nome.split(" ")[0]} (${dados.topMembro.pct}%)` : "—", icon: <Award size={18} />, bg: "#FFF8EE", color: GOLD },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0D2545", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gráfico linha: evolução da presença */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: "0 0 20px" }}>Evolução de Presença por Culto</h2>
        {loading ? (
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : !dados?.chartData?.length ? (
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Dados insuficientes</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dados.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="culto" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="presentes" stroke={NAVY} strokeWidth={2.5} dot={{ r: 4, fill: NAVY }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Distribuição de assiduidade */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: NAVY, margin: "0 0 16px" }}>Distribuição por Faixa de Frequência</h2>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : !dados?.distribuicao?.length ? (
          <div style={{ padding: 24, textAlign: "center", color: "#9CA3AF" }}>Nenhum dado</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {dados.distribuicao.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 120, fontSize: 13, fontWeight: 600, color: "#374151", flexShrink: 0 }}>{d.faixa}</span>
                <div style={{ flex: 1, height: 10, background: "#F3F4F6", borderRadius: 5, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: d.pct + "%" }} transition={{ delay: i * 0.1, duration: 0.6 }}
                    style={{ height: "100%", background: i === 0 ? "#16A34A" : i === 1 ? GOLD : i === 2 ? "#F59E0B" : "#DC2626", borderRadius: 5 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", width: 70, textAlign: "right" }}>{d.count} ({d.pct}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
