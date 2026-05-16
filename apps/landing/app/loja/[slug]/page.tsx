"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Minus, X, CreditCard, Banknote, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  foto?: string;
  preco: number;
  estoque: number;
  variacoes: { id: string; tipo: string; opcao: string; estoque: number }[];
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
}

interface CarrinhoItem {
  produtoId: string;
  nome: string;
  foto?: string;
  preco: number;
  quantidade: number;
  variacaoId?: string;
  variacaoLabel?: string;
}

export default function LojaPublicaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [showCarrinho, setShowCarrinho] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<"PIX" | "DINHEIRO" | "CARTAO" | "RETIRADA">("PIX");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedVariacao, setSelectedVariacao] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/loja/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.tenant) setTenant(data.tenant);
        if (data.produtos) setProdutos(data.produtos);
      })
      .catch(() => {});
  }, [slug]);

  const addToCart = (produto: Produto) => {
    const variacaoId = selectedVariacao[produto.id];
    const variacao = produto.variacoes.find((v) => v.id === variacaoId);
    const preco = produto.preco;
    const estoque = variacao ? variacao.estoque : produto.estoque;

    if (estoque <= 0) return;

    setCarrinho((prev) => {
      const existente = prev.find((i) => i.produtoId === produto.id && i.variacaoId === variacaoId);
      if (existente) {
        return prev.map((i) =>
          i.produtoId === produto.id && i.variacaoId === variacaoId
            ? { ...i, quantidade: Math.min(i.quantidade + 1, estoque) }
            : i
        );
      }
      return [
        ...prev,
        {
          produtoId: produto.id,
          nome: produto.nome + (variacao ? ` (${variacao.opcao})` : ""),
          foto: produto.foto,
          preco,
          quantidade: 1,
          variacaoId,
          variacaoLabel: variacao?.opcao,
        },
      ];
    });
    setShowCarrinho(true);
  };

  const updateQty = (produtoId: string, variacaoId: string | undefined, delta: number) => {
    setCarrinho((prev) =>
      prev
        .map((i) => {
          if (i.produtoId === produtoId && i.variacaoId === variacaoId) {
            return { ...i, quantidade: Math.max(1, i.quantidade + delta) };
          }
          return i;
        })
        .filter((i) => i.quantidade > 0)
    );
  };

  const removeFromCart = (produtoId: string, variacaoId: string | undefined) => {
    setCarrinho((prev) => prev.filter((i) => !(i.produtoId === produtoId && i.variacaoId === variacaoId)));
  };

  const total = carrinho.reduce((sum, i) => sum + i.preco * i.quantidade, 0);

  async function handleCheckout() {
    if (!tenant || !nome || carrinho.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          nomeComprador: nome,
          telefone,
          email,
          formaPagamento,
          total,
          itens: carrinho.map((i) => ({
            produtoId: i.produtoId,
            variacaoId: i.variacaoId,
            quantidade: i.quantidade,
            preco: i.preco,
            nome: i.nome,
          })),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setCarrinho([]);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }

  if (!tenant) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB" }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F0EB", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ background: "#fff", borderRadius: 20, padding: 48, textAlign: "center", maxWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        >
          <CheckCircle size={64} style={{ color: "#16A34A", marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>Pedido realizado!</h1>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>Obrigado por comprar com {tenant.name}. Entraremos em contato para confirmar.</p>
          <Link
            href={`/loja/${slug}`}
            style={{ display: "inline-block", padding: "12px 24px", background: "#1A3C6E", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}
          >
            Voltar à loja
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <header style={{ background: tenant.primaryColor || "#1A3C6E", color: "white", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {tenant.logo && <img src={tenant.logo} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />}
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{tenant.name}</h1>
        </div>
        <button
          onClick={() => setShowCarrinho(!showCarrinho)}
          style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: "10px 16px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}
        >
          <ShoppingBag size={18} />
          {carrinho.length > 0 && <span>({carrinho.reduce((s, i) => s + i.quantidade, 0)})</span>}
        </button>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "flex", gap: 24 }}>
        {/* Grid de produtos */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0D2545", marginBottom: 20 }}>Produtos</h2>

          {produtos.length === 0 ? (
            <p style={{ color: "#6B7280" }}>Nenhum produto disponível no momento.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {produtos.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div style={{ height: 180, background: p.foto ? `url(${p.foto})` : "#E5E7EB", backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ padding: 16 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>{p.nome}</h3>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6B7280", lineHeight: 1.4 }}>{p.descricao || ""}</p>

                    {p.variacoes.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <select
                          value={selectedVariacao[p.id] || ""}
                          onChange={(e) => setSelectedVariacao((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13 }}
                        >
                          <option value="">Selecione {p.variacoes[0]?.tipo}</option>
                          {p.variacoes.map((v) => (
                            <option key={v.id} value={v.id} disabled={v.estoque <= 0}>
                              {v.opcao} {v.estoque <= 0 && "(esgotado)"}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: tenant.primaryColor || "#1A3C6E" }}>
                        R$ {p.preco.toFixed(2)}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(p)}
                        disabled={p.estoque <= 0}
                        style={{
                          padding: "8px 16px",
                          background: p.estoque > 0 ? (tenant.primaryColor || "#1A3C6E") : "#9CA3AF",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: p.estoque > 0 ? "pointer" : "not-allowed",
                          fontSize: 13,
                        }}
                      >
                        Adicionar
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Carrinho lateral */}
        {showCarrinho && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{ width: 360, background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", height: "fit-content" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0D2545" }}>Carrinho</h3>
              <button onClick={() => setShowCarrinho(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#6B7280" />
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p style={{ color: "#6B7280", textAlign: "center", padding: "20px 0" }}>Carrinho vazio</p>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {carrinho.map((item) => (
                    <div key={`${item.produtoId}-${item.variacaoId}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "#F9FAFB", borderRadius: 10 }}>
                      {item.foto && <img src={item.foto} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.nome}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>R$ {item.preco.toFixed(2)}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => updateQty(item.produtoId, item.variacaoId, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.quantidade}</span>
                        <button onClick={() => updateQty(item.produtoId, item.variacaoId, 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E5E7EB", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeFromCart(item.produtoId, item.variacaoId)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}>
                          <X size={16} color="#DC2626" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: tenant.primaryColor || "#1A3C6E" }}>R$ {total.toFixed(2)}</span>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <input
                      type="text"
                      placeholder="Seu nome completo *"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, marginBottom: 8 }}
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, marginBottom: 8 }}
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Forma de pagamento</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { value: "PIX", label: "PIX", icon: <Banknote size={16} /> },
                        { value: "CARTAO", label: "Cartão de Crédito", icon: <CreditCard size={16} /> },
                        { value: "DINHEIRO", label: "Dinheiro", icon: <Banknote size={16} /> },
                        { value: "RETIRADA", label: "Retirar na Igreja", icon: <Truck size={16} /> },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: formaPagamento === opt.value ? `2px solid ${tenant.primaryColor || "#1A3C6E"}` : "1.5px solid #E5E7EB",
                            cursor: "pointer",
                            background: formaPagamento === opt.value ? "#F0F7FF" : "white",
                          }}
                        >
                          <input
                            type="radio"
                            name="pagamento"
                            value={opt.value}
                            checked={formaPagamento === opt.value}
                            onChange={() => setFormaPagamento(opt.value as any)}
                            style={{ accentColor: tenant.primaryColor || "#1A3C6E" }}
                          />
                          {opt.icon}
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCheckout}
                    disabled={loading || !nome || carrinho.length === 0}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: loading ? "#9CA3AF" : (tenant.primaryColor || "#1A3C6E"),
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Processando..." : "Finalizar Pedido"}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
