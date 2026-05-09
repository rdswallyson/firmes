"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, QrCode, Download, Share2, ArrowLeft, Copy, Check, UserCheck, UserPlus, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Checkin {
  id: string;
  nome: string;
  tipo: string;
  telefone?: string;
  comoConheceu?: string;
  createdAt: string;
}

interface Culto {
  id: string;
  titulo: string;
  data: string;
  qrCode: string;
  ativo: boolean;
}

export default function CultoPainelPage() {
  const params = useParams();
  const id = params.id as string;
  const [culto, setCulto] = useState<Culto | null>(null);
  const [membros, setMembros] = useState<Checkin[]>([]);
  const [visitantes, setVisitantes] = useState<Checkin[]>([]);
  const [aba, setAba] = useState<"membros" | "visitantes">("membros");
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://firmes.vercel.app";

  const fetchDados = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin/${id}/lista`);
      const data = await res.json();
      setMembros(data.membros || []);
      setVisitantes(data.visitantes || []);
      setLastUpdate(new Date());
    } catch {}
  }, [id]);

  useEffect(() => {
    // Load culto details
    fetch(`/api/cultos/${id}`)
      .then(r => r.json())
      .then(async data => {
        setCulto(data.culto);
        setMembros(data.membros || []);
        setVisitantes(data.visitantes || []);
        // Generate QR Code
        if (data.culto?.qrCode) {
          try {
            const QRCode = (await import("qrcode")).default;
            const url = `${BASE_URL}/checkin/${data.culto.qrCode}`;
            const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: NAVY, light: "#ffffff" } });
            setQrDataUrl(dataUrl);
          } catch (err) {
            console.error("QR generation error:", err);
          }
        }
      })
      .finally(() => setLoading(false));

    // Poll a cada 10 segundos
    const interval = setInterval(fetchDados, 10000);
    return () => clearInterval(interval);
  }, [id, BASE_URL, fetchDados]);

  const copiarLink = () => {
    if (!culto) return;
    navigator.clipboard.writeText(`${BASE_URL}/checkin/${culto.qrCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportarCSV = () => {
    const rows = [...membros.map(c => ({ ...c, tipo: "MEMBRO" })), ...visitantes.map(c => ({ ...c, tipo: "VISITANTE" }))];
    const csv = ["Nome,Tipo,Telefone,Como Conheceu,Hora", ...rows.map(r => `${r.nome},${r.tipo},${r.telefone || ""},${r.comoConheceu || ""},${new Date(r.createdAt).toLocaleTimeString("pt-BR")}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `checkin-${culto?.titulo || id}.csv`;
    link.click();
  };

  const converterEmMembro = (checkin: Checkin) => {
    // Navigate to novo membro with pre-filled name
    window.open(`/pessoas/novo?nome=${encodeURIComponent(checkin.nome)}&telefone=${encodeURIComponent(checkin.telefone || "")}`, "_blank");
  };

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!culto) return <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>Culto não encontrado</div>;

  const checkinUrl = `${BASE_URL}/checkin/${culto.qrCode}`;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/cultos" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6B7280", fontSize: 14, textDecoration: "none", marginBottom: 12 }}>
          <ArrowLeft size={16} /> Voltar para Cultos
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>{culto.titulo}</h1>
            <p style={{ color: "#6B7280", fontSize: 13, margin: 0 }}>{new Date(culto.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchDados} title="Atualizar" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw size={14} /> Atualizar
            </button>
            <button onClick={exportarCSV} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 14px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
        {/* QR Code Card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: NAVY }}>QR Code do Culto</h2>

          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" style={{ width: 260, height: 260, borderRadius: 8, margin: "0 auto 16px" }} />
          ) : (
            <div style={{ width: 260, height: 260, background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <QrCode size={60} color="#D1D5DB" />
            </div>
          )}

          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>Exiba este QR Code na entrada do culto</p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
            <button onClick={copiarLink} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 12px", background: copied ? "#DCFCE7" : "#F3F4F6", color: copied ? "#16A34A" : "#374151", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar link</>}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`Faça seu check-in: ${checkinUrl}`)}`} target="_blank" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "#DCFCE7", color: "#16A34A", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              <Share2 size={13} /> WhatsApp
            </a>
          </div>

          {qrDataUrl && (
            <a href={qrDataUrl} download={`qrcode-${culto.titulo}.png`} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 14px", background: NAVY, color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              <Download size={14} /> Baixar QR Code
            </a>
          )}
        </div>

        {/* Lista em tempo real */}
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Total", value: membros.length + visitantes.length, color: NAVY, bg: "#EEF2FA", icon: <Users size={18} /> },
              { label: "Membros", value: membros.length, color: "#16A34A", bg: "#DCFCE7", icon: <UserCheck size={18} /> },
              { label: "Visitantes", value: visitantes.length, color: GOLD, bg: "#FFF8EE", icon: <UserPlus size={18} /> },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0D2545" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Abas */}
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ display: "flex", borderBottom: "1px solid #F3F4F6" }}>
              {(["membros", "visitantes"] as const).map(tab => (
                <button key={tab} onClick={() => setAba(tab)}
                  style={{ flex: 1, padding: "14px", border: "none", background: "transparent", fontWeight: 700, fontSize: 14, cursor: "pointer", color: aba === tab ? NAVY : "#9CA3AF", borderBottom: aba === tab ? `2.5px solid ${NAVY}` : "2.5px solid transparent", textTransform: "capitalize" }}>
                  {tab === "membros" ? `Membros (${membros.length})` : `Visitantes (${visitantes.length})`}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              {(aba === "membros" ? membros : visitantes).length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
                  <Users size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>Nenhum {aba === "membros" ? "membro" : "visitante"} ainda</p>
                </div>
              ) : (
                (aba === "membros" ? membros : visitantes).map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ padding: "12px 20px", borderBottom: "1px solid #F9FAFB", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: aba === "membros" ? "#EEF2FA" : "#FFF8EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: aba === "membros" ? NAVY : GOLD, flexShrink: 0 }}>
                      {(c.nome?.[0] || "?").toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#0D2545" }}>{c.nome}</div>
                      {c.telefone && <div style={{ fontSize: 12, color: "#6B7280" }}>{c.telefone}</div>}
                      {c.comoConheceu && <div style={{ fontSize: 11, color: "#9CA3AF" }}>Como conheceu: {c.comoConheceu}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>{new Date(c.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: aba === "membros" ? "#EEF2FA" : "#FFF8EE", color: aba === "membros" ? NAVY : GOLD }}>
                        {aba === "membros" ? "MEMBRO" : "VISITANTE"}
                      </span>
                      {aba === "visitantes" && (
                        <button onClick={() => converterEmMembro(c)} title="Converter em membro" style={{ padding: "4px 8px", background: "#DCFCE7", color: "#16A34A", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                          + Membro
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <p style={{ textAlign: "right", fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>
            Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")} · Atualiza a cada 10s
          </p>
        </div>
      </div>
    </div>
  );
}
