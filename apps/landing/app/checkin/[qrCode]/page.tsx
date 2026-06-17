"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Search, UserCheck, UserPlus, CheckCircle, Loader2 } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

interface Culto {
  id: string;
  titulo: string;
  data: string;
  qrCode: string;
  ativo: boolean;
  tenant: { name: string; logo?: string };
}

interface Membro {
  id: string;
  name: string;
  phone?: string;
}

type Tipo = "MEMBRO" | "VISITANTE" | null;
type Etapa = "escolha" | "membro" | "visitante" | "sucesso";

export default function CheckinPublicoPage() {
  const params = useParams();
  const qrCode = params.qrCode as string;

  const [culto, setCulto] = useState<Culto | null>(null);
  const [loadingCulto, setLoadingCulto] = useState(true);
  const [etapa, setEtapa] = useState<Etapa>("escolha");
  const [tipo, setTipo] = useState<Tipo>(null);

  // membro
  const [busca, setBusca] = useState("");
  const [membros, setMembros] = useState<Membro[]>([]);
  const [membroSelecionado, setMembroSelecionado] = useState<Membro | null>(null);
  const [buscando, setBuscando] = useState(false);

  // visitante
  const [form, setForm] = useState({ nome: "", telefone: "", comoConheceu: "" });

  const [salvando, setSalvando] = useState(false);
  const [nomeConfirmado, setNomeConfirmado] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`/api/checkin/registrar?qrCode=${qrCode}`)
      .then(r => r.json())
      .then(data => setCulto(data.culto))
      .catch(() => {})
      .finally(() => setLoadingCulto(false));
  }, [qrCode]);

  // Busca membros com debounce
  useEffect(() => {
    if (!busca || busca.length < 2) { setMembros([]); return; }
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(`/api/members?search=${encodeURIComponent(busca)}&limit=8`);
        const data = await res.json();
        setMembros(data.members || []);
      } catch {} finally { setBuscando(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const dispararConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: [NAVY, GOLD, "#ffffff"] });
    } catch {}
  };

  const confirmar = async () => {
    setSalvando(true);
    setErro("");
    try {
      const body = tipo === "MEMBRO"
        ? { qrCode, nome: membroSelecionado!.name, tipo: "MEMBRO", memberId: membroSelecionado!.id, telefone: membroSelecionado!.phone }
        : { qrCode, nome: form.nome, tipo: "VISITANTE", telefone: form.telefone, comoConheceu: form.comoConheceu };

      const res = await fetch(`/api/checkin/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao registrar presença");

      setNomeConfirmado(body.nome);
      setEtapa("sucesso");
      await dispararConfetti();
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loadingCulto) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} color={NAVY} />
      </div>
    );
  }

  if (!culto) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0EB", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "#DC2626", fontWeight: 700 }}>QR Code inválido ou culto encerrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "var(--font-nunito), system-ui, sans-serif" }}>
      {/* Header Igreja */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {culto.tenant?.logo ? (
          <img src={culto.tenant.logo} alt={culto.tenant.name} style={{ height: 52, marginBottom: 8, objectFit: "contain" }} />
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", color: "#fff", fontWeight: 900, fontSize: 20 }}>
            {culto.tenant?.name?.[0] || "F"}
          </div>
        )}
        <p style={{ fontWeight: 700, color: NAVY, margin: "0 0 2px", fontSize: 15 }}>{culto.tenant?.name}</p>
        <h1 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#0D2545", margin: "0 0 4px" }}>{culto.titulo}</h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
          {new Date(culto.data).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}>

        {/* ETAPA: SUCESSO */}
        {etapa === "sucesso" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle size={40} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0D2545", margin: "0 0 8px" }}>Presença confirmada!</h2>
            <p style={{ color: "#6B7280", margin: "0 0 6px" }}>Seja bem-vindo, <strong>{nomeConfirmado}</strong>!</p>
            <p style={{ color: "#9CA3AF", fontSize: 13 }}>Que Deus abençoe o seu dia. 🙏</p>
            <button onClick={() => { setEtapa("escolha"); setMembroSelecionado(null); setBusca(""); setForm({ nome: "", telefone: "", comoConheceu: "" }); }}
              style={{ marginTop: 20, padding: "10px 24px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Novo check-in
            </button>
          </div>
        )}

        {/* ETAPA: ESCOLHA */}
        {etapa === "escolha" && (
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0D2545", textAlign: "center", margin: "0 0 20px" }}>Como você se identifica?</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <button onClick={() => { setTipo("MEMBRO"); setEtapa("membro"); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "#EEF2FA", border: `2px solid ${NAVY}`, borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
                <UserCheck size={28} color={NAVY} />
                <div>
                  <div style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}>Sou MEMBRO</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>Já sou cadastrado nesta igreja</div>
                </div>
              </button>
              <button onClick={() => { setTipo("VISITANTE"); setEtapa("visitante"); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "#FFF8EE", border: `2px solid ${GOLD}`, borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
                <UserPlus size={28} color={GOLD} />
                <div>
                  <div style={{ fontWeight: 800, color: GOLD, fontSize: 15 }}>Sou VISITANTE</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>Primeira vez ou ainda não sou membro</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ETAPA: MEMBRO */}
        {etapa === "membro" && (
          <div>
            <button onClick={() => setEtapa("escolha")} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>← Voltar</button>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0D2545", margin: "0 0 16px" }}>Buscar seu nome</h2>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#9CA3AF" }} />
              <input
                autoFocus
                value={busca}
                onChange={e => { setBusca(e.target.value); setMembroSelecionado(null); }}
                placeholder="Digite seu nome..."
                style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {buscando && <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>Buscando...</p>}

            {membros.length > 0 && !membroSelecionado && (
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                {membros.map(m => (
                  <button key={m.id} onClick={() => { setMembroSelecionado(m); setBusca(m.name); setMembros([]); }}
                    style={{ display: "block", width: "100%", padding: "10px 14px", border: "none", borderBottom: "1px solid #F3F4F6", background: "#fff", textAlign: "left", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#0D2545" }}>
                    {m.name}
                  </button>
                ))}
              </div>
            )}

            {membroSelecionado && (
              <div style={{ background: "#DCFCE7", borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle size={16} color="#16A34A" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#16A34A" }}>{membroSelecionado.name}</span>
              </div>
            )}

            {erro && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{erro}</p>}

            <button onClick={confirmar} disabled={!membroSelecionado || salvando}
              style={{ width: "100%", padding: "12px", background: membroSelecionado ? NAVY : "#D1D5DB", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: membroSelecionado ? "pointer" : "not-allowed" }}>
              {salvando ? "Confirmando..." : "Confirmar presença"}
            </button>
          </div>
        )}

        {/* ETAPA: VISITANTE */}
        {etapa === "visitante" && (
          <div>
            <button onClick={() => setEtapa("escolha")} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>← Voltar</button>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0D2545", margin: "0 0 16px" }}>Seja bem-vindo visitante!</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: 5, fontSize: 13 }}>Nome completo *</label>
              <input autoFocus value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome"
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: 5, fontSize: 13 }}>Telefone (opcional)</label>
              <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000"
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: 5, fontSize: 13 }}>Como nos conheceu? (opcional)</label>
              <select value={form.comoConheceu} onChange={e => setForm({ ...form, comoConheceu: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" }}>
                <option value="">Selecione...</option>
                <option>Redes sociais</option>
                <option>Indicação de amigo</option>
                <option>Passando na rua</option>
                <option>Google / Internet</option>
                <option>Família</option>
                <option>Outro</option>
              </select>
            </div>

            {erro && <p style={{ color: "#DC2626", fontSize: 13, marginBottom: 8 }}>{erro}</p>}

            <button onClick={confirmar} disabled={!form.nome.trim() || salvando}
              style={{ width: "100%", padding: "12px", background: form.nome.trim() ? GOLD : "#D1D5DB", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: form.nome.trim() ? "pointer" : "not-allowed" }}>
              {salvando ? "Confirmando..." : "Fazer check-in"}
            </button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: "#9CA3AF" }}>Powered by FIRMES · Gestão para Igrejas</p>
    </div>
  );
}
