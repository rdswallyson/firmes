"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Activity, Database, CreditCard, Mail, HardDrive } from "lucide-react";

interface ServiceStatus {
  name: string;
  icon: React.ReactNode;
  status: "up" | "degraded" | "down";
  uptime: number;
}

const SERVICES: ServiceStatus[] = [
  { name: "Sistema Principal", icon: <Activity size={20} />, status: "up", uptime: 99.9 },
  { name: "Banco de Dados", icon: <Database size={20} />, status: "up", uptime: 99.95 },
  { name: "Pagamentos (Stripe)", icon: <CreditCard size={20} />, status: "up", uptime: 99.8 },
  { name: "E-mails (Resend)", icon: <Mail size={20} />, status: "up", uptime: 99.9 },
  { name: "Armazenamento", icon: <HardDrive size={20} />, status: "up", uptime: 99.95 },
];

const INCIDENTS = [
  { date: "2026-05-10", title: "Lentidão no dashboard", status: "resolved", duration: "12 min" },
  { date: "2026-04-28", title: "Indisponibilidade do banco", status: "resolved", duration: "5 min" },
];

function StatusBadge({ status }: { status: string }) {
  const colors = {
    up: { bg: "#DCFCE7", text: "#166534", label: "Operacional" },
    degraded: { bg: "#FEF9C3", text: "#854D0E", label: "Degradado" },
    down: { bg: "#FEE2E2", text: "#991B1B", label: "Fora do ar" },
  };
  const c = colors[status as keyof typeof colors] || colors.up;

  return (
    <span style={{ background: c.bg, color: c.text, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {c.label}
    </span>
  );
}

export default function StatusPage() {
  const [now] = useState(new Date());

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", fontFamily: "var(--font-nunito), sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>Status do Sistema</h1>
          <p style={{ color: "#6B7280", fontSize: 15 }}>Última atualização: {now.toLocaleString("pt-BR")}</p>
        </motion.div>

        {/* Cards de serviços */}
        <div style={{ display: "grid", gap: 12, marginBottom: 40 }}>
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ color: "#1A3C6E" }}>{s.icon}</div>
                <span style={{ fontWeight: 600, color: "#111827", fontSize: 15 }}>{s.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>{s.uptime}% uptime</span>
                <StatusBadge status={s.status} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Histórico de incidentes */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0D2545", marginBottom: 20 }}>Histórico de Incidentes — Últimos 30 dias</h2>

          {INCIDENTS.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#6B7280" }}>
              <CheckCircle size={32} style={{ color: "#22C55E", marginBottom: 8 }} />
              <p>Nenhum incidente registrado nos últimos 30 dias.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {INCIDENTS.map((inc, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "#F9FAFB",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {inc.status === "resolved" ? (
                      <CheckCircle size={16} style={{ color: "#22C55E" }} />
                    ) : (
                      <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
                    )}
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{inc.title}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>{inc.date}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>Duração: {inc.duration}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a href="/" style={{ color: "#1A3C6E", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>← Voltar para a página inicial</a>
        </div>
      </div>
    </div>
  );
}
