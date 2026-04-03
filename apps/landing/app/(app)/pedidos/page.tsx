"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckCircle, Truck, XCircle } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  preco: number;
}

interface ItemPedido {
  produtoId: string;
  quantidade: number;
}

interface Pedido {
  id: string;
  nomeComprador: string;
  telefone?: string;
  email?: string;
  formaPagamento: "PIX" | "DINHEIRO" | "CARTAO";
  status: "PENDENTE" | "PAGO" | "ENTREGUE" | "CANCELADO";
  total: number;
  createdAt: string;
  _count?: { itens: number };
  itens?: { quantidade: number; produto: { nome: string; preco: number } }[];
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  PENDENTE:  { bg: "#FEF9C3", color: "#CA8A04",  label: "Pendente" },
  PAGO:      { bg: "#DCFCE7", color: "#16A34A",  label: "Pago" },
  ENTREGUE:  { bg: "#DBEAFE", color: "#1D4ED8",  label: "Entregue" },
  CANCELADO: { bg: "#FEE2E2", color: "#DC2626",  label: "Cancelado" },
};

const FORMA_LABEL: Record<string, string> = { PIX: "PIX", DINHEIRO: "Dinheiro", CARTAO: "Cartão" };

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  background: "#FFF", borderRadius: "14px", width: "100%", maxWidth: "540px",
  maxHeight: "92vh", overflowY: "auto", padding: "2rem",
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

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "0.65rem 1rem", color: "#9CA3AF",
  fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem 1rem", fontSize: "0.8375rem", color: "#374151", borderBottom: "1px solid #F3F4F6", verticalAlign: "middle",
};

const btnPrimary: React.CSSProperties = {
  background: "#1A3C6E", color: "#FFF", border: "none",
  padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 700,
  fontSize: "0.875rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem",
  fontFamily: "var(--font-nunito), sans-serif",
};

const emptyForm = { nomeComprador: "", telefone: "", email: "", formaPagamento: "PIX" as "PIX" | "DINHEIRO" | "CARTAO" };

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [selectedProduto, setSelectedProduto] = useState("");
  const [selectedQtd, setSelectedQtd] = useState("1");

  useEffect(() => {
    fetchPedidos();
    fetchProdutos();
  }, []);

  async function fetchPedidos() {
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos");
      const d = await res.json();
      setPedidos(d.pedidos ?? d ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function fetchProdutos() {
    try {
      const res = await fetch("/api/produtos");
      const d = await res.json();
      setProdutos(d.produtos ?? d ?? []);
    } catch { /* ignore */ }
  }

  function openModal() {
    setForm(emptyForm);
    setItens([]);
    setSelectedProduto("");
    setSelectedQtd("1");
    setShowModal(true);
  }

  function addItem() {
    if (!selectedProduto || !selectedQtd || Number(selectedQtd) < 1) return;
    setItens(prev => {
      const existing = prev.find(i => i.produtoId === selectedProduto);
      if (existing) {
        return prev.map(i => i.produtoId === selectedProduto ? { ...i, quantidade: i.quantidade + Number(selectedQtd) } : i);
      }
      return [...prev, { produtoId: selectedProduto, quantidade: Number(selectedQtd) }];
    });
    setSelectedProduto("");
    setSelectedQtd("1");
  }

  function removeItem(produtoId: string) {
    setItens(prev => prev.filter(i => i.produtoId !== produtoId));
  }

  function calcTotal() {
    return itens.reduce((acc, item) => {
      const p = produtos.find(p => p.id === item.produtoId);
      return acc + (p?.preco ?? 0) * item.quantidade;
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (itens.length === 0) { alert("Adicione pelo menos um item."); return; }
    setSaving(true);
    try {
      await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, itens }),
      });
      setShowModal(false);
      fetchPedidos();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: "PAGO" | "ENTREGUE" | "CANCELADO") {
    try {
      if (status === "PAGO") {
        // Use confirmar-pagamento API to create Finance record
        await fetch(`/api/pedidos/${id}/confirmar-pagamento`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formaPagamento: "DINHEIRO" }),
        });
      } else {
        await fetch(`/api/pedidos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
      }
      fetchPedidos();
    } catch { /* ignore */ }
  }

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.2rem" }}>Pedidos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie os pedidos de produtos</p>
        </div>
        <button style={btnPrimary} onClick={openModal}>
          <Plus size={16} strokeWidth={2} /> Novo Pedido
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div style={{ background: "#FFF", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                  {["#", "Comprador", "Itens", "Total", "Status", "Pagamento", "Data", "Ações"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...tdStyle, textAlign: "center", color: "#9CA3AF", padding: "2.5rem" }}>
                      Nenhum pedido registrado.
                    </td>
                  </tr>
                ) : pedidos.map((p, i) => {
                  const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.PENDENTE ?? { label: p.status, bg: "#F3F4F6", color: "#6B7280" };
                  return (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? "#FFF" : "#FAFAFA" }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: "#9CA3AF", width: "40px" }}>{i + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: "#0D2545" }}>{p.nomeComprador}</div>
                        {p.telefone && <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{p.telefone}</div>}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>{p._count?.itens ?? (p.itens?.length ?? 0)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: "#1A3C6E" }}>{fmt(p.total)}</td>
                      <td style={tdStyle}>
                        <span style={{ background: badge.bg, color: badge.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={tdStyle}>{FORMA_LABEL[p.formaPagamento] ?? p.formaPagamento}</td>
                      <td style={tdStyle}>{fmtDate(p.createdAt)}</td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          {p.status === "PENDENTE" && (
                            <button onClick={() => updateStatus(p.id, "PAGO")}
                              title="Marcar como Pago"
                              style={{ background: "#DCFCE7", color: "#16A34A", border: "none", borderRadius: "6px", padding: "0.35rem 0.55rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif" }}>
                              <CheckCircle size={13} strokeWidth={1.5} /> Pago
                            </button>
                          )}
                          {p.status === "PAGO" && (
                            <button onClick={() => updateStatus(p.id, "ENTREGUE")}
                              title="Marcar como Entregue"
                              style={{ background: "#DBEAFE", color: "#1D4ED8", border: "none", borderRadius: "6px", padding: "0.35rem 0.55rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif" }}>
                              <Truck size={13} strokeWidth={1.5} /> Entregar
                            </button>
                          )}
                          {(p.status === "PENDENTE" || p.status === "PAGO") && (
                            <button onClick={() => updateStatus(p.id, "CANCELADO")}
                              title="Cancelar Pedido"
                              style={{ background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: "6px", padding: "0.35rem 0.55rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-nunito), sans-serif" }}>
                              <XCircle size={13} strokeWidth={1.5} /> Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={overlayStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div style={modalStyle} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#0D2545" }}>Novo Pedido</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Comprador */}
                <div>
                  <label style={labelStyle}>Nome do Comprador *</label>
                  <input required style={inputStyle} value={form.nomeComprador} onChange={e => setForm(f => ({ ...f, nomeComprador: e.target.value }))} placeholder="Nome completo" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={labelStyle}>Telefone</label>
                    <input style={inputStyle} value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label style={labelStyle}>E-mail</label>
                    <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Forma de Pagamento *</label>
                  <select required style={inputStyle} value={form.formaPagamento} onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value as "PIX" | "DINHEIRO" | "CARTAO" }))}>
                    <option value="PIX">PIX</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CARTAO">Cartão</option>
                  </select>
                </div>

                {/* Items */}
                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "1rem" }}>
                  <label style={{ ...labelStyle, fontSize: "0.83rem", marginBottom: "0.65rem" }}>Itens do Pedido</label>

                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <select style={{ ...inputStyle, flex: 2 }} value={selectedProduto} onChange={e => setSelectedProduto(e.target.value)}>
                      <option value="">Selecione um produto...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} — {`R$ ${p.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}</option>
                      ))}
                    </select>
                    <input type="number" min={1} style={{ ...inputStyle, flex: "0 0 70px" }} value={selectedQtd} onChange={e => setSelectedQtd(e.target.value)} />
                    <button type="button" onClick={addItem}
                      style={{ background: "#1A3C6E", color: "white", border: "none", borderRadius: "8px", padding: "0 0.85rem", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                      +
                    </button>
                  </div>

                  {itens.length > 0 && (
                    <div style={{ background: "#F9FAFB", borderRadius: "8px", overflow: "hidden", marginBottom: "0.5rem" }}>
                      {itens.map(item => {
                        const p = produtos.find(p => p.id === item.produtoId);
                        return (
                          <div key={item.produtoId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderBottom: "1px solid #F3F4F6" }}>
                            <span style={{ fontSize: "0.8125rem", color: "#374151" }}>{p?.nome ?? "Produto"} × {item.quantidade}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1A3C6E" }}>
                                {fmt((p?.preco ?? 0) * item.quantidade)}
                              </span>
                              <button type="button" onClick={() => removeItem(item.produtoId)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0, lineHeight: 1 }}>
                                <X size={14} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", background: "#F3F4F6" }}>
                        <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "#374151" }}>Total</span>
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "#C8922A" }}>{fmt(calcTotal())}</span>
                      </div>
                    </div>
                  )}

                  {itens.length === 0 && (
                    <p style={{ fontSize: "0.8rem", color: "#9CA3AF", textAlign: "center", padding: "0.75rem 0" }}>Nenhum item adicionado.</p>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.25rem" }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Salvando..." : "Criar Pedido"}
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
