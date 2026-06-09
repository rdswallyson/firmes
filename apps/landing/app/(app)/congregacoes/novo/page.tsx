"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Church } from "lucide-react";
import { MemberSelector } from "../../../components/MemberSelector";

export default function NovaCongregacaoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    pastorId: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/congregacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/congregacoes");
      } else {
        alert("Erro ao cadastrar congregação");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, boxSizing: "border-box" };

  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <Church size={26} /> Nova Congregação
      </h1>

      <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nome da congregação *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Congregação Central" style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Endereço</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Cidade</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Telefone</label>
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Pastor responsável</label>
          <MemberSelector
            placeholder="Buscar membro..."
            value={form.pastorId ? { id: form.pastorId, name: "Pastor selecionado" } : null}
            onSelect={(m) => setForm({ ...form, pastorId: (m as any)?.id ?? "" })}
          />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button type="button" onClick={() => router.push("/congregacoes")} style={{ padding: "10px 20px", background: "#F3F4F6", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} style={{ padding: "10px 24px", background: loading ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E, #1E4A84)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <Save size={16} /> {loading ? "Salvando..." : "Cadastrar"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
