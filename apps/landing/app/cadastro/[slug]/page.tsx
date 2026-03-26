"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CheckCircle, Send } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AutoCadastroPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "PENDING" }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error ?? "Erro ao enviar");
        return;
      }
      setSent(true);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", border: "1.5px solid #E5E7EB",
    borderRadius: "8px", fontSize: "0.95rem", outline: "none", background: "white",
    boxSizing: "border-box", color: "#111827",
  };

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB", padding: "2rem" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: "white", borderRadius: "16px", padding: "3rem", textAlign: "center", maxWidth: "420px", width: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <CheckCircle size={48} strokeWidth={1.5} color="#16A34A" />
          <h2 style={{ color: "#0D2545", marginTop: "1rem" }}>Cadastro enviado!</h2>
          <p style={{ color: "#6B7280", fontSize: "0.9rem" }}>Seu cadastro foi recebido e está pendente de aprovação pelo administrador da igreja.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB", padding: "2rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "white", borderRadius: "16px", padding: "2.5rem", maxWidth: "480px", width: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(26,60,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
            <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
              <path d="M22 6 C14 6 8 12 8 20 C8 27 12 33 18 36 L18 38 C18 39.1 18.9 40 20 39.5 C21 39 22 37 22 35 C22 37 23 39 24 39.5 C25.1 40 26 39.1 26 38 L26 36 C32 33 36 27 36 20 C36 12 30 6 22 6Z" fill="#1A3C6E" opacity="0.8"/>
              <circle cx="17.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
              <circle cx="26.5" cy="19" r="2.5" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.25rem" }}>Cadastro de Visitante</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Preencha seus dados para se cadastrar na igreja</p>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", color: "#DC2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8375rem", fontWeight: 500, color: "#374151" }}>Nome completo *</label>
            <input {...register("name")} style={{ ...inputStyle, borderColor: errors.name ? "#DC2626" : "#E5E7EB" }} placeholder="Seu nome" />
            {errors.name && <span style={{ color: "#DC2626", fontSize: "0.75rem" }}>{errors.name.message}</span>}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8375rem", fontWeight: 500, color: "#374151" }}>E-mail</label>
            <input {...register("email")} type="email" style={{ ...inputStyle, borderColor: errors.email ? "#DC2626" : "#E5E7EB" }} placeholder="seu@email.com" />
            {errors.email && <span style={{ color: "#DC2626", fontSize: "0.75rem" }}>{errors.email.message}</span>}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8375rem", fontWeight: 500, color: "#374151" }}>Telefone</label>
            <input {...register("phone")} style={inputStyle} placeholder="(00) 00000-0000" />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.8375rem", fontWeight: 500, color: "#374151" }}>Data de nascimento</label>
            <input {...register("birthDate")} type="date" style={inputStyle} />
          </div>

          <motion.button type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.875rem", background: saving ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.95rem" }}>
            <Send size={16} strokeWidth={1.5} />
            {saving ? "Enviando..." : "Enviar cadastro"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
