"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, BookOpen, Play, FileText, CheckCircle, Circle,
  Clock, GraduationCap, Award, ChevronDown, ChevronRight,
  PlayCircle, Flame, Trophy,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1B2B4B";

interface Aula {
  id: string; titulo: string; tipo: string; conteudo?: string; duracao?: string; ordem: number;
}
interface Modulo {
  id: string; titulo: string; ordem: number; aulas: Aula[];
}
interface Curso {
  id: string; titulo: string; descricao?: string; banner?: string;
  cargaHoraria?: number;
  instrutor?: string;
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
        // Abrir primeiro modulo por padrao
        if (c.modulos?.length > 0) {
          setOpenModules(new Set([c.modulos[0].id]));
        }
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

  function getModuloProgresso(mod: Modulo) {
    const total = mod.aulas.length;
    const conc = mod.aulas.filter(a => isAulaConcluida(a.id)).length;
    return total > 0 ? Math.round((conc / total) * 100) : 0;
  }

  // Proxima aula (primeira nao concluida)
  const proximaAula = allAulas.find(a => !isAulaConcluida(a.id));
  const aulasConcluidasRecentes = memberProgressos
    .filter(p => p.concluido)
    .sort((a, b) => new Date(b.dataHora || 0).getTime() - new Date(a.dataHora || 0).getTime())
    .slice(0, 3);

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!curso || !member) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Dados nao encontrados</div>;

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: "#F8F9FC", minHeight: "100vh" }}>
      {/* Top actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link href="/ensino/discipulados" style={{ display: "flex", alignItems: "center", gap: 6, color: "#2563EB", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={18} strokeWidth={1.5} /> Voltar para Discipulados
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
            <ShareIcon size={14} /> Compartilhar
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
            <Award size={14} strokeWidth={1.5} /> Certificado
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: NAVY, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <MoreIcon size={14} /> Mais opcoes
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 20, background: NAVY, minHeight: 220, display: "flex", alignItems: "center" }}>
        {/* Background image overlay */}
        <div style={{ position: "absolute", inset: 0, background: curso.banner ? `url(${curso.banner}) center/cover` : "linear-gradient(135deg, #0F1A2E 0%, #1B2B4B 100%)", opacity: 0.9 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(15,26,46,0.95) 0%, rgba(15,26,46,0.6) 60%, rgba(15,26,46,0.3) 100%)" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "28px 32px", flex: 1 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: member.photo ? `url(${member.photo}) center/cover` : "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.8rem", fontWeight: 700, border: "3px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
            {!member.photo && member.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ display: "inline-block", padding: "3px 10px", background: "#2563EB", color: "white", borderRadius: 20, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>
              {percentual === 100 ? "Concluido" : "Em andamento"}
            </span>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "white", margin: "0 0 6px" }}>{curso.titulo}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CalendarIcon size={14} /> Inicio: {dataInicio}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><UsersIcon size={14} /> Mentor: {curso.instrutor || "—"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, maxWidth: 320, height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${percentual}%` }} transition={{ duration: 1, ease: "easeOut" }}
                  style={{ height: "100%", background: "#3B82F6", borderRadius: 999 }} />
              </div>
              <span style={{ color: "#3B82F6", fontSize: 14, fontWeight: 700 }}>{percentual}% concluido</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{concluidas} de {totalAulas} aulas concluidas</span>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)" }}>
          <button onClick={() => router.push(`/ensino/${cursoId}/aula/${proximaAula?.id || allAulas[0]?.id}`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 24px", background: "#2563EB", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            <PlayCircle size={18} /> Continuar
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { icon: <BookOpen size={20} strokeWidth={1.5} />, label: "Modulos", value: curso.modulos.length, sub: "modulos", bg: "#EFF6FF", color: "#3B82F6" },
          { icon: <Play size={20} strokeWidth={1.5} />, label: "Aulas", value: totalAulas, sub: "aulas", bg: "#ECFDF5", color: "#10B981" },
          { icon: <Clock size={20} strokeWidth={1.5} />, label: "Carga horaria", value: curso.cargaHoraria || "—", sub: "horas", bg: "#F5F3FF", color: "#8B5CF6" },
          { icon: <Trophy size={20} strokeWidth={1.5} />, label: "Conclusao", value: `${percentual}%`, sub: "concluido", bg: "#FFFBEB", color: "#F59E0B" },
          { icon: <Flame size={20} strokeWidth={1.5} />, label: "Sequencia", value: "7", sub: "dias", bg: "#FEF2F2", color: "#EF4444" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            style={{ background: "white", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ color: "#6B7280", fontSize: 11, fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
              <div style={{ color: "#111827", fontSize: "1.3rem", fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* LEFT — Modulos e aulas */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Modulos e aulas</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {curso.modulos.map((mod, mi) => {
              const modPct = getModuloProgresso(mod);
              const isOpen = openModules.has(mod.id);
              return (
                <motion.div key={mod.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + mi * 0.05 }}
                  style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <button onClick={() => toggleModule(mod.id)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    {isOpen ? <ChevronDown size={18} color="#2563EB" /> : <ChevronRight size={18} color="#9CA3AF" />}
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", flex: 1 }}>
                      Modulo {mi + 1}: {mod.titulo}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: modPct === 100 ? "#10B981" : modPct >= 50 ? "#F59E0B" : "#9CA3AF" }}>
                      {modPct}% concluido
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: "1px solid #F3F4F6" }}>
                      {mod.aulas.map((aula) => {
                        const concluida = isAulaConcluida(aula.id);
                        return (
                          <div key={aula.id}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px 10px 46px", borderBottom: "1px solid #F9FAFB" }}
                          >
                            {concluida ? (
                              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <CheckCircle size={14} color="white" />
                              </div>
                            ) : (
                              <Circle size={20} color="#D1D5DB" strokeWidth={1.5} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: concluida ? "#10B981" : "#374151" }}>{aula.titulo}</div>
                            </div>
                            <span style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
                              {aula.duracao || "10 min"}
                            </span>
                            <button onClick={() => router.push(`/ensino/${cursoId}/aula/${aula.id}`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                              <Play size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Proxima aula */}
          {proximaAula && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: "white", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Proxima aula</h3>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 80, height: 56, borderRadius: 10, background: "linear-gradient(135deg, #1B2B4B, #3B82F6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BookOpen size={24} color="rgba(255,255,255,0.6)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{proximaAula.titulo}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#6B7280", marginBottom: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={12} /> {proximaAula.duracao || "15 min"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Play size={12} /> Video aula</span>
                  </div>
                  <button onClick={() => router.push(`/ensino/${cursoId}/aula/${proximaAula.id}`)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#2563EB", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                    <Play size={12} /> Assistir aula
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Atividade recente */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ background: "white", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Atividade recente</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {aulasConcluidasRecentes.length === 0 ? (
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>Nenhuma atividade recente</div>
              ) : aulasConcluidasRecentes.map((p, i) => {
                const aula = allAulas.find(a => a.id === p.aulaId);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CheckCircle size={14} color="#10B981" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{aula?.titulo || "Aula concluida"}</div>
                      <div style={{ fontSize: 10, color: "#10B981" }}>Concluida</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {p.dataHora ? new Date(p.dataHora).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
            <button style={{ width: "100%", marginTop: 12, padding: "8px", background: "#F9FAFB", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>
              Ver todas as atividades
            </button>
          </motion.div>

          {/* Conquistas */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: "white", borderRadius: 14, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Conquistas</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {[
                { icon: <BookOpen size={20} />, label: "Estudioso", color: "#3B82F6", bg: "#EFF6FF" },
                { icon: <CheckCircle size={20} />, label: "Dedicado", color: "#10B981", bg: "#ECFDF5" },
                { icon: <Trophy size={20} />, label: "Persistente", color: "#8B5CF6", bg: "#F5F3FF" },
                { icon: <Award size={20} />, label: "Fiel", color: "#F59E0B", bg: "#FFFBEB" },
              ].map((c, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, margin: "0 auto 6px" }}>{c.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#374151" }}>{c.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ShareIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
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

function CalendarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function UsersIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
