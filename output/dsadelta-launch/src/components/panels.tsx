import React from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "../theme";
import { DeltaMark, IconCanvas, IconNotes, IconCode, IconViz } from "../icons";

/* ───────────────────────── Glass card shell ───────────────────────── */
export const GlassCard: React.FC<{
  style?: React.CSSProperties;
  glow?: number; // 0..1 accent glow
  children?: React.ReactNode;
}> = ({ style, glow = 0, children }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 24,
      background:
        "linear-gradient(180deg, rgba(22,22,27,0.78) 0%, rgba(10,10,13,0.82) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: `0 30px 70px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 ${
        48 * glow
      }px rgba(50,145,255,${0.16 * glow})`,
      overflow: "hidden",
      ...style,
    }}
  >
    {/* inner top sheen */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 80% at 30% -10%, rgba(255,255,255,0.05), transparent 55%)",
        pointerEvents: "none",
      }}
    />
    {children}
  </div>
);

const ChromeBar: React.FC<{ label?: string; accentDot?: boolean }> = ({
  label,
  accentDot,
}) => (
  <div
    style={{
      height: 34,
      borderBottom: `1px solid ${C.borderSubtle}`,
      background: C.panel,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 14px",
      flexShrink: 0,
    }}
  >
    <div style={{ display: "flex", gap: 7 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            background: "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
    {label && (
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {label}
      </span>
    )}
    {accentDot ? (
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: C.emerald,
          boxShadow: `0 0 8px ${C.emerald}`,
        }}
      />
    ) : (
      <span style={{ width: 7 }} />
    )}
  </div>
);

const PaneTag: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      position: "absolute",
      top: 12,
      left: 14,
      zIndex: 5,
      padding: "3px 9px",
      borderRadius: 7,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${C.borderSubtle}`,
      fontFamily: FONT_MONO,
      fontSize: 10.5,
      letterSpacing: "0.04em",
      color: "rgba(255,255,255,0.4)",
    }}
  >
    {label}
  </div>
);

/* ───────────────────────── 1 · Canvas panel ───────────────────────── */
export const CanvasPanel: React.FC<{ frame: number }> = ({ frame }) => {
  // DFS highlight walks the tree.
  const order = [0, 1, 3, 4, 2, 5];
  const active = order[Math.floor(frame / 9) % order.length];
  const nodes = [
    { id: 0, x: 200, y: 46, v: 50 },
    { id: 1, x: 110, y: 130, v: 17 },
    { id: 2, x: 290, y: 130, v: 76 },
    { id: 3, x: 62, y: 214, v: 9 },
    { id: 4, x: 158, y: 214, v: 23 },
    { id: 5, x: 290, y: 214, v: 88 },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
  ];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <PaneTag label="canvas · infinite" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <svg viewBox="0 0 400 260" style={{ width: "100%", height: "100%" }}>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="rgba(255,255,255,0.16)"
            strokeWidth={1.4}
          />
        ))}
        {nodes.map((n) => {
          const on = n.id === active;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={17}
                fill={on ? "rgba(50,145,255,0.16)" : C.cardAlt}
                stroke={on ? C.accent : "rgba(255,255,255,0.18)"}
                strokeWidth={on ? 2 : 1.2}
                style={{
                  filter: on
                    ? "drop-shadow(0 0 10px rgba(50,145,255,0.5))"
                    : "none",
                }}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontFamily={FONT_MONO}
                fontSize={11}
                fontWeight={600}
                fill={on ? C.accent : "rgba(255,255,255,0.55)"}
              >
                {n.v}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ───────────────────────── 2 · Notes panel ───────────────────────── */
export const NotesPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const caret = Math.floor(frame / 16) % 2 === 0;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "44px 28px 22px",
        textAlign: "left",
      }}
    >
      <PaneTag label="notes · markdown" />
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: "rgba(255,255,255,0.18)",
          marginBottom: 10,
        }}
      >
        // notebook
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: C.white,
          marginBottom: 12,
        }}
      >
        Pre-order Traversal
        {caret && (
          <span style={{ color: C.accent, fontWeight: 400 }}>|</span>
        )}
      </div>
      <p
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 13.5,
          lineHeight: 1.7,
          color: C.text2,
          marginBottom: 14,
        }}
      >
        Trace execution depth-first using call-stack frames. Each visit
        pushes state before recursing into children.
      </p>
      <div
        style={{
          borderLeft: `2px solid ${C.accent}`,
          background: "rgba(50,145,255,0.06)",
          borderRadius: "0 8px 8px 0",
          padding: "8px 12px",
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: C.accent,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <span>Time · O(N)</span>
        <span>Space · O(H)</span>
      </div>
    </div>
  );
};

/* ───────────────────────── 3 · Code panel ───────────────────────── */
type Tok = { t: string; c: string };
const CODE: Tok[][] = [
  [{ t: "# Dijkstra — path relaxation", c: C.synCmt }],
  [
    { t: "while", c: C.synCtrl },
    { t: " not ", c: C.synCtrl },
    { t: "pq.is_empty():", c: C.synIdent },
  ],
  [
    { t: "    u, dist = ", c: C.synIdent },
    { t: "pq.pop_min", c: C.synFn },
    { t: "()", c: C.text },
  ],
  [
    { t: "    for", c: C.synCtrl },
    { t: " v, w ", c: C.synIdent },
    { t: "in", c: C.synCtrl },
    { t: " graph.adj[u]:", c: C.synIdent },
  ],
  [
    { t: "        if", c: C.synCtrl },
    { t: " dist[v] > dist + w:", c: C.synIdent },
  ],
  [{ t: "            dist[v] = dist + w", c: C.synIdent }],
  [
    { t: "            pq.insert", c: C.synFn },
    { t: "(v, dist[v])", c: C.text },
  ],
];

export const CodePanel: React.FC<{ frame: number }> = ({ frame }) => {
  const visible = Math.min(
    CODE.length,
    Math.max(1, Math.floor((frame - 4) / 6)),
  );
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#1e1e1e",
        textAlign: "left",
      }}
    >
      <ChromeBar label="solver.py" accentDot />
      <div
        style={{
          flex: 1,
          padding: "14px 16px",
          fontFamily: FONT_MONO,
          fontSize: 13,
          lineHeight: 1.62,
        }}
      >
        {CODE.map((line, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              opacity: i < visible ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            <span
              style={{
                width: 22,
                color: "rgba(255,255,255,0.22)",
                userSelect: "none",
              }}
            >
              {i + 1}
            </span>
            <span>
              {line.map((tok, k) => (
                <span key={k} style={{ color: tok.c }}>
                  {tok.t}
                </span>
              ))}
              {i === visible - 1 && caretOn && (
                <span style={{ color: "#aeafad" }}>▏</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───────────────────────── 4 · Visualizer panel ───────────────────────── */
export const VisualizerPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const vals = [42, 17, 88, 23, 56, 71, 9, 64];
  const scan = Math.floor(frame / 7) % vals.length;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "44px 26px 24px",
      }}
    >
      <PaneTag label="visualizer · array" />
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {vals.map((v, i) => {
          const on = i === scan;
          const wobble = Math.sin(frame * 0.12 + i) * 6;
          const h = 30 + v * 1.5 + wobble;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  color: on ? C.accent : "rgba(255,255,255,0.35)",
                }}
              >
                {v}
              </span>
              <div
                style={{
                  width: 26,
                  height: h,
                  borderRadius: 6,
                  background: on
                    ? `linear-gradient(180deg, ${C.accent}, rgba(50,145,255,0.35))`
                    : "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))",
                  border: on
                    ? `1px solid ${C.accent}`
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: on
                    ? "0 0 16px rgba(50,145,255,0.5)"
                    : "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────────── Mini tool card (scene 2 — the four small cards) ───────────── */
const TOOL_META = {
  canvas: { label: "Canvas", Icon: IconCanvas, sub: "infinite sketch" },
  notes: { label: "Notes", Icon: IconNotes, sub: "markdown" },
  code: { label: "Code", Icon: IconCode, sub: "C++ · Py · Java" },
  viz: { label: "Visualizer", Icon: IconViz, sub: "live state" },
} as const;

export type ToolKey = keyof typeof TOOL_META;

export const MiniToolCard: React.FC<{ tool: ToolKey }> = ({ tool }) => {
  const { label, Icon, sub } = TOOL_META[tool];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          display: "grid",
          placeItems: "center",
          color: C.accent,
          background:
            "linear-gradient(160deg, rgba(50,145,255,0.16), rgba(50,145,255,0.04))",
          border: "1px solid rgba(50,145,255,0.25)",
          boxShadow: "0 4px 14px rgba(50,145,255,0.12)",
        }}
      >
        <Icon size={22} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 16,
            fontWeight: 600,
            color: C.white,
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10.5,
            color: C.text3,
            marginTop: 3,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
};

export const FullPanel: React.FC<{ tool: ToolKey; frame: number }> = ({
  tool,
  frame,
}) => {
  if (tool === "canvas") return <CanvasPanel frame={frame} />;
  if (tool === "notes") return <NotesPanel frame={frame} />;
  if (tool === "code") return <CodePanel frame={frame} />;
  return <VisualizerPanel frame={frame} />;
};

/* ───────────────────────── Unified dashboard (scene 5) ───────────────────────── */
export const UnifiedDashboard: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        height: 38,
        borderBottom: `1px solid ${C.borderSubtle}`,
        background: C.panel,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        flexShrink: 0,
      }}
    >
      <DeltaMark size={20} />
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 14,
          color: C.white,
          letterSpacing: "-0.02em",
        }}
      >
        DSADelta
      </span>
      <div style={{ flex: 1 }} />
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: C.text3,
          border: `1px solid ${C.borderSubtle}`,
          borderRadius: 6,
          padding: "2px 8px",
        }}
      >
        local · offline
      </span>
    </div>
    <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
      <div
        style={{
          width: "27%",
          borderRight: `1px solid ${C.borderSubtle}`,
          minHeight: 0,
        }}
      >
        <NotesPanel frame={frame} />
      </div>
      <div
        style={{
          flex: 1,
          borderRight: `1px solid ${C.borderSubtle}`,
          minHeight: 0,
        }}
      >
        <CanvasPanel frame={frame} />
      </div>
      <div style={{ width: "30%", minHeight: 0 }}>
        <CodePanel frame={frame} />
      </div>
    </div>
    <div
      style={{
        height: "30%",
        borderTop: `1px solid ${C.borderSubtle}`,
        minHeight: 0,
      }}
    >
      <VisualizerPanel frame={frame} />
    </div>
  </div>
);
