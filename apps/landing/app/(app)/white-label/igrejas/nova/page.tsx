"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Save } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

export default function NovaIgrejaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      setError("Preencha todos os campos");
      return;
    }
    
    // Validate slug
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setError("Slug deve conter apenas letras minusculas, numeros e hifens");
      return;
    }

    setSaving(true);
    setError("");
    
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (res.ok) {
        router.push("/white-label/igrejas");
      } else {
        setError(data.error || "Erro ao criar igreja");
      }
    } catch {
      setError("Erro de conexao");
    }
    finally { setSaving(false); }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 600, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/white-label/igrejas" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0D2545", margin: 0 }}>Nova Igreja</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nome da igreja *</label>
            <input value={form.name} onChange={e => {
              const name = e.target.value;
              setForm(f => ({ ...f, name, slug: generateSlug(name) }));
            }}
              placeholder="Ex: Igreja Batista Central"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Slug (identificador unico) *</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
              placeholder="Ex: igreja-batista-central"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }} />
            <div style={{ marginTop: 4, fontSize: 11, color: "#6B7280" }}>URL da loja: firmes.vercel.app/loja/{form.slug || "..."}</div>
          </div>

          {error && (
            <div style={{ padding: "10px 12px", background: "#FEE2E2", color: "#DC2626", borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Link href="/white-label/igrejas" style={{ padding: "10px 18px", background: "#F3F4F6", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", textDecoration: "none" }}>
              Cancelar
            </Link>
            <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              <Save size={14} /> {saving ? "Criando..." : "Criar igreja"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
