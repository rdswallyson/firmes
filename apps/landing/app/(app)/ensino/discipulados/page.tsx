"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Discipulado {
  id: string;
  nome: string;
  cursoTitulo: string;
  cursoId: string;
  percentual: number;
  responsavel?: string;
  dataInicio: string;
}

export default function DiscipuladosPage() {
  const [discipulados, setDiscipulados] = useState<Discipulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch cursos and simulate discipulados based on progressos
    fetch("/api/ensino").then(r => r.json()).then(data => {
      const cursos = data.cursos || [];
      const discipuladosList: Discipulado[] = [];
      
      // For each curso with progressos, create discipulado entries
      cursos.forEach((curso: any) => {
        if (curso.progressos && curso.progressos.length > 0) {
          const totalAulas = curso.modulos?.reduce((a: number, m: any) => a + (m.aulas?.length || 0), 0) || 0;
          if (totalAulas > 0) {
            curso.progressos.forEach((p: any) => {
              const concluidas = curso.progressos.filter((pr: any) => pr.memberId === p.memberId && pr.concluido).length;
              const percentual = Math.round((concluidas / totalAulas) * 100);
              discipuladosList.push({
                id: `${curso.id}-${p.memberId}`,
                nome: p.memberId === "current-user" ? "Aluno" : `Membro ${p.memberId.slice(0, 6)}`,
                cursoTitulo: curso.titulo,
                cursoId: curso.id,
                percentual,
                responsavel: curso.instrutor || undefined,
                dataInicio: new Date(p.dataHora).toLocaleDateString("pt-BR"),
              });
            });
          }
        }
      });
      
      // Remove duplicates by memberId
      const unique = discipuladosList.filter((d, i, arr) => arr.findIndex(x => x.id === d.id) === i);
      setDiscipulados(unique);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = discipulados.filter(d => 
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.cursoTitulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Discipulados Ativos</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Acompanhe o progresso dos membros em cursos</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <Users size={18} />, label: "Em discipulado", value: discipulados.length, bg: "#EEF2FA", color: NAVY },
          { icon: <TrendingUp size={18} />, label: "Progresso medio", value: `${Math.round(discipulados.reduce((a, d) => a + d.percentual, 0) / (discipulados.length || 1))}%`, bg: "#DCFCE7", color: "#16A34A" },
          { icon: <BookOpen size={18} />, label: "Cursos ativos", value: [...new Set(discipulados.map(d => d.cursoId))].length, bg: "#FEF3C7", color: "#CA8A04" },
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou curso..."
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none" }} />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", background: "#fff", borderRadius: 12 }}>
          <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p>Nenhum discipulado ativo encontrado</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Nome", "Curso", "Progresso", "Responsavel", "Inicio"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  style={{ borderTop: "1px solid #F3F4F6", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ""; }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0D2545" }}>{d.nome}</div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Link href={`/ensino/${d.cursoId}`} style={{ color: NAVY, fontWeight: 600, textDecoration: "none" }}>
                      {d.cursoTitulo} <ChevronRight size={14} style={{ verticalAlign: "middle" }} />
                    </Link>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 120, height: 6, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${d.percentual}%`, background: d.percentual === 100 ? "#16A34A" : `linear-gradient(90deg, ${NAVY}, ${GOLD})`, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: d.percentual === 100 ? "#16A34A" : NAVY, minWidth: 35 }}>{d.percentual}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#6B7280", fontSize: 13 }}>{d.responsavel || "—"}</td>
                  <td style={{ padding: "14px 16px", color: "#9CA3AF", fontSize: 12 }}>{d.dataInicio}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
