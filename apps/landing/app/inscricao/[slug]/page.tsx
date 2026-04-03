"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Users, Tag, CheckCircle, Clock, User, Mail, Phone,
  AlertCircle, UtensilsCrossed, ShoppingBag, Ticket, Plus, Minus, ChevronDown,
} from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";
const FONT = "var(--font-nunito), sans-serif";

interface Refeicao {
  id: string; nome: string; emoji: string | null; modelo: string; valor: number | null; dias: string;
}
interface ProdutoVariacao {
  id: string; tipo: string; opcao: string; estoque: number;
}
interface Produto {
  id: string; nome: string; descricao: string | null; foto: string | null;
  preco: number; categoria: string; estoque: number; variacoes: ProdutoVariacao[];
}
interface EventoProduto {
  id: string; produtoId: string; produto: Produto;
}
interface Evento {
  id: string; title: string; description: string | null; date: string; location: string | null;
  maxVagas: number | null; isGratuito: boolean; valor: number | null; slug: string; status: string;
  banner: string | null; alimentacaoAtiva: boolean; alimentacaoModelo: string | null;
  cidadeExterna: string | null; endereco: string | null; enderecoRetirada: string | null;
  instrucaoRetirada: string | null; googleMapsLink: string | null;
  inscricoes: { id: string; status: string }[];
  refeicoes: Refeicao[];
  produtos: EventoProduto[];
}
interface CartItem {
  produtoId: string; variacaoId?: string; nome: string; variacao?: string;
  quantidade: number; preco: number;
}
interface RefeicaoSel {
  refeicaoId: string; dia: string; nome: string; valor: number;
}
interface CupomData {
  id: string; codigo: string; desconto: number; tipo: string;
}

type FormState = "idle" | "loading" | "success" | "error";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function QRCodePlaceholder({ code }: { code: string }) {
  const grid = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
      return corner || (r === 3 && c % 2 === 0) || Math.random() > 0.55;
    })
  );
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(7, 20px)", gap: 2, padding: 16, background: "#fff", borderRadius: 8, border: `2px solid ${NAVY}`, marginBottom: 8 }}>
        {grid.map((row, ri) => row.map((f, ci) => (
          <div key={`${ri}-${ci}`} style={{ width: 20, height: 20, borderRadius: 2, background: f ? NAVY : "#fff" }} />
        )))}
      </div>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: "#555", wordBreak: "break-all", margin: "4px 0 0" }}>{code}</p>
    </div>
  );
}

function parseDias(dias: string): string[] {
  try {
    const parsed = typeof dias === "string" && dias.startsWith("[") ? JSON.parse(dias) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 5 };
const inputWrapStyle: React.CSSProperties = { position: "relative" };
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 12px 11px 36px", border: "1.5px solid #DDD6CE", borderRadius: 10,
  fontSize: 14, fontFamily: FONT, outline: "none", boxSizing: "border-box", color: "#222",
};

export default function InscricaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loadingEvento, setLoadingEvento] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<"MEMBRO" | "VISITANTE">("VISITANTE");
  const [formaPagamento, setFormaPagamento] = useState("PIX");

  const [refeicoesSel, setRefeicoesSel] = useState<RefeicaoSel[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cupomCodigo, setCupomCodigo] = useState("");
  const [cupom, setCupom] = useState<CupomData | null>(null);
  const [cupomError, setCupomError] = useState("");
  const [cupomLoading, setCupomLoading] = useState(false);

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<{ id: string; qrCode: string; status: string } | null>(null);

  useEffect(() => {
    fetch(`/api/eventos?slug=${resolvedParams.slug}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(d => {
        const ev = Array.isArray(d) ? d[0] : d;
        if (!ev) throw new Error("not found");
        // Normalize field names (API may return title or titulo)
        setEvento({
          ...ev,
          title: ev.title || ev.titulo,
          description: ev.description || ev.descricao,
          location: ev.location || ev.local,
          refeicoes: ev.refeicoes || [],
          produtos: ev.produtos || [],
          inscricoes: ev.inscricoes || [],
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingEvento(false));
  }, [resolvedParams.slug]);

  // Toggle refeicao
  function toggleRefeicao(ref: Refeicao, dia: string) {
    const key = `${ref.id}-${dia}`;
    const exists = refeicoesSel.find(r => `${r.refeicaoId}-${r.dia}` === key);
    if (exists) {
      setRefeicoesSel(refeicoesSel.filter(r => `${r.refeicaoId}-${r.dia}` !== key));
    } else {
      setRefeicoesSel([...refeicoesSel, { refeicaoId: ref.id, dia, nome: `${ref.emoji || ""} ${ref.nome} (${dia})`, valor: ref.valor || 0 }]);
    }
  }

  // Cart functions
  function addToCart(produto: Produto, variacaoId?: string, variacao?: string) {
    const existing = cart.find(c => c.produtoId === produto.id && c.variacaoId === variacaoId);
    if (existing) {
      setCart(cart.map(c => c === existing ? { ...c, quantidade: c.quantidade + 1 } : c));
    } else {
      setCart([...cart, { produtoId: produto.id, variacaoId, nome: produto.nome, variacao, quantidade: 1, preco: produto.preco }]);
    }
  }
  function updateQty(idx: number, delta: number) {
    setCart(cart.map((c, i) => i === idx ? { ...c, quantidade: Math.max(0, c.quantidade + delta) } : c).filter(c => c.quantidade > 0));
  }

  // Cupom
  async function validarCupom() {
    if (!cupomCodigo.trim()) return;
    setCupomLoading(true); setCupomError("");
    try {
      const res = await fetch("/api/cupons/validar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: cupomCodigo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cupom invalido");
      setCupom(data);
    } catch (err: unknown) {
      setCupomError(err instanceof Error ? err.message : "Erro");
      setCupom(null);
    }
    setCupomLoading(false);
  }

  // Totals
  const valorInscricao = (!evento?.isGratuito && evento?.valor) ? evento.valor : 0;
  const totalRefeicoes = refeicoesSel.reduce((acc, r) => acc + r.valor, 0);
  const totalProdutos = cart.reduce((acc, c) => acc + c.preco * c.quantidade, 0);
  const subtotal = valorInscricao + totalRefeicoes + totalProdutos;
  const descontoCupom = cupom
    ? (cupom.tipo === "PERCENTUAL" ? subtotal * (cupom.desconto / 100) : cupom.desconto)
    : 0;
  const totalFinal = Math.max(0, subtotal - descontoCupom);

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!evento) return;
    setFormState("loading"); setErrorMsg("");
    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: evento.id, nome, email, telefone, tipo, formaPagamento,
          totalFinal,
          cupomId: cupom?.id || null,
          itens: cart.map(c => ({ produtoId: c.produtoId, variacaoId: c.variacaoId, quantidade: c.quantidade, preco: c.preco })),
          refeicoesSelecionadas: refeicoesSel.map(r => ({ refeicaoId: r.refeicaoId, dia: r.dia })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao realizar inscricao");
      setResult(data);
      setFormState("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido");
      setFormState("error");
    }
  }

  function formatTel(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  // Loading
  if (loadingEvento) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 40, height: 40, border: `4px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%" }} />
      </div>
    );
  }

  if (notFound || !evento) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, gap: 16, padding: 24, textAlign: "center" }}>
        <AlertCircle size={48} color={GOLD} />
        <h2 style={{ color: NAVY, fontSize: 22, margin: 0 }}>Evento nao encontrado</h2>
        <p style={{ color: "#555", margin: 0 }}>Verifique o link e tente novamente.</p>
      </div>
    );
  }

  const confirmedCount = evento.inscricoes.filter(i => i.status === "CONFIRMADO").length;
  const vagasDisp = evento.maxVagas ? evento.maxVagas - confirmedCount : null;
  const semVagas = vagasDisp !== null && vagasDisp <= 0;

  // Success
  if (formState === "success" && result) {
    const listaEspera = result.status === "LISTA_ESPERA";
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: FONT }}>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}
          style={{ background: "#fff", borderRadius: 20, padding: 36, maxWidth: 520, width: "100%", boxShadow: "0 8px 32px rgba(26,60,110,0.12)", textAlign: "center" }}>
          {listaEspera ? (
            <>
              <Clock size={52} color={GOLD} style={{ marginBottom: 16 }} />
              <h2 style={{ color: NAVY, fontSize: 22, marginBottom: 8 }}>Voce esta na lista de espera</h2>
              <p style={{ color: "#555", fontSize: 15, marginBottom: 24 }}>Caso uma vaga seja liberada, voce sera notificado pelo e-mail <strong>{email}</strong>.</p>
            </>
          ) : (
            <>
              <CheckCircle size={52} color="#16A34A" style={{ marginBottom: 16 }} />
              <h2 style={{ color: NAVY, fontSize: 22, marginBottom: 6 }}>Inscricao confirmada!</h2>
              <p style={{ color: "#555", fontSize: 15, marginBottom: 20 }}>Apresente o QR Code abaixo no dia do evento.</p>
              <QRCodePlaceholder code={result.qrCode} />
              <div style={{ marginTop: 20, textAlign: "left", background: "#F9FAFB", borderRadius: 12, padding: "16px 20px" }}>
                <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}><strong>Evento:</strong> {evento.title}</p>
                <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}><strong>Participante:</strong> {nome}</p>
                {evento.endereco && <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}><strong>Local:</strong> {evento.endereco}</p>}
                {totalFinal > 0 && <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}><strong>Total:</strong> R$ {totalFinal.toFixed(2)}</p>}
                {cart.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong style={{ fontSize: 13, color: NAVY }}>Produtos:</strong>
                    {cart.map((c, i) => (
                      <p key={i} style={{ margin: "2px 0 2px 12px", fontSize: 13, color: "#555" }}>
                        {c.quantidade}x {c.nome}{c.variacao ? ` (${c.variacao})` : ""} — R$ {(c.preco * c.quantidade).toFixed(2)}
                      </p>
                    ))}
                  </div>
                )}
                {refeicoesSel.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong style={{ fontSize: 13, color: NAVY }}>Refeicoes:</strong>
                    {refeicoesSel.map((r, i) => (
                      <p key={i} style={{ margin: "2px 0 2px 12px", fontSize: 13, color: "#555" }}>{r.nome}</p>
                    ))}
                  </div>
                )}
                {evento.instrucaoRetirada && (
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFF8ED", border: `1px solid ${GOLD}`, borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#7A5500" }}><strong>Instrucao de retirada:</strong> {evento.instrucaoRetirada}</p>
                    {evento.enderecoRetirada && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#7A5500" }}>{evento.enderecoRetirada}</p>}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // Main form
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px 60px", fontFamily: FONT }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ maxWidth: 520, width: "100%" }}>

        {/* Banner */}
        <div style={{ width: "100%", height: 160, borderRadius: "20px 20px 0 0", background: evento.banner ? `url(${evento.banner}) center/cover` : `linear-gradient(135deg, ${NAVY} 0%, #2A5BA0 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {!evento.banner && <Calendar size={56} color="rgba(255,255,255,0.35)" />}
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: "0 0 20px 20px", padding: "28px 28px 36px", boxShadow: "0 8px 32px rgba(26,60,110,0.12)" }}>

          {/* Title */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>{evento.title}</h1>
            {!evento.isGratuito && evento.valor != null && (
              <span style={{ background: GOLD, color: "#fff", fontWeight: 700, fontSize: 13, borderRadius: 999, padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0 }}>
                R$ {evento.valor.toFixed(2)}
              </span>
            )}
          </div>

          {/* Meta */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
              <Calendar size={15} color={GOLD} /><span>{formatDate(evento.date)}</span>
            </div>
            {evento.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
                <MapPin size={15} color={GOLD} /><span>{evento.location}</span>
              </div>
            )}
            {evento.endereco && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#555", fontSize: 14 }}>
                <MapPin size={15} color="#999" />
                <span>{evento.endereco}</span>
                {evento.googleMapsLink && (
                  <a href={evento.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{ color: NAVY, fontSize: 12, fontWeight: 600 }}>Ver mapa</a>
                )}
              </div>
            )}
            {evento.maxVagas != null && vagasDisp != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <Users size={15} color={semVagas ? "#DC2626" : NAVY} />
                <span style={{ color: semVagas ? "#DC2626" : NAVY, fontWeight: 600 }}>{vagasDisp} de {evento.maxVagas} vagas disponiveis</span>
              </div>
            )}
          </div>

          {evento.description && (
            <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{evento.description}</p>
          )}

          <hr style={{ border: "none", borderTop: "1px solid #E8E0D5", marginBottom: 24 }} />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ color: NAVY, fontSize: 17, fontWeight: 700, margin: 0 }}>Dados para inscricao</h2>

            {/* Nome */}
            <div>
              <label style={labelStyle}>Nome completo *</label>
              <div style={inputWrapStyle}>
                <User size={16} color="#999" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input required type="text" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>E-mail *</label>
              <div style={inputWrapStyle}>
                <Mail size={16} color="#999" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input required type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label style={labelStyle}>Telefone / WhatsApp</label>
              <div style={inputWrapStyle}>
                <Phone size={16} color="#999" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type="tel" placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(formatTel(e.target.value))} style={inputStyle} />
              </div>
            </div>

            {/* Tipo */}
            <div>
              <label style={labelStyle}>Voce e *</label>
              <div style={{ display: "flex", gap: 12 }}>
                {(["MEMBRO", "VISITANTE"] as const).map(t => {
                  const sel = tipo === t;
                  return (
                    <label key={t} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 12px", border: `2px solid ${sel ? NAVY : "#DDD6CE"}`, borderRadius: 10, cursor: "pointer", background: sel ? "#EEF2FA" : "#fff", fontWeight: sel ? 700 : 400, color: sel ? NAVY : "#555", fontSize: 14, transition: "all .2s" }}>
                      <input type="radio" name="tipo" value={t} checked={sel} onChange={() => setTipo(t)} style={{ display: "none" }} />
                      {t === "MEMBRO" ? "Membro" : "Visitante"}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── ALIMENTACAO ── */}
            {evento.alimentacaoAtiva && evento.refeicoes.length > 0 && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid #E8E0D5", margin: "8px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <UtensilsCrossed size={18} color={GOLD} />
                  <h2 style={{ color: NAVY, fontSize: 17, fontWeight: 700, margin: 0 }}>Alimentacao</h2>
                </div>

                {evento.alimentacaoModelo === "INCLUSA" ? (
                  <div style={{ background: "#F0FFF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "14px 16px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#166534" }}>Refeicoes incluidas na inscricao:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {evento.refeicoes.map(r => {
                        const dias = parseDias(r.dias);
                        return dias.map(dia => (
                          <span key={`${r.id}-${dia}`} style={{ background: "#DCFCE7", color: "#166534", fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "4px 10px" }}>
                            {r.emoji || ""} {r.nome} {dia}
                          </span>
                        ));
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#555" }}>Selecione as refeicoes que deseja adicionar:</p>
                    {evento.refeicoes.map(r => {
                      const dias = parseDias(r.dias);
                      return (
                        <div key={r.id} style={{ background: "#FAFAFA", borderRadius: 10, padding: "12px 14px", border: "1px solid #F3F4F6" }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 8 }}>
                            {r.emoji || ""} {r.nome}
                            {r.valor ? <span style={{ color: GOLD, fontWeight: 700, marginLeft: 8 }}>R$ {r.valor.toFixed(2)}</span> : null}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {dias.map(dia => {
                              const sel = refeicoesSel.some(s => s.refeicaoId === r.id && s.dia === dia);
                              return (
                                <label key={dia} style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: `1.5px solid ${sel ? NAVY : "#DDD6CE"}`, background: sel ? "#EEF2FA" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? NAVY : "#555", transition: "all .2s" }}>
                                  <input type="checkbox" checked={sel} onChange={() => toggleRefeicao(r, dia)} style={{ display: "none" }} />
                                  {dia}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── PRODUTOS ── */}
            {evento.produtos.length > 0 && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid #E8E0D5", margin: "8px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <ShoppingBag size={18} color={GOLD} />
                  <h2 style={{ color: NAVY, fontSize: 17, fontWeight: 700, margin: 0 }}>Produtos do evento</h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {evento.produtos.map(ep => {
                    const p = ep.produto;
                    return (
                      <div key={ep.id} style={{ background: "#FAFAFA", borderRadius: 10, border: "1px solid #F3F4F6", overflow: "hidden" }}>
                        <div style={{ width: "100%", height: 90, background: p.foto ? `url(${p.foto}) center/cover` : `linear-gradient(135deg, ${NAVY}, #2A5BA0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {!p.foto && <ShoppingBag size={28} color="rgba(255,255,255,0.4)" />}
                        </div>
                        <div style={{ padding: "10px 12px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginBottom: 8 }}>R$ {p.preco.toFixed(2)}</div>

                          {p.variacoes.length > 0 ? (
                            <div>
                              {p.variacoes.map(v => (
                                <button key={v.id} type="button" onClick={() => addToCart(p, v.id, `${v.tipo}: ${v.opcao}`)}
                                  style={{ display: "block", width: "100%", marginBottom: 4, padding: "5px 8px", fontSize: 12, background: "#fff", border: "1px solid #DDD6CE", borderRadius: 6, cursor: "pointer", color: NAVY, fontWeight: 500, textAlign: "left" }}>
                                  {v.tipo}: {v.opcao} {v.estoque > 0 ? "" : "(esgotado)"}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button type="button" onClick={() => addToCart(p)}
                              style={{ width: "100%", padding: "6px", fontSize: 13, background: NAVY, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                              Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart items */}
                {cart.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {cart.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, marginBottom: 4 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{c.nome}{c.variacao ? ` (${c.variacao})` : ""}</div>
                          <div style={{ fontSize: 12, color: "#6B7280" }}>R$ {c.preco.toFixed(2)} cada</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button type="button" onClick={() => updateQty(i, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #DDD6CE", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{c.quantidade}</span>
                          <button type="button" onClick={() => updateQty(i, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #DDD6CE", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── CUPOM ── */}
            {(totalFinal > 0 || cart.length > 0 || refeicoesSel.length > 0) && (
              <div>
                <label style={labelStyle}>Cupom de desconto</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" placeholder="CODIGO" value={cupomCodigo} onChange={e => setCupomCodigo(e.target.value.toUpperCase())}
                    style={{ ...inputStyle, padding: "11px 12px", flex: 1 }} />
                  <button type="button" onClick={validarCupom} disabled={cupomLoading}
                    style={{ padding: "0 16px", background: NAVY, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {cupomLoading ? "..." : "Aplicar"}
                  </button>
                </div>
                {cupomError && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 0" }}>{cupomError}</p>}
                {cupom && <p style={{ color: "#16A34A", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>Cupom {cupom.codigo} aplicado! {cupom.tipo === "PERCENTUAL" ? `${cupom.desconto}% de desconto` : `R$ ${cupom.desconto.toFixed(2)} de desconto`}</p>}
              </div>
            )}

            {/* ── RESUMO ── */}
            {(valorInscricao > 0 || totalRefeicoes > 0 || totalProdutos > 0) && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid #E8E0D5", margin: "8px 0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Ticket size={18} color={GOLD} />
                  <h2 style={{ color: NAVY, fontSize: 17, fontWeight: 700, margin: 0 }}>Resumo</h2>
                </div>
                <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 16px" }}>
                  {valorInscricao > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "#374151" }}>
                      <span>Inscricao</span><span style={{ fontWeight: 600 }}>R$ {valorInscricao.toFixed(2)}</span>
                    </div>
                  )}
                  {totalRefeicoes > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "#374151" }}>
                      <span>Refeicoes ({refeicoesSel.length})</span><span style={{ fontWeight: 600 }}>R$ {totalRefeicoes.toFixed(2)}</span>
                    </div>
                  )}
                  {totalProdutos > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "#374151" }}>
                      <span>Produtos ({cart.reduce((a, c) => a + c.quantidade, 0)})</span><span style={{ fontWeight: 600 }}>R$ {totalProdutos.toFixed(2)}</span>
                    </div>
                  )}
                  {descontoCupom > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "#16A34A" }}>
                      <span>Desconto ({cupom?.codigo})</span><span style={{ fontWeight: 600 }}>- R$ {descontoCupom.toFixed(2)}</span>
                    </div>
                  )}
                  <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: NAVY }}>
                    <span>Total</span><span>R$ {totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Forma de pagamento */}
                <div style={{ marginTop: 8 }}>
                  <label style={labelStyle}>Forma de pagamento</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["PIX", "DINHEIRO", "CARTAO"].map(fp => {
                      const sel = formaPagamento === fp;
                      return (
                        <label key={fp} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", border: `2px solid ${sel ? NAVY : "#DDD6CE"}`, borderRadius: 8, cursor: "pointer", background: sel ? "#EEF2FA" : "#fff", fontWeight: sel ? 700 : 400, color: sel ? NAVY : "#555", fontSize: 13, transition: "all .2s" }}>
                          <input type="radio" name="pagamento" value={fp} checked={sel} onChange={() => setFormaPagamento(fp)} style={{ display: "none" }} />
                          {fp === "PIX" ? "PIX" : fp === "DINHEIRO" ? "Dinheiro" : "Cartao"}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            <AnimatePresence>
              {formState === "error" && errorMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", color: "#991B1B", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle size={15} />{errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button type="submit" disabled={formState === "loading" || semVagas} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ background: semVagas ? "#999" : NAVY, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: FONT, cursor: semVagas ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
              {formState === "loading" ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  style={{ display: "inline-block", width: 18, height: 18, border: "3px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%" }} />
              ) : semVagas ? "Vagas esgotadas" : totalFinal > 0 ? `Confirmar — R$ ${totalFinal.toFixed(2)}` : "Confirmar inscricao"}
            </motion.button>

            {semVagas && <p style={{ textAlign: "center", color: "#555", fontSize: 13, margin: 0 }}>Nao ha vagas disponiveis no momento.</p>}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
