"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Plus, Search, BarChart3, Clock, ChevronRight,
  GraduationCap, Layers,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1B2B4B";

interface Curso {
  id: string;
  titulo: string;
  descricao?: string;
  banner?: string;
  categoria: string;
  nivel: string;
  cargaHoraria?: number;
  instrutor?: string;
  publicado: boolean;
  modulos: { id: string; aulas: { id: string }[] }[];
  _count?: { progressos: number };
}

const CAT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  ESTUDO: { bg: "#DBEAFE", color: "#1D4ED8", label: "Estudo" },
  DISCIPULADO: { bg: "#DCFCE7", color: "#16A34A", label: "Discipulado" },
  ESCOLA: { bg: "#FEF3C7", color: "#CA8A04", label: "Escola" },
  OUTROS: { bg: "#F3F4F6", color: "#6B7280", label: "Outros" },
};

const NIVEL_LABEL: Record<string, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediario",
  AVANCADO: "Avancado",
};

export default function EnsinoPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  useEffect(() => {
    fetch("/api/ensino").then(r => r.json()).then(d => {
      setCursos(d.cursos ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = cursos.filter(c => {
    const matchSearch = c.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (c.instrutor?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCat = !filtroCategoria || c.categoria === filtroCategoria;
    return matchSearch && matchCat;
  });

  const totalAulas = cursos.reduce((acc, c) => acc + c.modulos.reduce((a, m) => a + m.aulas.length, 0), 0);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: "#F8F9FC", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <BookOpen size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: NAVY, margin: "0 0 4px" }}>Ensino & Discipulado</h1>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>Gerencie cursos, estudos e discipulados da sua igreja.</p>
          </div>
        </div>
        <Link href="/ensino/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <Plus size={16} strokeWidth={1.5} /> Novo Curso
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { icon: <BookOpen size={22} strokeWidth={1.5} />, label: "Total Cursos", value: cursos.length, sub: "cursos", bg: "#EFF6FF", color: "#3B82F6" },
          { icon: <BarChart3 size={22} strokeWidth={1.5} />, label: "Total Aulas", value: totalAulas, sub: "aulas", bg: "#ECFDF5", color: "#10B981" },
          { icon: <GraduationCap size={22} strokeWidth={1.5} />, label: "Publicados", value: cursos.filter(c => c.publicado).length, sub: "publicados", bg: "#FFFBEB", color: "#F59E0B" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ color: "#6B7280", fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
              <div style={{ color: "#111827", fontSize: "1.4rem", fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <div style={{ flex: 1, maxWidth: 500, position: "relative" }}>
          <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por titulo ou instrutor..."
            style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "white" }} />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          style={{ padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13, background: "white", color: "#374151", minWidth: 160 }}>
          <option value="">Todas categorias</option>
          <option value="ESTUDO">Estudo</option>
          <option value="DISCIPULADO">Discipulado</option>
          <option value="ESCOLA">Escola</option>
          <option value="OUTROS">Outros</option>
        </select>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", background: "#fff", borderRadius: 14 }}>
          <BookOpen size={40} strokeWidth={1.5} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p>Nenhum curso encontrado</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map((curso, i) => {
            const totalA = curso.modulos.reduce((a, m) => a + m.aulas.length, 0);
            const badge = CAT_BADGE[curso.categoria] || { bg: "#F3F4F6", color: "#6B7280", label: "Outros" };
            return (
              <motion.div key={curso.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/ensino/${curso.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "transform 0.15s, box-shadow 0.15s", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                  >
                    {/* Banner */}
                    <div style={{ height: 140, background: curso.banner ? `url(${curso.banner}) center/cover` : `linear-gradient(135deg, ${NAVY} 0%, #2563EB 100%)`, position: "relative", display: "flex", alignItems: "flex-end", padding: 12 }}>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{badge.label}</span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{curso.titulo}</h3>

                      <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#6B7280", flexWrap: "wrap", marginBottom: 14 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Layers size={13} strokeWidth={1.5} /> {curso.modulos.length} modulo</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BarChart3 size={13} strokeWidth={1.5} /> {totalA} aula</span>
                        {curso.cargaHoraria && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} strokeWidth={1.5} /> {curso.cargaHoraria}h</span>}
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BarChart3 size={13} strokeWidth={1.5} /> {NIVEL_LABEL[curso.nivel] ?? curso.nivel}</span>
                      </div>

                      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6B7280" }}>
                            {curso.instrutor?.charAt(0) || "I"}
                          </div>
                          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{curso.instrutor || "—"}</span>
                        </div>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}>
                          <MoreIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MoreIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
