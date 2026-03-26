"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

interface Recibo { id: string; reciboNum: string; memberName: string; amount: number; category: string; date: string; }

export default function RecibosPage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/financeiro?limit=1000&type=RECEITA");
        const d = await res.json();
        const finances = d.finances ?? [];
        const filtered = finances
          .filter((f: Recibo & { type: string; reciboNum: string | null }) => f.reciboNum && (f.category === "DIZIMO" || f.category === "OFERTA"))
          .map((f: Recibo & { type: string }) => ({ id: f.id, reciboNum: f.reciboNum, memberName: f.memberName ?? "—", amount: f.amount, category: f.category, date: f.date }));
        setRecibos(filtered);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  async function downloadRecibo(id: string, num: string) {
    const res = await fetch(`/api/financeiro/${id}/recibo`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `recibo-${num}.json`; a.click();
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.25rem" }}>Recibos Emitidos</h1>
      <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Recibos de dízimos e ofertas</p>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Nº Recibo", "Membro", "Tipo", "Valor", "Data", "Ação"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.65rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : recibos.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>
                <FileText size={32} strokeWidth={1.5} color="#D1D5DB" style={{ marginBottom: "0.5rem" }} />
                <div>Nenhum recibo emitido</div>
              </td></tr>
            ) : recibos.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                style={{ borderBottom: "1px solid #F9FAFB" }}>
                <td style={{ padding: "0.55rem 1rem", fontWeight: 600, color: "#1A3C6E", fontFamily: "monospace", fontSize: "0.8rem" }}>{r.reciboNum}</td>
                <td style={{ padding: "0.55rem 1rem", color: "#374151" }}>{r.memberName}</td>
                <td style={{ padding: "0.55rem 1rem" }}>
                  <span style={{ background: "#EFF6FF", color: "#1A3C6E", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>
                    {r.category === "DIZIMO" ? "Dízimo" : "Oferta"}
                  </span>
                </td>
                <td style={{ padding: "0.55rem 1rem", fontWeight: 600, color: "#16A34A" }}>{fmt(r.amount)}</td>
                <td style={{ padding: "0.55rem 1rem", color: "#6B7280" }}>{new Date(r.date).toLocaleDateString("pt-BR")}</td>
                <td style={{ padding: "0.55rem 1rem" }}>
                  <button onClick={() => downloadRecibo(r.id, r.reciboNum)}
                    style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#1A3C6E", fontSize: "0.75rem" }}>
                    <Download size={13} strokeWidth={1.5} /> Baixar
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
