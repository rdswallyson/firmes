"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, QrCode, Users, Clock, CheckCircle, Trash2, Eye } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Culto {
  id: string;
  titulo: string;
  data: string;
  ativo: boolean;
  qrCode: string;
  _count: { checkins: number };
}

export default function CultosPage() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cultos").then(r => r.json()).then(d => setCultos(d.cultos || [])).finally(() => setLoading(false));
  }, []);

  const deletar = async (id: string) => {
    if (!confirm("Excluir este culto?")) return;
    await fetch(`/api/cultos/${id}`, { method: "DELETE" });
    setCultos(cultos.filter(c => c.id !== id));
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Cultos & Check-in</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Gerencie cultos e registre presenças com QR Code</p>
        </div>
        <Link href="/cultos/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <Plus size={16} /> Novo Culto
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : cultos.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <QrCode size={48} style={{ margin: "0 auto 16px", color: "#D1D5DB" }} />
          <p style={{ color: "#9CA3AF", margin: "0 0 16px" }}>Nenhum culto cadastrado</p>
          <Link href="/cultos/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            <Plus size={14} /> Criar primeiro culto
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {cultos.map((culto, i) => (
            <motion.div key={culto.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: culto.ativo ? "#EEF2FA" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: culto.ativo ? NAVY : "#9CA3AF", flexShrink: 0 }}>
                <QrCode size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0D2545" }}>{culto.titulo}</h3>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={13} /> {new Date(culto.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={13} /> {culto._count.checkins} presentes
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {culto.ativo ? (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#16A34A", display: "flex", alignItems: "center", gap: 3 }}><CheckCircle size={13} /> Ativo</span>
                ) : (
                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>Encerrado</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/cultos/${culto.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 12px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                  <Eye size={14} /> Painel
                </Link>
                <button onClick={() => deletar(culto.id)} style={{ display: "inline-flex", alignItems: "center", padding: 7, background: "#FEE2E2", color: "#DC2626", borderRadius: 8, border: "none", cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
