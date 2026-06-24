import React from "react";
import { AbsoluteFill, useCurrentFrame, Audio, staticFile } from "remotion";
import { C, FONT_DISPLAY, FONT_MONO, W, H, ease, env } from "./theme";
import { Background } from "./components/Background";
import {
  GlassCard,
  MiniToolCard,
  FullPanel,
  UnifiedDashboard,
  ToolKey,
} from "./components/panels";
import { DeltaMark } from "./icons";

/* Flip to true once public/audio/soundtrack.mp3 exists (ElevenLabs). */
const WITH_AUDIO = false;

/* ───────────────────────── Layout keyframes ─────────────────────────
   The four tools share one identity across the whole film. Each stage
   only changes their {x,y,w,h}; we ease between stages with the spec's
   cubic-bezier(0.4,0,0.2,1). Tool order: canvas, notes, code, viz. */
const TOOLS: ToolKey[] = ["canvas", "notes", "code", "viz"];

const ROW_W = 250;
const ROW_H = 150;
const rowX = [409, 693, 977, 1261];
const rowY = 465;

const GW = 660;
const GH = 350;
const gx = [280, 980, 280, 980];
const gy = [170, 170, 560, 560];

function convTarget(i: number) {
  const cw = GW * 0.97;
  const ch = GH * 0.97;
  const cxC = gx[i] + GW / 2 + (960 - (gx[i] + GW / 2)) * 0.14;
  const cyC = gy[i] + GH / 2 + (540 - (gy[i] + GH / 2)) * 0.14;
  return { x: cxC - cw / 2, y: cyC - ch / 2, w: cw, h: ch };
}
function collapseTarget(i: number) {
  const kw = GW * 0.5;
  const kh = GH * 0.5;
  return {
    x: 960 - kw / 2 + (i % 2 === 0 ? -22 : 22),
    y: 540 - kh / 2 + (i < 2 ? -16 : 16),
    w: kw,
    h: kh,
  };
}

function pos(i: number, frame: number) {
  if (frame < 60) return { x: rowX[i], y: rowY, w: ROW_W, h: ROW_H };
  if (frame < 120) {
    return {
      x: ease(frame, [60, 86], [rowX[i], gx[i]]),
      y: ease(frame, [60, 86], [rowY, gy[i]]),
      w: ease(frame, [60, 86], [ROW_W, GW]),
      h: ease(frame, [60, 86], [ROW_H, GH]),
    };
  }
  const c = convTarget(i);
  if (frame < 180) {
    return {
      x: ease(frame, [120, 146], [gx[i], c.x]),
      y: ease(frame, [120, 146], [gy[i], c.y]),
      w: ease(frame, [120, 146], [GW, c.w]),
      h: ease(frame, [120, 146], [GH, c.h]),
    };
  }
  const k = collapseTarget(i);
  return {
    x: ease(frame, [180, 206], [c.x, k.x]),
    y: ease(frame, [180, 206], [c.y, k.y]),
    w: ease(frame, [180, 206], [c.w, k.w]),
    h: ease(frame, [180, 206], [c.h, k.h]),
  };
}

function cardOpacity(i: number, frame: number) {
  const eIn = ease(frame, [30 + i * 4, 48 + i * 4], [0, 1]);
  let base = 1;
  if (frame >= 120 && frame < 180) base = ease(frame, [120, 146], [1, 0.4]);
  else if (frame >= 180) base = ease(frame, [184, 208], [0.4, 0]);
  return eIn * base;
}

/* ───────────────────────── Caption helper ───────────────────────── */
const Caption: React.FC<{
  frame: number;
  inS: number;
  inE: number;
  outS: number;
  outE: number;
  top: number;
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  mono?: boolean;
  spacing?: string;
}> = ({
  frame,
  inS,
  inE,
  outS,
  outE,
  top,
  children,
  size = 52,
  weight = 600,
  color = C.white,
  mono = false,
  spacing = "-0.03em",
}) => {
  const o = env(frame, inS, inE, outS, outE);
  const ty = ease(frame, [inS, inE], [16, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        textAlign: "center",
        opacity: o,
        transform: `translateY(${ty}px)`,
        fontFamily: mono ? FONT_MONO : FONT_DISPLAY,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: spacing,
        color,
        zIndex: 40,
      }}
    >
      {children}
    </div>
  );
};

/* ───────────────────────── Connector overlay (scene 4) ───────────────────────── */
const Connectors: React.FC<{ frame: number }> = ({ frame }) => {
  const o = env(frame, 124, 142, 174, 182);
  if (o <= 0.001) return null;
  const ctr = TOOLS.map((_, i) => {
    const p = pos(i, frame);
    return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
  });
  // pairs: code(2)->viz(3), canvas(0)->notes(1) — "code sends arrows to
  // the visualizer; the canvas connects to the notes."
  const pairs: [number, number][] = [
    [2, 3],
    [0, 1],
    [1, 2],
  ];
  const dash = -frame * 3;
  const t = (frame % 36) / 36;
  return (
    <svg
      width={W}
      height={H}
      style={{ position: "absolute", inset: 0, zIndex: 15, opacity: o }}
    >
      {pairs.map(([a, b], i) => {
        const A = ctr[a];
        const B = ctr[b];
        const dx = A.x + (B.x - A.x) * t;
        const dy = A.y + (B.y - A.y) * t;
        return (
          <g key={i}>
            <line
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke="rgba(50,145,255,0.5)"
              strokeWidth={1.6}
              strokeDasharray="6 8"
              strokeDashoffset={dash}
            />
            <circle
              cx={dx}
              cy={dy}
              r={4.5}
              fill={C.accent}
              style={{ filter: "drop-shadow(0 0 8px rgba(50,145,255,0.9))" }}
            />
          </g>
        );
      })}
    </svg>
  );
};

/* ───────────────────────── Scene 4 hero wordmark ───────────────────────── */
const SUBLINES = [
  "Sketch structures.",
  "Write notes.",
  "Run code.",
  "Watch algorithms come alive.",
];

const HeroWordmark: React.FC<{ frame: number }> = ({ frame }) => {
  const o = env(frame, 124, 140, 172, 182);
  if (o <= 0.001) return null;
  const scale = ease(frame, [124, 140], [1.08, 1]);
  const glowPulse = 0.5 + Math.sin(frame * 0.18) * 0.12;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 30,
        opacity: o,
      }}
    >
      {/* impact glow */}
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, rgba(50,145,255,${(
            0.16 * glowPulse
          ).toFixed(3)}), transparent 65%)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          transform: `scale(${scale})`,
        }}
      >
        <DeltaMark size={78} />
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 104,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            color: C.white,
            textShadow: "0 4px 40px rgba(50,145,255,0.25)",
          }}
        >
          DSADelta
        </span>
      </div>
      {/* rotating sublines */}
      <div style={{ position: "relative", height: 44, marginTop: 26 }}>
        {SUBLINES.map((line, i) => {
          const s = 130 + i * 12;
          const lo =
            i === SUBLINES.length - 1
              ? env(frame, s, s + 7, 174, 180)
              : env(frame, s, s + 6, s + 12, s + 18);
          const ly = ease(frame, [s, s + 7], [12, 0]);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                textAlign: "center",
                opacity: lo,
                transform: `translateY(${ly}px)`,
                fontFamily: FONT_DISPLAY,
                fontSize: 27,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: C.text2,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────────────────── Final logo lockup ───────────────────────── */
const LogoLockup: React.FC<{ frame: number }> = ({ frame }) => {
  const o = env(frame, 246, 268, Infinity, Infinity);
  if (o <= 0.001) return null;
  const scale = ease(frame, [246, 268], [1.06, 1]);
  return (
    <AbsoluteFill
      style={{
        zIndex: 50,
        alignItems: "center",
        justifyContent: "center",
        opacity: o,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 700,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.62), transparent 62%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${scale})`,
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <DeltaMark size={84} />
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: C.white,
            }}
          >
            DSADelta
          </span>
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: FONT_DISPLAY,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: C.text2,
          }}
        >
          One workspace.&nbsp;&nbsp;Four tools.&nbsp;&nbsp;Zero friction.
        </div>
        <div
          style={{
            marginTop: 34,
            display: "flex",
            gap: 10,
            fontFamily: FONT_MONO,
            fontSize: 12,
            color: C.text4,
            alignItems: "center",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: C.accent,
              boxShadow: `0 0 8px ${C.accent}`,
            }}
          />
          
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────── Composition ───────────────────────── */
export const DSADeltaLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const detail = ease(frame, [62, 90], [0, 1]);

  // Scene 1 big card
  const bigO = env(frame, 2, 16, 30, 46);
  const bigRise = ease(frame, [0, 22], [54, 0]);
  const bigScale = ease(frame, [0, 22], [0.95, 1]);
  const bigSlide = ease(frame, [30, 46], [0, -360]);

  // Scene 5 dashboard
  let dashO = ease(frame, [196, 220], [0, 1]);
  if (frame >= 240) dashO = ease(frame, [240, 262], [1, 0.34]);
  const dashScale = ease(frame, [196, 220], [0.97, 1]);

  // Whole-composition end scale 100% → 98% (no fade-out, hold).
  const endScale = ease(frame, [244, 300], [1, 0.98]);

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill
        style={{
          transform: `scale(${endScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        {/* Soundtrack (generated via ElevenLabs) */}
        {WITH_AUDIO && (
          <Audio src={staticFile("audio/soundtrack.mp3")} volume={0.85} />
        )}

        <Background frame={frame} />

        {/* Scene 1 — one large floating glass card rises */}
        {bigO > 0.001 && (
          <GlassCard
            glow={0.5}
            style={{
              left: 580 + bigSlide,
              top: 320 + bigRise,
              width: 760,
              height: 430,
              opacity: bigO,
              transform: `scale(${bigScale})`,
              transformOrigin: "50% 100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <DeltaMark size={58} />
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 13,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: C.text3,
                }}
              >
                Visual CS Workspace
              </div>
            </div>
          </GlassCard>
        )}

        {/* The four tools — persistent identity, morphing layout */}
        {TOOLS.map((tool, i) => {
          const p = pos(i, frame);
          const op = cardOpacity(i, frame);
          if (op <= 0.001) return null;
          const ry = ease(frame, [30 + i * 4, 48 + i * 4], [26, 0]);
          const fl = Math.sin(frame * 0.05 + i * 1.7) * 3 * detail;
          return (
            <GlassCard
              key={tool}
              glow={0.34 * detail}
              style={{
                left: p.x,
                top: p.y + ry + fl,
                width: p.w,
                height: p.h,
                opacity: op,
                zIndex: 10,
              }}
            >
              <div style={{ position: "absolute", inset: 0, opacity: 1 - detail }}>
                <MiniToolCard tool={tool} />
              </div>
              {detail > 0.01 && (
                <div style={{ position: "absolute", inset: 0, opacity: detail }}>
                  <FullPanel tool={tool} frame={frame} />
                </div>
              )}
            </GlassCard>
          );
        })}

        <Connectors frame={frame} />

        {/* Scene 5 — collapse into one unified workspace */}
        {dashO > 0.001 && (
          <GlassCard
            glow={ease(frame, [196, 230], [0.2, 0.6])}
            style={{
              left: 320,
              top: 232,
              width: 1280,
              height: 616,
              opacity: dashO,
              transform: `scale(${dashScale})`,
              transformOrigin: "50% 50%",
              zIndex: 20,
            }}
          >
            <UnifiedDashboard frame={frame} />
          </GlassCard>
        )}

        <HeroWordmark frame={frame} />
        <LogoLockup frame={frame} />

        {/* ── Captions ── */}
        <Caption frame={frame} inS={8} inE={22} outS={30} outE={40} top={812} size={58} weight={600}>
          One workspace.
        </Caption>

        <Caption frame={frame} inS={38} inE={50} outS={58} outE={66} top={690} size={52} weight={600}>
          Four tools.
        </Caption>

        {/* Scene 3 — "Zero friction." word-by-word */}
        {env(frame, 66, 78, 112, 120) > 0.001 && (
          <div
            style={{
              position: "absolute",
              top: 952,
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 40,
              fontFamily: FONT_DISPLAY,
              fontSize: 50,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: C.white,
            }}
          >
            <span
              style={{
                opacity: env(frame, 66, 76, 112, 120),
                display: "inline-block",
                transform: `translateY(${ease(frame, [66, 76], [14, 0])}px)`,
              }}
            >
              Zero{" "}
            </span>
            <span
              style={{
                opacity: env(frame, 80, 90, 112, 120),
                display: "inline-block",
                transform: `translateY(${ease(frame, [80, 90], [14, 0])}px)`,
                color: C.accent,
              }}
            >
              friction.
            </span>
          </div>
        )}

        {/* Scene 5 captions */}
        <Caption frame={frame} inS={198} inE={210} outS={222} outE={230} top={902} size={46} weight={600}>
          All local.
        </Caption>
        <Caption frame={frame} inS={224} inE={234} outS={240} outE={248} top={902} size={46} weight={600} color={C.accent}>
          All free.
        </Caption>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
