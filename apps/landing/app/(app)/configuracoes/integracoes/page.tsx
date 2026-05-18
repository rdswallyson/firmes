"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Mail, MessageCircle, Check, Copy } from "lucide-react";
import Link from "next/link";

interface Integracao {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ReactNode;
  conectado: boolean;
  chave?: string;
}

export default function IntegracoesPage() {
  const [integracoes, setIntegracoes] = useState<Integracao[]>([
    {
      id: "stripe",
      nome: "Stripe",
      descricao: "Pagamentos online e assinaturas",
      icone: <CreditCard size={24} style={{ color: "#635BFF" }} />,
      conectado: false,
    },
    {
      id: "resend",
      nome: "Resend",
      descricao: "Envio de e-mails transacionais",
      icone: <Mail size={24} style={{ color: "#E11D48" }} />,
      conectado: false,
    },
    {
      id: "whatsapp",
      nome: "WhatsApp API",
      descricao: "Notificações via WhatsApp",
      icone: <MessageCircle size={24} style={{ color: "#25D366" }} />,
      conectado: false,
    },
  ]);

  function toggleConnection(id: string) {
    setIntegracoes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, conectado: !i.conectado } : i))
    );
  }

  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/configuracoes" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Integrações</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Conecte serviços externos</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {integracoes.map((int, i) => (
          <motion.div
            key={int.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {int.icone}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{int.nome}</h3>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 6,
                      fontWeight: 600,
                      background: int.conectado ? "#DCFCE7" : "#F3F4F6",
                      color: int.conectado ? "#16A34A" : "#6B7280",
                    }}
                  >
                    {int.conectado ? "Conectado" : "Desconectado"}
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>{int.descricao}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleConnection(int.id)}
                style={{
                  padding: "8px 16px",
                  background: int.conectado ? "#FEE2E2" : "#EFF6FF",
                  color: int.conectado ? "#DC2626" : "#1A3C6E",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {int.conectado ? "Desconectar" : "Conectar"}
              </motion.button>
            </div>

            {int.conectado && (
              <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Chave da API</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="password"
                    value="sk_live_••••••••••••••••••••••••••••••"
                    readOnly
                    style={{ flex: 1, padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 6, fontSize: 13, background: "white" }}
                  />
                  <button style={{ padding: "8px 12px", background: "white", border: "1.5px solid #E5E7EB", borderRadius: 6, cursor: "pointer" }}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
