"use client";

export function EmeraldIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <polygon 
        points="7,2 17,2 22,8 22,16 17,22 7,22 2,16 2,8" 
        fill="#DC2626" 
        stroke="#DC2626" 
        strokeWidth="1"
      />
      <polygon 
        points="7,2 17,2 22,8 17,8 7,8 2,8" 
        fill="#F87171"
      />
      <polygon 
        points="7,22 17,22 22,16 17,16 7,16 2,16" 
        fill="#DC2626"
      />
    </svg>
  );
}
