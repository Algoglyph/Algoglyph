import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
  GripVertical,
  Gauge,
  Dices,
} from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { VisualizerNodeData } from '../store/workspaceStore';
import { getAlgorithm } from '../config/algorithms';
import { getFrames } from '../lib/algorithmFrames';
import { FrameRenderer } from './visualizers/Visualizers';

// ── Compound primitives (Vercel composition pattern) ────────
// Kept as discrete pieces so the node shell stays declarative and a future
// node type can recompose Header / Body / Controls without prop explosion.
const NODE_W = 344;

interface VisNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
const VisNodeRoot: React.FC<VisNodeProps> = ({ children, className = '', ...rest }) => (
  <div
    data-node-root
    className={`flex flex-col rounded-xl ring-1 ring-white/10 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className}`}
    style={{
      width: NODE_W,
      // Legible "glass": a translucent dark panel with a faint top sheen so it
      // reads clearly against the flat dark canvas while keeping the blur.
      background:
        'linear-gradient(180deg, rgba(38,38,44,0.92) 0%, rgba(20,20,24,0.92) 100%)',
    }}
    {...rest}
  >
    {children}
  </div>
);

const VisHeader: React.FC<{
  title: string;
  complexity: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onRemove: () => void;
}> = ({ title, complexity, onPointerDown, onRemove }) => (
  <div
    onPointerDown={onPointerDown}
    className="flex cursor-grab items-center gap-2 border-b border-white/10 px-3 py-2 active:cursor-grabbing"
  >
    <GripVertical size={13} className="text-zinc-600" />
    <span className="flex-1 truncate text-[13px] font-semibold text-zinc-100">{title}</span>
    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">{complexity}</span>
    <button
      onClick={onRemove}
      onPointerDown={(e) => e.stopPropagation()}
      className="rounded p-0.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-rose-400"
      title="Remove node"
    >
      <X size={13} />
    </button>
  </div>
);

const VisBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2 pt-3">{children}</div>
);

const VisControls: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-1 border-t border-white/10 px-2 py-2">{children}</div>
);

const SPEEDS = [
  { label: '0.5×', ms: 1100 },
  { label: '1×', ms: 620 },
  { label: '2×', ms: 300 },
];

const ctrlBtn =
  'flex h-7 w-7 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer';

// ── The composed, draggable algorithm node ──────────────────
const VisualizerNodeImpl: React.FC<{ node: VisualizerNodeData; scale: number }> = ({ node, scale }) => {
  const moveNode = useWorkspaceStore((s) => s.moveVisualizerNode);
  const removeNode = useWorkspaceStore((s) => s.removeVisualizerNode);
  const algo = getAlgorithm(node.algorithmId);

  // `seed` lets Regenerate produce a fresh random input without remounting.
  const [seed, setSeed] = useState(0);
  const frames = useMemo(() => getFrames(node.algorithmId), [node.algorithmId, seed]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);

  const atEnd = index >= frames.length - 1;

  // Playback timer — local state only, so siblings never re-render while this runs.
  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, frames.length - 1)), SPEEDS[speedIdx].ms);
    return () => clearTimeout(t);
  }, [playing, index, atEnd, frames.length, speedIdx]);

  const togglePlay = () => {
    if (atEnd) {
      setIndex(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };
  const stepBack = () => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  };
  const stepFwd = () => {
    setPlaying(false);
    setIndex((i) => Math.min(frames.length - 1, i + 1));
  };
  const reset = () => {
    setPlaying(false);
    setIndex(0);
  };
  const regenerate = () => {
    setPlaying(false);
    setIndex(0);
    setSeed((s) => s + 1);
  };

  // ── Drag via the header (accounts for canvas zoom) ──────────
  const dragRef = useRef<{ startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);
  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startY: e.clientY, nodeX: node.x, nodeY: node.y };

      const onMove = (ev: PointerEvent) => {
        if (!dragRef.current) return;
        const dx = (ev.clientX - dragRef.current.startX) / scale;
        const dy = (ev.clientY - dragRef.current.startY) / scale;
        moveNode(node.id, dragRef.current.nodeX + dx, dragRef.current.nodeY + dy);
      };
      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [node.id, node.x, node.y, scale, moveNode]
  );

  const frame = frames[index];

  return (
    <motion.div
      className="absolute"
      style={{ left: node.x, top: node.y }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <VisNodeRoot>
        <VisHeader
          title={algo?.name ?? node.algorithmId}
          complexity={algo?.complexity ?? ''}
          onPointerDown={onHeaderPointerDown}
          onRemove={() => removeNode(node.id)}
        />

        <VisBody>
          <div className="rounded-lg bg-black/30 ring-1 ring-white/5">
            {frame && <FrameRenderer frame={frame} />}
          </div>
          {/* Caption + progress */}
          <div className="mt-2 px-1">
            <p className="h-8 text-[11px] leading-tight text-zinc-300">{frame?.caption}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                  style={{ width: `${((index + 1) / frames.length) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[9px] tabular-nums text-zinc-500">
                {index + 1}/{frames.length}
              </span>
            </div>
          </div>
        </VisBody>

        <VisControls>
          <button onClick={stepBack} disabled={index === 0} className={ctrlBtn} title="Step back">
            <SkipBack size={14} />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white transition-colors hover:bg-emerald-500 cursor-pointer"
            title={playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={stepFwd} disabled={atEnd} className={ctrlBtn} title="Step forward">
            <SkipForward size={14} />
          </button>
          <button onClick={reset} disabled={index === 0} className={ctrlBtn} title="Reset to start">
            <RotateCcw size={13} />
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={regenerate} className={ctrlBtn} title="Regenerate input">
              <Dices size={14} />
            </button>
            <button
              onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
              className="flex h-7 items-center gap-1 rounded-md px-1.5 text-[10px] font-mono text-zinc-300 transition-colors hover:bg-white/10 cursor-pointer"
              title="Playback speed"
            >
              <Gauge size={12} />
              {SPEEDS[speedIdx].label}
            </button>
          </div>
        </VisControls>
      </VisNodeRoot>
    </motion.div>
  );
};

// Memoized: a node only re-renders when its own data or the zoom scale change,
// so playback inside one node never touches the others.
export const VisualizerNode = React.memo(VisualizerNodeImpl);

// Re-export the compound primitives for composition elsewhere if needed.
export const VisNode = Object.assign(VisNodeRoot, {
  Header: VisHeader,
  Body: VisBody,
  Controls: VisControls,
});
