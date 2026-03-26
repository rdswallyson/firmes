"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pencil, CreditCard, Calendar, Phone, Mail, MapPin,
  Clock, UserCheck, Church, FileText,
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

export default function PerfilMembroPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/members/${params.id}`)
      .then((r) => r.json())
      .then((d: { member?: MemberData }) => setMember(d.member ?? null))
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
  const fullAddress = [member.address, member.number, member.complement, member.neighborhood, member.city, member.state].filter(Boolean).join(", ");

  const infoItems = [
    { icon: <Mail size={15} strokeWidth={1.5} />, label: "E-mail", value: member.email },
    { icon: <Phone size={15} strokeWidth={1.5} />, label: "Telefone", value: member.phone },
    { icon: <Calendar size={15} strokeWidth={1.5} />, label: "Nascimento", value: formatDate(member.birthDate) },
    { icon: <Church size={15} strokeWidth={1.5} />, label: "Batismo", value: formatDate(member.baptismDate) },
    { icon: <Clock size={15} strokeWidth={1.5} />, label: "Membro desde", value: formatDate(member.memberSince) },
    { icon: <UserCheck size={15} strokeWidth={1.5} />, label: "Cargo", value: member.role },
    { icon: <MapPin size={15} strokeWidth={1.5} />, label: "Endereço", value: fullAddress || null },
  ];

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
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}>
              <span style={{ background: st.bg, color: st.color, fontSize: "0.72rem", fontWeight: 600, borderRadius: "10px", padding: "2px 10px" }}>{st.label}</span>
              {member.role && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>{member.role}</span>}
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

        {/* Info */}
        <div style={{ padding: "1.5rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {infoItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", flexShrink: 0, marginTop: "1px" }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
                  <div style={{ fontSize: "0.875rem", color: item.value ? "#111827" : "#D1D5DB", marginTop: "1px" }}>{item.value ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>

          {member.notes && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#FAFAFA", borderRadius: "8px", border: "1px solid #F3F4F6" }}>
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
