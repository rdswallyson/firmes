"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pencil, CreditCard, Calendar, Phone, Mail, MapPin,
  Clock, UserCheck, Church, FileText, Users, Heart, Tag, Briefcase,
  Smartphone, Lock, Globe, Baby, UserPlus,
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
