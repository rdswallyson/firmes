"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, User, Clock, MapPin, Plus, Trash2, Save, CheckSquare } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  photo: string | null;
  phone: string | null;
}

interface Grupo {
  id: string;
  name: string;
  description: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  address: string | null;
  leader: Member | null;
  members: { id: string; member: Member }[];
  frequencias: { id: string; date: string; presentes: number; ausentes: number; visitantes: number }[];
  _count: { members: number };
}

export default function GrupoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");

  useEffect(() => {
    fetchGrupo();
    fetchMembers();
  }, [id]);

  async function fetchGrupo() {
    setLoading(true);
    try {
      const res = await fetch(`/api/grupos/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGrupo(data.grupo);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers() {
    try {
      const res = await fetch("/api/members?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setAllMembers(data.members || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function addMember() {
    if (!selectedMember) return;
    try {
      const res = await fetch(`/api/grupos/${id}/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember }),
      });
      if (res.ok) {
        fetchGrupo();
        setShowAddMember(false);
        setSelectedMember("");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remover membro do grupo?")) return;
    try {
      const res = await fetch(`/api/grupos/${id}/membros?memberId=${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchGrupo();
    } catch (error) {
      console.error(error);
    }
  }

  async function saveFrequencia(data: { presentes: number; ausentes: number; visitantes: number; observacao: string }) {
    setSaving(true);
    try {
      const res = await fetch(`/api/grupos/${id}/frequencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) fetchGrupo();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Carregando...</div>;
  if (!grupo) return <div style={{ padding: "2rem" }}>Grupo não encontrado</div>;

  const availableMembers = allMembers.filter(
    (m) => !grupo.members.some((gm) => gm.member.id === m.id)
  );

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/grupos" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>{grupo.name}</h1>
          {grupo.description && <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>{grupo.description}</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem" }}>Informações</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {grupo.leader && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  <User size={16} strokeWidth={1.5} color="#6B7280" />
                  <span>Líder: <strong>{grupo.leader.name}</strong></span>
                </div>
              )}
              {(grupo.meetingDay || grupo.meetingTime) && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  <Clock size={16} strokeWidth={1.5} color="#6B7280" />
                  <span>{grupo.meetingDay} {grupo.meetingTime && `às ${grupo.meetingTime}`}</span>
                </div>
              )}
              {grupo.address && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                  <MapPin size={16} strokeWidth={1.5} color="#6B7280" />
                  <span>{grupo.address}</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#374151" }}>
                <Users size={16} strokeWidth={1.5} color="#6B7280" />
                <span>{grupo._count.members} membros</span>
              </div>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>Membros</h3>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddMember(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.4rem 0.75rem",
                  background: "#1A3C6E",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                <Plus size={14} strokeWidth={1.5} />
                Adicionar
              </motion.button>
            </div>

            {showAddMember && (
              <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#F9FAFB", borderRadius: "8px" }}>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <option value="">Selecione um membro</option>
                  {availableMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={addMember}
                    disabled={!selectedMember}
                    style={{
                      padding: "0.4rem 0.75rem",
                      background: selectedMember ? "#1A3C6E" : "#9CA3AF",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: selectedMember ? "pointer" : "not-allowed",
                      fontSize: "0.75rem",
                    }}
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => setShowAddMember(false)}
                    style={{
                      padding: "0.4rem 0.75rem",
                      background: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {grupo.members.map((gm) => (
                <div
                  key={gm.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.625rem",
                    background: "#F9FAFB",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: gm.member.photo ? `url(${gm.member.photo}) center/cover` : "#E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        color: "#6B7280",
                      }}
                    >
                      {!gm.member.photo && gm.member.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: "0.875rem", color: "#374151" }}>{gm.member.name}</span>
                  </div>
                  <button
                    onClick={() => removeMember(gm.member.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: "0.25rem" }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              {grupo.members.length === 0 && (
                <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem", padding: "1rem" }}>Nenhum membro no grupo</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <FrequenciaCard grupoId={id} onSave={saveFrequencia} saving={saving} />

          {grupo.frequencias.length > 0 && (
            <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB", marginTop: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem" }}>Histórico de Frequência</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {grupo.frequencias.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      background: "#F9FAFB",
                      borderRadius: "8px",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                      {new Date(f.date).toLocaleDateString("pt-BR")}
                    </span>
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
                      <span style={{ color: "#16A34A" }}>✓ {f.presentes} presentes</span>
                      <span style={{ color: "#DC2626" }}>✗ {f.ausentes} ausentes</span>
                      <span style={{ color: "#6B7280" }}>👥 {f.visitantes} visitantes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FrequenciaCard({
  grupoId,
  onSave,
  saving,
}: {
  grupoId: string;
  onSave: (data: { presentes: number; ausentes: number; visitantes: number; observacao: string }) => void;
  saving: boolean;
}) {
  const [presentes, setPresentes] = useState(0);
  const [ausentes, setAusentes] = useState(0);
  const [visitantes, setVisitantes] = useState(0);
  const [observacao, setObservacao] = useState("");

  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <CheckSquare size={18} strokeWidth={1.5} />
        Registrar Frequência
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>Presentes</label>
          <input
            type="number"
            min={0}
            value={presentes}
            onChange={(e) => setPresentes(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>Ausentes</label>
          <input
            type="number"
            min={0}
            value={ausentes}
            onChange={(e) => setAusentes(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>Visitantes</label>
          <input
            type="number"
            min={0}
            value={visitantes}
            onChange={(e) => setVisitantes(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>Observação</label>
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          rows={2}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
            fontSize: "0.875rem",
            resize: "vertical",
          }}
          placeholder="Observações sobre a reunião..."
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onSave({ presentes, ausentes, visitantes, observacao })}
        disabled={saving}
        style={{
          width: "100%",
          padding: "0.625rem",
          background: saving ? "#9CA3AF" : "#1A3C6E",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: saving ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <Save size={16} strokeWidth={1.5} />
        {saving ? "Salvando..." : "Registrar Frequência"}
      </motion.button>
    </div>
  );
}
