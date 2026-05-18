"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Upload, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

interface VideoItem {
  id: string;
  url: string;
  titulo: string;
  duracao: string;
  data: string;
  thumbnail?: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Álbuns de Vídeo</h1>
            <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Cultos, palestras e eventos</p>
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
          Enviar Vídeo
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Video size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhum vídeo cadastrado.</p>
          <button
            onClick={() => alert("Funcionalidade em desenvolvimento")}
            style={{ padding: "10px 20px", background: "#1A3C6E", color: "white", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer" }}
          >
            Adicionar primeiro vídeo
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {videos.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ aspectRatio: "16/9", background: "#1F2937", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Play size={40} style={{ color: "white", opacity: 0.8 }} />
                <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "white", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>{v.duracao}</span>
              </div>
              <div style={{ padding: 16 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{v.titulo}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9CA3AF" }}>{v.data}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
