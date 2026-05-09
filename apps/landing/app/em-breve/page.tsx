"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const MODULOS: Record<string, string> = {
  importar: "Importação de Membros via Excel",
  dominio: "Domínio Personalizado",
  material: "Material de Vendas",
  grupos: "Grupos e Células",
  patrimonio: "Patrimônio",
  cultos: "Cultos e Check-in",
  escalas: "Escalas de Ministério",
  comunicacao: "Comunicação",
  configuracoes: "Configurações",
  "super-admin": "Super Admin",
};

function EmBreveContent() {
  const searchParams = useSearchParams();
  const modulo = searchParams.get("modulo") || "";
  const titulo = MODULOS[modulo] || "Módulo";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB", padding: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "3rem",
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(26,60,110,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <Clock size={40} strokeWidth={1.5} color="#1A3C6E" />
        </div>

        <h1 style={{ color: "#0D2545", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {titulo}
        </h1>

        <p style={{ color: "#6B7280", fontSize: "1rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          Este módulo está em desenvolvimento e estará disponível em breve.
          <br />
          Agradecemos sua paciência!
        </p>

        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Voltar ao Dashboard
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

export default function EmBrevePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB" }}>Carregando...</div>}>
      <EmBreveContent />
    </Suspense>
  );
}
