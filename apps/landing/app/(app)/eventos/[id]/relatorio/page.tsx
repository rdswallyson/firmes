"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Percent,
  DollarSign,
  Download,
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";
const FONT = "var(--font-nunito), sans-serif";

interface Visitante {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  checkinAt: string | null;
}

interface MembroPresente {
  id: string;
  nome: string;
  checkinAt: string;
}

interface RelatorioData {
  evento: {
    id: string;
    titulo: string;
    data: string;
    local: string | null;
    pago: boolean;
    valor: number | null;
  };
  stats: {
    totalInscritos: number;
    presentes: number;
    comparecimento: number;
    receita: number | null;
  };
  visitantes: Visitante[];
  membrosPresentes: MembroPresente[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatCard({
  icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay ?? 0 }}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 2px 14px rgba(26,60,110,0.08)",
        flex: 1,
        minWidth: 150,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: accent ? `${accent}18` : "#EEF2FA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: "#888", fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NAVY }}>{value}</p>
      </div>
    </motion.div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2
      style={{
        color: NAVY,
        fontSize: 16,
        fontWeight: 800,
        margin: "32px 0 14px",
        paddingBottom: 8,
        borderBottom: `2px solid ${GOLD}`,
        display: "inline-block",
      }}
    >
      {title}
    </h2>
  );
}

function exportCSV(filename: string, headers: string[], rows: (string | number | null)[][]) {
  const escape = (v: string | number | null) => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const csv = [headers, ...rows].map((r) => (Array.isArray(r) ? r.map(escape).join(",") : r)).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [data, setData] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/eventos/${resolvedParams.id}/relatorio`)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d: RelatorioData) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  function handleExportVisitantes() {
    if (!data) return;
    exportCSV(
      `visitantes-${data.evento.titulo.replace(/\s+/g, "-")}.csv`,
      ["Nome", "E-mail", "Telefone", "Check-in"],
      data.visitantes.map((v) => [
        v.nome,
        v.email,
        v.telefone ?? "",
        v.checkinAt ? formatTime(v.checkinAt) : "Não compareceu",
      ])
    );
  }

  function handleExportMembros() {
    if (!data) return;
    exportCSV(
      `membros-${data.evento.titulo.replace(/\s+/g, "-")}.csv`,
      ["Nome", "Check-in"],
      data.membrosPresentes.map((m) => [m.nome, formatTime(m.checkinAt)])
    );
  }

  function handleExportCompleto() {
    if (!data) return;
    const { stats, evento, visitantes, membrosPresentes } = data;
    const resumo = [
      ["Relatório de Evento"],
      [],
      ["Evento", evento.titulo],
      ["Data", formatDate(evento.data)],
      ["Local", evento.local ?? "—"],
      [],
      ["RESUMO"],
      ["Total Inscritos", stats.totalInscritos],
      ["Presentes", stats.presentes],
      ["Comparecimento", `${stats.comparecimento}%`],
      ...(stats.receita != null ? [["Receita", formatBRL(stats.receita)]] : []),
      [],
      ["VISITANTES (LEADS)"],
      ["Nome", "E-mail", "Telefone", "Check-in"],
      ...visitantes.map((v) => [
        v.nome,
        v.email,
        v.telefone ?? "",
        v.checkinAt ? formatTime(v.checkinAt) : "Não compareceu",
      ]),
      [],
      ["MEMBROS PRESENTES"],
      ["Nome", "Check-in"],
      ...membrosPresentes.map((m) => [m.nome, formatTime(m.checkinAt)]),
    ];
    exportCSV(`relatorio-${evento.titulo.replace(/\s+/g, "-")}.csv`, [], resumo as never);
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            width: 44,
            height: 44,
            border: `4px solid ${GOLD}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          gap: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <AlertCircle size={48} color={GOLD} />
        <h2 style={{ color: NAVY, fontSize: 20, margin: 0 }}>
          Relatório não disponível
        </h2>
        <p style={{ color: "#666", margin: 0, fontSize: 14 }}>
          O relatório não pôde ser carregado. Tente novamente mais tarde.
        </p>
        <Link
          href="/eventos"
          style={{ color: NAVY, textDecoration: "underline", fontSize: 14, marginTop: 8 }}
        >
          Voltar para eventos
        </Link>
      </div>
    );
  }

  const { evento, stats, visitantes, membrosPresentes } = data;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        padding: "28px 24px 80px",
        fontFamily: FONT,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href={`/eventos`}
              style={{
                display: "flex",
                alignItems: "center",
                color: NAVY,
                textDecoration: "none",
                opacity: 0.65,
              }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1
                style={{
                  color: NAVY,
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Relatório — {evento.titulo}
              </h1>
              <p style={{ color: "#777", fontSize: 13, margin: "2px 0 0" }}>
                {formatDate(evento.data)}
                {evento.local ? ` · ${evento.local}` : ""}
              </p>
            </div>
          </div>

          {/* Export button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportCompleto}
            style={{
              background: NAVY,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Download size={14} />
            Exportar tudo (CSV)
          </motion.button>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            icon={<Users size={22} color={NAVY} />}
            label="Total Inscritos"
            value={stats.totalInscritos}
            accent={NAVY}
            delay={0}
          />
          <StatCard
            icon={<UserCheck size={22} color="#16A34A" />}
            label="Presentes"
            value={stats.presentes}
            accent="#16A34A"
            delay={0.08}
          />
          <StatCard
            icon={<Percent size={22} color={GOLD} />}
            label="Comparecimento"
            value={`${stats.comparecimento}%`}
            accent={GOLD}
            delay={0.16}
          />
          {stats.receita != null && (
            <StatCard
              icon={<DollarSign size={22} color="#7C3AED" />}
              label="Receita"
              value={formatBRL(stats.receita)}
              accent="#7C3AED"
              delay={0.24}
            />
          )}
        </div>

        {/* ── Visitantes (Leads) ────────────────────────────────────────── */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <SectionTitle title={`Visitantes / Leads (${visitantes.length})`} />
            {visitantes.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleExportVisitantes}
                style={{
                  background: "transparent",
                  color: GOLD,
                  border: `1.5px solid ${GOLD}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Download size={12} />
                Exportar CSV
              </motion.button>
            )}
          </div>

          {visitantes.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "28px 20px",
                textAlign: "center",
                color: "#999",
                fontSize: 14,
                boxShadow: "0 2px 10px rgba(26,60,110,0.06)",
              }}
            >
              Nenhum visitante inscrito neste evento.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(26,60,110,0.08)",
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1.5fr 1fr",
                  padding: "11px 20px",
                  background: "#F5F0EB",
                  borderBottom: "1px solid #E8E0D5",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                <span>Nome</span>
                <span>E-mail</span>
                <span>Telefone</span>
                <span>Check-in</span>
              </div>

              {visitantes.map((v, idx) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * idx }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1.5fr 1fr",
                    padding: "13px 20px",
                    borderBottom:
                      idx < visitantes.length - 1
                        ? "1px solid #F5F0EB"
                        : "none",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontWeight: 600, color: NAVY, fontSize: 14 }}
                  >
                    {v.nome}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#555",
                      fontSize: 13,
                    }}
                  >
                    <Mail size={12} color="#aaa" />
                    {v.email}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#555",
                      fontSize: 13,
                    }}
                  >
                    {v.telefone ? (
                      <>
                        <Phone size={12} color="#aaa" />
                        {v.telefone}
                      </>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 13,
                    }}
                  >
                    {v.checkinAt ? (
                      <span
                        style={{
                          color: "#16A34A",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={12} />
                        {formatTime(v.checkinAt)}
                      </span>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* ── Membros presentes ─────────────────────────────────────────── */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <SectionTitle
              title={`Membros Presentes (${membrosPresentes.length})`}
            />
            {membrosPresentes.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleExportMembros}
                style={{
                  background: "transparent",
                  color: GOLD,
                  border: `1.5px solid ${GOLD}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Download size={12} />
                Exportar CSV
              </motion.button>
            )}
          </div>

          {membrosPresentes.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "28px 20px",
                textAlign: "center",
                color: "#999",
                fontSize: 14,
                boxShadow: "0 2px 10px rgba(26,60,110,0.06)",
              }}
            >
              Nenhum membro registrou presença neste evento.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(26,60,110,0.08)",
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 1fr",
                  padding: "11px 20px",
                  background: "#F5F0EB",
                  borderBottom: "1px solid #E8E0D5",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                <span>Nome</span>
                <span>Check-in</span>
              </div>

              {membrosPresentes.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.04 * idx }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 1fr",
                    padding: "13px 20px",
                    borderBottom:
                      idx < membrosPresentes.length - 1
                        ? "1px solid #F5F0EB"
                        : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, color: NAVY, fontSize: 14 }}>
                    {m.nome}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      color: "#16A34A",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    <Clock size={12} />
                    {formatTime(m.checkinAt)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
