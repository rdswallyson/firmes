"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, UserCheck, Users, Clock, CheckCircle, ArrowLeft, RefreshCw,
  Percent, X, DoorOpen, UtensilsCrossed, ShoppingBag, Phone, CreditCard,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";
const FONT = "var(--font-nunito), sans-serif";

/* ── Types ── */
interface CheckinPonto { id: string; nome: string; tipo: string; qrToken: string; }
interface CheckinScan { id: string; pontoId: string; dataHora: string; ponto: CheckinPonto; }
interface RefeicaoEvento { id: string; nome: string; emoji: string | null; modelo: string; valor: number | null; dias: string; }
interface RefeicaoUsada { id: string; refeicaoId: string; dia: string; refeicao: RefeicaoEvento; }
interface PedidoItem { id: string; produtoId: string; variacaoId: string | null; quantidade: number; preco: number; entregue: boolean; entregueEm: string | null; }
interface EventoProduto { id: string; produtoId: string; produto: { id: string; nome: string; foto: string | null; preco: number; variacoes: { id: string; tipo: string; opcao: string }[] }; }

interface Inscricao {
  id: string; nome: string; email: string; telefone: string | null;
  tipo: "MEMBRO" | "VISITANTE"; status: "CONFIRMADO" | "LISTA_ESPERA" | "CANCELADO";
  checkinAt: string | null; qrCode: string;
  formaPagamento: string | null; pagamentoStatus: string;
  scans: CheckinScan[]; refeicoesUsadas: RefeicaoUsada[]; itensPedido: PedidoItem[];
}

interface Evento {
  id: string; title?: string; titulo?: string; date?: string; data?: string; location?: string; local?: string;
  alimentacaoAtiva: boolean; alimentacaoModelo: string | null;
  inscricoes: Inscricao[]; checkinPontos: CheckinPonto[]; refeicoes: RefeicaoEvento[];
  produtos: EventoProduto[];
}

function evTitle(e: Evento) { return e.title || e.titulo || ""; }
function evDate(e: Evento) { return e.date || e.data || ""; }
function evLocation(e: Evento) { return e.location || e.local || ""; }

function formatTime(iso: string) { return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); }

function parseDias(dias: string): string[] {
  try { const p = typeof dias === "string" && dias.startsWith("[") ? JSON.parse(dias) : []; return Array.isArray(p) ? p : []; }
  catch { return []; }
}

function TipoBadge({ tipo }: { tipo: string }) {
  const m = tipo === "MEMBRO";
  return <span style={{ background: m ? "#DBEAFE" : "#FEF3C7", color: m ? "#1E40AF" : "#92400E", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>{m ? "Membro" : "Visitante"}</span>;
}

function PagBadge({ status, forma }: { status: string; forma: string | null }) {
  const ok = status === "CONFIRMADO";
  return <span style={{ fontSize: 12, fontWeight: 600, color: ok ? "#16A34A" : "#D97706" }}>{forma || "—"} {ok ? "✅" : "⏳"}</span>;
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 12px rgba(26,60,110,0.08)", flex: 1, minWidth: 130 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: accent ? `${accent}18` : "#EEF2FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "#777", fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 19, fontWeight: 800, color: NAVY }}>{value}</p>
      </div>
    </motion.div>
  );
}

/* ── Ficha Modal ── */
function FichaInscrito({ inscricao, evento, onClose, onUpdate }: {
  inscricao: Inscricao; evento: Evento; onClose: () => void; onUpdate: () => void;
}) {
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function confirmarPonto(pontoId: string) {
    setActing(pontoId); setError("");
    try {
      const res = await fetch(`/api/inscricoes/${inscricao.qrCode}/checkin-ponto`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pontoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      onUpdate();
    } catch (e: any) { setError(e.message); }
    setActing(null);
  }

  async function confirmarRefeicao(refeicaoId: string, dia: string) {
    setActing(`ref-${refeicaoId}-${dia}`); setError("");
    try {
      const res = await fetch(`/api/inscricoes/${inscricao.qrCode}/refeicao`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refeicaoId, dia }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      onUpdate();
    } catch (e: any) { setError(e.message); }
    setActing(null);
  }

  async function entregarProduto(pedidoItemId: string) {
    setActing(`prod-${pedidoItemId}`); setError("");
    try {
      const res = await fetch(`/api/inscricoes/${inscricao.qrCode}/entregar-produto`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoItemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      onUpdate();
    } catch (e: any) { setError(e.message); }
    setActing(null);
  }

  const sectionStyle: React.CSSProperties = { marginTop: 16, padding: "14px 16px", background: "#FAFAFA", borderRadius: 12, border: "1px solid #F0EBE1" };
  const sectionTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 10 };
  const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F3F4F6" };
  const btnConfirm: React.CSSProperties = { background: NAVY, color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" };
  const doneLabel: React.CSSProperties = { display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#16A34A" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#EEF2FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: NAVY }}>
              {inscricao.nome.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: NAVY }}>{inscricao.nome}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <TipoBadge tipo={inscricao.tipo} />
                <PagBadge status={inscricao.pagamentoStatus} forma={inscricao.formaPagamento} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 4 }}><X size={20} /></button>
        </div>

        {inscricao.telefone && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#555", marginBottom: 4 }}>
            <Phone size={13} color="#999" /> {inscricao.telefone}
          </div>
        )}

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "8px 12px", color: "#991B1B", fontSize: 12, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* ── CHECK-INS DO EVENTO ── */}
        <div style={sectionStyle}>
          <div style={sectionTitle}><DoorOpen size={16} color={GOLD} /> Check-ins do Evento</div>
          {evento.checkinPontos.length === 0 ? (
            <p style={{ fontSize: 13, color: "#999", margin: 0 }}>Nenhum ponto de check-in configurado</p>
          ) : (
            evento.checkinPontos.map(ponto => {
              const scan = inscricao.scans.find(s => s.pontoId === ponto.id);
              const isActing = acting === ponto.id;
              const emoji = ponto.tipo === "ENTRADA" ? "🚪" : ponto.tipo === "ALMOCO" ? "🍽" : ponto.tipo === "CULTO" ? "🙏" : "➕";
              return (
                <div key={ponto.id} style={rowStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{ponto.nome}</span>
                  </div>
                  {scan ? (
                    <span style={doneLabel}><CheckCircle size={14} /> {formatTime(scan.dataHora)}</span>
                  ) : (
                    <button onClick={() => confirmarPonto(ponto.id)} disabled={isActing} style={{ ...btnConfirm, opacity: isActing ? 0.6 : 1 }}>
                      {isActing ? "..." : "CONFIRMAR"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── REFEICOES ── */}
        {evento.alimentacaoAtiva && evento.refeicoes.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionTitle}><UtensilsCrossed size={16} color={GOLD} /> Refeicoes</div>
            {evento.refeicoes.map(ref => {
              const dias = parseDias(ref.dias);
              return dias.map(dia => {
                const usada = inscricao.refeicoesUsadas.find(r => r.refeicaoId === ref.id && r.dia === dia);
                const key = `ref-${ref.id}-${dia}`;
                const isActing = acting === key;
                return (
                  <div key={key} style={rowStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{ref.emoji || "🍽"}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{ref.nome} {dia}</span>
                    </div>
                    {usada ? (
                      <span style={doneLabel}><CheckCircle size={14} /> Utilizado</span>
                    ) : (
                      <button onClick={() => confirmarRefeicao(ref.id, dia)} disabled={isActing} style={{ ...btnConfirm, opacity: isActing ? 0.6 : 1 }}>
                        {isActing ? "..." : "CONFIRMAR"}
                      </button>
                    )}
                  </div>
                );
              });
            })}
          </div>
        )}

        {/* ── PRODUTOS COMPRADOS ── */}
        {inscricao.itensPedido.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionTitle}><ShoppingBag size={16} color={GOLD} /> Produtos Comprados</div>
            {inscricao.itensPedido.map(item => {
              const prod = evento.produtos.find(ep => ep.produtoId === item.produtoId);
              const nome = prod?.produto.nome || "Produto";
              const variacao = item.variacaoId ? prod?.produto.variacoes.find(v => v.id === item.variacaoId) : null;
              const key = `prod-${item.id}`;
              const isActing = acting === key;
              return (
                <div key={item.id} style={rowStyle}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                      {item.quantidade}x {nome}{variacao ? ` (${variacao.opcao})` : ""}
                    </span>
                  </div>
                  {item.entregue ? (
                    <span style={doneLabel}><CheckCircle size={14} /> Entregue</span>
                  ) : (
                    <button onClick={() => entregarProduto(item.id)} disabled={isActing} style={{ ...btnConfirm, background: GOLD, opacity: isActing ? 0.6 : 1 }}>
                      {isActing ? "..." : "ENTREGAR"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Main Page ── */
export default function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInscricao, setSelectedInscricao] = useState<Inscricao | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvento = useCallback(async () => {
    try {
      const res = await fetch(`/api/eventos/${resolvedParams.id}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setEvento(data);
      setLastUpdate(new Date());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchEvento();
    intervalRef.current = setInterval(fetchEvento, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchEvento]);

  async function handleCheckin(qrCode: string) {
    setCheckingIn(qrCode);
    try {
      const res = await fetch(`/api/inscricoes/${qrCode}/checkin`, { method: "POST" });
      if (res.ok) {
        setEvento(prev => {
          if (!prev) return prev;
          return { ...prev, inscricoes: prev.inscricoes.map(i => i.qrCode === qrCode ? { ...i, checkinAt: new Date().toISOString() } : i) };
        });
      }
    } catch { /* ignore */ }
    setCheckingIn(null);
  }

  const inscricoes = evento?.inscricoes ?? [];
  const confirmados = inscricoes.filter(i => i.status === "CONFIRMADO");
  const presentes = inscricoes.filter(i => i.checkinAt !== null);
  const total = confirmados.length;
  const percentual = total > 0 ? Math.round((presentes.length / total) * 100) : 0;

  // Produtos pendentes count
  const produtosPendentes = inscricoes.reduce((acc, i) => acc + i.itensPedido.filter(p => !p.entregue).length, 0);

  // Refeicoes stats
  const totalRefeicoesPossiveis = evento?.refeicoes.reduce((acc, r) => {
    const dias = parseDias(r.dias);
    return acc + dias.length * confirmados.length;
  }, 0) ?? 0;
  const totalRefeicoesUsadas = inscricoes.reduce((acc, i) => acc + i.refeicoesUsadas.length, 0);
  const refPercentual = totalRefeicoesPossiveis > 0 ? Math.round((totalRefeicoesUsadas / totalRefeicoesPossiveis) * 100) : 0;

  const filtered = inscricoes.filter(i =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    i.qrCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 44, height: 44, border: `4px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%" }} />
      </div>
    );
  }

  if (!evento) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, flexDirection: "column", gap: 12 }}>
        <UserCheck size={48} color={GOLD} />
        <p style={{ color: NAVY, fontWeight: 700, fontSize: 18 }}>Evento nao encontrado</p>
        <Link href="/eventos" style={{ color: NAVY, textDecoration: "underline", fontSize: 14 }}>Voltar para eventos</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, padding: "28px 24px 60px", fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <Link href="/eventos" style={{ display: "flex", alignItems: "center", color: NAVY, textDecoration: "none", opacity: 0.7 }}><ArrowLeft size={18} /></Link>
          <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: 0, flex: 1 }}>Check-in — {evTitle(evento)}</h1>
        </div>
        <p style={{ color: "#777", fontSize: 13, margin: "0 0 24px 30px" }}>
          {formatDate(evDate(evento))}{evLocation(evento) ? ` · ${evLocation(evento)}` : ""}
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard icon={<Users size={18} color={NAVY} />} label="Inscritos" value={total} accent={NAVY} />
          <StatCard icon={<CheckCircle size={18} color="#16A34A" />} label="Presentes" value={presentes.length} accent="#16A34A" />
          <StatCard icon={<Percent size={18} color={GOLD} />} label="Comparecimento" value={`${percentual}%`} accent={GOLD} />
          {evento.alimentacaoAtiva && evento.refeicoes.length > 0 && (
            <StatCard icon={<UtensilsCrossed size={18} color="#7C3AED" />} label="Refeicoes" value={`${refPercentual}%`} accent="#7C3AED" />
          )}
          {produtosPendentes > 0 && (
            <StatCard icon={<ShoppingBag size={18} color="#DC2626" />} label="Entregas pend." value={produtosPendentes} accent="#DC2626" />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: 12, marginLeft: "auto", alignSelf: "center" }}>
            <RefreshCw size={12} />Atualizado às {formatTime(lastUpdate.toISOString())}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search size={16} color="#999" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" placeholder="Buscar por nome, e-mail ou QR Code..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 14px 12px 40px", border: "1.5px solid #DDD6CE", borderRadius: 12, fontSize: 14, fontFamily: FONT, outline: "none", background: "#fff", boxSizing: "border-box", color: "#222" }} />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(26,60,110,0.08)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", padding: "12px 20px", background: "#F5F0EB", borderBottom: "1px solid #E8E0D5", fontSize: 11, fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span>Nome</span><span>Tipo</span><span>Pagamento</span><span>Check-in</span><span>Itens</span><span style={{ textAlign: "center" }}>Acao</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#999", fontSize: 14 }}>Nenhum inscrito encontrado</div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((insc, idx) => {
                const done = !!insc.checkinAt;
                const inProgress = checkingIn === insc.qrCode;
                const pendProd = insc.itensPedido.filter(p => !p.entregue).length;
                return (
                  <motion.div key={insc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedInscricao(insc)}
                    style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 120px", padding: "13px 20px", borderBottom: idx < filtered.length - 1 ? "1px solid #F0EBE1" : "none", alignItems: "center", background: done ? "#F0FDF4" : "#fff", cursor: "pointer", transition: "background .2s" }}
                    onMouseEnter={e => { if (!done) (e.currentTarget as HTMLDivElement).style.background = "#FAFAFA"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = done ? "#F0FDF4" : "#fff"; }}>

                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: NAVY, fontSize: 14 }}>{insc.nome}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{insc.email}</p>
                    </div>

                    <TipoBadge tipo={insc.tipo} />

                    <PagBadge status={insc.pagamentoStatus} forma={insc.formaPagamento} />

                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: done ? "#16A34A" : "#ccc", fontWeight: done ? 600 : 400 }}>
                      {done ? <><Clock size={13} />{formatTime(insc.checkinAt!)}</> : <span style={{ color: "#ccc" }}>—</span>}
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      {insc.scans.length > 0 && <span style={{ background: "#DBEAFE", color: "#1E40AF", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px" }}>{insc.scans.length} scan</span>}
                      {pendProd > 0 && <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 6px" }}>{pendProd} pend</span>}
                    </div>

                    <div style={{ textAlign: "center" }} onClick={e => e.stopPropagation()}>
                      {done ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#16A34A", fontSize: 12, fontWeight: 700 }}>
                          <CheckCircle size={14} />Presente
                        </div>
                      ) : (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          disabled={inProgress || insc.status === "CANCELADO"}
                          onClick={() => handleCheckin(insc.qrCode)}
                          style={{ background: insc.status === "CANCELADO" ? "#ccc" : NAVY, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, fontFamily: FONT, cursor: insc.status === "CANCELADO" ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                          {inProgress ? (
                            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                              style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%" }} />
                          ) : <><UserCheck size={12} />Check-in</>}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, color: "#888", fontSize: 13 }}>
          {presentes.length} presentes de {total} inscritos · {percentual}% comparecimento
          {produtosPendentes > 0 && ` · ${produtosPendentes} produtos pendentes`}
        </p>
      </div>

      {/* Ficha modal */}
      {selectedInscricao && evento && (
        <FichaInscrito
          inscricao={selectedInscricao}
          evento={evento}
          onClose={() => setSelectedInscricao(null)}
          onUpdate={() => { fetchEvento(); setSelectedInscricao(null); }}
        />
      )}
    </div>
  );
}
