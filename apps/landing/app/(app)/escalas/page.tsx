"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Users, Music, Mic, DoorOpen, Baby, Headphones, CheckCircle, XCircle, Clock, Trash2, Eye } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

const MINISTERIOS = [
  { id: "LOUVOR", label: "Louvor", icon: <Music size={16} />, color: "#7C3AED" },
  { id: "SOM", label: "Som", icon: <Headphones size={16} />, color: "#2563EB" },
  { id: "RECEPCAO", label: "Recepção", icon: <Users size={16} />, color: "#16A34A" },
  { id: "PORTARIA", label: "Portaria", icon: <DoorOpen size={16} />, color: "#DC2626" },
  { id: "INFANTIL", label: "Infantil", icon: <Baby size={16} />, color: "#EA580C" },
];

interface Escala {
  id: string;
  titulo: string;
  data: string;
  ministerio: string;
  status: string;
  observacoes?: string;
  membros: { id: string; funcao: string; status: string; member: { name: string; photo?: string } }[];
  _count: { membros: number };
}

export default function EscalasPage() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroMinisterio, setFiltroMinisterio] = useState("TODOS");
  const [viewMode, setViewMode] = useState<"semana" | "mes">("semana");

  useEffect(() => {
    fetch("/api/escalas").then(r => r.json()).then(d => setEscalas(d.escalas || [])).finally(() => setLoading(false));
  }, []);

  const hoje = new Date();
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const fimSemana = new Date(inicioSemana); fimSemana.setDate(inicioSemana.getDate() + 6);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const filtrados = escalas.filter(e => {
    const d = new Date(e.data);
    const noPeriodo = viewMode === "semana" ? d >= inicioSemana && d <= fimSemana : d >= inicioMes && d <= fimMes;
    const minOk = filtroMinisterio === "TODOS" || e.ministerio === filtroMinisterio;
    return noPeriodo && minOk;
  });

  const confirmados = (e: Escala) => e.membros.filter(m => m.status === "CONFIRMADO").length;
  const pendentes = (e: Escala) => e.membros.filter(m => m.status === "PENDENTE").length;
  const recusados = (e: Escala) => e.membros.filter(m => m.status === "RECUSADO").length;

  const deletar = async (id: string) => {
    if (!confirm("Excluir esta escala?")) return;
    await fetch(`/api/escalas/${id}`, { method: "DELETE" });
    setEscalas(escalas.filter(e => e.id !== id));
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Escalas de Ministério</h1>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Organize os voluntários por ministério e data</p>
        </div>
        <Link href="/escalas/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <Plus size={16} /> Nova Escala
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ id: "TODOS", label: "Todos", icon: <Calendar size={14} />, color: "#374151" }, ...MINISTERIOS].map(m => (
            <button key={m.id} onClick={() => setFiltroMinisterio(m.id)}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: filtroMinisterio === m.id ? m.color : "#F3F4F6", color: filtroMinisterio === m.id ? "#fff" : "#6B7280" }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: "#F3F4F6", borderRadius: 8, padding: 3 }}>
          {(["semana", "mes"] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: viewMode === v ? "#fff" : "transparent", color: viewMode === v ? NAVY : "#9CA3AF", boxShadow: viewMode === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {v === "semana" ? "Esta semana" : "Este mês"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <Calendar size={48} style={{ margin: "0 auto 16px", color: "#D1D5DB" }} />
          <p style={{ color: "#9CA3AF", margin: "0 0 16px" }}>Nenhuma escala para este período</p>
          <Link href="/escalas/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            <Plus size={14} /> Criar escala
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {filtrados.map((e, i) => {
            const min = MINISTERIOS.find(m => m.id === e.ministerio);
            return (
              <motion.div key={e.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${min?.color || NAVY}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: min?.color + "15" || "#EEF2FA", color: min?.color || NAVY }}>
                        {min?.icon} {min?.label || e.ministerio}
                      </span>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{new Date(e.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#0D2545" }}>{e.titulo}</h3>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#16A34A", display: "flex", alignItems: "center", gap: 3 }}><CheckCircle size={12} /> {confirmados(e)} confirmados</span>
                      <span style={{ fontSize: 12, color: "#CA8A04", display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {pendentes(e)} pendentes</span>
                      {recusados(e) > 0 && <span style={{ fontSize: 12, color: "#DC2626", display: "flex", alignItems: "center", gap: 3 }}><XCircle size={12} /> {recusados(e)} recusados</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/escalas/${e.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 12px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      <Eye size={14} /> Ver
                    </Link>
                    <button onClick={() => deletar(e.id)} style={{ padding: 7, background: "#FEE2E2", color: "#DC2626", borderRadius: 8, border: "none", cursor: "pointer" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
