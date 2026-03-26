"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Cake, MessageCircle, Mail } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  birthDate: string | null;
}

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function AniversariantesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    fetch("/api/members?limit=100")
      .then((r) => r.json())
      .then((d: { members: Member[] }) => setMembers(d.members ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const birthdaysThisMonth = useMemo(() => {
    return members
      .filter((m) => {
        if (!m.birthDate) return false;
        const bd = new Date(m.birthDate);
        return bd.getMonth() === month;
      })
      .sort((a, b) => {
        const da = new Date(a.birthDate!).getDate();
        const db = new Date(b.birthDate!).getDate();
        return da - db;
      });
  }, [members, month]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  function getDaysUntilBirthday(birthDate: string) {
    const bd = new Date(birthDate);
    const next = new Date(year, month, bd.getDate());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((next.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return "Passou";
    if (diff === 0) return "Hoje!";
    return `${diff}d`;
  }

  function daysInMonth(m: number, y: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function firstDayOfMonth(m: number, y: number) {
    return new Date(y, m, 1).getDay();
  }

  const totalDays = daysInMonth(month, year);
  const firstDay = firstDayOfMonth(month, year);

  const birthdayDays = new Set(
    birthdaysThisMonth.map((m) => new Date(m.birthDate!).getDate())
  );

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Aniversariantes</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Calendário de aniversários dos membros</p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        {/* Calendar */}
        <div style={{ flex: "0 0 340px", background: "white", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#6B7280" }}><ChevronLeft size={18} /></button>
            <span style={{ fontWeight: 700, color: "#0D2545", fontSize: "0.95rem" }}>{MONTH_NAMES[month]} {year}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#6B7280" }}><ChevronRight size={18} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", textAlign: "center" }}>
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={i} style={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 600, padding: "0.35rem 0" }}>{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const isBday = birthdayDays.has(day);
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
              return (
                <div key={day} style={{
                  padding: "0.4rem 0", borderRadius: "8px",
                  background: isBday ? "#FEF3C7" : isToday ? "#EEF2FF" : "transparent",
                  color: isBday ? "#D97706" : isToday ? "#1A3C6E" : "#374151",
                  fontWeight: isBday || isToday ? 700 : 400,
                  fontSize: "0.8rem",
                  position: "relative",
                }}>
                  {day}
                  {isBday && <div style={{ position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: "#D97706" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Birthday list */}
        <div style={{ flex: 1 }}>
          <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>
                <Cake size={16} strokeWidth={1.5} style={{ verticalAlign: "middle", marginRight: "0.4rem", color: "#C8922A" }} />
                {MONTH_NAMES[month]} — {birthdaysThisMonth.length} aniversariante{birthdaysThisMonth.length !== 1 ? "s" : ""}
              </h3>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
            ) : birthdaysThisMonth.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum aniversariante neste mês</div>
            ) : (
              <div>
                {birthdaysThisMonth.map((m, i) => {
                  const bd = new Date(m.birthDate!);
                  const daysLabel = getDaysUntilBirthday(m.birthDate!);
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", borderBottom: i < birthdaysThisMonth.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "50%",
                        background: m.photo ? `url(${m.photo}) center/cover` : `hsl(${m.name.charCodeAt(0) * 7},55%,82%)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8rem", fontWeight: 700,
                        color: `hsl(${m.name.charCodeAt(0) * 7},40%,30%)`,
                        flexShrink: 0,
                      }}>
                        {!m.photo && m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, color: "#111827", fontSize: "0.875rem" }}>{m.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{bd.getDate()} de {MONTH_NAMES[bd.getMonth()]}</div>
                      </div>
                      <span style={{
                        background: daysLabel === "Hoje!" ? "#DCFCE7" : daysLabel === "Passou" ? "#F3F4F6" : "#FEF3C7",
                        color: daysLabel === "Hoje!" ? "#16A34A" : daysLabel === "Passou" ? "#9CA3AF" : "#D97706",
                        fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px",
                      }}>
                        {daysLabel}
                      </span>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {m.phone && (
                          <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#16A34A", display: "flex" }}
                            title="WhatsApp">
                            <MessageCircle size={15} strokeWidth={1.5} />
                          </a>
                        )}
                        {m.email && (
                          <a href={`mailto:${m.email}?subject=Feliz Aniversário!`}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#2563EB", display: "flex" }}
                            title="E-mail">
                            <Mail size={15} strokeWidth={1.5} />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
