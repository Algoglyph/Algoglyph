import React from 'react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from '../../store/workspaceStore';
import type {
  Frame,
  ArrayFrame,
  ArrayCellState,
  GraphFrame,
  GridFrame,
  DPFrame,
  UFFrame,
} from '../../lib/algorithmFrames';

// Self-contained palette tuned for the dark glass surface.
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

const getArrayColor = (state: ArrayCellState, isDark: boolean): string => {
  if (isDark) return ARRAY_COLORS[state];
  if (state === 'idle') return '#e4e4e7'; // light zinc-200
  return ARRAY_COLORS[state];
};

// ── Array bars ──────────────────────────────────────────────
const ArrayBars: React.FC<{ frame: ArrayFrame, isDragging?: boolean }> = ({ frame, isDragging }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  const max = Math.max(1, ...frame.cells.map((c) => c.v));
  
  return (
    <div className="flex h-[170px] items-end justify-center gap-[6px] px-1">
      {frame.cells.map((cell, i) => {
        const state = frame.states[i] ?? 'idle';
        const color = getArrayColor(state, isDark);
        const label = POINTER_LABEL[state];
        return (
          <motion.div
            key={cell.id}
            layout={!isDragging}
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
              layout={!isDragging}
              transition={spring}
              className="w-full rounded-t-[3px]"
              animate={{ backgroundColor: color, height: `${(cell.v / max) * 130 + 14}px` }}
            />
            <span className={`mt-1 text-[9px] font-mono tabular-nums ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{cell.v}</span>
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

const getGraphNodeColors = (state: string, isDark: boolean) => {
  if (isDark) {
    return {
      fill: GRAPH_NODE_FILL[state] || '#27272a',
      stroke: GRAPH_NODE_STROKE[state] || '#52525b',
      text: '#f4f4f5',
    };
  }
  const fillMap: Record<string, string> = {
    idle: '#f4f4f5',
    frontier: '#e0f2fe',
    current: '#f3e8ff',
    visited: '#d1fae5',
    done: '#d1fae5',
  };
  const strokeMap: Record<string, string> = {
    idle: '#cbd5e1',
    frontier: '#3b82f6',
    current: '#a855f7',
    visited: '#10b981',
    done: '#10b981',
  };
  const textMap: Record<string, string> = {
    idle: '#27272a',
    frontier: '#1e40af',
    current: '#6b21a8',
    visited: '#065f46',
    done: '#065f46',
  };
  return {
    fill: fillMap[state] || '#f4f4f5',
    stroke: strokeMap[state] || '#cbd5e1',
    text: textMap[state] || '#27272a',
  };
};

const GraphView: React.FC<{ frame: GraphFrame }> = ({ frame }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  const pos = Object.fromEntries(frame.nodes.map((n) => [n.id, n]));
  
  return (
    <svg viewBox="0 0 330 205" className="h-[180px] w-full">
      <defs>
        <marker id="vis-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={isDark ? '#71717a' : '#94a3b8'} />
        </marker>
      </defs>
      {frame.edges.map((e, i) => {
        const a = pos[e.from];
        const b = pos[e.to];
        if (!a || !b) return null;
        const color = e.state === 'tree' ? '#10b981' : e.state === 'active' ? '#f5a623' : (isDark ? '#3f3f46' : '#cbd5e1');
        const w = e.state === 'idle' ? 1.5 : 2.5;
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
                <circle cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r="8" fill={isDark ? '#0a0a0a' : '#ffffff'} stroke={isDark ? 'transparent' : '#cbd5e1'} strokeWidth={isDark ? 0 : 1} />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 + 3}
                  textAnchor="middle"
                  className={isDark ? 'fill-zinc-300 font-mono' : 'fill-zinc-700 font-mono'}
                  fontSize="9"
                >
                  {e.weight}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {frame.nodes.map((n) => {
        const colors = getGraphNodeColors(n.state, isDark);
        return (
          <g key={n.id}>
            <motion.circle
              cx={n.x}
              cy={n.y}
              r="14"
              animate={{ fill: colors.fill, stroke: colors.stroke }}
              strokeWidth="2"
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill={colors.text} className="font-semibold" fontSize="11">
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
        );
      })}
    </svg>
  );
};

// ── Grid (N-Queens) ─────────────────────────────────────────
const GridBoard: React.FC<{ frame: GridFrame, isDragging?: boolean }> = ({ frame, isDragging }) => {
  const { n, queens, trying } = frame;
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  return (
    <div className="flex h-[180px] items-center justify-center">
      <div
        className={`grid overflow-hidden rounded-md border ${isDark ? 'border-white/10' : 'border-zinc-300'}`}
        style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
      >
        {Array.from({ length: n * n }).map((_, idx) => {
          const r = Math.floor(idx / n);
          const c = idx % n;
          const dark = (r + c) % 2 === 1;
          const hasQueen = queens[r] === c;
          const isTrying = trying && trying.r === r && trying.c === c;
          const conflict = isTrying && frame.conflict;
          
          let cellBg = '';
          if (conflict) {
            cellBg = 'rgba(244,63,94,0.45)';
          } else if (isTrying) {
            cellBg = 'rgba(50,145,255,0.45)';
          } else {
            cellBg = dark 
              ? (isDark ? '#18181b' : '#e4e4e7') 
              : (isDark ? '#27272a' : '#ffffff');
          }

          return (
            <div
              key={idx}
              className="flex items-center justify-center text-[15px] transition-colors"
              style={{
                width: 26,
                height: 26,
                background: cellBg,
              }}
            >
              {hasQueen && (
                <motion.span
                  layout={!isDragging}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={spring}
                  style={{ color: frame.solved ? '#10b981' : (isDark ? '#ededed' : '#27272a') }}
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
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  return (
    <div className="flex h-[180px] items-center justify-center overflow-auto">
      <table className="border-collapse font-mono text-[9px]">
        <thead>
          <tr>
            <th className="p-0.5" />
            {colLabels.map((c, i) => (
              <th key={i} className={`px-1 py-0.5 font-normal ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, r) => (
            <tr key={r}>
              <td className={`pr-1.5 text-right whitespace-nowrap ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{rowLabels[r]}</td>
              {row.map((val, c) => {
                const isCursor = cursor && cursor.r === r && cursor.c === c;
                return (
                  <td key={c} className="p-[1px]">
                    <div
                      className="flex items-center justify-center rounded-[3px] tabular-nums transition-colors"
                      style={{
                        width: 22,
                        height: 18,
                        background: isCursor 
                          ? '#3291ff' 
                          : val === null 
                            ? 'transparent' 
                            : (isDark ? '#27272a' : '#f4f4f5'),
                        color: isCursor 
                          ? '#fff' 
                          : val === null 
                            ? (isDark ? '#3f3f46' : '#cbd5e1') 
                            : (isDark ? '#e4e4e7' : '#18181b'),
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
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
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
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
            stroke={highlight.includes(i) ? '#f5a623' : (isDark ? '#52525b' : '#cbd5e1')}
            strokeWidth="1.8"
            markerEnd="url(#vis-arrow)"
            animate={{ opacity: 1 }}
          />
        );
      })}
      <defs>
        <marker id="vis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={isDark ? '#71717a' : '#94a3b8'} />
        </marker>
      </defs>
      {parent.map((p, i) => {
        const isRoot = p === i;
        const hot = highlight.includes(i);
        let nodeFill = '';
        let nodeStroke = '';
        if (hot) {
          nodeStroke = '#f5a623';
        } else if (isRoot) {
          nodeStroke = '#3291ff';
        } else {
          nodeStroke = isDark ? '#52525b' : '#cbd5e1';
        }
        
        if (isRoot) {
          nodeFill = isDark ? '#1e3a5f' : '#eff6ff';
        } else {
          nodeFill = isDark ? '#27272a' : '#f4f4f5';
        }
        
        return (
          <g key={i}>
            <motion.circle
              cx={xOf(i)}
              cy={baseY}
              r="13"
              animate={{
                fill: nodeFill,
                stroke: nodeStroke,
              }}
              strokeWidth="2"
            />
            <text x={xOf(i)} y={baseY + 4} textAnchor="middle" fill={isRoot && !isDark ? '#1e40af' : (isDark ? '#f4f4f5' : '#27272a')} className="font-semibold" fontSize="11">
              {i}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── Dispatcher ──────────────────────────────────────────────
export const FrameRenderer: React.FC<{ frame: Frame, isDragging?: boolean }> = ({ frame, isDragging }) => {
  switch (frame.type) {
    case 'array':
      return <ArrayBars frame={frame} isDragging={isDragging} />;
    case 'graph':
      return <GraphView frame={frame} />;
    case 'grid':
      return <GridBoard frame={frame} isDragging={isDragging} />;
    case 'dp':
      return <DPTable frame={frame} />;
    case 'uf':
      return <UnionFindView frame={frame} />;
    default:
      return null;
  }
};
