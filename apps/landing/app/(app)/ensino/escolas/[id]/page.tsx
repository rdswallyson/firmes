"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, UserPlus, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { MemberSelector } from "../../../../components/MemberSelector";

const NAVY = "#1A3C6E";
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "var(--font-nunito), sans-serif", boxSizing: "border-box" as const };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };

interface Escola {
  id: string;
  nome: string;
  descricao?: string;
  coordenadorId?: string;
  coordenador?: { id: string; name: string; photo?: string };
  status: string;
  alunos: { id: string; member: { id: string; name: string; photo?: string } }[];
  cursos: { id: string; titulo: string; banner?: string; nivel: string; publicado: boolean }[];
}

export default function EditarEscolaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [escolaId, setEscolaId] = useState<string | null>(null);
  const [escola, setEscola] = useState<Escola | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingAluno, setAddingAluno] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", coordenadorId: "", coordenadorNome: "", status: "ATIVA" });

  useEffect(() => {
    params.then(({ id }) => {
      setEscolaId(id);
      fetch(`/api/escolas`)
        .then(r => {
          if (!r.ok) throw new Error("Erro ao buscar escolas");
          return r.json();
        })
        .then(data => {
          const e = (data.escolas || []).find((x: Escola) => x.id === id);
          if (e) {
            setEscola(e);
            setForm({
              nome: e.nome || "",
              descricao: e.descricao || "",
              coordenadorId: e.coordenadorId || "",
              coordenadorNome: e.coordenador?.name || "",
              status: e.status || "ATIVA",
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !escolaId) { alert("Nome obrigatorio"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/escolas/${escolaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao,
          coordenadorId: form.coordenadorId || undefined,
          status: form.status,
        }),
      });
      if (res.ok) {
        alert("Escola atualizada com sucesso!");
      } else {
        const d = await res.json();
        alert(d.error || "Erro ao atualizar escola");
      }
    } catch { alert("Erro de conexao"); }
    finally { setSaving(false); }
  }

  async function addAluno(memberId: string) {
    if (!escola || !escolaId) return;
    setAddingAluno(true);
    try {
      const res = await fetch(`/api/escolas/${escolaId}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        const data = await res.json();
        setEscola({ ...escola, alunos: [...escola.alunos, data.aluno] });
      } else {
        const d = await res.json();
        alert(d.error || "Erro ao adicionar aluno");
      }
    } catch { alert("Erro de conexao"); }
    finally { setAddingAluno(false); }
  }

  async function removeAluno(memberId: string) {
    if (!escola || !escolaId) return;
    if (!confirm("Remover aluno da escola?")) return;
    try {
      const res = await fetch(`/api/escolas/${escolaId}/alunos?memberId=${memberId}`, { method: "DELETE" });
      if (res.ok) {
        setEscola({ ...escola, alunos: escola.alunos.filter(a => a.member.id !== memberId) });
      }
    } catch { alert("Erro de conexao"); }
  }

  if (loading) return <div style={{ padding: 48, textAlign: "center" }}>Carregando...</div>;
  if (!escola) return <div style={{ padding: 48, textAlign: "center" }}>Escola nao encontrada</div>;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/ensino/escolas" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0D2545", margin: 0 }}>Editar Escola</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome da Escola *</label>
              <input required style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Descricao</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Coordenador</label>
              <MemberSelector
                label="Selecionar coordenador"
                placeholder="Buscar membro coordenador..."
                filterStatus={["ACTIVE", "PENDENTE"]}
                onSelect={(selected) => {
                  const member = selected as { id: string; name: string };
                  if (member) setForm(f => ({ ...f, coordenadorId: member.id, coordenadorNome: member.name }));
                }}
              />
              {form.coordenadorNome && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>Coordenador: <strong>{form.coordenadorNome}</strong></div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="ATIVA">Ativa</option>
                <option value="INATIVA">Inativa</option>
              </select>
            </div>
          </div>
        </motion.div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 24 }}>
          <Link href="/ensino/escolas" style={{ padding: "12px 24px", background: "#F3F4F6", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none" }}>Cancelar</Link>
          <button type="submit" disabled={saving} style={{ padding: "12px 24px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            <Save size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> {saving ? "Salvando..." : "Salvar Alteracoes"}
          </button>
        </div>
      </form>

      {/* Cursos */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Cursos Vinculados</h2>
          <span style={{ fontSize: 12, color: "#6B7280" }}>{escola.cursos?.length || 0} curso(s)</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {escola.cursos?.map((curso) => (
            <div key={curso.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F9FAFB", borderRadius: 8, border: "1.5px solid #E5E7EB" }}>
              <div style={{ width: 48, height: 36, borderRadius: 6, background: curso.banner ? `url(${curso.banner}) center/cover` : NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {!curso.banner && curso.titulo.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0D2545" }}>{curso.titulo}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{curso.nivel} {curso.publicado ? "· Publicado" : "· Rascunho"}</div>
              </div>
              <Link href={`/ensino/${curso.id}`} style={{ fontSize: 12, fontWeight: 700, color: NAVY, textDecoration: "none", padding: "6px 10px", background: "#EEF2FA", borderRadius: 6 }}>Ver curso</Link>
            </div>
          ))}
          {(!escola.cursos || escola.cursos.length === 0) && (
            <div style={{ textAlign: "center", padding: 24, color: "#9CA3AF", fontSize: 13 }}>Nenhum curso vinculado a esta escola. Crie um curso e selecione esta escola no formulario.</div>
          )}
        </div>
      </motion.div>

      {/* Alunos */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}><Users size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> Alunos</h2>
          <span style={{ fontSize: 12, color: "#6B7280" }}>{escola.alunos.length} aluno(s)</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <MemberSelector
            label="Adicionar aluno"
            placeholder="Buscar membro para adicionar..."
            filterStatus={["ACTIVE", "PENDENTE"]}
            onSelect={(selected) => {
              const member = selected as { id: string; name: string };
              if (member) addAluno(member.id);
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {escola.alunos.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#F9FAFB", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: NAVY }}>
                  {a.member?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#0D2545" }}>{a.member?.name || "Membro"}</span>
              </div>
              <button type="button" onClick={() => removeAluno(a.member?.id)} disabled={addingAluno}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 4 }}>
                <UserMinus size={16} />
              </button>
            </div>
          ))}
          {escola.alunos.length === 0 && (
            <div style={{ textAlign: "center", padding: 24, color: "#9CA3AF", fontSize: 13 }}>Nenhum aluno vinculado a esta escola.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
