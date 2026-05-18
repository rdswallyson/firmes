"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface Documento {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  data: string;
  url: string;
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Documento[]>([]);
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Documentos / PDFs</h1>
            <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Arquivos e documentos da igreja</p>
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
          Enviar Documento
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : docs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <FileText size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhum documento cadastrado.</p>
          <button
            onClick={() => alert("Funcionalidade em desenvolvimento")}
            style={{ padding: "10px 20px", background: "#1A3C6E", color: "white", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer" }}
          >
            Adicionar primeiro documento
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {docs.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={20} style={{ color: "#D97706" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{d.nome}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>{d.tipo} · {d.tamanho} · {d.data}</p>
              </div>
              <button style={{ padding: "6px 12px", background: "#F3F4F6", border: "none", borderRadius: 6, cursor: "pointer" }}>
                <Download size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
