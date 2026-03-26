"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Search, Download, ChevronLeft, ChevronRight,
  Eye, Pencil, UserX, Trash2, Link2, Filter, X,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  status: string;
  role: string | null;
  groupId: string | null;
  isActive: boolean;
  memberSince: string;
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Ativo", bg: "#DCFCE7", color: "#16A34A" },
  VISITOR: { label: "Visitante", bg: "#DBEAFE", color: "#2563EB" },
  INACTIVE: { label: "Inativo", bg: "#FEE2E2", color: "#DC2626" },
  PENDING: { label: "Pendente", bg: "#FEF3C7", color: "#D97706" },
};

export default function PessoasPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json() as { members: Member[]; total: number; totalPages: number };
      setMembers(data.members ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); }, 0);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  async function handleInactivate(id: string) {
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    fetchMembers();
  }

  async function handleExport() {
    const res = await fetch("/api/members/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `membros-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = [
    { label: "Total", value: total, icon: <Users size={20} strokeWidth={1.5} />, color: "#1A3C6E" },
    { label: "Ativos", value: members.filter(m => m.status === "ACTIVE").length, icon: <Users size={20} strokeWidth={1.5} />, color: "#16A34A" },
    { label: "Visitantes", value: members.filter(m => m.status === "VISITOR").length, icon: <Users size={20} strokeWidth={1.5} />, color: "#2563EB" },
    { label: "Inativos", value: members.filter(m => m.status === "INACTIVE").length, icon: <UserX size={20} strokeWidth={1.5} />, color: "#DC2626" },
  ];

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Pessoas</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Gerencie os membros da sua igreja</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", color: "#374151" }}>
            <Download size={16} strokeWidth={1.5} /> Exportar CSV
          </button>
          <button onClick={() => router.push("/pessoas/novo")} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 600 }}>
            <UserPlus size={16} strokeWidth={1.5} /> Novo Membro
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ flex: 1, background: "white", borderRadius: "10px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and filters */}
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou telefone..."
              style={{ width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.25rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "#FAFAFA" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1A3C6E"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 0.875rem", background: showFilters ? "#1A3C6E" : "#F3F4F6", color: showFilters ? "white" : "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem" }}>
            <Filter size={15} strokeWidth={1.5} /> Filtros
          </button>
        </div>

        {showFilters && (
          <div style={{ padding: "0.75rem 1.25rem", background: "#FAFAFA", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "0.5rem 0.75rem", border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "0.8375rem", background: "white" }}>
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="VISITOR">Visitante</option>
              <option value="INACTIVE">Inativo</option>
              <option value="PENDING">Pendente</option>
            </select>
            {(statusFilter) && (
              <button onClick={() => { setStatusFilter(""); }} style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: "0.8rem" }}>
                <X size={14} /> Limpar
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                {["Membro", "Telefone", "Cargo", "Status", "Membro desde", "Ações"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum membro encontrado</td></tr>
              ) : members.map((m) => {
                const st = STATUS_LABEL[m.status] ?? { label: m.status, bg: "#F3F4F6", color: "#6B7280" };
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #F9FAFB", transition: "background 0.1s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: m.photo ? `url(${m.photo}) center/cover` : `hsl(${m.name.charCodeAt(0) * 7},55%,82%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: `hsl(${m.name.charCodeAt(0) * 7},40%,30%)`, flexShrink: 0 }}>
                          {!m.photo && m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: "#111827" }}>{m.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{m.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.625rem 1rem", color: "#374151" }}>{m.phone ?? "—"}</td>
                    <td style={{ padding: "0.625rem 1rem", color: "#374151" }}>{m.role ?? "—"}</td>
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <span style={{ background: st.bg, color: st.color, fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "2px 8px" }}>{st.label}</span>
                    </td>
                    <td style={{ padding: "0.625rem 1rem", color: "#6B7280" }}>{new Date(m.memberSince).toLocaleDateString("pt-BR")}</td>
                    <td style={{ padding: "0.625rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button onClick={() => router.push(`/pessoas/${m.id}`)} title="Ver" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#6B7280" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                          <Eye size={15} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => router.push(`/pessoas/${m.id}/editar`)} title="Editar" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#6B7280" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                          <Pencil size={15} strokeWidth={1.5} />
                        </button>
                        {m.status !== "INACTIVE" && (
                          <button onClick={() => { setDeleteConfirm(m.id); }} title="Inativar" style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#DC2626" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                            <UserX size={15} strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>Mostrando {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} de {total}</span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "0.4rem", background: page <= 1 ? "#F3F4F6" : "white", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: page <= 1 ? "default" : "pointer", display: "flex" }}>
                <ChevronLeft size={16} />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "0.4rem", background: page >= totalPages ? "#F3F4F6" : "white", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: page >= totalPages ? "default" : "pointer", display: "flex" }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm inactivate modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", maxWidth: "380px", width: "100%" }}>
            <h3 style={{ margin: "0 0 0.5rem", color: "#0D2545", fontSize: "1.1rem" }}>Inativar membro?</h3>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>O membro será marcado como inativo mas não será excluído permanentemente.</p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "0.65rem", background: "#F3F4F6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>Cancelar</button>
              <button onClick={() => { handleInactivate(deleteConfirm); setDeleteConfirm(null); }} style={{ flex: 1, padding: "0.65rem", background: "#DC2626", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 500 }}>Inativar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
