"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Ban } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: "ROUPA" | "LIVRO" | "COMIDA" | "EVENTO" | "OUTROS";
  estoque: number;
  ativo: boolean;
}

const CATEGORIAS: Produto["categoria"][] = ["ROUPA", "LIVRO", "COMIDA", "EVENTO", "OUTROS"];

const CAT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  ROUPA:  { bg: "#EDE9FE", color: "#7C3AED", label: "Roupa" },
  LIVRO:  { bg: "#DBEAFE", color: "#1D4ED8", label: "Livro" },
  COMIDA: { bg: "#FEF3C7", color: "#C8922A", label: "Comida" },
  EVENTO: { bg: "#DCFCE7", color: "#16A34A", label: "Evento" },
  OUTROS: { bg: "#F3F4F6", color: "#6B7280", label: "Outros" },
};

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const cardVariants = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  background: "#FFF", borderRadius: "14px", width: "100%", maxWidth: "480px",
  maxHeight: "90vh", overflowY: "auto", padding: "2rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "var(--font-nunito), sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px",
  border: "1.5px solid #E5E7EB", fontSize: "0.875rem", outline: "none",
  fontFamily: "var(--font-nunito), sans-serif", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem",
};

const btnPrimary: React.CSSProperties = {
  background: "#1A3C6E", color: "#FFF", border: "none",
  padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 700,
  fontSize: "0.875rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem",
  fontFamily: "var(--font-nunito), sans-serif",
};

const emptyForm = { nome: "", descricao: "", preco: "", categoria: "" as Produto["categoria"] | "", estoque: "" };

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchProdutos(); }, []);

  async function fetchProdutos() {
    setLoading(true);
    try {
      const res = await fetch("/api/produtos");
      const d = await res.json();
      setProdutos(d.produtos ?? d ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(p: Produto) {
    setEditId(p.id);
    setForm({
      nome: p.nome, descricao: p.descricao ?? "",
      preco: String(p.preco), categoria: p.categoria, estoque: String(p.estoque),
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, preco: Number(form.preco), estoque: Number(form.estoque) };
      if (editId) {
        await fetch(`/api/produtos/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await fetch("/api/produtos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      setShowModal(false);
      fetchProdutos();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function handleDesativar(id: string) {
    if (!confirm("Desativar este produto?")) return;
    try {
      await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      fetchProdutos();
    } catch { /* ignore */ }
  }

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.2rem" }}>Produtos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Catálogo de produtos disponíveis</p>
        </div>
        <button style={btnPrimary} onClick={openNew}>
          <Plus size={16} strokeWidth={2} /> Novo Produto
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : produtos.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum produto cadastrado.</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.15rem" }}>
          {produtos.map(p => {
            const cat = CAT_BADGE[p.categoria] ?? CAT_BADGE.OUTROS ?? { label: p.categoria, bg: "#F3F4F6", color: "#6B7280" };
            return (
              <motion.div key={p.id} variants={cardVariants}
                style={{ background: "#FFF", borderRadius: "12px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#0D2545" }}>{p.nome}</h3>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <span style={{ background: cat.bg, color: cat.color, padding: "0.18rem 0.55rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>{cat.label}</span>
                    <span style={{ background: p.ativo ? "#DCFCE7" : "#F3F4F6", color: p.ativo ? "#16A34A" : "#6B7280", padding: "0.18rem 0.55rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>

                {p.descricao && (
                  <p style={{ margin: 0, fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5 }}>{p.descricao}</p>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#C8922A" }}>{fmt(p.preco)}</span>
                  <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>{p.estoque} em estoque</span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => openEdit(p)}
                    style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", padding: "0.45rem 0", borderRadius: "7px", background: "#EFF6FF", color: "#1A3C6E", border: "none", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-nunito), sans-serif" }}>
                    <Pencil size={13} strokeWidth={1.5} /> Editar
                  </button>
                  <button onClick={() => handleDesativar(p.id)}
                    style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", padding: "0.45rem 0", borderRadius: "7px", background: "#FEF2F2", color: "#DC2626", border: "none", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-nunito), sans-serif" }}>
                    <Ban size={13} strokeWidth={1.5} /> Desativar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={overlayStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div style={modalStyle} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0D2545" }}>
                  {editId ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Nome *</label>
                  <input required style={inputStyle} value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto" />
                </div>
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea style={{ ...inputStyle, minHeight: "75px", resize: "vertical" }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição do produto" />
                </div>
                <div>
                  <label style={labelStyle}>Preço (R$) *</label>
                  <input required type="number" min={0} step="0.01" style={inputStyle} value={form.preco} onChange={e => setForm(f => ({ ...f, preco: e.target.value }))} placeholder="0,00" />
                </div>
                <div>
                  <label style={labelStyle}>Categoria *</label>
                  <select required style={inputStyle} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as Produto["categoria"] }))}>
                    <option value="">Selecione...</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{CAT_BADGE[c]?.label ?? c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estoque *</label>
                  <input required type="number" min={0} style={inputStyle} value={form.estoque} onChange={e => setForm(f => ({ ...f, estoque: e.target.value }))} placeholder="Quantidade em estoque" />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Salvando..." : editId ? "Salvar" : "Criar Produto"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
