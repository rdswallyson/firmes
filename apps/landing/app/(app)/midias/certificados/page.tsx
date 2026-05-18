"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, ArrowLeft, Download, Plus } from "lucide-react";
import Link from "next/link";

interface Certificado {
  id: string;
  membro: string;
  curso: string;
  data: string;
  status: string;
}

export default function CertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Certificados</h1>
            <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Certificados de cursos e eventos</p>
          </div>
        </div>
        <Link
          href="/ensino/certificados"
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
            textDecoration: "none",
          }}
        >
          <Award size={16} />
          Ver do Ensino
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : certificados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Award size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhum certificado emitido.</p>
          <Link
            href="/ensino"
            style={{ padding: "10px 20px", background: "#1A3C6E", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 600 }}
          >
            Ir para Ensino
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {certificados.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #1A3C6E, #C8922A)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award size={24} style={{ color: "white" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>{c.membro}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{c.curso} · {c.data}</p>
              </div>
              <button style={{ padding: "8px 16px", background: "#F3F4F6", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
                <Download size={14} />
                PDF
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
