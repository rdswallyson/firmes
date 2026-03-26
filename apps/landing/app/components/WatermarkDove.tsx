"use client";

export function WatermarkDove() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: "-60px",
        right: "-60px",
        width: "420px",
        height: "420px",
        opacity: 0.045,
        pointerEvents: "none",
        zIndex: 0,
        userSelect: "none",
      }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          d="M100 20 C60 20 30 50 30 90 C30 120 50 145 80 158 L80 170 C80 175 85 180 90 178 C95 176 100 168 100 160 C100 168 105 176 110 178 C115 180 120 175 120 170 L120 158 C150 145 170 120 170 90 C170 50 140 20 100 20Z"
          fill="#1A3C6E"
          stroke="none"
        />
        <ellipse cx="82" cy="78" rx="5" ry="7" fill="white" opacity="0.8" />
        <ellipse cx="118" cy="78" rx="5" ry="7" fill="white" opacity="0.8" />
        <path
          d="M40 85 C20 70 10 50 25 35 C40 20 60 30 70 45"
          stroke="#1A3C6E"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M160 85 C180 70 190 50 175 35 C160 20 140 30 130 45"
          stroke="#1A3C6E"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M95 110 Q100 118 105 110"
          stroke="#C8922A"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
