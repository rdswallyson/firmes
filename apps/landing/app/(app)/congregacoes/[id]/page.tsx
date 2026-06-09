"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Church, MapPin, Phone, User, Users, DollarSign, Calendar, Save, ArrowLeft, Pencil } from "lucide-react";
import { MemberSelector } from "../../../components/MemberSelector";

interface Detail {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  pastor: { id: string; name: string } | null;
  members: { id: string; name: string; role: string | null; phone: string | null }[];
  cultos: { id: string; titulo: string; data: string; tipo: string }[];
  resumoFinanceiro: { receitas: number; despesas: number; saldo: number };
  _count: { members: number; finances: number; cultos: number };
}

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CongregacaoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "", pastorId: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/congregacoes?id=${id}`);
      if (!res.ok) { setData(null); return; }
      const d = await res.json() as { congregation: Detail };
      setData(d.congregation);
      setForm({
        name: d.congregation.name,
        address: d.congregation.address ?? "",
        city: d.congregation.city ?? "",
        phone: d.congregation.phone ?? "",
        pastorId: d.congregation.pastor?.id ?? "",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/congregacoes?id=${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setEditing(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, boxSizing: "border-box" };
  const cardStyle: React.CSSProperties = { background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };

  if (loading) return <div className="page-pad" style={{ color: "#9CA3AF" }}>Carregando...</div>;
  if (!data) return <div className="page-pad" style={{ color: "#9CA3AF" }}>Congregação não encontrada.</div>;

  return (
    <div className="page-pad" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <button onClick={() => router.push("/congregacoes")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#6B7280", fontSize: 14, cursor: "pointer", marginBottom: 16 }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      {editing ? (
        <form onSubmit={handleSave} style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0D2545", marginBottom: 16 }}>Editar congregação</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nome *</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div><label style={labelStyle}>Endereço</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>Cidade</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label style={labelStyle}>Telefone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Pastor responsável</label>
            <MemberSelector placeholder="Buscar membro..." value={form.pastorId ? { id: form.pastorId, name: data.pastor?.name ?? "Pastor" } : null} onSelect={(m) => setForm({ ...form, pastorId: (m as any)?.id ?? "" })} />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setEditing(false)} style={{ padding: "10px 20px", background: "#F3F4F6", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
            <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }} style={{ padding: "10px 24px", background: saving ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E, #1E4A84)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
            </motion.button>
          </div>
        </form>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Church size={26} /> {data.name}
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(data.address || data.city) && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6B7280" }}><MapPin size={15} /> {[data.address, data.city].filter(Boolean).join(", ")}</div>}
                {data.phone && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6B7280" }}><Phone size={15} /> {data.phone}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6B7280" }}><User size={15} /> Pastor: {data.pastor?.name ?? "—"}</div>
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", background: "#EFF6FF", color: "#1A3C6E", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Pencil size={14} /> Editar
            </button>
          </div>
        </div>
      )}

      {/* Resumo financeiro */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} /> Receitas</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#16A34A" }}>{brl(data.resumoFinanceiro.receitas)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} /> Despesas</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#DC2626" }}>{brl(data.resumoFinanceiro.despesas)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} /> Saldo</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0D2545" }}>{brl(data.resumoFinanceiro.saldo)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Membros */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D2545", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Users size={18} /> Membros ({data._count.members})</h3>
          {data.members.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Nenhum membro vinculado.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
              {data.members.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{m.name}</div>
                  {m.role && <div style={{ fontSize: 12, color: "#9CA3AF" }}>{m.role}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cultos */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D2545", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Calendar size={18} /> Cultos ({data._count.cultos})</h3>
          {data.cultos.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Nenhum culto registrado.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
              {data.cultos.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{c.titulo}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{new Date(c.data).toLocaleDateString("pt-BR")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
