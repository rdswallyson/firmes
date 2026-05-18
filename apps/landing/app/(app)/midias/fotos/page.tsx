"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Image, Upload, ArrowLeft, Grid } from "lucide-react";
import Link from "next/link";

interface Foto {
  id: string;
  url: string;
  titulo: string;
  data: string;
  album?: string;
}

export default function FotosPage() {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder - buscar de /api/midias/fotos quando existir
    setLoading(false);
  }, []);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/midias" style={{ color: "#6B7280" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Galeria de Fotos</h1>
            <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Álbuns e fotos da igreja</p>
          </div>
        </div>
        <button
          onClick={() => alert("Funcionalidade em desenvolvimento")}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #1A3C6E, #1E4A84)",
            color: "white",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Upload size={16} />
          Enviar Fotos
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : fotos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Image size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhuma foto na galeria.</p>
          <button
            onClick={() => alert("Funcionalidade em desenvolvimento")}
            style={{ padding: "10px 20px", background: "#1A3C6E", color: "white", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer" }}
          >
            Criar primeiro álbum
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {fotos.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{ borderRadius: 12, overflow: "hidden", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ aspectRatio: "1", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image size={32} style={{ color: "#D1D5DB" }} />
              </div>
              <div style={{ padding: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{f.titulo}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9CA3AF" }}>{f.data}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
