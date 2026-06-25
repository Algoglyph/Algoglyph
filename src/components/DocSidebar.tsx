import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PanelRightClose, Play, Pause } from 'lucide-react';
import { getAlgorithm } from '../config/algorithms';
import { getAlgorithmDoc } from '../config/algorithmDocs';
import { useWorkspaceStore } from '../store/workspaceStore';

interface Props {
  algorithmId: string;
  onClose: () => void;
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 640;

// ── Signature: a deterministic "linear scan" that hops cell to cell until it
// lands on the matched (emerald) element — the one characteristic motion of the
// algorithm, used as the panel's thesis. ──────────────────────────────────────
const SCAN_HEIGHTS = [44, 70, 32, 86, 54, 24, 64, 48, 78]; // seeded, fixed
const TARGET = 6; // the element the scan resolves to

const LinearScanHero: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const reduce = useReducedMotion();
  const idle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  // Staggered opacity (transform/opacity only — no layout animation): each checked
  // cell flashes in sequence left→right and the run ends on the match.
  const step = 0.16;
  const lit = 0.5;
  const lastScanned = TARGET - 1;

  // Plays through exactly once, then stops on the match. Autoplays once when the
  // panel opens (unless reduced motion); after that the user drives every replay.
  const [playing, setPlaying] = useState(!reduce);
  const [runId, setRunId] = useState(0); // bumped to remount the row and replay

  // Stop the run deterministically once the last cell has finished — onAnimation-
  // Complete on a delayed keyframe is unreliable, so we time the known duration.
  useEffect(() => {
    if (!playing || reduce) return;
    const ms = (lastScanned * step + lit) * 1000 + 120;
    const t = setTimeout(() => setPlaying(false), ms);
    return () => clearTimeout(t);
  }, [playing, runId, reduce, lastScanned, step, lit]);

  const replay = () => {
    setRunId((r) => r + 1);
    setPlaying(true);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${isDark ? 'bg-black/40 ring-1 ring-white/[0.06]' : 'bg-white ring-1 ring-zinc-200'}`}>
      <div key={runId} className="flex h-[124px] items-end gap-[5px] px-3 pt-4 pb-3">
        {SCAN_HEIGHTS.map((h, i) => {
          const found = i === TARGET;
          const scanned = i < TARGET; // cells the scan visits before landing on the match
          return (
            <div key={i} className="relative flex-1" style={{ height: `${h}%` }}>
              <div className="absolute inset-0 rounded-t-[3px]" style={{ backgroundColor: found ? '#10b981' : idle }} />
              {scanned && playing && !reduce && (
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-t-[3px] bg-emerald-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.85, 0] }}
                  transition={{ duration: lit, ease: 'easeInOut', delay: i * step }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className={`flex items-center gap-2 px-3 pb-2 font-mono text-[9.5px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        {!reduce && (
          <button
            type="button"
            onClick={playing ? () => setPlaying(false) : replay}
            aria-label={playing ? 'Pause scan' : 'Play scan'}
            title={playing ? 'Pause' : 'Play scan'}
            className={`flex items-center justify-center rounded p-0.5 transition-colors cursor-pointer ${
              isDark ? 'text-zinc-400 hover:bg-white/10 hover:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-200 hover:text-emerald-600'
            }`}
          >
            {playing ? <Pause size={12} /> : <Play size={12} />}
          </button>
        )}
        <span>index 0 → n−1</span>
        <span className="ml-auto text-emerald-500">match at {TARGET}</span>
      </div>
    </div>
  );
};

export const DocSidebar: React.FC<Props> = ({ algorithmId, onClose }) => {
  const theme = useWorkspaceStore((s) => s.theme);
  const isDark = theme === 'dark';
  const reduce = useReducedMotion();

  const algo = getAlgorithm(algorithmId);
  const doc = getAlgorithmDoc(algorithmId);

  const [width, setWidth] = useState(384);
  const [isResizing, setIsResizing] = useState(false);
  const rightEdge = useRef(0);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) =>
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, rightEdge.current - e.clientX)));
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);

  // Escape collapses the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!doc || !algo) return null;

  const eyebrow = `font-mono text-[9.5px] uppercase tracking-[0.1em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`;
  const bodyText = isDark ? 'text-zinc-300' : 'text-zinc-600';
  const strongText = isDark ? 'text-zinc-100' : 'text-zinc-900';

  return (
    <>
      {/* Overlay so the canvas doesn't swallow the resize drag. */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}

      <motion.aside
        initial={reduce ? false : { x: 28, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        style={{ width }}
        className={`relative z-20 flex h-full shrink-0 flex-col border-l ${
          isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-zinc-200 bg-white'
        }`}
      >
        {/* Resize handle on the LEFT edge. */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            rightEdge.current = e.currentTarget.parentElement!.getBoundingClientRect().right;
            setIsResizing(true);
          }}
          title="Drag to resize"
          className="group absolute left-0 top-0 z-40 flex h-full w-1.5 -translate-x-1/2 cursor-col-resize justify-center"
        >
          <span className={`h-full w-px transition-colors ${isResizing ? 'bg-link' : 'bg-transparent group-hover:bg-link'}`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
          <div className="flex min-w-0 items-baseline gap-2 overflow-hidden">
            <h2 className={`min-w-0 truncate text-[15px] font-semibold tracking-[-0.02em] ${strongText}`}>{algo.name}</h2>
            <span className={`shrink-0 font-mono text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{algo.complexity}</span>
          </div>
          <button
            onClick={onClose}
            title="Collapse panel"
            aria-label="Collapse panel"
            className={`flex shrink-0 items-center rounded-md p-1 cursor-pointer transition-colors ${
              isDark ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <PanelRightClose size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {algorithmId === 'linear-search' && <LinearScanHero isDark={isDark} />}

          <p className={`mt-4 text-[13.5px] leading-relaxed ${strongText}`}>{doc.tagline}</p>
          <p className={`mt-2.5 text-[12.5px] leading-relaxed ${bodyText}`}>{doc.idea}</p>

          {/* How it works — a genuine sequence, so it's numbered. */}
          <Section eyebrow={eyebrow} label="How it works">
            <ol className="flex flex-col gap-2">
              {doc.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className={`mt-px font-mono text-[10px] tabular-nums ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-[12.5px] leading-snug ${bodyText}`}>{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Complexity */}
          <Section eyebrow={eyebrow} label="Complexity">
            <div className={`overflow-hidden rounded-lg border ${isDark ? 'border-white/[0.08]' : 'border-zinc-200'}`}>
              {doc.complexity.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-baseline gap-3 px-3 py-2 ${
                    i > 0 ? (isDark ? 'border-t border-white/[0.06]' : 'border-t border-zinc-100') : ''
                  }`}
                >
                  <span className={`w-16 shrink-0 text-[11px] ${bodyText}`}>{row.label}</span>
                  <span className={`w-16 shrink-0 font-mono text-[12px] ${strongText}`}>{row.value}</span>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{row.note}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Reach for it when */}
          <Section eyebrow={eyebrow} label="Reach for it when">
            <BulletList items={doc.useWhen} marker="+" markerClass="text-emerald-500" bodyText={bodyText} />
          </Section>

          {/* Watch out */}
          <Section eyebrow={eyebrow} label="Watch out">
            <BulletList items={doc.watchOut} marker="!" markerClass={isDark ? 'text-amber-500' : 'text-amber-600'} bodyText={bodyText} />
          </Section>

          {/* Reference implementation */}
          <Section eyebrow={eyebrow} label="Reference">
            <pre className={`overflow-x-auto rounded-lg border px-3 py-2.5 text-[11.5px] leading-relaxed ${
              isDark ? 'border-white/[0.08] bg-black/40 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
            }`}>
              <code className="font-mono">{doc.code}</code>
            </pre>
          </Section>
        </div>
      </motion.aside>
    </>
  );
};

const Section: React.FC<{ eyebrow: string; label: string; children: React.ReactNode }> = ({ eyebrow, label, children }) => (
  <section className="mt-6">
    <div className="mb-2.5 flex items-center gap-2">
      <span className={eyebrow}>{label}</span>
      <span className="h-px flex-1 bg-current opacity-10" />
    </div>
    {children}
  </section>
);

const BulletList: React.FC<{ items: string[]; marker: string; markerClass: string; bodyText: string }> = ({ items, marker, markerClass, bodyText }) => (
  <ul className="flex flex-col gap-2">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2.5">
        <span className={`mt-px font-mono text-[11px] ${markerClass}`}>{marker}</span>
        <span className={`text-[12.5px] leading-snug ${bodyText}`}>{item}</span>
      </li>
    ))}
  </ul>
);
