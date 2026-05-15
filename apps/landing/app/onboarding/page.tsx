"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Upload, Users, BookOpen, DollarSign, Sparkles } from "lucide-react";

const STEPS = [
  { id: 1, title: "Personalize sua igreja", icon: Upload },
  { id: 2, title: "Cadastre o primeiro membro", icon: Users },
  { id: 3, title: "Crie o primeiro grupo", icon: Users },
  { id: 4, title: "Configure as finanças", icon: DollarSign },
  { id: 5, title: "Tudo pronto!", icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);

  // Dados dos formulários
  const [logo, setLogo] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1A3C6E");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDay, setGroupDay] = useState("Sábado");
  const [financeCategories, setFinanceCategories] = useState(["Dízimos", "Ofertas", "Doações"]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.tenant) setTenant(data.tenant);
      })
      .catch(() => {});
  }, []);

  const progress = (step / STEPS.length) * 100;

  async function handleFinish() {
    setLoading(true);
    try {
      await fetch("/api/tenant/onboarding", { method: "POST" });
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  }

  const handleNext = () => {
    if (step < STEPS.length) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Barra de progresso */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ height: 4, background: "#E5E7EB" }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg, #1A3C6E, #C8922A)" }}
          />
        </div>
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, color: "#0D2545", fontSize: 18 }}>FIRMES</span>
            <span style={{ color: "#9CA3AF", fontSize: 13 }}>— Configuração inicial</span>
          </div>
          <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>
            Passo {step} de {STEPS.length}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "100px 24px 48px" }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>
                Personalize sua igreja
              </h1>
              <p style={{ color: "#6B7280", marginBottom: 32 }}>
                Defina a identidade visual da sua igreja no sistema.
              </p>

              <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Logo da igreja
                  </label>
                  <div
                    style={{
                      border: "2px dashed #E5E7EB",
                      borderRadius: 12,
                      padding: "32px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}
                    onClick={() => alert("Funcionalidade de upload será integrada com storage")}
                  >
                    <Upload size={32} style={{ color: "#9CA3AF", marginBottom: 8 }} />
                    <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>Clique para fazer upload do logo</p>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Cor principal
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ width: 48, height: 48, border: "none", borderRadius: 8, cursor: "pointer" }}
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>
                Cadastre o primeiro membro
              </h1>
              <p style={{ color: "#6B7280", marginBottom: 32 }}>
                Adicione o primeiro membro da sua igreja ao sistema.
              </p>

              <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="João Silva"
                    style={{ width: "100%", padding: "12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="joao@email.com"
                    style={{ width: "100%", padding: "12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>
                Crie o primeiro grupo
              </h1>
              <p style={{ color: "#6B7280", marginBottom: 32 }}>
                Crie um grupo de célula ou ministério.
              </p>

              <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Nome do grupo
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Célula Jovens"
                    style={{ width: "100%", padding: "12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Dia da reunião
                  </label>
                  <select
                    value={groupDay}
                    onChange={(e) => setGroupDay(e.target.value)}
                    style={{ width: "100%", padding: "12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, background: "#fff" }}
                  >
                    {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}>
                Configure as finanças
              </h1>
              <p style={{ color: "#6B7280", marginBottom: 32 }}>
                Defina as categorias financeiras padrão da sua igreja.
              </p>

              <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                  Categorias de entrada
                </label>
                {financeCategories.map((cat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <DollarSign size={16} style={{ color: "#C8922A" }} />
                    <input
                      type="text"
                      value={cat}
                      onChange={(e) => {
                        const next = [...financeCategories];
                        next[i] = e.target.value;
                        setFinanceCategories(next);
                      }}
                      style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14 }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setFinanceCategories([...financeCategories, ""])}
                  style={{ marginTop: 8, padding: "8px 16px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}
                >
                  + Adicionar categoria
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              style={{ textAlign: "center", paddingTop: 40 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1A3C6E, #C8922A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Check size={48} color="white" strokeWidth={3} />
              </motion.div>

              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 12 }}>
                Tudo pronto!
              </h1>
              <p style={{ color: "#6B7280", fontSize: 16, marginBottom: 40, maxWidth: 400, margin: "0 auto 40px" }}>
                Sua igreja está configurada e pronta para usar o FIRMES.
              </p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFinish}
                disabled={loading}
                style={{
                  padding: "16px 48px",
                  background: "linear-gradient(135deg, #1A3C6E, #1E4A84)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? "Redirecionando..." : "Ir para o Dashboard"}
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botões de navegação */}
        {step < 5 && (
          <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "flex-end" }}>
            {step > 1 && (
              <button
                onClick={handleBack}
                style={{
                  padding: "12px 24px",
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Voltar
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #1A3C6E, #1E4A84)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Continuar
              <ChevronRight size={16} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
