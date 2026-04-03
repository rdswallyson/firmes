"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Play, FileText, BookOpen, CheckCircle, Circle,
  ChevronLeft, ChevronRight, Download,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Aula { id: string; titulo: string; tipo: string; conteudo?: string; duracao?: string; ordem: number; }
interface Modulo { id: string; titulo: string; ordem: number; aulas: Aula[]; }
interface Curso { id: string; titulo: string; modulos: Modulo[]; progressos: { aulaId: string; concluido: boolean }[]; }

export default function AulaPage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = typeof params.id === "string" ? params.id : "";
  const aulaId = typeof params.aulaId === "string" ? params.aulaId : "";
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => { if (cursoId) fetchCurso(); }, [cursoId]);

  async function fetchCurso() {
    try {
      const res = await fetch(`/api/ensino/${cursoId}`);
      if (res.ok) setCurso(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  const allAulas = curso?.modulos.flatMap(m => m.aulas) ?? [];
  const currentIdx = allAulas.findIndex(a => a.id === aulaId);
  const aula = currentIdx >= 0 ? allAulas[currentIdx] : null;
  const prevAula = currentIdx > 0 ? allAulas[currentIdx - 1] : null;
  const nextAula = currentIdx < allAulas.length - 1 ? allAulas[currentIdx + 1] : null;
  const isConcluida = curso?.progressos?.some(p => p.aulaId === aulaId && p.concluido) ?? false;

  async function marcarConcluida() {
    setMarking(true);
    try {
      await fetch(`/api/ensino/${cursoId}/progresso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aulaId, memberId: "current-user" }),
      });
      await fetchCurso();
    } catch { /* ignore */ }
    finally { setMarking(false); }
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!aula || !curso) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Aula nao encontrada</div>;

  const totalAulas = allAulas.length;
  const concluidas = curso.progressos?.filter(p => p.concluido).length ?? 0;
  const percentual = totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;

  function getYouTubeId(url: string) {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 960, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Link href={`/ensino/${cursoId}`} style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>{curso.titulo}</div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0D2545", margin: 0 }}>{aula.titulo}</h1>
        </div>
        <span style={{ fontSize: 12, color: "#6B7280" }}>Aula {currentIdx + 1} de {totalAulas}</span>
      </div>

      {/* Progress mini bar */}
      <div style={{ height: 4, background: "#F3F4F6", borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${percentual}%`, background: `linear-gradient(90deg, ${NAVY}, ${GOLD})`, borderRadius: 999, transition: "width 0.5s" }} />
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>

        {aula.tipo === "VIDEO" && aula.conteudo && (
          <div>
            {getYouTubeId(aula.conteudo) ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(aula.conteudo)}`}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <video controls style={{ width: "100%", maxHeight: 500, background: "#000" }}>
                <source src={aula.conteudo} />
              </video>
            )}
          </div>
        )}

        {aula.tipo === "PDF" && aula.conteudo && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <FileText size={48} color={NAVY} style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#6B7280", marginBottom: 16 }}>Material em PDF</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <a href={aula.conteudo} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                <BookOpen size={16} /> Abrir PDF
              </a>
              <a href={aula.conteudo} download
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#F3F4F6", color: "#374151", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                <Download size={16} /> Baixar
              </a>
            </div>
          </div>
        )}

        {aula.tipo === "TEXTO" && (
          <div style={{ padding: 32 }}>
            <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{aula.conteudo || "Sem conteudo"}</div>
          </div>
        )}

        {!aula.conteudo && aula.tipo !== "TEXTO" && (
          <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
            <Play size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p>Conteudo ainda nao disponivel</p>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          {prevAula ? (
            <Link href={`/ensino/${cursoId}/aula/${prevAula.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#F3F4F6", color: "#374151", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <ChevronLeft size={16} /> {prevAula.titulo}
            </Link>
          ) : <div />}
        </div>

        <button onClick={marcarConcluida} disabled={marking || isConcluida}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", background: isConcluida ? "#DCFCE7" : NAVY, color: isConcluida ? "#16A34A" : "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: isConcluida ? "default" : "pointer", opacity: marking ? 0.7 : 1 }}>
          {isConcluida ? <><CheckCircle size={18} /> Concluida</> : <><Circle size={18} /> Marcar como Concluida</>}
        </button>

        <div>
          {nextAula ? (
            <Link href={`/ensino/${cursoId}/aula/${nextAula.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              {nextAula.titulo} <ChevronRight size={16} />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
