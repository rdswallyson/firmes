"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Erro ao fazer login");
        setShakeKey((k) => k + 1);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão");
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotSent(true);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-geist-sans), sans-serif" }}>
      {/* Left panel */}
      <div
        style={{
          flex: "0 0 45%",
          background: "linear-gradient(145deg, #0D2545 0%, #1A3C6E 50%, #1E4A84 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(200,146,42,0.08)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ marginBottom: "2.5rem", textAlign: "center" }}
        >
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "rgba(200,146,42,0.15)",
            border: "2px solid rgba(200,146,42,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M22 6 C14 6 8 12 8 20 C8 27 12 33 18 36 L18 38 C18 39.1 18.9 40 20 39.5 C21 39 22 37 22 35 C22 37 23 39 24 39.5 C25.1 40 26 39.1 26 38 L26 36 C32 33 36 27 36 20 C36 12 30 6 22 6Z" fill="#C8922A" opacity="0.9"/>
              <circle cx="17.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="26.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
              <path d="M19 25 Q22 28 25 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            Firmes
          </h1>
          <p style={{ color: "rgba(200,146,42,0.9)", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", margin: "4px 0 0" }}>
            Sistema de Gestão
          </p>
        </motion.div>

        <div style={{ textAlign: "center", maxWidth: "320px" }}>
          <p style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "1.1rem",
            fontStyle: "italic",
            lineHeight: 1.7,
            margin: "0 0 1rem",
          }}>
            &ldquo;Permanecei firmes na fé, sede corajosos e fortes.&rdquo;
          </p>
          <p style={{ color: "rgba(200,146,42,0.8)", fontSize: "0.85rem", fontWeight: 600 }}>
            — 1 Coríntios 16:13
          </p>
        </div>

        <div style={{ position: "absolute", bottom: "2rem", color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>
          © 2026 Firmes · Todos os direitos reservados
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#F5F0EB",
        position: "relative",
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: "400px" }}
        >
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0D2545", marginBottom: "0.4rem" }}>
            Bem-vindo de volta
          </h2>
          <p style={{ color: "#6B7280", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Acesse sua conta para continuar
          </p>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -10, 10, -5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    color: "#DC2626",
                    fontSize: "0.875rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "white",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "border-color 0.2s",
                  color: "#111827",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#1A3C6E"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "white",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "border-color 0.2s",
                  color: "#111827",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#1A3C6E"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "#6B7280" }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: "#1A3C6E", width: "15px", height: "15px" }}
                />
                Lembrar de mim
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{ background: "none", border: "none", color: "#1A3C6E", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500, textDecoration: "underline", padding: 0 }}
              >
                Esqueci minha senha
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              style={{
                width: "100%",
                padding: "0.875rem",
                background: loading ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.625rem",
                transition: "background 0.2s",
              }}
            >
              {loading && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
              {loading ? "Entrando..." : "Entrar"}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Modal de recuperação de senha */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 50,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowForgot(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "2rem",
                width: "100%",
                maxWidth: "400px",
                margin: "1rem",
              }}
            >
              {!forgotSent ? (
                <>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0D2545", marginBottom: "0.5rem" }}>
                    Recuperar senha
                  </h3>
                  <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                    Informe seu e-mail e enviaremos um link de recuperação.
                  </p>
                  <form onSubmit={handleForgot}>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="seu@email.com"
                      style={{
                        width: "100%", padding: "0.75rem 1rem",
                        border: "1.5px solid #E5E7EB", borderRadius: "8px",
                        fontSize: "0.95rem", marginBottom: "1rem",
                        boxSizing: "border-box", outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        type="button"
                        onClick={() => setShowForgot(false)}
                        style={{ flex: 1, padding: "0.75rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        style={{ flex: 1, padding: "0.75rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}
                      >
                        Enviar
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
                  <h3 style={{ color: "#0D2545", marginBottom: "0.5rem" }}>E-mail enviado!</h3>
                  <p style={{ color: "#6B7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                    Verifique sua caixa de entrada em <strong>{forgotEmail}</strong>
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                    style={{ padding: "0.75rem 2rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}
                  >
                    Fechar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
