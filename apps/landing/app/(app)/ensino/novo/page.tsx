"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, BookOpen, GripVertical } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Aula { titulo: string; tipo: string; conteudo: string; duracao: string; }
interface Modulo { titulo: string; aulas: Aula[]; }

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "var(--font-nunito), sans-serif", boxSizing: "border-box" as const };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function NovoCursoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", banner: "", categoria: "ESTUDO", nivel: "INICIANTE", cargaHoraria: "", instrutor: "" });
  const [modulos, setModulos] = useState<Modulo[]>([{ titulo: "Modulo 1", aulas: [{ titulo: "", tipo: "VIDEO", conteudo: "", duracao: "" }] }]);

  function addModulo() {
    setModulos([...modulos, { titulo: `Modulo ${modulos.length + 1}`, aulas: [{ titulo: "", tipo: "VIDEO", conteudo: "", duracao: "" }] }]);
  }
  function removeModulo(idx: number) { setModulos(modulos.filter((_, i) => i !== idx)); }
  function updateModulo(idx: number, field: string, value: string) {
    setModulos(modulos.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  }
  function addAula(modIdx: number) {
    setModulos(modulos.map((m, i) => i === modIdx ? { ...m, aulas: [...m.aulas, { titulo: "", tipo: "VIDEO", conteudo: "", duracao: "" }] } : m));
  }
  function removeAula(modIdx: number, aulaIdx: number) {
    setModulos(modulos.map((m, i) => i === modIdx ? { ...m, aulas: m.aulas.filter((_, j) => j !== aulaIdx) } : m));
  }
  function updateAula(modIdx: number, aulaIdx: number, field: string, value: string) {
    setModulos(modulos.map((m, i) => i === modIdx ? { ...m, aulas: m.aulas.map((a, j) => j === aulaIdx ? { ...a, [field]: value } : a) } : m));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo) { alert("Titulo obrigatorio"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/ensino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, modulos: modulos.filter(m => m.titulo) }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/ensino/${data.id}`);
      } else {
        const d = await res.json();
        alert(d.error || "Erro ao criar curso");
      }
    } catch { alert("Erro de conexao"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/ensino" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0D2545", margin: 0 }}>Novo Curso</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: NAVY }}>Informacoes do Curso</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Titulo *</label>
              <input required style={inputStyle} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Fundamentos da Fe" />
            </div>
            <div>
              <label style={labelStyle}>Descricao</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descricao do curso..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Categoria</label>
                <select style={inputStyle} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                  <option value="ESTUDO">Estudo</option>
                  <option value="DISCIPULADO">Discipulado</option>
                  <option value="ESCOLA">Escola</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Nivel</label>
                <select style={inputStyle} value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}>
                  <option value="INICIANTE">Iniciante</option>
                  <option value="INTERMEDIARIO">Intermediario</option>
                  <option value="AVANCADO">Avancado</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Instrutor</label>
                <input style={inputStyle} value={form.instrutor} onChange={e => setForm(f => ({ ...f, instrutor: e.target.value }))} placeholder="Nome do instrutor" />
              </div>
              <div>
                <label style={labelStyle}>Carga Horaria (horas)</label>
                <input type="number" style={inputStyle} value={form.cargaHoraria} onChange={e => setForm(f => ({ ...f, cargaHoraria: e.target.value }))} placeholder="Ex: 20" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Banner (URL da imagem)</label>
              <input style={inputStyle} value={form.banner} onChange={e => setForm(f => ({ ...f, banner: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
        </motion.div>

        {/* Modulos */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Modulos & Aulas</h2>
            <button type="button" onClick={addModulo} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#EEF2FA", color: NAVY, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <Plus size={14} /> Modulo
            </button>
          </div>

          {modulos.map((mod, mi) => (
            <div key={mi} style={{ border: "1.5px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <GripVertical size={16} color="#9CA3AF" />
                <input style={{ ...inputStyle, fontWeight: 700 }} value={mod.titulo} onChange={e => updateModulo(mi, "titulo", e.target.value)} placeholder="Nome do modulo" />
                {modulos.length > 1 && (
                  <button type="button" onClick={() => removeModulo(mi)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", flexShrink: 0 }}><Trash2 size={16} /></button>
                )}
              </div>

              {mod.aulas.map((aula, ai) => (
                <div key={ai} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 80px 30px", gap: 8, marginBottom: 8, alignItems: "center", paddingLeft: 24 }}>
                  <input style={{ ...inputStyle, fontSize: 13 }} value={aula.titulo} onChange={e => updateAula(mi, ai, "titulo", e.target.value)} placeholder="Titulo da aula" />
                  <select style={{ ...inputStyle, fontSize: 13 }} value={aula.tipo} onChange={e => updateAula(mi, ai, "tipo", e.target.value)}>
                    <option value="VIDEO">Video</option>
                    <option value="PDF">PDF</option>
                    <option value="TEXTO">Texto</option>
                  </select>
                  <input style={{ ...inputStyle, fontSize: 13 }} value={aula.conteudo} onChange={e => updateAula(mi, ai, "conteudo", e.target.value)} placeholder="URL do video ou PDF" />
                  <input style={{ ...inputStyle, fontSize: 13 }} value={aula.duracao} onChange={e => updateAula(mi, ai, "duracao", e.target.value)} placeholder="10min" />
                  <button type="button" onClick={() => removeAula(mi, ai)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={() => addAula(mi)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#F9FAFB", border: "1px dashed #D1D5DB", borderRadius: 6, fontSize: 12, color: "#6B7280", cursor: "pointer", marginLeft: 24 }}>
                <Plus size={12} /> Aula
              </button>
            </div>
          ))}
        </motion.div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Link href="/ensino" style={{ padding: "12px 24px", background: "#F3F4F6", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none" }}>Cancelar</Link>
          <button type="submit" disabled={saving} style={{ padding: "12px 24px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Criar Curso"}
          </button>
        </div>
      </form>
    </div>
  );
}
