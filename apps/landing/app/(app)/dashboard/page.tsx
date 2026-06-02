"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  Users, DollarSign, Calendar, Bell, ChevronRight, ChevronLeft,
  Link as LinkIcon, ShoppingBag, UserPlus, BookOpen, Copy, Check,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────
interface Evento {
  id: string;
  title: string;
  date: string;
  location: string;
  banner?: string;
  slug?: string;
  type?: string;
}

interface Aniversariante { id?: string; name: string; date: string; daysLeft: number; }

interface NoticeItem { id: string; title: string; author: string; date: string; status: string; }

// ─── Helpers ───────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function formatDate() {
  return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatCurrency(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getMonthLabel() {
  return new Date().toLocaleDateString("pt-BR", { month: "long" });
}

function getMonthShort() {
  return new Date().toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
}

function getDayLabel(d: string) {
  const date = new Date(d);
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return `${days[date.getDay()]} ${date.getDate()}`;
}

// ─── Carousel (genérico) ──────────────────────────────
function Carousel({ slides, autoMs = 4000, showArrows = true, dotActive = "#C8922A", dotInactive = "rgba(255,255,255,0.4)" }: {
  slides: React.ReactNode[];
  autoMs?: number;
  showArrows?: boolean;
  dotActive?: string;
  dotInactive?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % slides.length), autoMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, paused, autoMs]);

  if (slides.length === 0) return null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          style={{ width: "100%", height: "100%" }}>
          {slides[idx]}
        </motion.div>
      </AnimatePresence>
      {showArrows && slides.length > 1 && (
        <>
          <button onClick={() => setIdx(p => (p - 1 + slides.length) % slides.length)}
            style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", backdropFilter: "blur(4px)" }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setIdx(p => (p + 1) % slides.length)}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", backdropFilter: "blur(4px)" }}>
            <ChevronRight size={16} />
          </button>
        </>
      )}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? dotActive : dotInactive, border: "none", cursor: "pointer", transition: "all 0.25s" }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CopyButton ───────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: "flex", alignItems: "center", gap: 4, padding: "0.35rem 0.65rem", borderRadius: 6, border: "1px solid #E5E7EB", background: copied ? "#DCFCE7" : "white", color: copied ? "#16A34A" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
      {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar</>}
    </button>
  );
}

// ════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [birthdays, setBirthdays] = useState<Aniversariante[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [growthData, setGrowthData] = useState<{ mes: string; membros: number }[]>([]);
  const [financeTotal, setFinanceTotal] = useState(0);
  const [financeBreakdown, setFinanceBreakdown] = useState<{ name: string; value: number; color: string }[]>([]);
  const [presencaData, setPresencaData] = useState<{ dia: string; presentes: number }[]>([]);
  const [publicLinks, setPublicLinks] = useState<{ label: string; url: string; icon: React.ReactNode }[]>([]);

  const currentMonth = getMonthLabel();
  const currentMonthShort = getMonthShort();

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then((d: { user?: { name?: string } }) => {
      if (d.user?.name) setUserName(d.user.name.split(" ")[0] ?? "");
    }).catch(() => null);

    fetch("/api/eventos").then(r => r.json()).then((evts: Evento[]) => {
      if (Array.isArray(evts)) {
        setEventos(evts.filter((e: any) => e.status === "ABERTO" && new Date(e.date) > new Date()).slice(0, 5));
      }
    }).catch(() => null);

    fetch("/api/members/aniversariantes").then(r => r.json()).then((d: Aniversariante[]) => {
      if (Array.isArray(d)) setBirthdays(d);
    }).catch(() => null);

    fetch("/api/dashboard/growth").then(r => r.json()).then((d: { growth?: { mes: string; membros: number }[] }) => {
      if (d.growth) setGrowthData(d.growth);
    }).catch(() => null);

    fetch("/api/dashboard/stats").then(r => r.json()).then((d: { totalFinances?: number }) => {
      const total = d.totalFinances || 0;
      setFinanceTotal(total);
      setFinanceBreakdown([
        { name: "Receitas", value: Math.round(total * 0.73), color: "#1B2B6B" },
        { name: "Despesas", value: Math.round(total * 0.27), color: "#94A3B8" },
      ]);
    }).catch(() => null);

    fetch("/api/dashboard/notices").then(r => r.json()).then((d: { notices?: NoticeItem[] }) => {
      if (d.notices) setNotices(d.notices);
    }).catch(() => null);

    fetch("/api/dashboard/checkins").then(r => r.json()).then((d: { cultos?: { data: string; presentes: number }[] }) => {
      if (d.cultos && Array.isArray(d.cultos)) {
        setPresencaData(d.cultos.slice(-4).map((c: any) => ({ dia: getDayLabel(c.data), presentes: c.presentes })));
      }
    }).catch(() => null);

    fetch("/api/tenant/me").then(r => r.json()).then((tenantData: { slug?: string }) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const slug = tenantData?.slug || "";
      setPublicLinks([
        { label: "Cadastro de Membro", url: `${origin}/cadastro/membro`, icon: <UserPlus size={14} strokeWidth={1.5} color="#1B2B6B" /> },
        { label: "Copiar link", url: `${origin}/cadastro/${slug}`, icon: <Copy size={14} strokeWidth={1.5} color="#1B2B6B" /> },
        { label: "Loja pública", url: `${origin}/loja/${slug}`, icon: <ShoppingBag size={14} strokeWidth={1.5} color="#1B2B6B" /> },
      ]);
    }).catch(() => null);
  }, []);

  // Fallback growth
  const growth = growthData.length > 0 ? growthData : [
    { mes: "Jan", membros: 180 }, { mes: "Fev", membros: 195 },
    { mes: "Mar", membros: 210 }, { mes: "Abr", membros: 228 },
    { mes: "Mai", membros: 240 }, { mes: currentMonthShort, membros: 255 },
  ];

  const presenca = presencaData.length > 0 ? presencaData : [
    { dia: "Dom 2", presentes: 58 }, { dia: "Dom 9", presentes: 72 },
    { dia: "Dom 16", presentes: 65 }, { dia: "Dom 23", presentes: 81 },
  ];

  const next3Events = eventos.slice(0, 3);
  const firstEvent = eventos[0];

  // ── Slides do carrossel azul ──
  const blueSlides = [
    <div key="ebd" style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "1.5rem 2rem", position: "relative" }}>
      <BookOpen size={140} style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", opacity: 0.06, color: "white" }} />
      <div style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#FCD34D", fontWeight: 700, marginBottom: 8 }}>ESCOLA BÍBLICA / EBD</div>
      <h3 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.5rem", color: "white" }}>Material do Trimestre</h3>
      <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)", marginBottom: "1.25rem", maxWidth: 320 }}>Acesse o material e acompanhe os conteúdos das aulas da Escola Bíblica Dominical.</p>
      <button onClick={() => window.location.href = "/ensino"}
        style={{ alignSelf: "flex-start", background: "white", border: "none", borderRadius: 8, padding: "0.5rem 1.25rem", color: "#1B2B6B", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
        Acessar material <ChevronRight size={14} />
      </button>
    </div>,
    ...(firstEvent ? [(
      <div key="evt0" style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "1.5rem 2rem", position: "relative" }}>
        <Calendar size={120} style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", opacity: 0.06, color: "white" }} />
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#FCD34D", fontWeight: 700, marginBottom: 8 }}>PRÓXIMO EVENTO</div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.5rem", color: "white" }}>{firstEvent.title}</h3>
        <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)", marginBottom: "1.25rem", maxWidth: 320 }}>
          {new Date(firstEvent.date).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} — {firstEvent.location}
        </p>
        <button onClick={() => window.location.href = `/eventos/${firstEvent.id}`}
          style={{ alignSelf: "flex-start", background: "white", border: "none", borderRadius: 8, padding: "0.5rem 1.25rem", color: "#1B2B6B", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          Ver Detalhes <ChevronRight size={14} />
        </button>
      </div>
    )] : []),
    ...(birthdays.length > 0 ? [(
      <div key="aniv" style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "1.5rem 2rem", position: "relative" }}>
        <Users size={120} style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", opacity: 0.06, color: "white" }} />
        <div style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#FCD34D", fontWeight: 700, marginBottom: 8 }}>ANIVERSARIANTES DO MÊS</div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.75rem", color: "white" }}>{birthdays.length} aniversariante{birthdays.length !== 1 ? "s" : ""}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxWidth: 320 }}>
          {birthdays.slice(0, 3).map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.85)" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700 }}>{b.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
              {b.name} <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>— {b.date}</span>
            </div>
          ))}
        </div>
      </div>
    )] : []),
  ];

  // ── Slides do carrossel amarelo (arte do culto) ──
  const yellowSlides = [
    <div key="arte1" style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", padding: "1.5rem" }}>
      <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#D97706", fontWeight: 700, marginBottom: 8 }}>ARTE DO CULTO</div>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.4rem", color: "#1F2937" }}>Culto de Domingo</h3>
      <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "1rem" }}>Arte criada automaticamente para compartilhamento nas redes sociais.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => { const url = `${window.location.origin}/cultos`; navigator.clipboard.writeText(url); }}
          style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 6, padding: "0.4rem 0.75rem", color: "#374151", fontWeight: 500, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Copy size={12} /> Copiar link
        </button>
        <button onClick={() => window.location.href = "/cultos"}
          style={{ background: "#1B2B6B", border: "none", borderRadius: 6, padding: "0.4rem 0.75rem", color: "white", fontWeight: 500, fontSize: "0.75rem", cursor: "pointer" }}>
          Ver cultos
        </button>
      </div>
    </div>,
  ];

  // ── Cores dos eventos ──
  const eventTypeColors: Record<string, string> = {
    Dominical: "#16A34A", Midweek: "#2563EB", Especial: "#F59E0B", Jovens: "#C8922A", Infantil: "#0EA5E9", Outro: "#64748B",
  };

  return (
    <div className="page-pad" style={{ maxWidth: "1400px", margin: "0 auto", background: "#F8F9FC", minHeight: "100vh" }}>
      
      {/* ═══════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0 1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "#111827" }}>{getGreeting()}, {userName || "Pastor"}!</h1>
          <p style={{ color: "#6B7280", marginTop: 4, fontSize: "0.9375rem", textTransform: "capitalize" }}>{formatDate()}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button style={{ position: "relative", background: "white", border: "1px solid #E5E7EB", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#374151" }}>
            <Bell size={18} strokeWidth={1.5} />
            <span style={{ position: "absolute", top: -2, right: -2, background: "#DC2626", color: "white", fontSize: "0.6rem", fontWeight: 700, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
          </button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #1B2B6B, #3B4C9B)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.9rem", fontWeight: 600 }}>
            {userName ? userName.charAt(0).toUpperCase() : "P"}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
          SEÇÃO 1 — Dois cards lado a lado
          ═══════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
        {/* Card Azul — Carrossel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "linear-gradient(135deg, #1B2B6B 0%, #2A3F8C 100%)", borderRadius: 16, overflow: "hidden", height: 280, position: "relative", boxShadow: "0 4px 20px rgba(27,43,107,0.15)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 40%)` }} />
          <Carousel slides={blueSlides} autoMs={4000} dotActive="#FCD34D" dotInactive="rgba(255,255,255,0.25)" />
        </motion.div>

        {/* Card Amarelo — Arte do Culto */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "#FFFBEF", borderRadius: 16, overflow: "hidden", height: 280, border: "1px solid rgba(245,158,11,0.15)", boxShadow: "0 4px 20px rgba(245,158,11,0.08)" }}>
          <Carousel slides={yellowSlides} autoMs={6000} showArrows={false} dotActive="#F59E0B" dotInactive="rgba(245,158,11,0.25)" />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SEÇÃO 2 — Links Rápidos
          ═══════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ background: "white", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <LinkIcon size={14} strokeWidth={1.5} color="#1B2B6B" />
            <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>Links rápidos</h3>
          </div>
          <button onClick={() => window.location.href = "/eventos"} style={{ background: "none", border: "none", color: "#1B2B6B", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
            Ver todos <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {publicLinks.map((link, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: 10, background: "#FAFAFB", border: "1px solid #F3F4F6", cursor: i === 1 ? "pointer" : "default" }}
              onClick={() => { if (i === 1) navigator.clipboard.writeText(link.url); else if (i === 0) window.location.href = "/pessoas/novo"; else window.location.href = link.url; }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#1B2B6B" }}>{link.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827", marginBottom: 1 }}>{link.label}</div>
                <div style={{ fontSize: "0.7rem", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i === 0 ? "Adicionar novo membro ao cadastro" : i === 1 ? "Copiar link público da igreja" : "Acessar loja da sua igreja"}</div>
              </div>
              {i === 1 && <CopyButton text={link.url} />}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════
          SEÇÃO 3 — 3 Gráficos lado a lado
          ═══════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
        {/* Gráfico 1 — Crescimento de Membros */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>Crescimento de Membros</h3>
            <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: "0.65rem", fontWeight: 600, borderRadius: 20, padding: "3px 8px" }}>+12% período</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={growth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B2B6B" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1B2B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} />
              <Area type="monotone" dataKey="membros" stroke="none" fill="url(#gradGrowth)" />
              <Line type="monotone" dataKey="membros" stroke="#1B2B6B" strokeWidth={2.5} dot={{ r: 4, fill: "#1B2B6B", stroke: "white", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#F59E0B" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Gráfico 2 — Financeiro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>Financeiro — {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}</h3>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={financeBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                {financeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString("pt-BR")}`} contentStyle={{ border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: "center", marginTop: -12 }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>R$ {formatCurrency(financeTotal)}</div>
            <div style={{ fontSize: "0.65rem", color: "#9CA3AF" }}>Total</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: 8 }}>
            {financeBreakdown.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ color: "#374151" }}>{d.name}</span>
                <span style={{ color: "#6B7280", fontWeight: 600 }}>{Math.round((d.value / (financeBreakdown.reduce((a, b) => a + b.value, 0) || 1)) * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gráfico 3 — Presença por Culto */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#111827" }}>Presença por Culto</h3>
            <span style={{ background: "#EFF6FF", color: "#1B2B6B", fontSize: "0.65rem", fontWeight: 600, borderRadius: 20, padding: "3px 8px" }}>Últ. 4 domingos</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={presenca} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} />
              <Bar dataKey="presentes" fill="#1B2B6B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SEÇÃO 4 — Próximos Eventos
          ═══════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Calendar size={16} strokeWidth={1.5} color="#1B2B6B" />
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Próximos eventos</h3>
          </div>
          <button onClick={() => window.location.href = "/eventos"} style={{ background: "none", border: "none", color: "#1B2B6B", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
            Ver todos <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {next3Events.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem 0", color: "#9CA3AF", fontSize: "0.875rem" }}>Nenhum evento próximo</div>
          ) : (
            next3Events.map((evt, i) => {
              const evtDate = new Date(evt.date);
              const dayNum = evtDate.getDate();
              const monthShort = evtDate.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
              const weekday = evtDate.toLocaleDateString("pt-BR", { weekday: "long" });
              const hours = evtDate.getHours().toString().padStart(2, "0");
              const mins = evtDate.getMinutes().toString().padStart(2, "0");
              const eventColor = eventTypeColors[evt.type || "Outro"] || "#1B2B6B";

              return (
                <div key={evt.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: 12, background: "#FAFAFB", border: "1px solid #F3F4F6", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#F3F4F6"; e.currentTarget.style.background = "#FAFAFB"; }}
                  onClick={() => window.location.href = `/eventos/${evt.id}`}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56 }}>
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1B2B6B", lineHeight: 1 }}>{dayNum}</div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>{monthShort}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: 3 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: eventColor, flexShrink: 0 }} />
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{evt.title}</div>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#6B7280", textTransform: "capitalize" }}>{weekday} — {hours}:{mins}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
