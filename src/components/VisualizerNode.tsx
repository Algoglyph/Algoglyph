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
  Pencil,
  Check as CheckIcon,
} from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { VisualizerNodeData } from '../store/workspaceStore';
import { getAlgorithm } from '../config/algorithms';
import { getFrames, CUSTOM_INPUT_ALGORITHMS } from '../lib/algorithmFrames';
import { FrameRenderer } from './visualizers/Visualizers';

// ── Compound primitives (Vercel composition pattern) ────────
// Kept as discrete pieces so the node shell stays declarative and a future
// node type can recompose Header / Body / Controls without prop explosion.
const NODE_W = 344;

interface VisNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
const VisNodeRoot: React.FC<VisNodeProps> = ({ children, className = '', ...rest }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  return (
    <div
      data-node-root
      className={`flex flex-col rounded-xl ring-1 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-[background-color,border-color] duration-300 ${className} ${
        isDark ? 'ring-white/10' : 'ring-black/10'
      }`}
      style={{
        width: NODE_W,
        background: isDark
          ? 'linear-gradient(180deg, rgba(38,38,44,0.92) 0%, rgba(20,20,24,0.92) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(244,244,245,0.95) 100%)',
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

const VisHeader: React.FC<{
  title: string;
  complexity: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onRemove: () => void;
}> = ({ title, complexity, onPointerDown, onRemove }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  return (
    <div
      onPointerDown={onPointerDown}
      className={`flex cursor-grab items-center gap-2 border-b px-3 py-2 active:cursor-grabbing ${
        isDark ? 'border-white/10' : 'border-black/5'
      }`}
    >
      <GripVertical size={13} className={isDark ? 'text-zinc-600' : 'text-zinc-400'} />
      <span className={`flex-1 truncate text-[13px] font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{title}</span>
      <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-black/5 text-zinc-500'}`}>{complexity}</span>
      <button
        onClick={onRemove}
        onPointerDown={(e) => e.stopPropagation()}
        className={`rounded p-0.5 transition-colors cursor-pointer ${
          isDark ? 'text-zinc-500 hover:bg-white/10 hover:text-rose-400' : 'text-zinc-400 hover:bg-black/5 hover:text-rose-600'
        }`}
        title="Remove node"
      >
        <X size={13} />
      </button>
    </div>
  );
};

const VisBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-2 pt-3">{children}</div>
);

const VisControls: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  return (
    <div className={`flex items-center gap-1 border-t px-2 py-2 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
      {children}
    </div>
  );
};

const SPEEDS = [
  { label: '0.5×', ms: 1800 },
  { label: '1×', ms: 1000 },
  { label: '2×', ms: 500 },
];

// ── The composed, draggable algorithm node ──────────────────
const VisualizerNodeImpl: React.FC<{ node: VisualizerNodeData; scale: number }> = ({ node, scale }) => {
  const moveNode = useWorkspaceStore((s) => s.moveVisualizerNode);
  const removeNode = useWorkspaceStore((s) => s.removeVisualizerNode);
  const theme = useWorkspaceStore((s) => s.theme);
  const isDark = theme === 'dark';
  const algo = getAlgorithm(node.algorithmId);

  // Custom input support
  const supportsCustomInput = CUSTOM_INPUT_ALGORITHMS.has(node.algorithmId);
  const [customInput, setCustomInput] = useState('');
  const [editingInput, setEditingInput] = useState(false);
  const [appliedInput, setAppliedInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // `seed` lets Regenerate produce a fresh random input without remounting.
  const [seed, setSeed] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const frames = useMemo(() => getFrames(node.algorithmId, appliedInput || undefined), [node.algorithmId, seed, appliedInput]);

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
    setAppliedInput(''); // clear custom to go back to random
    setCustomInput('');
    setSeed((s) => s + 1);
  };

  const applyCustomInput = () => {
    setEditingInput(false);
    setPlaying(false);
    setIndex(0);
    setAppliedInput(customInput);
    setSeed((s) => s + 1);
  };

  const startEditing = () => {
    setEditingInput(true);
    setTimeout(() => inputRef.current?.focus(), 50);
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

        {/* Custom input row */}
        {supportsCustomInput && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 border-b ${isDark ? 'border-white/10' : 'border-black/5'}`}>
            {editingInput ? (
              <>
                <input
                  ref={inputRef}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') applyCustomInput();
                    if (e.key === 'Escape') setEditingInput(false);
                  }}
                  placeholder="e.g. 5, 3, 8, 1, 9"
                  className={`flex-1 rounded px-2 py-1 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark ? 'bg-black/40 text-zinc-200 placeholder-zinc-600' : 'bg-zinc-100 text-zinc-800 placeholder-zinc-400'
                  }`}
                  onPointerDown={(e) => e.stopPropagation()}
                />
                <button
                  onClick={applyCustomInput}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-6 w-6 items-center justify-center rounded bg-emerald-600 text-white transition-colors hover:bg-emerald-500 cursor-pointer"
                  title="Apply input"
                >
                  <CheckIcon size={12} />
                </button>
              </>
            ) : (
              <>
                <span className={`flex-1 truncate text-[10px] font-mono ${
                  appliedInput
                    ? (isDark ? 'text-emerald-400' : 'text-emerald-700')
                    : (isDark ? 'text-zinc-600' : 'text-zinc-400')
                }`}>
                  {appliedInput ? `Input: ${appliedInput}` : 'Custom input (comma-separated)'}
                </span>
                <button
                  onClick={startEditing}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200' : 'text-zinc-500 hover:bg-black/5 hover:text-zinc-800'
                  }`}
                  title="Edit input values"
                >
                  <Pencil size={11} />
                </button>
              </>
            )}
          </div>
        )}

        <VisBody>
          <div className={`rounded-lg ring-1 ${isDark ? 'bg-black/30 ring-white/5' : 'bg-white/50 ring-black/5'}`}>
            {frame && <FrameRenderer frame={frame} />}
          </div>
          {/* Caption + progress */}
          <div className="mt-2 px-1">
            <p className={`h-8 text-[11px] leading-tight ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{frame?.caption}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className={`h-1 flex-1 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`}>
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-200"
                  style={{ width: `${((index + 1) / frames.length) * 100}%` }}
                />
              </div>
              <span className={`font-mono text-[9px] tabular-nums ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {index + 1}/{frames.length}
              </span>
            </div>
          </div>
        </VisBody>

        <VisControls>
          <button onClick={stepBack} disabled={index === 0} className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${isDark ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-650 hover:bg-black/5 hover:text-zinc-950'}`} title="Step back">
            <SkipBack size={14} />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white transition-colors hover:bg-emerald-500 cursor-pointer"
            title={playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={stepFwd} disabled={atEnd} className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${isDark ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-650 hover:bg-black/5 hover:text-zinc-950'}`} title="Step forward">
            <SkipForward size={14} />
          </button>
          <button onClick={reset} disabled={index === 0} className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${isDark ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-650 hover:bg-black/5 hover:text-zinc-950'}`} title="Reset to start">
            <RotateCcw size={13} />
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={regenerate} className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${isDark ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-650 hover:bg-black/5 hover:text-zinc-950'}`} title="Regenerate random input">
              <Dices size={14} />
            </button>
            <button
              onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
              className={`flex h-7 items-center gap-1 rounded-md px-1.5 text-[10px] font-mono transition-colors cursor-pointer ${isDark ? 'text-zinc-300 hover:bg-white/10' : 'text-zinc-650 hover:bg-black/5 hover:text-zinc-950'}`}
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
