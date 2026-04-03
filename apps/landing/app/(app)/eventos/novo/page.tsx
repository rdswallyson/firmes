"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarPlus, ArrowLeft, Upload, Link as LinkIcon, MapPin } from "lucide-react";

export default function NovoEventoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [bannerMode, setBannerMode] = useState<"url" | "upload">("url");
  const [form, setForm] = useState({
    title: "", description: "", date: "", location: "",
    maxVagas: "", isGratuito: true, valor: "", banner: "",
    linkExterno: "", avancado: false, endereco: "", googleMapsLink: "",
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
      else alert("Erro ao criar evento");
    } catch { alert("Erro de conexão"); }
    setSaving(false);
  }

  async function handleBannerUpload(file: File) {
    // For now, convert to base64 data URL as a simple approach
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, banner: reader.result as string });
    };
    reader.readAsDataURL(file);
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
              <label style={labelStyle}>Titulo *</label>
              <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Ex: Conferencia de Jovens 2026" />
            </div>

            <div>
              <label style={labelStyle}>Descricao</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Detalhes do evento..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Data e Hora *</label>
                <input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Local (nome)</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} placeholder="Ex: Templo Principal" />
              </div>
            </div>

            {/* Endereco completo */}
            <div>
              <label style={labelStyle}><MapPin size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Endereco completo</label>
              <input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} style={inputStyle} placeholder="Rua, numero, bairro, cidade - estado" />
            </div>
            <div>
              <label style={labelStyle}>Link do Google Maps (opcional)</label>
              <input value={form.googleMapsLink} onChange={e => setForm({ ...form, googleMapsLink: e.target.value })} style={inputStyle} placeholder="https://maps.google.com/..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Maximo de Vagas</label>
                <input type="number" min="0" value={form.maxVagas} onChange={e => setForm({ ...form, maxVagas: e.target.value })} style={inputStyle} placeholder="Ilimitado" />
              </div>
              <div>
                <label style={labelStyle}>Banner do Evento</label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <button type="button" onClick={() => setBannerMode("url")} style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid #E5E7EB", background: bannerMode === "url" ? "#1A3C6E" : "white", color: bannerMode === "url" ? "white" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <LinkIcon size={12} /> URL
                  </button>
                  <button type="button" onClick={() => setBannerMode("upload")} style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid #E5E7EB", background: bannerMode === "upload" ? "#1A3C6E" : "white", color: bannerMode === "upload" ? "white" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Upload size={12} /> Upload
                  </button>
                </div>
                {bannerMode === "url" ? (
                  <input value={form.banner} onChange={e => setForm({ ...form, banner: e.target.value })} style={inputStyle} placeholder="https://..." />
                ) : (
                  <div style={{ border: "2px dashed #D1D5DB", borderRadius: "8px", padding: "0.75rem", textAlign: "center", cursor: "pointer", background: "#FAFAFA" }}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#1A3C6E"; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = "#D1D5DB"; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#D1D5DB"; if (e.dataTransfer.files[0]) handleBannerUpload(e.dataTransfer.files[0]); }}
                    onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = () => { if (inp.files?.[0]) handleBannerUpload(inp.files[0]); }; inp.click(); }}
                  >
                    {form.banner ? (
                      <img src={form.banner} alt="banner" style={{ maxWidth: "100%", maxHeight: "100px", borderRadius: "6px" }} />
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>Arraste ou clique para enviar</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Banner preview */}
            {form.banner && (
              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                <img src={form.banner} alt="Preview" style={{ width: "100%", maxHeight: "180px", objectFit: "cover" }} />
              </div>
            )}

            <div>
              <label style={labelStyle}>Link Externo (transmissao)</label>
              <input value={form.linkExterno} onChange={e => setForm({ ...form, linkExterno: e.target.value })} style={inputStyle} placeholder="https://youtube.com/..." />
            </div>

            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", color: "#374151" }}>
                <input type="checkbox" checked={form.isGratuito} onChange={e => setForm({ ...form, isGratuito: e.target.checked })} />
                Evento gratuito
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", color: "#374151" }}>
                <input type="checkbox" checked={form.avancado} onChange={e => setForm({ ...form, avancado: e.target.checked })} />
                Modo avancado (etapas, equipes, checklist)
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
