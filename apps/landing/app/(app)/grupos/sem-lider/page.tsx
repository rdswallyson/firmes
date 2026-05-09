"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, User, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Grupo {
  id: string;
  name: string;
  description: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  _count: { members: number };
}

interface Member {
  id: string;
  name: string;
}

export default function GruposSemLiderPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/grupos?search=").then((r) => r.json()),
      fetch("/api/members?limit=1000").then((r) => r.json()),
    ]).then(([gruposData, membersData]) => {
      setGrupos((gruposData.grupos || []).filter((g: Grupo & { leader: null | object }) => !g.leader));
      setMembers(membersData.members || []);
    }).finally(() => setLoading(false));
  }, []);

  async function assignLeader(grupoId: string) {
    const leaderId = selectedLeader[grupoId];
    if (!leaderId) return;
    setSaving(grupoId);
    try {
      const res = await fetch(`/api/grupos/${grupoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderId }),
      });
      if (res.ok) {
        setGrupos((prev) => prev.filter((g) => g.id !== grupoId));
        setAssigning(null);
      }
    } finally {
      setSaving(null);
    }
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/grupos" style={{ color: "#6B7280", display: "flex" }}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Grupos sem Líder</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.2rem 0 0" }}>Grupos que precisam de um líder responsável</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>Carregando...</div>
      ) : grupos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: "12px", border: "1px dashed #E5E7EB" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
          <p style={{ color: "#16A34A", fontWeight: 600, margin: 0 }}>Todos os grupos têm líder definido!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {grupos.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #FDE68A" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <AlertTriangle size={16} strokeWidth={1.5} color="#D97706" />
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>{g.name}</h3>
                  </div>
                  {g.description && <p style={{ color: "#6B7280", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>{g.description}</p>}
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#6B7280" }}>
                    <span><Users size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.3rem" }} />{g._count.members} membros</span>
                    {g.meetingDay && <span>{g.meetingDay} {g.meetingTime && `às ${g.meetingTime}`}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/grupos/${g.id}`}>
                    <button style={{ padding: "0.4rem 0.75rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", color: "#374151" }}>
                      Ver grupo
                    </button>
                  </Link>
                  <button
                    onClick={() => setAssigning(assigning === g.id ? null : g.id)}
                    style={{ padding: "0.4rem 0.875rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <User size={14} strokeWidth={1.5} /> Atribuir Líder
                  </button>
                </div>
              </div>

              {assigning === g.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #E5E7EB", display: "flex", gap: "0.5rem" }}
                >
                  <select
                    value={selectedLeader[g.id] ?? ""}
                    onChange={(e) => setSelectedLeader({ ...selectedLeader, [g.id]: e.target.value })}
                    style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none" }}
                  >
                    <option value="">Selecione o líder...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignLeader(g.id)}
                    disabled={!selectedLeader[g.id] || saving === g.id}
                    style={{
                      padding: "0.5rem 1rem",
                      background: selectedLeader[g.id] ? "#16A34A" : "#9CA3AF",
                      color: "white", border: "none", borderRadius: "8px",
                      cursor: selectedLeader[g.id] ? "pointer" : "not-allowed",
                      fontSize: "0.875rem", fontWeight: 600,
                    }}
                  >
                    {saving === g.id ? "Salvando..." : "Confirmar"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
