"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, History, CreditCard, Copy, Check, Wallet } from "lucide-react";

interface DizimoItem {
  id: string;
  valor: number;
  data: string;
  forma: string;
  status: string;
}

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
}

export default function DizimosOnlinePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [valor, setValor] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<"PIX" | "CARTAO">("PIX");
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<DizimoItem[]>([]);
  const [pixQrCode, setPixQrCode] = useState("");
  const [pixCopiaCola, setPixCopiaCola] = useState("");
  const [copied, setCopied] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(d => {
        if (d.user) setUser(d.user);
      })
      .catch(() => null);

    fetchHistorico();
  }, []);

  async function fetchHistorico() {
    try {
      const res = await fetch("/api/financeiro/dizimos/meus");
      if (res.ok) {
        const data = await res.json();
        setHistorico(data.dizimos || []);
      }
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valor || Number(valor) <= 0) return;
    setLoading(true);

    try {
      if (formaPagamento === "PIX") {
        // Gerar PIX
        const res = await fetch("/api/financeiro/pix/gerar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valor: Number(valor), descricao: "Dizimo" }),
        });
        if (res.ok) {
          const data = await res.json();
          setPixQrCode(data.qrCode);
          setPixCopiaCola(data.copiaCola);
          setShowPixModal(true);
          // Registrar lancamento pendente
          await fetch("/api/financeiro/dizimos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ valor: Number(valor), forma: "PIX", status: "PENDENTE" }),
          });
        }
      } else {
        // Cartao - redirecionar para Stripe ou similar
        alert("Pagamento via cartao em desenvolvimento. Use PIX por enquanto.");
      }
    } catch {
      alert("Erro ao processar. Tente novamente.");
    }
    setLoading(false);
  }

  function copyPix() {
    navigator.clipboard.writeText(pixCopiaCola);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalAno = historico
    .filter(d => d.status === "CONFIRMADO" && new Date(d.data).getFullYear() === new Date().getFullYear())
    .reduce((acc, d) => acc + d.valor, 0);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px",
    fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827"
  };

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={() => router.push("/financeiro")} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontSize: "0.85rem", marginBottom: "1rem", padding: 0 }}>
        <ArrowLeft size={16} strokeWidth={1.5} /> Voltar para Financeiro
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Dizimos Online</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>Contribua com seu dizimo de forma rapida e segura</p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Formulario */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Wallet size={20} strokeWidth={1.5} color="#1A3C6E" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>Nova Contribuicao</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={valor}
                onChange={e => setValor(e.target.value)}
                style={inputStyle}
                placeholder="0,00"
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Forma de Pagamento</label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setFormaPagamento("PIX")}
                  style={{
                    flex: 1, padding: "0.75rem", borderRadius: "8px", border: formaPagamento === "PIX" ? "2px solid #1A3C6E" : "1.5px solid #E5E7EB",
                    background: formaPagamento === "PIX" ? "#F0F7FF" : "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem"
                  }}
                >
                  <QrCode size={24} strokeWidth={1.5} color={formaPagamento === "PIX" ? "#1A3C6E" : "#6B7280"} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: formaPagamento === "PIX" ? "#1A3C6E" : "#374151" }}>PIX</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormaPagamento("CARTAO")}
                  style={{
                    flex: 1, padding: "0.75rem", borderRadius: "8px", border: formaPagamento === "CARTAO" ? "2px solid #1A3C6E" : "1.5px solid #E5E7EB",
                    background: formaPagamento === "CARTAO" ? "#F0F7FF" : "white", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem"
                  }}
                >
                  <CreditCard size={24} strokeWidth={1.5} color={formaPagamento === "CARTAO" ? "#1A3C6E" : "#6B7280"} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: formaPagamento === "CARTAO" ? "#1A3C6E" : "#374151" }}>Cartao</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !valor}
              style={{
                width: "100%", padding: "0.75rem", background: "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)",
                color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Processando..." : "Gerar Pagamento"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#F9FAFB", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <History size={16} strokeWidth={1.5} color="#6B7280" />
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Total contribuido este ano</span>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1A3C6E" }}>
              R$ {totalAno.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </motion.div>

        {/* Historico */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <History size={20} strokeWidth={1.5} color="#1A3C6E" />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>Historico</h2>
          </div>

          {historico.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#9CA3AF", fontSize: "0.875rem" }}>
              Nenhum dizimo registrado ainda.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {historico.map(d => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#F9FAFB", borderRadius: "8px" }}>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>R$ {d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{new Date(d.data).toLocaleDateString("pt-BR")} - {d.forma}</div>
                  </div>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px", borderRadius: "10px",
                    background: d.status === "CONFIRMADO" ? "#DCFCE7" : d.status === "PENDENTE" ? "#FEF3C7" : "#FEE2E2",
                    color: d.status === "CONFIRMADO" ? "#16A34A" : d.status === "PENDENTE" ? "#D97706" : "#DC2626"
                  }}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal PIX */}
      {showPixModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem"
        }}
          onClick={() => setShowPixModal(false)}
        >
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: "white", borderRadius: "16px", padding: "2rem", maxWidth: "360px", width: "100%", textAlign: "center" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>Pagamento via PIX</h3>
            <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1.5rem" }}>Escaneie o QR Code ou use o codigo copia e cola</p>

            {pixQrCode && (
              <img src={pixQrCode} alt="QR Code PIX" style={{ width: "200px", height: "200px", margin: "0 auto 1rem", borderRadius: "8px" }} />
            )}

            <button
              onClick={copyPix}
              style={{
                width: "100%", padding: "0.75rem", background: copied ? "#DCFCE7" : "#F3F4F6",
                border: "1px solid #E5E7EB", borderRadius: "8px", color: copied ? "#16A34A" : "#374151",
                fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem"
              }}
            >
              {copied ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar codigo PIX</>}
            </button>

            <button
              onClick={() => { setShowPixModal(false); fetchHistorico(); }}
              style={{ width: "100%", marginTop: "0.75rem", padding: "0.75rem", background: "transparent", border: "none", color: "#6B7280", fontSize: "0.875rem", cursor: "pointer" }}
            >
              Fechar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
