"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Plus, Search, GraduationCap, Clock, Users, ChevronRight,
  Award, BarChart3,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

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
      (c.instrutor?.toLowerCase().includes(search.toLowerCase()));
    const matchCat = !filtroCategoria || c.categoria === filtroCategoria;
    return matchSearch && matchCat;
  });

  const totalAulas = cursos.reduce((acc, c) => acc + c.modulos.reduce((a, m) => a + m.aulas.length, 0), 0);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Ensino & Discipulado</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie cursos, estudos e discipulados</p>
        </div>
        <Link href="/ensino/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <Plus size={16} /> Novo Curso
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <BookOpen size={20} />, label: "Total Cursos", value: cursos.length, bg: "#EEF2FA", color: NAVY },
          { icon: <BarChart3 size={20} />, label: "Total Aulas", value: totalAulas, bg: "#DCFCE7", color: "#16A34A" },
          { icon: <GraduationCap size={20} />, label: "Publicados", value: cursos.filter(c => c.publicado).length, bg: "#FEF3C7", color: "#CA8A04" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ color: "#6B7280", fontSize: 12, fontWeight: 500 }}>{s.label}</div>
              <div style={{ color: "#111827", fontSize: "1.25rem", fontWeight: 700 }}>{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#9CA3AF" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por titulo ou instrutor..."
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none" }} />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}>
          <option value="">Todas categorias</option>
          <option value="ESTUDO">Estudo</option>
          <option value="DISCIPULADO">Discipulado</option>
          <option value="ESCOLA">Escola</option>
          <option value="OUTROS">Outros</option>
        </select>
      </div>

      {/* Course List */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", background: "#fff", borderRadius: 12 }}>
          <BookOpen size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p>Nenhum curso encontrado</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map((curso, i) => {
            const totalA = curso.modulos.reduce((a, m) => a + m.aulas.length, 0);
            const badge = CAT_BADGE[curso.categoria] || { bg: "#F3F4F6", color: "#6B7280", label: "Outros" };
            return (
              <motion.div key={curso.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/ensino/${curso.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", transition: "transform 0.15s, box-shadow 0.15s", cursor: "pointer" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)"; }}>
                    {/* Banner */}
                    <div style={{ height: 120, background: curso.banner ? `url(${curso.banner}) center/cover` : `linear-gradient(135deg, ${NAVY} 0%, #2563EB 100%)`, display: "flex", alignItems: "flex-end", padding: 12 }}>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>{badge.label}</span>
                    </div>
                    {/* Content */}
                    <div style={{ padding: "14px 18px" }}>
                      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#0D2545", lineHeight: 1.3 }}>{curso.titulo}</h3>
                      {curso.descricao && <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6B7280", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{curso.descricao}</p>}
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9CA3AF", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={13} /> {curso.modulos.length} modulos</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BarChart3 size={13} /> {totalA} aulas</span>
                        {curso.cargaHoraria && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} /> {curso.cargaHoraria}h</span>}
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{NIVEL_LABEL[curso.nivel] ?? curso.nivel}</span>
                      </div>
                      {curso.instrutor && <div style={{ marginTop: 8, fontSize: 12, color: NAVY, fontWeight: 600 }}>{curso.instrutor}</div>}
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
