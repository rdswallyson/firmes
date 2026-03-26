"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserX, RefreshCw, MessageCircle, Mail, Search } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  status: string;
  role: string | null;
  memberSince: string;
}

export default function InativosPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/members?status=INACTIVE&limit=100")
      .then((r) => r.json())
      .then((d: { members: Member[] }) => setMembers(d.members ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function handleReactivate(id: string) {
    await fetch(`/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE", isActive: true }),
    });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>
          <UserX size={22} strokeWidth={1.5} style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
          Inativos / Ausentes
        </h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "2px 0 0" }}>Membros inativos ou sem check-in há mais de 30 dias</p>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ flex: "0 0 200px", background: "white", borderRadius: "10px", padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: "#FEE2E214", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}>
            <UserX size={20} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>{members.length}</div>
            <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>Inativos</div>
          </div>
        </motion.div>
      </div>

      <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ position: "relative", maxWidth: "400px" }}>
            <Search size={16} strokeWidth={1.5} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar inativo..."
              style={{ width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.25rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "#FAFAFA" }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>
            {members.length === 0 ? "Nenhum membro inativo" : "Nenhum resultado"}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                {["Membro", "Telefone", "Cargo", "Membro desde", "Ações"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.75rem 1rem", color: "#9CA3AF", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #F9FAFB" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFAFA"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}>
                  <td style={{ padding: "0.625rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: `hsl(${m.name.charCodeAt(0) * 7},55%,82%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: `hsl(${m.name.charCodeAt(0) * 7},40%,30%)`, flexShrink: 0, opacity: 0.6 }}>
                        {m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: "#374151" }}>{m.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{m.email ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.625rem 1rem", color: "#374151" }}>{m.phone ?? "—"}</td>
                  <td style={{ padding: "0.625rem 1rem", color: "#374151" }}>{m.role ?? "—"}</td>
                  <td style={{ padding: "0.625rem 1rem", color: "#6B7280" }}>{new Date(m.memberSince).toLocaleDateString("pt-BR")}</td>
                  <td style={{ padding: "0.625rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button onClick={() => handleReactivate(m.id)} title="Reativar" style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "#DCFCE7", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#16A34A", fontSize: "0.75rem", fontWeight: 500 }}>
                        <RefreshCw size={13} strokeWidth={1.5} /> Reativar
                      </button>
                      {m.phone && (
                        <a href={`https://wa.me/${m.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#16A34A", display: "flex" }}>
                          <MessageCircle size={15} strokeWidth={1.5} />
                        </a>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}`} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#2563EB", display: "flex" }}>
                          <Mail size={15} strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
