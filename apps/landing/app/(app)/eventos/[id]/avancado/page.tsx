"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronLeft } from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Fase        { id: string; nome: string; ordem: number; status: string; dataInicio?: string; dataFim?: string; }
interface Equipe      { id: string; nome: string; funcao: string; responsavel?: string; }
interface CheckItem   { id: string; descricao: string; status: string; prazo?: string; }
interface Marco       { id: string; titulo: string; data: string; status: string; obs?: string; }
interface Recurso     { id: string; nome: string; quantidade: number; status: string; }
interface Refeicao    { id: string; nome: string; emoji?: string; modelo: "INCLUSA" | "AVULSA"; valor?: number; dias?: string[]; }
interface PontoCheckin { id: string; nome: string; tipo: string; qrToken: string; }

interface AvancadoData {
  fases?: Fase[];
  equipes?: Equipe[];
  checklist?: CheckItem[];
  marcos?: Marco[];
  recursos?: Recurso[];
  refeicoes?: Refeicao[];
  pontos?: PontoCheckin[];
}

type TabKey = "fases" | "equipes" | "checklist" | "marcos" | "recursos" | "refeicoes" | "pontos";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  PENDENTE:     { bg: "#F3F4F6", color: "#6B7280",  label: "Pendente" },
  CONFIRMADO:   { bg: "#DCFCE7", color: "#16A34A",  label: "Confirmado" },
  CONCLUIDO:    { bg: "#DCFCE7", color: "#16A34A",  label: "Concluído" },
  PARCIAL:      { bg: "#FEF9C3", color: "#CA8A04",  label: "Parcial" },
  EM_ANDAMENTO: { bg: "#FEF9C3", color: "#CA8A04",  label: "Em andamento" },
  FUTURO:       { bg: "#DBEAFE", color: "#1D4ED8",  label: "Futuro" },
};

const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

// ─── Sugestões por aba ───────────────────────────────────────────────────────
const SUGESTOES: Record<TabKey, string[]> = {
  fases: ["Planejamento", "Pré-evento", "Execução", "Pós-evento"],
  equipes: ["Louvor", "Mídia", "Recepção", "Segurança", "Logística", "Alimentação"],
  checklist: ["Confirmar local", "Notificar equipes", "Preparar materiais", "Divulgar evento"],
  marcos: ["Reunião de Planejamento", "Abertura de Inscrições", "Ensaio Geral", "Dia do Evento", "Relatório Final"],
  recursos: ["Sistema de Som", "Cadeiras", "Câmeras", "Datashow", "Transporte", "Coffee Break"],
  refeicoes: ["Café da Manhã ☕", "Almoço 🍽", "Lanche da Tarde 🍎", "Jantar 🌙"],
  pontos: ["Entrada Principal", "Entrada VIP", "Almoço", "Culto", "Lanche"],
};

// ─── Shared Styles ───────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px",
  border: "1.5px solid #E5E7EB", fontSize: "0.875rem", outline: "none",
  fontFamily: "var(--font-nunito), sans-serif", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: 600,
  color: "#374151", marginBottom: "0.3rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "0.6rem 1rem", color: "#9CA3AF",
  fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "0.65rem 1rem", fontSize: "0.8375rem", color: "#374151", borderBottom: "1px solid #F3F4F6",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: "14px", width: "100%", maxWidth: "480px",
  maxHeight: "88vh", overflowY: "auto", padding: "2rem",
  boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "var(--font-nunito), sans-serif",
};

const btnPrimary: React.CSSProperties = {
  background: "#1A3C6E", color: "#FFF", border: "none",
  padding: "0.55rem 1.1rem", borderRadius: "8px", fontWeight: 700,
  fontSize: "0.83rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem",
  fontFamily: "var(--font-nunito), sans-serif",
};

// ─── Helper Components ────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const b = STATUS_BADGE[status] ?? STATUS_BADGE.PENDENTE ?? { label: status, bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ background: b.bg, color: b.color, padding: "0.18rem 0.55rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
      {b.label}
    </span>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFF", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {children}
      </table>
    </div>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr><td colSpan={cols} style={{ ...tdStyle, textAlign: "center", color: "#9CA3AF", padding: "2rem" }}>Nenhum item cadastrado.</td></tr>
  );
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AvancadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const [tab, setTab] = useState<TabKey>("fases");
  const [data, setData] = useState<AvancadoData>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generic form state (different keys per tab)
  const [form, setForm] = useState<Record<string, string | boolean | string[]>>({});

  const tabs: { key: TabKey; label: string }[] = [
    { key: "fases",     label: "Etapas" },
    { key: "equipes",   label: "Equipes" },
    { key: "checklist", label: "Checklist" },
    { key: "marcos",    label: "Cronograma" },
    { key: "recursos",  label: "Recursos" },
    { key: "refeicoes", label: "Refeições" },
    { key: "pontos",    label: "Pontos de Check-in" },
  ];

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/eventos/${id}/avancado`);
      if (!res.ok) throw new Error("Failed to fetch");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("[fetchData] error:", err);
    } finally {
      setLoading(false);
    }
  }

  function openModal() { setForm({}); setShowModal(true); }

  // Mapeamento de tab para action da API
  const tabToAction: Record<TabKey, string> = {
    fases: "fase",
    equipes: "equipe",
    checklist: "checklist",
    marcos: "marco",
    recursos: "recurso",
    refeicoes: "refeicao",
    pontos: "ponto",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const action = tabToAction[tab];
      const res = await fetch(`/api/eventos/${id}/avancado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...form }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("[handleSubmit] POST failed:", res.status, errData);
        alert("Erro ao salvar: " + (errData.error || "Verifique os campos obrigatórios"));
        return;
      }
      const created = await res.json();
      console.log("[handleSubmit] created:", created);
      
      // Atualização otimista - adiciona o item na lista localmente
      setData(prev => {
        const key = tab as keyof AvancadoData;
        const current = (prev[key] as any[]) || [];
        return { ...prev, [key]: [...current, created] };
      });
      
      setShowModal(false);
      setForm({});
      
      // Refetch para garantir sincronização com o servidor
      await fetchData();
    } catch (err) {
      console.error("[handleSubmit] error:", err);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function set(key: string, value: string | boolean | string[]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  // ─── Tab Content ─────────────────────────────────────────────────────────

  function renderFases() {
    const items = data.fases ?? [];
    return (
      <TableWrap>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
            {["Nome", "Ordem", "Status", "Início", "Fim"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? <EmptyRow cols={5} /> : items.map(f => (
            <tr key={f.id}>
              <td style={tdStyle}>{f.nome}</td>
              <td style={tdStyle}>{f.ordem}</td>
              <td style={tdStyle}><Badge status={f.status} /></td>
              <td style={tdStyle}>{fmtDate(f.dataInicio)}</td>
              <td style={tdStyle}>{fmtDate(f.dataFim)}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    );
  }

  function renderEquipes() {
    const items = data.equipes ?? [];
    return (
      <TableWrap>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
            {["Nome", "Função", "Responsável"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? <EmptyRow cols={3} /> : items.map(e => (
            <tr key={e.id}>
              <td style={tdStyle}>{e.nome}</td>
              <td style={tdStyle}>{e.funcao}</td>
              <td style={tdStyle}>{e.responsavel ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    );
  }

  function renderChecklist() {
    const items = data.checklist ?? [];
    return (
      <TableWrap>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
            {["Descrição", "Status", "Prazo"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? <EmptyRow cols={3} /> : items.map(c => (
            <tr key={c.id}>
              <td style={tdStyle}>{c.descricao}</td>
              <td style={tdStyle}><Badge status={c.status} /></td>
              <td style={tdStyle}>{fmtDate(c.prazo)}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    );
  }

  function renderMarcos() {
    const items = data.marcos ?? [];
    return (
      <TableWrap>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
            {["Título", "Data", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? <EmptyRow cols={3} /> : items.map(m => (
            <tr key={m.id}>
              <td style={tdStyle}>{m.titulo}</td>
              <td style={tdStyle}>{fmtDate(m.data)}</td>
              <td style={tdStyle}><Badge status={m.status} /></td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    );
  }

  function renderRecursos() {
    const items = data.recursos ?? [];
    return (
      <TableWrap>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
            {["Nome", "Quantidade", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? <EmptyRow cols={3} /> : items.map(r => (
            <tr key={r.id}>
              <td style={tdStyle}>{r.nome}</td>
              <td style={tdStyle}>{r.quantidade}</td>
              <td style={tdStyle}><Badge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    );
  }

  function renderRefeicoes() {
    const items = data.refeicoes ?? [];
    return (
      <TableWrap>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
            {["Refeição", "Modelo", "Valor", "Dias"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? <EmptyRow cols={4} /> : items.map(r => (
            <tr key={r.id}>
              <td style={tdStyle}>{r.emoji ?? ""} {r.nome}</td>
              <td style={tdStyle}>
                <span style={{ background: r.modelo === "INCLUSA" ? "#DCFCE7" : "#FEF3C7", color: r.modelo === "INCLUSA" ? "#16A34A" : "#C8922A", padding: "0.18rem 0.55rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
                  {r.modelo === "INCLUSA" ? "Inclusa" : "Avulsa"}
                </span>
              </td>
              <td style={tdStyle}>{r.valor != null ? `R$ ${Number(r.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</td>
              <td style={tdStyle}>{r.dias?.join(", ") ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    );
  }

  function renderPontos() {
    const items = data.pontos ?? [];
    return (
      <TableWrap>
        <thead>
          <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
            {["Nome", "Tipo", "Token QR"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? <EmptyRow cols={3} /> : items.map(p => (
            <tr key={p.id}>
              <td style={tdStyle}>{p.nome}</td>
              <td style={tdStyle}>
                <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "0.18rem 0.55rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700 }}>
                  {p.tipo}
                </span>
              </td>
              <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.78rem", color: "#6B7280" }}>{p.qrToken}</td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    );
  }

  // ─── Modal Forms ──────────────────────────────────────────────────────────

  function renderSugestoes() {
    const sugs = SUGESTOES[tab];
    if (!sugs || sugs.length === 0) return null;
    return (
      <div style={{ marginBottom: "1rem" }}>
        <label style={labelStyle}>Sugestões</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {sugs.map(s => (
            <button key={s} type="button" onClick={() => set("nome", s)}
              style={{ padding: "0.35rem 0.7rem", borderRadius: "999px", border: "1.5px solid #E5E7EB", background: "white", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-nunito), sans-serif" }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderModalForm() {
    const f = form;
    const s = (key: string) => (String(f[key] ?? ""));

    if (tab === "fases") return (
      <>
        {renderSugestoes()}
        <div><label style={labelStyle}>Nome *</label><input required style={inputStyle} value={s("nome")} onChange={e => set("nome", e.target.value)} placeholder="Ex: Planejamento" /></div>
        <div><label style={labelStyle}>Ordem</label><input type="number" style={inputStyle} value={s("ordem")} onChange={e => set("ordem", e.target.value)} /></div>
        <div><label style={labelStyle}>Data Início</label><input type="date" style={inputStyle} value={s("dataInicio")} onChange={e => set("dataInicio", e.target.value)} /></div>
        <div><label style={labelStyle}>Data Fim</label><input type="date" style={inputStyle} value={s("dataFim")} onChange={e => set("dataFim", e.target.value)} /></div>
      </>
    );

    if (tab === "equipes") return (
      <>
        {renderSugestoes()}
        <div><label style={labelStyle}>Nome *</label><input required style={inputStyle} value={s("nome")} onChange={e => set("nome", e.target.value)} placeholder="Ex: Louvor" /></div>
        <div><label style={labelStyle}>Função *</label><input required style={inputStyle} value={s("funcao")} onChange={e => set("funcao", e.target.value)} /></div>
      </>
    );

    if (tab === "checklist") return (
      <>
        {renderSugestoes()}
        <div><label style={labelStyle}>Descrição *</label><input required style={inputStyle} value={s("descricao")} onChange={e => set("descricao", e.target.value)} placeholder="Ex: Confirmar local" /></div>
        <div><label style={labelStyle}>Prazo</label><input type="date" style={inputStyle} value={s("prazo")} onChange={e => set("prazo", e.target.value)} /></div>
      </>
    );

    if (tab === "marcos") return (
      <>
        {renderSugestoes()}
        <div><label style={labelStyle}>Título *</label><input required style={inputStyle} value={s("titulo")} onChange={e => set("titulo", e.target.value)} placeholder="Ex: Reunião de Planejamento" /></div>
        <div><label style={labelStyle}>Data *</label><input required type="date" style={inputStyle} value={s("data")} onChange={e => set("data", e.target.value)} /></div>
        <div><label style={labelStyle}>Observação</label><textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} value={s("obs")} onChange={e => set("obs", e.target.value)} /></div>
      </>
    );

    if (tab === "recursos") return (
      <>
        {renderSugestoes()}
        <div><label style={labelStyle}>Nome *</label><input required style={inputStyle} value={s("nome")} onChange={e => set("nome", e.target.value)} placeholder="Ex: Sistema de Som" /></div>
        <div><label style={labelStyle}>Quantidade *</label><input required type="number" min={1} style={inputStyle} value={s("quantidade")} onChange={e => set("quantidade", e.target.value)} /></div>
      </>
    );

    if (tab === "refeicoes") {
      const dias: string[] = Array.isArray(f["dias"]) ? (f["dias"] as string[]) : [];
      const toggleDia = (d: string) => {
        const newDias = dias.includes(d) ? dias.filter(x => x !== d) : [...dias, d];
        set("dias", JSON.stringify(newDias));
      };
      // Parse dias para renderizar os botões
      const parsedDias = Array.isArray(f["dias"]) ? (f["dias"] as string[]) : 
                        (typeof f["dias"] === "string" && (f["dias"] as string).startsWith("[") ? JSON.parse(f["dias"] as string) : []);
      return (
        <>
          {renderSugestoes()}
          <div><label style={labelStyle}>Nome *</label><input required style={inputStyle} value={s("nome")} onChange={e => set("nome", e.target.value)} placeholder="Ex: Café da Manhã ☕" /></div>
          <div><label style={labelStyle}>Emoji</label><input style={inputStyle} value={s("emoji")} onChange={e => set("emoji", e.target.value)} placeholder="☕" /></div>
          <div>
            <label style={labelStyle}>Modelo *</label>
            <select required style={inputStyle} value={s("modelo")} onChange={e => set("modelo", e.target.value)}>
              <option value="">Selecione...</option>
              <option value="INCLUSA">Inclusa</option>
              <option value="AVULSA">Avulsa</option>
            </select>
          </div>
          <div><label style={labelStyle}>Valor (R$)</label><input type="number" min={0} step="0.01" style={inputStyle} value={s("valor")} onChange={e => set("valor", e.target.value)} /></div>
          <div>
            <label style={labelStyle}>Dias</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {DIAS_SEMANA.map(d => (
                <button key={d} type="button" onClick={() => toggleDia(d)}
                  style={{ padding: "0.3rem 0.7rem", borderRadius: "999px", border: "1.5px solid", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-nunito), sans-serif",
                    borderColor: parsedDias.includes(d) ? "#1A3C6E" : "#E5E7EB", background: parsedDias.includes(d) ? "#1A3C6E" : "white", color: parsedDias.includes(d) ? "white" : "#374151" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (tab === "pontos") return (
      <>
        {renderSugestoes()}
        <div><label style={labelStyle}>Nome *</label><input required style={inputStyle} value={s("nome")} onChange={e => set("nome", e.target.value)} placeholder="Ex: Entrada Principal" /></div>
        <div>
          <label style={labelStyle}>Tipo *</label>
          <select required style={inputStyle} value={s("tipo")} onChange={e => set("tipo", e.target.value)}>
            <option value="">Selecione...</option>
            <option value="ENTRADA">Entrada</option>
            <option value="ALMOCO">Almoço</option>
            <option value="CULTO">Culto</option>
            <option value="PERSONALIZADO">Personalizado</option>
          </select>
        </div>
      </>
    );

    return null;
  }

  const tabLabel: Record<TabKey, string> = {
    fases: "Etapa", equipes: "Equipe", checklist: "Item", marcos: "Cronograma",
    recursos: "Recurso", refeicoes: "Refeição", pontos: "Ponto de Check-in",
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/eventos" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "#6B7280", fontSize: "0.8125rem", textDecoration: "none", marginBottom: "0.75rem" }}>
          <ChevronLeft size={15} strokeWidth={1.5} /> Voltar aos Eventos
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: "0 0 0.2rem" }}>Gerenciamento Avançado</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Configure todos os detalhes operacionais do evento</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "0.5rem 0.95rem", borderRadius: "8px", border: "none", cursor: "pointer",
              fontSize: "0.8125rem", fontWeight: 600, fontFamily: "var(--font-nunito), sans-serif",
              background: tab === t.key ? "#1A3C6E" : "white", color: tab === t.key ? "white" : "#6B7280",
              boxShadow: tab === t.key ? "none" : "0 1px 3px rgba(0,0,0,0.06)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button style={btnPrimary} onClick={openModal}>
          <Plus size={15} strokeWidth={2} /> Adicionar {tabLabel[tab]}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {tab === "fases"     && renderFases()}
          {tab === "equipes"   && renderEquipes()}
          {tab === "checklist" && renderChecklist()}
          {tab === "marcos"    && renderMarcos()}
          {tab === "recursos"  && renderRecursos()}
          {tab === "refeicoes" && renderRefeicoes()}
          {tab === "pontos"    && renderPontos()}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div style={overlayStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div style={modalStyle} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0D2545" }}>Adicionar {tabLabel[tab]}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {renderModalForm()}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: "0.55rem 1.1rem", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.83rem", fontFamily: "var(--font-nunito), sans-serif" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
