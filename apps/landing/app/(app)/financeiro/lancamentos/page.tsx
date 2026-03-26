"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, Search, Download, Pencil, Trash2, X, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface Finance { id: string; type: string; category: string; amount: number; description: string | null; date: string; memberName: string | null; reciboNum: string | null; contaId: string | null; conta?: { nome: string } | null; metaId: string | null; meta?: { titulo: string } | null; }
interface Conta { id: string; nome: string; }
interface Meta { id: string; titulo: string; }

const CATEGORIES_RECEITA = ["DIZIMO", "OFERTA", "DOACAO", "CAMPANHA", "OUTRO"];
const CATEGORIES_DESPESA = ["ALUGUEL", "LUZ", "AGUA", "INTERNET", "SALARIO", "MANUTENCAO", "MATERIAL", "EVENTO", "OUTRO"];

export default function LancamentosPage() {
  const router = useRouter();
  const [finances, setFinances] = useState<Finance[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "RECEITA", category: "DIZIMO", amount: "", description: "", date: new Date().toISOString().split("T")[0], memberName: "", contaId: "", metaId: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (typeFilter) params.set("type", typeFilter);
    const res = await fetch(`/api/financeiro?${params}`);
    const d = await res.json() as { finances: Finance[]; total: number; totalPages: number };
    setFinances(d.finances ?? []);
    setTotal(d.total ?? 0);
    setTotalPages(d.totalPages ?? 1);
    setLoading(false);
  }, [page, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    fetch("/api/financeiro/contas").then(r => r.json()).then((d: { contas: Conta[] }) => setContas(d.contas ?? []));
    fetch("/api/financeiro/metas").then(r => r.json()).then((d: { metas: Meta[] }) => setMetas(d.metas ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/financeiro/${editId}` : "/api/financeiro";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
    setSaving(false);
    setShowModal(false);
    setEditId(null);
    setForm({ type: "RECEITA", category: "DIZIMO", amount: "", description: "", date: new Date().toISOString().split("T")[0], memberName: "", contaId: "", metaId: "" });
    fetchData();
  }

  function openEdit(f: Finance) {
    setEditId(f.id);
    setForm({ type: f.type, category: f.category, amount: String(f.amount), description: f.description ?? "", date: f.date.split("T")[0], memberName: f.memberName ?? "", contaId: f.contaId ?? "", metaId: f.metaId ?? "" });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/financeiro/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchData();
  }

  async function handleExport() {
    const res = await fetch("/api/financeiro/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `financeiro.csv`; a.click();
  }

  const categories = form.type === "RECEITA" ? CATEGORIES_RECEITA : CATEGORIES_DESPESA;
  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.6rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 500, color: "#374151" };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Lançamentos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Registre receitas e despesas</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", color: "#374151" }}>
            <Download size={16} strokeWidth={1.5} /> CSV
          </button>
          <button onClick={() => { setEditId(null); setForm({ type: "RECEITA", category: "DIZIMO", amount: "", description: "", date: new Date().toISOString().split("T")[0], memberName: "", contaId: "", metaId: "" }); setShowModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 1rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 600 }}>
            <Plus size={16} strokeWidth={1.5} /> Novo Lançamento
          </button>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} style={{ padding: "0.5rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "0.8375rem", background: "white" }}>
            <option value="">Todos</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
              {["Data", "Tipo", "Categoria", "Descrição", "Membro", "Conta", "Valor", "Ações"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.6rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
            ) : finances.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum lançamento</td></tr>
            ) : finances.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid #F9FAFB" }}
                onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                <td style={{ padding: "0.5rem 1rem", color: "#6B7280" }}>{new Date(f.date).toLocaleDateString("pt-BR")}</td>
                <td style={{ padding: "0.5rem 1rem" }}>
                  <span style={{ background: f.type === "RECEITA" ? "#DCFCE7" : "#FEE2E2", color: f.type === "RECEITA" ? "#16A34A" : "#DC2626", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>
                    {f.type === "RECEITA" ? "Receita" : "Despesa"}
                  </span>
                </td>
                <td style={{ padding: "0.5rem 1rem", color: "#374151" }}>{f.category}</td>
                <td style={{ padding: "0.5rem 1rem", color: "#6B7280", maxWidth: "180px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.description ?? "—"}</td>
                <td style={{ padding: "0.5rem 1rem", color: "#6B7280" }}>{f.memberName ?? "—"}</td>
                <td style={{ padding: "0.5rem 1rem", color: "#6B7280" }}>{f.conta?.nome ?? "—"}</td>
                <td style={{ padding: "0.5rem 1rem", fontWeight: 600, color: f.type === "RECEITA" ? "#16A34A" : "#DC2626" }}>
                  {f.type === "RECEITA" ? "+" : "-"} R$ {f.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button onClick={() => openEdit(f)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#6B7280" }}><Pencil size={14} strokeWidth={1.5} /></button>
                    <button onClick={() => setDeleteConfirm(f.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#DC2626" }}><Trash2 size={14} strokeWidth={1.5} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Pág. {page} de {totalPages} ({total} itens)</span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "0.4rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: page <= 1 ? "default" : "pointer" }}><ChevronLeft size={16} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "0.4rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: page >= totalPages ? "default" : "pointer" }}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* New/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: "white", borderRadius: "12px", padding: "1.75rem", maxWidth: "520px", width: "100%", margin: "1rem", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0D2545" }}>{editId ? "Editar Lançamento" : "Novo Lançamento"}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={labelStyle}>Tipo *</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, category: e.target.value === "RECEITA" ? "DIZIMO" : "ALUGUEL" })} style={inputStyle}>
                      <option value="RECEITA">Receita</option>
                      <option value="DESPESA">Despesa</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Categoria *</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Valor (R$) *</label>
                    <input type="number" step="0.01" min="0" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} placeholder="0,00" />
                  </div>
                  <div>
                    <label style={labelStyle}>Data</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Descrição</label>
                    <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} placeholder="Detalhes do lançamento" />
                  </div>
                  <div>
                    <label style={labelStyle}>Membro (dizimista)</label>
                    <input value={form.memberName} onChange={e => setForm({ ...form, memberName: e.target.value })} style={inputStyle} placeholder="Nome do membro" />
                  </div>
                  <div>
                    <label style={labelStyle}>Conta bancária</label>
                    <select value={form.contaId} onChange={e => setForm({ ...form, contaId: e.target.value })} style={inputStyle}>
                      <option value="">Nenhuma</option>
                      {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  {form.type === "RECEITA" && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>Vincular a meta</label>
                      <select value={form.metaId} onChange={e => setForm({ ...form, metaId: e.target.value })} style={inputStyle}>
                        <option value="">Nenhuma</option>
                        {metas.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: "0.6rem 1.25rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>Cancelar</button>
                  <button type="submit" disabled={saving} style={{ padding: "0.6rem 1.25rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
                    {saving ? "Salvando..." : editId ? "Salvar" : "Registrar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", maxWidth: "380px", width: "100%" }}>
            <h3 style={{ margin: "0 0 0.5rem", color: "#0D2545" }}>Excluir lançamento?</h3>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>Esta ação reverterá o saldo da conta vinculada.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "0.6rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: "0.6rem", background: "#DC2626", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
