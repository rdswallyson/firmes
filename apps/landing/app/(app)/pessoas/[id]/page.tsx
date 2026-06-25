"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pencil, CreditCard, Calendar, Phone, Mail, MapPin,
  Clock, UserCheck, Church, FileText, Users, Heart, Tag, Briefcase,
  Smartphone, Lock, Globe, Baby, UserPlus, DollarSign, TrendingUp, TrendingDown,
  ChevronRight, BarChart3, Award, BookOpen, MoreHorizontal,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1B2B4B";
const GOLD = "#C9993F";
const BG = "#F5F0EB";

interface MemberData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  birthDate: string | null;
  baptismDate: string | null;
  address: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  number: string | null;
  complement: string | null;
  role: string | null;
  groupId: string | null;
  status: string;
  notes: string | null;
  memberSince: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sexo: string | null;
  estadoCivil: string | null;
  whatsapp: string | null;
  dataBatismoEspirito: string | null;
  ministerios: string[];
  disponibilidadeDias: string[];
  disponibilidadeTurnos: string[];
  tags: string[];
  conjugeId: string | null;
  filhos: any[];
  indicadoPorId: string | null;
  comoConheceu: string | null;
  observacoesPastorais: string | null;
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Ativo", bg: "#DCFCE7", color: "#16A34A" },
  VISITOR: { label: "Visitante", bg: "#DBEAFE", color: "#2563EB" },
  INACTIVE: { label: "Inativo", bg: "#FEE2E2", color: "#DC2626" },
  PENDING: { label: "Pendente", bg: "#FEF3C7", color: "#D97706" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function daysSince(d: string | null) {
  if (!d) return 0;
  const diff = Date.now() - new Date(d).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function avatarColor(name: string) {
  const hue = name.charCodeAt(0) * 7 % 360;
  return { bg: `hsl(${hue}, 55%, 88%)`, color: `hsl(${hue}, 45%, 32%)` };
}

export default function PerfilMembroPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [conjuge, setConjuge] = useState<{ name: string } | null>(null);
  const [indicadoPor, setIndicadoPor] = useState<{ name: string } | null>(null);

  const [financas, setFinancas] = useState<any[]>([]);
  const [totalFinancasAno, setTotalFinancasAno] = useState(0);
  const [loadingFinancas, setLoadingFinancas] = useState(true);

  const [checkins, setCheckins] = useState<any[]>([]);
  const [loadingCultos, setLoadingCultos] = useState(true);

  const [escalasMembro, setEscalasMembro] = useState<any[]>([]);
  const [loadingEscalas, setLoadingEscalas] = useState(true);

  const [gruposMembro, setGruposMembro] = useState<any[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);

  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);

  useEffect(() => {
    fetch(`/api/members/${params.id}`)
      .then((r) => r.json())
      .then((d: { member?: MemberData }) => {
        setMember(d.member ?? null);
        if (d.member?.conjugeId) {
          fetch(`/api/members/${d.member.conjugeId}`)
            .then(r => r.json())
            .then((c: { member?: { name: string } }) => setConjuge(c.member ?? null))
            .catch(() => null);
        }
        if (d.member?.indicadoPorId) {
          fetch(`/api/members/${d.member.indicadoPorId}`)
            .then(r => r.json())
            .then((c: { member?: { name: string } }) => setIndicadoPor(c.member ?? null))
            .catch(() => null);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    setLoadingFinancas(true);
    fetch(`/api/financeiro?memberId=${params.id}&limit=5`)
      .then(r => r.json())
      .then((d: { finances?: any[] }) => {
        setFinancas(d.finances || []);
        const anoAtual = new Date().getFullYear();
        const totalAno = (d.finances || [])
          .filter((f: any) => new Date(f.date).getFullYear() === anoAtual && f.type === "RECEITA")
          .reduce((s: number, f: any) => s + (Number(f.amount) || 0), 0);
        setTotalFinancasAno(totalAno);
      })
      .catch(() => { setFinancas([]); setTotalFinancasAno(0); })
      .finally(() => setLoadingFinancas(false));
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    setLoadingCultos(true);
    fetch(`/api/cultos/presenca`)
      .then(r => r.json())
      .then((d: { checkins?: any[] }) => {
        const doMembro = (d.checkins || []).filter((c: any) => c.memberId === params.id || c.nome?.toLowerCase().includes(member?.name?.toLowerCase() || ""));
        setCheckins(doMembro);
      })
      .catch(() => setCheckins([]))
      .finally(() => setLoadingCultos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    setLoadingEscalas(true);
    fetch(`/api/escalas`)
      .then(r => r.json())
      .then((d: { escalas?: any[] }) => {
        const doMembro = (d.escalas || []).filter((e: any) =>
          e.membros?.some((m: any) => m.memberId === params.id)
        ).slice(0, 3);
        setEscalasMembro(doMembro);
      })
      .catch(() => setEscalasMembro([]))
      .finally(() => setLoadingEscalas(false));
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    setLoadingGrupos(true);
    fetch(`/api/grupos`)
      .then(r => r.json())
      .then((d: { grupos?: any[] }) => {
        const doMembro = (d.grupos || []).filter((g: any) =>
          g.leader?.id === params.id || g.leaderId === params.id
        );
        setGruposMembro(doMembro);
      })
      .catch(() => setGruposMembro([]))
      .finally(() => setLoadingGrupos(false));
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    setLoadingEventos(true);
    fetch(`/api/inscricoes`)
      .then(r => r.json())
      .then((d: any[]) => {
        const doMembro = (Array.isArray(d) ? d : []).filter((i: any) =>
          i.memberId === params.id || i.nome?.toLowerCase().includes(member?.name?.toLowerCase() || "")
        ).slice(0, 3);
        setInscricoes(doMembro);
      })
      .catch(() => setInscricoes([]))
      .finally(() => setLoadingEventos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>;
  }

  if (!member) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "#DC2626" }}>Membro não encontrado</div>;
  }

  const st = STATUS_LABEL[member.status] ?? { label: "Ativo", bg: "#DCFCE7", color: "#16A34A" };
  const av = avatarColor(member.name);
  const diasMembro = daysSince(member.memberSince);

  const infoCards = [
    { icon: <Mail size={16} strokeWidth={1.5} />, label: "Email", value: member.email, color: "#2563EB" },
    { icon: <Phone size={16} strokeWidth={1.5} />, label: "Telefone", value: member.phone, color: "#7C3AED" },
    { icon: <Smartphone size={16} strokeWidth={1.5} />, label: "WhatsApp", value: member.whatsapp, color: "#16A34A" },
    { icon: <Calendar size={16} strokeWidth={1.5} />, label: "Nascimento", value: formatDate(member.birthDate), color: "#D97706" },
    { icon: <Heart size={16} strokeWidth={1.5} />, label: "Estado Civil", value: member.estadoCivil, color: "#EC4899" },
    { icon: <UserCheck size={16} strokeWidth={1.5} />, label: "Cargo", value: member.role, color: "#1B2B4B" },
    { icon: <Church size={16} strokeWidth={1.5} />, label: "Congregação", value: member.groupId ?? "Sede", color: "#0891B2" },
    { icon: <Clock size={16} strokeWidth={1.5} />, label: "Membro desde", value: `${formatDate(member.memberSince)} (${diasMembro} dias)`, color: "#059669" },
    { icon: <MapPin size={16} strokeWidth={1.5} />, label: "CEP", value: member.cep, color: "#DC2626" },
    { icon: <MapPin size={16} strokeWidth={1.5} />, label: "Endereço", value: [member.address, member.number, member.complement].filter(Boolean).join(", "), color: "#DC2626" },
    { icon: <MapPin size={16} strokeWidth={1.5} />, label: "Bairro", value: member.neighborhood, color: "#DC2626" },
    { icon: <MapPin size={16} strokeWidth={1.5} />, label: "Cidade/UF", value: [member.city, member.state].filter(Boolean).join(" / "), color: "#DC2626" },
  ];

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "#6B7280" }}>
        <Link href="/pessoas" style={{ color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>Pessoas</Link>
        <ChevronRight size={14} />
        <span style={{ color: "#111827", fontWeight: 600 }}>{member.name}</span>
      </div>

      {/* Top actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push(`/pessoas/${member.id}/editar`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
          <Pencil size={14} strokeWidth={1.5} /> Editar
        </button>
        <button onClick={() => router.push(`/pessoas/${member.id}/cartao`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: NAVY, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <CreditCard size={14} strokeWidth={1.5} /> Cartão do Membro
        </button>
        <button style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", color: "#6B7280" }}>
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        {/* LEFT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: NAVY, borderRadius: 14, padding: 24, color: "white", textAlign: "center", position: "relative" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: member.photo ? `url(${member.photo}) center/cover` : av.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700, color: member.photo ? "transparent" : av.color, border: "3px solid rgba(255,255,255,0.3)", margin: "0 auto 12px", position: "relative" }}>
              {!member.photo && member.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid " + NAVY, cursor: "pointer" }}>
                <Pencil size={12} strokeWidth={1.5} color="#fff" />
              </div>
            </div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 6px" }}>{member.name}</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ background: st.bg, color: st.color, fontSize: "0.7rem", fontWeight: 600, borderRadius: 10, padding: "2px 10px" }}>{st.label}</span>
              {member.role && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{member.role}</span>}
            </div>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>
              Membro desde {formatDate(member.memberSince)} ({diasMembro} dias)
            </p>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              <button style={{ padding: "8px 4px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Phone size={14} strokeWidth={1.5} /> Ligar
              </button>
              <a href={member.whatsapp ? `https://wa.me/${member.whatsapp.replace(/\D/g, "")}` : "#"} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 4px", background: "rgba(255,255,255,0.1)", borderRadius: 8, color: "white", textDecoration: "none", fontSize: 12, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Smartphone size={14} strokeWidth={1.5} /> WhatsApp
              </a>
              <a href={member.email ? `mailto:${member.email}` : "#"} style={{ padding: "8px 4px", background: "rgba(255,255,255,0.1)", borderRadius: 8, color: "white", textDecoration: "none", fontSize: 12, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Mail size={14} strokeWidth={1.5} /> Email
              </a>
            </div>

            <button onClick={() => router.push(`/pessoas/${member.id}/cartao`)} style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <CreditCard size={14} strokeWidth={1.5} /> Cartão do Membro
            </button>
          </motion.div>

          {/* Resumo do Membro */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 14px" }}>Resumo do Membro</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MiniStat icon={<Church size={16} strokeWidth={1.5} />} label="Cultos" value={`${checkins.length}`} sub="Presenças" color="#2563EB" />
              <MiniStat icon={<Calendar size={16} strokeWidth={1.5} />} label="Eventos" value={`${inscricoes.length}`} sub="Participações" color="#7C3AED" />
              <MiniStat icon={<Users size={16} strokeWidth={1.5} />} label="Grupos" value={`${gruposMembro.length}`} sub="Participando" color="#16A34A" />
              <MiniStat icon={<DollarSign size={16} strokeWidth={1.5} />} label="Ofertas" value={`R$ ${totalFinancasAno.toLocaleString("pt-BR")}`} sub="Total em doações" color={GOLD} />
            </div>
            <Link href={`/pessoas/${member.id}/frequencia`} style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, fontSize: 12, fontWeight: 600, color: NAVY, textDecoration: "none" }}>
              <BarChart3 size={14} strokeWidth={1.5} /> Ver estatísticas completas <ChevronRight size={12} />
            </Link>
          </motion.div>

          {/* Histórico Financeiro */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 14px" }}>Histórico Financeiro</h3>
            {loadingFinancas ? (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Carregando...</div>
            ) : financas.length === 0 ? (
              <div style={{ color: "#6B7280", fontSize: 13 }}>Nenhuma contribuição registrada.</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <MiniStat icon={<DollarSign size={14} strokeWidth={1.5} />} label="Total" value={`R$ ${totalFinancasAno.toLocaleString("pt-BR")}`} sub="Soma de ofertas" color={GOLD} />
                  <MiniStat icon={<TrendingUp size={14} strokeWidth={1.5} />} label="Ofertas" value={`${financas.filter((f: any) => f.type === "RECEITA").length}`} sub="Total de ofertas" color="#16A34A" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {financas.slice(0, 3).map((f: any) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#F9FAFB", borderRadius: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(f.date)}</span>
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{f.category || f.type}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: f.type === "RECEITA" ? "#16A34A" : "#DC2626" }}>
                        {f.type === "RECEITA" ? "+" : "-"} R$ {Number(f.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/financeiro" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 12, fontWeight: 600, color: NAVY, textDecoration: "none" }}>
                  Ver histórico financeiro completo <ChevronRight size={12} />
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Dados Pessoais Grid */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 16px" }}>Dados Pessoais</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {infoCards.map((c, i) =>
                c.value && c.value !== "—" ? (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 10, background: "#FAFAFA", borderRadius: 10, border: "1px solid #F3F4F6" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.03em" }}>{c.label}</div>
                      <div style={{ fontSize: 13, color: "#111827", fontWeight: 600, marginTop: 2 }}>{c.value}</div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </motion.div>

          {/* Ministérios */}
          {member.ministerios && member.ministerios.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: 0 }}>Ministérios</h3>
                <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "#F3F4F6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                  <UserPlus size={12} strokeWidth={1.5} /> Adicionar
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {member.ministerios.map((m, i) => (
                  <span key={i} style={{ padding: "6px 14px", background: "#EFF6FF", color: NAVY, borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid #DBEAFE" }}>{m}</span>
                ))}
              </div>
              {member.ministerios.includes("Ensino") && (
                <div style={{ marginTop: 12, padding: 10, background: "#FEF3C7", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <Award size={14} color={GOLD} />
                  <span style={{ fontSize: 12, color: "#92400E", fontWeight: 500 }}>{member.name.split(" ")[0]} está servindo como líder no ministério de Ensino.</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Seções de módulos reais */}
          {/* Frequência nos Cultos */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 14px" }}>Frequência nos Cultos</h3>
            {loadingCultos ? (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Carregando...</div>
            ) : checkins.length === 0 ? (
              <div style={{ color: "#6B7280", fontSize: 13 }}>Nenhuma presença registrada nos cultos.</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Última presença:</span>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{formatDate(checkins[0]?.culto?.data || checkins[0]?.createdAt)}</span>
                  {(() => {
                    const pct = Math.min(100, Math.round((checkins.length / 12) * 100));
                    let badge = { label: "Afastado", bg: "#FEE2E2", color: "#DC2626" };
                    if (pct >= 75) badge = { label: "Regular", bg: "#DCFCE7", color: "#16A34A" };
                    else if (pct >= 40) badge = { label: "Irregular", bg: "#FEF3C7", color: "#D97706" };
                    return <span style={{ background: badge.bg, color: badge.color, fontSize: "0.7rem", fontWeight: 600, borderRadius: 10, padding: "2px 8px" }}>{badge.label} ({pct}%)</span>;
                  })()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {checkins.slice(0, 5).map((c: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#F9FAFB", borderRadius: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Church size={14} color="#6B7280" />
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{c.culto?.titulo || "Culto"}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(c.culto?.data || c.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Escalas */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 14px" }}>Escalas</h3>
            {loadingEscalas ? (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Carregando...</div>
            ) : escalasMembro.length === 0 ? (
              <div style={{ color: "#6B7280", fontSize: 13 }}>Nenhuma escala encontrada para este membro.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {escalasMembro.map((e: any) => {
                  const funcao = e.membros?.find((m: any) => m.memberId === params.id)?.funcao || "Participante";
                  return (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#F9FAFB", borderRadius: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Calendar size={14} color="#7C3AED" />
                        <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{e.titulo}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(e.data)}</span>
                        <span style={{ padding: "2px 8px", background: "#EDE9FE", color: "#5B21B6", borderRadius: 6, fontSize: 10, fontWeight: 500 }}>{e.ministerio}</span>
                        <span style={{ padding: "2px 8px", background: "#EFF6FF", color: "#1E40AF", borderRadius: 6, fontSize: 10, fontWeight: 500 }}>{funcao}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Grupo / Célula */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 14px" }}>Grupo / Célula</h3>
            {loadingGrupos ? (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Carregando...</div>
            ) : gruposMembro.length === 0 ? (
              <div style={{ color: "#6B7280", fontSize: 13 }}>Este membro não está vinculado a nenhum grupo ou célula como líder.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {gruposMembro.map((g: any) => (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#F9FAFB", borderRadius: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Users size={14} color="#16A34A" />
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{g.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {g.leader && <span style={{ fontSize: 11, color: "#6B7280" }}>Líder: {g.leader.name}</span>}
                      {g.meetingDay && <span style={{ padding: "2px 8px", background: "#DCFCE7", color: "#166534", borderRadius: 6, fontSize: 10, fontWeight: 500 }}>{g.meetingDay}</span>}
                      {g._count?.members !== undefined && <span style={{ padding: "2px 8px", background: "#F3F4F6", color: "#374151", borderRadius: 6, fontSize: 10, fontWeight: 500 }}>{g._count.members} membros</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Eventos */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 14px" }}>Eventos</h3>
            {loadingEventos ? (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Carregando...</div>
            ) : inscricoes.length === 0 ? (
              <div style={{ color: "#6B7280", fontSize: 13 }}>Nenhuma inscrição em eventos encontrada.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {inscricoes.map((i: any) => (
                  <div key={i.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#F9FAFB", borderRadius: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={14} color={GOLD} />
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{i.event?.title || i.evento?.title || "Evento"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {i.pagamentoStatus && (
                        <span style={{ padding: "2px 8px", background: i.pagamentoStatus === "PAGO" ? "#DCFCE7" : "#FEF3C7", color: i.pagamentoStatus === "PAGO" ? "#166534" : "#92400E", borderRadius: 6, fontSize: 10, fontWeight: 500 }}>{i.pagamentoStatus}</span>
                      )}
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(i.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Observações Pastorais */}
          {member.observacoesPastorais && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: "#FEF2F2", borderRadius: 14, padding: 20, border: "1px solid #FECACA" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Lock size={14} strokeWidth={1.5} color="#991B1B" />
                <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Observações Pastorais — Confidencial</span>
              </div>
              <p style={{ fontSize: 13, color: "#7F1D1D", margin: 0, lineHeight: 1.5 }}>{member.observacoesPastorais}</p>
            </motion.div>
          )}

          {/* Observações Gerais */}
          {member.notes && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: "#FEF9C3", borderRadius: 14, padding: 20, border: "1px solid #FDE68A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <FileText size={14} strokeWidth={1.5} color="#92400E" />
                <span style={{ fontSize: 12, color: "#92400E", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Anotações</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#B45309" }}>Última atualização: {formatDate(member.updatedAt)}</span>
              </div>
              <p style={{ fontSize: 13, color: "#78350F", margin: 0, lineHeight: 1.5 }}>{member.notes}</p>
            </motion.div>
          )}

          {/* Tags, Disponibilidade, Filhos (mantidos do original) */}
          {(member.disponibilidadeDias?.length > 0 || member.disponibilidadeTurnos?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>Disponibilidade</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {member.disponibilidadeDias.map((d, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#FEF3C7", color: "#92400E", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>{d}</span>
                ))}
                {member.disponibilidadeTurnos.map((t, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#DCFCE7", color: "#166534", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </motion.div>
          )}

          {member.tags && member.tags.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {member.tags.map((t, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#F3F4F6", color: "#374151", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </motion.div>
          )}

          {member.filhos && member.filhos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>Filhos</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {member.filhos.map((f: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 10px", background: "#FAFAFA", borderRadius: 6 }}>
                    <Users size={14} color="#9CA3AF" />
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{f.nome}</span>
                    {f.dataNascimento && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{formatDate(f.dataNascimento)}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ padding: 10, background: "#FAFAFA", borderRadius: 10, textAlign: "center", border: "1px solid #F3F4F6" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", color, margin: "0 auto 6px" }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 10, color: "#9CA3AF" }}>{sub}</div>
    </div>
  );
}
