"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Save, Building2, RotateCcw } from "lucide-react";

const NAVY = "#1A3C6E";
const GOLD = "#C8922A";

export default function PersonalizarPage() {
  const [form, setForm] = useState({
    logo: "",
    primaryColor: "#1A3C6E",
    secondaryColor: "#C8922A",
    customName: "",
    customDomain: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState("");

  useEffect(() => {
    fetch("/api/tenants").then(r => r.json()).then(data => {
      if (data.tenant) {
        setTenantId(data.tenant.id);
        setForm({
          logo: data.tenant.logo || "",
          primaryColor: data.tenant.primaryColor || "#1A3C6E",
          secondaryColor: data.tenant.secondaryColor || "#C8922A",
          customName: data.tenant.customName || "",
          customDomain: data.tenant.customDomain || "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/tenants/${tenantId}/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      alert("Marca atualizada!");
    } catch { alert("Erro ao salvar"); }
    finally { setSaving(false); }
  }

  function resetColors() {
    setForm(f => ({ ...f, primaryColor: "#1A3C6E", secondaryColor: "#C8922A" }));
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>Carregando...</div>;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-nunito), sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0D2545", margin: "0 0 4px" }}>Personalizar Marca</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: 0 }}>Configure a identidade visual do seu sistema</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: 8 }}>
            <Palette size={18} /> Configuracoes de Marca
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Logo (URL)</label>
              <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))}
                placeholder="https://..."
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              {form.logo && (
                <div style={{ marginTop: 8, padding: 12, background: "#F9FAFB", borderRadius: 8, textAlign: "center" }}>
                  <img src={form.logo} alt="Logo preview" style={{ maxWidth: 200, maxHeight: 60, objectFit: "contain" }} />
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Cor Primaria</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                    style={{ width: 44, height: 36, border: "1px solid #E5E7EB", borderRadius: 6, cursor: "pointer", padding: 2 }} />
                  <input value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                    style={{ flex: 1, padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13, outline: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Cor Secundaria</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="color" value={form.secondaryColor} onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                    style={{ width: 44, height: 36, border: "1px solid #E5E7EB", borderRadius: 6, cursor: "pointer", padding: 2 }} />
                  <input value={form.secondaryColor} onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                    style={{ flex: 1, padding: "8px 10px", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13, outline: "none" }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nome personalizado do sistema</label>
              <input value={form.customName} onChange={e => setForm(f => ({ ...f, customName: e.target.value }))}
                placeholder="Ex: Sistema da Minha Igreja"
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Dominio personalizado</label>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input value={form.customDomain} onChange={e => setForm(f => ({ ...f, customDomain: e.target.value }))}
                  placeholder="minhaigreja"
                  style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none" }} />
                <span style={{ color: "#6B7280", fontSize: 13, whiteSpace: "nowrap" }}>.firmes.app</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <button onClick={resetColors} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <RotateCcw size={14} /> Restaurar padrao
            </button>
            <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: NAVY, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              <Save size={14} /> {saving ? "Salvando..." : "Salvar alteracoes"}
            </button>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: NAVY }}>Preview em Tempo Real</h2>

          {/* Mini Sidebar Preview */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ width: 180, background: form.primaryColor, borderRadius: 12, padding: 12, minHeight: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                {form.logo ? (
                  <img src={form.logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: form.secondaryColor }} />
                )}
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{form.customName || "Firmes"}</span>
              </div>
              {["Dashboard", "Membros", "Financeiro"].map((item, i) => (
                <div key={i} style={{ padding: "6px 8px", borderRadius: 6, marginBottom: 4, background: i === 0 ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontSize: 11 }}>
                  {item}
                </div>
              ))}
            </div>

            {/* Mini Header Preview */}
            <div style={{ flex: 1, background: "#F9FAFB", borderRadius: 12, padding: 12, minHeight: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 12px", background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: form.primaryColor }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0D2545" }}>Dashboard</span>
              </div>
              
              {/* Mini Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ background: "#fff", borderRadius: 8, padding: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: form.secondaryColor, marginBottom: 6 }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#0D2545" }}>42</div>
                    <div style={{ fontSize: 10, color: "#6B7280" }}>Membros</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div style={{ marginTop: 16, padding: 12, background: "#F9FAFB", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>Cores aplicadas</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: form.primaryColor, marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: "#6B7280" }}>Primaria</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: form.secondaryColor, marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: "#6B7280" }}>Secundaria</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})`, marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: "#6B7280" }}>Gradiente</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
