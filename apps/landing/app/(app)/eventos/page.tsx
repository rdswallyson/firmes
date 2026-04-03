"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CalendarDays, MapPin, Users, QrCode, FileText, Settings2 } from "lucide-react";
import Link from "next/link";

interface Evento {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  status: "ABERTO" | "LOTADO" | "ENCERRADO";
  maxVagas?: number;
  isGratuito: boolean;
  valor?: number;
  bannerUrl?: string;
  _count?: { inscricoes: number };
}

const statusColor: Record<string, { bg: string; color: string; label: string }> = {
  ABERTO:    { bg: "#DCFCE7", color: "#16A34A", label: "Aberto" },
  LOTADO:    { bg: "#FEF9C3", color: "#CA8A04", label: "Lotado" },
  ENCERRADO: { bg: "#F3F4F6", color: "#6B7280", label: "Encerrado" },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: "14px", width: "100%", maxWidth: "540px",
  maxHeight: "90vh", overflowY: "auto", padding: "2rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "var(--font-nunito), sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px",
  border: "1.5px solid #E5E7EB", fontSize: "0.875rem", outline: "none",
  fontFamily: "var(--font-nunito), sans-serif", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: 600,
  color: "#374151", marginBottom: "0.3rem",
};

const btnPrimary: React.CSSProperties = {
  background: "#1A3C6E", color: "#FFFFFF", border: "none",
  padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 700,
  fontSize: "0.875rem", cursor: "pointer", fontFamily: "var(--font-nunito), sans-serif",
  display: "flex", alignItems: "center", gap: "0.4rem",
};

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", date: "", location: "",
    maxVagas: "", isGratuito: true, valor: "", bannerUrl: "",
  });

  useEffect(() => {
    fetchEventos();
  }, []);

  async function fetchEventos() {
    setLoading(true);
    try {
      const res = await fetch("/api/eventos");
      const data = await res.json();
      setEventos(data.eventos ?? data ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ title: "", description: "", date: "", location: "", maxVagas: "", isGratuito: true, valor: "", bannerUrl: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxVagas: form.maxVagas ? Number(form.maxVagas) : undefined,
          valor: !form.isGratuito && form.valor ? Number(form.valor) : undefined,
        }),
      });
      setShowModal(false);
      resetForm();
      fetchEventos();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.2rem" }}>Eventos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie os eventos da sua igreja</p>
        </div>
        <button style={btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={16} strokeWidth={2} /> Novo Evento
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : eventos.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum evento cadastrado.</div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}
        >
          {eventos.map((ev) => {
            const badge = statusColor[ev.status] ?? statusColor.ENCERRADO ?? { label: ev.status, bg: "#F3F4F6", color: "#6B7280" };
            return (
              <motion.div key={ev.id} variants={cardVariants}
                style={{ background: "#FFFFFF", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {ev.bannerUrl && (
                  <div style={{ height: "140px", overflow: "hidden" }}>
                    <img src={ev.bannerUrl} alt={ev.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: "1.1rem 1.25rem", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0D2545" }}>{ev.title}</h3>
                    <span style={{ background: badge.bg, color: badge.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap", marginLeft: "0.5rem" }}>
                      {badge.label}
                    </span>
                  </div>

                  {ev.description && (
                    <p style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5 }}>{ev.description}</p>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#374151" }}>
                      <CalendarDays size={13} strokeWidth={1.5} color="#1A3C6E" />
                      {fmt(ev.date)}
                    </div>
                    {ev.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#374151" }}>
                        <MapPin size={13} strokeWidth={1.5} color="#1A3C6E" />
                        {ev.location}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#374151" }}>
                      <Users size={13} strokeWidth={1.5} color="#1A3C6E" />
                      {ev._count?.inscricoes ?? 0} inscrição(ões)
                      {ev.maxVagas ? ` / ${ev.maxVagas} vagas` : ""}
                    </div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: ev.isGratuito ? "#16A34A" : "#C8922A" }}>
                      {ev.isGratuito ? "Gratuito" : `R$ ${Number(ev.valor ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <Link href={`/eventos/${ev.id}/checkin`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: "7px", background: "#EFF6FF", color: "#1A3C6E", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                      <QrCode size={13} strokeWidth={1.5} /> Check-in
                    </Link>
                    <Link href={`/eventos/${ev.id}/relatorio`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: "7px", background: "#F3F4F6", color: "#374151", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                      <FileText size={13} strokeWidth={1.5} /> Relatório
                    </Link>
                    <Link href={`/eventos/${ev.id}/avancado`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: "7px", background: "#FEF3C7", color: "#C8922A", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                      <Settings2 size={13} strokeWidth={1.5} /> Avançado
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={overlayStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div style={modalStyle} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0D2545" }}>Novo Evento</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Título *</label>
                  <input required style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome do evento" />
                </div>
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição do evento" />
                </div>
                <div>
                  <label style={labelStyle}>Data e Hora *</label>
                  <input required type="datetime-local" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Local</label>
                  <input style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Local do evento" />
                </div>
                <div>
                  <label style={labelStyle}>Vagas Máximas</label>
                  <input type="number" min={1} style={inputStyle} value={form.maxVagas} onChange={e => setForm(f => ({ ...f, maxVagas: e.target.value }))} placeholder="Ilimitado se vazio" />
                </div>
                <div>
                  <label style={labelStyle}>Banner (URL)</label>
                  <input style={inputStyle} value={form.bannerUrl} onChange={e => setForm(f => ({ ...f, bannerUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" id="isGratuito" checked={form.isGratuito} onChange={e => setForm(f => ({ ...f, isGratuito: e.target.checked }))} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                  <label htmlFor="isGratuito" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>Evento Gratuito</label>
                </div>
                {!form.isGratuito && (
                  <div>
                    <label style={labelStyle}>Valor (R$) *</label>
                    <input required type="number" min={0} step="0.01" style={inputStyle} value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" />
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Salvando..." : "Criar Evento"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
