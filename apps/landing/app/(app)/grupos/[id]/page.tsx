"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, User, Clock, MapPin, Plus, Trash2, Save,
  CheckSquare, BarChart2, Download, AlertTriangle, Calendar,
  X, Search,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface Member {
  id: string;
  name: string;
  photo: string | null;
  phone: string | null;
}

interface GroupMemberItem {
  id: string;
  member: Member;
}

interface Frequencia {
  id: string;
  date: string;
  presentes: number;
  ausentes: number;
  visitantes: number;
  observacao: string | null;
}

interface Grupo {
  id: string;
  name: string;
  description: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  address: string | null;
  leader: Member | null;
  members: GroupMemberItem[];
  frequencias: Frequencia[];
  _count: { members: number };
}

interface RelatorioData {
  stats: { totalReunioes: number; mediaPresenca: number; mediaVisitantes: number; totalMembros: number };
  grafico: { mes: string; presentes: number; ausentes: number; visitantes: number; reunioes: number }[];
  membrosAtencao: { id: string; name: string; photo: string | null; presencaPercent: number }[];
  frequencias: Frequencia[];
}

type Tab = "visao-geral" | "membros" | "frequencia" | "relatorio";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "visao-geral", label: "Visão Geral", icon: <User size={16} strokeWidth={1.5} /> },
  { id: "membros", label: "Membros", icon: <Users size={16} strokeWidth={1.5} /> },
  { id: "frequencia", label: "Frequência", icon: <CheckSquare size={16} strokeWidth={1.5} /> },
  { id: "relatorio", label: "Relatório", icon: <BarChart2 size={16} strokeWidth={1.5} /> },
];

export default function GrupoDetalhePage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("visao-geral");
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGrupo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/grupos/${id}`);
      if (res.ok) setGrupo((await res.json()).grupo);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGrupo(); }, [fetchGrupo]);

  if (loading) return <div style={{ padding: "2rem", color: "#6B7280" }}>Carregando...</div>;
  if (!grupo) return <div style={{ padding: "2rem", color: "#6B7280" }}>Grupo não encontrado</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/grupos" style={{ color: "#6B7280", display: "flex" }}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>{grupo.name}</h1>
          {grupo.description && (
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.2rem 0 0" }}>{grupo.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: "2px solid #E5E7EB", marginBottom: "1.5rem" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.625rem 1rem",
              background: "none", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #1A3C6E" : "2px solid transparent",
              marginBottom: "-2px",
              color: activeTab === tab.id ? "#1A3C6E" : "#6B7280",
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: "0.875rem", cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "visao-geral" && <TabVisaoGeral grupo={grupo} />}
          {activeTab === "membros" && <TabMembros grupo={grupo} onRefresh={fetchGrupo} />}
          {activeTab === "frequencia" && <TabFrequencia grupo={grupo} grupoId={id} onRefresh={fetchGrupo} />}
          {activeTab === "relatorio" && <TabRelatorio grupoId={id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Visão Geral ─── */
function TabVisaoGeral({ grupo }: { grupo: Grupo }) {
  const statCard = (label: string, value: string | number, color = "#1A3C6E") => (
    <div style={{ background: "white", borderRadius: "10px", padding: "1rem", border: "1px solid #E5E7EB", textAlign: "center" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.2rem" }}>{label}</div>
    </div>
  );

  const ultimaFreq = grupo.frequencias[0];
  const totalReunioes = grupo.frequencias.length;
  const mediaPresenca = totalReunioes > 0
    ? Math.round(grupo.frequencias.reduce((s, f) => s + f.presentes, 0) / totalReunioes)
    : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem" }}>Informações</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {grupo.leader && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                <User size={16} strokeWidth={1.5} color="#6B7280" />
                Líder: <strong>{grupo.leader.name}</strong>
              </div>
            )}
            {!grupo.leader && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#DC2626" }}>
                <AlertTriangle size={16} strokeWidth={1.5} />
                Sem líder definido
              </div>
            )}
            {(grupo.meetingDay || grupo.meetingTime) && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                <Clock size={16} strokeWidth={1.5} color="#6B7280" />
                {grupo.meetingDay} {grupo.meetingTime && `às ${grupo.meetingTime}`}
              </div>
            )}
            {grupo.address && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                <MapPin size={16} strokeWidth={1.5} color="#6B7280" />
                {grupo.address}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {statCard("Membros", grupo._count.members)}
          {statCard("Reuniões", totalReunioes, "#7C3AED")}
          {statCard("Média presentes", mediaPresenca, "#16A34A")}
          {statCard("Visitantes (último)", ultimaFreq?.visitantes ?? 0, "#C8922A")}
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem" }}>Últimas Frequências</h3>
        {grupo.frequencias.length === 0 ? (
          <p style={{ color: "#9CA3AF", fontSize: "0.875rem", textAlign: "center", padding: "2rem 0" }}>
            Nenhuma frequência registrada
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {grupo.frequencias.slice(0, 8).map((f) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.625rem", background: "#F9FAFB", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calendar size={14} strokeWidth={1.5} color="#6B7280" />
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>
                    {new Date(f.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem" }}>
                  <span style={{ color: "#16A34A" }}>✓ {f.presentes}</span>
                  <span style={{ color: "#DC2626" }}>✗ {f.ausentes}</span>
                  <span style={{ color: "#6B7280" }}>👥 {f.visitantes}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Membros ─── */
function TabMembros({ grupo, onRefresh }: { grupo: Grupo; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [searchMember, setSearchMember] = useState("");
  const [funcoes, setFuncoes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/members?limit=1000")
      .then((r) => r.json())
      .then((d) => setAllMembers(d.members || []));
  }, []);

  const available = allMembers.filter(
    (m) => !grupo.members.some((gm) => gm.member.id === m.id) &&
      m.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  async function addMember(memberId: string) {
    await fetch(`/api/grupos/${grupo.id}/membros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    onRefresh();
    setShowModal(false);
    setSearchMember("");
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remover membro do grupo?")) return;
    await fetch(`/api/grupos/${grupo.id}/membros?memberId=${memberId}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>
          {grupo._count.members} membros no grupo
        </h3>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.5rem 1rem", background: "#1A3C6E", color: "white",
            border: "none", borderRadius: "8px", cursor: "pointer",
            fontWeight: 600, fontSize: "0.8rem",
          }}
        >
          <Plus size={16} strokeWidth={1.5} /> Adicionar Membro
        </motion.button>
      </div>

      {grupo.members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "12px", border: "1px dashed #E5E7EB" }}>
          <Users size={40} strokeWidth={1.5} color="#D1D5DB" />
          <p style={{ color: "#9CA3AF", margin: "0.75rem 0 0" }}>Nenhum membro adicionado</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
          {grupo.members.map((gm) => (
            <div key={gm.id} style={{ background: "white", borderRadius: "10px", padding: "1rem", border: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: gm.member.photo ? `url(${gm.member.photo}) center/cover` : "#E5E7EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", color: "#6B7280", flexShrink: 0,
                }}>
                  {!gm.member.photo && gm.member.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0D2545" }}>{gm.member.name}</div>
                  {gm.member.phone && (
                    <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{gm.member.phone}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeMember(gm.member.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: "0.25rem" }}
              >
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Membro */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000, padding: "1rem",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.5rem", width: "100%", maxWidth: "480px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Adicionar Membro</h3>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  type="text"
                  placeholder="Buscar membro..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                    border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none",
                  }}
                />
              </div>

              <div style={{ overflowY: "auto", flex: 1 }}>
                {available.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#9CA3AF", padding: "2rem 0", fontSize: "0.875rem" }}>
                    {searchMember ? "Nenhum membro encontrado" : "Todos os membros já estão no grupo"}
                  </p>
                ) : (
                  available.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => addMember(m.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.75rem", borderRadius: "8px", cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: m.photo ? `url(${m.photo}) center/cover` : "#E5E7EB",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.9rem", color: "#6B7280", flexShrink: 0,
                      }}>
                        {!m.photo && m.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#0D2545" }}>{m.name}</div>
                        {m.phone && <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{m.phone}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Frequência ─── */
function TabFrequencia({ grupo, grupoId, onRefresh }: { grupo: Grupo; grupoId: string; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    presentes: 0,
    ausentes: 0,
    visitantes: 0,
    observacao: "",
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/grupos/${grupoId}/frequencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onRefresh();
        setShowModal(false);
        setForm({ date: new Date().toISOString().split("T")[0], presentes: 0, ausentes: 0, visitantes: 0, observacao: "" });
      }
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const rows = [
      ["Data", "Presentes", "Ausentes", "Visitantes", "Observação"],
      ...grupo.frequencias.map((f) => [
        new Date(f.date).toLocaleDateString("pt-BR"),
        f.presentes, f.ausentes, f.visitantes, f.observacao ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `frequencia-${grupo.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>
          {grupo.frequencias.length} registros
        </h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={exportCSV}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 0.875rem", background: "white", color: "#374151",
              border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer",
              fontWeight: 500, fontSize: "0.8rem",
            }}
          >
            <Download size={15} strokeWidth={1.5} /> Exportar CSV
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.5rem 0.875rem", background: "#1A3C6E", color: "white",
              border: "none", borderRadius: "8px", cursor: "pointer",
              fontWeight: 600, fontSize: "0.8rem",
            }}
          >
            <Plus size={16} strokeWidth={1.5} /> Registrar Frequência
          </motion.button>
        </div>
      </div>

      {grupo.frequencias.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "12px", border: "1px dashed #E5E7EB" }}>
          <CheckSquare size={40} strokeWidth={1.5} color="#D1D5DB" />
          <p style={{ color: "#9CA3AF", margin: "0.75rem 0 0" }}>Nenhuma frequência registrada</p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Data", "Presentes", "Ausentes", "Visitantes", "% Presença", "Observação"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grupo.frequencias.map((f) => {
                const total = f.presentes + f.ausentes;
                const pct = total > 0 ? Math.round((f.presentes / total) * 100) : 0;
                return (
                  <tr key={f.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>
                      {new Date(f.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#16A34A", fontWeight: 600 }}>{f.presentes}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#DC2626" }}>{f.ausentes}</td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#6B7280" }}>{f.visitantes}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ flex: 1, height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? "#16A34A" : pct >= 50 ? "#C8922A" : "#DC2626", borderRadius: "3px" }} />
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", minWidth: "36px" }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6B7280" }}>{f.observacao ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Registrar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.5rem", width: "100%", maxWidth: "440px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Registrar Frequência</h3>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#374151", marginBottom: "0.3rem" }}>Data da Reunião</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { key: "presentes", label: "Presentes", color: "#16A34A" },
                    { key: "ausentes", label: "Ausentes", color: "#DC2626" },
                    { key: "visitantes", label: "Visitantes", color: "#6B7280" },
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: "0.75rem", color, fontWeight: 600, marginBottom: "0.25rem" }}>{label}</label>
                      <input
                        type="number"
                        min={0}
                        value={form[key as keyof typeof form] as number}
                        onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
                        style={{ width: "100%", padding: "0.5rem", border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "0.875rem", textAlign: "center", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#374151", marginBottom: "0.3rem" }}>Observação (opcional)</label>
                  <textarea
                    value={form.observacao}
                    onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                    rows={2}
                    style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", resize: "vertical", outline: "none" }}
                    placeholder="Observações sobre a reunião..."
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    width: "100%", padding: "0.75rem",
                    background: saving ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
                    color: "white", border: "none", borderRadius: "8px",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 600, fontSize: "0.875rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  }}
                >
                  <Save size={16} strokeWidth={1.5} />
                  {saving ? "Salvando..." : "Salvar Frequência"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Relatório ─── */
function TabRelatorio({ grupoId }: { grupoId: string }) {
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/grupos/${grupoId}/relatorio`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [grupoId]);

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "#6B7280" }}>Carregando relatório...</div>;
  if (!data) return <div style={{ padding: "2rem", color: "#6B7280" }}>Erro ao carregar relatório</div>;

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Mês", "Reuniões", "Presentes", "Ausentes", "Visitantes"],
      ...data.grafico.map((g) => [g.mes, g.reunioes, g.presentes, g.ausentes, g.visitantes]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "relatorio-grupo.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const { stats, grafico, membrosAtencao } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {[
          { label: "Reuniões (3 meses)", value: stats.totalReunioes, color: "#1A3C6E" },
          { label: "Média de Presença %", value: `${stats.mediaPresenca}%`, color: stats.mediaPresenca >= 70 ? "#16A34A" : stats.mediaPresenca >= 50 ? "#C8922A" : "#DC2626" },
          { label: "Média Visitantes", value: stats.mediaVisitantes, color: "#7C3AED" },
          { label: "Total Membros", value: stats.totalMembros, color: "#0D2545" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: "10px", padding: "1rem", border: "1px solid #E5E7EB", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.2rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>Frequência por Mês</h3>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={exportCSV}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.4rem 0.75rem", background: "white", color: "#374151",
              border: "1px solid #E5E7EB", borderRadius: "6px", cursor: "pointer",
              fontSize: "0.75rem",
            }}
          >
            <Download size={14} strokeWidth={1.5} /> Exportar CSV
          </motion.button>
        </div>
        {grafico.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9CA3AF", padding: "2rem 0", fontSize: "0.875rem" }}>Nenhum dado disponível nos últimos 3 meses</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="presentes" name="Presentes" fill="#1A3C6E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ausentes" name="Ausentes" fill="#DC2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="visitantes" name="Visitantes" fill="#C8922A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Membros com atenção */}
      {membrosAtencao.length > 0 && (
        <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #FEE2E2" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#DC2626", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={18} strokeWidth={1.5} />
            Membros com baixa presença (&lt;50%)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {membrosAtencao.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem", background: "#FEF2F2", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: m.photo ? `url(${m.photo}) center/cover` : "#E5E7EB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem", color: "#6B7280",
                  }}>
                    {!m.photo && m.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "#374151" }}>{m.name}</span>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#DC2626", background: "#FEE2E2", padding: "0.2rem 0.5rem", borderRadius: "12px" }}>
                  {m.presencaPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
