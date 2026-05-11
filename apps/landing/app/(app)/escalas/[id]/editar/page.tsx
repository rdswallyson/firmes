"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Music, Mic, DoorOpen, Baby, Headphones, Users, X, Check, Save, Loader2 } from "lucide-react";
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

interface EscalaMembro {
  id: string;
  memberId: string;
  funcao: string;
  status: string;
  member: { id: string; name: string; photo?: string; phone?: string };
}

interface Escala {
  id: string;
  titulo: string;
  data: string;
  ministerio: string;
  observacoes?: string;
  status: string;
  membros: EscalaMembro[];
}

export default function EditarEscalaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({ titulo: "", data: "", hora: "10:00", ministerio: "LOUVOR", observacoes: "" });
  const [status, setStatus] = useState("ATIVA");
  const [membros, setMembros] = useState<Membro[]>([]);
  const [selecionados, setSelecionados] = useState<{ memberId: string; funcao: string; status?: string }[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch("/api/members?limit=200").then(r => r.json()),
      fetch(`/api/escalas/${id}`).then(r => r.json()),
    ]).then(([membrosData, escalaData]) => {
      setMembros(membrosData.members || []);
      if (escalaData.error) {
        setError(escalaData.error);
      } else {
        const e = escalaData.escala as Escala;
        const dt = new Date(e.data);
        const dataStr = dt.toISOString().split("T")[0] || "";
        const horaStr = dt.toTimeString().slice(0, 5) || "";
        setForm({
          titulo: e.titulo,
          data: dataStr,
          hora: horaStr,
          ministerio: e.ministerio,
          observacoes: e.observacoes || "",
        });
        setStatus(e.status);
        setSelecionados(e.membros.map((m: EscalaMembro) => ({
          memberId: m.memberId,
          funcao: m.funcao,
          status: m.status,
        })));
      }
      setLoading(false);
    }).catch(() => {
      setError("Erro ao carregar dados");
      setLoading(false);
    });
  }, [id]);

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
      const res = await fetch(`/api/escalas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          data: `${form.data}T${form.hora}:00`,
          status,
          membros: selecionados,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      router.push(`/escalas/${id}`);
    } catch (err) {
      alert("Erro ao salvar: " + (err instanceof Error ? err.message : "Erro desconhecido"));
      setSalvando(false);
    }
  };

  const filtrados = membros.filter(m => !busca || m.name.toLowerCase().includes(busca.toLowerCase()));

  if (loading) return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
      <Loader2 size={32} style={{ color: NAVY, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (error) return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <Link href="/escalas" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 20 }}><ArrowLeft size={16} /> Voltar</Link>
      <div style={{ background: "#fff", borderRadius: 14, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <p style={{ color: "#9CA3AF" }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <Link href={`/escalas/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 20 }}><ArrowLeft size={16} /> Voltar</Link>
      <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: "#0D2545" }}>Editar Escala</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Título</label>
            <input type="text" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Data</label>
              <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} required
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Hora</label>
              <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} required
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Ministério</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MINISTERIOS.map(m => (
                <button key={m.id} type="button" onClick={() => setForm({ ...form, ministerio: m.id })}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: form.ministerio === m.id ? `2px solid ${m.color}` : "2px solid #E5E7EB", background: form.ministerio === m.id ? m.color + "10" : "#fff", color: form.ministerio === m.id ? m.color : "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none" }}>
              <option value="ATIVA">Ativa</option>
              <option value="ENCERRADA">Encerrada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Observações</label>
            <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", resize: "vertical" }} />
          </div>
        </div>

        {/* Membros */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#0D2545" }}>Membros escalados</h2>

          <input type="text" placeholder="Buscar membro..." value={busca} onChange={e => setBusca(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, marginBottom: 12, outline: "none" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
            {filtrados.map(m => {
              const sel = selecionados.find(s => s.memberId === m.id);
              return (
                <div key={m.id}
                  onClick={() => toggleMembro(m)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", background: sel ? "#EEF2FA" : "#FAFAFA", border: sel ? `2px solid ${NAVY}` : "2px solid transparent" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.photo ? `url(${m.photo}) center/cover` : `hsl(${m.name.charCodeAt(0) * 7},55%,82%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: `hsl(${m.name.charCodeAt(0) * 7},40%,30%)`, flexShrink: 0 }}>
                    {!m.photo && m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.phone || "—"}</div>
                  </div>
                  {sel ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <select value={sel.funcao} onClick={e => e.stopPropagation()} onChange={e => updateFuncao(m.id, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #E5E7EB", fontSize: 12 }}>
                        {funcoes.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <Check size={16} style={{ color: "#16A34A" }} />
                    </div>
                  ) : (
                    <Plus size={16} style={{ color: "#9CA3AF" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={salvando}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: NAVY, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", opacity: salvando ? 0.7 : 1 }}>
            {salvando ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
          <Link href={`/escalas/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#F3F4F6", color: "#374151", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
