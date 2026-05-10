"use client";

/** Bloco genérico de skeleton */
export function SkeletonBlock({
  w = "100%",
  h = 16,
  radius = 6,
  style: extraStyle,
}: {
  w?: string | number;
  h?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: "linear-gradient(90deg, #E5E0DA 25%, #EDE8E3 50%, #E5E0DA 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s infinite linear",
        ...extraStyle,
      }}
    />
  );
}

/** Linha de stat-card skeleton */
export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 14, marginBottom: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <SkeletonBlock w={36} h={36} radius={10} style={{ marginBottom: 12 }} />
          <SkeletonBlock w="55%" h={22} radius={4} style={{ marginBottom: 6 }} />
          <SkeletonBlock w="80%" h={12} radius={4} />
        </div>
      ))}
    </div>
  );
}

/** Linhas de tabela skeleton */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, padding: "12px 20px", borderBottom: "1px solid #F3F4F6" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBlock key={i} h={12} w="60%" radius={4} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, padding: "14px 20px", borderBottom: "1px solid #F9FAFB", alignItems: "center" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBlock key={c} h={14} w={c === 0 ? "80%" : "60%"} radius={4} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Lista de itens skeleton */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < rows - 1 ? "1px solid #F9FAFB" : "none" }}>
          <SkeletonBlock w={40} h={40} radius={20} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock w="45%" h={14} radius={4} style={{ marginBottom: 6 }} />
            <SkeletonBlock w="65%" h={12} radius={4} />
          </div>
          <SkeletonBlock w={72} h={24} radius={8} />
        </div>
      ))}
    </div>
  );
}

/** CSS global necessário para o shimmer */
export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes skeleton-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}
