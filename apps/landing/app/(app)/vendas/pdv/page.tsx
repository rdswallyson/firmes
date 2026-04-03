"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, CreditCard,
  QrCode, CheckCircle, X, ArrowLeft, Package,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";

interface Produto {
  id: string; nome: string; descricao?: string; foto?: string; preco: number;
  categoria: string; estoque: number; variacoes: { id: string; tipo: string; opcao: string; estoque: number }[];
}

interface CartItem {
  produtoId: string; variacaoId?: string; nome: string; variacao?: string;
  quantidade: number; preco: number;
}

export default function PDVPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<"DINHEIRO" | "PIX">("DINHEIRO");
  const [showCheckout, setShowCheckout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ id: string; total: number } | null>(null);

  useEffect(() => {
    fetch("/api/produtos").then(r => r.json()).then((d) => {
      setProdutos(Array.isArray(d) ? d.filter((p: any) => p.ativo) : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = produtos.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));

  function addToCart(produto: Produto, variacaoId?: string, variacao?: string) {
    const existing = cart.find(c => c.produtoId === produto.id && c.variacaoId === variacaoId);
    if (existing) {
      setCart(cart.map(c => c === existing ? { ...c, quantidade: c.quantidade + 1 } : c));
    } else {
      setCart([...cart, { produtoId: produto.id, variacaoId, nome: produto.nome, variacao, quantidade: 1, preco: produto.preco }]);
    }
  }

  function updateQty(idx: number, delta: number) {
    setCart(cart.map((c, i) => i === idx ? { ...c, quantidade: Math.max(0, c.quantidade + delta) } : c).filter(c => c.quantidade > 0));
  }

  function removeItem(idx: number) {
    setCart(cart.filter((_, i) => i !== idx));
  }

  const total = cart.reduce((acc, c) => acc + c.preco * c.quantidade, 0);

  async function finalizarVenda() {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: cart.map(c => ({ produtoId: c.produtoId, variacaoId: c.variacaoId, quantidade: c.quantidade, preco: c.preco })),
          formaPagamento,
          total,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setCart([]);
      } else {
        alert(data.error || "Erro ao finalizar");
      }
    } catch { alert("Erro de conexao"); }
    finally { setSaving(false); }
  }

  if (result) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "#fff", borderRadius: 20, padding: 40, maxWidth: 400, width: "100%", textAlign: "center" }}>
          <CheckCircle size={64} color="#16A34A" style={{ marginBottom: 16 }} />
          <h2 style={{ color: NAVY, fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Venda Finalizada!</h2>
          <p style={{ color: "#777", fontSize: 14, marginBottom: 24 }}>Pedido #{result.id.slice(-6).toUpperCase()}</p>
          <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: NAVY }}>R$ {total.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{formaPagamento === "PIX" ? "Pagamento via PIX" : "Pagamento em Dinheiro"}</div>
          </div>
          <button onClick={() => setResult(null)} style={{ width: "100%", padding: 14, background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Nova Venda</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/vendas" style={{ color: NAVY }}><ArrowLeft size={20} /></Link>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: NAVY, flex: 1 }}>PDV — Ponto de Venda</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#F9FAFB", borderRadius: 8 }}>
          <ShoppingCart size={18} color={NAVY} />
          <span style={{ fontWeight: 700, color: NAVY }}>{cart.reduce((a,c)=>a+c.quantidade,0)} itens</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Products */}
        <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <Search size={18} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." style={{ width: "100%", padding: "12px 14px 12px 44px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 15, outline: "none" }} />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#999" }}>Carregando...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
              {filtered.map(p => (
                <div key={p.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ height: 100, background: p.foto ? `url(${p.foto}) center/cover` : `linear-gradient(135deg, ${NAVY}, #2A5BA0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {!p.foto && <Package size={32} color="rgba(255,255,255,0.4)" />}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: GOLD, marginBottom: 8 }}>R$ {p.preco.toFixed(2)}</div>
                    
                    {p.variacoes.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.variacoes.map(v => (
                          <button key={v.id} onClick={() => addToCart(p, v.id, `${v.tipo}: ${v.opcao}`)} style={{ padding: "4px 8px", fontSize: 11, background: "#F3F4F6", border: "none", borderRadius: 4, cursor: "pointer" }}>
                            {v.opcao}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} style={{ width: "100%", padding: "8px", background: NAVY, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Adicionar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div style={{ width: 360, background: "#fff", borderLeft: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 20, borderBottom: "1px solid #F3F4F6" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>Carrinho</h3>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Carrinho vazio</div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "#F9FAFB", borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{item.nome}</div>
                    {item.variacao && <div style={{ fontSize: 11, color: "#888" }}>{item.variacao}</div>}
                    <div style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>R$ {item.preco.toFixed(2)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => updateQty(idx, -1)} style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                    <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{item.quantidade}</span>
                    <button onClick={() => updateQty(idx, 1)} style={{ width: 24, height: 24, borderRadius: 4, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}><Trash2 size={16} /></button>
                </div>
              ))
            )}
          </div>

          <div style={{ padding: 20, borderTop: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#777" }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>R$ {total.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setFormaPagamento("DINHEIRO")} style={{ flex: 1, padding: 12, border: `2px solid ${formaPagamento === "DINHEIRO" ? NAVY : "#E5E7EB"}`, background: formaPagamento === "DINHEIRO" ? "#EEF2FA" : "#fff", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: formaPagamento === "DINHEIRO" ? 700 : 400 }}>
                <DollarSign size={16} /> Dinheiro
              </button>
              <button onClick={() => setFormaPagamento("PIX")} style={{ flex: 1, padding: 12, border: `2px solid ${formaPagamento === "PIX" ? NAVY : "#E5E7EB"}`, background: formaPagamento === "PIX" ? "#EEF2FA" : "#fff", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: formaPagamento === "PIX" ? 700 : 400 }}>
                <QrCode size={16} /> PIX
              </button>
            </div>

            <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0} style={{ width: "100%", padding: 14, background: cart.length > 0 ? "#16A34A" : "#ccc", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: cart.length > 0 ? "pointer" : "not-allowed" }}>
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowCheckout(false)}>
            <motion.div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%" }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY }}>Confirmar Venda</h3>
                <button onClick={() => setShowCheckout(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
              </div>

              <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#777" }}>Itens</span>
                  <span>{cart.reduce((a,c)=>a+c.quantidade,0)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#777" }}>Pagamento</span>
                  <span>{formaPagamento === "PIX" ? "PIX" : "Dinheiro"}</span>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: 12, background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Voltar</button>
                <button onClick={finalizarVenda} disabled={saving} style={{ flex: 1, padding: 12, background: "#16A34A", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Processando..." : "Confirmar"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
