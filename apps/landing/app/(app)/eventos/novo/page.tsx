"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarPlus, ArrowLeft } from "lucide-react";

export default function NovoEventoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", date: "", location: "",
    maxVagas: "", isGratuito: true, valor: "", banner: "",
    linkExterno: "", avancado: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxVagas: form.maxVagas ? Number(form.maxVagas) : undefined,
          valor: !form.isGratuito && form.valor ? Number(form.valor) : undefined,
        }),
      });
      if (res.ok) router.push("/eventos");
    } catch { /* ignore */ }
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.65rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "#374151" };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "700px", margin: "0 auto" }}>
      <button onClick={() => router.push("/eventos")} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.85rem", marginBottom: "1rem", padding: 0 }}>
        <ArrowLeft size={16} strokeWidth={1.5} /> Voltar para Eventos
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "white", borderRadius: "12px", padding: "2rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <CalendarPlus size={22} strokeWidth={1.5} color="#1A3C6E" />
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#0D2545" }}>Novo Evento</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Título *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Ex: Conferência de Jovens 2026" />
            </div>

            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Detalhes do evento..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Data e Hora *</label>
                <input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Local</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} placeholder="Ex: Templo Principal" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Máximo de Vagas</label>
                <input type="number" min="0" value={form.maxVagas} onChange={e => setForm({ ...form, maxVagas: e.target.value })} style={inputStyle} placeholder="Ilimitado" />
              </div>
              <div>
                <label style={labelStyle}>Banner (URL da imagem)</label>
                <input value={form.banner} onChange={e => setForm({ ...form, banner: e.target.value })} style={inputStyle} placeholder="https://..." />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Link Externo (transmissão)</label>
              <input value={form.linkExterno} onChange={e => setForm({ ...form, linkExterno: e.target.value })} style={inputStyle} placeholder="https://youtube.com/..." />
            </div>

            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", color: "#374151" }}>
                <input type="checkbox" checked={form.isGratuito} onChange={e => setForm({ ...form, isGratuito: e.target.checked })} />
                Evento gratuito
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", color: "#374151" }}>
                <input type="checkbox" checked={form.avancado} onChange={e => setForm({ ...form, avancado: e.target.checked })} />
                Modo avançado (fases, equipes, checklist)
              </label>
            </div>

            {!form.isGratuito && (
              <div>
                <label style={labelStyle}>Valor (R$) *</label>
                <input type="number" step="0.01" min="0" required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} style={inputStyle} placeholder="0,00" />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => router.push("/eventos")} style={{ padding: "0.65rem 1.5rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ padding: "0.65rem 1.5rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              {saving ? "Criando..." : "Criar Evento"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
