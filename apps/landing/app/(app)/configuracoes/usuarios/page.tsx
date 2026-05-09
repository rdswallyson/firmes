"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Shield, ShieldCheck, ShieldAlert, User, Save, X } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

const ROLES = [
  { id: "ADMIN", label: "Administrador", desc: "Acesso total ao painel", icon: <Shield size={16} />, color: "#DC2626" },
  { id: "TESOUREIRO", label: "Tesoureiro", desc: "Apenas módulo financeiro", icon: <ShieldCheck size={16} />, color: "#16A34A" },
  { id: "SECRETARIA", label: "Secretaria", desc: "Membros e eventos (sem financeiro)", icon: <ShieldCheck size={16} />, color: "#2563EB" },
  { id: "LIDER_CELULA", label: "Líder de Célula", desc: "Apenas o grupo dele", icon: <ShieldAlert size={16} />, color: "#CA8A04" },
  { id: "MEMBRO", label: "Membro", desc: "Apenas app do membro", icon: <User size={16} />, color: "#6B7280" },
];

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [novaRole, setNovaRole] = useState("");

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(d => setUsuarios(d.users || [])).finally(() => setLoading(false));
  }, []);

  const salvarRole = async (userId: string) => {
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: novaRole }),
    });
    setUsuarios(usuarios.map(u => u.id === userId ? { ...u, role: novaRole } : u));
    setEditando(null);
  };

  const toggleAtivo = async (userId: string, ativo: boolean) => {
    await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ativo }),
    });
    setUsuarios(usuarios.map(u => u.id === userId ? { ...u, isActive: !ativo } : u));
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Permissões de Usuários</h1>
        <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Controle quem acessa cada área do sistema</p>
      </div>

      {/* Legendas */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {ROLES.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: r.color + "12", borderRadius: 8 }}>
            <span style={{ color: r.color }}>{r.icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: r.color }}>{r.label}</span>
          </div>
        ))}
      </div>

      {/* Lista */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Usuário", "E-mail", "Role", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => {
                const roleInfo = ROLES.find(r => r.id === u.role) || ROLES[4];
                const isEdit = editando === u.id;
                return (
                  <tr key={u.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EEF2FA", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: NAVY }}>
                          {(u.name?.[0] || "?").toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#0D2545" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B7280" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {isEdit ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <select value={novaRole} onChange={e => setNovaRole(e.target.value)}
                            style={{ padding: "5px 8px", border: "1.5px solid #E5E7EB", borderRadius: 6, fontSize: 12, outline: "none" }}>
                            {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                          </select>
                          <button onClick={() => salvarRole(u.id)} style={{ padding: "4px 8px", background: "#16A34A", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}><Save size={12} /></button>
                          <button onClick={() => setEditando(null)} style={{ padding: "4px 8px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 5, cursor: "pointer" }}><X size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditando(u.id); setNovaRole(u.role); }}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: (roleInfo?.color || "#6B7280") + "12", color: roleInfo?.color || "#6B7280", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          {roleInfo?.icon || <User size={16} />} {roleInfo?.label || u.role}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => toggleAtivo(u.id, u.isActive)}
                        style={{ padding: "4px 10px", background: u.isActive ? "#DCFCE7" : "#FEE2E2", color: u.isActive ? "#16A34A" : "#DC2626", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        {u.isActive ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
