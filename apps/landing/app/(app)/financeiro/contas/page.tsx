"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Plus, X } from "lucide-react";

interface Conta { id: string; nome: string; banco: string | null; agencia: string | null; numeroConta: string | null; saldo: number; isAtiva: boolean; }

export default function ContasPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: "", banco: "", agencia: "", numeroConta: "", saldo: "0" });
  const [saving, setSaving] = useState(false);

  function fetchContas() {
    fetch("/api/financeiro/contas").then(r => r.json()).then((d: { contas: Conta[] }) => setContas(d.contas ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { fetchContas(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/financeiro/contas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, saldo: Number(form.saldo) }) });
    setSaving(false);
    setShowModal(false);
    setForm({ nome: "", banco: "", agencia: "", numeroConta: "", saldo: "0" });
    fetchContas();
  }

  const totalSaldo = contas.reduce((s, c) => s + c.saldo, 0);
  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Contas Bancárias</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Gerencie as contas da igreja</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 600 }}>
          <Plus size={16} strokeWidth={1.5} /> Nova Conta
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "white", borderRadius: "10px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", maxWidth: "300px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "#1A3C6E14", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A3C6E" }}><Landmark size={20} strokeWidth={1.5} /></div>
        <div>
          <div style={{ fontSize: "1.15rem", fontWeight: 700, color: totalSaldo >= 0 ? "#16A34A" : "#DC2626" }}>R$ {totalSaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>Saldo Total</div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {loading ? <div style={{ color: "#9CA3AF" }}>Carregando...</div> : contas.length === 0 ? <div style={{ color: "#9CA3AF" }}>Nenhuma conta cadastrada</div> : contas.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontWeight: 700, color: "#0D2545", fontSize: "0.95rem" }}>{c.nome}</div>
                {c.banco && <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{c.banco}{c.agencia ? ` | Ag: ${c.agencia}` : ""}{c.numeroConta ? ` | CC: ${c.numeroConta}` : ""}</div>}
              </div>
              <span style={{ background: c.isAtiva ? "#DCFCE7" : "#FEE2E2", color: c.isAtiva ? "#16A34A" : "#DC2626", fontSize: "0.68rem", fontWeight: 600, borderRadius: "10px", padding: "2px 7px" }}>
                {c.isAtiva ? "Ativa" : "Inativa"}
              </span>
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: c.saldo >= 0 ? "#16A34A" : "#DC2626" }}>
              R$ {c.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.75rem", maxWidth: "450px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0D2545" }}>Nova Conta</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Nome *</label><input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} style={inputStyle} placeholder="Ex: Conta Corrente" /></div>
                  <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Banco</label><input value={form.banco} onChange={e => setForm({ ...form, banco: e.target.value })} style={inputStyle} placeholder="Ex: Bradesco" /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Agência</label><input value={form.agencia} onChange={e => setForm({ ...form, agencia: e.target.value })} style={inputStyle} /></div>
                    <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Conta</label><input value={form.numeroConta} onChange={e => setForm({ ...form, numeroConta: e.target.value })} style={inputStyle} /></div>
                  </div>
                  <div><label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>Saldo Inicial (R$)</label><input type="number" step="0.01" value={form.saldo} onChange={e => setForm({ ...form, saldo: e.target.value })} style={inputStyle} /></div>
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
