export function FirmesLogo({ size = 32, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill={color} opacity="0.15" />
      <path
        d="M20 8L12 14V26L20 32L28 26V14L20 8Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 14V26M16 18H20M16 22H20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3" fill={color} opacity="0.3" />
    </svg>
  );
}

export function FirmesLogoFull({ height = 32, color = "#fff" }: { height?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <FirmesLogo size={height} color={color} />
      <span style={{ fontSize: height * 0.65, fontWeight: 800, color, letterSpacing: "0.05em" }}>FIRMES</span>
    </div>
  );
}
