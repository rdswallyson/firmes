"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pencil, CreditCard, Calendar, Phone, Mail, MapPin,
  Clock, UserCheck, Church, FileText, Users, Heart, Tag, Briefcase,
  Smartphone, Lock, Globe, Baby, UserPlus, DollarSign, TrendingUp, TrendingDown,
  ChevronRight, BarChart3, Award, BookOpen, MoreHorizontal, PhoneCall, MessageCircle,
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
    { icon: <Mail size={18} strokeWidth={1.5} />, label: "Email", value: member.email, color: "#3B82F6", bg: "#EFF6FF" },
    { icon: <Phone size={18} strokeWidth={1.5} />, label: "Telefone", value: member.phone, color: "#10B981", bg: "#ECFDF5" },
    { icon: <Smartphone size={18} strokeWidth={1.5} />, label: "WhatsApp", value: member.whatsapp, color: "#10B981", bg: "#ECFDF5", link: member.whatsapp ? `https://wa.me/${member.whatsapp.replace(/\D/g, "")}` : null },
    { icon: <Calendar size={18} strokeWidth={1.5} />, label: "Nascimento", value: member.birthDate ? `${formatDate(member.birthDate)} (${Math.floor(daysSince(member.birthDate) / 365)} anos)` : null, color: "#F59E0B", bg: "#FFFBEB" },
    { icon: <Heart size={18} strokeWidth={1.5} />, label: "Estado Civil", value: member.estadoCivil, color: "#EF4444", bg: "#FEF2F2" },
    { icon: <UserCheck size={18} strokeWidth={1.5} />, label: "Cargo", value: member.role, color: "#6366F1", bg: "#EEF2FF" },
    { icon: <Church size={18} strokeWidth={1.5} />, label: "Congregação", value: member.groupId ?? "Sede", color: "#8B5CF6", bg: "#F5F3FF" },
    { icon: <Clock size={18} strokeWidth={1.5} />, label: "Membro desde", value: `${formatDate(member.memberSince)} (${diasMembro} dias)`, color: "#F59E0B", bg: "#FFFBEB" },
    { icon: <MapPin size={18} strokeWidth={1.5} />, label: "CEP", value: member.cep, color: "#EC4899", bg: "#FDF2F8" },
    { icon: <MapPin size={18} strokeWidth={1.5} />, label: "Endereço", value: [member.address, member.number, member.complement].filter(Boolean).join(", "), color: "#EC4899", bg: "#FDF2F8" },
    { icon: <MapPin size={18} strokeWidth={1.5} />, label: "Bairro", value: member.neighborhood, color: "#EC4899", bg: "#FDF2F8" },
    { icon: <MapPin size={18} strokeWidth={1.5} />, label: "Cidade/UF", value: [member.city, member.state].filter(Boolean).join(" / "), color: "#EC4899", bg: "#FDF2F8" },
  ];

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 13, color: "#6B7280" }}>
        <Link href="/pessoas" style={{ color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>Pessoas</Link>
        <ChevronRight size={14} />
        <span style={{ color: "#111827", fontWeight: 600 }}>{member.name}</span>
      </div>

      {/* Top actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push(`/pessoas/${member.id}/editar`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
          <Pencil size={14} strokeWidth={1.5} /> Editar
        </button>
        <button onClick={() => router.push(`/pessoas/${member.id}/cartao`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2563EB", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          <CreditCard size={14} strokeWidth={1.5} /> Cartão do Membro
        </button>
        <button style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", color: "#6B7280" }}>
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
        {/* LEFT SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: NAVY, borderRadius: 16, padding: 28, color: "white", textAlign: "center", position: "relative" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: member.photo ? `url(${member.photo}) center/cover` : av.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, color: member.photo ? "transparent" : av.color, border: "3px solid rgba(255,255,255,0.25)", margin: "0 auto 14px", position: "relative" }}>
              {!member.photo && member.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid " + NAVY, cursor: "pointer" }}>
                <Pencil size={14} strokeWidth={1.5} color={NAVY} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{member.name}</h2>
              <span style={{ background: st.bg, color: st.color, fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, padding: "3px 10px" }}>{st.label}</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>{member.role}</div>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: "0 0 18px" }}>
              Membro desde {formatDate(member.memberSince)} ({diasMembro} dias)
            </p>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              <button style={{ padding: "10px 4px", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 10, color: "white", cursor: "pointer", fontSize: 12, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <PhoneCall size={16} strokeWidth={1.5} /> Ligar
              </button>
              <a href={member.whatsapp ? `https://wa.me/${member.whatsapp.replace(/\D/g, "")}` : "#"} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 4px", background: "rgba(255,255,255,0.12)", borderRadius: 10, color: "white", textDecoration: "none", fontSize: 12, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <MessageCircle size={16} strokeWidth={1.5} /> WhatsApp
              </a>
              <a href={member.email ? `mailto:${member.email}` : "#"} style={{ padding: "10px 4px", background: "rgba(255,255,255,0.12)", borderRadius: 10, color: "white", textDecoration: "none", fontSize: 12, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Mail size={16} strokeWidth={1.5} /> Email
              </a>
            </div>

            <button onClick={() => router.push(`/pessoas/${member.id}/cartao`)} style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <CreditCard size={16} strokeWidth={1.5} /> Cartão do Membro
            </button>
          </motion.div>

          {/* Resumo do Membro */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Resumo do Membro</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MiniStat icon={<Users size={20} strokeWidth={1.5} />} value={`${checkins.length}`} label="Cultos" sub="Presenças" color="#3B82F6" bg="#EFF6FF" />
              <MiniStat icon={<Calendar size={20} strokeWidth={1.5} />} value={`${inscricoes.length}`} label="Eventos" sub="Participações" color="#10B981" bg="#ECFDF5" />
              <MiniStat icon={<Users size={20} strokeWidth={1.5} />} value={`${gruposMembro.length}`} label="Grupos" sub="Participando" color="#8B5CF6" bg="#F5F3FF" />
              <MiniStat icon={<DollarSign size={20} strokeWidth={1.5} />} value={`R$ ${totalFinancasAno.toLocaleString("pt-BR")}`} label="Ofertas" sub="Total em doações" color="#F59E0B" bg="#FFFBEB" />
            </div>
            <Link href={`/pessoas/${member.id}/frequencia`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, padding: "8px", background: "#F9FAFB", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}>
              <BarChart3 size={14} strokeWidth={1.5} /> Ver estatísticas completas
            </Link>
          </motion.div>

          {/* Histórico Financeiro */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Histórico Financeiro</h3>
            {loadingFinancas ? (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Carregando...</div>
            ) : financas.length === 0 ? (
              <div style={{ color: "#6B7280", fontSize: 13 }}>Nenhuma contribuição registrada.</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <MiniStat icon={<DollarSign size={16} strokeWidth={1.5} />} value={`R$ ${totalFinancasAno.toLocaleString("pt-BR")}`} label="Total" sub="Soma de ofertas" color="#F59E0B" bg="#FFFBEB" />
                  <MiniStat icon={<TrendingUp size={16} strokeWidth={1.5} />} value={`${financas.filter((f: any) => f.type === "RECEITA").length}`} label="Ofertas" sub="Total de ofertas" color="#10B981" bg="#ECFDF5" />
                  <MiniStat icon={<DollarSign size={16} strokeWidth={1.5} />} value={`R$ ${(totalFinancasAno / Math.max(1, financas.filter((f: any) => f.type === "RECEITA").length)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} label="Média" sub="Média por oferta" color="#8B5CF6" bg="#F5F3FF" />
                  <MiniStat icon={<TrendingUp size={16} strokeWidth={1.5} />} value={`R$ ${(totalFinancasAno / 12).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} label="Mensal" sub="Dízimos este mês" color="#EF4444" bg="#FEF2F2" />
                </div>

                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr 80px 1fr", gap: 4, padding: "6px 8px", fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "1px solid #F3F4F6" }}>
                  <span>Data</span>
                  <span>Tipo</span>
                  <span>Descrição</span>
                  <span>Valor</span>
                  <span>Forma</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {financas.slice(0, 3).map((f: any) => (
                    <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr 80px 1fr", gap: 4, padding: "8px", fontSize: 12, borderBottom: "1px solid #F9FAFB", alignItems: "center" }}>
                      <span style={{ color: "#6B7280" }}>{formatDate(f.date)}</span>
                      <span style={{ color: "#374151", fontWeight: 500 }}>{f.category || f.type}</span>
                      <span style={{ color: "#374151" }}>{f.description || "—"}</span>
                      <span style={{ fontWeight: 600, color: f.type === "RECEITA" ? "#16A34A" : "#DC2626" }}>
                        {f.type === "RECEITA" ? "+" : "-"} R$ {Number(f.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <span style={{ color: "#6B7280" }}>{f.paymentMethod || "—"}</span>
                    </div>
                  ))}
                </div>

                <Link href="/financeiro" style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 12, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}>
                  Ver histórico financeiro completo <ChevronRight size={12} />
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Dados Pessoais Grid — 4 colunas igual à imagem */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {infoCards.map((c, i) =>
                c.value && c.value !== "—" ? (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500, marginBottom: 2 }}>{c.label}</div>
                      <div style={{ fontSize: 13, color: "#111827", fontWeight: 600, wordBreak: "break-word" }}>
                        {c.link ? (
                          <a href={c.link} target="_blank" rel="noopener noreferrer" style={{ color: "#111827", textDecoration: "none" }}>{c.value}</a>
                        ) : c.value}
                      </div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </motion.div>

          {/* Ministérios */}
          {member.ministerios && member.ministerios.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Ministérios</h3>
                <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "#F3F4F6", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                  <UserPlus size={12} strokeWidth={1.5} /> Adicionar
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {member.ministerios.map((m, i) => (
                  <span key={i} style={{ padding: "6px 14px", background: "#EFF6FF", color: "#1E40AF", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid #DBEAFE" }}>{m}</span>
                ))}
              </div>
              {member.ministerios.includes("Ensino") && (
                <div style={{ marginTop: 12, padding: 12, background: "#FFFBEB", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, border: "1px solid #FDE68A" }}>
                  <Award size={16} color="#D97706" />
                  <span style={{ fontSize: 12, color: "#92400E", fontWeight: 500 }}>{member.name.split(" ")[0]} está servindo como líder no ministério de Ensino.</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Anotações */}
          {member.notes && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ background: "#FFFBEB", borderRadius: 16, padding: 20, border: "1px solid #FDE68A" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FileText size={16} strokeWidth={1.5} color="#D97706" />
                  <span style={{ fontSize: 13, color: "#111827", fontWeight: 700 }}>Anotações</span>
                </div>
                <button style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", background: "none", border: "none", cursor: "pointer" }}>Editar</button>
              </div>
              <p style={{ fontSize: 13, color: "#78350F", margin: 0, lineHeight: 1.6 }}>{member.notes}</p>
              <div style={{ marginTop: 10, fontSize: 11, color: "#B45309" }}>Última atualização: {formatDate(member.updatedAt)} por Administrador</div>
            </motion.div>
          )}

          {/* Observações Pastorais */}
          {member.observacoesPastorais && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ background: "#FEF2F2", borderRadius: 16, padding: 20, border: "1px solid #FECACA" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Lock size={14} strokeWidth={1.5} color="#991B1B" />
                <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>Observações Pastorais — Confidencial</span>
              </div>
              <p style={{ fontSize: 13, color: "#7F1D1D", margin: 0, lineHeight: 1.5 }}>{member.observacoesPastorais}</p>
            </motion.div>
          )}

          {/* Tags, Disponibilidade, Filhos (mantidos do original) */}
          {(member.disponibilidadeDias?.length > 0 || member.disponibilidadeTurnos?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Disponibilidade</h3>
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
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {member.tags.map((t, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#F3F4F6", color: "#374151", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </motion.div>
          )}

          {member.filhos && member.filhos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>Filhos</h3>
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

function MiniStat({ icon, value, label, sub, color, bg }: { icon: React.ReactNode; value: string; label: string; sub: string; color: string; bg: string }) {
  return (
    <div style={{ padding: 12, background: "#FAFAFA", borderRadius: 12, textAlign: "center", border: "1px solid #F3F4F6" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, margin: "0 auto 8px" }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: "#9CA3AF" }}>{sub}</div>
    </div>
  );
}
