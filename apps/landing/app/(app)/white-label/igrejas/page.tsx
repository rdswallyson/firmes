"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2, Plus, Search, ChevronRight, CheckCircle, XCircle, Clock, Crown,
} from "lucide-react";
import Link from "next/link";
import { EmeraldIcon } from "../../../components/EmeraldIcon";

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

export default function IgrejasPage() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(data => {
      setChurches(data.churches || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = churches.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const planBadge = (plan: string) => {
    const p = plan.toLowerCase();
    if (p.includes("esmeralda")) return { bg: ESMERALDA, color: "#fff", label: plan.replace("_", " ") };
    if (p === "diamante") return { bg: "#3B82F6", color: "#fff", label: "Diamante" };
    if (p === "ouro") return { bg: GOLD, color: "#fff", label: "Ouro" };
    if (p === "prata") return { bg: "#9CA3AF", color: "#fff", label: "Prata" };
    return { bg: "#F3F4F6", color: "#374151", label: "Gratuito" };
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Minhas Igrejas</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie todas as igrejas da sua rede</p>
        </div>
        <Link href="/white-label/igrejas/nova" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <Plus size={16} /> Nova igreja
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#9CA3AF" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou slug..."
          style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none" }} />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", background: "#fff", borderRadius: 14 }}>
          <Building2 size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p>Nenhuma igreja encontrada</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map((church, i) => {
            const badge = planBadge(church.plan);
            const isEmerald = church.plan.toLowerCase().includes("esmeralda");
            return (
              <motion.div key={church.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/white-label/igrejas/${church.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 0.15s, box-shadow 0.15s", cursor: "pointer", border: "1.5px solid transparent" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLDivElement).style.borderColor = isEmerald ? ESMERALDA : NAVY; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${NAVY}, ${GOLD})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={22} color="#fff" />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0D2545" }}>{church.name}</h3>
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{church.slug}</span>
                        </div>
                      </div>
                      <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, textTransform: "capitalize", display: "flex", alignItems: "center", gap: 3 }}>
                        {isEmerald && <EmeraldIcon size={12} />} {badge.label}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                      <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>{church._count?.members || 0}</div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>Membros</div>
                      </div>
                      <div style={{ background: "#F9FAFB", borderRadius: 8, padding: 10, textAlign: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: church.isActive ? "#16A34A" : "#DC2626" }}>
                          {church.isActive ? <><CheckCircle size={14} style={{ marginRight: 4 }} /> Ativa</> : <><XCircle size={14} style={{ marginRight: 4 }} /> Suspensa</>}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>Status</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
