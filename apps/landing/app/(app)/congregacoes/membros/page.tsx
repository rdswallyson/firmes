"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Search, ChevronLeft, ChevronRight, Eye, Pencil } from "lucide-react";

interface Congregation {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  status: string;
  role: string | null;
  congregationId: string | null;
  memberSince: string;
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Ativo", bg: "#DCFCE7", color: "#16A34A" },
  VISITOR: { label: "Visitante", bg: "#DBEAFE", color: "#2563EB" },
  INACTIVE: { label: "Inativo", bg: "#FEE2E2", color: "#DC2626" },
  PENDING: { label: "Pendente", bg: "#FEF3C7", color: "#D97706" },
};

export default function CongregacaoMembrosPage() {
  const router = useRouter();
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [selectedCongregation, setSelectedCongregation] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Buscar congregações
  useEffect(() => {
    fetch("/api/congregacoes")
      .then(r => r.json())
      .then((d: { congregations?: Congregation[] }) => {
        const list = d.congregations ?? [];
        setCongregations(list);
      })
      .catch(() => null);
  }, []);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search.trim()) params.set("search", search.trim());
    if (selectedCongregation) {
      params.set("congregationId", selectedCongregation === "sede" ? "sede" : selectedCongregation);
    }

    try {
      const res = await fetch(`/api/members?${params}`);
      const data = await res.json() as { members: Member[]; totalPages: number };
      setMembers(data.members ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCongregation]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const groupedMembers = selectedCongregation === ""
    ? Object.entries(
        members.reduce((acc, m) => {
          const key = m.congregationId ?? "sede";
          if (!acc[key]) acc[key] = [];
          acc[key].push(m);
          return acc;
        }, {} as Record<string, Member[]>)
      ).map(([congId, list]) => ({
        congName: congId === "sede" ? "Sede" : congregations.find(c => c.id === congId)?.name ?? "Sede",
        list,
      }))
    : [{ congName: "", list: members }];

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Membros por Congregação</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Filtre os membros da sua igreja</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={selectedCongregation}
            onChange={(e) => { setSelectedCongregation(e.target.value); setPage(1); }}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 14, minWidth: 180 }}
          >
            <option value="">Todas</option>
            <option value="sede">Sede</option>
            {congregations.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 14 }}
          />
        </div>
      </div>

      {groupedMembers.map((group) => (
        <div key={group.congName || "single"} style={{ marginBottom: 24 }}>
          {group.congName && (
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0D2545", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} /> {group.congName} <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 400 }}>({group.list.length})</span>
            </h3>
          )}
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Membro", "Telefone", "Cargo", "Status", "Membro desde", "Ações"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</td></tr>
                ) : group.list.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Nenhum membro encontrado</td></tr>
                ) : group.list.map(m => {
                  const st = STATUS_LABEL[m.status] ?? { label: m.status, bg: "#F3F4F6", color: "#374151" };
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: 10 }}>
                        {m.photo ? <img src={m.photo} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#1A3C6E", fontSize: 12, fontWeight: 700 }}>{m.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>}
                        <div>
                          <div style={{ fontWeight: 600, color: "#374151" }}>{m.name}</div>
                          {m.email && <div style={{ fontSize: 12, color: "#9CA3AF" }}>{m.email}</div>}
                        </div>
                      </td>
                      <td style={{ padding: "0.625rem 1rem", color: "#374151" }}>{m.phone ?? "—"}</td>
                      <td style={{ padding: "0.625rem 1rem", color: "#374151" }}>{m.role ?? "—"}</td>
                      <td style={{ padding: "0.625rem 1rem" }}><span style={{ background: st.bg, color: st.color, fontSize: "0.75rem", fontWeight: 600, borderRadius: 10, padding: "2px 10px" }}>{st.label}</span></td>
                      <td style={{ padding: "0.625rem 1rem", color: "#6B7280", fontSize: 13 }}>{new Date(m.memberSince).toLocaleDateString("pt-BR")}</td>
                      <td style={{ padding: "0.625rem 1rem" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => router.push(`/pessoas/${m.id}`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}><Eye size={16} /></button>
                          <button onClick={() => router.push(`/pessoas/${m.id}/editar`)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}><Pencil size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", cursor: page <= 1 ? "not-allowed" : "pointer" }}><ChevronLeft size={16} /></button>
          <span style={{ padding: "8px 16px", fontSize: 14, color: "#374151" }}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", cursor: page >= totalPages ? "not-allowed" : "pointer" }}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}
