"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CalendarDays, MapPin, Users, QrCode, FileText, Settings2, UserPlus, Link as LinkIcon, Copy, Check } from "lucide-react";
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
  slug?: string;
  _count?: { inscricoes: number };
}

const statusColor: Record<string, { bg: string; color: string; label: string }> = {
  ABERTO:    { bg: "#DCFCE7", color: "#16A34A", label: "Aberto" },
  LOTADO:    { bg: "#FEF9C3", color: "#CA8A04", label: "Lotado" },
  ENCERRADO: { bg: "#F3F4F6", color: "#6B7280", label: "Encerrado" },
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "0.3rem 0.6rem", borderRadius: 6, border: "1px solid #E5E7EB", background: copied ? "#DCFCE7" : "white", color: copied ? "#16A34A" : "#374151", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
      {copied ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
    </button>
  );
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inscModal, setInscModal] = useState<Evento | null>(null);
  const [inscSaving, setInscSaving] = useState(false);
  const [inscForm, setInscForm] = useState({ nome: "", email: "", telefone: "", tipo: "VISITANTE", formaPagamento: "PIX" });

  const [form, setForm] = useState({
    title: "", description: "", date: "", location: "",
    maxVagas: "", isGratuito: true, valor: "", bannerUrl: "",
  });

  useEffect(() => { fetchEventos(); }, []);

  async function fetchEventos() {
    setLoading(true);
    try {
      const res = await fetch("/api/eventos");
      const data = await res.json();
      setEventos(data.eventos ?? data ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function resetForm() {
    setForm({ title: "", description: "", date: "", location: "", maxVagas: "", isGratuito: true, valor: "", bannerUrl: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/eventos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, maxVagas: form.maxVagas ? Number(form.maxVagas) : undefined, valor: !form.isGratuito && form.valor ? Number(form.valor) : undefined }),
      });
      setShowModal(false); resetForm(); fetchEventos();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function handleInscManual(e: React.FormEvent) {
    e.preventDefault();
    if (!inscModal) return;
    setInscSaving(true);
    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: inscModal.id, ...inscForm, totalFinal: 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Inscricao criada! QR Code: ${data.qrCode}`);
        setInscModal(null);
        setInscForm({ nome: "", email: "", telefone: "", tipo: "VISITANTE", formaPagamento: "PIX" });
        fetchEventos();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao inscrever");
      }
    } catch { alert("Erro de conexao"); }
    finally { setInscSaving(false); }
  }

  const fmt = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.2rem" }}>Eventos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie os eventos da sua igreja</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/eventos/novo" style={btnPrimary}>
            <Plus size={16} strokeWidth={2} /> Novo Evento
          </Link>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : eventos.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum evento cadastrado.</div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {eventos.map(ev => {
            const badge = statusColor[ev.status] ?? statusColor.ENCERRADO!;
            const inscUrl = ev.slug ? `${origin}/inscricao/${ev.slug}` : "";
            return (
              <motion.div key={ev.id} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
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
                      <CalendarDays size={13} strokeWidth={1.5} color="#1A3C6E" /> {fmt(ev.date)}
                    </div>
                    {ev.location && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#374151" }}>
                        <MapPin size={13} strokeWidth={1.5} color="#1A3C6E" /> {ev.location}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#374151" }}>
                      <Users size={13} strokeWidth={1.5} color="#1A3C6E" />
                      {ev._count?.inscricoes ?? 0} inscricao(oes){ev.maxVagas ? ` / ${ev.maxVagas} vagas` : ""}
                    </div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: ev.isGratuito ? "#16A34A" : "#C8922A" }}>
                      {ev.isGratuito ? "Gratuito" : `R$ ${Number(ev.valor ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                    </div>
                  </div>

                  {/* Link de inscricao */}
                  {inscUrl && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.45rem 0.65rem", background: "#F5F0EB", borderRadius: "7px", marginBottom: "0.75rem" }}>
                      <LinkIcon size={12} strokeWidth={1.5} color="#1A3C6E" />
                      <span style={{ flex: 1, fontSize: "0.7rem", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inscUrl}</span>
                      <CopyButton text={inscUrl} />
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button onClick={() => setInscModal(ev)} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: "7px", background: "#DCFCE7", color: "#16A34A", fontSize: "0.78rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                      <UserPlus size={13} strokeWidth={1.5} /> Inscrever
                    </button>
                    <Link href={`/eventos/${ev.id}/checkin`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: "7px", background: "#EFF6FF", color: "#1A3C6E", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                      <QrCode size={13} strokeWidth={1.5} /> Check-in
                    </Link>
                    <Link href={`/eventos/${ev.id}/relatorio`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: "7px", background: "#F3F4F6", color: "#374151", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                      <FileText size={13} strokeWidth={1.5} /> Relatorio
                    </Link>
                    <Link href={`/eventos/${ev.id}/avancado`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.45rem 0.85rem", borderRadius: "7px", background: "#FEF3C7", color: "#C8922A", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none" }}>
                      <Settings2 size={13} strokeWidth={1.5} /> Avancado
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal Inscricao Manual */}
      <AnimatePresence>
        {inscModal && (
          <motion.div style={overlayStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setInscModal(null)}>
            <motion.div style={modalStyle} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0D2545" }}>Inscrever Manualmente — {inscModal.title}</h2>
                <button onClick={() => setInscModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
              </div>

              <form onSubmit={handleInscManual} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input required style={inputStyle} value={inscForm.nome} onChange={e => setInscForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" />
                </div>
                <div>
                  <label style={labelStyle}>E-mail *</label>
                  <input required type="email" style={inputStyle} value={inscForm.email} onChange={e => setInscForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label style={labelStyle}>Telefone</label>
                  <input style={inputStyle} value={inscForm.telefone} onChange={e => setInscForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {(["MEMBRO", "VISITANTE"] as const).map(t => {
                      const sel = inscForm.tipo === t;
                      return (
                        <label key={t} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem", border: `2px solid ${sel ? "#1A3C6E" : "#E5E7EB"}`, borderRadius: 8, cursor: "pointer", background: sel ? "#EEF2FA" : "#fff", fontWeight: sel ? 700 : 400, color: sel ? "#1A3C6E" : "#555", fontSize: "0.85rem" }}>
                          <input type="radio" name="tipo" value={t} checked={sel} onChange={() => setInscForm(f => ({ ...f, tipo: t }))} style={{ display: "none" }} />
                          {t === "MEMBRO" ? "Membro" : "Visitante"}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Forma de Pagamento</label>
                  <select style={inputStyle} value={inscForm.formaPagamento} onChange={e => setInscForm(f => ({ ...f, formaPagamento: e.target.value }))}>
                    <option value="PIX">PIX</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CARTAO">Cartao</option>
                    <option value="GRATUITO">Gratuito</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setInscModal(null)}
                    style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={inscSaving} style={{ ...btnPrimary, opacity: inscSaving ? 0.7 : 1 }}>
                    {inscSaving ? "Salvando..." : "Inscrever"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Novo Evento (quick) */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={overlayStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div style={modalStyle} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0D2545" }}>Novo Evento</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div><label style={labelStyle}>Titulo *</label><input required style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nome do evento" /></div>
                <div><label style={labelStyle}>Descricao</label><textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div><label style={labelStyle}>Data e Hora *</label><input required type="datetime-local" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div><label style={labelStyle}>Local</label><input style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
                <div><label style={labelStyle}>Vagas Maximas</label><input type="number" min={1} style={inputStyle} value={form.maxVagas} onChange={e => setForm(f => ({ ...f, maxVagas: e.target.value }))} placeholder="Ilimitado" /></div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input type="checkbox" checked={form.isGratuito} onChange={e => setForm(f => ({ ...f, isGratuito: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer" }} />
                  <label style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>Evento Gratuito</label>
                </div>
                {!form.isGratuito && <div><label style={labelStyle}>Valor (R$) *</label><input required type="number" min={0} step="0.01" style={inputStyle} value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} /></div>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>{saving ? "Salvando..." : "Criar Evento"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
