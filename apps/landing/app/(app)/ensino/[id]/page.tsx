"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Play, FileText, CheckCircle, Circle,
  Clock, GraduationCap, Award, ChevronDown, ChevronRight, Trash2, Edit3,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Aula {
  id: string; titulo: string; tipo: string; conteudo?: string; duracao?: string; ordem: number;
}
interface Modulo {
  id: string; titulo: string; ordem: number; aulas: Aula[];
}
interface Curso {
  id: string; titulo: string; descricao?: string; banner?: string; categoria: string;
  nivel: string; cargaHoraria?: number; instrutor?: string; publicado: boolean;
  modulos: Modulo[];
  progressos: { aulaId: string; concluido: boolean }[];
}

export default function CursoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = typeof params.id === "string" ? params.id : "";
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (cursoId) fetchCurso(); }, [cursoId]);

  async function fetchCurso() {
    try {
      const res = await fetch(`/api/ensino/${cursoId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCurso(data);
      if (data.modulos?.length > 0) setOpenModules(new Set([data.modulos[0].id]));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function toggleModule(id: string) {
    setOpenModules(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/ensino/${cursoId}`, { method: "DELETE" });
      router.push("/ensino");
    } catch { alert("Erro ao excluir"); }
    finally { setDeleting(false); }
  }

  function isAulaConcluida(aulaId: string) {
    return curso?.progressos?.some(p => p.aulaId === aulaId && p.concluido) ?? false;
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!curso) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Curso nao encontrado</div>;

  const totalAulas = curso.modulos.reduce((a, m) => a + m.aulas.length, 0);
  const aulasConcluidas = curso.progressos?.filter(p => p.concluido).length ?? 0;
  const percentual = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/ensino" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0D2545", margin: 0, flex: 1 }}>{curso.titulo}</h1>
        <button onClick={handleDelete} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Trash2 size={14} /> Excluir
        </button>
      </div>

      {/* Banner + Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        {curso.banner && <div style={{ height: 180, background: `url(${curso.banner}) center/cover` }} />}
        {!curso.banner && <div style={{ height: 120, background: `linear-gradient(135deg, ${NAVY} 0%, #2563EB 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={40} color="rgba(255,255,255,0.3)" /></div>}
        <div style={{ padding: 24 }}>
          {curso.descricao && <p style={{ margin: "0 0 16px", fontSize: 14, color: "#555", lineHeight: 1.6 }}>{curso.descricao}</p>}
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6B7280", flexWrap: "wrap" }}>
            {curso.instrutor && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GraduationCap size={14} /> {curso.instrutor}</span>}
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={14} /> {curso.modulos.length} modulos</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Play size={14} /> {totalAulas} aulas</span>
            {curso.cargaHoraria && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {curso.cargaHoraria}h</span>}
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Progresso do Curso</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: percentual === 100 ? "#16A34A" : GOLD }}>{percentual}% concluido</span>
        </div>
        <div style={{ height: 10, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${percentual}%` }} transition={{ duration: 1, ease: "easeOut" }}
            style={{ height: "100%", background: percentual === 100 ? "#16A34A" : `linear-gradient(90deg, ${NAVY}, ${GOLD})`, borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#9CA3AF" }}>{aulasConcluidas} de {totalAulas} aulas concluidas</div>
        {percentual === 100 && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#DCFCE7", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#16A34A" }}>
            <Award size={18} /> Curso concluido! Certificado disponivel em <Link href="/ensino/certificados" style={{ color: "#16A34A", fontWeight: 700 }}>Certificados</Link>
          </div>
        )}
      </motion.div>

      {/* Modules + Lessons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {curso.modulos.map((mod, mi) => (
          <motion.div key={mod.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + mi * 0.05 }}
            style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <button onClick={() => toggleModule(mod.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              {openModules.has(mod.id) ? <ChevronDown size={18} color={NAVY} /> : <ChevronRight size={18} color="#9CA3AF" />}
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0D2545", flex: 1 }}>
                Modulo {mi + 1}: {mod.titulo}
              </span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{mod.aulas.length} aulas</span>
            </button>

            {openModules.has(mod.id) && (
              <div style={{ borderTop: "1px solid #F3F4F6" }}>
                {mod.aulas.map((aula) => {
                  const concluida = isAulaConcluida(aula.id);
                  return (
                    <Link key={aula.id} href={`/ensino/${cursoId}/aula/${aula.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 12px 48px", borderBottom: "1px solid #FAFAFA", cursor: "pointer", transition: "background 0.1s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#F9FAFB"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ""; }}>
                        {concluida ? <CheckCircle size={18} color="#16A34A" /> : <Circle size={18} color="#D1D5DB" />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: concluida ? "#16A34A" : "#374151" }}>{aula.titulo}</div>
                        </div>
                        <span style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
                          {aula.tipo === "VIDEO" && <Play size={12} />}
                          {aula.tipo === "PDF" && <FileText size={12} />}
                          {aula.tipo === "TEXTO" && <BookOpen size={12} />}
                          {aula.tipo}
                        </span>
                        {aula.duracao && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{aula.duracao}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
