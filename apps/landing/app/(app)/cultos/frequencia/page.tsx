"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Calendar, Download } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface MembroFreq {
  nome: string;
  memberId: string;
  presencas: number;
  totalCultos: number;
  pctPresenca: number;
  cultos: { titulo: string; data: string }[];
}

export default function FrequenciaPage() {
  const [membros, setMembros] = useState<MembroFreq[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<"nome" | "presenca">("presenca");

  useEffect(() => {
    fetch("/api/cultos/frequencia").then(r => r.json()).then(d => setMembros(d.membros || [])).finally(() => setLoading(false));
  }, []);

  const filtrados = membros
    .filter(m => !busca || m.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => ordem === "presenca" ? b.pctPresenca - a.pctPresenca : a.nome.localeCompare(b.nome));

  const exportarCSV = () => {
    const csv = ["Nome,Presenças,Total Cultos,% Presença",
      ...filtrados.map(m => `${m.nome},${m.presencas},${m.totalCultos},${m.pctPresenca}%`)
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "frequencia.csv"; link.click();
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Frequência por Membro</h1>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Histórico de presença nos cultos por cada membro</p>
        </div>
        <button onClick={exportarCSV} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar membro..."
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none" }} />
        <select value={ordem} onChange={e => setOrdem(e.target.value as any)}
          style={{ padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="presenca">Ordenar por % presença</option>
          <option value="nome">Ordenar por nome</option>
        </select>
      </div>

      {/* Lista */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Calculando frequência...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
            <Users size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p>Nenhum membro encontrado</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Membro", "Presenças", "Total Cultos", "Frequência", "Detalhes"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m, i) => (
                <motion.tr key={m.nome + i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEF2FA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: NAVY }}>
                        {(m.nome?.[0] || "?").toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#0D2545", fontSize: 14 }}>{m.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: "#16A34A", fontSize: 15 }}>{m.presencas}</td>
                  <td style={{ padding: "13px 16px", color: "#6B7280", fontSize: 14 }}>{m.totalCultos}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 7, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: m.pctPresenca + "%", background: m.pctPresenca >= 75 ? "#16A34A" : m.pctPresenca >= 50 ? GOLD : "#DC2626", borderRadius: 4, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.pctPresenca >= 75 ? "#16A34A" : m.pctPresenca >= 50 ? GOLD : "#DC2626" }}>{m.pctPresenca}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: 12, color: "#9CA3AF" }}>
                    {m.cultos?.slice(0, 2).map(c => new Date(c.data).toLocaleDateString("pt-BR")).join(", ")}
                    {m.cultos?.length > 2 ? ` +${m.cultos.length - 2}` : ""}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
