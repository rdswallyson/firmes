"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MessageCircle, Users, Calendar, AlertTriangle, CheckCircle, Clock, ChevronDown } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

const DESTINATARIOS = [
  { id: "TODOS", label: "Todos os membros", icon: <Users size={16} /> },
  { id: "ANIVERSARIANTES", label: "Aniversariantes do mês", icon: <Calendar size={16} /> },
  { id: "AUSENTES", label: "Ausentes há 30+ dias", icon: <AlertTriangle size={16} /> },
  { id: "ESCALADOS", label: "Escalados desta semana", icon: <Clock size={16} /> },
];

export default function ComunicacaoPage() {
  const [form, setForm] = useState({ titulo: "", mensagem: "", canal: "WHATSAPP", destinatario: "TODOS", grupoId: "" });
  const [grupos, setGrupos] = useState<{ id: string; name: string }[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [preview, setPreview] = useState({ total: 0, nomes: [] as string[] });
  const [mostrarPreview, setMostrarPreview] = useState(false);

  useEffect(() => {
    fetch("/api/grupos").then(r => r.json()).then(d => setGrupos(d.grupos || []));
    fetch("/api/notificacoes").then(r => r.json()).then(d => setHistorico(d.notificacoes || []));
  }, []);

  const previewDestinatarios = async () => {
    // Simulação: na prática a API retornaria a lista
    setMostrarPreview(true);
    setPreview({ total: 0, nomes: [] });
  };

  const enviar = async () => {
    if (!form.titulo || !form.mensagem) return alert("Preencha título e mensagem");
    setEnviando(true);
    try {
      const res = await fetch("/api/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Enviado para ${data.total} destinatários!`);
      setForm({ titulo: "", mensagem: "", canal: "WHATSAPP", destinatario: "TODOS", grupoId: "" });
      setHistorico([data.notif, ...historico]);
    } catch (err: any) {
      alert(err.message || "Erro ao enviar");
    } finally {
      setEnviando(false);
    }
  };

  const variaveis = ["{nome}", "{igreja}", "{data}"];

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Comunicação em Massa</h1>
        <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Envie mensagens para grupos específicos da igreja</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        {/* Formulário */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 5, fontSize: 13 }}>Título *</label>
            <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="ex: Aviso importante"
              style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 5, fontSize: 13 }}>Mensagem *</label>
            <textarea value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })} placeholder="Olá {nome}, ..."
              rows={5}
              style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {variaveis.map(v => (
                <button key={v} type="button" onClick={() => setForm({ ...form, mensagem: form.mensagem + v })}
                  style={{ padding: "3px 8px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 5, fontSize: 13 }}>Canal *</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "WHATSAPP", label: "WhatsApp", icon: <MessageCircle size={14} />, color: "#16A34A" },
                  { id: "EMAIL", label: "E-mail", icon: <Mail size={14} />, color: "#2563EB" },
                ].map(c => (
                  <button key={c.id} type="button" onClick={() => setForm({ ...form, canal: c.id })}
                    style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      background: form.canal === c.id ? c.color : "#F3F4F6", color: form.canal === c.id ? "#fff" : "#6B7280" }}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 5, fontSize: 13 }}>Destinatários *</label>
              <select value={form.destinatario} onChange={e => setForm({ ...form, destinatario: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box" }}>
                {DESTINATARIOS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                <option value="GRUPO">Grupo específico</option>
              </select>
            </div>
          </div>

          {form.destinatario === "GRUPO" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 5, fontSize: 13 }}>Selecione o grupo</label>
              <select value={form.grupoId} onChange={e => setForm({ ...form, grupoId: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box" }}>
                <option value="">Selecione...</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          <button onClick={enviar} disabled={enviando}
            style={{ width: "100%", padding: "12px", background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: enviando ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Send size={18} /> {enviando ? "Enviando..." : "Enviar Comunicação"}
          </button>
        </div>

        {/* Histórico */}
        <div>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0D2545", margin: "0 0 14px" }}>Histórico de envios</h2>
            {historico.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9CA3AF", padding: 20 }}>Nenhum envio ainda</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {historico.slice(0, 10).map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ padding: "10px 12px", background: "#F9FAFB", borderRadius: 10, borderLeft: `3px solid ${n.canal === "WHATSAPP" ? "#16A34A" : "#2563EB"}` }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0D2545", marginBottom: 2 }}>{n.titulo}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{n.destinatario} · {n.totalEnviados} enviados · {new Date(n.enviadoEm || n.createdAt).toLocaleDateString("pt-BR")}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
