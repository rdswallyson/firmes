"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart2, Download, Users, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

interface Grupo {
  id: string;
  name: string;
  leader: { name: string } | null;
  frequencias: { presentes: number; ausentes: number; visitantes: number; date: string }[];
  _count: { members: number };
}

function getPresencaMedia(g: Grupo): number {
  const freqs = g.frequencias ?? [];
  if (freqs.length === 0) return 0;
  const tp = freqs.reduce((s, f) => s + f.presentes, 0);
  const tt = freqs.reduce((s, f) => s + f.presentes + f.ausentes, 0);
  return tt > 0 ? Math.round((tp / tt) * 100) : 0;
}

export default function RelatorioGruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grupos?includeFrequencia=true&all=true")
      .then((r) => r.json())
      .then((d) => setGrupos(d.grupos || []))
      .finally(() => setLoading(false));
  }, []);

  const comFreq = grupos.filter((g) => (g.frequencias ?? []).length > 0);
  const totalReunioes = grupos.reduce((s, g) => s + (g.frequencias ?? []).length, 0);
  const totalPresentes = grupos.reduce((s, g) => s + (g.frequencias ?? []).reduce((a, f) => a + f.presentes, 0), 0);
  const totalVisitantes = grupos.reduce((s, g) => s + (g.frequencias ?? []).reduce((a, f) => a + f.visitantes, 0), 0);
  const mediaGeral = comFreq.length > 0
    ? Math.round(comFreq.reduce((s, g) => s + getPresencaMedia(g), 0) / comFreq.length)
    : 0;

  // Dados para gráfico comparativo
  const dadosGrupos = grupos.map((g) => ({
    name: g.name.length > 14 ? g.name.substring(0, 14) + "…" : g.name,
    presenca: getPresencaMedia(g),
    reunioes: (g.frequencias ?? []).length,
    membros: g._count.members,
  })).sort((a, b) => b.presenca - a.presenca);

  // Tendência geral por mês (unifica todos os grupos)
  const porMes: Record<string, { mes: string; presentes: number; ausentes: number; visitantes: number }> = {};
  for (const g of grupos) {
    for (const f of (g.frequencias ?? [])) {
      const key = new Date(f.date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      if (!porMes[key]) porMes[key] = { mes: key, presentes: 0, ausentes: 0, visitantes: 0 };
      porMes[key].presentes += f.presentes;
      porMes[key].ausentes += f.ausentes;
      porMes[key].visitantes += f.visitantes;
    }
  }
  const tendencia = Object.values(porMes).slice(-6);

  function exportCSV() {
    const rows = [
      ["Grupo", "Líder", "Membros", "Reuniões", "Presença Média %"],
      ...grupos.map((g) => [g.name, g.leader?.name ?? "Sem líder", g._count.members, (g.frequencias ?? []).length, getPresencaMedia(g)]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "relatorio-presenca-grupos.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/grupos" style={{ color: "#6B7280", display: "flex" }}>
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Relatório de Presença</h1>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.2rem 0 0" }}>Visão consolidada de todos os grupos</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={exportCSV}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.5rem 1rem", background: "white", color: "#374151",
            border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer",
            fontWeight: 500, fontSize: "0.875rem",
          }}
        >
          <Download size={16} strokeWidth={1.5} /> Exportar CSV
        </motion.button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>Carregando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {[
              { label: "Total de Grupos", value: grupos.length, icon: <Users size={20} strokeWidth={1.5} />, color: "#1A3C6E" },
              { label: "Reuniões Registradas", value: totalReunioes, icon: <Calendar size={20} strokeWidth={1.5} />, color: "#7C3AED" },
              { label: "Média Geral de Presença", value: `${mediaGeral}%`, icon: <TrendingUp size={20} strokeWidth={1.5} />, color: mediaGeral >= 70 ? "#16A34A" : "#C8922A" },
              { label: "Total de Visitantes", value: totalVisitantes, icon: <Users size={20} strokeWidth={1.5} />, color: "#C8922A" },
            ].map((s) => (
              <div key={s.label} style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
                <div style={{ color: s.color, marginBottom: "0.5rem" }}>{s.icon}</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.2rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Comparativo por grupo */}
          {dadosGrupos.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem" }}>Comparativo por Grupo — % de Presença</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dadosGrupos} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="presenca" name="Presença Média" fill="#1A3C6E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tendência geral */}
          {tendencia.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem" }}>Tendência Geral — Últimos 6 Meses</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={tendencia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="presentes" name="Presentes" stroke="#1A3C6E" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="visitantes" name="Visitantes" stroke="#C8922A" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="ausentes" name="Ausentes" stroke="#DC2626" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tabela de grupos */}
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #E5E7EB" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>Todos os Grupos</h3>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {["#", "Grupo", "Líder", "Membros", "Reuniões", "Presença Média"].map((h) => (
                    <th key={h} style={{ padding: "0.625rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dadosGrupos.map((g, idx) => {
                  const original = grupos.find((og) => og.name.startsWith(g.name.replace("…", "")))!;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#9CA3AF" }}>{idx + 1}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 600, color: "#0D2545" }}>
                        <Link href={`/grupos/${original?.id ?? ""}`} style={{ color: "#1A3C6E", textDecoration: "none" }}>
                          {original?.name ?? g.name}
                        </Link>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#374151" }}>{original?.leader?.name ?? <span style={{ color: "#DC2626" }}>Sem líder</span>}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#374151" }}>{g.membros}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#374151" }}>{g.reunioes}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ width: "80px", height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${g.presenca}%`, background: g.presenca >= 70 ? "#16A34A" : g.presenca >= 50 ? "#C8922A" : "#DC2626", borderRadius: "3px" }} />
                          </div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: g.presenca >= 70 ? "#16A34A" : g.presenca >= 50 ? "#C8922A" : "#DC2626" }}>{g.presenca}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
