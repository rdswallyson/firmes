"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  Users, DollarSign, Calendar, CheckSquare, Bell,
  TrendingUp, TrendingDown, ChevronRight, ChevronLeft,
  Copy, Check, Link as LinkIcon, ShoppingBag, UserPlus,
  ScanLine, Clock,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────
interface DashStats {
  totalMembers: number;
  activeGroups: number;
  upcomingEvents: number;
  totalFinances: number;
  recentMembers: { id: string; name: string; email: string; status: string; createdAt: string }[];
}

interface CheckinData {
  checkinsHoje: number;
  cultosHoje: number;
  variacao: number;
}

interface EventoSlide { id: string; title: string; date: string; location: string; banner?: string; slug?: string; }
interface ProdutoSlide { id: string; nome: string; preco: number; foto?: string; }
interface AniversarianteSlide { id?: string; name: string; date: string; daysLeft: number; }
interface NoticeItem { id: string; title: string; author: string; date: string; status: string; }
interface ActivityItem { icon: React.ReactNode; desc: string; time: string; color: string; }

// ─── Helpers ───────────────────────────────────────────
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

function getGreeting() { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; }
function formatDate() { return new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }

function getWeekAniversariantes(birthdays: AniversarianteSlide[]) {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  return birthdays.filter(b => {
    if (!b.date) return false;
    const [dia] = b.date.split(" ");
    const d = parseInt(dia || "0");
    const hojeDia = hoje.getDate();
    const diff = d - hojeDia;
    return diff >= 0 && diff <= (6 - diaSemana);
  });
}

// ─── Sparkline Component ───────────────────────────────
function Sparkline({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * 60;
    const y = 20 - ((v - min) / range) * 20;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="60" height="24" viewBox="0 0 60 24" style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={60} cy={20 - (((data[data.length - 1] ?? 0) - min) / range) * 20} r={2.5} fill={color} />
    </svg>
  );
}

// ─── StatCard Component ────────────────────────────────
function StatCard({ icon, label, value, change, positive, color, delay, sparklineData }: {
  icon: React.ReactNode; label: string; value: number; change: string; positive: boolean; color: string; delay: number;
  sparklineData?: number[];
}) {
  const count = useCountUp(value);
  const isCurrency = label.includes("Saldo") || label.includes("Dízimos");
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
      style={{ background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "0.75rem", cursor: "default" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color }}>{icon}</div>
          <span style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 500 }}>{label}</span>
        </div>
        {sparklineData && <Sparkline data={sparklineData} color={positive ? "#16A34A" : "#DC2626"} positive={positive} />}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>
          {isCurrency ? `R$ ${count.toLocaleString("pt-BR")}` : count.toLocaleString("pt-BR")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, color: positive ? "#16A34A" : "#DC2626", fontSize: "0.75rem", fontWeight: 600 }}>
          {positive ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />}{change}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Progress StatCard ─────────────────────────────────
function ProgressStatCard({ icon, label, value, goal, change, positive, color, delay }: {
  icon: React.ReactNode; label: string; value: number; goal: number; change: string; positive: boolean; color: string; delay: number;
}) {
  const count = useCountUp(value);
  const percent = Math.min(Math.round((value / (goal || 1)) * 100), 100);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
      style={{ background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "0.75rem", cursor: "default" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color }}>{icon}</div>
        <span style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ color: "#111827", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>
          R$ {count.toLocaleString("pt-BR")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2, color: positive ? "#16A34A" : "#DC2626", fontSize: "0.75rem", fontWeight: 600 }}>
          {positive ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />}{change}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "#6B7280" }}>
        <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>
        <span style={{ whiteSpace: "nowrap" }}>{percent}% da meta R$ {goal.toLocaleString("pt-BR")}</span>
      </div>
    </motion.div>
  );
}

// ─── ImageCarousel Component (para banners/cartazes) ──
function ImageCarousel({ slides }: { slides: { image?: string; title: string; subtitle?: string; action?: { label: string; href: string } }[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % slides.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 12, overflow: "hidden", minHeight: 280 }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          style={{ width: "100%", height: 280, position: "relative", background: slides[idx]?.image ? `url(${slides[idx].image}) center/cover` : "linear-gradient(135deg, #0D2545 0%, #1A3C6E 60%, #1E4A84 100%)" }}>
          {/* Overlay escuro para legibilidade */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,37,69,0.9) 0%, rgba(13,37,69,0.3) 50%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.5rem", color: "white" }}>
            <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C8922A", marginBottom: 6, fontWeight: 600 }}>
              {slides[idx]?.subtitle || "MURAL"}
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8 }}>{slides[idx]?.title}</div>
            {slides[idx]?.action && (
              <button onClick={() => { const action = slides[idx]?.action; if (action) window.location.href = action.href; }}
                style={{ background: "#C8922A", border: "none", borderRadius: 8, padding: "0.5rem 1rem", color: "white", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                {slides[idx]?.action?.label}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Navegação */}
      {slides.length > 1 && (
        <>
          <button onClick={() => setIdx(p => (p - 1 + slides.length) % slides.length)}
            style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", backdropFilter: "blur(4px)" }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setIdx(p => (p + 1) % slides.length)}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", backdropFilter: "blur(4px)" }}>
            <ChevronRight size={18} />
          </button>
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? "#C8922A" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", transition: "all 0.25s" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── NoticeCarousel Component (para avisos textuais) ───
function NoticeCarousel({ slides }: { slides: { title: string; content: React.ReactNode; icon?: React.ReactNode; color?: string }[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % slides.length), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: 12, overflow: "hidden", minHeight: 280, background: "linear-gradient(135deg, #C8922A 0%, #E8B84B 100%)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={{ padding: "1.25rem", height: "100%", display: "flex", flexDirection: "column", color: "white" }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {slides[idx]?.icon && <div style={{ color: "white" }}>{slides[idx]?.icon}</div>}
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "white", fontWeight: 700 }}>
                {slides[idx]?.title}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {slides[idx]?.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Navegação */}
      {slides.length > 1 && (
        <>
          <button onClick={() => setIdx(p => (p - 1 + slides.length) % slides.length)}
            style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setIdx(p => (p + 1) % slides.length)}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
            <ChevronRight size={14} />
          </button>
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 14 : 5, height: 5, borderRadius: 3, background: i === idx ? "white" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", transition: "all 0.25s" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── CountdownTimer ────────────────────────────────────
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
    <div style={{ display: "flex", gap: "0.4rem" }}>
      {[{ v: timeLeft.d, l: "d" }, { v: timeLeft.h, l: "h" }, { v: timeLeft.m, l: "m" }, { v: timeLeft.s, l: "s" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center", background: "#F3F4F6", borderRadius: 6, padding: "3px 6px", minWidth: 30 }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1, color: "#1A3C6E" }}>{String(v).padStart(2, "0")}</div>
          <div style={{ fontSize: "0.55rem", color: "#9CA3AF", textTransform: "uppercase" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

// ─── CopyButton ────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: "flex", alignItems: "center", gap: 4, padding: "0.35rem 0.65rem", borderRadius: 6, border: "1px solid #E5E7EB", background: copied ? "#DCFCE7" : "white", color: copied ? "#16A34A" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
      {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar</>}
    </button>
  );
}

// ─── ScanLine Icon (QR Code) ───────────────────────────
function ScanLineIcon({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE
// ════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [checkins, setCheckins] = useState<CheckinData | null>(null);
  const [userName, setUserName] = useState("Pastor");
  const [eventos, setEventos] = useState<EventoSlide[]>([]);
  const [produtos, setProdutos] = useState<ProdutoSlide[]>([]);
  const [publicLinks, setPublicLinks] = useState<{ label: string; url: string; icon: React.ReactNode }[]>([]);
  const [trialInfo, setTrialInfo] = useState<{ isTrialing: boolean; daysLeft: number } | null>(null);
  const [birthdays, setBirthdays] = useState<AniversarianteSlide[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [growthData, setGrowthData] = useState<{ mes: string; membros: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [financeData, setFinanceData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [presencaData, setPresencaData] = useState<{ dia: string; presentes: number }[]>([]);

  const nextCulto = new Date();
  nextCulto.setDate(nextCulto.getDate() + ((7 - nextCulto.getDay()) % 7 || 7));
  nextCulto.setHours(19, 0, 0, 0);

  // Fetch all data
  useEffect(() => {
    // Stats
    fetch("/api/dashboard/stats").then(r => r.json()).then((d: DashStats) => setStats(d)).catch(() => null);
    // Checkins
    fetch("/api/dashboard/checkins").then(r => r.json()).then((d: CheckinData) => setCheckins(d)).catch(() => null);
    // Growth
    fetch("/api/dashboard/growth").then(r => r.json()).then((d: { growth?: { mes: string; membros: number }[] }) => {
      if (d.growth) setGrowthData(d.growth);
    }).catch(() => null);
    // Activity
    fetch("/api/dashboard/activity").then(r => r.json()).then((d: { activities?: { icon: string; desc: string; time: string; color: string }[] }) => {
      if (d.activities) {
        const iconMap: Record<string, React.ReactNode> = {
          Users: <Users size={14} strokeWidth={1.5} />,
          DollarSign: <DollarSign size={14} strokeWidth={1.5} />,
          Calendar: <Calendar size={14} strokeWidth={1.5} />,
          CheckSquare: <CheckSquare size={14} strokeWidth={1.5} />,
        };
        setRecentActivity(d.activities.map(a => ({
          icon: iconMap[a.icon] || <Users size={14} strokeWidth={1.5} />,
          desc: a.desc,
          time: a.time,
          color: a.color,
        })));
      }
    }).catch(() => null);
    // Birthdays
    fetch("/api/members/aniversariantes").then(r => r.json()).then((d: AniversarianteSlide[]) => {
      if (Array.isArray(d)) setBirthdays(d);
    }).catch(() => null);
    // Session
    fetch("/api/auth/session").then(r => r.json()).then((d: { user?: { name?: string } }) => {
      if (d.user?.name) setUserName(d.user.name.split(" ")[0] ?? "Pastor");
    }).catch(() => null);
    // Events
    fetch("/api/eventos").then(r => r.json()).then((evts: EventoSlide[]) => {
      if (Array.isArray(evts)) {
        const upcoming = evts.filter((e: any) => e.status === "ABERTO" && new Date(e.date) > new Date()).slice(0, 5);
        setEventos(upcoming);
      }
    }).catch(() => null);
    // Tenant + links
    fetch("/api/tenant/me").then(r => r.json()).then((tenantData: { slug?: string }) => {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const links: { label: string; url: string; icon: React.ReactNode }[] = [];
      eventos.filter((e: any) => e.slug).forEach((e: any) => {
        links.push({ label: e.title, url: `${origin}/inscricao/${e.slug}`, icon: <Calendar size={14} strokeWidth={1.5} color="#1A3C6E" /> });
      });
      links.push({ label: "Cadastro de Membro", url: `${origin}/cadastro/${tenantData?.slug || ""}`, icon: <UserPlus size={14} strokeWidth={1.5} color="#1A3C6E" /> });
      links.push({ label: "Loja pública", url: `${origin}/loja/${tenantData?.slug || ""}`, icon: <ShoppingBag size={14} strokeWidth={1.5} color="#1A3C6E" /> });
      setPublicLinks(links);
    }).catch(() => null);
    // Products
    fetch("/api/produtos").then(r => r.json()).then((prods: ProdutoSlide[]) => {
      if (Array.isArray(prods)) setProdutos(prods.filter((p: any) => p.ativo).slice(0, 5));
    }).catch(() => null);
    // Trial
    fetch("/api/tenant/trial").then(r => r.json()).then((d: { isTrialing?: boolean; daysLeft?: number }) => {
      if (d.isTrialing !== undefined) setTrialInfo({ isTrialing: d.isTrialing, daysLeft: d.daysLeft || 0 });
    }).catch(() => null);
    // Notices
    fetch("/api/dashboard/notices").then(r => r.json()).then((d: { notices?: NoticeItem[] }) => {
      if (d.notices) setNotices(d.notices);
    }).catch(() => null);
    // Finance data (dízimos/ofertas/outros)
    fetch("/api/dashboard/stats").then(r => r.json()).then((d: DashStats) => {
      // Simular breakdown financeiro até ter API específica
      const total = d.totalFinances || 15400;
      setFinanceData([
        { name: "Dízimos", value: Math.round(total * 0.73), color: "#1A3C6E" },
        { name: "Ofertas", value: Math.round(total * 0.21), color: "#C8922A" },
        { name: "Outros", value: Math.round(total * 0.06), color: "#94A3B8" },
      ]);
    }).catch(() => null);
    // Presença por culto (últimos 4 domingos) — simulado até ter API
    setPresencaData([
      { dia: "Dom 5", presentes: 58 },
      { dia: "Dom 12", presentes: 72 },
      { dia: "Dom 19", presentes: 65 },
      { dia: "Dom 26", presentes: 48 },
    ]);
  }, []);

  const totalMembers = stats?.totalMembers ?? 247;
  const activeGroups = stats?.activeGroups ?? 18;
  const upcomingEvents = stats?.upcomingEvents ?? 4;
  const totalFinances = Math.round(stats?.totalFinances ?? 8450);
  const checkinsHoje = checkins?.checkinsHoje ?? 47;

  // Sparkline data (simulado com variação realista)
  const sparkMembers = [280, 295, 310, 305, 320, 335, totalMembers];
  const sparkFinances = [7200, 6800, 7500, 8200, 7900, 8600, totalFinances];
  const sparkCheckins = [42, 38, 45, 52, 48, 55, checkinsHoje];
  const sparkEvents = [3, 4, 3, 5, 4, 6, upcomingEvents];

  // Status colors
  const statusColor: Record<string, { bg: string; color: string }> = {
    Publicado: { bg: "#DCFCE7", color: "#16A34A" },
    Rascunho: { bg: "#FEF9C3", color: "#CA8A04" },
    Arquivado: { bg: "#F3F4F6", color: "#6B7280" },
  };

  // ─── Slides para os dois carrosséis ──────────────────
  const weekBirthdays = getWeekAniversariantes(birthdays);
  const nextEvent = eventos[0];

  // Carrossel da ESQUERDA (maior) — Banners/Cartazes/Mural com imagens
  const bannerSlides = [
    {
      image: nextEvent?.banner || undefined,
      title: nextEvent?.title || "Culto de Domingo",
      subtitle: nextEvent ? "EVENTO EM DESTAQUE" : "PRÓXIMO CULTO",
      action: nextEvent ? { label: "Ver Detalhes →", href: `/eventos/${nextEvent.id}` } : { label: "Abrir Check-in", href: "/eventos/checkin" },
    },
    ...eventos.slice(1, 3).map(e => ({
      image: e.banner || undefined,
      title: e.title,
      subtitle: "EVENTO",
      action: { label: "Inscrever-se →", href: `/eventos/${e.id}` },
    })),
    ...produtos.slice(0, 2).map(p => ({
      image: p.foto || undefined,
      title: p.nome,
      subtitle: "LOJA",
      action: { label: "Ver Produto →", href: "/vendas/produtos" },
    })),
    {
      title: "EBD — Material do Trimestre",
      subtitle: "ESCOLA BÍBLICA",
      action: { label: "Acessar →", href: "/ensino" },
    },
  ].filter(s => s.title);

  // Carrossel da DIREITA (menor) — Avisos textuais sem imagens
  const noticeSlides = [
    {
      title: "Próximo Culto",
      color: "#1A3C6E",
      icon: <Calendar size={16} strokeWidth={1.5} />,
      content: (
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: 4 }}>Culto de Domingo</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
            {nextCulto.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} — 19h00
          </div>
          <CountdownTimer targetDate={nextCulto} />
          <div style={{ marginTop: 10 }}>
            <button onClick={() => window.location.href = "/eventos/checkin"}
              style={{ background: "white", border: "none", borderRadius: 8, padding: "0.4rem 0.875rem", color: "#C8922A", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <ScanLineIcon size={13} strokeWidth={1.5} /> Abrir check-in
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "Aniversariantes",
      color: "#C8922A",
      icon: <Users size={16} strokeWidth={1.5} />,
      content: weekBirthdays.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {weekBirthdays.slice(0, 3).map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "white" }}>
                {b.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "white" }}>{b.name}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}>{b.date} {b.daysLeft === 0 ? "• Hoje!" : b.daysLeft === 1 ? "• Amanhã" : `• em ${b.daysLeft}d`}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>Nenhum aniversariante esta semana</div>
      ),
    },
    {
      title: "Avisos",
      color: "#7C3AED",
      icon: <Bell size={16} strokeWidth={1.5} />,
      content: notices.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {notices.slice(0, 3).map((n, i) => (
            <div key={i} style={{ padding: "0.4rem 0", borderBottom: i < notices.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "white" }}>{n.title}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}>{n.author} • {n.date}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>Nenhum aviso recente</div>
      ),
    },
    {
      title: "Arte do Culto",
      color: "#0EA5E9",
      icon: <Calendar size={16} strokeWidth={1.5} />,
      content: (
        <div>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "white", marginBottom: 4 }}>Culto de Domingo</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>Arte criada automaticamente para compartilhamento nas redes sociais.</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { const url = `${window.location.origin}/cultos`; navigator.clipboard.writeText(url); }}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, padding: "0.35rem 0.65rem", color: "white", fontWeight: 500, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Copy size={12} /> Copiar link
            </button>
            <button onClick={() => window.location.href = "/cultos"}
              style={{ background: "white", border: "none", borderRadius: 6, padding: "0.35rem 0.65rem", color: "#C8922A", fontWeight: 500, fontSize: "0.75rem", cursor: "pointer" }}>
              Ver cultos
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="page-pad" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header com Faixa Azul */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 100%)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", color: "white" }}>
        <div>
          <h1 className="dashboard-greeting" style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "white" }}>{getGreeting()}, {userName}!</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", marginTop: 2, fontSize: "0.875rem", textTransform: "capitalize" }}>{formatDate()}</p>
        </div>
        <button style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "0.6rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", color: "white", fontSize: "0.875rem", backdropFilter: "blur(4px)" }}>
          <Bell size={17} strokeWidth={1.5} />
          <span style={{ background: "#DC2626", color: "white", fontSize: "0.65rem", fontWeight: 700, borderRadius: 10, padding: "1px 5px" }}>3</span>
        </button>
      </motion.div>

      {/* Dois Carrosséis lado a lado */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* ESQUERDA (maior) — Banners/Cartazes/Mural */}
        <ImageCarousel slides={bannerSlides} />
        {/* DIREITA (menor) — Avisos textuais */}
        <NoticeCarousel slides={noticeSlides} />
      </div>

      {/* Links para Compartilhar — Mais fino */}
      {publicLinks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          style={{ background: "white", borderRadius: 12, padding: "0.75rem 1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <LinkIcon size={14} strokeWidth={1.5} color="#1A3C6E" />
            <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#111827" }}>Links para Compartilhar</h3>
          </div>
          <div className="links-row" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {publicLinks.map((link, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.5rem", borderRadius: 6, background: "#FAFAFA", border: "1px solid #F3F4F6", minWidth: 0, flex: "1 1 200px" }}>
                {link.icon}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.label}</div>
                  <div style={{ fontSize: "0.65rem", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{link.url}</div>
                </div>
                <CopyButton text={link.url} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gráficos — 3 colunas (MOVIDO PARA CIMA) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
        {/* Crescimento de Membros */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Crescimento de Membros</h3>
            <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, padding: "2px 8px" }}>+32% período</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={growthData.length > 0 ? growthData : [{ mes: "Jan", membros: 300 }, { mes: "Fev", membros: 320 }, { mes: "Mar", membros: 340 }, { mes: "Abr", membros: 360 }, { mes: "Mai", membros: 380 }, { mes: "Jun", membros: totalMembers }]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs><linearGradient id="gradMembros" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A3C6E" stopOpacity={0.15}/><stop offset="95%" stopColor="#1A3C6E" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} />
              <Area type="monotone" dataKey="membros" stroke="#1A3C6E" strokeWidth={2} fill="url(#gradMembros)" dot={{ r: 3, fill: "#1A3C6E" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Financeiro — Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Financeiro — Maio</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={financeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {financeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString("pt-BR")}`} contentStyle={{ border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            {financeData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ color: "#374151" }}>{d.name}</span>
                <span style={{ color: "#6B7280", fontWeight: 600 }}>{Math.round((d.value / (financeData.reduce((a, b) => a + b.value, 0) || 1)) * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Presença por Culto */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "#111827" }}>Presença por Culto</h3>
            <span style={{ background: "#EFF6FF", color: "#1A3C6E", fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, padding: "2px 8px" }}>Últ. 4 domingos</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={presencaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "none", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }} />
              <Bar dataKey="presentes" fill="#1A3C6E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Stat Cards — 2 linhas de 3 (AGORA ABAIXO DOS GRÁFICOS) */}
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
        <StatCard icon={<Users size={20} strokeWidth={1.5} />} label="Total Membros" value={totalMembers} change="+12%" positive color="#1A3C6E" delay={0.45} sparklineData={sparkMembers} />
        <StatCard icon={<DollarSign size={20} strokeWidth={1.5} />} label="Saldo do Mês" value={totalFinances} change="+8%" positive color="#16A34A" delay={0.5} sparklineData={sparkFinances} />
        <StatCard icon={<CheckSquare size={20} strokeWidth={1.5} />} label="Check-ins Hoje" value={checkinsHoje} change={`${checkins?.variacao && checkins.variacao >= 0 ? "+" : ""}${checkins?.variacao ?? -5}%`} positive={(checkins?.variacao ?? -5) >= 0} color="#7C3AED" delay={0.55} sparklineData={sparkCheckins} />
      </div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard icon={<Calendar size={20} strokeWidth={1.5} />} label="Eventos Ativos" value={upcomingEvents} change="+2" positive color="#C8922A" delay={0.6} sparklineData={sparkEvents} />
        <ProgressStatCard icon={<DollarSign size={20} strokeWidth={1.5} />} label="Dízimos (Mês)" value={Math.round(totalFinances * 0.73)} goal={8000} change="+15%" positive color="#1A3C6E" delay={0.65} />
        <StatCard icon={<Users size={20} strokeWidth={1.5} />} label="Presença Média" value={68} change="+3pts" positive color="#0EA5E9" delay={0.7} sparklineData={[62, 64, 65, 63, 66, 67, 68]} />
      </div>

      {/* Seções Inferiores — 2 colunas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Últimas Atividades */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.4 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Últimas Atividades</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentActivity.length > 0 ? recentActivity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "0.625rem", padding: "0.6rem 0", borderBottom: i < recentActivity.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${a.color}12`, display: "flex", alignItems: "center", justifyContent: "center", color: a.color, flexShrink: 0, marginTop: 1 }}>{a.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.3 }}>{a.desc}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: 1 }}>{a.time}</div>
                </div>
              </div>
            )) : (
              <p style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Nenhuma atividade recente</p>
            )}
          </div>
        </motion.div>

        {/* Coluna Direita: Aniversariantes + Pedidos de Oração */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Aniversariantes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}
            style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Aniversariantes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {birthdays.length === 0 ? (
                <p style={{ color: "#9CA3AF", fontSize: 14, textAlign: "center", padding: "20px 0" }}>Nenhum aniversariante este mês</p>
              ) : (
                birthdays.slice(0, 5).map((b, i) => (
                  <div key={b.id || i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0.625rem", borderRadius: 8, background: i === 0 ? "#FFF8EE" : "transparent", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (i !== 0) e.currentTarget.style.background = "#F9FAFB"; }}
                    onMouseLeave={e => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(i * 67 + 210)},60%,88%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: `hsl(${(i * 67 + 210)},50%,35%)`, flexShrink: 0 }}>
                      {b.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{b.date}</div>
                    </div>
                    <span style={{ background: (b.daysLeft || 0) <= 3 ? "#FEF3C7" : "#F3F4F6", color: (b.daysLeft || 0) <= 3 ? "#D97706" : "#6B7280", fontSize: "0.68rem", fontWeight: 600, borderRadius: 10, padding: "2px 7px", flexShrink: 0 }}>
                      {b.daysLeft === 0 ? "Hoje!" : b.daysLeft === 1 ? "Amanhã" : `${b.daysLeft}d`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Pedidos de Oração */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.4 }}
            style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Pedidos de Oração</h3>
              <span style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, padding: "2px 8px" }}>5 novos</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { nome: "anônimo", tempo: "há 1h", cor: "#C8922A" },
                { nome: "Paulo Mendes", tempo: "há 3h", cor: "#1A3C6E" },
                { nome: "anônimo", tempo: "há 6h", cor: "#C8922A" },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.5rem 0", borderBottom: i < 2 ? "1px solid #F9FAFB" : "none" }}>
                  <div style={{ width: 3, height: 32, borderRadius: 2, background: p.cor, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.8rem", color: "#374151" }}>Pedido de oração — {p.nome}</div>
                    <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: 1 }}>{p.tempo}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
