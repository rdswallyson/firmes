"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Building2, Users, Crown, Palette, Settings, Trash2,
  CheckCircle, XCircle, Clock, Save,
} from "lucide-react";
import Link from "next/link";
import { EmeraldIcon } from "../../../../components/EmeraldIcon";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const ESMERALDA = "#DC2626";

const PLANOS = [
  { id: "FREE", nome: "Gratuito", valor: 0, color: "#F3F4F6", textColor: "#374151" },
  { id: "PRATA", nome: "Prata", valor: 49, color: "#9CA3AF", textColor: "#fff" },
  { id: "OURO", nome: "Ouro", valor: 99, color: GOLD, textColor: "#fff" },
  { id: "DIAMANTE", nome: "Diamante", valor: 199, color: "#3B82F6", textColor: "#fff" },
  { id: "ESMERALDA_STARTER", nome: "Esmeralda Starter", valor: 149, color: ESMERALDA, textColor: "#fff", isEmerald: true },
  { id: "ESMERALDA_PRO", nome: "Esmeralda Pro", valor: 249, color: ESMERALDA, textColor: "#fff", isEmerald: true },
  { id: "ESMERALDA_PLUS", nome: "Esmeralda Plus", valor: 399, color: ESMERALDA, textColor: "#fff", isEmerald: true },
  { id: "ESMERALDA_ULTRA", nome: "Esmeralda Ultra", valor: 599, color: ESMERALDA, textColor: "#fff", isEmerald: true },
];

export default function IgrejaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const churchId = typeof params.id === "string" ? params.id : "";
  const [church, setChurch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", plan: "FREE", isActive: true });

  useEffect(() => {
    fetch(`/api/tenants/${churchId}`).then(r => r.json()).then(data => {
      setChurch(data);
      setForm({ name: data.name, slug: data.slug, plan: data.plan, isActive: data.isActive });
    }).finally(() => setLoading(false));
  }, [churchId]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/tenants/${churchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      alert("Alteracoes salvas!");
    } catch { alert("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta igreja?")) return;
    try {
      await fetch(`/api/tenants/${churchId}`, { method: "DELETE" });
      router.push("/white-label/igrejas");
    } catch { alert("Erro ao excluir"); }
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!church) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Igreja nao encontrada</div>;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 800, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/white-label/igrejas" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0D2545", margin: 0, flex: 1 }}>{church.name}</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { icon: <Users size={16} />, label: "Membros", value: church._count?.members || 0 },
          { icon: <Users size={16} />, label: "Usuarios", value: church._count?.users || 0 },
          { icon: <Building2 size={16} />, label: "Eventos", value: church._count?.events || 0 },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: NAVY }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 10, color: "#6B7280" }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0D2545" }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: NAVY }}>Configuracoes</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Nome</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Slug</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Plano</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PLANOS.map(p => (
                <button key={p.id} onClick={() => setForm(f => ({ ...f, plan: p.id }))}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: form.plan === p.id ? p.color : "#F3F4F6", color: form.plan === p.id ? p.textColor : "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  {p.isEmerald && <EmeraldIcon size={12} />} {p.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: "#16A34A" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Igreja ativa</span>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button onClick={handleDelete} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Trash2 size={14} /> Excluir
          </button>
          <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
