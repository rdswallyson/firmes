"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Users, Phone, UserCheck, Download } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface MembroFalta {
  nome: string;
  memberId: string;
  telefone?: string;
  totalCultos: number;
  presencas: number;
  faltas: number;
  pctFaltas: number;
  ultimaPresenca: string | null;
}

export default function FaltasPage() {
  const [membros, setMembros] = useState<MembroFalta[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(50); // % faltas para considerar ausente

  useEffect(() => {
    fetch("/api/cultos/faltas").then(r => r.json()).then(d => setMembros(d.membros || [])).finally(() => setLoading(false));
  }, []);

  const filtrados = membros.filter(m => m.pctFaltas >= threshold);

  const exportarCSV = () => {
    const csv = ["Nome,Presenças,Faltas,% Faltas,Última Presença,Telefone",
      ...filtrados.map(m => `${m.nome},${m.presencas},${m.faltas},${m.pctFaltas}%,${m.ultimaPresenca ? new Date(m.ultimaPresenca).toLocaleDateString("pt-BR") : "Nunca"},${m.telefone || ""}`)
    ].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "faltas.csv"; link.click();
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Relatório de Faltas</h1>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Membros com maior índice de ausência nos cultos</p>
        </div>
        <button onClick={exportarCSV} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filtro */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
        <AlertTriangle size={16} color="#F59E0B" />
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Mostrar membros com faltas acima de:</label>
        <select value={threshold} onChange={e => setThreshold(Number(e.target.value))}
          style={{ padding: "6px 10px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff" }}>
          {[30, 40, 50, 60, 70, 80].map(v => <option key={v} value={v}>{v}%</option>)}
        </select>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{filtrados.length} membro(s) encontrado(s)</span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Membros com faltas", value: filtrados.length, icon: <AlertTriangle size={18} />, bg: "#FEF3C7", color: "#CA8A04" },
          { label: "Total membros", value: membros.length, icon: <Users size={18} />, bg: "#EEF2FA", color: NAVY },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div><div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0D2545" }}>{s.value}</div><div style={{ fontSize: 11, color: "#6B7280" }}>{s.label}</div></div>
          </motion.div>
        ))}
      </div>

      {/* Lista */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Calculando faltas...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#16A34A" }}>
            <UserCheck size={40} style={{ margin: "0 auto 12px", opacity: 0.6 }} />
            <p>Nenhum membro com faltas acima de {threshold}%! 🎉</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Membro", "Presenças", "Faltas", "% Faltas", "Última presença", "Ação"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.sort((a, b) => b.pctFaltas - a.pctFaltas).map(m => (
                <tr key={m.nome} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0D2545", fontSize: 14 }}>{m.nome}</div>
                    {m.telefone && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.telefone}</div>}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#16A34A" }}>{m.presencas}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#DC2626" }}>{m.faltas}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: m.pctFaltas + "%", background: m.pctFaltas >= 70 ? "#DC2626" : "#F59E0B", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.pctFaltas >= 70 ? "#DC2626" : "#CA8A04" }}>{m.pctFaltas}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>
                    {m.ultimaPresenca ? new Date(m.ultimaPresenca).toLocaleDateString("pt-BR") : <span style={{ color: "#DC2626" }}>Nunca</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {m.telefone && (
                      <a href={`https://wa.me/55${m.telefone.replace(/\D/g, "")}`} target="_blank"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#DCFCE7", color: "#16A34A", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                        <Phone size={12} /> Contatar
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
