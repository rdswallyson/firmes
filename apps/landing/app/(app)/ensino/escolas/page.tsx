"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Plus, Search, BookOpen, CheckCircle, Clock, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Escola {
  id: string;
  nome: string;
  descricao?: string;
  status: string;
  coordenador?: { id: string; name: string; photo?: string };
  alunos: any[];
  _count?: { alunos: number };
}

export default function EscolasPage() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/escolas").then(r => r.json()).then(data => {
      setEscolas(data.escolas || []);
      setLoading(false);
    });
  }, []);

  const filtered = escolas.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  async function deleteEscola(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta escola?")) return;
    try {
      const res = await fetch(`/api/escolas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEscolas(escolas.filter(e => e.id !== id));
      } else {
        alert("Erro ao excluir escola");
      }
    } catch { alert("Erro de conexao"); }
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Escolas e Turmas</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie as escolas e turmas da igreja</p>
        </div>
        <Link href="/ensino/escolas/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          <Plus size={16} /> Nova Escola
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <GraduationCap size={18} />, label: "Escolas", value: escolas.length, bg: "#EEF2FA", color: NAVY },
          { icon: <BookOpen size={18} />, label: "Ativas", value: escolas.filter(e => e.status === "ATIVA").length, bg: "#DCFCE7", color: "#16A34A" },
          { icon: <Users size={18} />, label: "Total alunos", value: escolas.reduce((a, e) => a + (e._count?.alunos || e.alunos?.length || 0), 0), bg: "#FEF3C7", color: "#CA8A04" },
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
              style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: escola.status === "ATIVA" ? `1.5px solid ${NAVY}20` : "1.5px solid #F3F4F6" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: escola.status === "ATIVA" ? `linear-gradient(135deg, ${NAVY}, ${GOLD})` : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraduationCap size={22} color={escola.status === "ATIVA" ? "#fff" : "#9CA3AF"} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0D2545" }}>{escola.nome}</h3>
                    <span style={{ fontSize: 11, color: escola.status === "ATIVA" ? "#16A34A" : "#9CA3AF", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      {escola.status === "ATIVA" ? <><CheckCircle size={12} /> Ativa</> : <><Clock size={12} /> Inativa</>}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Link href={`/ensino/escolas/${escola.id}`} style={{ padding: "6px 8px", background: "#EEF2FA", borderRadius: 6, color: NAVY }}><Edit size={14} /></Link>
                  <button onClick={() => deleteEscola(escola.id)} style={{ padding: "6px 8px", background: "#FEE2E2", borderRadius: 6, color: "#DC2626", border: "none", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{escola._count?.alunos || escola.alunos?.length || 0}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>Alunos</div>
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: GOLD }}>{escola.coordenador?.name?.split(" ")[0] || "—"}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>Coordenador</div>
                </div>
              </div>

              {escola.descricao && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#6B7280" }}>{escola.descricao}</div>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 48, color: "#9CA3AF" }}>Nenhuma escola encontrada.</div>
          )}
        </div>
      )}
    </div>
  );
}
