"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Church, Plus, MapPin, User, Users, Eye, Pencil, Trash2 } from "lucide-react";

interface Congregation {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  pastor: { id: string; name: string } | null;
  _count: { members: number };
}

export default function CongregacoesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Congregation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/congregacoes");
      const d = await res.json() as { congregations?: Congregation[] };
      setItems(d.congregations ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: string) {
    await fetch(`/api/congregacoes?id=${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    fetchData();
  }

  return (
    <div className="page-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", display: "flex", alignItems: "center", gap: 10 }}>
            <Church size={26} /> Congregações
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, marginTop: 4 }}>Gerencie as congregações vinculadas à sua igreja</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/congregacoes/novo")}
          style={{ padding: "10px 20px", background: "linear-gradient(135deg, #1A3C6E, #1E4A84)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={16} /> Nova Congregação
        </motion.button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: 20, height: 160, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", opacity: 0.6 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: "white", borderRadius: 16, padding: 48, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <Church size={48} color="#CBD5E1" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Nenhuma congregação cadastrada</h3>
          <p style={{ color: "#9CA3AF", fontSize: 14, marginBottom: 20 }}>As congregações são opcionais. Cadastre uma para organizar membros, cultos e finanças por unidade.</p>
          <button onClick={() => router.push("/congregacoes/novo")} style={{ padding: "10px 20px", background: "#1A3C6E", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            + Cadastrar primeira congregação
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {items.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#0D2545", marginBottom: 12 }}>{c.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {(c.address || c.city) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280" }}>
                    <MapPin size={14} /> {[c.address, c.city].filter(Boolean).join(", ")}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280" }}>
                  <User size={14} /> Pastor: {c.pastor?.name ?? "—"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7280" }}>
                  <Users size={14} /> {c._count.members} {c._count.members === 1 ? "membro" : "membros"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => router.push(`/congregacoes/${c.id}`)} style={{ flex: 1, padding: "8px 12px", background: "#EFF6FF", color: "#1A3C6E", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Eye size={14} /> Detalhes
                </button>
                <button onClick={() => router.push(`/congregacoes/${c.id}?edit=1`)} style={{ padding: "8px 12px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Pencil size={14} /> Editar
                </button>
                <button onClick={() => setDeleteConfirm(c.id)} style={{ padding: "8px 10px", background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 28, maxWidth: 400, width: "90%" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0D2545", marginBottom: 10 }}>Excluir congregação?</h3>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 20 }}>Os membros, cultos e lançamentos vinculados serão desvinculados, mas não excluídos.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "8px 16px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "8px 16px", background: "#DC2626", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
