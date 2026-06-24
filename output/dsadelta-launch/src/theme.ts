import { interpolate, Easing } from "remotion";

/* ──────────────────────────────────────────────────────────────
   DSADelta brand tokens — lifted directly from the app's
   index.css ([data-landing-theme="dark"]) and editorTheme.ts
   (VS Code Dark+). Keeps the video pixel-faithful to the product.
   ────────────────────────────────────────────────────────────── */
export const C = {
  black: "#000000",
  surface: "#09090b",
  card: "#0c0c0e",
  cardAlt: "#0d0d12",
  panel: "#070709",
  panelDeep: "#060608",
  codeBg: "#0a0a0c",

  white: "#ffffff",
  text: "#ededed",
  text2: "#a1a1a1",
  text3: "#666666",
  text4: "#555555",

  accent: "#3291ff",
  accentDeep: "#0070f3",
  emerald: "#34d399",
  rose: "#f87171",

  border: "rgba(255,255,255,0.06)",
  borderSubtle: "rgba(255,255,255,0.04)",
  borderStrong: "rgba(255,255,255,0.10)",

  // VS Code Dark+ syntax (from editorTheme.ts)
  synKw: "#569cd6",
  synCtrl: "#c586c0",
  synIdent: "#9cdcfe",
  synType: "#4ec9b0",
  synFn: "#dcdcaa",
  synStr: "#ce9178",
  synCmt: "#6a9955",
  synNum: "#b5cea8",
} as const;

export const FONT_DISPLAY =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";

/* The spec's mandated easing: cubic-bezier(0.4, 0.0, 0.2, 1) */
export const STD = Easing.bezier(0.4, 0.0, 0.2, 1);

/** Eased + clamped interpolate. */
export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing = STD,
): number =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Opacity envelope: ramp up inS→inE, hold, ramp down outS→outE. */
export const env = (
  frame: number,
  inS: number,
  inE: number,
  outS = Infinity,
  outE = Infinity,
): number => {
  const up = ease(frame, [inS, inE], [0, 1]);
  const down =
    outS === Infinity ? 1 : ease(frame, [outS, outE], [1, 0]);
  return Math.min(up, down);
};

/* Composition constants */
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DURATION = 300; // 10s
