"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  DollarSign,
  Calendar,
  CheckSquare,
  Bell,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
} from "lucide-react";

interface DashStats {
  totalMembers: number;
  activeGroups: number;
  upcomingEvents: number;
  totalFinances: number;
  recentMembers: { id: string; name: string; email: string; status: string; createdAt: string }[];
}

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

const GROWTH_DATA = [
  { mes: "Out", membros: 312 },
  { mes: "Nov", membros: 334 },
  { mes: "Dez", membros: 358 },
  { mes: "Jan", membros: 371 },
  { mes: "Fev", membros: 389 },
  { mes: "Mar", membros: 412 },
];

const BIRTHDAYS = [
  { name: "Ana Paula Silva", date: "27 mar", daysLeft: 2 },
  { name: "Carlos Eduardo", date: "29 mar", daysLeft: 4 },
  { name: "Mariana Costa", date: "01 abr", daysLeft: 7 },
  { name: "João Batista", date: "03 abr", daysLeft: 9 },
  { name: "Fernanda Lima", date: "05 abr", daysLeft: 11 },
];

const NOTICES = [
  { id: 1, title: "Culto de Páscoa — inscrições abertas", author: "Admin", date: "25 mar", status: "Publicado" },
  { id: 2, title: "Reunião de líderes — 5ª feira às 19h", author: "Pastor João", date: "24 mar", status: "Publicado" },
  { id: 3, title: "Arrecadação de alimentos — abril", author: "Admin", date: "22 mar", status: "Rascunho" },
  { id: 4, title: "Escala de louvor — semana santa", author: "Ministério Louvor", date: "20 mar", status: "Publicado" },
  { id: 5, title: "Manutenção do sistema — domingo 02h", author: "Admin", date: "18 mar", status: "Arquivado" },
];

const ACTIVITY = [
  { icon: <Users size={14} strokeWidth={1.5} />, desc: "Novo membro: Beatriz Santos", time: "5 min atrás", color: "#1A3C6E" },
  { icon: <DollarSign size={14} strokeWidth={1.5} />, desc: "Dízimo registrado: R$ 250", time: "18 min atrás", color: "#16A34A" },
  { icon: <CheckSquare size={14} strokeWidth={1.5} />, desc: "Check-in no culto: 47 pessoas", time: "1h atrás", color: "#C8922A" },
  { icon: <Calendar size={14} strokeWidth={1.5} />, desc: "Evento criado: Retiro de Jovens", time: "2h atrás", color: "#7C3AED" },
  { icon: <Users size={14} strokeWidth={1.5} />, desc: "Grupo atualizado: Células Norte", time: "3h atrás", color: "#1A3C6E" },
  { icon: <DollarSign size={14} strokeWidth={1.5} />, desc: "Oferta registrada: R$ 1.800", time: "4h atrás", color: "#16A34A" },
];

function StatCard({ icon, label, value, change, positive, color, delay }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  change: string;
  positive: boolean;
  color: string;
  delay: number;
}) {
  const count = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
      style={{
        flex: 1,
        background: "white",
        borderRadius: "12px",
        padding: "1.125rem 1.25rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        cursor: "default",
        transition: "box-shadow 0.2s",
      }}
    >
      <div style={{
        width: "42px", height: "42px", borderRadius: "10px",
        background: `${color}14`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#6B7280", fontSize: "0.75rem", marginBottom: "2px", fontWeight: 500 }}>{label}</div>
        <div style={{ color: "#111827", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2 }}>
          {label === "Saldo do Mês" ? `R$ ${count.toLocaleString("pt-BR")}` : count.toLocaleString("pt-BR")}
        </div>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: "2px",
        color: positive ? "#16A34A" : "#DC2626",
        fontSize: "0.75rem", fontWeight: 600,
        flexShrink: 0,
      }}>
        {positive ? <TrendingUp size={13} strokeWidth={2} /> : <TrendingDown size={13} strokeWidth={2} />}
        {change}
      </div>
    </motion.div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    function calc() {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      {[{ v: timeLeft.d, l: "dias" }, { v: timeLeft.h, l: "horas" }, { v: timeLeft.m, l: "min" }, { v: timeLeft.s, l: "seg" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, minWidth: "48px" }}>
            {String(v).padStart(2, "0")}
          </div>
          <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [userName, setUserName] = useState("Pastor");
  const nextCulto = new Date();
  nextCulto.setDate(nextCulto.getDate() + ((7 - nextCulto.getDay()) % 7 || 7));
  nextCulto.setHours(19, 0, 0, 0);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data: DashStats) => setStats(data))
      .catch(() => null);

    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: { user?: { name?: string } }) => {
        if (data.user?.name) setUserName(data.user.name.split(" ")[0] ?? "Pastor");
      })
      .catch(() => null);
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>
            {getGreeting()}, {userName}!
          </h1>
          <p style={{ color: "#6B7280", marginTop: "2px", fontSize: "0.875rem", textTransform: "capitalize" }}>
            {formatDate()}
          </p>
        </div>
        <button style={{
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          padding: "0.6rem 0.75rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#374151",
          fontSize: "0.875rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <Bell size={17} strokeWidth={1.5} />
          <span style={{
            background: "#DC2626",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 700,
            borderRadius: "10px",
            padding: "1px 5px",
          }}>3</span>
        </button>
      </motion.div>

      {/* Row 1 — Stat cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <StatCard icon={<Users size={20} strokeWidth={1.5} />} label="Total Membros" value={totalMembers} change="+12%" positive color="#1A3C6E" delay={0} />
        <StatCard icon={<DollarSign size={20} strokeWidth={1.5} />} label="Saldo do Mês" value={totalFinances} change="+8%" positive color="#16A34A" delay={0.1} />
        <StatCard icon={<Calendar size={20} strokeWidth={1.5} />} label="Eventos" value={upcomingEvents} change="+2" positive color="#C8922A" delay={0.2} />
        <StatCard icon={<CheckSquare size={20} strokeWidth={1.5} />} label="Check-ins Hoje" value={47} change="-5%" positive={false} color="#7C3AED" delay={0.3} />
      </div>

      {/* Row 2 — Chart + Birthdays */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          style={{
            flex: "0 0 60%",
            background: "white",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Crescimento de Membros</h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#6B7280" }}>Últimos 6 meses</p>
            </div>
            <span style={{
              background: "#DCFCE7", color: "#16A34A",
              fontSize: "0.75rem", fontWeight: 600,
              borderRadius: "20px", padding: "3px 10px",
            }}>
              +32% no período
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={GROWTH_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A3C6E" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#1A3C6E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "none", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "0.8rem" }}
                labelStyle={{ fontWeight: 600, color: "#111827" }}
              />
              <Area type="monotone" dataKey="membros" stroke="#1A3C6E" strokeWidth={2.5} fill="url(#grad)" dot={{ r: 4, fill: "#1A3C6E", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          style={{
            flex: 1,
            background: "white",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>
            Aniversariantes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {BIRTHDAYS.map((b, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.5rem 0.625rem",
                borderRadius: "8px",
                background: i === 0 ? "#FFF8EE" : "transparent",
                transition: "background 0.15s",
              }}
                onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: `hsl(${(i * 67 + 210)},60%,88%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 700,
                  color: `hsl(${(i * 67 + 210)},50%,35%)`,
                  flexShrink: 0,
                }}>
                  {b.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{b.date}</div>
                </div>
                <span style={{
                  background: b.daysLeft <= 3 ? "#FEF3C7" : "#F3F4F6",
                  color: b.daysLeft <= 3 ? "#D97706" : "#6B7280",
                  fontSize: "0.68rem", fontWeight: 600,
                  borderRadius: "10px", padding: "2px 7px", flexShrink: 0,
                }}>
                  {b.daysLeft}d
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3 — Notices table + Activity */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{
            flex: "0 0 65%",
            background: "white",
            borderRadius: "12px",
            padding: "1.25rem 1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Avisos Recentes</h3>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#1A3C6E", fontSize: "0.8rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "2px" }}>
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Aviso</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Autor</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Data</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {NOTICES.map((n) => (
                <tr key={n.id} style={{ borderBottom: "1px solid #F9FAFB", transition: "background 0.1s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "0.625rem 0", color: "#111827", maxWidth: "220px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>
                      {n.title}
                    </div>
                  </td>
                  <td style={{ padding: "0.625rem 0.5rem", color: "#6B7280", whiteSpace: "nowrap" }}>{n.author}</td>
                  <td style={{ padding: "0.625rem 0.5rem", color: "#9CA3AF", whiteSpace: "nowrap" }}>{n.date}</td>
                  <td style={{ padding: "0.625rem 0" }}>
                    <span style={{
                      background: statusColor[n.status]?.bg ?? "#F3F4F6",
                      color: statusColor[n.status]?.color ?? "#6B7280",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      borderRadius: "10px",
                      padding: "2px 8px",
                    }}>
                      {n.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          style={{
            flex: 1,
            background: "white",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>
            Atividade Recente
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "0.625rem", padding: "0.5rem 0", borderBottom: i < ACTIVITY.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "6px",
                  background: `${a.color}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: a.color, flexShrink: 0, marginTop: "1px",
                }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.3 }}>{a.desc}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "1px" }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 4 — Next service countdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        style={{
          background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 60%, #1E4A84 100%)",
          borderRadius: "12px",
          padding: "1.5rem 2rem",
          boxShadow: "0 4px 16px rgba(26,60,110,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          color: "white",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(200,146,42,0.9)", marginBottom: "4px", fontWeight: 600 }}>
            Próximo Culto
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Culto de Domingo</div>
          <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
            {nextCulto.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })} · 19h00
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <CountdownTimer targetDate={nextCulto} />
          <button style={{
            background: "#C8922A",
            border: "none",
            borderRadius: "8px",
            padding: "0.625rem 1.25rem",
            color: "white",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            <ScanLine size={16} strokeWidth={1.5} />
            Abrir check-in
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ScanLine({ size, strokeWidth }: { size: number; strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
}
