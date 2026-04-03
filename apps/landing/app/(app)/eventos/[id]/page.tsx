"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle, X,
  QrCode, Link as LinkIcon, Copy, Check, Share2, UserPlus,
  Settings2, FileText, DoorOpen, Trash2, Edit3, Download,
  UtensilsCrossed, ShoppingBag, DollarSign,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";

interface Evento {
  id: string; title: string; description?: string; date: string; location?: string;
  status: "ABERTO" | "LOTADO" | "ENCERRADO"; maxVagas?: number; isGratuito: boolean; valor?: number;
  banner?: string; slug?: string; alimentacaoAtiva: boolean; alimentacaoModelo?: string;
  endereco?: string; googleMapsLink?: string; instrucaoRetirada?: string; enderecoRetirada?: string;
  _count?: { inscricoes: number };
  inscricoes: { id: string; nome: string; email: string; status: string; checkinAt: string | null; pagamentoStatus?: string; formaPagamento?: string; }[];
  checkinPontos: { id: string; nome: string; tipo: string; qrToken: string; }[];
  refeicoes: { id: string; nome: string; emoji: string | null; }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function QRCodeSVG({ value, size = 200 }: { value: string; size?: number }) {
  // Simple QR-like pattern for display
  const cells = 7;
  const cellSize = size / cells;
  const pattern = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, y) => row.map((cell, x) => (
        cell === 1 && <rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill={NAVY} />
      )))}
      <text x={size/2} y={size - 10} textAnchor="middle" fontSize="10" fill={NAVY}>{value.slice(0,12)}...</text>
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.4rem 0.75rem", borderRadius: 6, border: "1px solid #E5E7EB", background: copied ? "#DCFCE7" : "white", color: copied ? "#16A34A" : "#374151", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
      {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
    </button>
  );
}

export default function EventoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = typeof params.id === "string" ? params.id : "";
  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "inscricoes" | "checkin" | "qr">("info");
  const [showInscModal, setShowInscModal] = useState(false);
  const [inscForm, setInscForm] = useState({ nome: "", email: "", telefone: "", tipo: "VISITANTE", formaPagamento: "PIX" });
  const [inscSaving, setInscSaving] = useState(false);

  useEffect(() => { if (eventId) fetchEvento(); }, [eventId]);

  async function fetchEvento() {
    try {
      const res = await fetch(`/api/eventos/${eventId}`);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setEvento(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleInscManual(e: React.FormEvent) {
    e.preventDefault();
    if (!evento) return;
    setInscSaving(true);
    try {
      const res = await fetch("/api/inscricoes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: evento.id, ...inscForm, totalFinal: evento.isGratuito ? 0 : (evento.valor || 0) }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Inscricao criada! QR Code: ${data.qrCode}`);
        setShowInscModal(false);
        setInscForm({ nome: "", email: "", telefone: "", tipo: "VISITANTE", formaPagamento: "PIX" });
        fetchEvento();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao inscrever");
      }
    } catch { alert("Erro de conexao"); }
    finally { setInscSaving(false); }
  }

  function downloadQR() {
    // Create canvas and download
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white"; ctx.fillRect(0,0,400,400);
    // Draw simple pattern
    const cells = 7, cellSize = 400/cells;
    const pattern = [[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
    pattern.forEach((row,y)=>row.forEach((cell,x)=>{ if(cell){ ctx.fillStyle=NAVY; ctx.fillRect(x*cellSize,y*cellSize,cellSize,cellSize);} }));
    ctx.fillStyle=NAVY; ctx.font="14px sans-serif"; ctx.textAlign="center";
    ctx.fillText(`Inscricao: ${evento?.slug || evento?.id}`, 200, 380);
    const link = document.createElement("a");
    link.download = `qr-evento-${evento?.slug || evento?.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  if (loading) return <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>Carregando...</div>;
  if (!evento) return <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>Evento nao encontrado</div>;

  const inscUrl = evento.slug ? `https://firmes.vercel.app/inscricao/${evento.slug}` : "";
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`Inscreva-se no evento ${evento.title}: ${inscUrl}`)}`;
  const confirmados = evento.inscricoes.filter(i => i.status === "CONFIRMADO").length;
  const presentes = evento.inscricoes.filter(i => i.checkinAt).length;

  return (
    <div style={{ minHeight: "100vh", background: BG, padding: "1.75rem 2rem", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button onClick={() => router.push("/eventos")} style={{ background: "none", border: "none", cursor: "pointer", color: NAVY }}><ArrowLeft size={20} /></button>
          <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 800, margin: 0, flex: 1 }}>{evento.title}</h1>
          <span style={{ background: evento.status === "ABERTO" ? "#DCFCE7" : evento.status === "LOTADO" ? "#FEF3C7" : "#F3F4F6", color: evento.status === "ABERTO" ? "#16A34A" : evento.status === "LOTADO" ? "#CA8A04" : "#6B7280", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            {evento.status}
          </span>
        </div>

        <p style={{ color: "#777", fontSize: 13, margin: "0 0 20px 32px" }}>{formatDate(evento.date)}{evento.location ? ` · ${evento.location}` : ""}</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #E5E7EB", paddingBottom: 8 }}>
          {[
            { id: "info", label: "Visao Geral", icon: <CheckCircle size={14} /> },
            { id: "inscricoes", label: `Inscricoes (${confirmados})`, icon: <Users size={14} /> },
            { id: "checkin", label: `Check-in (${presentes})`, icon: <DoorOpen size={14} /> },
            { id: "qr", label: "QR Code", icon: <QrCode size={14} /> },
          ].map(t => {
            const active = activeTab === (t.id as any);
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: active ? NAVY : "transparent", color: active ? "#fff" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {t.icon} {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === "info" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            {/* Left column */}
            <div>
              {evento.banner && <img src={evento.banner} alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />}
              
              {evento.description && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: NAVY }}>Sobre o evento</h3>
                  <p style={{ margin: 0, fontSize: 14, color: "#555", lineHeight: 1.6 }}>{evento.description}</p>
                </div>
              )}

              {/* Link de Inscricao */}
              {inscUrl && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <LinkIcon size={18} color={GOLD} />
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>Link de Inscricao</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12, background: "#F9FAFB", borderRadius: 8, marginBottom: 12 }}>
                    <span style={{ flex: 1, fontSize: 13, color: "#374151", wordBreak: "break-all" }}>{inscUrl}</span>
                    <CopyButton text={inscUrl} />
                  </div>
                  <a href={whatsappShare} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#25D366", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    <Share2 size={14} /> Compartilhar no WhatsApp
                  </a>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: NAVY }}>{confirmados}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>Inscritos</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#16A34A" }}>{presentes}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>Presentes</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: GOLD }}>{evento.maxVagas || "∞"}</div>
                  <div style={{ fontSize: 12, color: "#777" }}>Vagas</div>
                </div>
              </div>
            </div>

            {/* Right column - Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setShowInscModal(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                <UserPlus size={18} /> + Inscrever Manualmente
              </button>

              <Link href={`/eventos/${evento.id}/checkin`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: NAVY, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                <DoorOpen size={18} /> Abrir Check-in
              </Link>

              <Link href={`/eventos/${evento.id}/relatorio`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "#F3F4F6", color: "#374151", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                <FileText size={18} /> Relatorio
              </Link>

              <Link href={`/eventos/${evento.id}/avancado`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "#FEF3C7", color: "#C8922A", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                <Settings2 size={18} /> Gerenciamento Avancado
              </Link>

              <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "8px 0" }} />

              {evento.alimentacaoAtiva && (
                <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <UtensilsCrossed size={16} color={GOLD} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Alimentacao</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#777" }}>Modelo: {evento.alimentacaoModelo}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "qr" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center" }}>
            <h2 style={{ color: NAVY, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>QR Code do Evento</h2>
            <p style={{ color: "#777", fontSize: 14, marginBottom: 24 }}>Exiba este QR Code na entrada do evento para os participantes se inscreverem</p>

            <div style={{ display: "inline-block", padding: 24, background: "#F9FAFB", borderRadius: 16, marginBottom: 24 }}>
              <QRCodeSVG value={evento.slug || evento.id} size={280} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button onClick={downloadQR} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                <Download size={16} /> Baixar QR Code
              </button>
            </div>

            <div style={{ marginTop: 32, padding: 20, background: "#F0FDF4", borderRadius: 12, textAlign: "left" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#166534" }}>Como funciona:</h4>
              <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
                <li>O participante escaneia este QR Code</li>
                <li>E preenche o formulario de inscricao</li>
                <li>Apos pagar (se necessario), recebe o QR Code pessoal por email</li>
                <li>Na entrada, o voluntario escaneia o QR pessoal em /eventos/{evento.id}/checkin</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === "inscricoes" && (
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Nome", "Email", "Status", "Pagamento", "Check-in", "Acoes"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evento.inscricoes.map(i => (
                  <tr key={i.id} style={{ borderTop: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px" }}>{i.nome}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>{i.email}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: i.status === "CONFIRMADO" ? "#DCFCE7" : "#FEF3C7", color: i.status === "CONFIRMADO" ? "#16A34A" : "#CA8A04", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
                        {i.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {i.pagamentoStatus === "CONFIRMADO" ? (
                        <span style={{ color: "#16A34A", fontWeight: 600, fontSize: 12 }}>✓ {i.formaPagamento || "Pago"}</span>
                      ) : evento.isGratuito ? (
                        <span style={{ color: "#9CA3AF", fontSize: 12 }}>Gratuito</span>
                      ) : (
                        <button onClick={async () => {
                          if (!confirm(`Confirmar pagamento em dinheiro de ${i.nome}?`)) return;
                          try {
                            const res = await fetch(`/api/inscricoes/${i.id}/confirmar-pagamento`, {
                              method: "POST", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ formaPagamento: "DINHEIRO" }),
                            });
                            if (res.ok) { fetchEvento(); } else { const d = await res.json(); alert(d.error || "Erro"); }
                          } catch { alert("Erro de conexao"); }
                        }} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#92400E", cursor: "pointer" }}>
                          <DollarSign size={12} /> Confirmar Dinheiro
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {i.checkinAt ? <span style={{ color: "#16A34A", fontWeight: 600 }}>✓ {formatDate(i.checkinAt)}</span> : <span style={{ color: "#9CA3AF" }}>Pendente</span>}
                    </td>
                    <td style={{ padding: "12px 16px" }}>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "checkin" && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <p style={{ color: "#777", marginBottom: 16 }}>Acesse a tela completa de check-in para escanear QR Codes dos participantes</p>
            <Link href={`/eventos/${evento.id}/checkin`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: NAVY, color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              <DoorOpen size={18} /> Abrir Tela de Check-in
            </Link>
          </div>
        )}
      </div>

      {/* Modal Inscricao Manual */}
      <AnimatePresence>
        {showInscModal && (
          <motion.div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowInscModal(false)}>
            <motion.div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 480, width: "100%" }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: NAVY }}>Inscrever Manualmente</h3>
                <button onClick={() => setShowInscModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
              </div>

              <form onSubmit={handleInscManual} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>Nome *</label>
                  <input required value={inscForm.nome} onChange={e => setInscForm(f => ({ ...f, nome: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>Email *</label>
                  <input required type="email" value={inscForm.email} onChange={e => setInscForm(f => ({ ...f, email: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>Telefone</label>
                  <input value={inscForm.telefone} onChange={e => setInscForm(f => ({ ...f, telefone: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>Tipo</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["MEMBRO", "VISITANTE"].map(t => (
                      <label key={t} style={{ flex: 1, padding: "10px", border: `2px solid ${inscForm.tipo === t ? NAVY : "#E5E7EB"}`, borderRadius: 8, textAlign: "center", cursor: "pointer", background: inscForm.tipo === t ? "#EEF2FA" : "#fff", fontWeight: inscForm.tipo === t ? 700 : 400 }}>
                        <input type="radio" name="tipo" value={t} checked={inscForm.tipo === t} onChange={() => setInscForm(f => ({ ...f, tipo: t as any }))} style={{ display: "none" }} />
                        {t === "MEMBRO" ? "Membro" : "Visitante"}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" }}>Forma de Pagamento</label>
                  <select value={inscForm.formaPagamento} onChange={e => setInscForm(f => ({ ...f, formaPagamento: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}>
                    <option value="PIX">PIX</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="CARTAO">Cartao</option>
                    <option value="GRATUITO">Gratuito</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={() => setShowInscModal(false)} style={{ flex: 1, padding: "12px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                  <button type="submit" disabled={inscSaving} style={{ flex: 1, padding: "12px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: inscSaving ? 0.7 : 1 }}>{inscSaving ? "Salvando..." : "Inscrever"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
