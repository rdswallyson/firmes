"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, TrendingUp, Award, Search, ChevronLeft, ChevronRight,
  MoreVertical, FileBarChart, Download, Plus,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1B2B4B";

interface Discipulado {
  id: string;
  nome: string;
  cursoTitulo: string;
  cursoId: string;
  memberId: string;
  percentual: number;
  responsavel?: string;
  dataInicio: string;
  ultimaAtividade?: string;
  photo?: string;
  status: "Em andamento" | "Concluido";
}

function avatarColor(name: string) {
  const hue = name.charCodeAt(0) * 7 % 360;
  return { bg: `hsl(${hue}, 55%, 88%)`, color: `hsl(${hue}, 45%, 32%)` };
}

export default function DiscipuladosPage() {
  const [discipulados, setDiscipulados] = useState<Discipulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetch("/api/ensino").then(r => r.json()).then(data => {
      const cursos = data.cursos || [];
      const discipuladosList: Discipulado[] = [];
      cursos.forEach((curso: any) => {
        if (curso.progressos && curso.progressos.length > 0) {
          const totalAulas = curso.modulos?.reduce((a: number, m: any) => a + (m.aulas?.length || 0), 0) || 0;
          if (totalAulas > 0) {
            const progressosPorMembro: Record<string, any[]> = {};
            curso.progressos.forEach((p: any) => {
              const mid = p.memberId || "unknown";
              if (!progressosPorMembro[mid]) progressosPorMembro[mid] = [];
              progressosPorMembro[mid].push(p);
            });
            Object.entries(progressosPorMembro).forEach(([memberId, progressos]) => {
              const concluidas = progressos.filter((pr: any) => pr.concluido).length;
              const percentual = Math.round((concluidas / totalAulas) * 100);
              const primeiroProgresso = progressos[0];
              const ultimoProgresso = progressos[progressos.length - 1];
              discipuladosList.push({
                id: `${curso.id}-${memberId}`,
                nome: primeiroProgresso?.member?.name || `Membro ${memberId.slice(0, 6)}`,
                cursoTitulo: curso.titulo,
                cursoId: curso.id,
                memberId,
                percentual,
                responsavel: curso.instrutor || undefined,
                dataInicio: new Date(primeiroProgresso?.dataHora || Date.now()).toLocaleDateString("pt-BR"),
                ultimaAtividade: ultimoProgresso?.dataHora
                  ? new Date(ultimoProgresso.dataHora).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
                  : undefined,
                photo: primeiroProgresso?.member?.photo,
                status: percentual === 100 ? "Concluido" : "Em andamento",
              });
            });
          }
        }
      });
      const unique = discipuladosList.filter((d, i, arr) => arr.findIndex(x => x.id === d.id) === i);
      setDiscipulados(unique);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = discipulados.filter(d =>
    d.nome.toLowerCase().includes(search.toLowerCase()) ||
    d.cursoTitulo.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const emDiscipulado = discipulados.length;
  const progressoMedio = Math.round(discipulados.reduce((a, d) => a + d.percentual, 0) / (discipulados.length || 1));
  const cursosAtivos = [...new Set(discipulados.map(d => d.cursoId))].length;
  const concluidosMes = discipulados.filter(d => d.status === "Concluido").length;

  const stats = [
    { icon: <Users size={22} strokeWidth={1.5} />, label: "Em discipulado", value: emDiscipulado, sub: "membros", bg: "#EFF6FF", color: "#3B82F6" },
    { icon: <TrendingUp size={22} strokeWidth={1.5} />, label: "Progresso medio", value: `${progressoMedio}%`, sub: "de conclusao", bg: "#ECFDF5", color: "#10B981" },
    { icon: <BookOpen size={22} strokeWidth={1.5} />, label: "Cursos ativos", value: cursosAtivos, sub: "cursos", bg: "#FFFBEB", color: "#F59E0B" },
    { icon: <Award size={22} strokeWidth={1.5} />, label: "Concluidos este mes", value: concluidosMes, sub: "discipulo", bg: "#F5F3FF", color: "#8B5CF6" },
  ];

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: "#F8F9FC", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: NAVY, margin: "0 0 4px" }}>Discipulados Ativos</h1>
          <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>Acompanhe o progresso dos membros em cursos e jornadas de crescimento.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: NAVY, color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <Plus size={16} strokeWidth={1.5} /> Novo Discipulado
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
            <FileBarChart size={16} strokeWidth={1.5} /> Relatorios
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
            <Download size={16} strokeWidth={1.5} /> Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
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

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
          <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome ou curso..."
            style={{ width: "100%", padding: "11px 14px 11px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "white" }} />
        </div>
        <select style={{ padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13, background: "white", color: "#374151" }}>
          <option>Todos os cursos</option>
        </select>
        <select style={{ padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13, background: "white", color: "#374151" }}>
          <option>Todos os mentores</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              {["MEMBRO", "CURSO", "PROGRESSO", "MENTOR", "INICIO", "ULTIMA ATIVIDADE", "STATUS", ""].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #F3F4F6" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Nenhum discipulado ativo encontrado</td></tr>
            ) : paginated.map((d, i) => {
              const av = avatarColor(d.nome);
              return (
                <tr key={d.id}
                  style={{ borderBottom: "1px solid #F9FAFB", transition: "background 0.1s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: d.photo ? `url(${d.photo}) center/cover` : av.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: d.photo ? "transparent" : av.color, flexShrink: 0 }}>
                        {!d.photo && d.nome.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{d.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Link href={`/ensino/discipulados/${d.cursoId}/${d.memberId}`} style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                      {d.cursoTitulo} <ChevronRight size={14} />
                    </Link>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", minWidth: 36 }}>{d.percentual}%</span>
                      <div style={{ width: 80, height: 6, background: "#F3F4F6", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${d.percentual}%`, background: d.percentual === 100 ? "#10B981" : "#3B82F6", borderRadius: 999 }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6B7280" }}>
                        {d.responsavel?.charAt(0) || "M"}
                      </div>
                      <span style={{ color: "#374151", fontSize: 13 }}>{d.responsavel || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#6B7280", fontSize: 13 }}>{d.dataInicio}</td>
                  <td style={{ padding: "14px 16px", color: "#6B7280", fontSize: 13 }}>{d.ultimaAtividade || d.dataInicio}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: d.status === "Concluido" ? "#DCFCE7" : "#DBEAFE", color: d.status === "Concluido" ? "#16A34A" : "#2563EB" }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>Mostrando {(page - 1) * perPage + 1} a {Math.min(page * perPage, filtered.length)} de {filtered.length} resultados</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: page <= 1 ? "default" : "pointer", color: page <= 1 ? "#D1D5DB" : "#374151" }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "#2563EB", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>{page}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: page >= totalPages ? "default" : "pointer", color: page >= totalPages ? "#D1D5DB" : "#374151" }}>
                <ChevronRight size={16} />
              </button>
              <select style={{ padding: "6px 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, background: "white", color: "#374151" }}>
                <option>10 por pagina</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
