"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, BookOpen, Plus, X, Check, Edit3, Trash2 } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Categoria {
  id: string;
  nome: string;
  totalCursos: number;
  cor: string;
}

const CATEGORIAS_DEFAULT = [
  { id: "ESTUDO", nome: "Estudo", cor: "#1D4ED8" },
  { id: "DISCIPULADO", nome: "Discipulado", cor: "#16A34A" },
  { id: "ESCOLA", nome: "Escola", cor: "#CA8A04" },
  { id: "OUTROS", nome: "Outros", cor: "#6B7280" },
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: "", cor: "#1D4ED8" });

  useEffect(() => {
    fetch("/api/ensino").then(r => r.json()).then(data => {
      const cursos = data.cursos || [];
      
      // Count cursos by categoria
      const countMap: Record<string, number> = {};
      cursos.forEach((c: any) => {
        const cat = c.categoria || "OUTROS";
        countMap[cat] = (countMap[cat] || 0) + 1;
      });
      
      const cats = CATEGORIAS_DEFAULT.map(c => ({
        ...c,
        totalCursos: countMap[c.id] || 0,
      }));
      
      setCategorias(cats);
    }).finally(() => setLoading(false));
  }, []);

  function openNewModal() {
    setEditId(null);
    setForm({ nome: "", cor: "#1D4ED8" });
    setShowModal(true);
  }

  function openEditModal(cat: Categoria) {
    setEditId(cat.id);
    setForm({ nome: cat.nome, cor: cat.cor });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.nome.trim()) return;
    
    if (editId) {
      setCategorias(cats => cats.map(c => c.id === editId ? { ...c, nome: form.nome, cor: form.cor } : c));
    } else {
      const newCat: Categoria = {
        id: `CAT-${Date.now()}`,
        nome: form.nome,
        cor: form.cor,
        totalCursos: 0,
      };
      setCategorias([...categorias, newCat]);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    setCategorias(cats => cats.filter(c => c.id !== id));
  }

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Categorias de Cursos</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Organize os cursos por categoria</p>
        </div>
        <button onClick={openNewModal} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: <Tag size={18} />, label: "Total categorias", value: categorias.length, bg: "#EEF2FA", color: NAVY },
          { icon: <BookOpen size={18} />, label: "Total cursos", value: categorias.reduce((a, c) => a + c.totalCursos, 0), bg: "#DCFCE7", color: "#16A34A" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ color: "#6B7280", fontSize: 11, fontWeight: 500 }}>{s.label}</div>
              <div style={{ color: "#111827", fontSize: "1.1rem", fontWeight: 700 }}>{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categorias.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.cor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Tag size={18} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#0D2545", fontSize: 14 }}>{cat.nome}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{cat.totalCursos} curso{cat.totalCursos !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEditModal(cat)} style={{ padding: "6px 10px", background: "#F3F4F6", border: "none", borderRadius: 6, cursor: "pointer", color: "#374151" }}>
                  <Edit3 size={14} />
                </button>
                {cat.totalCursos === 0 && (
                  <button onClick={() => handleDelete(cat.id)} style={{ padding: "6px 10px", background: "#FEE2E2", border: "none", borderRadius: 6, cursor: "pointer", color: "#DC2626" }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <motion.div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <motion.div style={{ background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 400 }}
            initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>{editId ? "Editar Categoria" : "Nova Categoria"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nome da categoria</label>
              <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="Ex: Teologia" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Cor</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["#1D4ED8", "#16A34A", "#CA8A04", "#DC2626", "#7C3AED", "#DB2777"].map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, cor: c }))}
                    style={{ width: 32, height: 32, borderRadius: 8, background: c, border: form.cor === c ? "3px solid #111827" : "2px solid #E5E7EB", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleSave} style={{ flex: 1, padding: "10px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                <Check size={16} style={{ marginRight: 6 }} /> Salvar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
