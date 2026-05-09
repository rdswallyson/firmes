"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

export default function NovoCultoPage() {
  const router = useRouter();
  const [form, setForm] = useState({ titulo: "", data: "", hora: "10:00" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const dataHora = `${form.data}T${form.hora}:00`;
      const res = await fetch("/api/cultos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: form.titulo, data: dataHora }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar culto");
      router.push(`/cultos/${data.culto.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 600, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/cultos" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 14, textDecoration: "none", marginBottom: 16 }}>
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Novo Culto</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Um QR Code único será gerado automaticamente</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Título do Culto *</label>
            <input
              value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              placeholder="ex: Culto Domingo de Manhã"
              required
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Data *</label>
              <input
                type="date"
                value={form.data}
                onChange={e => setForm({ ...form, data: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "#374151", marginBottom: 6, fontSize: 14 }}>Hora *</label>
              <input
                type="time"
                value={form.hora}
                onChange={e => setForm({ ...form, hora: e.target.value })}
                required
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", background: NAVY, color: "#fff", borderRadius: 8, border: "none", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <QrCode size={18} /> {loading ? "Criando..." : "Criar Culto e Gerar QR Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
