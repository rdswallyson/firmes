"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Users, Music, Mic, DoorOpen, Baby, Headphones, CheckCircle, XCircle, Clock, ArrowLeft, Pencil, Trash2, UserPlus, Mail, Phone } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

const MINISTERIOS = [
  { id: "LOUVOR", label: "Louvor", icon: Music, color: "#7C3AED" },
  { id: "SOM", label: "Som", icon: Headphones, color: "#2563EB" },
  { id: "RECEPCAO", label: "Recepção", icon: Users, color: "#16A34A" },
  { id: "PORTARIA", label: "Portaria", icon: DoorOpen, color: "#DC2626" },
  { id: "INFANTIL", label: "Infantil", icon: Baby, color: "#EA580C" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDENTE:  { label: "Pendente",  color: "#CA8A04", bg: "#FEF9C3", icon: Clock },
  CONFIRMADO:{ label: "Confirmado",color: "#16A34A", bg: "#DCFCE7", icon: CheckCircle },
  RECUSADO:  { label: "Recusado",  color: "#DC2626", bg: "#FEE2E2", icon: XCircle },
};

interface Escala {
  id: string;
  titulo: string;
  data: string;
  ministerio: string;
  status: string;
  observacoes?: string;
  membros: {
    id: string;
    funcao: string;
    status: string;
    member: { id: string; name: string; photo?: string; phone?: string; email?: string };
  }[];
  _count: { membros: number };
  createdAt: string;
}

export default function EscalaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [escala, setEscala] = useState<Escala | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/escalas/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setEscala(d.escala);
      })
      .catch(() => setError("Erro ao carregar escala"))
      .finally(() => setLoading(false));
  }, [id]);

  const deletar = async () => {
    if (!confirm("Tem certeza que deseja excluir esta escala?")) return;
    const r = await fetch(`/api/escalas/${id}`, { method: "DELETE" });
    if (r.ok) router.push("/escalas");
    else alert("Erro ao excluir");
  };

  const confirmarMembro = async (membroId: string) => {
    const r = await fetch(`/api/escalas/${id}/membros/${membroId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMADO" }),
    });
    if (r.ok) {
      const d = await r.json();
      setEscala(d.escala);
    }
  };

  const recusarMembro = async (membroId: string) => {
    const r = await fetch(`/api/escalas/${id}/membros/${membroId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RECUSADO" }),
    });
    if (r.ok) {
      const d = await r.json();
      setEscala(d.escala);
    }
  };

  if (loading) return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <p style={{ color: "#9CA3AF" }}>Carregando...</p>
    </div>
  );

  if (error || !escala) return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <Link href="/escalas" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 20 }}><ArrowLeft size={16} /> Voltar</Link>
      <div style={{ background: "#fff", borderRadius: 14, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <Calendar size={48} style={{ margin: "0 auto 16px", color: "#D1D5DB" }} />
        <p style={{ color: "#9CA3AF" }}>{error || "Escala não encontrada"}</p>
      </div>
    </div>
  );

  const min = MINISTERIOS.find(m => m.id === escala.ministerio);
  const MinIcon = min?.icon || Music;
  const confirmados = escala.membros.filter(m => m.status === "CONFIRMADO").length;
  const pendentes   = escala.membros.filter(m => m.status === "PENDENTE").length;
  const recusados   = escala.membros.filter(m => m.status === "RECUSADO").length;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <Link href="/escalas" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 10 }}><ArrowLeft size={16} /> Voltar para escalas</Link>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0D2545" }}>{escala.titulo}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: min?.color + "15" || "#EEF2FA", color: min?.color || NAVY }}>
              <MinIcon size={13} /> {min?.label || escala.ministerio}
            </span>
            <span style={{ fontSize: 13, color: "#6B7280" }}>{new Date(escala.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/escalas/${id}/editar`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}><Pencil size={14} /> Editar</Link>
          <button onClick={deletar} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#FEE2E2", color: "#DC2626", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}><Trash2 size={14} /> Excluir</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Membros", value: escala.membros.length, icon: Users, color: NAVY },
          { label: "Confirmados", value: confirmados, icon: CheckCircle, color: "#16A34A" },
          { label: "Pendentes", value: pendentes, icon: Clock, color: "#CA8A04" },
          { label: "Recusados", value: recusados, icon: XCircle, color: "#DC2626" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <s.icon size={18} style={{ color: s.color }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0D2545" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Observações */}
      {escala.observacoes && (
        <div style={{ background: "#FEFCE8", borderRadius: 12, padding: "14px 16px", marginBottom: 20, borderLeft: "3px solid #CA8A04" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#854D0E", marginBottom: 4 }}>Observações</div>
          <div style={{ fontSize: 13, color: "#713F12" }}>{escala.observacoes}</div>
        </div>
      )}

      {/* Lista de membros */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0D2545" }}>Membros escalados</h2>
          <Link href={`/escalas/${id}/editar`} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#EEF2FA", color: NAVY, borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}><UserPlus size={13} /> Gerenciar</Link>
        </div>

        {escala.membros.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#9CA3AF", fontSize: 13 }}>Nenhum membro escalado ainda.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {escala.membros.map((m, i) => {
              const st = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.PENDENTE;
              if (!st) return null;
              const StIcon = st.icon;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#FAFAFA", border: "1px solid #F3F4F6" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.member.photo ? `url(${m.member.photo}) center/cover` : `hsl(${m.member.name.charCodeAt(0) * 7},55%,82%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: `hsl(${m.member.name.charCodeAt(0) * 7},40%,30%)`, flexShrink: 0 }}>
                    {!m.member.photo && m.member.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{m.member.name}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>{m.funcao}</span>
                      {m.member.phone && <span style={{ fontSize: 11, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 2 }}><Phone size={10} /> {m.member.phone}</span>}
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: st.bg, color: st.color }}>
                    <StIcon size={11} /> {st.label}
                  </span>
                  {m.status === "PENDENTE" && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => confirmarMembro(m.id)} style={{ padding: "4px 8px", background: "#DCFCE7", color: "#16A34A", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Confirmar</button>
                      <button onClick={() => recusarMembro(m.id)} style={{ padding: "4px 8px", background: "#FEE2E2", color: "#DC2626", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Recusar</button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
