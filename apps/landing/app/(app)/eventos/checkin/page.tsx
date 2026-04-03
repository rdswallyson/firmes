"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScanLine, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Evento { id: string; title: string; date: string; status: string; _count?: { inscricoes: number } }

export default function EventosCheckinPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/eventos").then(r => r.json()).then((d) => setEventos(Array.isArray(d) ? d : d.eventos ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = eventos.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const statusBadge: Record<string, { label: string; bg: string; color: string }> = {
    ABERTO: { label: "Aberto", bg: "#DCFCE7", color: "#16A34A" },
    LOTADO: { label: "Lotado", bg: "#FEF3C7", color: "#D97706" },
    ENCERRADO: { label: "Encerrado", bg: "#F3F4F6", color: "#6B7280" },
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
        <ScanLine size={22} strokeWidth={1.5} color="#1A3C6E" />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Check-in de Eventos</h1>
      </div>
      <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Selecione um evento para iniciar o check-in</p>

      <div style={{ position: "relative", maxWidth: "350px", marginBottom: "1.25rem" }}>
        <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar evento..." style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {loading ? <div style={{ color: "#9CA3AF" }}>Carregando...</div> : filtered.length === 0 ? <div style={{ color: "#9CA3AF" }}>Nenhum evento encontrado</div> : filtered.map((ev, i) => {
          const badge = statusBadge[ev.status] ?? { label: ev.status, bg: "#F3F4F6", color: "#6B7280" };
          return (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              onClick={() => router.push(`/eventos/${ev.id}/checkin`)}
              style={{ background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer", transition: "box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>{ev.title}</h3>
                <span style={{ background: badge.bg, color: badge.color, fontSize: "0.68rem", fontWeight: 600, borderRadius: "10px", padding: "2px 7px" }}>{badge.label}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>{new Date(ev.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              {ev._count && <div style={{ fontSize: "0.8rem", color: "#1A3C6E", fontWeight: 600, marginTop: "0.4rem" }}>{ev._count.inscricoes} inscritos</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
