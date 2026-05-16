"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Tag, Search, Pencil, Trash2, Percent, Calendar } from "lucide-react";

interface Cupom {
  id: string;
  codigo: string;
  desconto: number;
  tipo: string;
  maxUsos?: number;
  usosAtual: number;
  validade?: string;
  ativo: boolean;
}

export default function CuponsPage() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    desconto: "",
    tipo: "PERCENTUAL",
    maxUsos: "",
    validade: "",
  });

  useEffect(() => {
    fetch("/api/cupons")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCupons(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cupons.filter((c) => c.codigo.toLowerCase().includes(search.toLowerCase()));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/cupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: form.codigo.toUpperCase(),
          desconto: parseFloat(form.desconto),
          tipo: form.tipo,
          maxUsos: form.maxUsos ? parseInt(form.maxUsos) : null,
          validade: form.validade || null,
        }),
      });

      if (res.ok) {
        const novo = await res.json();
        setCupons([novo, ...cupons]);
        setShowForm(false);
        setForm({ codigo: "", desconto: "", tipo: "PERCENTUAL", maxUsos: "", validade: "" });
      }
    } catch {
      alert("Erro ao criar cupom");
    }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    try {
      const res = await fetch(`/api/cupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      });
      if (res.ok) {
        setCupons((prev) => prev.map((c) => (c.id === id ? { ...c, ativo: !ativo } : c)));
      }
    } catch {
      alert("Erro ao atualizar cupom");
    }
  }

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Cupons</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Crie cupons de desconto para seus clientes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: showForm ? "#F3F4F6" : "linear-gradient(135deg, #1A3C6E, #1E4A84)",
            color: showForm ? "#374151" : "white",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Plus size={16} />
          {showForm ? "Cancelar" : "Novo Cupom"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Código *</label>
              <input
                type="text"
                required
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                placeholder="BLACKFRIDAY"
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Desconto *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.desconto}
                onChange={(e) => setForm({ ...form, desconto: e.target.value })}
                placeholder="10"
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              >
                <option value="PERCENTUAL">Percentual (%)</option>
                <option value="FIXO">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Máximo de usos</label>
              <input
                type="number"
                value={form.maxUsos}
                onChange={(e) => setForm({ ...form, maxUsos: e.target.value })}
                placeholder="Ilimitado"
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Validade</label>
              <input
                type="date"
                value={form.validade}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              />
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #1A3C6E, #1E4A84)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Criar Cupom
            </button>
          </div>
        </motion.form>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar cupom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 40px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, background: "white" }}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 16 }}>
          <Tag size={48} style={{ color: "#E5E7EB", marginBottom: 16 }} />
          <p style={{ color: "#6B7280" }}>Nenhum cupom encontrado.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", opacity: c.ativo ? 1 : 0.6 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#1A3C6E", letterSpacing: "0.05em" }}>{c.codigo}</span>
                  <span style={{ display: "block", fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{c.tipo === "PERCENTUAL" ? `${c.desconto}% OFF` : `R$ ${c.desconto.toFixed(2)} OFF`}</span>
                </div>
                <button
                  onClick={() => toggleAtivo(c.id, c.ativo)}
                  style={{
                    padding: "4px 10px",
                    background: c.ativo ? "#DCFCE7" : "#F3F4F6",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    color: c.ativo ? "#16A34A" : "#6B7280",
                    cursor: "pointer",
                  }}
                >
                  {c.ativo ? "Ativo" : "Inativo"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
                <span>Usos: {c.usosAtual}{c.maxUsos ? `/${c.maxUsos}` : ""}</span>
                {c.validade && <span>Válido até: {new Date(c.validade).toLocaleDateString("pt-BR")}</span>}
              </div>

              <div style={{ width: "100%", height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${c.maxUsos ? Math.min((c.usosAtual / c.maxUsos) * 100, 100) : Math.min(c.usosAtual * 10, 100)}%`,
                    height: "100%",
                    background: c.ativo ? "#1A3C6E" : "#9CA3AF",
                    borderRadius: 2,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
