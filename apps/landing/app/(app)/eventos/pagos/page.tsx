"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Evento { id: string; title: string; date: string; valor: number | null; isGratuito: boolean; status: string; _count?: { inscricoes: number } }

export default function EventosPagosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/eventos").then(r => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : d.eventos ?? [];
      setEventos(list.filter((e: Evento) => !e.isGratuito));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = eventos.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
        <DollarSign size={22} strokeWidth={1.5} color="#C8922A" />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Eventos Pagos</h1>
      </div>
      <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Eventos com valor de inscrição</p>

      <div style={{ position: "relative", maxWidth: "350px", marginBottom: "1.25rem" }}>
        <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Evento", "Data", "Valor", "Inscritos", "Receita Est.", "Status", "Ações"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.65rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum evento pago encontrado</td></tr>
            ) : filtered.map((ev, i) => {
              const inscritos = ev._count?.inscricoes ?? 0;
              const receita = (ev.valor ?? 0) * inscritos;
              return (
                <motion.tr key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ borderBottom: "1px solid #F9FAFB" }}>
                  <td style={{ padding: "0.55rem 1rem", fontWeight: 500, color: "#374151" }}>{ev.title}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{new Date(ev.date).toLocaleDateString("pt-BR")}</td>
                  <td style={{ padding: "0.55rem 1rem", fontWeight: 600, color: "#C8922A" }}>{ev.valor ? fmt(ev.valor) : "—"}</td>
                  <td style={{ padding: "0.55rem 1rem", color: "#374151" }}>{inscritos}</td>
                  <td style={{ padding: "0.55rem 1rem", fontWeight: 600, color: "#16A34A" }}>{fmt(receita)}</td>
                  <td style={{ padding: "0.55rem 1rem" }}>
                    <span style={{ background: ev.status === "ABERTO" ? "#DCFCE7" : "#F3F4F6", color: ev.status === "ABERTO" ? "#16A34A" : "#6B7280", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>{ev.status}</span>
                  </td>
                  <td style={{ padding: "0.55rem 1rem" }}>
                    <button onClick={() => router.push(`/eventos/${ev.id}/relatorio`)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "3px 8px", cursor: "pointer", color: "#1A3C6E", fontSize: "0.75rem" }}>Relatório</button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
