"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Mail, Target, MessageCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

function ObrigadoContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Pastor";

  useEffect(() => {
    const canvas = document.getElementById("confetti") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number }[] = [];
    const colors = ["#1A3C6E", "#C8922A", "#16A34A", "#DC2626", "#7C3AED"];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)] || "#1A3C6E",
        size: Math.random() * 6 + 4,
      });
    }

    let animId: number;
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > canvas.height) p.y = -10;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    const timer = setTimeout(() => {
      cancelAnimationFrame(animId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 4000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, []);

  const cards = [
    {
      icon: <Mail size={28} style={{ color: "#1A3C6E" }} />,
      title: "Verifique seu e-mail",
      desc: "Enviamos as instruções de acesso para o seu e-mail cadastrado.",
      action: null,
    },
    {
      icon: <Target size={28} style={{ color: "#C8922A" }} />,
      title: "Complete seu perfil",
      desc: "Configure sua igreja e comece a usar o sistema.",
      action: { label: "Ir para onboarding", href: "/onboarding" },
    },
    {
      icon: <MessageCircle size={28} style={{ color: "#16A34A" }} />,
      title: "Precisa de ajuda?",
      desc: "Nossa equipe está pronta para te ajudar.",
      action: { label: "Falar no WhatsApp", href: "https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o FIRMES." },
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EB", fontFamily: "var(--font-nunito), sans-serif", position: "relative", overflow: "hidden" }}>
      <canvas
        id="confetti"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 50 }}
      />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px 48px", textAlign: "center", position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
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
          <CheckCircle size={48} color="white" strokeWidth={3} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ fontSize: 32, fontWeight: 800, color: "#0D2545", marginBottom: 8 }}
        >
          Conta criada com sucesso!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ color: "#6B7280", fontSize: 16, marginBottom: 40 }}
        >
          Bem-vindo ao FIRMES, <strong>{name}</strong>! Sua igreja já está configurada.
        </motion.p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                textAlign: "left",
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#F5F0EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827" }}>{card.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#6B7280", lineHeight: 1.5 }}>{card.desc}</p>
                {card.action && (
                  <Link
                    href={card.action.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 12,
                      color: "#1A3C6E",
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    {card.action.label}
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ marginTop: 40 }}
        >
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              background: "linear-gradient(135deg, #1A3C6E, #1E4A84)",
              color: "white",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            Fazer login
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F5F0EB", display: "flex", alignItems: "center", justifyContent: "center" }}></div>}>
      <ObrigadoContent />
    </Suspense>
  );
}
