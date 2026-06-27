"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Upload, BookOpen, Type,
  BarChart3, Clock, School, Search, User, Info,
} from "lucide-react";
import Link from "next/link";
import { MemberSelector } from "../../../components/MemberSelector";

const NAVY = "#1B2B4B";

interface Aula { titulo: string; tipo: string; conteudo: string; duracao: string; }
interface Modulo { titulo: string; aulas: Aula[]; }
interface Categoria { id: string; nome: string; cor: string; }
interface Escola { id: string; nome: string; }

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px 12px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10,
  fontSize: 14, outline: "none", fontFamily: "var(--font-nunito), sans-serif", boxSizing: "border-box" as const, background: "white",
};
const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 };

export default function NovoCursoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [form, setForm] = useState({
    titulo: "", descricao: "", banner: "", categoria: "", nivel: "INICIANTE",
    cargaHoraria: "", instrutor: "", instrutorId: "", escolaId: "",
  });
  const [modulos, setModulos] = useState<Modulo[]>([{ titulo: "Modulo 1", aulas: [{ titulo: "", tipo: "VIDEO", conteudo: "", duracao: "" }] }]);

  useEffect(() => {
    fetch("/api/ensino/categorias").then(r => r.json()).then(data => {
      const cats = data.categorias || [];
      setCategorias(cats);
      if (cats.length > 0 && !form.categoria) {
        setForm(f => ({ ...f, categoria: cats[0].nome }));
      }
    });
    fetch("/api/escolas").then(r => r.json()).then(data => {
      setEscolas(data.escolas || []);
    });
  }, []);

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

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(f => ({ ...f, banner: data.url }));
      } else {
        alert(data.error || "Erro ao fazer upload");
      }
    } catch {
      alert("Erro de conexao no upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo) { alert("Titulo obrigatorio"); return; }
    setSaving(true);
    try {
      const payload: any = { ...form, modulos: modulos.filter(m => m.titulo) };
      if (!payload.instrutorId) delete payload.instrutorId;
      const res = await fetch("/api/ensino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/ensino/${data.curso.id}`);
      } else {
        const d = await res.json();
        alert(d.error || "Erro ao criar curso");
      }
    } catch { alert("Erro de conexao"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ padding: "1.5rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: "#F8F9FC", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/ensino" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, color: NAVY }}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: NAVY, margin: "0 0 2px" }}>Novo Curso</h1>
            <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Preencha as informacoes para criar um novo curso ou estudo.</p>
          </div>
        </div>
        <button type="submit" form="cursoForm" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "#2563EB", color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          <SaveIcon size={14} /> {saving ? "Salvando..." : "Salvar Curso"}
        </button>
      </div>

      <form id="cursoForm" onSubmit={handleSubmit}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20 }}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: NAVY }}>Informacoes do Curso</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Titulo */}
            <div>
              <label style={labelStyle}>Titulo *</label>
              <div style={{ position: "relative" }}>
                <BookOpen size={16} strokeWidth={1.5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input required style={inputStyle} value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Fundamentos da Fe" />
              </div>
            </div>

            {/* Descricao */}
            <div>
              <label style={labelStyle}>Descricao</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical", padding: "12px 14px" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descreva o objetivo e o conteudo do curso..." />
            </div>

            {/* Categoria */}
            <div>
              <label style={labelStyle}>Categoria *</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }}>
                  <GridIcon size={16} />
                </div>
                <select required style={{ ...inputStyle, paddingLeft: 40 }} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                  {categorias.length === 0 && <option value="">Carregando...</option>}
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Escola */}
            <div>
              <label style={labelStyle}>Escola</label>
              <div style={{ position: "relative" }}>
                <School size={16} strokeWidth={1.5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <select style={{ ...inputStyle, paddingLeft: 40 }} value={form.escolaId} onChange={e => setForm(f => ({ ...f, escolaId: e.target.value }))}>
                  <option value="">Selecionar escola (opcional)</option>
                  {escolas.map(esc => (
                    <option key={esc.id} value={esc.id}>{esc.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nivel */}
            <div>
              <label style={labelStyle}>Nivel *</label>
              <div style={{ position: "relative" }}>
                <BarChart3 size={16} strokeWidth={1.5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <select required style={{ ...inputStyle, paddingLeft: 40 }} value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}>
                  <option value="INICIANTE">Iniciante</option>
                  <option value="INTERMEDIARIO">Intermediario</option>
                  <option value="AVANCADO">Avancado</option>
                </select>
              </div>
            </div>

            {/* Instrutor */}
            <div>
              <label style={labelStyle}>Instrutor / Coordenador</label>
              <MemberSelector
                label="Selecionar instrutor"
                placeholder="Buscar membro ou instrutor..."
                filterStatus={["ACTIVE", "PENDENTE"]}
                onSelect={(selected) => {
                  const member = selected as { id: string; name: string };
                  if (member) setForm(f => ({ ...f, instrutor: member.name, instrutorId: member.id }));
                }}
              />
              {form.instrutor && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{form.instrutor.charAt(0)}</div>
                  <strong>{form.instrutor}</strong>
                  <input type="hidden" name="instrutorId" value={form.instrutorId} />
                </div>
              )}
            </div>

            {/* Carga Horaria */}
            <div>
              <label style={labelStyle}>Carga Horaria (horas) *</label>
              <div style={{ position: "relative" }}>
                <Clock size={16} strokeWidth={1.5} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input type="number" required style={inputStyle} value={form.cargaHoraria} onChange={e => setForm(f => ({ ...f, cargaHoraria: e.target.value }))} placeholder="Ex: 20" />
              </div>
            </div>

            {/* Banner */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Banner do Curso (opcional)</label>
              {!form.banner ? (
                <label style={{ display: "block", padding: "24px", border: "2px dashed #E5E7EB", borderRadius: 12, textAlign: "center", cursor: "pointer", color: "#374151", background: "#FAFAFA" }}>
                  <Upload size={20} strokeWidth={1.5} style={{ margin: "0 auto 8px", display: "block", color: "#6B7280" }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Clique para enviar uma imagem</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>ou arraste e solte aqui (PNG ou JPG)</div>
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerUpload} disabled={uploading} />
                </label>
              ) : (
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 160 }}>
                  <img src={form.banner} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => setForm(f => ({ ...f, banner: "" }))} style={{ position: "absolute", top: 8, right: 8, padding: "6px 10px", background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Remover</button>
                </div>
              )}
            </div>
          </div>

          {/* Dica */}
          <div style={{ marginTop: 20, padding: "12px 16px", background: "#EFF6FF", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, border: "1px solid #DBEAFE" }}>
            <Info size={18} color="#3B82F6" />
            <span style={{ fontSize: 12, color: "#1E40AF" }}>Use uma imagem que represente bem o conteudo do curso.</span>
          </div>
        </motion.div>

        {/* Modulos */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Modulos & Aulas</h2>
            <button type="button" onClick={addModulo} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={14} strokeWidth={1.5} /> Modulo
            </button>
          </div>

          {modulos.map((mod, mi) => (
            <div key={mi} style={{ border: "1.5px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <GripVertical size={16} color="#9CA3AF" />
                <input style={{ ...inputStyle, padding: "10px 12px", fontWeight: 700, flex: 1 }} value={mod.titulo} onChange={e => updateModulo(mi, "titulo", e.target.value)} placeholder="Nome do modulo" />
                {modulos.length > 1 && (
                  <button type="button" onClick={() => removeModulo(mi)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", flexShrink: 0 }}><Trash2 size={16} /></button>
                )}
              </div>

              {mod.aulas.map((aula, ai) => (
                <div key={ai} style={{ display: "grid", gridTemplateColumns: "2fr 110px 2fr 80px 30px", gap: 8, marginBottom: 8, alignItems: "center", paddingLeft: 24 }}>
                  <input style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} value={aula.titulo} onChange={e => updateAula(mi, ai, "titulo", e.target.value)} placeholder="Titulo da aula" />
                  <select style={{ ...inputStyle, padding: "10px 12px", fontSize: 13, minWidth: 110 }} value={aula.tipo} onChange={e => updateAula(mi, ai, "tipo", e.target.value)}>
                    <option value="VIDEO">Video</option>
                    <option value="PDF">PDF</option>
                    <option value="TEXTO">Texto</option>
                  </select>
                  <input style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} value={aula.conteudo} onChange={e => updateAula(mi, ai, "conteudo", e.target.value)} placeholder={aula.tipo === "TEXTO" ? "Conteudo da aula..." : "URL do video ou PDF"} />
                  <input style={{ ...inputStyle, padding: "10px 12px", fontSize: 13 }} value={aula.duracao} onChange={e => updateAula(mi, ai, "duracao", e.target.value)} placeholder="10min" />
                  <button type="button" onClick={() => removeAula(mi, ai)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={() => addAula(mi)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#F9FAFB", border: "1px dashed #D1D5DB", borderRadius: 6, fontSize: 12, color: "#6B7280", cursor: "pointer", marginLeft: 24 }}>
                <Plus size={12} strokeWidth={1.5} /> Aula
              </button>
            </div>
          ))}
        </motion.div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Link href="/ensino" style={{ padding: "12px 24px", background: "#F3F4F6", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none" }}>Cancelar</Link>
          <button type="submit" disabled={saving} style={{ padding: "12px 24px", background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Salvando..." : "Criar Curso"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SaveIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function GridIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
