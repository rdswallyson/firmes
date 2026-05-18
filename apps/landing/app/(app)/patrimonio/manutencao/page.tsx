"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowLeft, Plus, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Manutencao {
  id: string;
  bemId: string;
  bemNome: string;
  tipo: string;
  data: string;
  descricao: string;
  responsavel: string;
  status: string;
}

export default function ManutencaoPatrimonioPage() {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder - quando tiver API real, buscar de /api/patrimonio/manutencao
    setLoading(false);
  }, []);

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/patrimonio" style={{ color: "#6B7280" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Manutenção</h1>
            <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Histórico de manutenções</p>
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
          <Plus size={16} />
          Nova Manutenção
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : manutencoes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Wrench size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280", marginBottom: 16 }}>Nenhuma manutenção registrada.</p>
          <button
            onClick={() => alert("Funcionalidade em desenvolvimento")}
            style={{ padding: "10px 20px", background: "#1A3C6E", color: "white", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer" }}
          >
            Registrar primeira manutenção
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {manutencoes.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#111827" }}>{m.bemNome}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>{m.descricao}</p>
                </div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: m.status === "CONCLUIDA" ? "#DCFCE7" : "#FEF3C7", color: m.status === "CONCLUIDA" ? "#16A34A" : "#D97706", fontWeight: 600 }}>
                  {m.status}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
                <span><Calendar size={12} style={{ display: "inline", marginRight: 4 }} />{m.data}</span>
                <span>👤 {m.responsavel}</span>
                <span>🔧 {m.tipo}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
