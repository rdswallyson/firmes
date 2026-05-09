"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Save } from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
}

export default function NovoGrupoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    leaderId: "",
    meetingDay: "",
    meetingTime: "",
    address: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch("/api/members?limit=1000");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/grupos");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <div style={{ padding: "1.5rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/grupos" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Novo Grupo</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", border: "1px solid #E5E7EB" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" }}>
              Nome do grupo *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
              }}
              placeholder="Ex: Célula Jovens"
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" }}>
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                resize: "vertical",
              }}
              placeholder="Descrição do grupo..."
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" }}>
              Líder
            </label>
            <select
              value={form.leaderId}
              onChange={(e) => setForm({ ...form, leaderId: e.target.value })}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
                background: "white",
              }}
            >
              <option value="">Selecione um líder</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" }}>
                Dia da reunião
              </label>
              <select
                value={form.meetingDay}
                onChange={(e) => setForm({ ...form, meetingDay: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  background: "white",
                }}
              >
                <option value="">Selecione</option>
                {dias.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" }}>
                Horário
              </label>
              <input
                type="time"
                value={form.meetingTime}
                onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.625rem 0.75rem",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" }}>
              Endereço
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "0.875rem",
                outline: "none",
              }}
              placeholder="Endereço do grupo..."
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <Link href="/grupos">
              <button
                type="button"
                style={{
                  padding: "0.625rem 1rem",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "#374151",
                }}
              >
                Cancelar
              </button>
            </Link>
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                background: loading ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              <Save size={16} strokeWidth={1.5} />
              {loading ? "Salvando..." : "Salvar Grupo"}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}
