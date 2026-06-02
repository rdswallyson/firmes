"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Save, Plus, X } from "lucide-react";
import { MemberSelector } from "../../../components/MemberSelector";
import { CheckboxField } from "../../../components/CheckboxField";

interface Member {
  id: string;
  name: string;
  photo?: string | null;
}

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const PERFILS = ["Masculino", "Feminino", "Misto", "Infantil", "Jovens"];
const HORARIOS = ["Manhã", "Tarde", "Noite"];
const CATEGORIAS = [
  "Grupo de Homens", "Grupo de Mulheres", "Grupo de Jovens",
  "Pequenos Grupos", "Líderes", "Grupos de Oração",
  "Discipulados", "Ministérios", "Departamentos", "Células"
];

export default function NovoGrupoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    dataAbertura: "",
    meetingDay: "",
    perfil: "",
    meetingTime: "",
    address: "",
    grupoOrigemId: "",
    categorias: [] as string[],
  });
  const [lider1, setLider1] = useState<Member | null>(null);
  const [lider2, setLider2] = useState<Member | null>(null);
  const [lider3, setLider3] = useState<Member | null>(null);
  const [lider4, setLider4] = useState<Member | null>(null);
  const [membros, setMembros] = useState<Member[]>([]);

  useEffect(() => {
    fetch("/api/grupos")
      .then(r => r.json())
      .then((d: { grupos?: { id: string; name: string }[] }) => {
        if (d.grupos) setGroups(d.grupos);
      })
      .catch(() => null);
  }, []);

  function toggleCategoria(cat: string) {
    setForm(prev => ({
      ...prev,
      categorias: prev.categorias.includes(cat)
        ? prev.categorias.filter(c => c !== cat)
        : [...prev.categorias, cat]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lider1) return alert("Selecione pelo menos o Líder 1");
    setLoading(true);
    try {
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          leaderId: lider1?.id,
          leaderId2: lider2?.id,
          leaderId3: lider3?.id,
          leaderId4: lider4?.id,
          membros: membros.map(m => m.id),
        }),
      });
      if (res.ok) router.push("/grupos");
      else {
        const err = await res.json();
        alert(err.error || "Erro ao criar grupo");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #E5E7EB",
    borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "white",
    boxSizing: "border-box", color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151",
  };

  const chipStyle = (selected: boolean): React.CSSProperties => ({
    padding: "0.35rem 0.75rem", borderRadius: 20,
    border: `1.5px solid ${selected ? "#1A3C6E" : "#E5E7EB"}`,
    background: selected ? "#EFF6FF" : "white",
    color: selected ? "#1A3C6E" : "#6B7280",
    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE1", padding: "2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <button onClick={() => router.push("/grupos")} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.875rem" }}>
            <ArrowLeft size={18} strokeWidth={1.5} /> Voltar
          </button>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Novo Grupo</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Coluna Esquerda — Informações */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E" }}>
                <Users size={18} strokeWidth={1.5} color="#1A3C6E" /> Informações
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Nome do grupo *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Ex: Célula Jovens" />
                </div>
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Descrição do grupo..." />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={labelStyle}>Data de abertura</label>
                    <input type="date" value={form.dataAbertura} onChange={e => setForm({ ...form, dataAbertura: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Dia da semana</label>
                    <select value={form.meetingDay} onChange={e => setForm({ ...form, meetingDay: e.target.value })} style={inputStyle}>
                      <option value="">Selecione</option>
                      {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={labelStyle}>Perfil</label>
                    <select value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })} style={inputStyle}>
                      <option value="">Selecione</option>
                      {PERFILS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Horário</label>
                    <select value={form.meetingTime} onChange={e => setForm({ ...form, meetingTime: e.target.value })} style={inputStyle}>
                      <option value="">Selecione</option>
                      {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Endereço</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="Endereço do grupo..." />
                </div>
                <div>
                  <label style={labelStyle}>Grupo de origem</label>
                  <select value={form.grupoOrigemId} onChange={e => setForm({ ...form, grupoOrigemId: e.target.value })} style={inputStyle}>
                    <option value="">Nenhum</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <CheckboxField
                  title="Categorias"
                  options={CATEGORIAS}
                  selected={form.categorias}
                  onToggle={(v) => toggleCategoria(v)}
                  layout="grid"
                  columns={2}
                />
              </div>
            </div>

            {/* Coluna Direita — Liderança */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E" }}>
                <Users size={18} strokeWidth={1.5} color="#1A3C6E" /> Liderança
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <MemberSelector label="Líder 1 *" placeholder="Buscar líder principal..." value={lider1} onSelect={m => setLider1(m as Member | null)} required />
                <MemberSelector label="Líder 2" placeholder="Buscar líder..." value={lider2} onSelect={m => setLider2(m as Member | null)} />
                <MemberSelector label="Líder 3" placeholder="Buscar líder..." value={lider3} onSelect={m => setLider3(m as Member | null)} />
                <MemberSelector label="Líder 4" placeholder="Buscar líder..." value={lider4} onSelect={m => setLider4(m as Member | null)} />
              </div>
            </div>
          </div>

          {/* Membros do grupo */}
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E" }}>
              <Users size={18} strokeWidth={1.5} color="#1A3C6E" /> Membros do Grupo ({membros.length})
            </h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
              {membros.map(m => (
                <span key={m.id} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.6rem", background: "#EFF6FF", color: "#1A3C6E", borderRadius: 20, fontSize: "0.8rem", fontWeight: 500 }}>
                  {m.name}
                  <button type="button" onClick={() => setMembros(membros.filter(x => x.id !== m.id))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <MemberSelector
              placeholder="Adicionar membro ao grupo..."
              onSelect={(m) => {
                const member = m as Member;
                if (member && !membros.some(x => x.id === member.id)) {
                  setMembros([...membros, member]);
                }
              }}
            />
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button type="button" onClick={() => router.push("/grupos")} style={{ padding: "0.65rem 2rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
              Cancelar
            </button>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 2.5rem", background: loading ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              <Save size={16} strokeWidth={1.5} />
              {loading ? "Salvando..." : "Salvar Grupo"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
