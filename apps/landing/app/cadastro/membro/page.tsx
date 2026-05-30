"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, CheckCircle, Mail, Phone, User, Lock, Eye, EyeOff, Calendar, MapPin, Home, CreditCard } from "lucide-react";

const CARGOS = ["Visitante", "Congregado", "Novo Convertido", "Membro Ativo", "Membro Afastado", "Diácono", "Diáconisa", "Presbítero", "Evangelista", "Missionário", "Pastor", "Pastora", "Líder", "Cooperador", "Auxiliar", "Obreiro", "Músico", "Professor", "Tesoureiro", "Secretário", "Coordenador", "Membro"];

export default function CadastroPublicoPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", birthDate: "",
    sexo: "", whatsapp: "", cep: "", address: "",
    number: "", neighborhood: "", city: "", state: "",
    role: "", password: "", passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name) { setError("Nome é obrigatório"); return; }
    if (form.password && form.password !== form.passwordConfirm) { setError("As senhas não conferem"); return; }
    if (form.password && form.password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/members/public-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          birthDate: form.birthDate || undefined,
          sexo: form.sexo || undefined,
          whatsapp: form.whatsapp || undefined,
          address: form.address || undefined,
          cep: form.cep || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          neighborhood: form.neighborhood || undefined,
          number: form.number || undefined,
          role: form.role || undefined,
          portalEmail: form.email || undefined,
          portalPassword: form.password || undefined,
          portalStatus: "PENDENTE",
          status: "PENDING",
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Erro ao cadastrar"); setLoading(false); return; }
      setStep("success");
    } catch { setError("Erro de conexão"); }
    setLoading(false);
  }

  async function lookupCep(cep: string) {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json() as { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean };
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch { /* ignore */ }
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.625rem 0.75rem", border: "1.5px solid #E5E7EB", borderRadius: "8px", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", color: "#111827" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "0.3rem", fontSize: "0.8rem", fontWeight: 600, color: "#374151" };

  if (step === "success") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 100%)", padding: "1rem" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 420, background: "white", borderRadius: 16, padding: "2.5rem", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <CheckCircle size={60} color="#16A34A" style={{ margin: "0 auto 1rem" }} />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Cadastro Recebido!</h1>
        <p style={{ color: "#6B7280", fontSize: "0.875rem", marginTop: "1rem", lineHeight: 1.6 }}>
          Obrigado por se cadastrar! Seu pedido foi enviado para a igreja.
          <br /><br />
          Aguarde a aprovação da administração. Você receberá um e-mail quando seu acesso for liberado.
        </p>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0D2545 0%, #1A3C6E 100%)", padding: "1rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 640, background: "white", borderRadius: 16, padding: "2.5rem", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #1A3C6E, #C8922A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
            <UserPlus size={28} color="white" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0D2545", margin: 0 }}>Cadastro de Membro</h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", marginTop: "0.5rem" }}>Preencha seus dados para se cadastrar na igreja</p>
        </div>

        {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.75rem 1rem", color: "#DC2626", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</motion.div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem", marginBottom: "1rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}><User size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Nome completo *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="Seu nome" />
            </div>
            <div>
              <label style={labelStyle}><Mail size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="seu@email.com" />
            </div>
            <div>
              <label style={labelStyle}><Phone size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Telefone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label style={labelStyle}><Calendar size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Data de nascimento</label>
              <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Sexo</label>
              <select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })} style={inputStyle}>
                <option value="">Selecione...</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}><Phone size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />WhatsApp</label>
              <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} style={inputStyle} placeholder="(00) 00000-0000" />
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem", paddingTop: "1rem", borderTop: "1px solid #F3F4F6" }}>
              <label style={{ ...labelStyle, color: "#1A3C6E" }}><Home size={14} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Endereço</label>
            </div>
            <div>
              <label style={labelStyle}>CEP</label>
              <input value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} onBlur={e => lookupCep(e.target.value)} style={inputStyle} placeholder="00000-000" />
            </div>
            <div>
              <label style={labelStyle}>Rua</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} placeholder="Rua, Avenida..." />
            </div>
            <div>
              <label style={labelStyle}>Número</label>
              <input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} style={inputStyle} placeholder="123" />
            </div>
            <div>
              <label style={labelStyle}>Bairro</label>
              <input value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} style={inputStyle} placeholder="Bairro" />
            </div>
            <div>
              <label style={labelStyle}>Cidade</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={inputStyle} placeholder="Cidade" />
            </div>
            <div>
              <label style={labelStyle}>Estado</label>
              <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} style={inputStyle} placeholder="UF" maxLength={2} />
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem", paddingTop: "1rem", borderTop: "1px solid #F3F4F6" }}>
              <label style={{ ...labelStyle, color: "#1A3C6E" }}><CreditCard size={14} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Perfil na Igreja</label>
            </div>
            <div>
              <label style={labelStyle}>Cargo / Função</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inputStyle}>
                <option value="">Selecione...</option>
                {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Lock size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Senha</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} style={{ ...inputStyle, paddingRight: "2.5rem" }} placeholder="Mín. 6 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}><Lock size={13} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />Confirmar senha</label>
              <input type={showPassword ? "text" : "password"} value={form.passwordConfirm} onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} style={inputStyle} placeholder="Repita a senha" />
            </div>
          </div>

          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
            style={{ width: "100%", padding: "0.75rem", background: loading ? "#6B7280" : "linear-gradient(135deg, #1A3C6E 0%, #1E4A84 100%)", color: "white", border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.9375rem" }}>
            {loading ? "Cadastrando..." : "Enviar cadastro para aprovação"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
