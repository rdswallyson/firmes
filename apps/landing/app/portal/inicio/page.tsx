"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar, Bell, User, LogOut, Home, BookOpen, Users, ChevronRight,
} from "lucide-react";

interface PortalMember {
  id: string;
  name: string;
  email: string;
}

export default function PortalInicioPage() {
  const router = useRouter();
  const [member, setMember] = useState<PortalMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usar sessao unica (cookie 'session') via /api/portal/me
    fetch("/api/portal/me")
      .then(r => {
        if (!r.ok) throw new Error("Nao autorizado");
        return r.json();
      })
      .then((d: { member?: PortalMember }) => {
        if (d.member) setMember(d.member);
        else throw new Error("Sem dados de membro");
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;
  }

  if (!member) return null;

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE1" }}>
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 100%)", padding: "1rem 1.5rem", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>FIRMES Portal</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>{greeting()}, {member.name.split(" ")[0]}!</div>
        </div>
        <button onClick={logout} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "0.5rem", cursor: "pointer", color: "white" }}>
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </header>

      {/* Menu */}
      <nav style={{ background: "white", padding: "0.75rem 1.5rem", display: "flex", gap: "1.5rem", borderBottom: "1px solid #E5E7EB", overflowX: "auto" }}>
        {[
          { icon: <Home size={16} />, label: "Início", active: true },
          { icon: <Calendar size={16} />, label: "Eventos", active: false },
          { icon: <Bell size={16} />, label: "Avisos", active: false },
          { icon: <User size={16} />, label: "Meu Perfil", active: false },
        ].map((item, i) => (
          <button key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0", background: "none", border: "none", cursor: "pointer", color: item.active ? "#1A3C6E" : "#6B7280", fontSize: "0.85rem", fontWeight: item.active ? 600 : 500, borderBottom: item.active ? "2px solid #1A3C6E" : "2px solid transparent", whiteSpace: "nowrap" }}>
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <div style={{ padding: "1.5rem", maxWidth: "800px", margin: "0 auto" }}>
        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <Card icon={<Calendar size={24} color="#1A3C6E" />} title="Próximos Eventos" value="3" subtitle="Este mês" color="#1A3C6E" />
          <Card icon={<Bell size={24} color="#C8922A" />} title="Avisos" value="2" subtitle="Não lidos" color="#C8922A" />
          <Card icon={<BookOpen size={24} color="#16A34A" />} title="Minha Presença" value="85%" subtitle="Este ano" color="#16A34A" />
          <Card icon={<Users size={24} color="#7C3AED" />} title="Meu Grupo" value="Ativo" subtitle="Célula Jovens" color="#7C3AED" />
        </div>

        {/* Avisos recentes */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 700, color: "#111827" }}>Avisos Recentes</h3>
            <button style={{ fontSize: "0.75rem", color: "#1A3C6E", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Ver todos →</button>
          </div>
          {[
            { title: "Culto Especial de Quinta", date: "Hoje, 19h30", type: "Culto" },
            { title: "Churrasco da Família", date: "Sábado, 12h", type: "Evento" },
          ].map((aviso, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: i < 1 ? "1px solid #F3F4F6" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Bell size={16} color="#1A3C6E" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "#111827" }}>{aviso.title}</div>
                <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{aviso.date}</div>
              </div>
              <ChevronRight size={16} color="#9CA3AF" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Card({ icon, title, value, subtitle, color }: { icon: React.ReactNode; title: string; value: string; subtitle: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "0.875rem" }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{subtitle}</div>
      </div>
    </motion.div>
  );
}
