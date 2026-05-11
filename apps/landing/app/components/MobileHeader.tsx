"use client";

import { Menu, Bell } from "lucide-react";

interface MobileHeaderProps {
  tenantName?: string;
  onMenuOpen: () => void;
}

export function MobileHeader({ tenantName = "FIRMES", onMenuOpen }: MobileHeaderProps) {
  return (
    <header
      style={{
        background: "#1A3C6E",
        height: 56,
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        flexShrink: 0,
        width: "100%",
      }}
    >
      {/* Hamburguer */}
      <button
        onClick={onMenuOpen}
        aria-label="Abrir menu"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 10,
          flexShrink: 0,
        }}
      >
        <Menu size={24} strokeWidth={1.5} />
      </button>

      {/* Logo centralizado */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: "rgba(200,146,42,0.2)",
          border: "1px solid rgba(200,146,42,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="6" rx="3" fill="white"/>
            <rect x="6" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
            <rect x="19" y="10" width="10" height="28" rx="5" fill="#C8922A"/>
            <rect x="32" y="12" width="10" height="24" rx="5" fill="#B0B8C8"/>
            <rect x="4" y="38" width="40" height="6" rx="3" fill="white"/>
          </svg>
        </div>
        <span style={{
          color: "white",
          fontWeight: 900,
          fontSize: 16,
          letterSpacing: "0.02em",
          fontFamily: "var(--font-nunito), sans-serif",
          whiteSpace: "nowrap",
        }}>
          {tenantName}
        </span>
      </div>

      {/* Sino */}
      <button
        aria-label="Notificações"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 10,
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Bell size={22} strokeWidth={1.5} />
        {/* Badge de notificação */}
        <span style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 8,
          height: 8,
          background: "#C8922A",
          borderRadius: "50%",
          border: "1.5px solid #1A3C6E",
        }} />
      </button>
    </header>
  );
}
