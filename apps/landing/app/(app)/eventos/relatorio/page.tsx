"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Evento { id: string; title: string; date: string; status: string; _count?: { inscricoes: number } }

export default function EventosRelatorioPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/eventos").then(r => r.json()).then((d) => setEventos(Array.isArray(d) ? d : d.eventos ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = eventos.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
        <BarChart3 size={22} strokeWidth={1.5} color="#1A3C6E" />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Relatórios de Eventos</h1>
      </div>
      <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Selecione um evento para ver o relatório pós-evento</p>

      <div style={{ position: "relative", maxWidth: "350px", marginBottom: "1.25rem" }}>
        <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar evento..." style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Evento", "Data", "Inscritos", "Status", "Ação"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.65rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum evento encontrado</td></tr>
            ) : filtered.map((ev, i) => (
              <motion.tr key={ev.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ borderBottom: "1px solid #F9FAFB" }}>
                <td style={{ padding: "0.55rem 1rem", fontWeight: 500, color: "#374151" }}>{ev.title}</td>
                <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{new Date(ev.date).toLocaleDateString("pt-BR")}</td>
                <td style={{ padding: "0.55rem 1rem", color: "#374151", fontWeight: 600 }}>{ev._count?.inscricoes ?? 0}</td>
                <td style={{ padding: "0.55rem 1rem" }}>
                  <span style={{ background: ev.status === "ABERTO" ? "#DCFCE7" : ev.status === "LOTADO" ? "#FEF3C7" : "#F3F4F6", color: ev.status === "ABERTO" ? "#16A34A" : ev.status === "LOTADO" ? "#D97706" : "#6B7280", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>{ev.status}</span>
                </td>
                <td style={{ padding: "0.55rem 1rem" }}>
                  <button onClick={() => router.push(`/eventos/${ev.id}/relatorio`)} style={{ background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>Ver Relatório</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
