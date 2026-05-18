"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MessageCircle, Send, Users, Cake, Bell } from "lucide-react";
import Link from "next/link";

export default function ComunicacaoPage() {
  const [tab, setTab] = useState<"email" | "whatsapp">("email");
  const [mensagem, setMensagem] = useState("");
  const [destinatarios, setDestinatarios] = useState("todos");
  const [loading, setLoading] = useState(false);

  async function enviar() {
    if (!mensagem.trim()) return alert("Digite uma mensagem");
    setLoading(true);
    try {
      const res = await fetch("/api/comunicacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal: tab, mensagem, destinatarios }),
      });
      if (res.ok) {
        alert("Mensagem enviada!");
        setMensagem("");
      } else {
        alert("Erro ao enviar");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Comunicação</h1>
        <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Envie mensagens para a congregação</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setTab("email")}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: tab === "email" ? "linear-gradient(135deg, #1A3C6E, #1E4A84)" : "#F3F4F6",
            color: tab === "email" ? "white" : "#374151",
          }}
        >
          <Mail size={16} />
          E-mail
        </button>
        <button
          onClick={() => setTab("whatsapp")}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: tab === "whatsapp" ? "linear-gradient(135deg, #1A3C6E, #1E4A84)" : "#F3F4F6",
            color: tab === "whatsapp" ? "white" : "#374151",
          }}
        >
          <MessageCircle size={16} />
          WhatsApp
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Destinatários</label>
          <select
            value={destinatarios}
            onChange={(e) => setDestinatarios(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
          >
            <option value="todos">Todos os membros</option>
            <option value="grupo">Grupo específico</option>
            <option value="aniversariantes">Aniversariantes do mês</option>
            <option value="ausentes">Ausentes há 30+ dias</option>
            <option value="escalados">Escalados desta semana</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Mensagem</label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder={`Digite sua mensagem para envio via ${tab === "email" ? "e-mail" : "WhatsApp"}...`}
            rows={8}
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, resize: "vertical" }}
          />
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9CA3AF" }}>Variáveis: {"{nome}"}, {"{igreja}"}, {"{data}"}</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={enviar}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 24px",
            background: loading ? "#9CA3AF" : tab === "whatsapp" ? "#25D366" : "linear-gradient(135deg, #1A3C6E, #1E4A84)",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Send size={16} />
          {loading ? "Enviando..." : `Enviar ${tab === "email" ? "E-mail" : "WhatsApp"}`}
        </motion.button>
      </div>
    </div>
  );
}
