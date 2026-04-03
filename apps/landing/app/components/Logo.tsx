interface LogoProps {
  variant?: "horizontal" | "vertical" | "symbol";
  theme?: "light" | "dark";
  size?: number;
}

export function Logo({ variant = "horizontal", theme = "dark", size = 36 }: LogoProps) {
  const textColor = theme === "dark" ? "#1A3C6E" : "white";
  const scale = size / 48;

  const symbol = (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="6" rx="3" fill="#1A3C6E" />
      <rect x="6" y="12" width="10" height="24" rx="5" fill="#B0B8C8" />
      <rect x="19" y="10" width="10" height="28" rx="5" fill="#C8922A" />
      <rect x="32" y="12" width="10" height="24" rx="5" fill="#B0B8C8" />
      <rect x="4" y="38" width="40" height="6" rx="3" fill="#1A3C6E" />
    </svg>
  );

  if (variant === "symbol") return symbol;

  const isVertical = variant === "vertical";

  return (
    <div style={{
      display: "flex",
      flexDirection: isVertical ? "column" : "row",
      alignItems: "center",
      gap: isVertical ? "0.5rem" : "0.625rem",
    }}>
      {symbol}
      <div style={{ textAlign: isVertical ? "center" : "left" }}>
        <div style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 900,
          fontSize: `${Math.max(18, size * 0.5)}px`,
          color: textColor,
          lineHeight: 1.1,
        }}>
          Firmes
        </div>
        <div style={{
          fontFamily: "var(--font-nunito), sans-serif",
          fontWeight: 600,
          fontSize: `${Math.max(7, size * 0.17)}px`,
          color: "#C8922A",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>
          GESTÃO PARA IGREJAS
        </div>
      </div>
    </div>
  );
}
