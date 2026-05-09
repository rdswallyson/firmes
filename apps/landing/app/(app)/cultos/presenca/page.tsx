"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserPlus, Search, Download, Calendar } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Checkin {
  id: string;
  nome: string;
  tipo: string;
  telefone?: string;
  comoConheceu?: string;
  createdAt: string;
  culto: { id: string; titulo: string; data: string };
}

export default function PresencaPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "MEMBRO" | "VISITANTE">("TODOS");
  const [filtroCulto, setFiltroCulto] = useState("TODOS");
  const [cultos, setCultos] = useState<{ id: string; titulo: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/cultos/presenca").then(r => r.json()),
      fetch("/api/cultos").then(r => r.json()),
    ]).then(([presData, cultosData]) => {
      setCheckins(presData.checkins || []);
      setCultos(cultosData.cultos || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtrados = checkins.filter(c => {
    const buscaOk = !busca || c.nome.toLowerCase().includes(busca.toLowerCase());
    const tipoOk = filtroTipo === "TODOS" || c.tipo === filtroTipo;
    const cultoOk = filtroCulto === "TODOS" || c.culto?.id === filtroCulto;
    return buscaOk && tipoOk && cultoOk;
  });

  const exportarCSV = () => {
    const csv = ["Nome,Tipo,Telefone,Como Conheceu,Culto,Data/Hora",
      ...filtrados.map(c => `${c.nome},${c.tipo},${c.telefone || ""},${c.comoConheceu || ""},"${c.culto?.titulo || ""}",${new Date(c.createdAt).toLocaleString("pt-BR")}`)
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "presenca.csv"; link.click();
  };

  const totalMembros = filtrados.filter(c => c.tipo === "MEMBRO").length;
  const totalVisitantes = filtrados.filter(c => c.tipo === "VISITANTE").length;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Presenças — Todos os Cultos</h1>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Histórico completo de check-ins registrados</p>
        </div>
        <button onClick={exportarCSV} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total presenças", value: filtrados.length, icon: <Users size={18} />, bg: "#EEF2FA", color: NAVY },
          { label: "Membros", value: totalMembros, icon: <UserCheck size={18} />, bg: "#DCFCE7", color: "#16A34A" },
          { label: "Visitantes", value: totalVisitantes, icon: <UserPlus size={18} />, bg: "#FFF8EE", color: GOLD },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div><div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0D2545" }}>{s.value}</div><div style={{ fontSize: 11, color: "#6B7280" }}>{s.label}</div></div>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#9CA3AF" }} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome..."
            style={{ width: "100%", padding: "8px 12px 8px 30px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as any)}
          style={{ padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}>
          <option value="TODOS">Todos</option>
          <option value="MEMBRO">Membros</option>
          <option value="VISITANTE">Visitantes</option>
        </select>
        <select value={filtroCulto} onChange={e => setFiltroCulto(e.target.value)}
          style={{ padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none", maxWidth: 220 }}>
          <option value="TODOS">Todos os cultos</option>
          {cultos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
            <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p>Nenhuma presença encontrada</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Nome", "Tipo", "Culto", "Data/Hora", "Telefone", "Como Conheceu"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, i) => (
                <tr key={c.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0D2545", fontSize: 14 }}>{c.nome}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: c.tipo === "MEMBRO" ? "#EEF2FA" : "#FFF8EE", color: c.tipo === "MEMBRO" ? NAVY : GOLD }}>{c.tipo}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>
                    <Link href={`/cultos/${c.culto?.id}`} style={{ color: NAVY, textDecoration: "none", fontWeight: 600 }}>{c.culto?.titulo || "—"}</Link>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>{new Date(c.createdAt).toLocaleString("pt-BR")}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>{c.telefone || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>{c.comoConheceu || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
