"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Users, Church, UserCheck, CalendarDays, Power, PowerOff, Trash2, Gem } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const ESMERALDA = "#DC2626";

const PLANOS = ["FREE", "PRATA", "OURO", "DIAMANTE", "ESMERALDA_STARTER", "ESMERALDA_PRO", "ESMERALDA_PLUS", "ESMERALDA_ULTRA"];
const PLAN_COLORS: Record<string, string> = {
  FREE: "#9CA3AF", PRATA: "#6B7280", OURO: GOLD, DIAMANTE: "#2563EB",
  ESMERALDA_STARTER: ESMERALDA, ESMERALDA_PRO: ESMERALDA, ESMERALDA_PLUS: ESMERALDA, ESMERALDA_ULTRA: ESMERALDA,
};

const TABS = ["Geral", "Uso do Sistema", "Esmeralda", "Usuarios"];

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  isWhiteLabel: boolean;
  maxChurches: number;
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: string;
  createdAt: string;
  customName?: string;
  customDomain?: string;
  members: { id: string; name: string; status: string; createdAt: string }[];
  users: { id: string; name: string; email: string; role: string }[];
  churches: { id: string; name: string; isActive: boolean }[];
  cultos: { id: string; titulo: string; data: string }[];
  events: { id: string; title: string; date: string }[];
  _count: { members: number; churches: number; users: number; cultos: number; events: number; checkins: number };
}

export default function ClienteDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState("Geral");
  const [editPlan, setEditPlan] = useState(false);
  const [newPlan, setNewPlan] = useState("");
  const [editMax, setEditMax] = useState(false);
  const [newMax, setNewMax] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/superadmin/tenants/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) router.push("/superadmin/clientes");
        else {
          setTenant(d.tenant);
          setNewPlan(d.tenant.plan);
          setNewMax(d.tenant.maxChurches);
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const atualizar = async (data: any) => {
    const r = await fetch(`/api/superadmin/tenants/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (r.ok) {
      const d = await r.json();
      setTenant(prev => prev ? { ...prev, ...d.tenant } : null);
    }
  };

  const excluir = async () => {
    if (!confirm("Tem certeza? TODOS os dados serao perdidos permanentemente.")) return;
    const r = await fetch(`/api/superadmin/tenants/${id}`, { method: "DELETE" });
    if (r.ok) router.push("/superadmin/clientes");
  };

  const logout = async () => {
    await fetch("/api/superadmin/logout", { method: "POST" });
    router.push("/superadmin");
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!tenant) return null;

  const color = PLAN_COLORS[tenant.plan] || "#9CA3AF";

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB" }}>
      <header style={{ background: NAVY, color: "#fff", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={22} strokeWidth={1.5} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>FIRMES Super Admin</span>
        </div>
        <button onClick={logout} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Sair</button>
      </header>

      <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/superadmin/clientes" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 16 }}><ArrowLeft size={16} /> Voltar</Link>

        <div style={{ background: "#fff", borderRadius: 14, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0D2545" }}>{tenant.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: color + "15", color }}>
                  {tenant.plan.replace("_", " ")}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: tenant.isActive ? "#DCFCE7" : "#FEE2E2", color: tenant.isActive ? "#16A34A" : "#DC2626" }}>
                  {tenant.isActive ? "Ativo" : "Inativo"}
                </span>
                {tenant.isWhiteLabel && <span style={{ fontSize: 11, fontWeight: 700, color: ESMERALDA }}>Revendedor</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => atualizar({ isActive: !tenant.isActive })}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: tenant.isActive ? "#FEE2E2" : "#DCFCE7", color: tenant.isActive ? "#DC2626" : "#16A34A", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {tenant.isActive ? <><PowerOff size={14} /> Suspender</> : <><Power size={14} /> Ativar</>}
              </button>
              <button onClick={excluir}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#DC2626", color: "#fff", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Membros", value: tenant._count.members, icon: Users },
            { label: "Igrejas", value: tenant._count.churches, icon: Church },
            { label: "Usuarios", value: tenant._count.users, icon: UserCheck },
            { label: "Cultos", value: tenant._count.cultos, icon: CalendarDays },
            { label: "Eventos", value: tenant._count.events, icon: CalendarDays },
            { label: "Check-ins", value: tenant._count.checkins, icon: UserCheck },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
              <c.icon size={18} style={{ color: NAVY, marginBottom: 6 }} strokeWidth={1.5} />
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0D2545" }}>{c.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>{c.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #E5E7EB", paddingBottom: 8 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setAba(t)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: aba === t ? NAVY : "transparent", color: aba === t ? "#fff" : "#6B7280" }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {aba === "Geral" && (
            <div style={{ display: "grid", gap: 14 }}>
              <div><strong style={{ color: "#6B7280", fontSize: 12 }}>SLUG:</strong> <span style={{ fontSize: 14 }}>{tenant.slug}</span></div>
              <div><strong style={{ color: "#6B7280", fontSize: 12 }}>CADASTRADO EM:</strong> <span style={{ fontSize: 14 }}>{new Date(tenant.createdAt).toLocaleDateString("pt-BR")}</span></div>
              <div><strong style={{ color: "#6B7280", fontSize: 12 }}>STRIPE CUSTOMER:</strong> <span style={{ fontSize: 14 }}>{tenant.stripeCustomerId || "—"}</span></div>
              <div><strong style={{ color: "#6B7280", fontSize: 12 }}>SUBSCRIPTION:</strong> <span style={{ fontSize: 14 }}>{tenant.stripeSubscriptionId || "—"}</span></div>
              <div><strong style={{ color: "#6B7280", fontSize: 12 }}>STATUS SUB:</strong> <span style={{ fontSize: 14 }}>{tenant.subscriptionStatus || "—"}</span></div>
              {tenant.trialEndsAt && <div><strong style={{ color: "#6B7280", fontSize: 12 }}>TRIAL ATE:</strong> <span style={{ fontSize: 14 }}>{new Date(tenant.trialEndsAt).toLocaleDateString("pt-BR")}</span></div>}
              {tenant.customName && <div><strong style={{ color: "#6B7280", fontSize: 12 }}>NOME PERSONALIZADO:</strong> <span style={{ fontSize: 14 }}>{tenant.customName}</span></div>}
              {tenant.customDomain && <div><strong style={{ color: "#6B7280", fontSize: 12 }}>DOMINIO:</strong> <span style={{ fontSize: 14 }}>{tenant.customDomain}</span></div>}

              <div style={{ marginTop: 10, paddingTop: 14, borderTop: "1px solid #F3F4F6", display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!editPlan ? (
                  <button onClick={() => setEditPlan(true)} style={{ padding: "8px 14px", background: "#EEF2FA", color: NAVY, borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Alterar Plano</button>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13 }}>
                      {PLANOS.map(p => <option key={p} value={p}>{p.replace("_", " ")}</option>)}
                    </select>
                    <button onClick={() => { atualizar({ plan: newPlan }); setEditPlan(false); }} style={{ padding: "8px 14px", background: "#16A34A", color: "#fff", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                    <button onClick={() => setEditPlan(false)} style={{ padding: "8px 14px", background: "#F3F4F6", color: "#374151", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                )}

                {tenant.isWhiteLabel && (!editMax ? (
                  <button onClick={() => setEditMax(true)} style={{ padding: "8px 14px", background: "#FEE2E2", color: "#DC2626", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Alterar Limite</button>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="number" value={newMax} onChange={e => setNewMax(Number(e.target.value))} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 13, width: 80 }} />
                    <button onClick={() => { atualizar({ maxChurches: newMax }); setEditMax(false); }} style={{ padding: "8px 14px", background: "#16A34A", color: "#fff", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Salvar</button>
                    <button onClick={() => setEditMax(false)} style={{ padding: "8px 14px", background: "#F3F4F6", color: "#374151", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aba === "Uso do Sistema" && (
            <div>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Ultimos cultos</h3>
              {tenant.cultos.length === 0 ? <p style={{ color: "#9CA3AF" }}>Nenhum culto.</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {tenant.cultos.slice(0, 5).map(c => (
                    <div key={c.id} style={{ padding: "10px 12px", background: "#FAFAFA", borderRadius: 8, fontSize: 13 }}>
                      <strong>{c.titulo}</strong> — {new Date(c.data).toLocaleDateString("pt-BR")}
                    </div>
                  ))}
                </div>
              )}

              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Ultimos eventos</h3>
              {tenant.events.length === 0 ? <p style={{ color: "#9CA3AF" }}>Nenhum evento.</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tenant.events.slice(0, 5).map(ev => (
                    <div key={ev.id} style={{ padding: "10px 12px", background: "#FAFAFA", borderRadius: 8, fontSize: 13 }}>
                      <strong>{ev.title}</strong> — {new Date(ev.date).toLocaleDateString("pt-BR")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {aba === "Esmeralda" && (
            <div>
              {!tenant.isWhiteLabel ? (
                <div style={{ textAlign: "center", padding: 30, color: "#9CA3AF" }}>Este tenant nao e um revendedor Esmeralda.</div>
              ) : (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <strong>Igrejas criadas:</strong> {tenant._count.churches} / {tenant.maxChurches === 999 ? "Ilimitado" : tenant.maxChurches}
                  </div>
                  {tenant.churches.length === 0 ? <p style={{ color: "#9CA3AF" }}>Nenhuma igreja vinculada.</p> : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {tenant.churches.map(ig => (
                        <div key={ig.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#FAFAFA", borderRadius: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{ig.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: ig.isActive ? "#DCFCE7" : "#FEE2E2", color: ig.isActive ? "#16A34A" : "#DC2626" }}>{ig.isActive ? "Ativa" : "Suspensa"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {aba === "Usuarios" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tenant.users.map(u => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#FAFAFA", borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{u.email}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#EEF2FA", color: NAVY }}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
