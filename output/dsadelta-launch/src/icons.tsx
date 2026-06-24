import React from "react";

type IconProps = { size?: number; color?: string; stroke?: number };

/* The DSADelta delta-mark — the exact polygon from the app's nav logo. */
export const DeltaMark: React.FC<{ size?: number; bg?: string; fg?: string }> = ({
  size = 28,
  bg = "#ffffff",
  fg = "#000000",
}) => (
  <span
    style={{
      display: "grid",
      placeItems: "center",
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: bg,
      color: fg,
    }}
  >
    <svg
      width={size * 0.56}
      height={size * 0.56}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6,2 10.5,10 1.5,10" />
    </svg>
  </span>
);

const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 18,
  color = "currentColor",
  stroke = 1.7,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// Canvas → LayoutGrid
export const IconCanvas: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);

// Notes → FileText
export const IconNotes: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M9 9h1M9 13h6M9 17h6" />
  </Svg>
);

// Code → Terminal
export const IconCode: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </Svg>
);

// Visualizer → Network
export const IconViz: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="2.4" />
    <circle cx="5" cy="18" r="2.4" />
    <circle cx="19" cy="18" r="2.4" />
    <path d="M10.5 6.8 6.5 16M13.5 6.8 17.5 16M7.4 18h9.2" />
  </Svg>
);
