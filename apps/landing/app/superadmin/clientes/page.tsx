"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Building2, Search, Filter, ArrowLeft, Eye, Power, PowerOff, Trash2, Crown, Gem, Diamond, CircleDollarSign } from "lucide-react";

const NAVY = "#1A3C6E";
const ESMERALDA = "#DC2626";

const PLANOS = ["TODOS", "FREE", "PRATA", "OURO", "DIAMANTE", "ESMERALDA_STARTER", "ESMERALDA_PRO", "ESMERALDA_PLUS", "ESMERALDA_ULTRA"];
const STATUS_FILTRO = ["TODOS", "ATIVO", "INATIVO", "TRIAL", "INADIMPLENTE"];

const PLAN_COLORS: Record<string, string> = {
  FREE: "#9CA3AF", PRATA: "#6B7280", OURO: "#C8922A", DIAMANTE: "#2563EB",
  ESMERALDA_STARTER: ESMERALDA, ESMERALDA_PRO: ESMERALDA, ESMERALDA_PLUS: ESMERALDA, ESMERALDA_ULTRA: ESMERALDA,
};

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  isWhiteLabel: boolean;
  maxChurches: number;
  subscriptionStatus?: string;
  trialEndsAt?: string;
  createdAt: string;
  _count: { members: number; churches: number; users: number };
}

export default function SuperAdminClientesPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [planoFiltro, setPlanoFiltro] = useState("TODOS");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [busca, setBusca] = useState("");

  const carregar = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (planoFiltro !== "TODOS") params.set("plano", planoFiltro);
    if (statusFiltro !== "TODOS") params.set("status", statusFiltro);
    if (busca) params.set("busca", busca);
    const r = await fetch(`/api/superadmin/tenants?${params.toString()}`);
    const d = await r.json();
    setTenants(d.tenants || []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, [planoFiltro, statusFiltro]);

  const toggleStatus = async (id: string, ativar: boolean) => {
    const r = await fetch(`/api/superadmin/tenants/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: ativar }),
    });
    if (r.ok) carregar();
    else alert("Erro ao atualizar status");
  };

  const excluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este tenant? TODOS os dados serão perdidos.")) return;
    const r = await fetch(`/api/superadmin/tenants/${id}`, { method: "DELETE" });
    if (r.ok) carregar();
    else alert("Erro ao excluir");
  };

  const logout = async () => {
    await fetch("/api/superadmin/logout", { method: "POST" });
    router.push("/superadmin");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB" }}>
      <header style={{ background: NAVY, color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={22} strokeWidth={1.5} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>FIRMES Super Admin</span>
        </div>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sair</button>
      </header>

      <div style={{ padding: "24px", maxWidth: 1400, margin: "0 auto" }}>
        <Link href="/superadmin" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 16 }}><ArrowLeft size={16} /> Dashboard</Link>
        <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "#0D2545" }}>Clientes</h1>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input type="text" placeholder="Buscar por nome ou slug..." value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={e => e.key === "Enter" && carregar()}
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none" }} />
          </div>
          <select value={planoFiltro} onChange={e => setPlanoFiltro(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", background: "#fff" }}>
            {PLANOS.map(p => <option key={p} value={p}>{p === "TODOS" ? "Todos os planos" : p.replace("_", " ")}</option>)}
          </select>
          <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", background: "#fff" }}>
            {STATUS_FILTRO.map(s => <option key={s} value={s}>{s === "TODOS" ? "Todos os status" : s}</option>)}
          </select>
          <button onClick={carregar} style={{ padding: "10px 16px", background: NAVY, color: "#fff", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Filtrar</button>
        </div>

        {/* Tabela */}
        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="responsive-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                  {["Cliente", "Plano", "Status", "Membros", "Igrejas", "Usuários", "Cadastro", "Ações"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
                ) : tenants.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum cliente encontrado.</td></tr>
                ) : tenants.map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: "1px solid #F9FAFB" }}>
                    <td data-label="Cliente" style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{t.slug}</div>
                    </td>
                    <td data-label="Plano" style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: (PLAN_COLORS[t.plan] || "#9CA3AF") + "15", color: PLAN_COLORS[t.plan] || "#9CA3AF" }}>
                        {t.plan.replace("_", " ")}
                      </span>
                    </td>
                    <td data-label="Status" style={{ padding: "12px 16px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: t.isActive ? "#DCFCE7" : "#FEE2E2", color: t.isActive ? "#16A34A" : "#DC2626" }}>
                        {t.isActive ? "Ativo" : "Inativo"}
                        {t.subscriptionStatus === "past_due" && <span style={{ marginLeft: 4, color: "#DC2626" }}>(Inad.)</span>}
                      </span>
                    </td>
                    <td data-label="Membros" style={{ padding: "12px 16px", color: "#374151" }}>{t._count.members}</td>
                    <td data-label="Igrejas" style={{ padding: "12px 16px", color: "#374151" }}>{t._count.churches}/{t.maxChurches}</td>
                    <td data-label="Usuários" style={{ padding: "12px 16px", color: "#374151" }}>{t._count.users}</td>
                    <td data-label="Cadastro" style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12, whiteSpace: "nowrap" }}>{new Date(t.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td data-label="Ações" style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/superadmin/clientes/${t.id}`} title="Ver" style={{ padding: 6, background: "#EEF2FA", color: NAVY, borderRadius: 6, display: "inline-flex" }}><Eye size={14} /></Link>
                        <button onClick={() => toggleStatus(t.id, !t.isActive)} title={t.isActive ? "Suspender" : "Ativar"}
                          style={{ padding: 6, background: t.isActive ? "#FEE2E2" : "#DCFCE7", color: t.isActive ? "#DC2626" : "#16A34A", borderRadius: 6, border: "none", cursor: "pointer", display: "inline-flex" }}>
                          {t.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                        </button>
                        <button onClick={() => excluir(t.id)} title="Excluir"
                          style={{ padding: 6, background: "#FEE2E2", color: "#DC2626", borderRadius: 6, border: "none", cursor: "pointer", display: "inline-flex" }}><Trash2 size={14} /></button>
                      </div>
                    </td>
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
