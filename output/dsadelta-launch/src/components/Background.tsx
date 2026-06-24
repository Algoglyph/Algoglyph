import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { C, W, H, ease } from "../theme";

/* Tiny deterministic PRNG (mulberry32) so the constellation is
   identical on every render — the algorithmic-art layer. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Node = {
  bx: number;
  by: number;
  amp: number;
  spd: number;
  phase: number;
  r: number;
};

const NODE_COUNT = 32;
const LINK_DIST = 240;

export const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const nodes = useMemo<Node[]>(() => {
    const rnd = mulberry32(20260624);
    return Array.from({ length: NODE_COUNT }, () => ({
      bx: rnd() * W,
      by: rnd() * H,
      amp: 18 + rnd() * 46,
      spd: 0.004 + rnd() * 0.01,
      phase: rnd() * Math.PI * 2,
      r: 0.8 + rnd() * 1.8,
    }));
  }, []);

  // Live positions for this frame.
  const pts = nodes.map((n) => ({
    x: n.bx + Math.cos(frame * n.spd + n.phase) * n.amp,
    y: n.by + Math.sin(frame * n.spd * 1.3 + n.phase) * n.amp,
    r: n.r,
  }));

  // Glow intensity grows subtly across the film, brighter in the
  // final third (scene 5 — "the glow becomes slightly brighter").
  const glow = ease(frame, [0, 30], [0, 0.6]) + ease(frame, [180, 280], [0, 0.5]);

  return (
    <AbsoluteFill style={{ background: C.black }}>
      {/* faint dot grid — DSADelta's signature radial-dot texture */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          opacity: 0.7,
        }}
      />

      {/* central blue glow — rises from below */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 62%, rgba(50,145,255,${(
            0.05 + glow * 0.08
          ).toFixed(3)}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 120%, rgba(50,145,255,${(
            0.06 + glow * 0.06
          ).toFixed(3)}), transparent 65%)`,
        }}
      />

      {/* constellation / data-mesh */}
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", inset: 0 }}
      >
        {pts.map((a, i) =>
          pts.slice(i + 1).map((b, j) => {
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d > LINK_DIST) return null;
            const o = (1 - d / LINK_DIST) * 0.1;
            return (
              <line
                key={`${i}-${j}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(120,170,255,1)"
                strokeWidth={0.6}
                opacity={o}
              />
            );
          }),
        )}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="rgba(180,205,255,0.55)"
          />
        ))}
      </svg>

      {/* top vignette to keep weight low and premium */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55), transparent 22%, transparent 80%, rgba(0,0,0,0.4))",
        }}
      />
    </AbsoluteFill>
  );
};
