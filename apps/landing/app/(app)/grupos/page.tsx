"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  MapPin,
  Clock,
  User,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

interface Grupo {
  id: string;
  name: string;
  description: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  address: string | null;
  leader: { id: string; name: string; photo: string | null } | null;
  _count: { members: number };
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchGrupos();
  }, [search]);

  async function fetchGrupos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/grupos?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setGrupos(data.grupos || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteGrupo(id: string) {
    if (!confirm("Tem certeza que deseja excluir este grupo?")) return;
    try {
      const res = await fetch(`/api/grupos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGrupos(grupos.filter((g) => g.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Grupos & Células</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Gerencie os grupos e células da igreja</p>
        </div>
        <Link href="/grupos/novo">
          <motion.button
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            <Plus size={18} strokeWidth={1.5} />
            Novo Grupo
          </motion.button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={18} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem 0.625rem 2.5rem",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6B7280" }}>Carregando...</div>
      ) : grupos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "12px", border: "1px dashed #E5E7EB" }}>
          <Users size={48} strokeWidth={1.5} color="#D1D5DB" style={{ marginBottom: "1rem" }} />
          <p style={{ color: "#6B7280", margin: 0 }}>Nenhum grupo encontrado</p>
          <Link href="/grupos/novo" style={{ color: "#1A3C6E", fontSize: "0.875rem", marginTop: "0.5rem", display: "inline-block" }}>
            Criar primeiro grupo
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {grupos.map((grupo) => (
            <motion.div
              key={grupo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.25rem",
                border: "1px solid #E5E7EB",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#0D2545", margin: 0 }}>{grupo.name}</h3>
                  {grupo.description && (
                    <p style={{ fontSize: "0.8rem", color: "#6B7280", margin: "0.25rem 0 0", lineHeight: 1.4 }}>{grupo.description}</p>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === grupo.id ? null : grupo.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: "#6B7280" }}
                  >
                    <MoreVertical size={18} strokeWidth={1.5} />
                  </button>
                  {menuOpen === grupo.id && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        background: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 10,
                        minWidth: "140px",
                      }}
                    >
                      <Link href={`/grupos/${grupo.id}`}>
                        <div style={{ padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
                          <Eye size={14} /> Ver detalhes
                        </div>
                      </Link>
                      <div
                        onClick={() => deleteGrupo(grupo.id)}
                        style={{ padding: "0.5rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#DC2626" }}
                      >
                        <Trash2 size={14} /> Excluir
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {grupo.leader && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                    <User size={14} strokeWidth={1.5} />
                    Líder: {grupo.leader.name}
                  </div>
                )}
                {(grupo.meetingDay || grupo.meetingTime) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                    <Clock size={14} strokeWidth={1.5} />
                    {grupo.meetingDay} {grupo.meetingTime && `às ${grupo.meetingTime}`}
                  </div>
                )}
                {grupo.address && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                    <MapPin size={14} strokeWidth={1.5} />
                    {grupo.address}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#6B7280" }}>
                  <Users size={14} strokeWidth={1.5} />
                  {grupo._count.members} membros
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
