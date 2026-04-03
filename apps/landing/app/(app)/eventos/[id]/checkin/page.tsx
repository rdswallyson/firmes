"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCheck,
  Users,
  Clock,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Percent,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";
const FONT = "var(--font-nunito), sans-serif";

interface Inscricao {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo: "MEMBRO" | "VISITANTE";
  status: "CONFIRMADO" | "LISTA_ESPERA" | "CANCELADO";
  checkinAt: string | null;
  qrCode: string;
}

interface Evento {
  id: string;
  titulo: string;
  data: string;
  local: string | null;
  inscricoes: Inscricao[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Inscricao["status"] }) {
  const map: Record<Inscricao["status"], { label: string; bg: string; color: string }> = {
    CONFIRMADO: { label: "Confirmado", bg: "#DCFCE7", color: "#166534" },
    LISTA_ESPERA: { label: "Lista de espera", bg: "#FEF9C3", color: "#854D0E" },
    CANCELADO: { label: "Cancelado", bg: "#FEE2E2", color: "#991B1B" },
  };
  const s = map[status];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 999,
        padding: "3px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: Inscricao["tipo"] }) {
  const isMembro = tipo === "MEMBRO";
  return (
    <span
      style={{
        background: isMembro ? "#DBEAFE" : "#FEF3C7",
        color: isMembro ? "#1E40AF" : "#92400E",
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 999,
        padding: "3px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {isMembro ? "Membro" : "Visitante"}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 2px 12px rgba(26,60,110,0.08)",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
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
        <p style={{ margin: 0, fontSize: 12, color: "#777", fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: NAVY }}>{value}</p>
      </div>
    </motion.div>
  );
}

export default function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEvento = useCallback(async () => {
    try {
      const res = await fetch(`/api/eventos/${resolvedParams.id}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: Evento = await res.json();
      setEvento(data);
      setLastUpdate(new Date());
    } catch {
      // silent fail on background refetch
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchEvento();
    intervalRef.current = setInterval(fetchEvento, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchEvento]);

  async function handleCheckin(qrCode: string) {
    setCheckingIn(qrCode);
    try {
      const res = await fetch(`/api/inscricoes/${qrCode}/checkin`, {
        method: "POST",
      });
      if (res.ok) {
        // optimistic update
        setEvento((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            inscricoes: prev.inscricoes.map((i) =>
              i.qrCode === qrCode
                ? { ...i, checkinAt: new Date().toISOString() }
                : i
            ),
          };
        });
      }
    } catch {
      // ignore
    } finally {
      setCheckingIn(null);
    }
  }

  // Derived stats
  const inscricoes = evento?.inscricoes ?? [];
  const confirmados = inscricoes.filter((i) => i.status === "CONFIRMADO");
  const presentes = inscricoes.filter((i) => i.checkinAt !== null);
  const total = confirmados.length;
  const percentual =
    total > 0 ? Math.round((presentes.length / total) * 100) : 0;

  // Filtered list
  const filtered = inscricoes.filter(
    (i) =>
      i.nome.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase())
  );

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

  if (!evento) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          flexDirection: "column",
          gap: 12,
        }}
      >
        <UserCheck size={48} color={GOLD} />
        <p style={{ color: NAVY, fontWeight: 700, fontSize: 18 }}>Evento não encontrado</p>
        <Link
          href="/eventos"
          style={{ color: NAVY, textDecoration: "underline", fontSize: 14 }}
        >
          Voltar para eventos
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        padding: "28px 24px 60px",
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <Link
            href={`/eventos`}
            style={{
              display: "flex",
              alignItems: "center",
              color: NAVY,
              textDecoration: "none",
              opacity: 0.7,
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <h1
            style={{
              color: NAVY,
              fontSize: 22,
              fontWeight: 800,
              margin: 0,
              flex: 1,
            }}
          >
            Check-in — {evento.titulo}
          </h1>
        </div>
        <p style={{ color: "#777", fontSize: 13, margin: "0 0 24px 30px" }}>
          {formatDate(evento.data)}
          {evento.local ? ` · ${evento.local}` : ""}
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <StatCard
            icon={<Users size={20} color={NAVY} />}
            label="Inscritos"
            value={total}
            accent={NAVY}
          />
          <StatCard
            icon={<CheckCircle size={20} color="#16A34A" />}
            label="Presentes"
            value={presentes.length}
            accent="#16A34A"
          />
          <StatCard
            icon={<Percent size={20} color={GOLD} />}
            label="Comparecimento"
            value={`${percentual}%`}
            accent={GOLD}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#888",
              fontSize: 12,
              marginLeft: "auto",
              alignSelf: "center",
            }}
          >
            <RefreshCw size={12} />
            Atualizado às {formatTime(lastUpdate.toISOString())}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search
            size={16}
            color="#999"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px 12px 40px",
              border: "1.5px solid #DDD6CE",
              borderRadius: 12,
              fontSize: 14,
              fontFamily: FONT,
              outline: "none",
              background: "#fff",
              boxSizing: "border-box",
              color: "#222",
            }}
          />
        </div>

        {/* Table */}
        <div
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
              gridTemplateColumns: "2fr 1fr 1fr 1fr 120px",
              padding: "12px 20px",
              background: "#F5F0EB",
              borderBottom: "1px solid #E8E0D5",
              fontSize: 12,
              fontWeight: 700,
              color: "#777",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            <span>Nome</span>
            <span>Tipo</span>
            <span>Status</span>
            <span>Check-in</span>
            <span style={{ textAlign: "center" }}>Ação</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#999",
                fontSize: 14,
              }}
            >
              Nenhum inscrito encontrado
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((inscricao, idx) => {
                const done = !!inscricao.checkinAt;
                const inProgress = checkingIn === inscricao.qrCode;
                return (
                  <motion.div
                    key={inscricao.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 120px",
                      padding: "14px 20px",
                      borderBottom:
                        idx < filtered.length - 1
                          ? "1px solid #F0EBE1"
                          : "none",
                      alignItems: "center",
                      background: done ? "#F0FDF4" : "#fff",
                      transition: "background .3s",
                    }}
                  >
                    {/* Nome */}
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          color: NAVY,
                          fontSize: 14,
                        }}
                      >
                        {inscricao.nome}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#888",
                        }}
                      >
                        {inscricao.email}
                      </p>
                    </div>

                    {/* Tipo */}
                    <TipoBadge tipo={inscricao.tipo} />

                    {/* Status */}
                    <StatusBadge status={inscricao.status} />

                    {/* Checkin time */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 13,
                        color: done ? "#16A34A" : "#ccc",
                        fontWeight: done ? 600 : 400,
                      }}
                    >
                      {done ? (
                        <>
                          <Clock size={13} />
                          {formatTime(inscricao.checkinAt!)}
                        </>
                      ) : (
                        <span style={{ color: "#ccc" }}>—</span>
                      )}
                    </div>

                    {/* Action */}
                    <div style={{ textAlign: "center" }}>
                      {done ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#16A34A",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle size={14} />
                          Presente
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={inProgress || inscricao.status === "CANCELADO"}
                          onClick={() => handleCheckin(inscricao.qrCode)}
                          style={{
                            background:
                              inscricao.status === "CANCELADO" ? "#ccc" : NAVY,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "7px 14px",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: FONT,
                            cursor:
                              inscricao.status === "CANCELADO"
                                ? "not-allowed"
                                : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {inProgress ? (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.7,
                                ease: "linear",
                              }}
                              style={{
                                display: "inline-block",
                                width: 12,
                                height: 12,
                                border: "2px solid rgba(255,255,255,0.4)",
                                borderTopColor: "#fff",
                                borderRadius: "50%",
                              }}
                            />
                          ) : (
                            <>
                              <UserCheck size={12} />
                              Check-in
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer summary */}
        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            color: "#888",
            fontSize: 13,
          }}
        >
          {presentes.length} presentes de {total} inscritos · {percentual}% comparecimento
        </p>
      </div>
    </div>
  );
}
