"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    churchName: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!acceptedTerms) {
      setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          churchName: form.churchName,
          slug: form.slug.toLowerCase().replace(/[^a-z0-9]/g, ""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        return;
      }

      // Redirecionar para página de obrigado
      router.push(`/obrigado?name=${encodeURIComponent(form.name)}`);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

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
          style={{ width: "100%", maxWidth: "450px" }}
        >
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0D2545", marginBottom: "0.4rem" }}>
            Crie sua conta
          </h2>
          <p style={{ color: "#6B7280", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Comece a gerenciar sua igreja hoje mesmo
          </p>

          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#DC2626",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Seu nome
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="João Silva"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "white",
                  boxSizing: "border-box",
                  outline: "none",
                  color: "#111827",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                E-mail
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  color: "#111827",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Nome da igreja
              </label>
              <input
                type="text"
                value={form.churchName}
                onChange={(e) => setForm({ ...form, churchName: e.target.value })}
                required
                placeholder="Igreja Firmes"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  background: "white",
                  boxSizing: "border-box",
                  outline: "none",
                  color: "#111827",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Subdomínio (URL da sua igreja)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="minhaigreja"
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "8px 0 0 8px",
                    fontSize: "0.95rem",
                    background: "white",
                    boxSizing: "border-box",
                    outline: "none",
                    color: "#111827",
                    borderRight: "none",
                  }}
                />
                <span style={{
                  padding: "0.75rem 1rem",
                  background: "#F3F4F6",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "0 8px 8px 0",
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  whiteSpace: "nowrap",
                }}>
                  .firmes.app
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Senha
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  color: "#111827",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
                Confirmar senha
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                  color: "#111827",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: "#1A3C6E" }}
                />
                <span>
                  Li e aceito os{" "}
                  <Link href="/termos-de-uso" target="_blank" style={{ color: "#1A3C6E", fontWeight: 600, textDecoration: "underline" }}>Termos de Uso</Link>{" "}
                  e a{" "}
                  <Link href="/politica-de-privacidade" target="_blank" style={{ color: "#1A3C6E", fontWeight: 600, textDecoration: "underline" }}>Política de Privacidade</Link>
                </span>
              </label>
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
              }}
            >
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </motion.button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#6B7280" }}>
            Já tem uma conta?{" "}
            <Link href="/login" style={{ color: "#1A3C6E", fontWeight: 600, textDecoration: "none" }}>
              Entrar
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
