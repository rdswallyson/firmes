"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ticket, Search, UserCheck, Clock, Link as LinkIcon, Copy, Check, Calendar } from "lucide-react";

interface Inscricao { id: string; nome: string; email: string; telefone: string | null; tipo: string; status: string; qrCode: string; checkinAt: string | null; createdAt: string; event: { title: string } }
interface EventoAberto { id: string; title: string; slug: string; date: string; status: string; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "0.3rem 0.6rem", borderRadius: 6, border: "1px solid #E5E7EB", background: copied ? "#DCFCE7" : "white", color: copied ? "#16A34A" : "#374151", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
      {copied ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
    </button>
  );
}

export default function InscricoesPage() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [eventosAbertos, setEventosAbertos] = useState<EventoAberto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/inscricoes").then(r => r.json()).then((d) => setInscricoes(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
    fetch("/api/eventos").then(r => r.json()).then((d) => {
      const evts = Array.isArray(d) ? d : d.eventos ?? [];
      setEventosAbertos(evts.filter((e: any) => e.status === "ABERTO" && e.slug));
    }).catch(() => null);
  }, []);

  const filtered = inscricoes.filter(i => i.status === "CONFIRMADO" && (
    i.nome.toLowerCase().includes(search.toLowerCase()) || i.event?.title?.toLowerCase().includes(search.toLowerCase())
  ));

  const statusBadge: Record<string, { label: string; bg: string; color: string }> = {
    MEMBRO: { label: "Membro", bg: "#DBEAFE", color: "#1D4ED8" },
    VISITANTE: { label: "Visitante", bg: "#FEF3C7", color: "#D97706" },
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.25rem" }}>Inscricoes Abertas</h1>
      <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Inscricoes confirmadas em eventos ativos</p>

      {/* Links publicos */}
      {eventosAbertos.length > 0 && (
        <div style={{ background: "white", borderRadius: "12px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <LinkIcon size={15} strokeWidth={1.5} color="#1A3C6E" />
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Links Publicos de Inscricao</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
            {eventosAbertos.map(ev => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "#FAFAFA", border: "1px solid #F3F4F6", flexShrink: 0, minWidth: 280 }}>
                <Calendar size={14} strokeWidth={1.5} color="#1A3C6E" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>{ev.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{origin}/inscricao/{ev.slug}</div>
                </div>
                <CopyButton text={`${origin}/inscricao/${ev.slug}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "350px" }}>
          <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou evento..." style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Nome", "Evento", "Tipo", "E-mail", "Telefone", "Data Inscricao"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.65rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhuma inscricao encontrada</td></tr>
            ) : filtered.map((i, idx) => {
              const badge = statusBadge[i.tipo] ?? { label: i.tipo, bg: "#F3F4F6", color: "#6B7280" };
              return (
                <motion.tr key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} style={{ borderBottom: "1px solid #F9FAFB" }}>
                  <td style={{ padding: "0.55rem 1rem", fontWeight: 500, color: "#374151" }}>{i.nome}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{i.event?.title ?? "—"}</td>
                  <td style={{ padding: "0.55rem 1rem" }}><span style={{ background: badge.bg, color: badge.color, fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>{badge.label}</span></td>
                  <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{i.email}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{i.telefone ?? "—"}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{new Date(i.createdAt).toLocaleDateString("pt-BR")}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
