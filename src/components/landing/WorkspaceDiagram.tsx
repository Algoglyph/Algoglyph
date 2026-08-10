/**
 * WorkspaceDiagram — a hand-drawn, Excalidraw-style diagram for the
 * "Workspace Fragmentation" section. Instead of an AI-generated raster, this
 * is drawn in the app's own whiteboard vernacular: wobbly rough strokes and a
 * hand-written label font (Caveat), matching the Excalidraw canvas AlgoGlyph
 * is built around.
 *
 * Left: six scattered, disconnected tools (muted rose = the pain).
 * Right: one AlgoGlyph frame whose four panels feed each other in a loop.
 *
 * Pure SVG, no runtime deps. The "hand-drawn" look comes from deterministic
 * per-corner jitter so paths look sketched but never re-roll on re-render.
 */

// Deterministic pseudo-random in [-1, 1] from an integer seed.
function jitter(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

// A rough rectangle path: each corner nudged slightly so it looks sketched.
function roughRect(x: number, y: number, w: number, h: number, k: number, a = 2.2): string {
  const p = (i: number) => a * jitter(k + i);
  const x0 = x + p(1);
  const y0 = y + p(2);
  const x1 = x + w + p(3);
  const y1 = y + p(4);
  const x2 = x + w + p(5);
  const y2 = y + h + p(6);
  const x3 = x + p(7);
  const y3 = y + h + p(8);
  return `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;
}

// A rough line/arrow segment with a slight mid-point bow.
function roughLine(x1: number, y1: number, x2: number, y2: number, k: number, a = 2): string {
  const mx = (x1 + x2) / 2 + a * jitter(k);
  const my = (y1 + y2) / 2 + a * jitter(k + 1);
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

interface Tool {
  label: string;
  x: number;
  y: number;
  rot: number;
}

const SCATTERED: Tool[] = [
  { label: 'YouTube', x: 14, y: 34, rot: -6 },
  { label: 'Notion', x: 120, y: 20, rot: 4 },
  { label: 'Discord', x: 40, y: 118, rot: 5 },
  { label: 'PDFs', x: 150, y: 108, rot: -4 },
  { label: 'Sketchpad', x: 6, y: 210, rot: 3 },
  { label: 'ChatGPT', x: 132, y: 202, rot: -5 },
];

const PANELS = ['Notes', 'Canvas', 'Agent', 'Visualizer'];

export function WorkspaceDiagram() {
  return (
    <svg
      viewBox="0 0 760 300"
      role="img"
      aria-label="Six scattered study tools on the left, unified into one AlgoGlyph workspace loop on the right"
      className="w-full h-auto max-w-[760px]"
      style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive' }}
    >
      {/* Left: scattered, disconnected tools */}
      <g>
        {SCATTERED.map((tool, idx) => (
          <g key={tool.label} transform={`rotate(${tool.rot} ${tool.x + 45} ${tool.y + 22})`}>
            <path
              d={roughRect(tool.x, tool.y, 92, 44, idx * 11 + 3)}
              fill="rgba(244,63,94,0.05)"
              stroke="rgba(244,113,133,0.55)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
            <text
              x={tool.x + 46}
              y={tool.y + 29}
              textAnchor="middle"
              fontSize={19}
              fill="rgba(255,225,230,0.82)"
            >
              {tool.label}
            </text>
          </g>
        ))}
        {[
          [106, 56, 120, 42],
          [86, 150, 150, 130],
          [70, 96, 60, 118],
        ].map(([x1, y1, x2, y2], k) => (
          <path
            key={k}
            d={roughLine(x1, y1, x2, y2, k * 7 + 40, 3)}
            fill="none"
            stroke="rgba(244,113,133,0.4)"
            strokeWidth={1.3}
            strokeDasharray="2 7"
            strokeLinecap="round"
          />
        ))}
        <text x={110} y={288} textAnchor="middle" fontSize={17} fill="rgba(244,113,133,0.7)">
          six tabs, none talking
        </text>
      </g>

      {/* Middle: the big hand-drawn arrow */}
      <g>
        <path
          d={roughLine(262, 150, 348, 150, 200, 3)}
          fill="none"
          stroke="rgba(230,232,240,0.7)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <path
          d="M 336 140 L 350 150 L 336 160"
          fill="none"
          stroke="rgba(230,232,240,0.7)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={305} y={134} textAnchor="middle" fontSize={17} fill="rgba(230,232,240,0.6)">
          unify
        </text>
      </g>

      {/* Right: one AlgoGlyph frame, four panels in a loop */}
      <g>
        <path
          d={roughRect(384, 44, 340, 212, 71, 3)}
          fill="rgba(255,255,255,0.015)"
          stroke="rgba(230,232,240,0.6)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <text x={554} y={36} textAnchor="middle" fontSize={20} fill="rgba(255,255,255,0.9)">
          AlgoGlyph
        </text>

        {PANELS.map((label, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const px = 404 + col * 162;
          const py = 66 + row * 92;
          return (
            <g key={label}>
              <path
                d={roughRect(px, py, 140, 72, idx * 13 + 90)}
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(230,232,240,0.5)"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
              <text
                x={px + 70}
                y={py + 44}
                textAnchor="middle"
                fontSize={20}
                fill="rgba(240,240,245,0.92)"
              >
                {label}
              </text>
            </g>
          );
        })}

        {[
          [545, 102, 566, 102],
          [636, 138, 636, 158],
          [566, 194, 545, 194],
          [474, 158, 474, 138],
        ].map(([x1, y1, x2, y2], k) => (
          <path
            key={k}
            d={roughLine(x1, y1, x2, y2, k * 9 + 120, 2)}
            fill="none"
            stroke="rgba(150,200,255,0.5)"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ))}
        <text x={554} y={286} textAnchor="middle" fontSize={17} fill="rgba(230,232,240,0.6)">
          one synchronized loop
        </text>
      </g>
    </svg>
  );
}
