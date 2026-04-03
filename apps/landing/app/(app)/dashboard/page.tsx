"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, DollarSign, Calendar, CheckSquare, Bell,
  TrendingUp, TrendingDown, Clock, ChevronRight, ChevronLeft,
  Copy, Check, Link as LinkIcon, ShoppingBag, UserPlus, ExternalLink,
} from "lucide-react";

interface DashStats {
  totalMembers: number;
  activeGroups: number;
  upcomingEvents: number;
  totalFinances: number;
  recentMembers: { id: string; name: string; email: string; status: string; createdAt: string }[];
}

interface EventoSlide { id: string; title: string; date: string; location: string; banner?: string; slug?: string; }
interface ProdutoSlide { id: string; nome: string; preco: number; foto?: string; }
interface AniversarianteSlide { name: string; date: string; daysLeft: number; }

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

const GROWTH_DATA = [
  { mes: "Out", membros: 312 }, { mes: "Nov", membros: 334 },
  { mes: "Dez", membros: 358 }, { mes: "Jan", membros: 371 },
  { mes: "Fev", membros: 389 }, { mes: "Mar", membros: 412 },
];

const BIRTHDAYS: AniversarianteSlide[] = [
  { name: "Ana Paula Silva", date: "27 mar", daysLeft: 2 },
  { name: "Carlos Eduardo", date: "29 mar", daysLeft: 4 },
  { name: "Mariana Costa", date: "01 abr", daysLeft: 7 },
  { name: "Joao Batista", date: "03 abr", daysLeft: 9 },
  { name: "Fernanda Lima", date: "05 abr", daysLeft: 11 },
];

const NOTICES = [
  { id: 1, title: "Culto de Pascoa - inscricoes abertas", author: "Admin", date: "25 mar", status: "Publicado" },
  { id: 2, title: "Reuniao de lideres - 5a feira 19h", author: "Pastor Joao", date: "24 mar", status: "Publicado" },
  { id: 3, title: "Arrecadacao de alimentos - abril", author: "Admin", date: "22 mar", status: "Rascunho" },
  { id: 4, title: "Escala de louvor - semana santa", author: "Ministerio Louvor", date: "20 mar", status: "Publicado" },
  { id: 5, title: "Manutencao do sistema - domingo 02h", author: "Admin", date: "18 mar", status: "Arquivado" },
];

const ACTIVITY = [
  { icon: <Users size={14} strokeWidth={1.5} />, desc: "Novo membro: Beatriz Santos", time: "5 min", color: "#1A3C6E" },
  { icon: <DollarSign size={14} strokeWidth={1.5} />, desc: "Dizimo registrado: R$ 250", time: "18 min", color: "#16A34A" },
  { icon: <CheckSquare size={14} strokeWidth={1.5} />, desc: "Check-in no culto: 47 pessoas", time: "1h", color: "#C8922A" },
  { icon: <Calendar size={14} strokeWidth={1.5} />, desc: "Evento criado: Retiro de Jovens", time: "2h", color: "#7C3AED" },
  { icon: <Users size={14} strokeWidth={1.5} />, desc: "Grupo atualizado: Celulas Norte", time: "3h", color: "#1A3C6E" },
  { icon: <DollarSign size={14} strokeWidth={1.5} />, desc: "Oferta registrada: R$ 1.800", time: "4h", color: "#16A34A" },
];

function StatCard({ icon, label, value, change, positive, color, delay }: {
  icon: React.ReactNode; label: string; value: number; change: string; positive: boolean; color: string; delay: number;
}) {
  const count = useCountUp(value);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
      style={{ flex: 1, background: "white", borderRadius: "12px", padding: "1.125rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "0.875rem", cursor: "default" }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#6B7280", fontSize: "0.75rem", marginBottom: 2, fontWeight: 500 }}>{label}</div>
        <div style={{ color: "#111827", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2 }}>
          {label === "Saldo do Mes" ? `R$ ${count.toLocaleString("pt-BR")}` : count.toLocaleString("pt-BR")}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, color: positive ? "#16A34A" : "#DC2626", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>
        {positive ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />}{change}
      </div>
    </motion.div>
  );
}

function getGreeting() { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; }
function formatDate() { return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    function calc() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      setTimeLeft({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, [targetDate]);
  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {[{ v: timeLeft.d, l: "dias" }, { v: timeLeft.h, l: "horas" }, { v: timeLeft.m, l: "min" }, { v: timeLeft.s, l: "seg" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, minWidth: 48 }}>{String(v).padStart(2, "0")}</div>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function DefaultBanner({ title, date, type = "evento" }: { title: string; date?: string; type?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1A3C6E 0%, #0D2545 100%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0.5rem", borderRadius: "8px" }}>
      <div style={{ color: "#E8B84B", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 2 }}>{type}</div>
      <div style={{ color: "white", fontSize: "0.7rem", fontWeight: 700, textAlign: "center", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{title}</div>
      {date && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.6rem", marginTop: 2 }}>{date}</div>}
    </div>
  );
}

function Carousel({ eventos, aniversariantes, produtos }: { eventos: EventoSlide[]; aniversariantes: AniversarianteSlide[]; produtos: ProdutoSlide[] }) {
  type Slide = { type: "evento"; data: EventoSlide } | { type: "aniversariante"; data: AniversarianteSlide } | { type: "produto"; data: ProdutoSlide };
  const slides: Slide[] = [
    ...eventos.map(e => ({ type: "evento" as const, data: e })),
    ...aniversariantes.slice(0, 3).map(a => ({ type: "aniversariante" as const, data: a })),
    ...produtos.slice(0, 3).map(p => ({ type: "produto" as const, data: p })),
  ];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % slides.length), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, paused]);

  if (slides.length === 0) return null;
  const slide = slides[idx % slides.length]!;

  function renderSlide(s: Slide) {
    if (s.type === "evento") {
      const e = s.data;
      const dateStr = new Date(e.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", padding: "0.5rem", boxSizing: "border-box" }}>
          <div style={{ width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#1A3C6E", marginBottom: 6 }}>
            {e.banner ? <img src={e.banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <DefaultBanner title={e.title.slice(0,12)} date={dateStr} />}
          </div>
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{ color: "#E8B84B", fontSize: "0.55rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 3 }}>EVENTO</div>
            <div style={{ color: "white", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.2, textAlign: "center", wordBreak: "break-word", maxWidth: "100%", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.65rem", marginTop: 3, textAlign: "center", wordBreak: "break-word" }}>{dateStr}{e.location ? ` • ${e.location.slice(0,20)}` : ""}</div>
          </div>
        </div>
      );
    }
    if (s.type === "aniversariante") {
      const a = s.data;
      const initials = a.name.split(" ").map(w => w[0]).slice(0, 2).join("");
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", padding: "0.5rem", boxSizing: "border-box" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(232,184,75,0.15)", border: "2px solid rgba(232,184,75,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "#E8B84B", flexShrink: 0, marginBottom: 6 }}>{initials}</div>
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{ color: "#E8B84B", fontSize: "0.55rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 3 }}>ANIVERSARIANTE</div>
            <div style={{ color: "white", fontSize: "0.8rem", fontWeight: 700, textAlign: "center", wordBreak: "break-word", maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.65rem", marginTop: 2, textAlign: "center" }}>{a.date} • {a.daysLeft}d</div>
          </div>
        </div>
      );
    }
    const p = s.data as ProdutoSlide;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", padding: "0.5rem", boxSizing: "border-box" }}>
        <div style={{ width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#1A3C6E", marginBottom: 6 }}>
          {p.foto ? <img src={p.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <DefaultBanner title={p.nome.slice(0,12)} type="produto" />}
        </div>
        <div style={{ textAlign: "center", width: "100%" }}>
          <div style={{ color: "#E8B84B", fontSize: "0.55rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 3 }}>PRODUTO</div>
          <div style={{ color: "white", fontSize: "0.75rem", fontWeight: 700, textAlign: "center", wordBreak: "break-word", maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</div>
          <div style={{ color: "#E8B84B", fontSize: "0.85rem", fontWeight: 700, marginTop: 3, textAlign: "center" }}>R$ {p.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: 90, maxHeight: 90, width: "100%" }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
          style={{ height: 85, maxHeight: 85, width: "100%", display: "flex", alignItems: "center" }}>
          {renderSlide(slide)}
        </motion.div>
      </AnimatePresence>
      {slides.length > 1 && (
        <>
          <button onClick={() => setIdx(p => (p - 1 + slides.length) % slides.length)} style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}><ChevronLeft size={12} /></button>
          <button onClick={() => setIdx(p => (p + 1) % slides.length)} style={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}><ChevronRight size={12} /></button>
          <div style={{ position: "absolute", bottom: 2, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx % slides.length ? 12 : 5, height: 5, borderRadius: 3, background: i === idx % slides.length ? "#E8B84B" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: "flex", alignItems: "center", gap: 4, padding: "0.35rem 0.65rem", borderRadius: 6, border: "1px solid #E5E7EB", background: copied ? "#DCFCE7" : "white", color: copied ? "#16A34A" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
      {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar</>}
    </button>
  );
}

function ScanLine({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [userName, setUserName] = useState("Pastor");
  const [eventos, setEventos] = useState<EventoSlide[]>([]);
  const [produtos, setProdutos] = useState<ProdutoSlide[]>([]);
  const [publicLinks, setPublicLinks] = useState<{ label: string; url: string; icon: React.ReactNode }[]>([]);

  const nextCulto = new Date();
  nextCulto.setDate(nextCulto.getDate() + ((7 - nextCulto.getDay()) % 7 || 7));
  nextCulto.setHours(19, 0, 0, 0);

  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then((d: DashStats) => setStats(d)).catch(() => null);
    fetch("/api/auth/session").then(r => r.json()).then((d: { user?: { name?: string } }) => { if (d.user?.name) setUserName(d.user.name.split(" ")[0] ?? "Pastor"); }).catch(() => null);

    // Fetch eventos for carousel + public links
    fetch("/api/eventos").then(r => r.json()).then((evts: EventoSlide[]) => {
      if (Array.isArray(evts)) {
        const upcoming = evts.filter((e: any) => e.status === "ABERTO" && new Date(e.date) > new Date()).slice(0, 5);
        setEventos(upcoming);
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const links: { label: string; url: string; icon: React.ReactNode }[] = upcoming.filter((e: any) => e.slug).map((e: any) => ({
          label: e.title,
          url: `${origin}/inscricao/${e.slug}`,
          icon: <Calendar size={14} strokeWidth={1.5} color="#1A3C6E" />,
        }));
        links.push({ label: "Formulario de visitante", url: `${origin}/cadastro/igreja`, icon: <UserPlus size={14} strokeWidth={1.5} color="#1A3C6E" /> });
        links.push({ label: "Loja publica", url: `${origin}/loja`, icon: <ShoppingBag size={14} strokeWidth={1.5} color="#1A3C6E" /> });
        setPublicLinks(links);
      }
    }).catch(() => null);

    // Fetch produtos for carousel
    fetch("/api/produtos").then(r => r.json()).then((prods: ProdutoSlide[]) => { if (Array.isArray(prods)) setProdutos(prods.filter((p: any) => p.ativo).slice(0, 5)); }).catch(() => null);
  }, []);

  const totalMembers = stats?.totalMembers ?? 412;
  const activeGroups = stats?.activeGroups ?? 18;
  const upcomingEvents = stats?.upcomingEvents ?? 5;
  const totalFinances = Math.round(stats?.totalFinances ?? 15400);

  const statusColor: Record<string, { bg: string; color: string }> = {
    Publicado: { bg: "#DCFCE7", color: "#16A34A" },
    Rascunho: { bg: "#FEF9C3", color: "#CA8A04" },
    Arquivado: { bg: "#F3F4F6", color: "#6B7280" },
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>{getGreeting()}, {userName}!</h1>
          <p style={{ color: "#6B7280", marginTop: 2, fontSize: "0.875rem", textTransform: "capitalize" }}>{formatDate()}</p>
        </div>
        <button style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 10, padding: "0.6rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", color: "#374151", fontSize: "0.875rem", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <Bell size={17} strokeWidth={1.5} />
          <span style={{ background: "#DC2626", color: "white", fontSize: "0.65rem", fontWeight: 700, borderRadius: 10, padding: "1px 5px" }}>3</span>
        </button>
      </motion.div>

      {/* Banner: Proximo Culto + Carrossel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
        style={{ background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 60%, #1E4A84 100%)", borderRadius: 12, padding: "1.5rem 2rem", boxShadow: "0 4px 16px rgba(26,60,110,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem", color: "white", marginBottom: "1.5rem", flexWrap: "wrap", minHeight: 120 }}>
        <div style={{ flex: "0 0 auto", marginRight: "0.5rem" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(200,146,42,0.9)", marginBottom: 4, fontWeight: 600 }}>Proximo Culto</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Culto de Domingo</div>
          <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
            {nextCulto.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} - 19h00
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.75rem" }}>
            <CountdownTimer targetDate={nextCulto} />
            <button onClick={() => window.location.href = "/eventos/checkin"} style={{ background: "#C8922A", border: "none", borderRadius: 8, padding: "0.5rem 1rem", color: "white", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <ScanLine size={15} strokeWidth={1.5} /> Abrir check-in
            </button>
          </div>
        </div>
        {/* Carrossel */}
        <div style={{ flex: 1, minWidth: 0, width: "100%", paddingLeft: "0.75rem", marginLeft: "-0.5rem", borderLeft: "1px solid rgba(255,255,255,0.15)", background: "transparent" }}>
          <Carousel eventos={eventos} aniversariantes={BIRTHDAYS} produtos={produtos} />
        </div>
      </motion.div>

      {/* Links para Compartilhar */}
      {publicLinks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          style={{ background: "white", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <LinkIcon size={15} strokeWidth={1.5} color="#1A3C6E" />
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Links para Compartilhar</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
            {publicLinks.map((link, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem", borderRadius: 8, background: "#FAFAFA", border: "1px solid #F3F4F6", flexShrink: 0, minWidth: 280 }}>
                {link.icon}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }}>{link.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{link.url}</div>
                </div>
                <CopyButton text={link.url} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <StatCard icon={<Users size={20} strokeWidth={1.5} />} label="Total Membros" value={totalMembers} change="+12%" positive color="#1A3C6E" delay={0.25} />
        <StatCard icon={<DollarSign size={20} strokeWidth={1.5} />} label="Saldo do Mes" value={totalFinances} change="+8%" positive color="#16A34A" delay={0.3} />
        <StatCard icon={<Calendar size={20} strokeWidth={1.5} />} label="Eventos" value={upcomingEvents} change="+2" positive color="#C8922A" delay={0.35} />
        <StatCard icon={<CheckSquare size={20} strokeWidth={1.5} />} label="Check-ins Hoje" value={47} change="-5%" positive={false} color="#7C3AED" delay={0.4} />
      </div>

      {/* Chart + Birthdays */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }}
          style={{ flex: "0 0 60%", background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Crescimento de Membros</h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#6B7280" }}>Ultimos 6 meses</p>
            </div>
            <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: "0.75rem", fontWeight: 600, borderRadius: 20, padding: "3px 10px" }}>+32% no periodo</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={GROWTH_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A3C6E" stopOpacity={0.15}/><stop offset="95%" stopColor="#1A3C6E" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} labelStyle={{ fontWeight: 600, color: "#111827" }} />
              <Area type="monotone" dataKey="membros" stroke="#1A3C6E" strokeWidth={2.5} fill="url(#grad)" dot={{ r: 4, fill: "#1A3C6E", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
          style={{ flex: 1, background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Aniversariantes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {BIRTHDAYS.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.625rem", borderRadius: 8, background: i === 0 ? "#FFF8EE" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(i * 67 + 210)},60%,88%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: `hsl(${(i * 67 + 210)},50%,35%)`, flexShrink: 0 }}>
                  {b.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                  <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{b.date}</div>
                </div>
                <span style={{ background: b.daysLeft <= 3 ? "#FEF3C7" : "#F3F4F6", color: b.daysLeft <= 3 ? "#D97706" : "#6B7280", fontSize: "0.68rem", fontWeight: 600, borderRadius: 10, padding: "2px 7px", flexShrink: 0 }}>{b.daysLeft}d</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Notices + Activity */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
          style={{ flex: "0 0 65%", background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Avisos Recentes</h3>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#1A3C6E", fontSize: "0.8rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 2 }}>Ver todos <ChevronRight size={14} /></button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                {["Aviso","Autor","Data","Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "0.5rem 0", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NOTICES.map(n => (
                <tr key={n.id} style={{ borderBottom: "1px solid #F9FAFB", transition: "background 0.1s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                  <td style={{ padding: "0.625rem 0", color: "#111827", maxWidth: 220 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>{n.title}</div></td>
                  <td style={{ padding: "0.625rem 0.5rem", color: "#6B7280", whiteSpace: "nowrap" }}>{n.author}</td>
                  <td style={{ padding: "0.625rem 0.5rem", color: "#9CA3AF", whiteSpace: "nowrap" }}>{n.date}</td>
                  <td style={{ padding: "0.625rem 0" }}>
                    <span style={{ background: statusColor[n.status]?.bg ?? "#F3F4F6", color: statusColor[n.status]?.color ?? "#6B7280", fontSize: "0.7rem", fontWeight: 600, borderRadius: 10, padding: "2px 8px" }}>{n.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}
          style={{ flex: 1, background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Atividade Recente</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "0.625rem", padding: "0.5rem 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: `${a.color}12`, display: "flex", alignItems: "center", justifyContent: "center", color: a.color, flexShrink: 0, marginTop: 1 }}>{a.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.3 }}>{a.desc}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: 1 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
