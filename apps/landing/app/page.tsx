"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ParticleBackground } from "./components/landing/ParticleBackground";
import { AnimatedCounter } from "./components/landing/AnimatedCounter";
import { FAQSection } from "./components/landing/FAQSection";
import {
  Users, Building2, Wallet, CalendarDays, Megaphone, BookOpen, Landmark, Palette,
  Check, ArrowRight, Shield, Gem, Menu, X, MessageCircle
} from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const ESMERALDA = "#DC2626";

const FEATURES = [
  { icon: Users, title: "Pessoas", desc: "Cadastro e gestão de membros", color: "#7C3AED" },
  { icon: Building2, title: "Grupos", desc: "Células e frequência", color: "#16A34A" },
  { icon: Wallet, title: "Financeiro", desc: "Dízimos e ofertas", color: "#CA8A04" },
  { icon: CalendarDays, title: "Eventos", desc: "Calendário e inscrições", color: "#2563EB" },
  { icon: Megaphone, title: "Mídias", desc: "Avisos e galeria", color: "#EA580C" },
  { icon: BookOpen, title: "Ensino", desc: "Estudos e discipulado", color: "#0891B2" },
  { icon: Landmark, title: "Patrimônio", desc: "Inventário de bens", color: "#6B7280" },
  { icon: Palette, title: "White Label", desc: "Sua marca, seu sistema", color: ESMERALDA },
];

const CHURCH_PLANS = [
  { name: "Gratuito", price: 0, yearlyPrice: 0, features: ["Até 50 membros", "1 usuário", "Módulo Pessoas", "Relatórios básicos", "Suporte por email"], popular: false },
  { name: "Prata", price: 49, yearlyPrice: 490, features: ["Membros ilimitados", "3 usuários", "Todos os módulos", "Financeiro completo", "Suporte prioritário"], popular: false },
  { name: "Ouro", price: 99, yearlyPrice: 990, features: ["Membros ilimitados", "10 usuários", "Todos os módulos", "White Label básico", "Suporte 24h"], popular: true },
  { name: "Diamante", price: 199, yearlyPrice: 1990, features: ["Membros ilimitados", "Usuários ilimitados", "Todos os módulos", "White Label completo", "API + Integrações"], popular: false },
];

const RESELLER_PLANS = [
  { name: "Starter", price: 149, churches: 5, features: ["5 igrejas", "White Label", "Suporte prioritário", "Painel do revendedor"] },
  { name: "Pro", price: 249, churches: 15, features: ["15 igrejas", "White Label", "Suporte 24h", "API de integração"] },
  { name: "Plus", price: 399, churches: 25, features: ["25 igrejas", "White Label", "Suporte dedicado", "Onboarding personalizado"] },
  { name: "Ultra", price: 599, churches: 999, features: ["Igrejas ilimitadas", "White Label", "Suporte VIP", "Consultoria estratégica"], best: true },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setScrolled(window.scrollY > 50));
  }

  const navLinks = [
    { label: "Funcionalidades", href: "#features" },
    { label: "White Label", href: "#white-label" },
    { label: "Planos", href: "#plans" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s",
        background: scrolled ? "rgba(26,60,110,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Shield size={24} color="#fff" strokeWidth={1.5} />
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>FIRMES</span>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {navLinks.map(link => (
          <a key={link.href} href={link.href} style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "color 0.2s" }}>
            {link.label}
          </a>
        ))}
        <Link href="/login" style={{ padding: "8px 16px", background: "#fff", color: NAVY, borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Entrar</Link>
      </div>

      <button onClick={() => setMobileOpen(!mobileOpen)} style={{ display: "none", background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
}

function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #1A3C6E 0%, #0D2545 50%, #1A3C6E 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite",
      }}
    >
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <ParticleBackground />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 900, padding: "0 24px" }}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, color: "#fff", marginBottom: 16, lineHeight: 1.2 }}
        >
          Gerencie sua igreja com
          <br />
          <span style={{ color: GOLD }}>tecnologia moderna</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "rgba(255,255,255,0.8)", marginBottom: 32, lineHeight: 1.6 }}
>
          Controle membros, finanças, grupos e eventos em um só lugar.
          <br />
          Plano gratuito para sempre. Sem cartão de crédito.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
>
          <Link
            href="/cadastro"
            style={{
              padding: "14px 32px",
              background: GOLD,
              color: "#fff",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Começar grátis <ArrowRight size={18} />
          </Link>
          <a
            href="#demo"
            style={{
              padding: "14px 32px",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Ver demonstração
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            marginTop: 60,
            width: "100%",
            maxWidth: 800,
            height: 400,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "float 6s ease-in-out infinite",
          }}
>
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            <Shield size={64} strokeWidth={1} />
            <p style={{ marginTop: 16, fontSize: 14 }}>Dashboard FIRMES</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section style={{ padding: "60px 24px", background: "#fff", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, textAlign: "center" }}>
        {[
          { value: 200, suffix: "+", label: "Igrejas ativas" },
          { value: 15000, suffix: "+", label: "Membros gerenciados" },
          { value: 99.9, suffix: "%", label: "Uptime garantido", prefix: "" },
          { value: 0, suffix: "", label: "Para começar", prefix: "R$" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
>
            <div style={{ fontSize: 36, fontWeight: 800, color: NAVY }}>
              <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
            </div>
            <div style={{ fontSize: 14, color: "#6B7280", fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "100px 24px", background: "#F5F0EB" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 60 }}
>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 12 }}>Tudo que sua igreja precisa</h2>
          <p style={{ fontSize: 16, color: "#6B7280" }}>8 módulos integrados para gerenciar cada área</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: f.color, marginBottom: 16 }}>
                <f.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhiteLabelSection() {
  const [churches, setChurches] = useState(5);
  const revenue = churches * 99;

  return (
    <section id="white-label" style={{ padding: "100px 24px", background: NAVY, color: "#fff" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
>
          <Gem size={40} style={{ color: GOLD, marginBottom: 16 }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Seja um revendedor FIRMES</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 48 }}>Venda o sistema com a sua marca e lucre R$1.000+ por mês</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "40px", border: "1px solid rgba(255,255,255,0.1)" }}
>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Quantas igrejas você quer atender?</p>
          <input
            type="range"
            min={1}
            max={50}
            value={churches}
            onChange={e => setChurches(Number(e.target.value))}
            style={{ width: "100%", maxWidth: 400, marginBottom: 24 }}
          />
          <div style={{ fontSize: 48, fontWeight: 800, color: GOLD }}>
            R$ {revenue.toLocaleString("pt-BR")}/mês
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{churches} igrejas × R$99/mês em média</p>

          <Link
            href="/planos#esmeralda"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 24,
              padding: "14px 32px",
              background: GOLD,
              color: "#fff",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Quero ser revendedor <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function PlansSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="plans" style={{ padding: "100px 24px", background: "#F5F0EB" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 48 }}
>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 12 }}>Escolha o plano ideal para sua igreja</h2>
          <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 24 }}>Comece grátis. Sem cartão de crédito.</p>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#fff", padding: "6px", borderRadius: 10 }}>
            <button
              onClick={() => setYearly(false)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                background: !yearly ? NAVY : "transparent",
                color: !yearly ? "#fff" : "#374151",
              }}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                background: yearly ? NAVY : "transparent",
                color: yearly ? "#fff" : "#374151",
              }}
            >
              Anual <span style={{ fontSize: 11, color: yearly ? "#fff" : "#16A34A", fontWeight: 800 }}>(-2 meses)</span>
            </button>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 80 }}>
          {CHURCH_PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "32px",
                boxShadow: plan.popular ? `0 0 0 2px ${GOLD}` : "0 2px 8px rgba(0,0,0,0.06)",
                position: "relative",
              }}
>
              {plan.popular && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", padding: "4px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Mais popular
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 16 }}>
                R${yearly ? Math.round(plan.yearlyPrice / 12) : plan.price}
                <span style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>/mês</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" }}>
                    <Check size={16} style={{ color: "#16A34A", flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <Link
                href="/cadastro"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  background: plan.popular ? GOLD : NAVY,
                  color: "#fff",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Começar agora
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Planos Esmeralda */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 48 }}
>
          <Gem size={32} style={{ color: ESMERALDA, marginBottom: 12 }} />
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>Seja um Revendedor FIRMES</h2>
          <p style={{ fontSize: 16, color: "#6B7280" }}>Venda com sua marca. Lucre desde o primeiro cliente.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {RESELLER_PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "32px",
                boxShadow: plan.best ? `0 0 0 2px ${GOLD}` : "0 2px 8px rgba(0,0,0,0.06)",
                position: "relative",
              }}
>
              {plan.best && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", padding: "4px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                  Melhor para redes
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: ESMERALDA, marginBottom: 8 }}>Esmeralda {plan.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 800, color: NAVY, marginBottom: 4 }}>
                R${plan.price}
                <span style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}>/mês</span>
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>Até {plan.churches === 999 ? "ilimitadas" : plan.churches + " igrejas"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151" }}>
                    <Check size={16} style={{ color: "#16A34A", flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <Link
                href="/cadastro"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px",
                  background: plan.best ? GOLD : ESMERALDA,
                  color: "#fff",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Quero ser revendedor
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{ padding: "100px 24px", background: "linear-gradient(135deg, #1A3C6E 0%, #0D2545 100%)", color: "#fff", textAlign: "center" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ maxWidth: 700, margin: "0 auto" }}
      >
        <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: 16 }}>Pronto para transformar sua igreja?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 32 }}>Junte-se a 200+ igrejas que já usam o FIRMES</p>
        <Link
          href="/cadastro"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "16px 40px",
            background: GOLD,
            color: "#fff",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Começar gratuitamente agora <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "60px 24px 30px", background: "#0D2545", color: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Shield size={24} />
            <span style={{ fontSize: 18, fontWeight: 800 }}>FIRMES</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>"Firmes na fé, firmes no propósito."<br />2 Coríntios 1:24</p>
        </div>

        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Produto</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Funcionalidades", "Planos", "White Label", "Demonstração"].map(l => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Suporte</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Central de ajuda", "WhatsApp", "Email", "Status"].map(l => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Legal</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["Termos de uso", "Privacidade (LGPD)", "Cookies"].map(l => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13 }}>{l}</a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>© 2026 FIRMES. Todos os direitos reservados.</span>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>SSL Seguro</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Powered by Stripe</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>LGPD</span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div style={{ scrollBehavior: "smooth" }}>
      <Navbar />
      <HeroSection />
      <SocialProof />
      <FeaturesSection />
      <WhiteLabelSection />
      <PlansSection />
      <FAQSection />
      <CTASection />
      <Footer />

      {/* WhatsApp flutuante */}
      <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#25D366",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 90,
          textDecoration: "none",
        }}
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
