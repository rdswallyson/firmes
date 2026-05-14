export function FirmesLogo({ size = 32, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {/* Coluna esquerda */}
      <rect x="8" y="4" width="6" height="32" rx="1" fill={color} opacity="0.9" />
      {/* Coluna direita */}
      <rect x="26" y="4" width="6" height="32" rx="1" fill={color} opacity="0.9" />
      {/* Barra dourada no meio */}
      <rect x="16" y="4" width="8" height="32" rx="1" fill="#C8922A" />
      {/* Topo */}
      <rect x="6" y="2" width="28" height="3" rx="1" fill={color} opacity="0.9" />
      {/* Base */}
      <rect x="4" y="35" width="32" height="3" rx="1" fill={color} opacity="0.9" />
    </svg>
  );
}

export function FirmesLogoFull({ height = 32, color = "#fff" }: { height?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <FirmesLogo size={height} color={color} />
      <span style={{ fontSize: height * 0.65, fontWeight: 800, color, letterSpacing: "0.02em" }}>FIRMES</span>
    </div>
  );
}
