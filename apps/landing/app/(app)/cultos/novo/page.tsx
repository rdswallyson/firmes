"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, Save } from "lucide-react";
import { MemberSelector } from "../../../components/MemberSelector";

interface Member {
  id: string;
  name: string;
  photo?: string | null;
}

const TIPOS = ["Dominical", "Midweek", "Especial", "Jovens", "Infantil", "Outro"];

export default function NovoCultoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const congregationIdFromUrl = searchParams.get("congregationId") || "";
  const [form, setForm] = useState({
    titulo: "",
    data: "",
    hora: "10:00",
    local: "",
    tipo: "Dominical",
    descricao: "",
    tema: "",
    serie: "",
    transmissaoUrl: "",
    transmissaoAtiva: false,
  });
  const [pregador, setPregador] = useState<Member | null>(null);
  const [liderLouvor, setLiderLouvor] = useState<Member | null>(null);
  const [congregacoes, setCongregacoes] = useState<{ id: string; name: string }[]>([]);
  const [congregationId, setCongregationId] = useState(congregationIdFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/congregacoes")
      .then(r => r.json())
      .then((d: { congregations?: { id: string; name: string }[] }) => setCongregacoes(d.congregations ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.data) {
      setError("Título e data são obrigatórios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const dataHora = `${form.data}T${form.hora}:00`;
      const res = await fetch("/api/cultos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          data: dataHora,
          local: form.local,
          tipo: form.tipo,
          descricao: form.descricao,
          tema: form.tema,
          serie: form.serie,
          transmissaoUrl: form.transmissaoAtiva ? form.transmissaoUrl : undefined,
          pregadorId: pregador?.id,
          liderLouvorId: liderLouvor?.id,
          congregationId: congregationId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar culto");
      router.push(`/cultos/${data.culto.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #E5E7EB",
    borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "white",
    boxSizing: "border-box", color: "#111827",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "0.35rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE1", padding: "2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <button onClick={() => router.push("/cultos")} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.875rem" }}>
            <ArrowLeft size={18} strokeWidth={1.5} /> Voltar
          </button>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Novo Culto</h1>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.875rem" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Coluna Esquerda — Informações */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E" }}>
                <QrCode size={18} strokeWidth={1.5} color="#1A3C6E" /> Informações
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Título do culto *</label>
                  <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required style={inputStyle} placeholder="ex: Culto Domingo de Manhã" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={labelStyle}>Data *</label>
                    <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Hora *</label>
                    <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} required style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Local</label>
                  <input value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} style={inputStyle} placeholder="Templo Principal" />
                </div>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {congregacoes.length > 0 && (
                  <div>
                    <label style={labelStyle}>Congregação</label>
                    {congregationIdFromUrl ? (
                      <div style={{ ...inputStyle, background: "#F3F4F6", display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
                        <span>⛪</span>
                        <span style={{ fontWeight: 600 }}>
                          {congregacoes.find(c => c.id === congregationIdFromUrl)?.name ?? "Sede"} (fixo)
                        </span>
                      </div>
                    ) : (
                      <select value={congregationId} onChange={e => setCongregationId(e.target.value)} style={inputStyle}>
                        <option value="">Sede (padrão)</option>
                        {congregacoes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Detalhes do culto..." />
                </div>
              </div>
            </div>

            {/* Coluna Direita — Ministração */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E" }}>
                <QrCode size={18} strokeWidth={1.5} color="#1A3C6E" /> Ministração
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <MemberSelector label="Pregador / Ministro" placeholder="Buscar pregador..." value={pregador} onSelect={m => setPregador(m as Member | null)} />
                <MemberSelector label="Louvor responsável" placeholder="Buscar líder de louvor..." value={liderLouvor} onSelect={m => setLiderLouvor(m as Member | null)} />
                <div>
                  <label style={labelStyle}>Tema / Texto bíblico</label>
                  <input value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} style={inputStyle} placeholder="João 3:16" />
                </div>
                <div>
                  <label style={labelStyle}>Série</label>
                  <input value={form.serie} onChange={e => setForm({ ...form, serie: e.target.value })} style={inputStyle} placeholder="Nome da série de mensagens" />
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#374151", cursor: "pointer", marginBottom: "0.5rem" }}>
                    <input type="checkbox" checked={form.transmissaoAtiva} onChange={e => setForm({ ...form, transmissaoAtiva: e.target.checked })} />
                    Transmissão ao vivo
                  </label>
                  {form.transmissaoAtiva && (
                    <input value={form.transmissaoUrl} onChange={e => setForm({ ...form, transmissaoUrl: e.target.value })} style={inputStyle} placeholder="https://youtube.com/..." />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button type="button" onClick={() => router.push("/cultos")} style={{ padding: "0.65rem 2rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
              Cancelar
            </button>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 2.5rem", background: loading ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              <QrCode size={16} strokeWidth={1.5} />
              {loading ? "Criando..." : "Criar Culto e Gerar QR Code"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
