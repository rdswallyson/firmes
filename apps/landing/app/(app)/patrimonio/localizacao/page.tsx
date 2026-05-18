"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowLeft, Box } from "lucide-react";
import Link from "next/link";

interface Bem {
  id: string;
  nome: string;
  categoria: string;
  localizacao: string;
  estado: string;
}

export default function LocalizacaoPatrimonioPage() {
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

  const locais = Array.from(new Set(bens.map((b) => b.localizacao).filter(Boolean)));

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/patrimonio" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Localização dos Bens</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Onde cada bem está alocado</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : locais.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <MapPin size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280" }}>Nenhuma localização cadastrada.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {locais.map((local, i) => {
            const bensLocal = bens.filter((b) => b.localizacao === local);
            return (
              <motion.div
                key={local}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <MapPin size={18} style={{ color: "#1A3C6E" }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{local}</h3>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: 6 }}>
                    {bensLocal.length} {bensLocal.length === 1 ? "item" : "itens"}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bensLocal.map((b) => (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#F9FAFB", borderRadius: 8 }}>
                      <span style={{ fontSize: 14, color: "#374151" }}>{b.nome}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: b.estado === "NOVO" ? "#DCFCE7" : b.estado === "BOM" ? "#DBEAFE" : "#FEF3C7", color: b.estado === "NOVO" ? "#16A34A" : b.estado === "BOM" ? "#3B82F6" : "#D97706", fontWeight: 600 }}>
                        {b.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
