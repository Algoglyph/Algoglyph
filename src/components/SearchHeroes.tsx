import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

interface HeroProps {
  isDark: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Linear Search Hero
// ──────────────────────────────────────────────────────────────────────────────
const LS_HEIGHTS = [44, 70, 32, 86, 54, 24, 64, 48, 78];
const LS_TARGET = 6;

export const LinearScanHero: React.FC<HeroProps> = ({ isDark }) => {
  const reduce = useReducedMotion();
  const idle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const step = 0.16;
  const lit = 0.5;
  const lastScanned = LS_TARGET - 1;

  const [playing, setPlaying] = useState(!reduce);
  const [runId, setRunId] = useState(0);

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
        {LS_HEIGHTS.map((h, i) => {
          const found = i === LS_TARGET;
          const scanned = i < LS_TARGET;
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
      <HeroFooter playing={playing} reduce={reduce} replay={replay} setPlaying={setPlaying} isDark={isDark} leftText="index 0 → n−1" rightText={`match at ${LS_TARGET}`} />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Shared Helper for Stage-Based Heroes (Binary, Lower, Upper, Ternary)
// ──────────────────────────────────────────────────────────────────────────────
interface Stage {
  el: number[]; // indices that are eliminated in this stage
  found?: number; // the index of the found element (if any)
}

function useHeroStages(stages: Stage[], reduce: boolean | null) {
  const [stageIdx, setStageIdx] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!playing || reduce) {
      if (reduce) setStageIdx(stages.length - 1);
      return;
    }
    if (stageIdx >= stages.length - 1) {
      const t = setTimeout(() => setPlaying(false), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStageIdx((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [playing, stageIdx, runId, reduce, stages.length]);

  const replay = () => {
    setRunId((r) => r + 1);
    setStageIdx(0);
    setPlaying(true);
  };

  return { stageIdx, playing, setPlaying, replay, currentStage: stages[stageIdx] };
}

const HeroFooter: React.FC<{
  playing: boolean;
  reduce: boolean | null;
  replay: () => void;
  setPlaying: (p: boolean) => void;
  isDark: boolean;
  leftText: string;
  rightText: string;
}> = ({ playing, reduce, replay, setPlaying, isDark, leftText, rightText }) => (
  <div className={`flex items-center gap-2 px-3 pb-2 font-mono text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
    {!reduce && (
      <button
        type="button"
        onClick={playing ? () => setPlaying(false) : replay}
        aria-label={playing ? 'Pause animation' : 'Play animation'}
        title={playing ? 'Pause' : 'Play animation'}
        className={`flex items-center justify-center rounded p-0.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
          isDark ? 'text-zinc-400 hover:bg-white/10 hover:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-200 hover:text-emerald-600'
        }`}
      >
        {playing ? <Pause size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
      </button>
    )}
    <span>{leftText}</span>
    <span className="ml-auto text-emerald-500">{rightText}</span>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────────
// Binary Search Hero
// ──────────────────────────────────────────────────────────────────────────────
const BS_HEIGHTS = [12, 24, 32, 45, 54, 64, 70, 78, 86, 92, 98];
const BS_STAGES: Stage[] = [
  { el: [] },
  { el: [0, 1, 2, 3, 4, 5] },
  { el: [0, 1, 2, 3, 4, 5, 8, 9, 10] },
  { el: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10] },
  { el: [0, 1, 2, 3, 4, 5, 6, 8, 9, 10], found: 7 },
];

export const BinarySearchHero: React.FC<HeroProps> = ({ isDark }) => {
  const reduce = useReducedMotion();
  const { playing, setPlaying, replay, currentStage } = useHeroStages(BS_STAGES, reduce);
  const idle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  return (
    <div className={`relative overflow-hidden rounded-lg ${isDark ? 'bg-black/40 ring-1 ring-white/[0.06]' : 'bg-white ring-1 ring-zinc-200'}`}>
      <div className="flex h-[124px] items-end gap-[5px] px-3 pt-4 pb-3">
        {BS_HEIGHTS.map((h, i) => {
          const isEliminated = currentStage.el.includes(i);
          const isFound = currentStage.found === i;
          return (
            <div key={i} className="relative flex-1" style={{ height: `${h}%` }}>
              <motion.div
                initial={false}
                animate={{ backgroundColor: isFound ? '#10b981' : idle, opacity: isEliminated ? 0.2 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-t-[3px]"
              />
            </div>
          );
        })}
      </div>
      <HeroFooter playing={playing} reduce={reduce} replay={replay} setPlaying={setPlaying} isDark={isDark} leftText="lo and hi close in" rightText="match at 7" />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Lower Bound Hero
// ──────────────────────────────────────────────────────────────────────────────
const LB_HEIGHTS = [10, 20, 20, 20, 40, 40, 60, 80, 90, 100, 110];
const LB_STAGES: Stage[] = [
  { el: [] },
  { el: [6, 7, 8, 9, 10] },
  { el: [0, 1, 2, 6, 7, 8, 9, 10] },
  { el: [0, 1, 2, 5, 6, 7, 8, 9, 10] },
  { el: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10] },
  { el: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10], found: 4 },
];

export const LowerBoundHero: React.FC<HeroProps> = ({ isDark }) => {
  const reduce = useReducedMotion();
  const { playing, setPlaying, replay, currentStage } = useHeroStages(LB_STAGES, reduce);
  const idle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  return (
    <div className={`relative overflow-hidden rounded-lg ${isDark ? 'bg-black/40 ring-1 ring-white/[0.06]' : 'bg-white ring-1 ring-zinc-200'}`}>
      <div className="flex h-[124px] items-end gap-[5px] px-3 pt-4 pb-3">
        {LB_HEIGHTS.map((h, i) => {
          const isEliminated = currentStage.el.includes(i);
          const isFound = currentStage.found === i;
          return (
            <div key={i} className="relative flex-1" style={{ height: `${h}%` }}>
              <motion.div
                initial={false}
                animate={{ backgroundColor: isFound ? '#10b981' : idle, opacity: isEliminated ? 0.2 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-t-[3px]"
              />
            </div>
          );
        })}
      </div>
      <HeroFooter playing={playing} reduce={reduce} replay={replay} setPlaying={setPlaying} isDark={isDark} leftText="find first element ≥ target" rightText="found at 4" />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Upper Bound Hero
// ──────────────────────────────────────────────────────────────────────────────
const UB_HEIGHTS = [10, 20, 20, 20, 40, 40, 60, 80, 90, 100, 110];
const UB_STAGES: Stage[] = [
  { el: [] },
  { el: [0, 1, 2, 3, 4, 5] },
  { el: [0, 1, 2, 3, 4, 5, 9, 10] },
  { el: [0, 1, 2, 3, 4, 5, 8, 9, 10] },
  { el: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10] },
  { el: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10], found: 6 },
];

export const UpperBoundHero: React.FC<HeroProps> = ({ isDark }) => {
  const reduce = useReducedMotion();
  const { playing, setPlaying, replay, currentStage } = useHeroStages(UB_STAGES, reduce);
  const idle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  return (
    <div className={`relative overflow-hidden rounded-lg ${isDark ? 'bg-black/40 ring-1 ring-white/[0.06]' : 'bg-white ring-1 ring-zinc-200'}`}>
      <div className="flex h-[124px] items-end gap-[5px] px-3 pt-4 pb-3">
        {UB_HEIGHTS.map((h, i) => {
          const isEliminated = currentStage.el.includes(i);
          const isFound = currentStage.found === i;
          return (
            <div key={i} className="relative flex-1" style={{ height: `${h}%` }}>
              <motion.div
                initial={false}
                animate={{ backgroundColor: isFound ? '#10b981' : idle, opacity: isEliminated ? 0.2 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-t-[3px]"
              />
            </div>
          );
        })}
      </div>
      <HeroFooter playing={playing} reduce={reduce} replay={replay} setPlaying={setPlaying} isDark={isDark} leftText="find first element > target" rightText="found at 6" />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Ternary Search Hero
// ──────────────────────────────────────────────────────────────────────────────
const TS_HEIGHTS = [20, 35, 55, 70, 85, 95, 100, 80, 60, 45, 25];
const TS_STAGES: Stage[] = [
  { el: [] },
  { el: [0, 1, 2, 3] },
  { el: [0, 1, 2, 3, 8, 9, 10] },
  { el: [0, 1, 2, 3, 7, 8, 9, 10] },
  { el: [0, 1, 2, 3, 4, 7, 8, 9, 10] },
  { el: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10] },
  { el: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10], found: 6 },
];

export const TernarySearchHero: React.FC<HeroProps> = ({ isDark }) => {
  const reduce = useReducedMotion();
  const { playing, setPlaying, replay, currentStage } = useHeroStages(TS_STAGES, reduce);
  const idle = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

  return (
    <div className={`relative overflow-hidden rounded-lg ${isDark ? 'bg-black/40 ring-1 ring-white/[0.06]' : 'bg-white ring-1 ring-zinc-200'}`}>
      <div className="flex h-[124px] items-end gap-[5px] px-3 pt-4 pb-3">
        {TS_HEIGHTS.map((h, i) => {
          const isEliminated = currentStage.el.includes(i);
          const isFound = currentStage.found === i;
          return (
            <div key={i} className="relative flex-1" style={{ height: `${h}%` }}>
              <motion.div
                initial={false}
                animate={{ backgroundColor: isFound ? '#10b981' : idle, opacity: isEliminated ? 0.2 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-t-[3px]"
              />
            </div>
          );
        })}
      </div>
      <HeroFooter playing={playing} reduce={reduce} replay={replay} setPlaying={setPlaying} isDark={isDark} leftText="eliminate 1/3 of space" rightText="peak at 6" />
    </div>
  );
};
