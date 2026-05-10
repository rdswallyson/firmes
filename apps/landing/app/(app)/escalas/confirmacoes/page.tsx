"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Clock, Music, Headphones, Users, DoorOpen, Baby, RefreshCw } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

const MINISTERIO_INFO: Record<string, { label: string; color: string }> = {
  LOUVOR: { label: "Louvor", color: "#7C3AED" },
  SOM: { label: "Som", color: "#2563EB" },
  RECEPCAO: { label: "Recepção", color: "#16A34A" },
  PORTARIA: { label: "Portaria", color: "#DC2626" },
  INFANTIL: { label: "Infantil", color: "#EA580C" },
};

const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
  PENDENTE: { label: "Aguardando", color: "#D97706", bg: "#FEF3C7" },
  CONFIRMADO: { label: "Confirmado", color: "#16A34A", bg: "#DCFCE7" },
  RECUSADO: { label: "Recusado", color: "#DC2626", bg: "#FEE2E2" },
};

interface EscalaMembro {
  id: string;
  funcao: string;
  status: string;
  createdAt: string;
  member: { id: string; name: string; photo?: string; phone?: string };
}

interface Escala {
  id: string;
  titulo: string;
  data: string;
  ministerio: string;
  observacoes?: string;
  status: string;
  membros: EscalaMembro[];
}

export default function ConfirmacoesPage() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"TODOS" | "PENDENTE" | "CONFIRMADO" | "RECUSADO">("PENDENTE");
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/escalas");
      const data = await res.json();
      setEscalas(data.escalas || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const atualizarStatus = async (escalaId: string, membroId: string, novoStatus: string) => {
    setAtualizando(membroId);
    try {
      await fetch(`/api/escalas/${escalaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membros: [{ id: membroId, status: novoStatus }] }),
      });
      setEscalas(prev => prev.map(e =>
        e.id === escalaId
          ? { ...e, membros: e.membros.map(m => m.id === membroId ? { ...m, status: novoStatus } : m) }
          : e
      ));
    } catch {
      alert("Erro ao atualizar status");
    } finally {
      setAtualizando(null);
    }
  };

  // Filtrar membros conforme o filtro selecionado
  const escalasComFiltro = escalas
    .map(e => ({
      ...e,
      membros: filtro === "TODOS" ? e.membros : e.membros.filter(m => m.status === filtro),
    }))
    .filter(e => e.membros.length > 0);

  // Totais
  const todos = escalas.flatMap(e => e.membros);
  const pendentes = todos.filter(m => m.status === "PENDENTE").length;
  const confirmados = todos.filter(m => m.status === "CONFIRMADO").length;
  const recusados = todos.filter(m => m.status === "RECUSADO").length;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 900, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Confirmações de Escala</h1>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>Gerencie as confirmações e recusas dos membros escalados</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={carregar} disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
            <RefreshCw size={14} /> Atualizar
          </button>
          <Link href="/escalas/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Nova Escala
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Aguardando", count: pendentes, color: "#D97706", bg: "#FEF3C7", icon: <Clock size={18} /> },
          { label: "Confirmados", count: confirmados, color: "#16A34A", bg: "#DCFCE7", icon: <Check size={18} /> },
          { label: "Recusados", count: recusados, color: "#DC2626", bg: "#FEE2E2", icon: <X size={18} /> },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["PENDENTE", "CONFIRMADO", "RECUSADO", "TODOS"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ padding: "7px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: filtro === f ? NAVY : "#F3F4F6", color: filtro === f ? "#fff" : "#6B7280" }}>
            {f === "TODOS" ? "Todos" : (STATUS_INFO[f]?.label ?? f)}
            {f === "PENDENTE" && pendentes > 0 && (
              <span style={{ marginLeft: 6, background: "#DC2626", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11 }}>
                {pendentes}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Carregando...</div>
      ) : escalasComFiltro.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <Clock size={40} color="#D1D5DB" style={{ margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "#9CA3AF", fontSize: 14 }}>
            {filtro === "PENDENTE" ? "Nenhuma confirmação pendente" : "Nenhum registro encontrado"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {escalasComFiltro.map(escala => {
            const min = MINISTERIO_INFO[escala.ministerio] || { label: escala.ministerio, color: "#6B7280" };
            const dataEscala = new Date(escala.data);
            return (
              <div key={escala.id} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                {/* Cabeçalho da escala */}
                <div style={{ background: min.color + "12", borderBottom: `1px solid ${min.color}30`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: min.color, color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{min.label}</span>
                      <Link href={`/escalas`} style={{ fontSize: 15, fontWeight: 700, color: "#0D2545", textDecoration: "none" }}>{escala.titulo}</Link>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
                      {dataEscala.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} às{" "}
                      {dataEscala.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "#6B7280" }}>{escala.membros.length} membro(s)</span>
                </div>

                {/* Membros */}
                <div>
                  {escala.membros.map((m, idx) => {
                    const st = STATUS_INFO[m.status] ?? { label: m.status, color: '#6B7280', bg: '#F3F4F6' };
                    return (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px",
                        borderBottom: idx < escala.membros.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                        {/* Avatar */}
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#E5E7EB", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {m.member.photo
                            ? <img src={m.member.photo} alt={m.member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <span style={{ fontSize: 14, fontWeight: 700, color: "#9CA3AF" }}>{m.member.name.charAt(0)}</span>
                          }
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#0D2545" }}>{m.member.name}</div>
                          <div style={{ fontSize: 12, color: "#6B7280" }}>{m.funcao}</div>
                        </div>

                        {/* Status badge */}
                        <span style={{ background: st.bg, color: st.color, borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                          {st.label}
                        </span>

                        {/* Ações (apenas se PENDENTE) */}
                        {m.status === "PENDENTE" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => atualizarStatus(escala.id, m.id, "CONFIRMADO")}
                              disabled={atualizando === m.id}
                              title="Confirmar"
                              style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#DCFCE7", color: "#16A34A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Check size={14} />
                            </button>
                            <button onClick={() => atualizarStatus(escala.id, m.id, "RECUSADO")}
                              disabled={atualizando === m.id}
                              title="Recusar"
                              style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#FEE2E2", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        {/* Desfazer se confirmado/recusado */}
                        {m.status !== "PENDENTE" && (
                          <button onClick={() => atualizarStatus(escala.id, m.id, "PENDENTE")}
                            disabled={atualizando === m.id}
                            title="Reverter para pendente"
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <RefreshCw size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
