"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, User, Mail, Phone, CheckCircle, Clock,
  Package, Ticket, ArrowLeft, Printer, Share2, AlertCircle,
} from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";
const BG = "#F0EBE1";

interface EventoData {
  id: string;
  title: string;
  date: string;
  dataFim?: string | null;
  location?: string | null;
  endereco?: string | null;
  banner?: string | null;
  isGratuito: boolean;
  valor?: number | null;
  status: string;
}

interface ProdutoItem {
  id: string;
  produtoId: string;
  quantidade: number;
  preco: number;
  entregue: boolean;
}

interface InscricaoData {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  tipo: string;
  status: string;
  qrCode: string;
  checkinAt?: string | null;
  pagamentoStatus: string;
  formaPagamento?: string | null;
  createdAt: string;
  event: EventoData;
  itensPedido: ProdutoItem[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function PagamentoBadge({ isGratuito, status }: { isGratuito: boolean; status: string }) {
  if (isGratuito) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#DBEAFE", color: "#1D4ED8", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 12px" }}>
        <CheckCircle size={13} /> Gratuito
      </span>
    );
  }
  const ok = status === "CONFIRMADO";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: ok ? "#DCFCE7" : "#FEF3C7",
      color: ok ? "#16A34A" : "#D97706",
      fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 12px",
    }}>
      {ok ? <CheckCircle size={13} /> : <Clock size={13} />}
      {ok ? "Pagamento Confirmado" : "Pagamento Pendente"}
    </span>
  );
}

export default function ComprovantePage() {
  const params = useParams();
  const inscricaoId = typeof params.id === "string" ? params.id : "";
  const [data, setData] = useState<InscricaoData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inscricaoId) return;
    fetch(`/api/inscricoes/${inscricaoId}`)
      .then(r => r.json())
      .then(async (d: InscricaoData | { error: string }) => {
        if ("error" in d) {
          setError(d.error);
          setLoading(false);
          return;
        }
        setData(d);
        // Generate QR Code with full URL for better scanning
        try {
          const QRCode = (await import("qrcode")).default;
          const qrContent = `${window.location.origin}/checkin/${d.qrCode}`;
          const url = await QRCode.toDataURL(qrContent, {
            width: 320, margin: 3,
            color: { dark: NAVY, light: "#ffffff" },
            errorCorrectionLevel: "H",
          });
          setQrDataUrl(url);
        } catch (e) {
          console.error("QR generation error:", e);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erro ao carregar inscrição");
        setLoading(false);
      });
  }, [inscricaoId]);

  const handlePrint = () => window.print();
  const handleShare = async () => {
    if (navigator.share && data) {
      try {
        await navigator.share({
          title: `Inscrição — ${data.event.title}`,
          text: `Olá! Estou inscrito em ${data.event.title}.`,
          url: window.location.href,
        });
      } catch { /* ignore */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-nunito), sans-serif" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{ width: 44, height: 44, border: `4px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "var(--font-nunito), sans-serif" }}>
        <AlertCircle size={48} color="#DC2626" />
        <p style={{ color: NAVY, fontWeight: 700, fontSize: 18 }}>{error || "Inscrição não encontrada"}</p>
        <Link href="/eventos" style={{ color: NAVY, textDecoration: "underline", fontSize: 14 }}>Voltar para Eventos</Link>
      </div>
    );
  }

  const ev = data.event;
  const hasProdutos = data.itensPedido.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, padding: "24px 16px 60px", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Header actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link href="/eventos" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Voltar
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
              <Share2 size={14} /> Compartilhar
            </button>
            <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Printer size={14} /> Imprimir
            </button>
          </div>
        </div>

        {/* Ticket Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

          {/* Banner / Header */}
          <div style={{
            background: ev.banner ? `linear-gradient(rgba(26,60,110,0.75), rgba(26,60,110,0.9)), url(${ev.banner}) center/cover` : NAVY,
            padding: "28px 24px 20px", color: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, opacity: 0.85, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <Ticket size={14} /> Comprovante de Inscrição
            </div>
            <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, lineHeight: 1.2 }}>{ev.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: 13, opacity: 0.9 }}>
              <Calendar size={14} /> {formatDate(ev.date)}
              {ev.dataFim && <span> — {new Date(ev.dataFim).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
            </div>
            {(ev.location || ev.endereco) && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 13, opacity: 0.9 }}>
                <MapPin size={14} /> {ev.location || ev.endereco}
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: "#DBEAFE", color: "#1D4ED8",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800,
              }}>
                {data.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{data.nome}</div>
                <div style={{ fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Mail size={12} /> {data.email}</span>
                  {data.telefone && <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Phone size={12} /> {data.telefone}</span>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              <PagamentoBadge isGratuito={ev.isGratuito} status={data.pagamentoStatus} />
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: data.status === "CONFIRMADO" ? "#DCFCE7" : "#F3F4F6",
                color: data.status === "CONFIRMADO" ? "#16A34A" : "#6B7280",
                fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 12px",
              }}>
                <User size={13} /> {data.status === "CONFIRMADO" ? "Inscrição Confirmada" : data.status}
              </span>
              {data.checkinAt && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#DBEAFE", color: "#1D4ED8", fontSize: 12, fontWeight: 700, borderRadius: 999, padding: "4px 12px" }}>
                  <CheckCircle size={13} /> Check-in Realizado
                </span>
              )}
            </div>

            {/* QR Code */}
            <div style={{ textAlign: "center", padding: "20px 0", borderTop: "1px dashed #E5E7EB", borderBottom: "1px dashed #E5E7EB" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6B7280", fontWeight: 600 }}>Apresente este QR Code na entrada do evento</p>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code da inscrição" style={{ width: 200, height: 200, borderRadius: 12, border: "2px solid #E5E7EB" }} />
              ) : (
                <div style={{ width: 200, height: 200, borderRadius: 12, border: "2px dashed #E5E7EB", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 13 }}>
                  Gerando QR Code...
                </div>
              )}
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>{data.qrCode}</p>
            </div>

            {/* Products */}
            {hasProdutos && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Package size={15} /> Produtos Comprados
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {data.itensPedido.map(item => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#FAFAFA", borderRadius: 8, border: "1px solid #F3F4F6" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Produto × {item.quantidade}</div>
                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>R$ {item.preco.toFixed(2)}</div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 10px",
                        background: item.entregue ? "#DCFCE7" : "#FEF3C7",
                        color: item.entregue ? "#16A34A" : "#D97706",
                      }}>
                        {item.entregue ? "Entregue" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer info */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>
                Inscrição realizada em {new Date(data.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9CA3AF" }}>ID: {data.id}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
