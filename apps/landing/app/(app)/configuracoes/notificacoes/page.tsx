"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Send, Users, Calendar, AlertTriangle, CheckCircle, Mail, MessageCircle } from "lucide-react";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  canal: string;
  destinatario: string;
  enviadoEm?: string;
  totalEnviados: number;
  createdAt: string;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    mensagem: "",
    canal: "WHATSAPP",
    destinatario: "TODOS",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/notificacoes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotificacoes(data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const nova = await res.json();
        setNotificacoes([nova, ...notificacoes]);
        setShowForm(false);
        setForm({ titulo: "", mensagem: "", canal: "WHATSAPP", destinatario: "TODOS" });
      }
    } catch {
      alert("Erro ao enviar notificação");
    } finally {
      setLoading(false);
    }
  }

  const canalIcon = {
    EMAIL: <Mail size={16} />,
    WHATSAPP: <MessageCircle size={16} />,
    PUSH: <Bell size={16} />,
  };

  const destIcon = {
    TODOS: <Users size={16} />,
    GRUPO: <Users size={16} />,
    ANIVERSARIANTES: <Calendar size={16} />,
    AUSENTES: <AlertTriangle size={16} />,
    ESCALADOS: <Users size={16} />,
  };

  return (
    <div className="page-pad" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Notificações</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Envie comunicações para membros e visitantes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: showForm ? "#F3F4F6" : "linear-gradient(135deg, #1A3C6E, #1E4A84)",
            color: showForm ? "#374151" : "white",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Send size={16} />
          {showForm ? "Cancelar" : "Nova Notificação"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Título *</label>
            <input
              type="text"
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Aviso importante"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Mensagem *</label>
            <textarea
              required
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              placeholder="Digite sua mensagem..."
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Canal *</label>
              <select
                value={form.canal}
                onChange={(e) => setForm({ ...form, canal: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">E-mail</option>
                <option value="PUSH">Push (App)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Destinatários *</label>
              <select
                value={form.destinatario}
                onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              >
                <option value="TODOS">Todos os membros</option>
                <option value="GRUPO">Grupo específico</option>
                <option value="ANIVERSARIANTES">Aniversariantes do mês</option>
                <option value="AUSENTES">Ausentes há 30+ dias</option>
                <option value="ESCALADOS">Escalados desta semana</option>
              </select>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 24px",
                background: loading ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E, #1E4A84)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Enviando..." : "Enviar Notificação"}
            </button>
          </div>
        </motion.form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {notificacoes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
            <Bell size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
            <p style={{ color: "#6B7280" }}>Nenhuma notificação enviada ainda.</p>
          </div>
        ) : (
          notificacoes.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F5F0EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A3C6E" }}>
                    {canalIcon[n.canal as keyof typeof canalIcon] || <Bell size={18} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{n.titulo}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                        {destIcon[n.destinatario as keyof typeof destIcon] || <Users size={12} />}
                        {n.destinatario}
                      </span>
                      {n.enviadoEm && (
                        <span style={{ fontSize: 12, color: "#16A34A", display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={12} />
                          Enviado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{n.totalEnviados} enviados</span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>{n.mensagem}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
