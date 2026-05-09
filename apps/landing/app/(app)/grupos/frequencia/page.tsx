"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckSquare, Save, X, Search } from "lucide-react";
import Link from "next/link";

interface Grupo {
  id: string;
  name: string;
  leader: { name: string } | null;
  _count: { members: number };
}

export default function RegistrarFrequenciaPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Grupo | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    presentes: 0,
    ausentes: 0,
    visitantes: 0,
    observacao: "",
  });

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((d) => setGrupos(d.grupos || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = grupos.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/grupos/${selected.id}/frequencia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setSelected(null);
        setForm({ date: new Date().toISOString().split("T")[0], presentes: 0, ausentes: 0, visitantes: 0, observacao: "" });
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Link href="/grupos" style={{ color: "#6B7280", display: "flex" }}>
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Registrar Frequência</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.2rem 0 0" }}>Selecione um grupo e registre a presença da reunião</p>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#15803D", fontWeight: 500, fontSize: "0.875rem" }}>
          ✓ Frequência registrada com sucesso!
        </motion.div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Lista de grupos */}
        <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem" }}>Selecionar Grupo</h3>
          <div style={{ position: "relative", marginBottom: "0.75rem" }}>
            <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              placeholder="Buscar grupo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none" }}
            />
          </div>
          {loading ? (
            <p style={{ color: "#9CA3AF", textAlign: "center", padding: "1rem" }}>Carregando...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "400px", overflowY: "auto" }}>
              {filtered.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelected(g)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    border: selected?.id === g.id ? "2px solid #1A3C6E" : "1px solid #E5E7EB",
                    background: selected?.id === g.id ? "#EFF6FF" : "white",
                    transition: "all 0.1s",
                  }}
                >
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0D2545" }}>{g.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.2rem" }}>
                    {g.leader?.name ?? "Sem líder"} · {g._count.members} membros
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p style={{ color: "#9CA3AF", textAlign: "center", padding: "1rem", fontSize: "0.875rem" }}>Nenhum grupo encontrado</p>
              )}
            </div>
          )}
        </div>

        {/* Formulário */}
        <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #E5E7EB" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckSquare size={18} strokeWidth={1.5} />
            {selected ? `Frequência — ${selected.name}` : "Selecione um grupo"}
          </h3>

          {!selected ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9CA3AF", fontSize: "0.875rem" }}>
              ← Selecione um grupo ao lado
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#374151", marginBottom: "0.3rem" }}>Data da Reunião</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.625rem" }}>
                {[
                  { key: "presentes", label: "Presentes", color: "#16A34A" },
                  { key: "ausentes", label: "Ausentes", color: "#DC2626" },
                  { key: "visitantes", label: "Visitantes", color: "#6B7280" },
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color, marginBottom: "0.25rem" }}>{label}</label>
                    <input
                      type="number"
                      min={0}
                      value={form[key as keyof typeof form] as number}
                      onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "0.5rem", border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "0.875rem", textAlign: "center", outline: "none" }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#374151", marginBottom: "0.3rem" }}>Observação</label>
                <textarea
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  rows={3}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", resize: "vertical", outline: "none" }}
                  placeholder="Observações sobre a reunião..."
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%", padding: "0.75rem",
                  background: saving ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
                  color: "white", border: "none", borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: "0.875rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
              >
                <Save size={16} strokeWidth={1.5} />
                {saving ? "Salvando..." : "Registrar Frequência"}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
