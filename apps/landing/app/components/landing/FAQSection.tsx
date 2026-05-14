"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: "1px solid #E5E7EB" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} style={{ color: "#6B7280" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ padding: "0 0 20px", fontSize: 15, color: "#6B7280", lineHeight: 1.6 }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FAQS = [
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer: "Não! O FIRMES foi desenvolvido para ser intuitivo. Qualquer pessoa da sua equipe consegue usar sem treinamento técnico. Oferecemos tutoriais em vídeo e suporte humano.",
  },
  {
    question: "O plano gratuito tem limite de tempo?",
    answer: "Não. O plano Gratuito é para sempre. Você pode usar quanto quiser com até 50 membros. Quando sua igreja crescer, é só fazer upgrade.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim, sem taxas de cancelamento. Você pode cancelar a qualquer momento diretamente no painel. Seus dados ficam disponíveis por 30 dias após o cancelamento.",
  },
  {
    question: "Como funciona o White Label?",
    answer: "Com o plano Esmeralda, você pode colocar sua marca (logo, cores, domínio) no sistema e revender para outras igrejas. Você define o preço e fica com 100% da receita.",
  },
  {
    question: "O sistema funciona no celular?",
    answer: "Sim! O FIRMES é 100% responsivo e funciona perfeitamente em qualquer dispositivo. Também pode ser instalado como PWA (aplicativo) no celular.",
  },
  {
    question: "Meus dados ficam seguros?",
    answer: "Sim. Usamos criptografia SSL, hospedagem na nuvem com backup diário e estamos em conformidade com a LGPD. Seus dados nunca são vendidos ou compartilhados.",
  },
  {
    question: "Posso migrar dados de outro sistema?",
    answer: "Sim! Oferecemos importação via planilha Excel/CSV. Nossa equipe pode ajudar na migração gratuitamente para planos pagos.",
  },
  {
    question: "Como funciona o suporte?",
    answer: "Suporte por chat e email em todos os planos. Planos Ouro e Diamante têm suporte prioritário com resposta em até 2 horas em horário comercial.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" style={{ padding: "80px 24px", background: "#F5F0EB" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 12 }}>Perguntas Frequentes</h2>
          <p style={{ fontSize: 16, color: "#6B7280" }}>Tudo que você precisa saber antes de começar</p>
        </motion.div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "0 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <FAQItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
