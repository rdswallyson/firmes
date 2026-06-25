"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Play, FileText, CheckCircle, Circle,
  Clock, GraduationCap, Award, ChevronDown, ChevronRight,
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
  id: string; titulo: string; descricao?: string; banner?: string;
  cargaHoraria?: number;
  modulos: Modulo[];
  progressos: { aulaId: string; memberId: string; concluido: boolean; dataHora?: string }[];
}
interface Member {
  id: string; name: string; photo?: string; email?: string;
}

export default function DiscipuladoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = typeof params.cursoId === "string" ? params.cursoId : "";
  const memberId = typeof params.memberId === "string" ? params.memberId : "";

  const [curso, setCurso] = useState<Curso | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (cursoId && memberId) fetchAll();
  }, [cursoId, memberId]);

  async function fetchAll() {
    try {
      const [cRes, mRes] = await Promise.all([
        fetch(`/api/ensino/${cursoId}`),
        fetch(`/api/members/${memberId}`),
      ]);
      if (cRes.ok) {
        const c = await cRes.json();
        setCurso(c);
      }
      if (mRes.ok) {
        const m = await mRes.json();
        setMember(m.member ?? null);
      }
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

  const allAulas = curso?.modulos.flatMap(m => m.aulas) ?? [];
  const memberProgressos = curso?.progressos?.filter(p => p.memberId === memberId) ?? [];
  const concluidas = memberProgressos.filter(p => p.concluido).length;
  const totalAulas = allAulas.length;
  const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;

  const primeiroProgresso = memberProgressos[0];
  const dataInicio = primeiroProgresso?.dataHora
    ? new Date(primeiroProgresso.dataHora).toLocaleDateString("pt-BR")
    : "—";

  function isAulaConcluida(aulaId: string) {
    return memberProgressos.some(p => p.aulaId === aulaId && p.concluido);
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!curso || !member) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Dados nao encontrados</div>;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href="/ensino/discipulados" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0D2545", margin: 0 }}>Detalhe do Discipulado</h1>
        </div>
      </div>

      {/* Aluno + Curso */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        {curso.banner && <div style={{ height: 140, background: `url(${curso.banner}) center/cover` }} />}
        {!curso.banner && <div style={{ height: 90, background: `linear-gradient(135deg, ${NAVY} 0%, #2563EB 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}><BookOpen size={32} color="rgba(255,255,255,0.3)" /></div>}
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: member.photo ? `url(${member.photo}) center/cover` : NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
              {!member.photo && member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0D2545" }}>{member.name}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>{curso.titulo}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6B7280", flexWrap: "wrap", marginTop: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><GraduationCap size={14} /> {curso.modulos.length} modulos</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={14} /> {totalAulas} aulas</span>
            {curso.cargaHoraria && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {curso.cargaHoraria}h</span>}
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> Inicio: {dataInicio}</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Progresso de {member.name.split(" ")[0]}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: percentual === 100 ? "#16A34A" : GOLD }}>{percentual}% concluido</span>
        </div>
        <div style={{ height: 10, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${percentual}%` }} transition={{ duration: 1, ease: "easeOut" }}
            style={{ height: "100%", background: percentual === 100 ? "#16A34A" : `linear-gradient(90deg, ${NAVY}, ${GOLD})`, borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#9CA3AF" }}>{concluidas} de {totalAulas} aulas concluidas</div>
        {percentual === 100 && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#DCFCE7", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#16A34A" }}>
            <Award size={18} /> Curso concluido! Certificado disponível em <Link href="/ensino/certificados" style={{ color: "#16A34A", fontWeight: 700 }}>Certificados</Link>
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
                    <div key={aula.id}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 12px 48px", borderBottom: "1px solid #FAFAFA" }}>
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
