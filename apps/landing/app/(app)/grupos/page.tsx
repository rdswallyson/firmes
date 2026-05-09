"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Plus, Search, MoreVertical, MapPin, Clock, User,
  Trash2, Eye, AlertTriangle, Trophy, Crown,
} from "lucide-react";

interface Grupo {
  id: string;
  name: string;
  description: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  address: string | null;
  leader: { id: string; name: string; photo: string | null } | null;
  frequencias: { presentes: number; ausentes: number }[];
  _count: { members: number };
}

type ViewMode = "todos" | "sem-lider" | "ranking";

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchGrupos();
  }, [search]);

  async function fetchGrupos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/grupos?search=${encodeURIComponent(search)}&includeFrequencia=true`);
      if (res.ok) {
        const data = await res.json();
        setGrupos(data.grupos || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteGrupo(id: string) {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return;
    try {
      const res = await fetch(`/api/grupos/${id}`, { method: "DELETE" });
      if (res.ok) setGrupos(grupos.filter((g) => g.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  function getPresencaMedia(grupo: Grupo): number {
    const freqs = grupo.frequencias ?? [];
    if (freqs.length === 0) return 0;
    const totalPres = freqs.reduce((s, f) => s + f.presentes, 0);
    const totalTotal = freqs.reduce((s, f) => s + f.presentes + f.ausentes, 0);
    return totalTotal > 0 ? Math.round((totalPres / totalTotal) * 100) : 0;
  }

  const semLider = grupos.filter((g) => !g.leader);
  const ranking = [...grupos].sort((a, b) => getPresencaMedia(b) - getPresencaMedia(a));

  const displayed = view === "sem-lider" ? semLider : view === "ranking" ? ranking : grupos;

  const VIEWS: { id: ViewMode; label: string; count?: number }[] = [
    { id: "todos", label: "Todos", count: grupos.length },
    { id: "sem-lider", label: "Sem Líder", count: semLider.length },
    { id: "ranking", label: "Ranking", count: undefined },
  ];

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Grupos & Células</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Gerencie os grupos e células da igreja</p>
        </div>
        <Link href="/grupos/novo">
          <motion.button
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1rem",
              background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
              color: "white", border: "none", borderRadius: "8px",
              cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
            }}
          >
            <Plus size={18} strokeWidth={1.5} />
            Novo Grupo
          </motion.button>
        </Link>
      </div>

      {/* Alerta sem líder */}
      {semLider.length > 0 && view !== "sem-lider" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setView("sem-lider")}
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.875rem 1rem", marginBottom: "1rem",
            background: "#FEF3C7", borderRadius: "10px", border: "1px solid #FDE68A",
            cursor: "pointer",
          }}
        >
          <AlertTriangle size={18} strokeWidth={1.5} color="#D97706" />
          <span style={{ fontSize: "0.875rem", color: "#92400E", fontWeight: 500 }}>
            {semLider.length} grupo{semLider.length > 1 ? "s" : ""} sem líder definido. Clique para ver.
          </span>
        </motion.div>
      )}

      {/* Filtros + Busca */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "220px", maxWidth: "360px" }}>
          <Search size={18} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "0.625rem 0.75rem 0.625rem 2.5rem",
              border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.25rem", background: "#F3F4F6", borderRadius: "8px", padding: "0.25rem" }}>
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: "0.375rem 0.75rem",
                background: view === v.id ? "white" : "transparent",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: view === v.id ? 600 : 400,
                color: view === v.id ? "#0D2545" : "#6B7280",
                boxShadow: view === v.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                display: "flex", alignItems: "center", gap: "0.35rem",
              }}
            >
              {v.id === "ranking" && <Trophy size={13} strokeWidth={1.5} />}
              {v.id === "sem-lider" && <AlertTriangle size={13} strokeWidth={1.5} />}
              {v.label}
              {v.count !== undefined && (
                <span style={{
                  background: v.id === "sem-lider" && (v.count ?? 0) > 0 ? "#DC2626" : "#E5E7EB",
                  color: v.id === "sem-lider" && (v.count ?? 0) > 0 ? "white" : "#374151",
                  borderRadius: "10px", padding: "0 0.35rem", fontSize: "0.7rem", fontWeight: 700,
                }}>
                  {v.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking */}
      {view === "ranking" && (
        <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Trophy size={18} strokeWidth={1.5} color="#C8922A" />
            Ranking por Presença Média
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {ranking.map((grupo, idx) => {
              const pct = getPresencaMedia(grupo);
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={grupo.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: idx === 0 ? "#FFFBEB" : "#F9FAFB", borderRadius: "8px", border: idx === 0 ? "1px solid #FDE68A" : "1px solid transparent" }}>
                  <span style={{ fontSize: "1.25rem", minWidth: "28px", textAlign: "center" }}>
                    {idx < 3 ? medals[idx] : `${idx + 1}.`}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0D2545", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {grupo.name}
                      {idx === 0 && <span style={{ fontSize: "0.7rem", background: "#C8922A", color: "white", padding: "0.1rem 0.45rem", borderRadius: "10px", fontWeight: 700 }}>MELHOR PRESENÇA</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.4rem" }}>
                      <div style={{ flex: 1, height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: pct >= 70 ? "#16A34A" : pct >= 50 ? "#C8922A" : "#DC2626",
                          borderRadius: "3px", transition: "width 0.5s",
                        }} />
                      </div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", minWidth: "36px" }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", textAlign: "right" }}>
                    <div>{grupo._count.members} membros</div>
                    <div>{(grupo.frequencias ?? []).length} reuniões</div>
                  </div>
                  <Link href={`/grupos/${grupo.id}`}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
                      <Eye size={16} strokeWidth={1.5} />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>Carregando...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "12px", border: "1px dashed #E5E7EB" }}>
          <Users size={48} strokeWidth={1.5} color="#D1D5DB" style={{ marginBottom: "1rem" }} />
          <p style={{ color: "#6B7280", margin: 0 }}>
            {view === "sem-lider" ? "Todos os grupos têm líder definido ✓" : "Nenhum grupo encontrado"}
          </p>
          {view === "todos" && (
            <Link href="/grupos/novo" style={{ color: "#1A3C6E", fontSize: "0.875rem", marginTop: "0.5rem", display: "inline-block" }}>
              Criar primeiro grupo
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {displayed.map((grupo) => {
            const pct = getPresencaMedia(grupo);
            return (
              <motion.div
                key={grupo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "white", borderRadius: "12px", padding: "1.25rem",
                  border: !grupo.leader ? "1px solid #FDE68A" : "1px solid #E5E7EB",
                  position: "relative",
                }}
              >
                {!grupo.leader && (
                  <div style={{ position: "absolute", top: "0.75rem", right: "2.5rem", display: "flex", alignItems: "center", gap: "0.25rem", background: "#FEF3C7", color: "#D97706", padding: "0.15rem 0.5rem", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 600 }}>
                    <AlertTriangle size={11} strokeWidth={2} /> Sem líder
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1, paddingRight: "2rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>{grupo.name}</h3>
                    {grupo.description && (
                      <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: "0.25rem 0 0", lineHeight: 1.4 }}>{grupo.description}</p>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setMenuOpen(menuOpen === grupo.id ? null : grupo.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: "#6B7280" }}
                    >
                      <MoreVertical size={18} strokeWidth={1.5} />
                    </button>
                    {menuOpen === grupo.id && (
                      <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: "140px" }}>
                        <Link href={`/grupos/${grupo.id}`}>
                          <div style={{ padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                            <Eye size={14} /> Ver detalhes
                          </div>
                        </Link>
                        <div
                          onClick={() => deleteGrupo(grupo.id)}
                          style={{ padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#DC2626" }}
                        >
                          <Trash2 size={14} /> Excluir
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  {grupo.leader ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                      <User size={13} strokeWidth={1.5} /> Líder: {grupo.leader.name}
                    </div>
                  ) : null}
                  {(grupo.meetingDay || grupo.meetingTime) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                      <Clock size={13} strokeWidth={1.5} />
                      {grupo.meetingDay} {grupo.meetingTime && `às ${grupo.meetingTime}`}
                    </div>
                  )}
                  {grupo.address && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                      <MapPin size={13} strokeWidth={1.5} /> {grupo.address}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                    <Users size={13} strokeWidth={1.5} /> {grupo._count.members} membros
                  </div>
                </div>

                {/* Barra de presença */}
                {(grupo.frequencias ?? []).length > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "#6B7280" }}>Presença média</span>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: pct >= 70 ? "#16A34A" : pct >= 50 ? "#C8922A" : "#DC2626" }}>{pct}%</span>
                    </div>
                    <div style={{ height: "5px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? "#16A34A" : pct >= 50 ? "#C8922A" : "#DC2626", borderRadius: "3px" }} />
                    </div>
                  </div>
                )}

                <Link href={`/grupos/${grupo.id}`} style={{ display: "block", marginTop: "1rem" }}>
                  <button style={{
                    width: "100%", padding: "0.5rem",
                    background: "#F3F4F6", border: "none", borderRadius: "8px",
                    cursor: "pointer", fontSize: "0.8rem", color: "#374151", fontWeight: 500,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                  }}>
                    <Eye size={14} strokeWidth={1.5} /> Ver detalhes
                  </button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
