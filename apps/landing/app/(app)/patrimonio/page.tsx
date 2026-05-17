"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Box, Tag, MapPin, Wrench, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Bem {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  localizacao: string;
  valor: number;
  dataAquisicao: string;
  estado: string;
  foto?: string;
}

const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  NOVO: { label: "Novo", color: "#16A34A", bg: "#DCFCE7" },
  BOM: { label: "Bom", color: "#3B82F6", bg: "#DBEAFE" },
  REGULAR: { label: "Regular", color: "#F59E0B", bg: "#FEF3C7" },
  DEFEITO: { label: "Com defeito", color: "#DC2626", bg: "#FEE2E2" },
  DESCARTADO: { label: "Descartado", color: "#6B7280", bg: "#F3F4F6" },
};

export default function PatrimonioPage() {
  const [bens, setBens] = useState<Bem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  useEffect(() => {
    fetch("/api/patrimonio")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBens(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = bens.filter((b) => {
    const matchSearch = b.nome.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoriaFiltro || b.categoria === categoriaFiltro;
    return matchSearch && matchCat;
  });

  const categorias = [...new Set(bens.map((b) => b.categoria))];

  const totalValor = bens.reduce((s, b) => s + (b.valor || 0), 0);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Patrimônio</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Gerencie os bens da igreja</p>
        </div>
        <Link
          href="/patrimonio/novo"
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
          Cadastrar Bem
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total de bens", value: bens.length, icon: <Box size={20} /> },
          { label: "Valor total", value: `R$ ${totalValor.toFixed(2)}`, icon: <Tag size={20} /> },
          { label: "Em bom estado", value: bens.filter((b) => b.estado === "NOVO" || b.estado === "BOM").length, icon: <MapPin size={20} /> },
          { label: "Manutenção", value: bens.filter((b) => b.estado === "DEFEITO").length, icon: <Wrench size={20} /> },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ color: "#1A3C6E" }}>{s.icon}</div>
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0D2545" }}>{s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar bem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, background: "white" }}
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          style={{ padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, background: "white" }}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Box size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhum bem cadastrado.</p>
          <Link
            href="/patrimonio/novo"
            style={{
              padding: "10px 20px",
              background: "#1A3C6E",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Cadastrar primeiro bem
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((b, i) => {
            const estadoConfig = ESTADOS[b.estado || "REGULAR"] || ESTADOS.REGULAR;
            if (!estadoConfig) return null;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{b.nome}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>{b.categoria}</p>
                  </div>
                  <span style={{ background: estadoConfig.bg, color: estadoConfig.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {estadoConfig.label}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                  <span>📍 {b.localizacao}</span>
                  <span>💰 R$ {b.valor?.toFixed(2)}</span>
                </div>

                {b.descricao && <p style={{ margin: "0 0 12px", fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>{b.descricao}</p>}

                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/patrimonio/${b.id}/editar`}
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
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
