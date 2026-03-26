"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Share2 } from "lucide-react";

interface MemberData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  birthDate: string | null;
  baptismDate: string | null;
  role: string | null;
  status: string;
  memberSince: string;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function CartaoDigitalPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    fetch(`/api/members/${params.id}`)
      .then((r) => r.json())
      .then(async (d: { member?: MemberData }) => {
        setMember(d.member ?? null);
        if (d.member) {
          const QRCode = await import("qrcode");
          const url = `${window.location.origin}/pessoas/${d.member.id}`;
          const dataUrl = await QRCode.toDataURL(url, { width: 120, margin: 1, color: { dark: "#1A3C6E", light: "#FFFFFF" } });
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [params.id]);

  function handlePrint() {
    window.print();
  }

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Carregando...</div>;
  if (!member) return <div style={{ padding: "3rem", textAlign: "center", color: "#DC2626" }}>Membro não encontrado</div>;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div className="no-print">
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.8375rem", marginBottom: "1rem", padding: 0 }}>
          <ArrowLeft size={16} strokeWidth={1.5} /> Voltar
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Cartão Digital</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 1rem", background: "#1A3C6E", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 }}>
              <Download size={14} strokeWidth={1.5} /> Baixar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Card */}
      <div id="member-card" style={{
        background: "linear-gradient(145deg, #0D2545 0%, #1A3C6E 60%, #1E4A84 100%)",
        borderRadius: "16px",
        padding: "2rem",
        color: "white",
        boxShadow: "0 8px 32px rgba(26,60,110,0.25)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(200,146,42,0.08)" }} />
        <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        {/* Church logo and name */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", position: "relative" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(200,146,42,0.2)", border: "1px solid rgba(200,146,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
              <path d="M22 6 C14 6 8 12 8 20 C8 27 12 33 18 36 L18 38 C18 39.1 18.9 40 20 39.5 C21 39 22 37 22 35 C22 37 23 39 24 39.5 C25.1 40 26 39.1 26 38 L26 36 C32 33 36 27 36 20 C36 12 30 6 22 6Z" fill="#C8922A" opacity="0.9"/>
            </svg>
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.04em" }}>FIRMES</span>
          <span style={{ fontSize: "0.65rem", color: "rgba(200,146,42,0.8)", marginLeft: "auto" }}>CARTÃO DE MEMBRO</span>
        </div>

        <div style={{ display: "flex", gap: "1.25rem", position: "relative" }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "12px",
            background: member.photo ? `url(${member.photo}) center/cover` : `hsl(${member.name.charCodeAt(0) * 7},55%,82%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", fontWeight: 700,
            color: `hsl(${member.name.charCodeAt(0) * 7},40%,30%)`,
            border: "2px solid rgba(255,255,255,0.2)", flexShrink: 0,
          }}>
            {!member.photo && member.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.25rem" }}>{member.name}</h2>
            {member.role && <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "rgba(200,146,42,0.9)" }}>{member.role}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.7)" }}>
              <span>Batismo: {formatDate(member.baptismDate)}</span>
              <span>Membro desde: {formatDate(member.memberSince)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>
            ID: {member.id.substring(0, 12)}
          </div>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR Code" style={{ width: "80px", height: "80px", borderRadius: "6px" }} />
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #member-card { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
