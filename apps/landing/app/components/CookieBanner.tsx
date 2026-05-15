"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookies-accepted");
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = (all: boolean) => {
    localStorage.setItem("cookies-accepted", all ? "all" : "essential");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9000,
            background: "#fff",
            borderTop: "1px solid #E5E7EB",
            padding: "20px 24px",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Cookie size={22} style={{ color: "#C8922A" }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827" }}>Utilizamos cookies</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>
                  Usamos cookies para melhorar sua experiência. Você pode aceitar todos ou apenas os essenciais.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              <button
                onClick={() => handleAccept(false)}
                style={{
                  padding: "10px 18px",
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Apenas essenciais
              </button>
              <button
                onClick={() => handleAccept(true)}
                style={{
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #1A3C6E, #1E4A84)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Check size={14} />
                Aceitar todos
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
