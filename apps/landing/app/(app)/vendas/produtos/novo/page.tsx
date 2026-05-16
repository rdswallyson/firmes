"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, X, Save, Upload } from "lucide-react";

interface Variacao {
  tipo: string;
  opcao: string;
  estoque: number;
}

export default function NovoProdutoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria: "",
    estoque: "",
  });
  const [variacoes, setVariacoes] = useState<Variacao[]>([]);
  const [loading, setLoading] = useState(false);

  const addVariacao = () => {
    setVariacoes([...variacoes, { tipo: "Tamanho", opcao: "", estoque: 0 }]);
  };

  const updateVariacao = (index: number, field: keyof Variacao, value: string | number) => {
    const next = [...variacoes];
    (next[index] as any)[field] = value;
    setVariacoes(next);
  };

  const removeVariacao = (index: number) => {
    setVariacoes(variacoes.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao,
          preco: parseFloat(form.preco),
          categoria: form.categoria,
          estoque: parseInt(form.estoque) || 0,
          variacoes: variacoes.filter((v) => v.opcao),
        }),
      });

      if (res.ok) {
        router.push("/vendas/produtos");
      } else {
        alert("Erro ao criar produto");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", marginBottom: 24 }}>Novo Produto</h1>

      <form onSubmit={handleSubmit} style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nome *</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Camiseta FIRMES"
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Descrição</label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Descrição do produto..."
            rows={3}
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, resize: "vertical" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Preço (R$) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              placeholder="49.90"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Estoque *</label>
            <input
              type="number"
              required
              value={form.estoque}
              onChange={(e) => setForm({ ...form, estoque: e.target.value })}
              placeholder="10"
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Categoria *</label>
          <input
            type="text"
            required
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            placeholder="Vestuário, Livros, Acessórios..."
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
          />
        </div>

        {/* Variações */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Variações (tamanho, cor, etc.)</label>
            <button
              type="button"
              onClick={addVariacao}
              style={{ padding: "6px 12px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Plus size={14} /> Adicionar
            </button>
          </div>

          {variacoes.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select
                value={v.tipo}
                onChange={(e) => updateVariacao(i, "tipo", e.target.value)}
                style={{ padding: "8px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13 }}
              >
                <option>Tamanho</option>
                <option>Cor</option>
                <option>Sabor</option>
                <option>Modelo</option>
              </select>
              <input
                type="text"
                placeholder="Opção (ex: G, Azul)"
                value={v.opcao}
                onChange={(e) => updateVariacao(i, "opcao", e.target.value)}
                style={{ flex: 1, padding: "8px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13 }}
              />
              <input
                type="number"
                placeholder="Estoque"
                value={v.estoque}
                onChange={(e) => updateVariacao(i, "estoque", parseInt(e.target.value) || 0)}
                style={{ width: 80, padding: "8px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 13 }}
              />
              <button type="button" onClick={() => removeVariacao(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}>
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => router.push("/vendas/produtos")}
            style={{ padding: "10px 20px", background: "#F3F4F6", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "10px 24px",
              background: loading ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E, #1E4A84)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Save size={16} />
            {loading ? "Salvando..." : "Salvar Produto"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
