"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Package, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  foto?: string;
  preco: number;
  categoria: string;
  estoque: number;
  ativo: boolean;
  variacoes: { id: string; tipo: string; opcao: string; estoque: number }[];
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/produtos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProdutos(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = produtos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProdutos((prev) => prev.filter((p) => p.id !== id));
        setDeleteId(null);
      }
    } catch {
      alert("Erro ao excluir produto");
    }
  }

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Produtos</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Gerencie os produtos da sua loja</p>
        </div>
        <Link
          href="/vendas/produtos/novo"
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #1A3C6E, #1E4A84)",
            color: "white",
            borderRadius: 10,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Plus size={16} />
          Novo Produto
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              border: "1.5px solid #E5E7EB",
              borderRadius: 10,
              fontSize: 14,
              background: "white",
            }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Package size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhum produto encontrado.</p>
          <Link
            href="/vendas/produtos/novo"
            style={{
              padding: "10px 20px",
              background: "#1A3C6E",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Cadastrar primeiro produto
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ height: 160, background: p.foto ? `url(${p.foto})` : "#E5E7EB", backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                {!p.ativo && (
                  <span style={{ position: "absolute", top: 8, left: 8, background: "#DC2626", color: "white", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Inativo</span>
                )}
                {p.estoque <= 3 && p.estoque > 0 && (
                  <span style={{ position: "absolute", top: 8, right: 8, background: "#F59E0B", color: "white", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Estoque baixo</span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{p.nome}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>{p.categoria}</p>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#1A3C6E" }}>R$ {p.preco.toFixed(2)}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>Estoque: {p.estoque}</span>
                  {p.variacoes.length > 0 && <span style={{ fontSize: 12, color: "#6B7280" }}>{p.variacoes.length} variações</span>}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/vendas/produtos/${p.id}/editar`}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "#F3F4F6",
                      border: "none",
                      borderRadius: 8,
                      textAlign: "center",
                      textDecoration: "none",
                      color: "#374151",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <Pencil size={14} /> Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{
                      padding: "8px",
                      background: "#FEF2F2",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      color: "#DC2626",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
