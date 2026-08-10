/**
 * FeatureSketches — hand-drawn, Excalidraw-style illustrations that replace the
 * div-based fake-UI mockups in the landing page's feature sections.
 *
 * Same vernacular as WorkspaceDiagram: deterministic per-corner jitter so the
 * strokes look sketched but never re-roll on re-render, Caveat for handwriting
 * and the app's mono for code (Excalidraw itself pairs a hand font with a code
 * font, so the mix is authentic).
 */

const HAND = '"Caveat", "Comic Sans MS", cursive';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

const INK = 'rgba(230,232,240,0.62)';
const INK_SOFT = 'rgba(230,232,240,0.34)';
const TEXT = 'rgba(240,240,245,0.9)';
const TEXT_SOFT = 'rgba(230,232,240,0.55)';
const ACCENT = 'rgba(150,200,255,0.65)';

// Deterministic pseudo-random in [-1, 1].
function jitter(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

function roughRect(x: number, y: number, w: number, h: number, k: number, a = 2): string {
  const p = (i: number) => a * jitter(k + i);
  return `M ${x + p(1)} ${y + p(2)} L ${x + w + p(3)} ${y + p(4)} L ${x + w + p(5)} ${y + h + p(6)} L ${x + p(7)} ${y + h + p(8)} Z`;
}

function roughLine(x1: number, y1: number, x2: number, y2: number, k: number, a = 2): string {
  const mx = (x1 + x2) / 2 + a * jitter(k);
  const my = (y1 + y2) / 2 + a * jitter(k + 1);
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

// A wavy "line of handwriting" used to suggest body text without faking copy.
function scribble(x: number, y: number, w: number, k: number): string {
  const seg = w / 6;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < 6; i++) {
    const cx = x + seg * i + seg / 2;
    const cy = y + 2.4 * jitter(k + i);
    d += ` Q ${cx} ${cy} ${x + seg * (i + 1)} ${y + 0.8 * jitter(k + i + 20)}`;
  }
  return d;
}

function Grid() {
  const dots = [];
  for (let gx = 24; gx < 560; gx += 26) {
    for (let gy = 24; gy < 320; gy += 26) {
      dots.push(<circle key={`${gx}-${gy}`} cx={gx} cy={gy} r={0.8} fill="rgba(255,255,255,0.05)" />);
    }
  }
  return <g>{dots}</g>;
}

/** FREE CANVAS — two linked nodes, a sticky note, and freehand doodles. */
export function CanvasSketch() {
  return (
    <svg
      viewBox="0 0 560 320"
      role="img"
      aria-label="Hand-drawn canvas: two linked nodes holding 17 and 42, with a note explaining that pointers link disjoint memory locations"
      className="w-full h-auto"
    >
      <Grid />
      <path d={roughRect(12, 12, 536, 296, 5, 3)} fill="none" stroke={INK_SOFT} strokeWidth={1.5} strokeLinejoin="round" />
      <text x={34} y={44} fontSize={19} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>
        canvas
      </text>

      {/* node 0 */}
      <path d={roughRect(78, 120, 96, 66, 21)} fill="rgba(255,255,255,0.03)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <text x={126} y={144} textAnchor="middle" fontSize={13} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>
        Node 0
      </text>
      <text x={126} y={172} textAnchor="middle" fontSize={26} fill={TEXT} style={{ fontFamily: HAND }}>
        17
      </text>

      {/* link */}
      <path d={roughLine(180, 153, 258, 153, 40, 2.5)} fill="none" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M 248 146 L 260 153 L 248 160" fill="none" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />

      {/* node 1 */}
      <path d={roughRect(264, 120, 96, 66, 33)} fill="rgba(255,255,255,0.03)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <text x={312} y={144} textAnchor="middle" fontSize={13} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>
        Node 1
      </text>
      <text x={312} y={172} textAnchor="middle" fontSize={26} fill={TEXT} style={{ fontFamily: HAND }}>
        42
      </text>

      {/* sticky note */}
      <g transform="rotate(-2.5 432 236)">
        <path d={roughRect(360, 200, 168, 78, 57, 2.4)} fill="rgba(255,255,255,0.035)" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <text x={376} y={224} fontSize={19} fill={TEXT} style={{ fontFamily: HAND }}>
          Spatial link
        </text>
        <text x={376} y={247} fontSize={15} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>
          pointers join disjoint
        </text>
        <text x={376} y={265} fontSize={15} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>
          memory locations
        </text>
      </g>
      <path d={roughLine(340, 176, 372, 202, 70, 2)} fill="none" stroke={INK_SOFT} strokeWidth={1.2} strokeDasharray="3 5" strokeLinecap="round" />

      {/* freehand doodles: this is a drawing surface, not a form */}
      <path
        d="M 432 62 Q 462 42 490 62 Q 512 80 490 100 Q 462 118 436 100 Q 414 82 432 62"
        fill="none"
        stroke={INK_SOFT}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <path d={roughLine(70, 244, 150, 240, 88, 3)} fill="none" stroke={INK_SOFT} strokeWidth={1.3} strokeLinecap="round" />
      <path d={roughLine(70, 260, 128, 257, 95, 3)} fill="none" stroke={INK_SOFT} strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  );
}

/** NOTEBOOK — a page of notes with a complexity callout and a linked code block. */
export function NotesSketch() {
  return (
    <svg
      viewBox="0 0 560 320"
      role="img"
      aria-label="Hand-drawn notebook page: a heading, body text, a complexity callout showing O(N) time and O(H) space, and a code block linked to the canvas"
      className="w-full h-auto"
    >
      <path d={roughRect(16, 12, 528, 296, 9, 3)} fill="rgba(255,255,255,0.012)" stroke={INK_SOFT} strokeWidth={1.5} strokeLinejoin="round" />
      {/* margin rule, like a real notebook */}
      <path d={roughLine(64, 20, 64, 300, 14, 2)} fill="none" stroke="rgba(244,113,133,0.28)" strokeWidth={1.2} />

      <text x={84} y={54} fontSize={23} fill={TEXT} style={{ fontFamily: HAND }}>
        Recursive pre-order traversal
      </text>

      {[80, 100].map((y, i) => (
        <path key={y} d={scribble(84, y, 400 - i * 60, 30 + i * 7)} fill="none" stroke={INK_SOFT} strokeWidth={1.3} strokeLinecap="round" />
      ))}

      {/* complexity callout */}
      <path d={roughLine(84, 126, 84, 178, 44, 1.6)} fill="none" stroke={ACCENT} strokeWidth={2.4} strokeLinecap="round" />
      <text x={100} y={144} fontSize={14} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>
        Time  O(N)
      </text>
      <text x={100} y={168} fontSize={14} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>
        Space O(H)
      </text>

      {/* code block */}
      <path d={roughRect(84, 196, 300, 96, 61, 2.4)} fill="rgba(255,255,255,0.03)" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      {[
        'void preOrder(Node* n) {',
        '  if (!n) return;',
        '  visit(n);',
        '  preOrder(n->left);',
      ].map((line, i) => (
        <text key={line} x={98} y={218 + i * 19} fontSize={12.5} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>
          {line}
        </text>
      ))}

      {/* link out to the canvas */}
      <path d={roughLine(392, 244, 470, 214, 77, 4)} fill="none" stroke={ACCENT} strokeWidth={1.5} strokeLinecap="round" strokeDasharray="4 5" />
      <path d="M 460 208 L 472 212 L 466 223" fill="none" stroke={ACCENT} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <text x={430} y={190} fontSize={17} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>
        links to canvas
      </text>
      <path d={roughRect(452, 232, 76, 56, 84, 2)} fill="none" stroke={INK_SOFT} strokeWidth={1.3} strokeLinejoin="round" />
      <text x={490} y={266} textAnchor="middle" fontSize={20} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>
        node
      </text>
    </svg>
  );
}

/** AGENT CONNECTOR — three local AI CLIs pairing through the local connector into the canvas. */
export function AgentConnectorSketch() {
  const cliArrow = (fromX: number, toX: number, toY: number, k: number) => (
    <g key={k}>
      <path d={roughLine(fromX, 68, toX, toY, 200 + k, 3)} fill="none" stroke={ACCENT} strokeWidth={1.5} strokeLinecap="round" />
      {arrowHead(toX, toY, toX - fromX, toY - 68, ACCENT, 100 + k)}
    </g>
  );

  return (
    <svg
      viewBox="0 0 560 320"
      role="img"
      aria-label="Hand-drawn diagram: Claude Code, Codex, and Antigravity paired through a local connector into the Algoglyph canvas"
      className="w-full h-auto"
    >
      {/* local AI CLIs */}
      {[
        { x: 40, label: 'Claude Code' },
        { x: 215, label: 'Codex' },
        { x: 390, label: 'Antigravity' },
      ].map((cli, i) => (
        <g key={cli.label}>
          <path d={roughRect(cli.x, 26, 130, 42, i * 17 + 3)} fill="rgba(255,255,255,0.03)" stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
          <text x={cli.x + 65} y={53} textAnchor="middle" fontSize={15} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>
            {cli.label}
          </text>
        </g>
      ))}

      {cliArrow(105, 220, 120, 1)}
      {cliArrow(280, 280, 120, 2)}
      {cliArrow(455, 340, 120, 3)}

      {/* local connector */}
      <path d={roughRect(170, 120, 220, 66, 41)} fill="rgba(150,200,255,0.04)" stroke={ACCENT} strokeWidth={1.7} strokeLinejoin="round" />
      <text x={280} y={148} textAnchor="middle" fontSize={19} fill={TEXT} style={{ fontFamily: HAND }}>
        Local connector
      </text>
      <text x={280} y={166} textAnchor="middle" fontSize={12} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>
        127.0.0.1:4319
      </text>
      <circle cx={245} cy={178} r={4} fill="rgba(74,222,128,0.75)" />
      <text x={254} y={182} fontSize={11} fill="rgba(134,239,172,0.85)" style={{ fontFamily: MONO }}>
        paired
      </text>

      {/* connector → canvas */}
      <path d={roughLine(280, 186, 280, 224, 55, 2)} fill="none" stroke={ACCENT} strokeWidth={1.6} strokeLinecap="round" />
      {arrowHead(280, 222, 0, 38, ACCENT, 110)}

      {/* algoglyph canvas */}
      <path d={roughRect(150, 224, 260, 72, 66)} fill="rgba(255,255,255,0.03)" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <text x={280} y={252} textAnchor="middle" fontSize={19} fill={TEXT} style={{ fontFamily: HAND }}>
        Algoglyph Canvas
      </text>
      <text x={280} y={272} textAnchor="middle" fontSize={11.5} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>
        notes · canvas · visualizer
      </text>
      <path
        d="M 372 240 Q 384 233 393 242 Q 400 251 391 259 Q 381 266 372 258 Q 364 249 372 240"
        fill="none"
        stroke={INK_SOFT}
        strokeWidth={1.3}
        strokeLinecap="round"
      />

      <text x={280} y={312} textAnchor="middle" fontSize={15} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>
        paired locally, keys never leave your device
      </text>
    </svg>
  );
}

const STAGE_ACCENT: Record<number, string> = {
  1: 'rgba(96,165,250,0.95)', // array — blue
  2: 'rgba(167,139,250,0.95)', // linked list — violet
  3: 'rgba(74,222,128,0.95)', // stack — green
  4: 'rgba(251,191,36,0.95)', // tree — amber
  5: 'rgba(45,212,191,0.95)', // graph — teal
};

const STAGE_LABEL: Record<number, string> = {
  1: 'contiguous array',
  2: 'linked list',
  3: 'LIFO stack',
  4: 'binary tree',
  5: 'graph mesh',
};

function arrowHead(x: number, y: number, dx: number, dy: number, color: string, k: number) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const s = 7;
  const p1 = `${x - ux * s - uy * s} ${y - uy * s + ux * s}`;
  const p2 = `${x - ux * s + uy * s} ${y - uy * s - ux * s}`;
  return <path key={`ah${k}`} d={`M ${p1} L ${x} ${y} L ${p2}`} fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />;
}

/** VISUALIZER — a colorful hand-drawn structure that changes with the stage. */
export function VisualizerSketch({ stage }: { stage: number }) {
  const accent = STAGE_ACCENT[stage] ?? STAGE_ACCENT[1];
  const box = (x: number, y: number, w: number, h: number, k: number) => (
    <path d={roughRect(x, y, w, h, k)} fill="rgba(255,255,255,0.04)" stroke={accent} strokeWidth={1.7} strokeLinejoin="round" />
  );
  const val = (x: number, y: number, v: number | string) => (
    <text x={x} y={y} textAnchor="middle" fontSize={24} fill={TEXT} style={{ fontFamily: HAND }}>{v}</text>
  );

  let body: React.ReactNode;

  if (stage === 1) {
    const arr = [17, 42, 8, 63, 29];
    body = (
      <g>
        {arr.map((v, i) => {
          const x = 44 + i * 96;
          return (
            <g key={i}>
              {box(x, 116, 80, 62, i * 9 + 1)}
              {val(x + 40, 156, v)}
              <text x={x + 40} y={196} textAnchor="middle" fontSize={12} fill={TEXT_SOFT} style={{ fontFamily: MONO }}>[{i}]</text>
            </g>
          );
        })}
      </g>
    );
  } else if (stage === 2) {
    const arr = [17, 42, 8, 63];
    body = (
      <g>
        {arr.map((v, i) => {
          const x = 40 + i * 130;
          const y = 118 + (i % 2 === 1 ? 26 : 0);
          return (
            <g key={i}>
              {box(x, y, 82, 58, i * 13 + 5)}
              {val(x + 41, y + 38, v)}
              {i < arr.length - 1 && (() => {
                const nx = 40 + (i + 1) * 130;
                const ny = 118 + ((i + 1) % 2 === 1 ? 26 : 0);
                return (
                  <g>
                    <path d={roughLine(x + 82, y + 29, nx, ny + 29, i * 5 + 60, 3)} fill="none" stroke={accent} strokeWidth={1.7} strokeLinecap="round" />
                    {arrowHead(nx, ny + 29, nx - (x + 82), ny - y, accent, i)}
                  </g>
                );
              })()}
            </g>
          );
        })}
      </g>
    );
  } else if (stage === 3) {
    const arr = [63, 8, 42, 17];
    body = (
      <g>
        <text x={280} y={64} textAnchor="middle" fontSize={17} fill={accent} style={{ fontFamily: HAND }}>← top (push / pop)</text>
        {arr.map((v, i) => {
          const y = 84 + i * 50;
          return (
            <g key={i}>
              {box(200, y, 160, 44, i * 11 + 7)}
              {val(280, y + 31, v)}
            </g>
          );
        })}
      </g>
    );
  } else if (stage === 4) {
    const nodes: Array<[number, number, number]> = [
      [280, 70, 42],
      [180, 150, 17],
      [380, 150, 63],
      [120, 230, 8],
      [240, 230, 29],
    ];
    const edges: Array<[number, number]> = [[0, 1], [0, 2], [1, 3], [1, 4]];
    body = (
      <g>
        {edges.map(([a, b], k) => (
          <path key={`e${k}`} d={roughLine(nodes[a][0], nodes[a][1] + 18, nodes[b][0], nodes[b][1] - 18, k * 7 + 30, 2)} fill="none" stroke={accent} strokeWidth={1.6} strokeLinecap="round" />
        ))}
        {nodes.map(([x, y, v], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={24} fill="rgba(255,255,255,0.04)" stroke={accent} strokeWidth={1.8} />
            {val(x, y + 8, v)}
          </g>
        ))}
      </g>
    );
  } else {
    const nodes: Array<[number, number, number]> = [
      [110, 90, 0],
      [280, 60, 1],
      [430, 110, 2],
      [180, 210, 3],
      [370, 220, 4],
    ];
    const edges: Array<[number, number]> = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2], [1, 4]];
    body = (
      <g>
        {edges.map(([a, b], k) => (
          <path key={`e${k}`} d={roughLine(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1], k * 6 + 40, 4)} fill="none" stroke={accent} strokeWidth={1.6} strokeLinecap="round" />
        ))}
        {nodes.map(([x, y, v], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={22} fill="rgba(255,255,255,0.04)" stroke={accent} strokeWidth={1.8} />
            {val(x, y + 8, v)}
          </g>
        ))}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 560 300" role="img" aria-label={`Hand-drawn ${STAGE_LABEL[stage] ?? 'structure'} visualization`} className="w-full h-auto">
      {body}
      <text x={280} y={288} textAnchor="middle" fontSize={16} fill={TEXT_SOFT} style={{ fontFamily: HAND }}>{STAGE_LABEL[stage] ?? ''}</text>
    </svg>
  );
}
