"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle, Users } from "lucide-react";

const NAVY = "#1A3C6E";

interface Metric {
  id: string;
  name: string;
  plan: string;
  isActive: boolean;
  score: number;
  status: string;
  statusColor: string;
  members: number;
  checkins: number;
  events: number;
  cultos: number;
  recentCheckins: number;
  recentEvents: number;
  recentCultos: number;
  recentFinances: number;
}

export default function MetricasPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/superadmin/metricas")
      .then(r => r.json())
      .then(d => {
        if (d.error) router.push("/superadmin");
        else setMetrics(d.metrics || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/superadmin/logout", { method: "POST" });
    router.push("/superadmin");
  };

  const exportCSV = () => {
    const headers = ["Nome", "Plano", "Score", "Status", "Membros", "Check-ins 30d", "Eventos 30d", "Cultos 30d", "Financas 30d"];
    const rows = metrics.map(m => [m.name, m.plan, m.score, m.status, m.members, m.recentCheckins, m.recentEvents, m.recentCultos, m.recentFinances]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metricas-firmes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB" }}>
      <header style={{ background: NAVY, color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={22} strokeWidth={1.5} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>FIRMES Super Admin</span>
        </div>
        <button onClick={logout} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sair</button>
      </header>

      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        <Link href="/superadmin" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 16 }}><ArrowLeft size={16} /> Dashboard</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0D2545" }}>Metricas de Engajamento</h1>
          <button onClick={exportCSV} style={{ padding: "8px 16px", background: NAVY, color: "#fff", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Exportar CSV</button>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                  {["Cliente", "Score", "Status", "Membros", "Check-ins 30d", "Eventos 30d", "Cultos 30d", "Financas 30d"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: "1px solid #F9FAFB" }}>
                    <td data-label="Cliente" style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.plan.replace("_", " ")}</div>
                    </td>
                    <td data-label="Score" style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: m.statusColor + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: m.statusColor }}>
                          {m.score}
                        </div>
                      </div>
                    </td>
                    <td data-label="Status" style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: m.statusColor + "15", color: m.statusColor }}>
                        {m.status}
                      </span>
                    </td>
                    <td data-label="Membros" style={{ padding: "12px 16px", color: "#374151" }}>{m.members}</td>
                    <td data-label="Check-ins 30d" style={{ padding: "12px 16px", color: "#374151" }}>{m.recentCheckins}</td>
                    <td data-label="Eventos 30d" style={{ padding: "12px 16px", color: "#374151" }}>{m.recentEvents}</td>
                    <td data-label="Cultos 30d" style={{ padding: "12px 16px", color: "#374151" }}>{m.recentCultos}</td>
                    <td data-label="Financas 30d" style={{ padding: "12px 16px", color: "#374151" }}>{m.recentFinances}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
