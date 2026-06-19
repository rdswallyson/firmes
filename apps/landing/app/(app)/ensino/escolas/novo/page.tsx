"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { MemberSelector } from "../../../../components/MemberSelector";

const NAVY = "#1A3C6E";
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "var(--font-nunito), sans-serif", boxSizing: "border-box" as const };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function NovaEscolaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", coordenadorId: "", coordenadorNome: "", status: "ATIVA" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome) { alert("Nome obrigatorio"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/escolas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao,
          coordenadorId: form.coordenadorId || undefined,
          status: form.status,
        }),
      });
      if (res.ok) {
        router.push("/ensino/escolas");
      } else {
        const d = await res.json();
        alert(d.error || "Erro ao criar escola");
      }
    } catch { alert("Erro de conexao"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 700, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/ensino/escolas" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0D2545", margin: 0 }}>Nova Escola</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Nome da Escola *</label>
              <input required style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Escola de Lideres" />
            </div>
            <div>
              <label style={labelStyle}>Descricao</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descricao da escola..." />
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
                <div style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
                  Coordenador: <strong>{form.coordenadorNome}</strong>
                </div>
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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Link href="/ensino/escolas" style={{ padding: "12px 24px", background: "#F3F4F6", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none" }}>Cancelar</Link>
          <button type="submit" disabled={saving} style={{ padding: "12px 24px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            <Save size={16} style={{ marginRight: 6, verticalAlign: "middle" }} /> {saving ? "Salvando..." : "Salvar Escola"}
          </button>
        </div>
      </form>
    </div>
  );
}
