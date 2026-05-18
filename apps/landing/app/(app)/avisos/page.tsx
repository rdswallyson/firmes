"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Megaphone, Search, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  data: string;
  status: string;
  categoria: string;
}

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Buscar avisos da API quando existir
    // Por enquanto, mostrar estado vazio
    setLoading(false);
  }, []);

  const filtered = avisos.filter((a) =>
    a.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Mural de Avisos</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Comunique-se com a congregação</p>
        </div>
        <Link
          href="/avisos/novo"
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
          Novo Aviso
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar aviso..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, background: "white" }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Megaphone size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhum aviso publicado ainda.</p>
          <Link
            href="/avisos/novo"
            style={{
              padding: "10px 20px",
              background: "#1A3C6E",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Publicar primeiro aviso
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{a.titulo}</h3>
                <span style={{ background: a.status === "Publicado" ? "#DCFCE7" : "#FEF3C7", color: a.status === "Publicado" ? "#16A34A" : "#D97706", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {a.status}
                </span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#4B5563", lineHeight: 1.5 }}>{a.conteudo}</p>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9CA3AF" }}>
                <span>👤 {a.autor}</span>
                <span>📅 {a.data}</span>
                <span>🏷️ {a.categoria}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
