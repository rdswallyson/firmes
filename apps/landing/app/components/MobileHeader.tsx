"use client";

import { Menu, Bell, X } from "lucide-react";

interface MobileHeaderProps {
  tenantName?: string;
  onMenuOpen: () => void;
}

export function MobileHeader({ tenantName = "Firmes", onMenuOpen }: MobileHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: "#1A3C6E",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <button
        onClick={onMenuOpen}
        aria-label="Abrir menu"
        style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", padding: 6, borderRadius: 8 }}
      >
        <Menu size={22} strokeWidth={1.5} />
      </button>

      {/* Logo centro */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(200,146,42,0.2)", border: "1px solid rgba(200,146,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="6" rx="3" fill="white"/>
            <rect x="6" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
            <rect x="19" y="10" width="10" height="28" rx="5" fill="#C8922A"/>
            <rect x="32" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
            <rect x="4" y="38" width="40" height="6" rx="3" fill="white"/>
          </svg>
        </div>
        <span style={{ color: "white", fontWeight: 900, fontSize: 15, fontFamily: "var(--font-nunito), sans-serif" }}>
          {tenantName}
        </span>
      </div>

      <button
        aria-label="Notificações"
        style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", padding: 6, borderRadius: 8 }}
      >
        <Bell size={20} strokeWidth={1.5} />
      </button>
    </header>
  );
}

/** Overlay escuro quando o drawer está aberto */
export function DrawerOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 299,
        backdropFilter: "blur(1px)",
      }}
    />
  );
}
