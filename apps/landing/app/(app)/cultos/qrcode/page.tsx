"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Share2, Copy, Check, Plus, Clock, Users } from "lucide-react";
import Link from "next/link";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Culto {
  id: string;
  titulo: string;
  data: string;
  ativo: boolean;
  qrCode: string;
  _count: { checkins: number };
}

export default function QrCodesPage() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://firmes.vercel.app";

  useEffect(() => {
    fetch("/api/cultos")
      .then(r => r.json())
      .then(async d => {
        const lista: Culto[] = d.cultos || [];
        setCultos(lista);

        // Gerar QR Codes para todos
        const QRCode = (await import("qrcode")).default;
        const imgs: Record<string, string> = {};
        for (const c of lista) {
          try {
            imgs[c.id] = await QRCode.toDataURL(`${BASE_URL}/checkin/${c.qrCode}`, {
              width: 260, margin: 2, color: { dark: NAVY, light: "#ffffff" },
            });
          } catch {}
        }
        setQrImages(imgs);
      })
      .finally(() => setLoading(false));
  }, [BASE_URL]);

  const copiar = (cultoId: string, qrCode: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/checkin/${qrCode}`);
    setCopiado(cultoId);
    setTimeout(() => setCopiado(null), 2000);
  };

  const ativos = cultos.filter(c => c.ativo);
  const encerrados = cultos.filter(c => !c.ativo);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>QR Codes dos Cultos</h1>
          <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>
            {ativos.length} culto{ativos.length !== 1 ? "s" : ""} ativo{ativos.length !== 1 ? "s" : ""} · Escaneie na entrada para fazer check-in
          </p>
        </div>
        <Link href="/cultos/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
          <Plus size={16} /> Novo Culto
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: 64, textAlign: "center", color: "#9CA3AF" }}>Gerando QR Codes...</div>
      ) : cultos.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, padding: 60, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <QrCode size={48} style={{ margin: "0 auto 16px", color: "#D1D5DB" }} />
          <p style={{ color: "#9CA3AF", margin: "0 0 16px" }}>Nenhum culto cadastrado ainda</p>
          <Link href="/cultos/novo" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            <Plus size={14} /> Criar primeiro culto
          </Link>
        </div>
      ) : (
        <>
          {/* Cultos ativos */}
          {ativos.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} /> Ativos ({ativos.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
                {ativos.map((c, i) => (
                  <QrCard key={c.id} culto={c} qrImg={qrImages[c.id]} baseUrl={BASE_URL} copiado={copiado} onCopiar={copiar} index={i} ativo />
                ))}
              </div>
            </section>
          )}

          {/* Cultos encerrados */}
          {encerrados.length > 0 && (
            <section>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9CA3AF", display: "inline-block" }} /> Encerrados ({encerrados.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
                {encerrados.map((c, i) => (
                  <QrCard key={c.id} culto={c} qrImg={qrImages[c.id]} baseUrl={BASE_URL} copiado={copiado} onCopiar={copiar} index={i} ativo={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function QrCard({ culto, qrImg, baseUrl, copiado, onCopiar, index, ativo }: {
  culto: Culto; qrImg?: string; baseUrl: string; copiado: string | null;
  onCopiar: (id: string, qr: string) => void; index: number; ativo: boolean;
}) {
  const url = `${baseUrl}/checkin/${culto.qrCode}`;
  const isCopied = copiado === culto.id;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: ativo ? "2px solid #DCFCE7" : "2px solid #F3F4F6" }}>

      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", background: ativo ? "#F0FDF4" : "#F9FAFB" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#0D2545" }}>{culto.titulo}</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
                <Clock size={11} /> {new Date(culto.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
                <Users size={11} /> {culto._count.checkins} presentes
              </span>
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: ativo ? "#DCFCE7" : "#F3F4F6", color: ativo ? "#16A34A" : "#9CA3AF" }}>
            {ativo ? "ATIVO" : "ENCERRADO"}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div style={{ padding: 20, textAlign: "center" }}>
        {qrImg ? (
          <img src={qrImg} alt={`QR Code - ${culto.titulo}`} style={{ width: 220, height: 220, borderRadius: 8, margin: "0 auto" }} />
        ) : (
          <div style={{ width: 220, height: 220, background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
            <QrCode size={50} color="#D1D5DB" />
          </div>
        )}
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: "8px 0 0", wordBreak: "break-all" }}>
          {url.replace("https://", "").slice(0, 48)}{url.length > 52 ? "…" : ""}
        </p>
      </div>

      {/* Ações */}
      <div style={{ padding: "12px 18px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onCopiar(culto.id, culto.qrCode)}
          style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 10px", background: isCopied ? "#DCFCE7" : "#F3F4F6", color: isCopied ? "#16A34A" : "#374151", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {isCopied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar link</>}
        </button>

        <a href={`https://wa.me/?text=${encodeURIComponent(`✅ Check-in: ${culto.titulo}\n${url}`)}`} target="_blank"
          style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 10px", background: "#DCFCE7", color: "#16A34A", borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
          <Share2 size={13} /> WhatsApp
        </a>

        {qrImg && (
          <a href={qrImg} download={`qrcode-${culto.titulo}.png`}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 10px", background: "#EEF2FA", color: "#1A3C6E", borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            <Download size={13} /> PNG
          </a>
        )}

        <Link href={`/cultos/${culto.id}`}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "7px 10px", background: "#1A3C6E", color: "#fff", borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
          Ver painel
        </Link>
      </div>
    </motion.div>
  );
}
