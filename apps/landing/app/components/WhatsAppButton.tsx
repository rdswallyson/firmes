"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [number, setNumber] = useState("5511999999999");

  useEffect(() => {
    // Buscar número configurado
    fetch("/api/config/whatsapp")
      .then((r) => r.json())
      .then((d: { number?: string }) => {
        if (d.number) setNumber(d.number);
      })
      .catch(() => {});

    // Mostrar após 5 segundos
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const link = `https://wa.me/${number}?text=Olá! Preciso de ajuda com o FIRMES.`;

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title="Precisa de ajuda? Fale conosco"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9000,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(37,211,102,0.4)",
        cursor: "pointer",
        textDecoration: "none",
      }}
    >
      <style>{`
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 4px 12px rgba(37,211,102,0.4); }
          50% { box-shadow: 0 4px 24px rgba(37,211,102,0.7); }
        }
      `}</style>
      <div style={{ animation: "pulse-green 2s infinite", width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MessageCircle size={28} color="white" fill="white" />
      </div>
    </motion.a>
  );
}
