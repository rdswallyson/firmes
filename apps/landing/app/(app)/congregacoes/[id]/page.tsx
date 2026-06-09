"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Church, MapPin, Phone, User, Users, DollarSign, Calendar, Save, ArrowLeft, Pencil, UserPlus, TrendingUp, X, CalendarCheck } from "lucide-react";
import { MemberSelector } from "../../../components/MemberSelector";

interface Detail {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  pastor: { id: string; name: string; photo: string | null; role: string | null } | null;
  members: { id: string; name: string; role: string | null; phone: string | null; createdAt: string }[];
  cultos: { id: string; titulo: string; data: string; tipo: string; _count?: { checkins: number } }[];
  resumoFinanceiro: { receitas: number; despesas: number; saldo: number };
  resumoMes: { receitas: number; despesas: number; saldo: number };
  proximoCulto: { id: string; titulo: string; data: string; tipo: string } | null;
  freqMedia: number;
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

  // Modal Definir Pastor
  const [showPastor, setShowPastor] = useState(false);
  const [pastorMode, setPastorMode] = useState<"existing" | "new">("existing");
  const [pastorForm, setPastorForm] = useState({ memberId: "", memberName: "", name: "", email: "", password: "", confirm: "" });
  const [pastorSaving, setPastorSaving] = useState(false);
  const [pastorError, setPastorError] = useState("");

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

  async function handleSavePastor(e: React.FormEvent) {
    e.preventDefault();
    setPastorError("");
    if (pastorMode === "existing" && !pastorForm.memberId) {
      setPastorError("Selecione um membro.");
      return;
    }
    if (pastorMode === "new" && !pastorForm.name.trim()) {
      setPastorError("Informe o nome completo.");
      return;
    }
    if (!pastorForm.email.trim() || !pastorForm.password) {
      setPastorError("Email e senha são obrigatórios.");
      return;
    }
    if (pastorForm.password !== pastorForm.confirm) {
      setPastorError("As senhas não conferem.");
      return;
    }
    setPastorSaving(true);
    try {
      const res = await fetch(`/api/congregacoes/${id}/pastor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: pastorMode === "existing" ? pastorForm.memberId : undefined,
          name: pastorMode === "new" ? pastorForm.name.trim() : undefined,
          email: pastorForm.email.trim(),
          password: pastorForm.password,
        }),
      });
      const d = await res.json() as { error?: string };
      if (!res.ok) { setPastorError(d.error ?? "Erro ao definir pastor."); return; }
      setShowPastor(false);
      setPastorForm({ memberId: "", memberName: "", name: "", email: "", password: "", confirm: "" });
      fetchData();
    } finally {
      setPastorSaving(false);
    }
  }

  const labelStyle: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, boxSizing: "border-box" };
  const cardStyle: React.CSSProperties = { background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };

  if (loading) return <div className="page-pad" style={{ color: "#9CA3AF" }}>Carregando...</div>;
  if (!data) return <div className="page-pad" style={{ color: "#9CA3AF" }}>Congregação não encontrada.</div>;

  const ultimosMembros = data.members.slice(0, 5);
  const ultimosCultos = data.cultos
    .filter((c) => new Date(c.data) < new Date())
    .slice(0, 3);

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
            <MemberSelector placeholder="Buscar membro..." value={form.pastorId ? { id: form.pastorId, name: data.pastor?.name ?? "Pastor" } as any : null} onSelect={(m) => setForm({ ...form, pastorId: (m as any)?.id ?? "" })} />
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Church size={26} /> {data.name}
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(data.address || data.city) && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6B7280" }}><MapPin size={15} /> {[data.address, data.city].filter(Boolean).join(", ")}</div>}
                {data.phone && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6B7280" }}><Phone size={15} /> {data.phone}</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", background: "#EFF6FF", color: "#1A3C6E", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Pencil size={14} /> Editar
              </button>
              <button onClick={() => setShowPastor(true)} style={{ padding: "8px 16px", background: "linear-gradient(135deg, #1A3C6E, #1E4A84)", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <UserPlus size={14} /> Definir Pastor
              </button>
            </div>
          </div>

          {/* Pastor responsável */}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 14 }}>
            {data.pastor?.photo ? (
              <img src={data.pastor.photo} alt={data.pastor.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A3C6E" }}><User size={24} /></div>
            )}
            <div>
              <div style={{ fontSize: 12, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pastor responsável</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0D2545" }}>{data.pastor?.name ?? "Não definido"}</div>
              {data.pastor?.role && <div style={{ fontSize: 13, color: "#6B7280" }}>{data.pastor.role}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Cards de resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }} className="grid-4">
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><Users size={14} /> Membros</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0D2545" }}>{data._count.members}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><DollarSign size={14} /> Arrecadado no mês</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A" }}>{brl(data.resumoMes.receitas)}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><CalendarCheck size={14} /> Próximo culto</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0D2545" }}>
            {data.proximoCulto ? new Date(data.proximoCulto.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—"}
          </div>
          {data.proximoCulto && <div style={{ fontSize: 12, color: "#9CA3AF" }}>{data.proximoCulto.titulo}</div>}
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={14} /> Frequência média</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0D2545" }}>{data.freqMedia}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>presenças/culto</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Membros da congregação */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D2545", display: "flex", alignItems: "center", gap: 8 }}><Users size={18} /> Membros</h3>
            <button onClick={() => router.push(`/pessoas?congregationId=${id}`)} style={{ background: "none", border: "none", color: "#1A3C6E", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ver todos</button>
          </div>
          {ultimosMembros.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Nenhum membro vinculado.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ultimosMembros.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{m.name}</div>
                  {m.role && <div style={{ fontSize: 12, color: "#9CA3AF" }}>{m.role}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos cultos */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D2545", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Calendar size={18} /> Últimos cultos</h3>
          {ultimosCultos.length === 0 ? (
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Nenhum culto realizado.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ultimosCultos.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{c.titulo}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{c.tipo} · {c._count?.checkins ?? 0} presenças</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{new Date(c.data).toLocaleDateString("pt-BR")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financeiro do mês */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D2545", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><DollarSign size={18} /> Financeiro do mês</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div style={{ background: "#F0FDF4", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 13, color: "#16A34A", marginBottom: 4 }}>Receitas</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#16A34A" }}>{brl(data.resumoMes.receitas)}</div>
          </div>
          <div style={{ background: "#FEF2F2", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 13, color: "#DC2626", marginBottom: 4 }}>Despesas</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#DC2626" }}>{brl(data.resumoMes.despesas)}</div>
          </div>
          <div style={{ background: "#EFF6FF", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 13, color: "#1A3C6E", marginBottom: 4 }}>Saldo</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0D2545" }}>{brl(data.resumoMes.saldo)}</div>
          </div>
        </div>
      </div>

      {/* Modal Definir Pastor */}
      <AnimatePresence>
        {showPastor && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowPastor(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ background: "white", borderRadius: 16, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0D2545" }}>Definir Pastor Responsável</h2>
                <button onClick={() => setShowPastor(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button type="button" onClick={() => setPastorMode("existing")} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid", borderColor: pastorMode === "existing" ? "#1A3C6E" : "#E5E7EB", background: pastorMode === "existing" ? "#EFF6FF" : "white", color: pastorMode === "existing" ? "#1A3C6E" : "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Membro existente</button>
                <button type="button" onClick={() => setPastorMode("new")} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid", borderColor: pastorMode === "new" ? "#1A3C6E" : "#E5E7EB", background: pastorMode === "new" ? "#EFF6FF" : "white", color: pastorMode === "new" ? "#1A3C6E" : "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Novo usuário</button>
              </div>

              <form onSubmit={handleSavePastor}>
                {pastorMode === "existing" ? (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Selecionar membro *</label>
                    <MemberSelector placeholder="Buscar membro..." onSelect={(m) => setPastorForm({ ...pastorForm, memberId: (m as any)?.id ?? "", memberName: (m as any)?.name ?? "" })} />
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Nome completo *</label>
                    <input type="text" value={pastorForm.name} onChange={(e) => setPastorForm({ ...pastorForm, name: e.target.value })} style={inputStyle} />
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Email de acesso *</label>
                  <input type="email" value={pastorForm.email} onChange={(e) => setPastorForm({ ...pastorForm, email: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div><label style={labelStyle}>Senha *</label><input type="password" value={pastorForm.password} onChange={(e) => setPastorForm({ ...pastorForm, password: e.target.value })} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Confirmar *</label><input type="password" value={pastorForm.confirm} onChange={(e) => setPastorForm({ ...pastorForm, confirm: e.target.value })} style={inputStyle} /></div>
                </div>

                {pastorError && <div style={{ color: "#DC2626", fontSize: 13, marginBottom: 16 }}>{pastorError}</div>}

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowPastor(false)} style={{ padding: "10px 20px", background: "#F3F4F6", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
                  <motion.button type="submit" disabled={pastorSaving} whileTap={{ scale: 0.97 }} style={{ padding: "10px 24px", background: pastorSaving ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E, #1E4A84)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: pastorSaving ? "not-allowed" : "pointer" }}>
                    {pastorSaving ? "Salvando..." : "Definir Pastor"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
