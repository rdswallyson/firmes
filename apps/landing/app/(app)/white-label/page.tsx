"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2, Users, CreditCard, Palette, AlertTriangle,
  Plus, ChevronRight, Crown, CheckCircle, XCircle, Clock,
} from "lucide-react";
import Link from "next/link";
import { EmeraldIcon } from "../../components/EmeraldIcon";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const ESMERALDA = "#DC2626";

interface Church {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  subscriptionStatus?: string;
  trialEndsAt?: string;
  _count?: { members: number; users: number };
}

interface Tenant {
  id: string;
  name: string;
  plan: string;
  maxChurches: number;
  isWhiteLabel: boolean;
}

export default function WhiteLabelPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isReseller, setIsReseller] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(data => {
      setTenant(data.tenant);
      setChurches(data.churches || []);
      setTotalMembers(data.totalMembers || 0);
      setIsReseller(data.isReseller);
    }).finally(() => setLoading(false));
  }, []);

  const isEmerald = tenant?.plan?.includes("ESMERALDA");
  const currentCount = churches.length;
  const limitReached = currentCount >= (tenant?.maxChurches || 1);

  const planBadge = (plan: string) => {
    const p = plan.toLowerCase();
    if (p.includes("esmeralda")) return { bg: ESMERALDA, color: "#fff", label: plan.replace("_", " ") };
    if (p === "diamante") return { bg: "#3B82F6", color: "#fff", label: "Diamante" };
    if (p === "ouro") return { bg: GOLD, color: "#fff", label: "Ouro" };
    if (p === "prata") return { bg: "#9CA3AF", color: "#fff", label: "Prata" };
    return { bg: "#F3F4F6", color: "#374151", label: "Gratuito" };
  };

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>White Label Esmeralda</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie suas igrejas e personalize sua marca</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <Building2 size={18} />, label: "Igrejas", value: `${currentCount}/${tenant?.maxChurches || 1}`, bg: isEmerald ? `${ESMERALDA}15` : "#EEF2FA", color: isEmerald ? ESMERALDA : NAVY },
          { icon: <Users size={18} />, label: "Total membros", value: totalMembers, bg: "#DCFCE7", color: "#16A34A" },
          { icon: <Crown size={18} />, label: "Seu plano", value: tenant?.plan?.replace("_", " ") || "FREE", bg: isEmerald ? `${ESMERALDA}15` : "#FEF3C7", color: isEmerald ? ESMERALDA : GOLD },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: "#fff", borderRadius: 12, padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ color: "#6B7280", fontSize: 11, fontWeight: 500 }}>{s.label}</div>
              <div style={{ color: "#111827", fontSize: "1.1rem", fontWeight: 700, textTransform: "capitalize" }}>{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert limit */}
      {limitReached && isReseller && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#FEF3C7", borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, border: `1px solid #F59E0B` }}>
          <AlertTriangle size={20} color="#CA8A04" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: "#92400E", fontSize: 14 }}>Limite de igrejas atingido</div>
            <div style={{ color: "#B45309", fontSize: 13 }}>Faça upgrade do plano para adicionar mais igrejas</div>
          </div>
          <Link href="/white-label/planos" style={{ padding: "8px 14px", background: GOLD, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Ver planos</Link>
        </motion.div>
      )}

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Link href="/white-label/igrejas" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ y: -2 }} style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", border: "1.5px solid transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = NAVY; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EEF2FA", display: "flex", alignItems: "center", justifyContent: "center", color: NAVY }}><Building2 size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0D2545", fontSize: 15 }}>Minhas Igrejas</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>{currentCount} igreja{currentCount !== 1 ? "s" : ""}</div>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </motion.div>
        </Link>

        <Link href="/white-label/personalizar" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ y: -2 }} style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", border: "1.5px solid transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = GOLD; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#FFF8EE", display: "flex", alignItems: "center", justifyContent: "center", color: GOLD }}><Palette size={22} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0D2545", fontSize: 15 }}>Personalizar Marca</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>Logo, cores, dominio</div>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </motion.div>
        </Link>

        <Link href="/white-label/planos" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ y: -2 }} style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", border: "1.5px solid transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isEmerald ? ESMERALDA : GOLD; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: isEmerald ? `${ESMERALDA}15` : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: isEmerald ? ESMERALDA : GOLD }}>
              {isEmerald ? <EmeraldIcon size={22} /> : <CreditCard size={22} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0D2545", fontSize: 15 }}>Faturamento</div>
              <div style={{ color: "#6B7280", fontSize: 12 }}>Planos e pagamentos</div>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </motion.div>
        </Link>
      </div>

      {/* Church List */}
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Igrejas</h2>
          {isReseller && !limitReached && (
            <Link href="/white-label/igrejas/nova" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <Plus size={14} /> Nova igreja
            </Link>
          )}
        </div>

        {churches.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
            <Building2 size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p>Nenhuma igreja cadastrada</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Nome", "Plano", "Membros", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {churches.map((church, i) => {
                const badge = planBadge(church.plan);
                return (
                  <tr key={church.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <Link href={`/white-label/igrejas/${church.id}`} style={{ fontWeight: 600, color: "#0D2545", textDecoration: "none" }}>{church.name}</Link>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>{church.slug}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "capitalize" }}>{badge.label}</span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#6B7280", fontSize: 13 }}>{church._count?.members || 0}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {church.isActive ? (
                        <span style={{ color: "#16A34A", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={14} /> Ativa</span>
                      ) : church.subscriptionStatus === "trialing" ? (
                        <span style={{ color: "#CA8A04", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> Trial</span>
                      ) : (
                        <span style={{ color: "#DC2626", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><XCircle size={14} /> Suspensa</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link href={`/white-label/igrejas/${church.id}`} style={{ color: NAVY, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Gerenciar</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
