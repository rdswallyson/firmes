"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Plus, Search, BookOpen, CheckCircle, Clock } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Escola {
  id: string;
  nome: string;
  tipo: string;
  totalAlunos: number;
  totalCursos: number;
  status: string;
  instrutor?: string;
}

// Simulated schools based on course categories
const TIPOS_ESCOLA = [
  { id: "ESTUDO", nome: "Escola de Estudos Biblicos", tipo: "ESTUDO" },
  { id: "DISCIPULADO", nome: "Escola de Discipulado", tipo: "DISCIPULADO" },
  { id: "ESCOLA", nome: "Escola de Lideres", tipo: "ESCOLA" },
  { id: "OUTROS", nome: "Cursos Livres", tipo: "OUTROS" },
];

export default function EscolasPage() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/ensino").then(r => r.json()).then(data => {
      const cursos = data.cursos || [];
      
      // Group cursos by categoria
      const escolasMap: Record<string, Escola> = {};
      
      TIPOS_ESCOLA.forEach(t => {
        escolasMap[t.tipo] = {
          id: t.tipo,
          nome: t.nome,
          tipo: t.tipo,
          totalAlunos: 0,
          totalCursos: 0,
          status: "ATIVA",
        };
      });
      
      cursos.forEach((curso: any) => {
        const cat = curso.categoria || "OUTROS";
        if (escolasMap[cat]) {
          escolasMap[cat].totalCursos++;
          escolasMap[cat].totalAlunos += curso.progressos?.length || 0;
          if (curso.instrutor && !escolasMap[cat].instrutor) {
            escolasMap[cat].instrutor = curso.instrutor;
          }
        }
      });
      
      setEscolas(Object.values(escolasMap));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = escolas.filter(e => 
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Escolas e Turmas</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie as escolas e turmas da igreja</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <GraduationCap size={18} />, label: "Escolas", value: escolas.filter(e => e.totalCursos > 0).length, bg: "#EEF2FA", color: NAVY },
          { icon: <BookOpen size={18} />, label: "Total cursos", value: escolas.reduce((a, e) => a + e.totalCursos, 0), bg: "#DCFCE7", color: "#16A34A" },
          { icon: <Users size={18} />, label: "Total alunos", value: escolas.reduce((a, e) => a + e.totalAlunos, 0), bg: "#FEF3C7", color: "#CA8A04" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ color: "#6B7280", fontSize: 11, fontWeight: 500 }}>{s.label}</div>
              <div style={{ color: "#111827", fontSize: "1.1rem", fontWeight: 700 }}>{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#9CA3AF" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar escola..."
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none" }} />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((escola, i) => (
            <motion.div key={escola.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: escola.totalCursos > 0 ? `1.5px solid ${NAVY}20` : "1.5px solid #F3F4F6" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: escola.totalCursos > 0 ? `linear-gradient(135deg, ${NAVY}, ${GOLD})` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraduationCap size={22} color={escola.totalCursos > 0 ? "#fff" : "#9CA3AF"} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0D2545" }}>{escola.nome}</h3>
                    <span style={{ fontSize: 11, color: escola.totalCursos > 0 ? "#16A34A" : "#9CA3AF", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      {escola.totalCursos > 0 ? <><CheckCircle size={12} /> Ativa</> : <><Clock size={12} /> Sem cursos</>}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{escola.totalCursos}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>Cursos</div>
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: GOLD }}>{escola.totalAlunos}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>Alunos</div>
                </div>
              </div>

              {escola.instrutor && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#6B7280" }}>
                  <strong>Coordenador:</strong> {escola.instrutor}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
