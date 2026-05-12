"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Users, Building2, Church, UserCheck, CalendarDays, TrendingUp, AlertTriangle, Clock, LogOut, Crown, Gem, Diamond, CircleDollarSign } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const ESMERALDA = "#DC2626";

interface DashboardData {
  stats: {
    totalTenants: number;
    activeTenants: number;
    totalMembers: number;
    totalCultos: number;
    totalCheckins: number;
    totalEventos: number;
    inadimplentes: number;
    trialVencendo: number;
  };
  tenantsByPlan: { plan: string; _count: { plan: number } }[];
  emeraldAlerts: { id: string; name: string; plan: string; current: number; limit: number }[];
  inactiveTenants: { id: string; name: string; plan: string; createdAt: string }[];
}

const PLAN_ICONS: Record<string, any> = {
  FREE: CircleDollarSign,
  PRATA: Crown,
  OURO: Crown,
  DIAMANTE: Diamond,
  ESMERALDA_STARTER: Gem,
  ESMERALDA_PRO: Gem,
  ESMERALDA_PLUS: Gem,
  ESMERALDA_ULTRA: Gem,
};

const PLAN_COLORS: Record<string, string> = {
  FREE: "#9CA3AF",
  PRATA: "#6B7280",
  OURO: GOLD,
  DIAMANTE: "#2563EB",
  ESMERALDA_STARTER: ESMERALDA,
  ESMERALDA_PRO: ESMERALDA,
  ESMERALDA_PLUS: ESMERALDA,
  ESMERALDA_ULTRA: ESMERALDA,
};

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/superadmin/dashboard")
      .then(r => r.json())
      .then(d => {
        if (d.error) router.push("/superadmin");
        else setData(d);
      })
      .catch(() => router.push("/superadmin"))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/superadmin/logout", { method: "POST" });
    router.push("/superadmin");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB" }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${NAVY}20`, borderTopColor: NAVY, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!data) return null;

  const s = data.stats;

  const statCards = [
    { label: "Total Clientes", value: s.totalTenants, icon: Building2, color: NAVY },
    { label: "Clientes Ativos", value: s.activeTenants, icon: TrendingUp, color: "#16A34A" },
    { label: "Total Membros", value: s.totalMembers, icon: Users, color: "#7C3AED" },
    { label: "Total Check-ins", value: s.totalCheckins, icon: UserCheck, color: GOLD },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB" }}>
      {/* Header */}
      <header style={{ background: NAVY, color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={22} strokeWidth={1.5} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>FIRMES Super Admin</span>
        </div>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <LogOut size={14} /> Sair
        </button>
      </header>

      <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: card.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                  <card.icon size={18} strokeWidth={1.5} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF" }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0D2545" }}>{card.value.toLocaleString("pt-BR")}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {/* Planos */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0D2545" }}>Clientes por Plano</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.tenantsByPlan.map(t => {
                const Icon = PLAN_ICONS[t.plan] || CircleDollarSign;
                const color = PLAN_COLORS[t.plan] || "#9CA3AF";
                return (
                  <div key={t.plan} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "#FAFAFA" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon size={16} style={{ color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{t.plan.replace("_", " ")}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color }}>{t._count.plan}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0D2545", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={16} style={{ color: "#DC2626" }} /> Alertas
            </h2>

            {s.inadimplentes > 0 && (
              <div style={{ background: "#FEE2E2", borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={14} style={{ color: "#DC2626", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#991B1B" }}>{s.inadimplentes} tenant(s) inadimplente(s)</span>
              </div>
            )}

            {s.trialVencendo > 0 && (
              <div style={{ background: "#FEF9C3", borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={14} style={{ color: "#CA8A04", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#854D0E" }}>{s.trialVencendo} trial(s) vencendo em 7 dias</span>
              </div>
            )}

            {data.emeraldAlerts.length > 0 && data.emeraldAlerts.map(ea => (
              <div key={ea.id} style={{ background: "#FEE2E2", borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <Gem size={14} style={{ color: ESMERALDA, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#991B1B" }}>{ea.name}: {ea.current}/{ea.limit} igrejas — sugerir upgrade</span>
              </div>
            ))}

            {s.inadimplentes === 0 && s.trialVencendo === 0 && data.emeraldAlerts.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF", fontSize: 13 }}>Nenhum alerta no momento.</div>
            )}
          </div>

          {/* Inativos */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0D2545" }}>Inativos (30+ dias sem culto)</h2>
            {data.inactiveTenants.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF", fontSize: 13 }}>Nenhum tenant inativo.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.inactiveTenants.map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "#FAFAFA" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{t.plan} • desde {new Date(t.createdAt).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <Link href={`/superadmin/clientes/${t.id}`} style={{ fontSize: 12, fontWeight: 600, color: NAVY, textDecoration: "none" }}>Ver →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navegação rápida */}
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/superadmin/clientes" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            <Building2 size={16} /> Gerenciar Clientes
          </Link>
          <Link href="/superadmin/financeiro" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#fff", color: NAVY, borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", border: "1px solid #E5E7EB" }}>
            <CircleDollarSign size={16} /> Financeiro
          </Link>
          <Link href="/superadmin/relatorios" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#fff", color: NAVY, borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", border: "1px solid #E5E7EB" }}>
            <TrendingUp size={16} /> Relatórios
          </Link>
        </div>
      </div>
    </div>
  );
}
