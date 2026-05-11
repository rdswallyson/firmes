"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";

type Platform = "android" | "ios" | "desktop" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());

    // Verificar se já está instalado como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Android / Desktop — capturar evento de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Mostrar banner após 3s
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS — mostrar instrução manual após 5s (apenas uma vez por sessão)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const safari = /safari/i.test(navigator.userAgent) && !/crios|fxios|opios/i.test(navigator.userAgent);
    if (ios && safari && !sessionStorage.getItem("pwa-ios-shown")) {
      setTimeout(() => {
        setShow(true);
        sessionStorage.setItem("pwa-ios-shown", "1");
      }, 5000);
    }

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed || !show) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const isIOS = platform === "ios" && !deferredPrompt;

  return (
    <div
      role="dialog"
      aria-label="Instalar FIRMES"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 8000,
        background: "#fff",
        borderTop: "1px solid #E5E7EB",
        borderRadius: "20px 20px 0 0",
        padding: "20px 20px 32px",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        animation: "slideUpBanner 0.35s cubic-bezier(.4,0,.2,1)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <button
        onClick={() => setShow(false)}
        aria-label="Fechar"
        style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 6, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <X size={18} strokeWidth={1.5} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        {/* Ícone */}
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "#1A3C6E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="6" rx="3" fill="white"/>
            <rect x="6" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
            <rect x="19" y="10" width="10" height="28" rx="5" fill="#C8922A"/>
            <rect x="32" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
            <rect x="4" y="38" width="40" height="6" rx="3" fill="white"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>Instalar FIRMES</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Acesse rápido, funciona offline</div>
        </div>
      </div>

      {isIOS ? (
        /* Instrução iOS */
        <div style={{ background: "#F3F4F6", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#374151", fontWeight: 600 }}>
            Para instalar no iPhone/iPad:
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#4B5563", lineHeight: 1.9 }}>
            <li>Toque no botão <Share size={13} style={{ display: "inline", verticalAlign: "middle" }} /> <strong>Compartilhar</strong> no Safari</li>
            <li>Role e toque em <strong>"Adicionar à Tela de Início"</strong> <Plus size={13} style={{ display: "inline", verticalAlign: "middle" }} /></li>
            <li>Confirme tocando em <strong>"Adicionar"</strong></li>
          </ol>
        </div>
      ) : (
        /* Botão Android/Desktop */
        <button
          onClick={handleInstall}
          aria-label="Instalar aplicativo FIRMES"
          style={{
            width: "100%",
            padding: "14px",
            background: "#1A3C6E",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 48,
            fontFamily: "var(--font-nunito), sans-serif",
          }}
        >
          <Download size={18} strokeWidth={1.5} />
          Instalar no dispositivo
        </button>
      )}
    </div>
  );
}
