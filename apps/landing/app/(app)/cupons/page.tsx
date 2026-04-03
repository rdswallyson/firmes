"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, X } from "lucide-react";

interface Cupom { id: string; codigo: string; desconto: number; tipo: string; maxUsos: number | null; usosAtual: number; validade: string | null; ativo: boolean; }

export default function CuponsPage() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ codigo: "", desconto: "", tipo: "PERCENTUAL", maxUsos: "", validade: "" });
  const [saving, setSaving] = useState(false);

  function fetchCupons() {
    fetch("/api/cupons").then(r => r.json()).then((d: { cupons: Cupom[] }) => setCupons(d.cupons ?? [])).finally(() => setLoading(false));
  }
  useEffect(() => { fetchCupons(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/cupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, desconto: Number(form.desconto), maxUsos: form.maxUsos ? Number(form.maxUsos) : null }) });
    setSaving(false);
    setShowModal(false);
    setForm({ codigo: "", desconto: "", tipo: "PERCENTUAL", maxUsos: "", validade: "" });
    fetchCupons();
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "#374151" };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Cupons de Desconto</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Gerencie cupons promocionais</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 600 }}>
          <Plus size={16} strokeWidth={1.5} /> Novo Cupom
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Código", "Desconto", "Tipo", "Usos", "Validade", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.65rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : cupons.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum cupom cadastrado</td></tr>
            ) : cupons.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ borderBottom: "1px solid #F9FAFB" }}>
                <td style={{ padding: "0.55rem 1rem", fontWeight: 700, color: "#1A3C6E", fontFamily: "monospace", letterSpacing: "0.05em" }}>{c.codigo}</td>
                <td style={{ padding: "0.55rem 1rem", fontWeight: 600, color: "#C8922A" }}>
                  {c.tipo === "PERCENTUAL" ? `${c.desconto}%` : `R$ ${c.desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                </td>
                <td style={{ padding: "0.55rem 1rem" }}>
                  <span style={{ background: c.tipo === "PERCENTUAL" ? "#EFF6FF" : "#FEF3C7", color: c.tipo === "PERCENTUAL" ? "#1D4ED8" : "#D97706", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>{c.tipo === "PERCENTUAL" ? "Percentual" : "Fixo"}</span>
                </td>
                <td style={{ padding: "0.55rem 1rem", color: "#374151" }}>{c.usosAtual}{c.maxUsos ? ` / ${c.maxUsos}` : ""}</td>
                <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{c.validade ? new Date(c.validade).toLocaleDateString("pt-BR") : "Sem validade"}</td>
                <td style={{ padding: "0.55rem 1rem" }}>
                  <span style={{ background: c.ativo ? "#DCFCE7" : "#FEE2E2", color: c.ativo ? "#16A34A" : "#DC2626", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>{c.ativo ? "Ativo" : "Inativo"}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.75rem", maxWidth: "420px", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0D2545" }}>Novo Cupom</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div><label style={labelStyle}>Código *</label><input required value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase() })} style={inputStyle} placeholder="EX: PROMO10" /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div><label style={labelStyle}>Desconto *</label><input type="number" step="0.01" required value={form.desconto} onChange={e => setForm({ ...form, desconto: e.target.value })} style={inputStyle} placeholder="10" /></div>
                    <div><label style={labelStyle}>Tipo *</label>
                      <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                        <option value="PERCENTUAL">Percentual (%)</option>
                        <option value="FIXO">Fixo (R$)</option>
                      </select>
                    </div>
                  </div>
                  <div><label style={labelStyle}>Máx. de usos</label><input type="number" min="0" value={form.maxUsos} onChange={e => setForm({ ...form, maxUsos: e.target.value })} style={inputStyle} placeholder="Ilimitado" /></div>
                  <div><label style={labelStyle}>Validade</label><input type="date" value={form.validade} onChange={e => setForm({ ...form, validade: e.target.value })} style={inputStyle} /></div>
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
