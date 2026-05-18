"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, Search, Box, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Bem {
  id: string;
  nome: string;
  categoria: string;
  localizacao: string;
  estado: string;
}

const CATEGORIAS = [
  "Som e Áudio",
  "Projeção",
  "Móveis",
  "Instrumentos Musicais",
  "Eletrodomésticos",
  "Informática",
  "Decoração",
  "Veículos",
  "Outros",
];

export default function CategoriasPatrimonioPage() {
  const [bens, setBens] = useState<Bem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patrimonio")
      .then((r) => r.json())
      .then((data) => {
        setBens(data.bens || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = CATEGORIAS.map((cat) => ({
    categoria: cat,
    quantidade: bens.filter((b) => b.categoria === cat).length,
    valorTotal: bens
      .filter((b) => b.categoria === cat)
      .reduce((sum, b) => sum + (b as any).valor || 0, 0),
  })).filter((s) => s.quantidade > 0);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/patrimonio" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Categorias</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Bens por categoria</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : stats.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Tag size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280" }}>Nenhuma categoria com bens cadastrados.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.categoria}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Tag size={20} style={{ color: "#1A3C6E" }} />
                </div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{s.categoria}</h3>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6B7280" }}>
                <span>{s.quantidade} {s.quantidade === 1 ? "item" : "itens"}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
