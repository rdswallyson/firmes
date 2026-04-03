"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Upload, Search, Download, Music, Video, Plus, X, Headphones } from "lucide-react";

interface Midia {
  id: string; titulo: string; tipo: "AUDIO" | "VIDEO"; categoria: string;
  url: string; pregador?: string; data?: string; duracao?: string; reproducoes: number; createdAt: string;
}

const CATEGORIAS = [
  { key: "SERMAO", label: "Sermão", icon: "🎤" },
  { key: "LOUVOR", label: "Louvor", icon: "🎵" },
  { key: "ESTUDO", label: "Estudo", icon: "📖" },
  { key: "OUTROS", label: "Outros", icon: "📁" },
];

export default function MidiasPage() {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [form, setForm] = useState({ titulo: "", tipo: "VIDEO", categoria: "SERMAO", url: "", pregador: "", data: "", duracao: "" });
  const [saving, setSaving] = useState(false);

  function fetchMidias() {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoriaFiltro) params.set("categoria", categoriaFiltro);
    if (busca) params.set("busca", busca);
    fetch(`/api/midias?${params}`).then(r => r.json()).then((d: { midias: Midia[] }) => setMidias(d.midias ?? [])).finally(() => setLoading(false));
  }

  useEffect(() => { fetchMidias(); }, [categoriaFiltro]);
  useEffect(() => {
    const t = setTimeout(fetchMidias, 300);
    return () => clearTimeout(t);
  }, [busca]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/midias", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setShowModal(false);
    setForm({ titulo: "", tipo: "VIDEO", categoria: "SERMAO", url: "", pregador: "", data: "", duracao: "" });
    fetchMidias();
  }

  async function incrementarReproducao(id: string) {
    await fetch(`/api/midias/${id}`, { method: "PATCH" });
  }

  function togglePlay(m: Midia) {
    if (playing === m.id) {
      audioRef.current?.pause();
      videoRef.current?.pause();
      setPlaying(null);
    } else {
      setPlaying(m.id);
      incrementarReproducao(m.id);
    }
  }

  function exportCSV() {
    const headers = ["Título", "Tipo", "Categoria", "Pregador", "Data", "Duração", "Reproduções"];
    const rows = midias.map(m => [m.titulo, m.tipo, m.categoria, m.pregador || "", m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "", m.duracao || "", String(m.reproducoes)]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "midias.csv"; a.click();
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "#374151" };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Mídias</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Sermões, louvores e estudos</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", color: "#374151" }}>
            <Download size={16} strokeWidth={1.5} /> Exportar CSV
          </button>
          <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 600 }}>
            <Plus size={16} strokeWidth={1.5} /> Nova Mídia
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "250px", maxWidth: "400px" }}>
          <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por título ou pregador..." style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)} style={{ padding: "0.55rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.85rem", background: "white" }}>
          <option value="">Todas categorias</option>
          {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {loading ? <div style={{ color: "#9CA3AF" }}>Carregando...</div> : midias.length === 0 ? <div style={{ color: "#9CA3AF" }}>Nenhuma mídia encontrada</div> : midias.map((m, i) => {
          const cat = CATEGORIAS.find(c => c.key === m.categoria) ?? CATEGORIAS[3] ?? { key: "OUTROS", label: "Outros", icon: "📁" };
          const isPlaying = playing === m.id;
          return (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ height: "160px", background: "linear-gradient(135deg, #1A3C6E 0%, #0F2445 100%)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <button onClick={() => togglePlay(m)} style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}>
                  {isPlaying ? <Pause size={24} color="white" fill="white" /> : <Play size={24} color="white" fill="white" style={{ marginLeft: "3px" }} />}
                </button>
                <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(0,0,0,0.5)", color: "white", fontSize: "0.7rem", padding: "3px 8px", borderRadius: "10px" }}>
                  {m.tipo === "AUDIO" ? <Headphones size={12} strokeWidth={2} style={{ verticalAlign: "middle", marginRight: "4px" }} /> : <Video size={12} strokeWidth={2} style={{ verticalAlign: "middle", marginRight: "4px" }} />}
                  {m.tipo === "AUDIO" ? "Áudio" : "Vídeo"}
                </div>
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem" }}>{cat.icon}</span>
                  <span style={{ fontSize: "0.72rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.label}</span>
                </div>
                <h3 style={{ margin: "0 0 0.4rem", fontSize: "0.95rem", fontWeight: 700, color: "#0D2545", lineHeight: 1.3 }}>{m.titulo}</h3>
                {m.pregador && <div style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "0.3rem" }}>🎤 {m.pregador}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "—"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#6B7280" }}>
                    <Play size={12} strokeWidth={1.5} /> {m.reproducoes}
                  </div>
                </div>
              </div>
              {isPlaying && m.tipo === "AUDIO" && <audio ref={audioRef} src={m.url} autoPlay onEnded={() => setPlaying(null)} style={{ width: "100%" }} controls />}
              {isPlaying && m.tipo === "VIDEO" && <video ref={videoRef} src={m.url} autoPlay onEnded={() => setPlaying(null)} style={{ width: "100%", height: "200px" }} controls />}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.75rem", maxWidth: "480px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Upload size={20} strokeWidth={1.5} color="#1A3C6E" />
                  <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0D2545" }}>Nova Mídia</h2>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div><label style={labelStyle}>Título *</label><input required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} style={inputStyle} placeholder="Ex: Culto de Domingo" /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div><label style={labelStyle}>Tipo *</label>
                      <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                        <option value="VIDEO">🎬 Vídeo</option>
                        <option value="AUDIO">🎧 Áudio</option>
                      </select>
                    </div>
                    <div><label style={labelStyle}>Categoria *</label>
                      <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={inputStyle}>
                        {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label style={labelStyle}>URL do arquivo *</label><input required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
                  <div><label style={labelStyle}>Pregador / Artista</label><input value={form.pregador} onChange={e => setForm({ ...form, pregador: e.target.value })} style={inputStyle} placeholder="Nome do pregador" /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div><label style={labelStyle}>Data</label><input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Duração</label><input value={form.duracao} onChange={e => setForm({ ...form, duracao: e.target.value })} style={inputStyle} placeholder="45:00" /></div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "0.6rem 1.25rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer" }}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ padding: "0.6rem 1.25rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>{saving ? "Salvando..." : "Salvar"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
