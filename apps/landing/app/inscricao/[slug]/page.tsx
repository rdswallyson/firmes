"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Tag,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";
const FONT = "var(--font-nunito), sans-serif";

interface Evento {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  local: string | null;
  vagas: number | null;
  vagasDisponiveis: number | null;
  pago: boolean;
  valor: number | null;
  slug: string;
}

interface InscricaoResult {
  id: string;
  qrCode: string;
  status: "CONFIRMADO" | "LISTA_ESPERA";
}

type FormState = "idle" | "loading" | "success" | "error";
type TipoParticipante = "MEMBRO" | "VISITANTE";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function QRCodePlaceholder({ code }: { code: string }) {
  // Simple visual QR placeholder — renders a grid pattern + the raw code text
  const grid = Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => {
      const corner =
        (row < 2 && col < 2) ||
        (row < 2 && col > 4) ||
        (row > 4 && col < 2);
      return corner || (row === 3 && col % 2 === 0) || Math.random() > 0.55;
    })
  );
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: "repeat(7, 20px)",
          gap: 2,
          padding: 16,
          background: "#fff",
          borderRadius: 8,
          border: `2px solid ${NAVY}`,
          marginBottom: 8,
        }}
      >
        {grid.map((row, ri) =>
          row.map((filled, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={{
                width: 20,
                height: 20,
                borderRadius: 2,
                background: filled ? NAVY : "#fff",
              }}
            />
          ))
        )}
      </div>
      <p
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          color: "#555",
          wordBreak: "break-all",
          margin: "4px 0 0",
        }}
      >
        {code}
      </p>
    </div>
  );
}

export default function InscricaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = React.use(params);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<TipoParticipante>("VISITANTE");

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<InscricaoResult | null>(null);

  useEffect(() => {
    fetch(`/api/eventos?slug=${resolvedParams.slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        const ev = Array.isArray(d) ? d[0] : d;
        if (!ev) throw new Error("not found");
        setEvento(ev);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEvento(false));
  }, [resolvedParams.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!evento) return;
    setFormState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: evento.id,
          nome,
          email,
          telefone,
          tipo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao realizar inscrição");
      setResult(data);
      setFormState("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido");
      setFormState("error");
    }
  }

  function formatTel(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  // ── Loading / not-found states ─────────────────────────────────────────────
  if (loadingEvento) {
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
            width: 40,
            height: 40,
            border: `4px solid ${GOLD}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  if (notFound || !evento) {
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
          gap: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <AlertCircle size={48} color={GOLD} />
        <h2 style={{ color: NAVY, fontSize: 22, margin: 0 }}>
          Evento não encontrado
        </h2>
        <p style={{ color: "#555", margin: 0 }}>
          Verifique o link e tente novamente.
        </p>
      </div>
    );
  }

  const vagasInfo =
    evento.vagas != null && evento.vagasDisponiveis != null
      ? `${evento.vagasDisponiveis} de ${evento.vagas} vagas disponíveis`
      : null;

  const semVagas =
    evento.vagas != null &&
    evento.vagasDisponiveis != null &&
    evento.vagasDisponiveis <= 0;

  // ── Success screen ─────────────────────────────────────────────────────────
  if (formState === "success" && result) {
    const listaEspera = result.status === "LISTA_ESPERA";
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          fontFamily: FONT,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 36,
            maxWidth: 500,
            width: "100%",
            boxShadow: "0 8px 32px rgba(26,60,110,0.12)",
            textAlign: "center",
          }}
        >
          {listaEspera ? (
            <>
              <Clock size={52} color={GOLD} style={{ marginBottom: 16 }} />
              <h2 style={{ color: NAVY, fontSize: 22, marginBottom: 8 }}>
                Você está na lista de espera
              </h2>
              <p style={{ color: "#555", fontSize: 15, marginBottom: 24 }}>
                Caso uma vaga seja liberada, você será notificado pelo e-mail{" "}
                <strong>{email}</strong>.
              </p>
              <div
                style={{
                  background: "#FFF8ED",
                  border: `1.5px solid ${GOLD}`,
                  borderRadius: 10,
                  padding: "14px 20px",
                  fontSize: 14,
                  color: "#7A5500",
                }}
              >
                <strong>Seu código de espera:</strong>
                <br />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    wordBreak: "break-all",
                  }}
                >
                  {result.qrCode}
                </span>
              </div>
            </>
          ) : (
            <>
              <CheckCircle size={52} color="#16A34A" style={{ marginBottom: 16 }} />
              <h2 style={{ color: NAVY, fontSize: 22, marginBottom: 6 }}>
                Inscrição confirmada!
              </h2>
              <p style={{ color: "#555", fontSize: 15, marginBottom: 28 }}>
                Apresente o QR Code abaixo no dia do evento.
              </p>
              <QRCodePlaceholder code={result.qrCode} />
              <p style={{ marginTop: 20, color: "#555", fontSize: 14 }}>
                Evento: <strong>{evento.titulo}</strong>
              </p>
              <p style={{ color: "#555", fontSize: 14, marginTop: 4 }}>
                Participante: <strong>{nome}</strong>
              </p>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Main inscription form ──────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px 60px",
        fontFamily: FONT,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 500, width: "100%" }}
      >
        {/* Banner placeholder */}
        <div
          style={{
            width: "100%",
            height: 160,
            borderRadius: "20px 20px 0 0",
            background: `linear-gradient(135deg, ${NAVY} 0%, #2A5BA0 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Calendar size={56} color="rgba(255,255,255,0.35)" />
        </div>

        {/* Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "0 0 20px 20px",
            padding: "28px 28px 36px",
            boxShadow: "0 8px 32px rgba(26,60,110,0.12)",
          }}
        >
          {/* Title + badges */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <h1
              style={{
                color: NAVY,
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {evento.titulo}
            </h1>
            {evento.pago && evento.valor != null && (
              <span
                style={{
                  background: GOLD,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  borderRadius: 999,
                  padding: "4px 12px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                R$ {evento.valor.toFixed(2)}
              </span>
            )}
          </div>

          {/* Meta info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
              <Calendar size={15} color={GOLD} />
              <span>{formatDate(evento.data)}</span>
            </div>
            {evento.local && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
                <MapPin size={15} color={GOLD} />
                <span>{evento.local}</span>
              </div>
            )}
            {vagasInfo && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <Users size={15} color={semVagas ? "#DC2626" : NAVY} />
                <span style={{ color: semVagas ? "#DC2626" : NAVY, fontWeight: 600 }}>
                  {vagasInfo}
                </span>
              </div>
            )}
            {evento.pago && evento.valor != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
                <Tag size={15} color={GOLD} />
                <span>
                  Valor:{" "}
                  <strong style={{ color: NAVY }}>R$ {evento.valor.toFixed(2)}</strong>
                </span>
              </div>
            )}
          </div>

          {evento.descricao && (
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {evento.descricao}
            </p>
          )}

          <hr style={{ border: "none", borderTop: "1px solid #E8E0D5", marginBottom: 24 }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ color: NAVY, fontSize: 17, fontWeight: 700, margin: 0 }}>
              Dados para inscrição
            </h2>

            {/* Nome */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 5 }}>
                Nome completo *
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} color="#999" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  required
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 36px",
                    border: "1.5px solid #DDD6CE",
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: FONT,
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#222",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 5 }}>
                E-mail *
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#999" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  required
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 36px",
                    border: "1.5px solid #DDD6CE",
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: FONT,
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#222",
                  }}
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 5 }}>
                Telefone / WhatsApp
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} color="#999" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTel(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "11px 12px 11px 36px",
                    border: "1.5px solid #DDD6CE",
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: FONT,
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#222",
                  }}
                />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 8 }}>
                Você é *
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                {(["MEMBRO", "VISITANTE"] as TipoParticipante[]).map((t) => {
                  const selected = tipo === t;
                  return (
                    <label
                      key={t}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "10px 12px",
                        border: `2px solid ${selected ? NAVY : "#DDD6CE"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        background: selected ? "#EEF2FA" : "#fff",
                        fontWeight: selected ? 700 : 400,
                        color: selected ? NAVY : "#555",
                        fontSize: 14,
                        transition: "all .2s",
                      }}
                    >
                      <input
                        type="radio"
                        name="tipo"
                        value={t}
                        checked={selected}
                        onChange={() => setTipo(t)}
                        style={{ display: "none" }}
                      />
                      {t === "MEMBRO" ? "Membro" : "Visitante"}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {formState === "error" && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #FCA5A5",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#991B1B",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertCircle size={15} />
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={formState === "loading" || semVagas === true}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: semVagas ? "#999" : NAVY,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: semVagas ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              {formState === "loading" ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={{
                    display: "inline-block",
                    width: 18,
                    height: 18,
                    border: "3px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                  }}
                />
              ) : semVagas ? (
                "Vagas esgotadas"
              ) : (
                "Confirmar inscrição"
              )}
            </motion.button>

            {semVagas && (
              <p style={{ textAlign: "center", color: "#555", fontSize: 13, margin: 0 }}>
                Não há vagas disponíveis no momento.
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
