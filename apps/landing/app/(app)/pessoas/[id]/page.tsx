"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pencil, CreditCard, Calendar, Phone, Mail, MapPin,
  Clock, UserCheck, Church, FileText, Users, Heart, Tag, Briefcase,
  Smartphone, Lock, Globe, Baby, UserPlus, DollarSign, TrendingUp, TrendingDown,
} from "lucide-react";

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
  // Campos expandidos
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
  portalEmail: string | null;
  portalStatus: string | null;
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Ativo", bg: "#DCFCE7", color: "#16A34A" },
  VISITOR: { label: "Visitante", bg: "#DBEAFE", color: "#2563EB" },
  INACTIVE: { label: "Inativo", bg: "#FEE2E2", color: "#DC2626" },
  PENDING: { label: "Pendente", bg: "#FEF3C7", color: "#D97706" },
};

const PORTAL_STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  PENDENTE: { label: "Pendente", bg: "#FEF3C7", color: "#D97706" },
  ATIVO: { label: "Ativo", bg: "#DCFCE7", color: "#16A34A" },
  BLOQUEADO: { label: "Bloqueado", bg: "#FEE2E2", color: "#DC2626" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function PerfilMembroPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [conjuge, setConjuge] = useState<{ name: string } | null>(null);
  const [indicadoPor, setIndicadoPor] = useState<{ name: string } | null>(null);

  // Dados de outros módulos
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
        // Buscar cônjuge
        if (d.member?.conjugeId) {
          fetch(`/api/members/${d.member.conjugeId}`)
            .then(r => r.json())
            .then((c: { member?: { name: string } }) => setConjuge(c.member ?? null))
            .catch(() => null);
        }
        // Buscar quem indicou
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

  // Buscar histórico financeiro
  useEffect(() => {
    if (!params.id) return;
    setLoadingFinancas(true);
    fetch(`/api/financeiro?memberId=${params.id}&limit=5`)
      .then(r => r.json())
      .then((d: { finances?: any[]; totalReceitas?: number; totalDespesas?: number }) => {
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

  // Buscar frequência nos cultos
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

  // Buscar escalas do membro
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

  // Buscar grupos do membro
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

  // Buscar inscrições em eventos
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
  const portalSt = member.portalStatus ? (PORTAL_STATUS_LABEL[member.portalStatus] ?? { label: "Pendente", bg: "#FEF3C7", color: "#D97706" }) : null;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <button onClick={() => router.push("/pessoas")} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.8375rem", marginBottom: "1rem", padding: 0 }}>
        <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
      </button>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 100%)", padding: "2rem 2rem 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            width: "90px", height: "90px", borderRadius: "50%",
            background: member.photo ? `url(${member.photo}) center/cover` : `hsl(${member.name.charCodeAt(0) * 7},55%,82%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem", fontWeight: 700,
            color: `hsl(${member.name.charCodeAt(0) * 7},40%,30%)`,
            border: "3px solid rgba(255,255,255,0.3)", flexShrink: 0,
          }}>
            {!member.photo && member.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: "white", fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>{member.name}</h1>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ background: st.bg, color: st.color, fontSize: "0.72rem", fontWeight: 600, borderRadius: "10px", padding: "2px 10px" }}>{st.label}</span>
              {member.role && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>{member.role}</span>}
              {member.sexo && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>{member.sexo === "MASCULINO" ? "♂" : member.sexo === "FEMININO" ? "♀" : "⚧"}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => router.push(`/pessoas/${member.id}/cartao`)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", background: "rgba(200,146,42,0.2)", border: "1px solid rgba(200,146,42,0.4)", borderRadius: "8px", color: "#C8922A", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
              <CreditCard size={14} strokeWidth={1.5} /> Cartão
            </button>
            <button onClick={() => router.push(`/pessoas/${member.id}/editar`)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.875rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
              <Pencil size={14} strokeWidth={1.5} /> Editar
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ padding: "1.5rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {/* Contato */}
            <InfoItem icon={<Mail size={15} strokeWidth={1.5} />} label="E-mail" value={member.email} />
            <InfoItem icon={<Phone size={15} strokeWidth={1.5} />} label="Telefone" value={member.phone} />
            {member.whatsapp && (
              <InfoItem icon={<Smartphone size={15} strokeWidth={1.5} />} label="WhatsApp" value={
                <a href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#16A34A", textDecoration: "none" }}>
                  {member.whatsapp} ↗
                </a>
              } />
            )}
            <InfoItem icon={<Calendar size={15} strokeWidth={1.5} />} label="Nascimento" value={formatDate(member.birthDate)} />
            {member.estadoCivil && (
              <InfoItem icon={<Heart size={15} strokeWidth={1.5} />} label="Estado Civil" value={member.estadoCivil} />
            )}

            {/* Vida Eclesiástica */}
            <InfoItem icon={<Church size={15} strokeWidth={1.5} />} label="Batismo (águas)" value={formatDate(member.baptismDate)} />
            {member.dataBatismoEspirito && (
              <InfoItem icon={<Church size={15} strokeWidth={1.5} />} label="Batismo (Espírito)" value={formatDate(member.dataBatismoEspirito)} />
            )}
            <InfoItem icon={<Clock size={15} strokeWidth={1.5} />} label="Membro desde" value={formatDate(member.memberSince)} />
            <InfoItem icon={<UserCheck size={15} strokeWidth={1.5} />} label="Cargo" value={member.role} />

            {/* Endereço */}
            <InfoItem icon={<MapPin size={15} strokeWidth={1.5} />} label="CEP" value={member.cep} />
            <InfoItem icon={<MapPin size={15} strokeWidth={1.5} />} label="Endereço" value={[member.address, member.number, member.complement].filter(Boolean).join(", ")} />
            <InfoItem icon={<MapPin size={15} strokeWidth={1.5} />} label="Bairro" value={member.neighborhood} />
            <InfoItem icon={<MapPin size={15} strokeWidth={1.5} />} label="Cidade/UF" value={[member.city, member.state].filter(Boolean).join(" / ")} />

            {/* Família */}
            {conjuge && (
              <InfoItem icon={<Users size={15} strokeWidth={1.5} />} label="Cônjuge" value={
                <span style={{ color: "#1A3C6E", fontWeight: 500 }}>{conjuge.name}</span>
              } />
            )}
            {indicadoPor && (
              <InfoItem icon={<UserPlus size={15} strokeWidth={1.5} />} label="Indicado por" value={indicadoPor.name} />
            )}
            {member.comoConheceu && (
              <InfoItem icon={<Globe size={15} strokeWidth={1.5} />} label="Como conheceu" value={member.comoConheceu} />
            )}
          </div>

          {/* Ministérios */}
          {member.ministerios && member.ministerios.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <Briefcase size={14} strokeWidth={1.5} color="#6B7280" />
                <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Ministérios</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {member.ministerios.map((m, i) => (
                  <span key={i} style={{ padding: "0.3rem 0.7rem", background: "#EFF6FF", color: "#1A3C6E", borderRadius: 20, fontSize: "0.78rem", fontWeight: 500 }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Disponibilidade */}
          {(member.disponibilidadeDias?.length > 0 || member.disponibilidadeTurnos?.length > 0) && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <Clock size={14} strokeWidth={1.5} color="#6B7280" />
                <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Disponibilidade</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {member.disponibilidadeDias.map((d, i) => (
                  <span key={i} style={{ padding: "0.25rem 0.5rem", background: "#FEF3C7", color: "#92400E", borderRadius: 6, fontSize: "0.72rem", fontWeight: 500 }}>{d}</span>
                ))}
                {member.disponibilidadeTurnos.map((t, i) => (
                  <span key={i} style={{ padding: "0.25rem 0.5rem", background: "#DCFCE7", color: "#166534", borderRadius: 6, fontSize: "0.72rem", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {member.tags && member.tags.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <Tag size={14} strokeWidth={1.5} color="#6B7280" />
                <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Tags</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {member.tags.map((t, i) => (
                  <span key={i} style={{ padding: "0.25rem 0.6rem", background: "#F3F4F6", color: "#374151", borderRadius: 20, fontSize: "0.72rem", fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Filhos */}
          {member.filhos && member.filhos.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <Baby size={14} strokeWidth={1.5} color="#6B7280" />
                <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Filhos</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {member.filhos.map((f: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.4rem 0.75rem", background: "#FAFAFA", borderRadius: 6 }}>
                    <Users size={14} color="#9CA3AF" />
                    <span style={{ fontSize: "0.85rem", color: "#374151" }}>{f.nome}</span>
                    {f.dataNascimento && (
                      <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{formatDate(f.dataNascimento)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portal do Membro */}
          {portalSt && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#FFF8EE", borderRadius: "8px", border: "1px solid #FDE68A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <Lock size={14} strokeWidth={1.5} color="#92400E" />
                <span style={{ fontSize: "0.75rem", color: "#92400E", fontWeight: 600, textTransform: "uppercase" }}>Portal do Membro</span>
                <span style={{ background: portalSt.bg, color: portalSt.color, fontSize: "0.65rem", fontWeight: 600, borderRadius: 10, padding: "1px 6px" }}>{portalSt.label}</span>
              </div>
              {member.portalEmail && (
                <div style={{ fontSize: "0.85rem", color: "#92400E" }}>
                  <Globe size={12} style={{ display: "inline", marginRight: 4 }} />
                  {member.portalEmail}
                </div>
              )}
            </div>
          )}

          {/* Observações Pastorais */}
          {member.observacoesPastorais && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#FEF2F2", borderRadius: "8px", border: "1px solid #FECACA" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <Lock size={14} strokeWidth={1.5} color="#991B1B" />
                <span style={{ fontSize: "0.75rem", color: "#991B1B", fontWeight: 600, textTransform: "uppercase" }}>Observações Pastorais — Confidencial</span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#7F1D1D", margin: 0, lineHeight: 1.5 }}>{member.observacoesPastorais}</p>
            </div>
          )}

          {/* Observações Gerais */}
          {member.notes && (
            <div style={{ marginTop: member.observacoesPastorais ? "1rem" : "1.5rem", padding: "1rem", background: "#FAFAFA", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <FileText size={14} strokeWidth={1.5} color="#6B7280" />
                <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>Observações</span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0, lineHeight: 1.5 }}>{member.notes}</p>
            </div>
          )}
        </div>

        {/* === SEÇÃO 1 — HISTÓRICO FINANCEIRO === */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ marginTop: "1.25rem", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "1.5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <DollarSign size={18} strokeWidth={1.5} color="#16A34A" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Histórico Financeiro</span>
          </div>
          {loadingFinancas ? (
            <div style={{ padding: "1rem 0", color: "#9CA3AF", fontSize: "0.85rem" }}>Carregando...</div>
          ) : financas.length === 0 ? (
            <div style={{ padding: "1rem 0", color: "#6B7280", fontSize: "0.85rem" }}>Nenhuma contribuição registrada para este membro.</div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                {financas.map((f: any) => (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "#F9FAFB", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {f.type === "RECEITA" ? <TrendingUp size={14} color="#16A34A" /> : <TrendingDown size={14} color="#DC2626" />}
                      <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>{f.category || f.type}</span>
                      <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{formatDate(f.date)}</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: f.type === "RECEITA" ? "#16A34A" : "#DC2626" }}>
                      {f.type === "RECEITA" ? "+" : "-"} R$ {Number(f.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "#DCFCE7", borderRadius: 8, border: "1px solid #BBF7D0" }}>
                <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>Total contribuído em {new Date().getFullYear()}</span>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#166534" }}>R$ {totalFinancasAno.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
        </motion.div>

        {/* === SEÇÃO 2 — FREQUÊNCIA NOS CULTOS === */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ marginTop: "1.25rem", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "1.5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <UserCheck size={18} strokeWidth={1.5} color="#2563EB" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Frequência nos Cultos</span>
          </div>
          {loadingCultos ? (
            <div style={{ padding: "1rem 0", color: "#9CA3AF", fontSize: "0.85rem" }}>Carregando...</div>
          ) : checkins.length === 0 ? (
            <div style={{ padding: "1rem 0", color: "#6B7280", fontSize: "0.85rem" }}>Nenhuma presença registrada nos cultos.</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Última presença:</span>
                <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>{formatDate(checkins[0]?.culto?.data || checkins[0]?.createdAt)}</span>
                {(() => {
                  const pct = Math.min(100, Math.round((checkins.length / 12) * 100));
                  let badge = { label: "Afastado", bg: "#FEE2E2", color: "#DC2626" };
                  if (pct >= 75) badge = { label: "Regular", bg: "#DCFCE7", color: "#16A34A" };
                  else if (pct >= 40) badge = { label: "Irregular", bg: "#FEF3C7", color: "#D97706" };
                  return <span style={{ background: badge.bg, color: badge.color, fontSize: "0.7rem", fontWeight: 600, borderRadius: 10, padding: "2px 8px" }}>{badge.label} ({pct}%)</span>;
                })()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {checkins.slice(0, 5).map((c: any, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "#F9FAFB", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Church size={14} color="#6B7280" />
                      <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>{c.culto?.titulo || "Culto"}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{formatDate(c.culto?.data || c.createdAt)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* === SEÇÃO 3 — ESCALAS === */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ marginTop: "1.25rem", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "1.5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Briefcase size={18} strokeWidth={1.5} color="#7C3AED" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Escalas</span>
          </div>
          {loadingEscalas ? (
            <div style={{ padding: "1rem 0", color: "#9CA3AF", fontSize: "0.85rem" }}>Carregando...</div>
          ) : escalasMembro.length === 0 ? (
            <div style={{ padding: "1rem 0", color: "#6B7280", fontSize: "0.85rem" }}>Nenhuma escala encontrada para este membro.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {escalasMembro.map((e: any) => {
                const funcao = e.membros?.find((m: any) => m.memberId === params.id)?.funcao || "Participante";
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "#F9FAFB", borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Calendar size={14} color="#7C3AED" />
                      <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500 }}>{e.titulo}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{formatDate(e.data)}</span>
                      <span style={{ padding: "0.15rem 0.5rem", background: "#EDE9FE", color: "#5B21B6", borderRadius: 6, fontSize: "0.7rem", fontWeight: 500 }}>{e.ministerio}</span>
                      <span style={{ padding: "0.15rem 0.5rem", background: "#EFF6FF", color: "#1E40AF", borderRadius: 6, fontSize: "0.7rem", fontWeight: 500 }}>{funcao}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* === SEÇÃO 4 — GRUPO/CÉLULA === */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ marginTop: "1.25rem", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "1.5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Users size={18} strokeWidth={1.5} color="#16A34A" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Grupo / Célula</span>
          </div>
          {loadingGrupos ? (
            <div style={{ padding: "1rem 0", color: "#9CA3AF", fontSize: "0.85rem" }}>Carregando...</div>
          ) : gruposMembro.length === 0 ? (
            <div style={{ padding: "1rem 0", color: "#6B7280", fontSize: "0.85rem" }}>Este membro não está vinculado a nenhum grupo ou célula como líder.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {gruposMembro.map((g: any) => (
                <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "#F9FAFB", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Users size={14} color="#16A34A" />
                    <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 600 }}>{g.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {g.leader && (
                      <span style={{ fontSize: "0.72rem", color: "#6B7280" }}>Líder: {g.leader.name}</span>
                    )}
                    {g.meetingDay && (
                      <span style={{ padding: "0.15rem 0.5rem", background: "#DCFCE7", color: "#166534", borderRadius: 6, fontSize: "0.7rem", fontWeight: 500 }}>{g.meetingDay}</span>
                    )}
                    {g._count?.members !== undefined && (
                      <span style={{ padding: "0.15rem 0.5rem", background: "#F3F4F6", color: "#374151", borderRadius: 6, fontSize: "0.7rem", fontWeight: 500 }}>{g._count.members} membros</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* === SEÇÃO 5 — EVENTOS === */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ marginTop: "1.25rem", background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "1.5rem 2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Calendar size={18} strokeWidth={1.5} color="#C8922A" />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0D2545" }}>Eventos</span>
          </div>
          {loadingEventos ? (
            <div style={{ padding: "1rem 0", color: "#9CA3AF", fontSize: "0.85rem" }}>Carregando...</div>
          ) : inscricoes.length === 0 ? (
            <div style={{ padding: "1rem 0", color: "#6B7280", fontSize: "0.85rem" }}>Nenhuma inscrição em eventos encontrada.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {inscricoes.map((i: any) => (
                <div key={i.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "#F9FAFB", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Calendar size={14} color="#C8922A" />
                    <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 600 }}>{i.event?.title || i.evento?.title || "Evento"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {i.pagamentoStatus && (
                      <span style={{ padding: "0.15rem 0.5rem", background: i.pagamentoStatus === "PAGO" ? "#DCFCE7" : "#FEF3C7", color: i.pagamentoStatus === "PAGO" ? "#166534" : "#92400E", borderRadius: 6, fontSize: "0.7rem", fontWeight: 500 }}>
                        {i.pagamentoStatus}
                      </span>
                    )}
                    <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{formatDate(i.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value || value === "—") return null;
  return (
    <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
      <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", flexShrink: 0, marginTop: "1px" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
        <div style={{ fontSize: "0.875rem", color: "#111827", marginTop: "1px" }}>{value}</div>
      </div>
    </div>
  );
}
