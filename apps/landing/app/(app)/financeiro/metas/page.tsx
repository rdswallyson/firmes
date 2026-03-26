"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, X, Calendar } from "lucide-react";

interface Meta { id: string; titulo: string; descricao: string | null; valorMeta: number; valorAtual: number; dataFim: string | null; isAtiva: boolean; }

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", valorMeta: "", dataFim: "" });
  const [saving, setSaving] = useState(false);

  function fetchMetas() {
    fetch("/api/financeiro/metas").then(r => r.json()).then((d: { metas: Meta[] }) => setMetas(d.metas ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { fetchMetas(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/financeiro/metas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, valorMeta: Number(form.valorMeta) }) });
    setSaving(false);
    setShowModal(false);
    setForm({ titulo: "", descricao: "", valorMeta: "", dataFim: "" });
    fetchMetas();
  }

  function daysLeft(date: string | null) {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Metas Financeiras</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Campanhas e objetivos financeiros</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 600 }}>
          <Plus size={16} strokeWidth={1.5} /> Nova Meta
        </button>
      </div>

      {loading ? <div style={{ color: "#9CA3AF", padding: "2rem" }}>Carregando...</div> : metas.length === 0 ? (
        <div style={{ background: "white", borderRadius: "12px", padding: "3rem", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <Target size={40} strokeWidth={1.5} color="#D1D5DB" />
          <p style={{ color: "#9CA3AF", marginTop: "1rem" }}>Nenhuma meta criada. Crie sua primeira campanha!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {metas.map((m, i) => {
            const pct = m.valorMeta > 0 ? Math.min(100, (m.valorAtual / m.valorMeta) * 100) : 0;
            const days = daysLeft(m.dataFim);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0D2545" }}>{m.titulo}</h3>
                    {m.descricao && <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#6B7280" }}>{m.descricao}</p>}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {days !== null && (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: days <= 7 ? "#FEF3C7" : "#F3F4F6", color: days <= 7 ? "#D97706" : "#6B7280", fontSize: "0.72rem", fontWeight: 600, borderRadius: "10px", padding: "3px 8px" }}>
                        <Calendar size={12} strokeWidth={1.5} /> {days}d restantes
                      </span>
                    )}
                    <span style={{ background: m.isAtiva ? "#DCFCE7" : "#F3F4F6", color: m.isAtiva ? "#16A34A" : "#6B7280", fontSize: "0.68rem", fontWeight: 600, borderRadius: "10px", padding: "2px 7px" }}>
                      {m.isAtiva ? "Ativa" : "Encerrada"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                    R$ {m.valorAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R$ {m.valorMeta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: pct >= 100 ? "#16A34A" : "#1A3C6E" }}>{pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: "10px", background: "#F3F4F6", borderRadius: "10px", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ height: "100%", background: pct >= 100 ? "linear-gradient(135deg, #16A34A, #22C55E)" : "linear-gradient(135deg, #1A3C6E, #C8922A)", borderRadius: "10px" }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.75rem", maxWidth: "450px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0D2545" }}>Nova Meta</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Título *</label><input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="Ex: Reforma do Templo" /></div>
                  <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Descrição</label><textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Detalhes da campanha" /></div>
                  <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Valor da Meta (R$) *</label><input type="number" step="0.01" required value={form.valorMeta} onChange={e => setForm({ ...form, valorMeta: e.target.value })} style={inputStyle} placeholder="50000" /></div>
                  <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Data limite</label><input type="date" value={form.dataFim} onChange={e => setForm({ ...form, dataFim: e.target.value })} style={inputStyle} /></div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "0.6rem 1.25rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ padding: "0.6rem 1.25rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>{saving ? "Salvando..." : "Criar"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
