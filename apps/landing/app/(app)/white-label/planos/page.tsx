"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Crown, Sparkles } from "lucide-react";
import { EmeraldIcon } from "../../../components/EmeraldIcon";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const ESMERALDA = "#DC2626";

const PLANOS = [
  { id: "FREE", nome: "Gratuito", valor: 0, maxChurches: 1, color: "#F3F4F6", textColor: "#374151", features: ["1 igreja", "Membros ilimitados", "Financeiro basico"] },
  { id: "PRATA", nome: "Prata", valor: 49, maxChurches: 1, color: "#9CA3AF", textColor: "#fff", features: ["1 igreja", "Financeiro completo", "Relatorios PDF"] },
  { id: "OURO", nome: "Ouro", valor: 99, maxChurches: 1, color: GOLD, textColor: "#fff", features: ["1 igreja", "PDV completo", "Certificados", "Prioridade no suporte"] },
  { id: "DIAMANTE", nome: "Diamante", valor: 199, maxChurches: 1, color: "#3B82F6", textColor: "#fff", features: ["1 igreja", "API aberta", "Webhooks", "Suporte VIP"] },
  { id: "ESMERALDA_STARTER", nome: "Esmeralda Starter", valor: 149, maxChurches: 5, color: ESMERALDA, textColor: "#fff", isEmerald: true, features: ["5 igrejas", "White label", "Dominio personalizado", "Marca propria"] },
  { id: "ESMERALDA_PRO", nome: "Esmeralda Pro", valor: 249, maxChurches: 15, color: ESMERALDA, textColor: "#fff", isEmerald: true, features: ["15 igrejas", "Tudo do Starter", "Relatorios consolidados", "Suporte prioritario"] },
  { id: "ESMERALDA_PLUS", nome: "Esmeralda Plus", valor: 399, maxChurches: 25, color: ESMERALDA, textColor: "#fff", isEmerald: true, features: ["25 igrejas", "Tudo do Pro", "Onboarding dedicado", "Gerente de conta"] },
  { id: "ESMERALDA_ULTRA", nome: "Esmeralda Ultra", valor: 599, maxChurches: 999, color: ESMERALDA, textColor: "#fff", isEmerald: true, popular: true, features: ["Igrejas ilimitadas", "Tudo do Plus", "SLA garantido", "Treinamento presencial"] },
];

export default function PlanosPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(data => {
      setTenant(data.tenant);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(planId: string) {
    if (!tenant) return;
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, tenantId: tenant.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao processar");
      }
    } catch { alert("Erro de conexao"); }
    finally { setCheckoutLoading(null); }
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0D2545", margin: "0 0 8px" }}>Escolha seu plano</h1>
        <p style={{ color: "#6B7280", fontSize: "0.95rem", margin: 0 }}>Todos os planos pagos incluem 14 dias de trial gratuito</p>
      </div>

      {/* Current Plan */}
      {tenant && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, maxWidth: 500, margin: "0 auto 24px" }}>
          <CreditCard size={20} color={NAVY} />
          <span style={{ color: "#6B7280", fontSize: 13 }}>Plano atual:</span>
          <span style={{ fontWeight: 700, color: NAVY, textTransform: "capitalize" }}>{tenant.plan?.replace("_", " ").toLowerCase()}</span>
        </motion.div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {PLANOS.map((plan, i) => {
          const isCurrent = tenant?.plan === plan.id;
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: plan.popular ? "0 8px 24px rgba(220,38,38,0.2)" : "0 2px 8px rgba(0,0,0,0.06)", border: plan.popular ? `2px solid ${ESMERALDA}` : "1.5px solid #F3F4F6", position: "relative" }}>
              
              {plan.popular && (
                <div style={{ position: "absolute", top: 12, right: 12, background: ESMERALDA, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
                  Mais popular
                </div>
              )}

              <div style={{ padding: 20, borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {plan.isEmerald && <EmeraldIcon size={18} />}
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0D2545" }}>{plan.nome}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: plan.color }}>R${plan.valor}</span>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>/mes</span>
                </div>
                {plan.isEmerald && (
                  <div style={{ marginTop: 8, fontSize: 12, color: ESMERALDA, fontWeight: 600 }}>
                    Ate {plan.maxChurches === 999 ? "ilimitadas" : plan.maxChurches} igrejas
                  </div>
                )}
              </div>

              <div style={{ padding: 16 }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "#374151" }}>
                    <Check size={14} color={plan.isEmerald ? ESMERALDA : "#16A34A"} />
                    {f}
                  </div>
                ))}

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || checkoutLoading === plan.id || plan.id === "FREE"}
                  style={{
                    width: "100%", marginTop: 12, padding: "12px",
                    background: isCurrent ? "#F3F4F6" : plan.isEmerald ? ESMERALDA : plan.color,
                    color: isCurrent ? "#9CA3AF" : plan.textColor,
                    border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: isCurrent ? "default" : "pointer",
                    opacity: checkoutLoading === plan.id ? 0.7 : 1,
                  }}>
                  {isCurrent ? "Plano atual" : checkoutLoading === plan.id ? "Processando..." : plan.id === "FREE" ? "Gratuito" : "Assinar"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
