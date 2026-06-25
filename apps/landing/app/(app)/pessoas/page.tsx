"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Search, Download, ChevronLeft, ChevronRight,
  Eye, Pencil, UserX, Trash2, Link2, Filter, X, Upload,
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
  congregationId: string | null;
  isActive: boolean;
  memberSince: string;
}

const NAVY = "#1B2B4B";
const GOLD = "#C9993F";
const BG = "#F5F0EB";

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  ACTIVE: { label: "Ativo", bg: "#DCFCE7", color: "#16A34A", dot: "#22C55E" },
  VISITOR: { label: "Visitante", bg: "#DBEAFE", color: "#2563EB", dot: "#3B82F6" },
  INACTIVE: { label: "Inativo", bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444" },
  PENDING: { label: "Pendente", bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B" },
};

function avatarColor(name: string) {
  const hue = name.charCodeAt(0) * 7 % 360;
  return { bg: `hsl(${hue}, 55%, 88%)`, color: `hsl(${hue}, 45%, 32%)` };
}

export default function PessoasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const congregationIdFromUrl = searchParams.get("congregacao");
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [congregationsMap, setCongregationsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (congregationIdFromUrl) params.set("congregationId", congregationIdFromUrl);

    try {
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json() as { members: Member[]; total: number; totalPages: number };
      setMembers(data.members ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      fetch("/api/congregacoes")
        .then(r => r.json())
        .then((d: { congregations?: { id: string; name: string }[] }) => {
          const map: Record<string, string> = {};
          d.congregations?.forEach((c: { id: string; name: string }) => { map[c.id] = c.name; });
          setCongregationsMap(map);
        })
        .catch(() => null);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, congregationIdFromUrl]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); }, 0);
    return () => clearTimeout(timer);
  }, [search, statusFilter, congregationIdFromUrl]);

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

  const ativos = members.filter(m => m.status === "ACTIVE").length;
  const visitantes = members.filter(m => m.status === "VISITOR").length;
  const pendentes = members.filter(m => m.status === "PENDING").length;

  const stats = [
    { label: "Total", sub: "Todos os membros", value: total, icon: <Users size={22} strokeWidth={1.5} />, color: NAVY, bg: "#E8EDF5" },
    { label: "Ativos", sub: "Membros ativos", value: ativos, icon: <Users size={22} strokeWidth={1.5} />, color: "#16A34A", bg: "#DCFCE7" },
    { label: "Visitantes", sub: "Visitantes recentes", value: visitantes, icon: <Users size={22} strokeWidth={1.5} />, color: "#2563EB", bg: "#DBEAFE" },
    { label: "Pendentes", sub: "Aguardando aprovação", value: pendentes, icon: <Users size={22} strokeWidth={1.5} />, color: "#D97706", bg: "#FEF3C7" },
  ];

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <Users size={18} strokeWidth={1.5} />
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: NAVY, margin: 0 }}>Gestão de Membros</h1>
          </div>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>
            {total} membros cadastrados &nbsp;&bull;&nbsp; {ativos} ativos
          </p>
          {congregationIdFromUrl && congregationsMap[congregationIdFromUrl] && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.8rem", color: NAVY, background: "#E8EDF5", padding: "3px 10px", borderRadius: 8, fontWeight: 600 }}>
                Filtrando por: {congregationsMap[congregationIdFromUrl]}
              </span>
              <button onClick={() => router.push("/pessoas")} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 2 }}>
                <X size={12} /> remover
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => {}} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", color: "#374151", fontWeight: 500 }}>
            <Upload size={16} strokeWidth={1.5} /> Importar
          </button>
          <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", color: "#374151", fontWeight: 500 }}>
            <Download size={16} strokeWidth={1.5} /> Exportar
          </button>
          <button onClick={() => router.push("/pessoas/novo")} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", background: GOLD, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 700 }}>
            <UserPlus size={16} strokeWidth={1.5} /> Novo Membro
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: "white", borderRadius: "12px", padding: "1.1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "0.875rem", borderTop: `3px solid ${s.color}` }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>{s.label}</div>
              <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and filters */}
      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: "1.5rem" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou telefone..."
              style={{ width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.25rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "#FAFAFA" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = NAVY; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.6rem 0.875rem", background: showFilters ? NAVY : "#F3F4F6", color: showFilters ? "white" : "#374151", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8375rem", fontWeight: 500 }}>
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
                {["Membro", "Contato", "Cargo", "Congregação", "Status", "Membro desde", "Ações"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.85rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum membro encontrado</td></tr>
              ) : members.map((m) => {
                const st = STATUS_LABEL[m.status] ?? { label: m.status, bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" };
                const av = avatarColor(m.name);
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid #F9FAFB", transition: "background 0.1s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: m.photo ? `url(${m.photo}) center/cover` : av.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: m.photo ? "transparent" : av.color, flexShrink: 0 }}>
                          {!m.photo && m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>{m.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{m.email ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{m.phone ?? "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#374151" }}>{m.role ?? "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ background: congregationsMap[m.congregationId || ""] ? "#E0E7FF" : "#F3F4F6", color: congregationsMap[m.congregationId || ""] ? "#4338CA" : "#9CA3AF", fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "3px 10px" }}>
                        {congregationsMap[m.congregationId || ""] ?? "Sede"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: st.bg, color: st.color, fontSize: "0.7rem", fontWeight: 600, borderRadius: "10px", padding: "3px 10px" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot }} />
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6B7280", fontSize: "0.8rem" }}>{new Date(m.memberSince).toLocaleDateString("pt-BR")}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button onClick={() => router.push(`/pessoas/${m.id}`)} title="Ver" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F4F6", border: "none", cursor: "pointer", borderRadius: "6px", color: "#6B7280" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#E5E7EB"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; }}>
                          <Eye size={14} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => router.push(`/pessoas/${m.id}/editar`)} title="Editar" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F4F6", border: "none", cursor: "pointer", borderRadius: "6px", color: "#6B7280" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#E5E7EB"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; }}>
                          <Pencil size={14} strokeWidth={1.5} />
                        </button>
                        <button onClick={() => { setDeleteConfirm(m.id); }} title="Inativar" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F4F6", border: "none", cursor: "pointer", borderRadius: "6px", color: "#DC2626" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#FEE2E2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; }}>
                          <UserX size={14} strokeWidth={1.5} />
                        </button>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ padding: "0.35rem 0.65rem", background: page === p ? NAVY : "white", color: page === p ? "white" : "#374151", border: "1px solid #E5E7EB", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                  {p}
                </button>
              ))}
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
