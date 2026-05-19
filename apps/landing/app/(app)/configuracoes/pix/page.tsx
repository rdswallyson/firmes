"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Key, Copy, Check, Save } from "lucide-react";
import Link from "next/link";

export default function ConfigPixPage() {
  const [pixKey, setPixKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((data) => {
        if (data.tenant) {
          setPixKey(data.tenant.pixKey || "");
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function salvar() {
    setSaving(true);
    try {
      const res = await fetch("/api/tenant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey }),
      });
      if (res.ok) {
        alert("Chave PIX salva!");
      } else {
        alert("Erro ao salvar");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-pad" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/configuracoes" style={{ color: "#6B7280" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0D2545", margin: 0 }}>Chave PIX</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0" }}>Configure a chave PIX da igreja</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6B7280" }}>Carregando...</p>
      ) : (
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Chave PIX da Igreja</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, CNPJ, e-mail, celular ou chave aleatória"
                style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
              />
              <button
                onClick={copyToClipboard}
                style={{ padding: "10px 16px", background: "#F3F4F6", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                {copied ? <Check size={16} style={{ color: "#16A34A" }} /> : <Copy size={16} />}
              </button>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#9CA3AF" }}>Esta chave será usada para receber dízimos e ofertas online.</p>
          </div>

          <button
            onClick={salvar}
            disabled={saving}
            style={{
              padding: "10px 24px",
              background: saving ? "#9CA3AF" : "linear-gradient(135deg, #1A3C6E, #1E4A84)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar Chave"}
          </button>
        </div>
      )}
    </div>
  );
}
