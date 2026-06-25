"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, RotateCw, Download, Share2, Eye, CreditCard,
  Upload, Check, GripVertical, ImageIcon, Palette,
  ChevronRight, Printer, Info,
} from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";

const NAVY = "#1B2B4B";
const GOLD = "#C9993F";
const BG = "#F5F0EB";

interface MemberData {
  id: string;
  name: string;
  role: string | null;
  congregationId: string | null;
  memberSince: string;
  photo: string | null;
  status: string;
}

interface CongregationData {
  id: string;
  name: string;
}

interface CardModel {
  id: string;
  name: string;
  desc: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  subtext: string;
  wave: string;
}

const CARD_MODELS: CardModel[] = [
  { id: "elegante", name: "Elegante", desc: "Azul e dourado", primary: "#1B2B4B", secondary: "#C9993F", accent: "#E8B84B", bg: "linear-gradient(135deg, #1B2B4B 0%, #0F1A2E 100%)", text: "#FFFFFF", subtext: "rgba(255,255,255,0.7)", wave: "#C9993F" },
  { id: "minimalista", name: "Minimalista", desc: "Branco e dourado", primary: "#FFFFFF", secondary: "#F5F0EB", accent: "#C9993F", bg: "linear-gradient(135deg, #FFFFFF 0%, #F5F0EB 100%)", text: "#1B2B4B", subtext: "#6B7280", wave: "#C9993F" },
  { id: "moderno", name: "Moderno", desc: "Verde e escuro", primary: "#064E3B", secondary: "#065F46", accent: "#34D399", bg: "linear-gradient(135deg, #064E3B 0%, #022C22 100%)", text: "#FFFFFF", subtext: "rgba(255,255,255,0.7)", wave: "#34D399" },
  { id: "vibrante", name: "Vibrante", desc: "Roxo e degradê", primary: "#581C87", secondary: "#7C3AED", accent: "#A78BFA", bg: "linear-gradient(135deg, #581C87 0%, #3B0764 100%)", text: "#FFFFFF", subtext: "rgba(255,255,255,0.7)", wave: "#A78BFA" },
  { id: "classico", name: "Clássico", desc: "Preto e dourado", primary: "#111827", secondary: "#1F2937", accent: "#F59E0B", bg: "linear-gradient(135deg, #111827 0%, #000000 100%)", text: "#FFFFFF", subtext: "rgba(255,255,255,0.7)", wave: "#F59E0B" },
  { id: "clean", name: "Clean", desc: "Azul claro", primary: "#EFF6FF", secondary: "#DBEAFE", accent: "#3B82F6", bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", text: "#1E40AF", subtext: "#60A5FA", wave: "#3B82F6" },
];

const COLOR_PALETTE = ["#1B2B4B", "#C9993F", "#FFFFFF", "#9CA3AF", "#DC2626", "#16A34A", "#2563EB", "#7C3AED", "#D97706", "#EC4899"];

const INFO_FIELDS = [
  { id: "nome", label: "Nome", default: true },
  { id: "cargo", label: "Cargo / Função", default: true },
  { id: "congregacao", label: "Congregação", default: true },
  { id: "membroDesde", label: "Membro desde", default: true },
  { id: "idUnico", label: "ID Único", default: true },
  { id: "qrCode", label: "QR Code", default: true },
];

export default function CartaoMembroPage() {
  const params = useParams();
  const [member, setMember] = useState<MemberData | null>(null);
  const [congregation, setCongregation] = useState<CongregationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [showFront, setShowFront] = useState(true);

  // Personalization state
  const [selectedModel, setSelectedModel] = useState<CardModel>(CARD_MODELS[0]!);
  const [selectedColor, setSelectedColor] = useState(CARD_MODELS[0]!.primary);
  const [logoUrl, setLogoUrl] = useState("<span class=\"math-inline\">");
  const [showLogo, setShowLogo] = useState(true);
  const [activeFields, setActiveFields] = useState(INFO_FIELDS.filter(f => f.default).map(f => f.id));
  const [fieldOrder, setFieldOrder] = useState(INFO_FIELDS.map(f => f.id));
  const [draggingField, setDraggingField] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/members/${params.id}`)
      .then((r) => r.json())
      .then((d: { member?: MemberData }) => {
        setMember(d.member ?? null);
        if (d.member?.congregationId) {
          fetch(`/api/congregacoes`)
            .then(r => r.json())
            .then((c: { congregations?: CongregationData[] }) => {
              const cg = c.congregations?.find(x => x.id === d.member!.congregationId);
              setCongregation(cg ?? null);
            })
            .catch(() => null);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (member?.id) {
      QRCode.toDataURL(
        `${window.location.origin}/pessoas/${member.id}`,
        { width: 128, margin: 1, color: { dark: "#1B2B4B", light: "#FFFFFF" } }
      ).then(setQrCodeDataUrl).catch(() => setQrCodeDataUrl(""));
    }
  }, [member]);

  const handleModelSelect = (m: CardModel) => {
    setSelectedModel(m);
    setSelectedColor(m.primary);
  };

  const toggleField = (id: string) => {
    setActiveFields(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDragStart = (id: string) => setDraggingField(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggingField || draggingField === id) return;
    setFieldOrder(prev => {
      const idx = prev.indexOf(id);
      const dragIdx = prev.indexOf(draggingField);
      const next = [...prev];
      next.splice(dragIdx, 1);
      next.splice(idx > dragIdx ? idx : idx, 0, draggingField);
      return next;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!cardRef.current) return;
    import("html-to-image").then(({ toPng }) => {
      toPng(cardRef.current!, { cacheBust: true, pixelRatio: 2 }).then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `cartao-${member?.name?.toLowerCase().replace(/\s+/g, "-") || "membro"}.png`;
        link.href = dataUrl;
        link.click();
      }).catch(() => alert("Erro ao gerar imagem"));
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `cartao-${member?.name || "membro"}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `Cartão Digital - ${member?.name}` });
    } else {
      alert("Compartilhamento não suportado neste dispositivo. Use Baixar/Imprimir.");
    }
  };

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!member) return <div style={{ padding: "3rem", textAlign: "center", color: "#DC2626" }}>Membro não encontrado</div>;

  const memberSinceFormatted = new Date(member.memberSince).toLocaleDateString("pt-BR");
  const uniqueId = member.id.slice(0, 8).toUpperCase();

  const visibleFields = fieldOrder.filter(id => activeFields.includes(id));

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "1400px", margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href={`/pessoas/${member.id}`} style={{ display: "flex", alignItems: "center", gap: 6, color: NAVY, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
          </Link>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: NAVY, margin: 0 }}>Cartão Digital do Membro</h1>
            <p style={{ color: "#6B7280", fontSize: 13, margin: "2px 0 0" }}>Personalize o cartão digital que será compartilhado com o membro.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setFlipped(!flipped)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "white", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151" }}>
            <RotateCw size={14} strokeWidth={1.5} /> Girar Cartão
          </button>
          <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: NAVY, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            <Download size={14} strokeWidth={1.5} /> Baixar / Imprimir
          </button>
        </div>
      </div>

      {/* Three-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: 20, alignItems: "start" }}>
        {/* LEFT — Personalização */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>Personalização</h3>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>Edite as informações e o estilo do cartão</p>

            {/* Modelo do cartão */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8, display: "block" }}>Modelo do cartão</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {CARD_MODELS.slice(0, 4).map(m => (
                  <button key={m.id} onClick={() => handleModelSelect(m)} style={{ padding: 6, borderRadius: 8, border: selectedModel.id === m.id ? "2px solid " + GOLD : "2px solid transparent", cursor: "pointer", background: "#F3F4F6" }}>
                    <div style={{ height: 40, borderRadius: 6, background: m.bg }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Cores */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8, display: "block" }}>Cores do cartão</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLOR_PALETTE.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: selectedColor === c ? "2px solid #111827" : "2px solid transparent", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }} />
                ))}
              </div>
            </div>

            {/* Logo */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8, display: "block" }}>Logo da igreja</label>
              <label style={{ display: "block", padding: "12px", border: "2px dashed #E5E7EB", borderRadius: 8, textAlign: "center", cursor: "pointer", color: "#6B7280", fontSize: 12 }}>
                <Upload size={16} strokeWidth={1.5} style={{ margin: "0 auto 4px", display: "block" }} />
                Enviar logo
                <br />
                <span style={{ fontSize: 10 }}>PNG ou JPG (máx. 2MB)</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </label>
              {logoUrl && <img src={logoUrl} alt="Logo preview" style={{ width: "100%", maxHeight: 60, objectFit: "contain", marginTop: 8, borderRadius: 4 }} />}
            </div>

            {/* Toggle logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#374151" }}>Exibir logo da igreja no cartão</span>
              <button onClick={() => setShowLogo(!showLogo)} style={{ width: 40, height: 22, borderRadius: 11, background: showLogo ? NAVY : "#E5E7EB", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: showLogo ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
              </button>
            </div>

            {/* Informações exibidas */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8, display: "block" }}>Informações exibidas</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {fieldOrder.map(id => {
                  const f = INFO_FIELDS.find(x => x.id === id)!;
                  const active = activeFields.includes(id);
                  return (
                    <div key={id} draggable onDragStart={() => handleDragStart(id)} onDragOver={(e) => handleDragOver(e, id)} onDragEnd={() => setDraggingField(null)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", background: active ? "#F9FAFB" : "transparent", borderRadius: 6, cursor: "grab", opacity: draggingField === id ? 0.5 : 1 }}
                    >
                      <GripVertical size={14} color="#9CA3AF" />
                      <button onClick={() => toggleField(id)} style={{ width: 18, height: 18, borderRadius: 4, border: active ? "none" : "1.5px solid #D1D5DB", background: active ? NAVY : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        {active && <Check size={12} color="white" strokeWidth={2.5} />}
                      </button>
                      <span style={{ fontSize: 12, color: active ? "#374151" : "#9CA3AF", fontWeight: 500 }}>{f.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CENTER — Preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{ perspective: 1000, width: "100%", maxWidth: 380 }}
          >
            <div ref={cardRef}
              style={{
                width: "100%", aspectRatio: "1 / 1.58", borderRadius: 16, overflow: "hidden", position: "relative",
                background: selectedModel.bg,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                transformStyle: "preserve-3d",
                transition: "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* FRONT */}
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", display: "flex", flexDirection: "column", padding: "1.5rem", color: selectedModel.text }}>
                {/* Wave decoration */}
                <svg viewBox="0 0 400 600" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15, pointerEvents: "none" }}>
                  <path d="M0,300 Q100,200 200,300 T400,300 L400,600 L0,600 Z" fill={selectedModel.wave} />
                  <path d="M0,450 Q150,350 300,450 T400,450 L400,600 L0,600 Z" fill={selectedModel.wave} />
                </svg>

                {/* Top: Logo + Church name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem", zIndex: 1 }}>
                  {showLogo && logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4 }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: selectedModel.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ChurchIcon size={18} color={selectedModel.primary} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.02em" }}>IGREJA BETESDA</div>
                    <div style={{ fontSize: "0.6rem", color: selectedModel.subtext, letterSpacing: "0.05em" }}>CRESCENDO JUNTOS EM CRISTO</div>
                  </div>
                </div>

                {/* Photo */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", zIndex: 1 }}>
                  <div style={{ width: 110, height: 110, borderRadius: "50%", border: `3px solid ${selectedModel.accent}`, overflow: "hidden", background: member.photo ? `url(${member.photo}) center/cover` : selectedModel.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700 }}>
                    {!member.photo && member.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                </div>

                {/* Info */}
                <div style={{ textAlign: "center", zIndex: 1, flex: 1 }}>
                  {visibleFields.includes("nome") && (
                    <>
                      <div style={{ fontSize: "0.65rem", color: selectedModel.subtext, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Nome</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>{member.name}</div>
                    </>
                  )}
                  {visibleFields.includes("cargo") && member.role && (
                    <>
                      <div style={{ fontSize: "0.65rem", color: selectedModel.subtext, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Cargo / Função</div>
                      <div style={{ fontSize: "0.95rem", color: selectedModel.accent, fontWeight: 600, marginBottom: "0.75rem" }}>{member.role}</div>
                    </>
                  )}

                  <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "0.5rem" }}>
                    {visibleFields.includes("congregacao") && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.6rem", color: selectedModel.subtext, textTransform: "uppercase", letterSpacing: "0.06em" }}>Congregação</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{congregation?.name || "Sede"}</div>
                      </div>
                    )}
                    {visibleFields.includes("membroDesde") && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.6rem", color: selectedModel.subtext, textTransform: "uppercase", letterSpacing: "0.06em" }}>Membro desde</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{memberSinceFormatted}</div>
                      </div>
                    )}
                    {visibleFields.includes("idUnico") && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.6rem", color: selectedModel.subtext, textTransform: "uppercase", letterSpacing: "0.06em" }}>ID Único</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{uniqueId}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom quote */}
                <div style={{ textAlign: "center", marginTop: "auto", zIndex: 1 }}>
                  <div style={{ fontSize: "0.85rem", fontStyle: "italic", color: selectedModel.accent, fontWeight: 500 }}>"Servir a Deus é o nosso propósito!"</div>
                </div>

                {/* QR Code */}
                {visibleFields.includes("qrCode") && qrCodeDataUrl && (
                  <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 1 }}>
                    <img src={qrCodeDataUrl} alt="QR" style={{ width: 56, height: 56, borderRadius: 6, background: "white", padding: 3 }} />
                    <div style={{ fontSize: "0.5rem", textAlign: "center", color: selectedModel.subtext, marginTop: 2 }}>ID: {uniqueId}</div>
                  </div>
                )}
              </div>

              {/* BACK */}
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: selectedModel.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", color: selectedModel.text }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${selectedModel.accent}`, overflow: "hidden", background: member.photo ? `url(${member.photo}) center/cover` : selectedModel.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                  {!member.photo && member.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>{member.name}</div>
                {member.role && <div style={{ fontSize: "0.8rem", color: selectedModel.accent, marginBottom: "1rem" }}>{member.role}</div>}
                <div style={{ width: 40, height: 2, background: selectedModel.accent, borderRadius: 1, marginBottom: "1rem" }} />
                <p style={{ fontSize: "0.75rem", color: selectedModel.subtext, textAlign: "center", lineHeight: 1.6, maxWidth: 260 }}>
                  Este cartão identifica o portador como membro ativo da Igreja Betesda. Em caso de perda, entre em contato com a secretaria.
                </p>
                <div style={{ marginTop: "auto", fontSize: "0.6rem", color: selectedModel.subtext }}>
                  Emitido em {new Date().toLocaleDateString("pt-BR")} • ID: {uniqueId}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Front/Back toggle */}
          <div style={{ display: "flex", gap: 8, background: "white", borderRadius: 8, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <button onClick={() => { setShowFront(true); setFlipped(false); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: showFront ? NAVY : "transparent", color: showFront ? "white" : "#374151" }}>
              <Eye size={14} strokeWidth={1.5} /> Frente do cartão
            </button>
            <button onClick={() => { setShowFront(false); setFlipped(true); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: !showFront ? NAVY : "transparent", color: !showFront ? "white" : "#374151" }}>
              <CreditCard size={14} strokeWidth={1.5} /> Verso do cartão
            </button>
          </div>
        </div>

        {/* RIGHT — Modelos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>Escolha um modelo</h3>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 16px" }}>Selecione o estilo do cartão</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CARD_MODELS.map(m => (
                <button key={m.id} onClick={() => handleModelSelect(m)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: selectedModel.id === m.id ? "2px solid " + GOLD : "1.5px solid #F3F4F6", background: "white", cursor: "pointer", textAlign: "left" }}
                >
                  <div style={{ width: 48, height: 32, borderRadius: 6, background: m.bg, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.name}</span>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", border: selectedModel.id === m.id ? "4px solid " + GOLD : "1.5px solid #D1D5DB" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{m.desc}</span>
                  </div>
                </button>
              ))}

              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderRadius: 10, border: "1.5px dashed #D1D5DB", background: "white", cursor: "pointer", color: "#6B7280", fontSize: 13, fontWeight: 500 }}>
                <PlusIcon size={16} /> Criar modelo personalizado
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer tip + share */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#FEF3C7", borderRadius: 10 }}>
          <Info size={16} color="#D97706" />
          <span style={{ fontSize: 12, color: "#92400E" }}>Dica: Você pode compartilhar o cartão digital com o membro através do WhatsApp, email ou impresso.</span>
        </div>
        <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "white", border: "1.5px solid " + NAVY, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: NAVY }}>
          <Share2 size={14} strokeWidth={1.5} /> Compartilhar cartão
        </button>
      </div>
    </div>
  );
}

function ChurchIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 21V9.5L12 4 6 9.5V21" />
      <path d="M9 21h6" />
      <path d="M10 21v-4h4v4" />
      <path d="M12 4V2" />
    </svg>
  );
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
