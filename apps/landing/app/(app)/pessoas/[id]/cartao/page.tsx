"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Phone, Mail, MapPin, Smartphone, Church, Calendar, QrCode, User } from "lucide-react";

interface MemberData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  birthDate: string | null;
  baptismDate: string | null;
  dataBatismoEspirito: string | null;
  address: string | null;
  number: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  role: string | null;
  status: string;
  memberSince: string | null;
  whatsapp: string | null;
  ministerios: string[];
  createdAt?: string;
}

interface TenantData {
  name: string;
  slug: string;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function CartaoDigitalPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [flipped, setFlipped] = useState(false);

  const memberId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  useEffect(() => {
    if (!memberId) { setLoading(false); return; }

    // Fetch member
    fetch(`/api/members/${memberId}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(async (d: { member?: MemberData }) => {
        setMember(d.member ?? null);
        if (d.member) {
          const QRCode = await import("qrcode");
          const url = `${window.location.origin}/portal/${d.member.id}`;
          const dataUrl = await QRCode.toDataURL(url, { width: 140, margin: 1, color: { dark: "#1A3C6E", light: "#FFFFFF" } });
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => setMember(null))
      .finally(() => setLoading(false));

    // Fetch tenant info for church name
    fetch("/api/tenant/me")
      .then(r => r.json())
      .then((t: { name?: string; slug?: string }) => {
        if (t?.name) setTenant({ name: t.name, slug: t.slug || "" });
      })
      .catch(() => null);
  }, [memberId]);

  function handlePrint() {
    window.print();
  }

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!member) return <div style={{ padding: "3rem", textAlign: "center", color: "#DC2626" }}>Membro não encontrado</div>;

  const churchName = tenant?.name || "FIRMES";
  const memberPhoto = member.photo;
  const memberInitials = initials(member.name);

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* No-print header */}
      <div className="no-print">
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.8375rem", marginBottom: "0.75rem", padding: 0 }}>
          <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Cartão Digital do Membro</h1>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button onClick={() => setFlipped(f => !f)}
              style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1rem", background: "white", border: "1px solid #E5E7EB", color: "#374151", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
              <QrCode size={14} strokeWidth={1.5} /> Girar Cartão
            </button>
            <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
              <Download size={14} strokeWidth={1.5} /> Baixar / Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Card container with 3D perspective */}
      <motion.div id="member-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ perspective: 1200, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>

        {/* 3D Card */}
        <div style={{
          position: "relative",
          width: 520,
          height: 310,
          borderRadius: 18,
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}>

          {/* ══ FRONT SIDE ══ */}
          <div style={{
            position: "absolute",
            width: 520,
            height: 310,
            borderRadius: 18,
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 50%, #1E4A84 100%)",
            color: "white",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(26,60,110,0.25)",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Pattern overlay */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: `radial-gradient(circle at 20% 80%, #C8922A 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 40%)` }} />

            {/* Church name banner (top) */}
            <div style={{ position: "relative", background: "rgba(200,146,42,0.15)", borderBottom: "1px solid rgba(200,146,42,0.3)", padding: "0.65rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Church size={16} strokeWidth={1.5} color="#C8922A" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.04em", color: "#FCD34D", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{churchName.toUpperCase()}</span>
              <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginLeft: "auto", letterSpacing: "0.05em" }}>CARTÃO DE MEMBRO</span>
            </div>

            {/* Front body */}
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem 1.5rem" }}>
              {/* Photo */}
              <div style={{
                width: 110, height: 110, borderRadius: "50%",
                background: memberPhoto ? `url(${memberPhoto}) center/cover` : `linear-gradient(135deg, hsl(${member.name.charCodeAt(0) * 7},55%,82%) 0%, hsl(${member.name.charCodeAt(0) * 7 + 30},50%,72%) 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 700,
                color: memberPhoto ? "transparent" : `hsl(${member.name.charCodeAt(0) * 7},40%,30%)`,
                border: "3px solid rgba(200,146,42,0.5)",
                flexShrink: 0,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>
                {!memberPhoto && memberInitials}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#FCD34D", letterSpacing: "0.03em" }}>NOME</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, margin: "2px 0 0.5rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{member.name}</div>

                {member.role && (
                  <>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Cargo / Função</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 500, color: "#C8922A", marginBottom: "0.5rem" }}>{member.role}</div>
                  </>
                )}

                <div style={{ display: "flex", gap: "1.25rem" }}>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Membro desde</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{formatDate(member.memberSince)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.04em" }}>ID Único</div>
                    <div style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>{member.id.substring(0, 8).toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom gold strip */}
            <div style={{ height: 6, background: "linear-gradient(90deg, #C8922A 0%, #E8B84B 50%, #C8922A 100%)" }} />
          </div>

          {/* ══ BACK SIDE ══ */}
          <div style={{
            position: "absolute",
            width: 520,
            height: 310,
            borderRadius: 18,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)",
            color: "#1F2937",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(26,60,110,0.15)",
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(200,146,42,0.15)",
          }}>
            {/* Top navy strip */}
            <div style={{ background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 100%)", padding: "0.65rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "white", letterSpacing: "0.04em" }}>{churchName.toUpperCase()}</span>
              <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>VERIFICADO</span>
            </div>

            {/* Back body */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", padding: "1.5rem", alignItems: "center" }}>
              {/* Left: Contact info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1A3C6E", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <User size={12} /> Dados do Membro
                </div>

                {member.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#374151" }}>
                    <Phone size={13} strokeWidth={1.5} color="#6B7280" />
                    <span>{member.phone}</span>
                  </div>
                )}

                {member.whatsapp && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#374151" }}>
                    <Smartphone size={13} strokeWidth={1.5} color="#16A34A" />
                    <a href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "#16A34A", textDecoration: "none" }}>
                      {member.whatsapp}
                    </a>
                  </div>
                )}

                {member.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#374151" }}>
                    <Mail size={13} strokeWidth={1.5} color="#6B7280" />
                    <a href={`mailto:${member.email}`} style={{ color: "#374151", textDecoration: "none" }}>{member.email}</a>
                  </div>
                )}

                {member.baptismDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#374151" }}>
                    <Calendar size={13} strokeWidth={1.5} color="#C8922A" />
                    <span>Batismo nas águas: {formatDate(member.baptismDate)}</span>
                  </div>
                )}

                {member.dataBatismoEspirito && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#374151" }}>
                    <Church size={13} strokeWidth={1.5} color="#7C3AED" />
                    <span>Batismo no Espírito: {formatDate(member.dataBatismoEspirito)}</span>
                  </div>
                )}

                {(member.address || member.city) && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#6B7280" }}>
                    <MapPin size={13} strokeWidth={1.5} color="#6B7280" />
                    <span>{[member.address, member.number, member.city, member.state].filter(Boolean).join(", ").substring(0, 45)}{[member.address, member.number, member.city, member.state].filter(Boolean).join(", ").length > 45 ? "..." : ""}</span>
                  </div>
                )}
              </div>

              {/* Right: QR Code */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                {qrDataUrl ? (
                  <div style={{ padding: "0.5rem", background: "white", borderRadius: 10, border: "2px solid #E5E7EB" }}>
                    <img src={qrDataUrl} alt="QR Code" style={{ width: 100, height: 100 }} />
                  </div>
                ) : (
                  <div style={{ width: 100, height: 100, borderRadius: 10, background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode size={36} color="#9CA3AF" />
                  </div>
                )}
                <div style={{ fontSize: "0.6rem", color: "#9CA3AF", textAlign: "center", letterSpacing: "0.02em" }}>
                  Escaneie para ver<br />o perfil no portal
                </div>
              </div>
            </div>

            {/* Bottom gold strip */}
            <div style={{ height: 6, background: "linear-gradient(90deg, #C8922A 0%, #E8B84B 50%, #C8922A 100%)" }} />
          </div>
        </div>
      </motion.div>

      {/* Print layout: show both sides */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #member-card > div { transform: none !important; box-shadow: none !important; }
          #member-card > div > div:first-child { position: relative !important; transform: none !important; width: 520px !important; height: 310px !important; margin-bottom: 10px !important; }
          #member-card > div > div:last-child { position: relative !important; transform: rotateY(0deg) !important; width: 520px !important; height: 310px !important; }
        }
      `}</style>
    </div>
  );
}
