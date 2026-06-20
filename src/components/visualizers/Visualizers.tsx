import React from 'react';
import { motion } from 'framer-motion';
import type {
  Frame,
  ArrayFrame,
  ArrayCellState,
  GraphFrame,
  GridFrame,
  DPFrame,
  UFFrame,
} from '../../lib/algorithmFrames';

// Self-contained palette tuned for the dark glass node surface.
const ARRAY_COLORS: Record<ArrayCellState, string> = {
  idle: '#3f3f46',
  compare: '#f5a623',
  swap: '#ff4d8d',
  sorted: '#10b981',
  pivot: '#a855f7',
  'pointer-l': '#3291ff',
  'pointer-r': '#22d3ee',
  window: '#2563eb',
  mid: '#f5a623',
  found: '#10b981',
  active: '#3291ff',
};

const POINTER_LABEL: Partial<Record<ArrayCellState, string>> = {
  'pointer-l': 'L',
  'pointer-r': 'R',
  mid: 'mid',
  pivot: 'pivot',
};

const spring = { type: 'spring' as const, stiffness: 520, damping: 34 };

// ── Array bars ──────────────────────────────────────────────
const ArrayBars: React.FC<{ frame: ArrayFrame }> = ({ frame }) => {
  const max = Math.max(1, ...frame.cells.map((c) => c.v));
  return (
    <div className="flex h-[170px] items-end justify-center gap-[6px] px-1">
      {frame.cells.map((cell, i) => {
        const state = frame.states[i] ?? 'idle';
        const color = ARRAY_COLORS[state];
        const label = POINTER_LABEL[state];
        return (
          <motion.div
            key={cell.id}
            layout
            transition={spring}
            className="relative flex flex-1 flex-col items-center justify-end"
            style={{ maxWidth: 34 }}
          >
            {label && (
              <span
                className="absolute -top-1 text-[8px] font-mono font-semibold"
                style={{ color }}
              >
                {label}
              </span>
            )}
            <motion.div
              layout
              transition={spring}
              className="w-full rounded-t-[3px]"
              animate={{ backgroundColor: color, height: `${(cell.v / max) * 130 + 14}px` }}
            />
            <span className="mt-1 text-[9px] font-mono tabular-nums text-zinc-400">{cell.v}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

// ── Graph ───────────────────────────────────────────────────
const GRAPH_NODE_FILL: Record<string, string> = {
  idle: '#27272a',
  frontier: '#1e3a5f',
  current: '#a855f7',
  visited: '#10b981',
  done: '#10b981',
};
const GRAPH_NODE_STROKE: Record<string, string> = {
  idle: '#52525b',
  frontier: '#3291ff',
  current: '#c084fc',
  visited: '#34d399',
  done: '#34d399',
};

const GraphView: React.FC<{ frame: GraphFrame }> = ({ frame }) => {
  const pos = Object.fromEntries(frame.nodes.map((n) => [n.id, n]));
  return (
    <svg viewBox="0 0 330 205" className="h-[180px] w-full">
      <defs>
        <marker id="vis-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#71717a" />
        </marker>
      </defs>
      {frame.edges.map((e, i) => {
        const a = pos[e.from];
        const b = pos[e.to];
        if (!a || !b) return null;
        const color = e.state === 'tree' ? '#10b981' : e.state === 'active' ? '#f5a623' : '#3f3f46';
        const w = e.state === 'idle' ? 1.5 : 2.5;
        // Pull directed arrowheads back to the node rim.
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const r = 15;
        const ex = b.x - (dx / len) * r;
        const ey = b.y - (dy / len) * r;
        return (
          <g key={i}>
            <motion.line
              x1={a.x}
              y1={a.y}
              x2={frame.directed ? ex : b.x}
              y2={frame.directed ? ey : b.y}
              animate={{ stroke: color }}
              strokeWidth={w}
              markerEnd={frame.directed ? 'url(#vis-arrow)' : undefined}
            />
            {e.weight !== undefined && (
              <g>
                <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r="8" fill="#0a0a0a" />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 + 3}
                  textAnchor="middle"
                  className="fill-zinc-300 font-mono"
                  fontSize="9"
                >
                  {e.weight}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {frame.nodes.map((n) => (
        <g key={n.id}>
          <motion.circle
            cx={n.x}
            cy={n.y}
            r="14"
            animate={{ fill: GRAPH_NODE_FILL[n.state], stroke: GRAPH_NODE_STROKE[n.state] }}
            strokeWidth="2"
          />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-zinc-100 font-semibold" fontSize="11">
            {n.id}
          </text>
          {n.badge !== undefined && (
            <g>
              <rect x={n.x + 8} y={n.y - 22} width={Math.max(14, n.badge.length * 7)} height="13" rx="3" fill="#3291ff" />
              <text x={n.x + 8 + Math.max(14, n.badge.length * 7) / 2} y={n.y - 12} textAnchor="middle" className="fill-white font-mono" fontSize="8">
                {n.badge}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
};

// ── Grid (N-Queens) ─────────────────────────────────────────
const GridBoard: React.FC<{ frame: GridFrame }> = ({ frame }) => {
  const { n, queens, trying } = frame;
  return (
    <div className="flex h-[180px] items-center justify-center">
      <div
        className="grid overflow-hidden rounded-md border border-white/10"
        style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
      >
        {Array.from({ length: n * n }).map((_, idx) => {
          const r = Math.floor(idx / n);
          const c = idx % n;
          const dark = (r + c) % 2 === 1;
          const hasQueen = queens[r] === c;
          const isTrying = trying && trying.r === r && trying.c === c;
          const conflict = isTrying && frame.conflict;
          return (
            <div
              key={idx}
              className="flex items-center justify-center text-[15px] transition-colors"
              style={{
                width: 26,
                height: 26,
                background: conflict
                  ? 'rgba(244,63,94,0.45)'
                  : isTrying
                    ? 'rgba(50,145,255,0.45)'
                    : dark
                      ? '#18181b'
                      : '#27272a',
              }}
            >
              {hasQueen && (
                <motion.span
                  layout
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={spring}
                  style={{ color: frame.solved ? '#10b981' : '#ededed' }}
                >
                  ♛
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── DP table (Knapsack) ─────────────────────────────────────
const DPTable: React.FC<{ frame: DPFrame }> = ({ frame }) => {
  const { table, cursor, rowLabels, colLabels } = frame;
  return (
    <div className="flex h-[180px] items-center justify-center overflow-auto">
      <table className="border-collapse font-mono text-[9px]">
        <thead>
          <tr>
            <th className="p-0.5" />
            {colLabels.map((c, i) => (
              <th key={i} className="px-1 py-0.5 text-zinc-500 font-normal">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, r) => (
            <tr key={r}>
              <td className="pr-1.5 text-right text-zinc-500 whitespace-nowrap">{rowLabels[r]}</td>
              {row.map((val, c) => {
                const isCursor = cursor && cursor.r === r && cursor.c === c;
                return (
                  <td key={c} className="p-[1px]">
                    <div
                      className="flex items-center justify-center rounded-[3px] tabular-nums transition-colors"
                      style={{
                        width: 22,
                        height: 18,
                        background: isCursor ? '#3291ff' : val === null ? 'transparent' : '#27272a',
                        color: isCursor ? '#fff' : val === null ? '#3f3f46' : '#e4e4e7',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {val === null ? '·' : val}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Union-Find ──────────────────────────────────────────────
const UnionFindView: React.FC<{ frame: UFFrame }> = ({ frame }) => {
  const { parent, highlight } = frame;
  const n = parent.length;
  const gap = 300 / n;
  const xOf = (i: number) => gap * i + gap / 2;
  const baseY = 150;
  return (
    <svg viewBox="0 0 300 180" className="h-[180px] w-full">
      {parent.map((p, i) => {
        if (p === i) return null;
        const x1 = xOf(i);
        const x2 = xOf(p);
        const midX = (x1 + x2) / 2;
        const archeight = baseY - 40 - Math.abs(x2 - x1) * 0.25;
        return (
          <motion.path
            key={`e${i}`}
            d={`M ${x1} ${baseY - 14} Q ${midX} ${archeight} ${x2} ${baseY - 14}`}
            fill="none"
            stroke={highlight.includes(i) ? '#f5a623' : '#52525b'}
            strokeWidth="1.8"
            markerEnd="url(#vis-arrow)"
            animate={{ opacity: 1 }}
          />
        );
      })}
      <defs>
        <marker id="vis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#71717a" />
        </marker>
      </defs>
      {parent.map((p, i) => {
        const isRoot = p === i;
        const hot = highlight.includes(i);
        return (
          <g key={i}>
            <motion.circle
              cx={xOf(i)}
              cy={baseY}
              r="13"
              animate={{
                fill: isRoot ? '#1e3a5f' : '#27272a',
                stroke: hot ? '#f5a623' : isRoot ? '#3291ff' : '#52525b',
              }}
              strokeWidth="2"
            />
            <text x={xOf(i)} y={baseY + 4} textAnchor="middle" className="fill-zinc-100 font-semibold" fontSize="11">
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Dispatcher ──────────────────────────────────────────────
export const FrameRenderer: React.FC<{ frame: Frame }> = ({ frame }) => {
  switch (frame.type) {
    case 'array':
      return <ArrayBars frame={frame} />;
    case 'graph':
      return <GraphView frame={frame} />;
    case 'grid':
      return <GridBoard frame={frame} />;
    case 'dp':
      return <DPTable frame={frame} />;
    case 'uf':
      return <UnionFindView frame={frame} />;
    default:
      return null;
  }
};
