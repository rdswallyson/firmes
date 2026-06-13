"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarPlus, ArrowLeft, Upload, Link as LinkIcon, MapPin, Save } from "lucide-react";
import { MemberSelector } from "../../../components/MemberSelector";

interface Member {
  id: string;
  name: string;
  photo?: string | null;
}

const MINISTERIOS = ["Louvor", "Jovens", "EBD", "Intercessão", "Mídia", "Infantil", "Dança", "Teatro"];

export default function NovoEventoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const congregationIdFromUrl = searchParams.get("congregationId") || "";
  const [saving, setSaving] = useState(false);
  const [bannerMode, setBannerMode] = useState<"url" | "upload">("url");
  const [organizador, setOrganizador] = useState<Member | null>(null);
  const [congregacoes, setCongregacoes] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "", subtitulo: "", description: "",
    date: "", dataFim: "", location: "",
    maxVagas: "", isGratuito: true, valor: "", banner: "",
    linkExterno: "", avancado: false, endereco: "", googleMapsLink: "",
    telefoneObrigatorio: false, enderecoObrigatorio: false,
    emailObrigatorio: false, ocultarTelefone: false, ocultarEndereco: false,
    formaPagamento: "", ministerioResponsavel: "", visibilidade: "PUBLICO",
    congregationId: congregationIdFromUrl,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          organizadorId: organizador?.id,
          maxVagas: form.maxVagas ? Number(form.maxVagas) : undefined,
          valor: !form.isGratuito && form.valor ? Number(form.valor) : undefined,
        }),
      });
      if (res.ok) {
        if (congregationIdFromUrl) router.push(`/congregacoes/${congregationIdFromUrl}`);
        else router.push("/eventos");
      }
      else alert("Erro ao criar evento");
    } catch { alert("Erro de conexão"); }
    setSaving(false);
  }

  useEffect(() => {
    fetch("/api/congregacoes")
      .then(r => r.json())
      .then((d: { congregations?: { id: string; name: string }[] }) => setCongregacoes(d.congregations ?? []))
      .catch(() => {});
  }, []);

  async function handleBannerUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, banner: reader.result as string });
    reader.readAsDataURL(file);
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.65rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "#374151" };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EBE1", padding: "2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <button onClick={() => router.push("/eventos")} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.875rem" }}>
            <ArrowLeft size={18} strokeWidth={1.5} /> Voltar
          </button>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Novo Evento</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Coluna Esquerda */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E" }}>
                <CalendarPlus size={18} strokeWidth={1.5} color="#1A3C6E" /> Informações do Evento
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Banner</label>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <button type="button" onClick={() => setBannerMode("url")} style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid #E5E7EB", background: bannerMode === "url" ? "#1A3C6E" : "white", color: bannerMode === "url" ? "white" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}><LinkIcon size={12} /> URL</button>
                    <button type="button" onClick={() => setBannerMode("upload")} style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid #E5E7EB", background: bannerMode === "upload" ? "#1A3C6E" : "white", color: bannerMode === "upload" ? "white" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}><Upload size={12} /> Upload</button>
                  </div>
                  {bannerMode === "url" ? (
                    <input value={form.banner} onChange={e => setForm({ ...form, banner: e.target.value })} style={inputStyle} placeholder="https://..." />
                  ) : (
                    <div style={{ border: "2px dashed #D1D5DB", borderRadius: "8px", padding: "0.75rem", textAlign: "center", cursor: "pointer" }}
                      onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = () => { if (inp.files?.[0]) handleBannerUpload(inp.files[0]); }; inp.click(); }}>
                      {form.banner ? <img src={form.banner} alt="banner" style={{ maxWidth: "100%", maxHeight: "100px", borderRadius: "6px" }} /> : <span style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>Clique para enviar</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Título *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Ex: Conferência de Jovens 2026" />
                </div>
                <div>
                  <label style={labelStyle}>Subtítulo</label>
                  <input value={form.subtitulo} onChange={e => setForm({ ...form, subtitulo: e.target.value })} style={inputStyle} placeholder="Subtítulo do evento" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={labelStyle}>Data inicial *</label>
                    <input type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Data final</label>
                    <input type="datetime-local" value={form.dataFim} onChange={e => setForm({ ...form, dataFim: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Local</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} placeholder="Ex: Templo Principal" />
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
                      <select value={form.congregationId} onChange={e => setForm({ ...form, congregationId: e.target.value })} style={inputStyle}>
                        <option value="">Sede (padrão)</option>
                        {congregacoes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={labelStyle}>Vagas</label>
                    <input type="number" min="0" value={form.maxVagas} onChange={e => setForm({ ...form, maxVagas: e.target.value })} style={inputStyle} placeholder="Ilimitado" />
                  </div>
                  <div>
                    <label style={labelStyle}>Visibilidade</label>
                    <select value={form.visibilidade} onChange={e => setForm({ ...form, visibilidade: e.target.value })} style={inputStyle}>
                      <option value="PUBLICO">Público</option>
                      <option value="PRIVADO">Privado</option>
                      <option value="MEMBROS">Só membros</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", padding: "0.75rem", background: "#F9FAFB", borderRadius: "8px" }}>
                  {[
                    { key: "telefoneObrigatorio", label: "Telefone obrigatório" },
                    { key: "enderecoObrigatorio", label: "Endereço obrigatório" },
                    { key: "emailObrigatorio", label: "Email obrigatório" },
                    { key: "ocultarTelefone", label: "Ocultar telefone" },
                    { key: "ocultarEndereco", label: "Ocultar endereço" },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#374151", cursor: "pointer" }}>
                      <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked } as any)} />
                      {label}
                    </label>
                  ))}
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#374151", cursor: "pointer", marginBottom: "0.5rem" }}>
                    <input type="checkbox" checked={form.isGratuito} onChange={e => setForm({ ...form, isGratuito: e.target.checked })} />
                    Evento gratuito
                  </label>
                  {!form.isGratuito && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                      <div>
                        <label style={labelStyle}>Valor (R$) *</label>
                        <input type="number" step="0.01" min="0" required={!form.isGratuito} value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} style={inputStyle} placeholder="0,00" />
                      </div>
                      <div>
                        <label style={labelStyle}>Forma de pagamento</label>
                        <select value={form.formaPagamento} onChange={e => setForm({ ...form, formaPagamento: e.target.value })} style={inputStyle}>
                          <option value="">Selecione</option>
                          <option value="PIX">PIX</option>
                          <option value="CARTAO">Cartão</option>
                          <option value="BOLETO">Boleto</option>
                          <option value="DINHEIRO">Dinheiro</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0D2545", margin: "0 0 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem", paddingBottom: "0.75rem", borderBottom: "2px solid #1A3C6E" }}>
                <CalendarPlus size={18} strokeWidth={1.5} color="#1A3C6E" /> Detalhes
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="Detalhes do evento..." />
                </div>
                <MemberSelector label="Responsável / Organizador" placeholder="Buscar organizador..." value={organizador} onSelect={m => setOrganizador(m as Member | null)} />
                <div>
                  <label style={labelStyle}>Ministério responsável</label>
                  <select value={form.ministerioResponsavel} onChange={e => setForm({ ...form, ministerioResponsavel: e.target.value })} style={inputStyle}>
                    <option value="">Selecione</option>
                    {MINISTERIOS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><MapPin size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Endereço completo</label>
                  <input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} style={inputStyle} placeholder="Rua, número, bairro, cidade - estado" />
                </div>
                <div>
                  <label style={labelStyle}>Link do Google Maps</label>
                  <input value={form.googleMapsLink} onChange={e => setForm({ ...form, googleMapsLink: e.target.value })} style={inputStyle} placeholder="https://maps.google.com/..." />
                </div>
                <div>
                  <label style={labelStyle}>Link externo (transmissão)</label>
                  <input value={form.linkExterno} onChange={e => setForm({ ...form, linkExterno: e.target.value })} style={inputStyle} placeholder="https://youtube.com/..." />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button type="button" onClick={() => router.push("/eventos")} style={{ padding: "0.65rem 2rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
              Cancelar
            </button>
            <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 2.5rem", background: saving ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
              <Save size={16} strokeWidth={1.5} />
              {saving ? "Criando..." : "Criar Evento"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
