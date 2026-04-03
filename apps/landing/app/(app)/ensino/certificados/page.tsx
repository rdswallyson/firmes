"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Download, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Curso {
  id: string; titulo: string; instrutor?: string; cargaHoraria?: number; categoria: string;
  modulos: { aulas: { id: string }[] }[];
  progressos: { aulaId: string; concluido: boolean }[];
}

export default function CertificadosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ensino").then(r => r.json()).then(d => {
      setCursos(d.cursos ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const cursosCompletos = cursos.filter(c => {
    const totalAulas = c.modulos.reduce((a, m) => a + m.aulas.length, 0);
    if (totalAulas === 0) return false;
    const concluidas = c.progressos?.filter(p => p.concluido).length ?? 0;
    return concluidas >= totalAulas;
  });

  function gerarCertificadoPDF(curso: Curso) {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Certificado - ${curso.titulo}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Nunito', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #F0EBE1; }
        .cert { width: 800px; background: white; border: 3px solid ${NAVY}; border-radius: 16px; padding: 60px; text-align: center; position: relative; overflow: hidden; }
        .cert::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, ${NAVY}, ${GOLD}); }
        .cert::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: linear-gradient(90deg, ${GOLD}, ${NAVY}); }
        h1 { font-size: 36px; font-weight: 900; color: ${NAVY}; margin-bottom: 8px; }
        h2 { font-size: 16px; font-weight: 600; color: ${GOLD}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 40px; }
        .nome { font-size: 28px; font-weight: 800; color: ${NAVY}; margin: 20px 0; }
        .curso { font-size: 22px; font-weight: 700; color: ${GOLD}; margin: 12px 0; }
        .info { font-size: 14px; color: #6B7280; margin: 8px 0; }
        .data { margin-top: 40px; font-size: 13px; color: #9CA3AF; }
        @media print { body { background: white; } .cert { border: none; box-shadow: none; } }
      </style>
      </head>
      <body>
        <div class="cert">
          <h1>FIRMES</h1>
          <h2>Certificado de Conclusao</h2>
          <p class="info">Certificamos que</p>
          <p class="nome">Aluno</p>
          <p class="info">concluiu com exito o curso</p>
          <p class="curso">${curso.titulo}</p>
          ${curso.instrutor ? `<p class="info">Instrutor: ${curso.instrutor}</p>` : ''}
          ${curso.cargaHoraria ? `<p class="info">Carga horaria: ${curso.cargaHoraria} horas</p>` : ''}
          <p class="data">Emitido em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
        <script>setTimeout(() => window.print(), 500);</script>
      </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Certificados</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Certificados dos cursos que voce concluiu</p>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : cursosCompletos.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: "#fff", borderRadius: 14, padding: 48, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <Award size={48} color="#D1D5DB" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ color: "#6B7280", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Nenhum certificado disponivel</h3>
          <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 20 }}>Conclua 100% de um curso para receber seu certificado</p>
          <Link href="/ensino" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            <BookOpen size={16} /> Ver Cursos
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cursosCompletos.map((curso, i) => (
            <motion.div key={curso.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16, border: `1.5px solid ${GOLD}20` }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${GOLD}20, ${GOLD}40)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Award size={24} color={GOLD} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0D2545" }}>{curso.titulo}</h3>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7280" }}>
                  {curso.instrutor && <span>{curso.instrutor}</span>}
                  {curso.cargaHoraria && <span>{curso.cargaHoraria}h</span>}
                  <span style={{ color: "#16A34A", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}><CheckCircle size={12} /> Concluido</span>
                </div>
              </div>
              <button onClick={() => gerarCertificadoPDF(curso)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Download size={14} /> Certificado PDF
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
