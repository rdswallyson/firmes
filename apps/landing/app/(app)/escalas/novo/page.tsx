"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Music, Mic, DoorOpen, Baby, Headphones, Users, X, Check } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

const MINISTERIOS = [
  { id: "LOUVOR", label: "Louvor", icon: <Music size={16} />, color: "#7C3AED", funcoes: ["Vocal", "Teclado", "Guitarra", "Baixo", "Bateria", "Violão"] },
  { id: "SOM", label: "Som", icon: <Headphones size={16} />, color: "#2563EB", funcoes: ["Mesa de som", "Projeção", "Transmissão"] },
  { id: "RECEPCAO", label: "Recepção", icon: <Users size={16} />, color: "#16A34A", funcoes: ["Recepcionista", "Acolhimento", "Informações"] },
  { id: "PORTARIA", label: "Portaria", icon: <DoorOpen size={16} />, color: "#DC2626", funcoes: ["Segurança", "Estacionamento", "Porteiro"] },
  { id: "INFANTIL", label: "Infantil", icon: <Baby size={16} />, color: "#EA580C", funcoes: ["Professor", "Auxiliar", "Coordenador"] },
];

interface Membro {
  id: string;
  name: string;
  photo?: string;
  phone?: string;
}

export default function NovaEscalaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ titulo: "", data: "", hora: "10:00", ministerio: "LOUVOR", observacoes: "" });
  const [membros, setMembros] = useState<Membro[]>([]);
  const [selecionados, setSelecionados] = useState<{ memberId: string; funcao: string }[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch("/api/members?limit=200").then(r => r.json()).then(d => setMembros(d.members || []));
  }, []);

  const funcoes = MINISTERIOS.find(m => m.id === form.ministerio)?.funcoes || [];

  const toggleMembro = (m: Membro) => {
    const exists = selecionados.find(s => s.memberId === m.id);
    if (exists) {
      setSelecionados(selecionados.filter(s => s.memberId !== m.id));
    } else {
      setSelecionados([...selecionados, { memberId: m.id, funcao: funcoes[0] || "Participante" }]);
    }
  };

  const updateFuncao = (memberId: string, funcao: string) => {
    setSelecionados(selecionados.map(s => s.memberId === memberId ? { ...s, funcao } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selecionados.length === 0) return alert("Selecione pelo menos um membro");
    setSalvando(true);
    try {
      const res = await fetch("/api/escalas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          data: `${form.data}T${form.hora}:00`,
          membros: selecionados,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      router.push("/escalas");
    } catch {
      alert("Erro ao criar escala");
      setSalvando(false);
    }
  };

  const filtrados = membros.filter(m => !busca || m.name.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 800, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <Link href="/escalas" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 14, textDecoration: "none", marginBottom: 16 }}>
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Nova Escala</h1>
      <p style={{ color: "#6B7280", fontSize: 13, margin: "0 0 24px" }}>Selecione o ministério, data e os membros escalados</p>

      <form onSubmit={handleSubmit}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Título *</label>
            <input value={form.titulo} onChange={ev => setForm({ ...form, titulo: ev.target.value })} placeholder="ex: Culto Domingo Manhã" required
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Data *</label>
              <input type="date" value={form.data} onChange={ev => setForm({ ...form, data: ev.target.value })} required
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Hora *</label>
              <input type="time" value={form.hora} onChange={ev => setForm({ ...form, hora: ev.target.value })} required
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Ministério *</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MINISTERIOS.map(m => (
                <button key={m.id} type="button" onClick={() => setForm({ ...form, ministerio: m.id })}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: form.ministerio === m.id ? m.color : "#F3F4F6", color: form.ministerio === m.id ? "#fff" : "#6B7280" }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Observações</label>
            <textarea value={form.observacoes} onChange={ev => setForm({ ...form, observacoes: ev.target.value })} placeholder="Instruções ou observações..."
              rows={3}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
          </div>
        </div>

        {/* Seleção de membros */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0D2545", margin: "0 0 14px" }}>Membros Escalados ({selecionados.length})</h2>

          <input value={busca} onChange={ev => setBusca(ev.target.value)} placeholder="Buscar membro..."
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

          <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid #F3F4F6", borderRadius: 10, padding: "4px 0" }}>
            {filtrados.slice(0, 50).map(m => {
              const sel = selecionados.find(s => s.memberId === m.id);
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid #F9FAFB" }}>
                  <button type="button" onClick={() => toggleMembro(m)}
                    style={{ width: 22, height: 22, borderRadius: 6, border: sel ? "none" : "2px solid #D1D5DB", background: sel ? "#16A34A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {sel && <Check size={14} color="#fff" />}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0D2545" }}>{m.name}</div>
                    {m.phone && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.phone}</div>}
                  </div>
                  {sel && (
                    <select value={sel.funcao} onChange={ev => updateFuncao(m.id, ev.target.value)}
                      style={{ padding: "5px 10px", border: "1.5px solid #E5E7EB", borderRadius: 6, fontSize: 12, outline: "none", background: "#fff" }}>
                      {funcoes.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={salvando}
          style={{ width: "100%", padding: "13px", background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: salvando ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {salvando ? "Salvando..." : <><Plus size={18} /> Criar Escala</>}
        </button>
      </form>
    </div>
  );
}
