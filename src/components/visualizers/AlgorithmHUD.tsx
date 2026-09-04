import React from 'react';
import type { TraceMeta } from '../../lib/algorithmFrames';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const AlgorithmHUD: React.FC<{ meta?: TraceMeta }> = ({ meta }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';
  if (!meta) return null;

  const stateEntries = Object.entries(meta.state ?? {}).slice(0, 6);
  const collections = (meta.collections ?? []).filter((item) => item.values.length > 0).slice(0, 2);

  return (
    <section
      aria-label="Current algorithm state"
      className={`mt-2 overflow-hidden rounded-lg border ${
        meta.invalid
          ? isDark ? 'border-rose-400/30 bg-rose-500/10' : 'border-rose-300 bg-rose-50'
          : isDark ? 'border-white/8 bg-white/[0.025]' : 'border-black/5 bg-white/70'
      }`}
    >
      <div className="grid grid-cols-[92px_1fr] gap-x-2 gap-y-1.5 px-2.5 py-2 text-[10px] leading-[1.35]">
        <span className={`font-mono uppercase tracking-[0.12em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Operation</span>
        <span className={`font-mono font-semibold ${meta.invalid ? 'text-rose-400' : 'text-emerald-500'}`}>{meta.operation}</span>

        <span className={`font-mono uppercase tracking-[0.12em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Phase</span>
        <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{meta.phase}</span>

        <span className={`font-mono uppercase tracking-[0.12em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Why</span>
        <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{meta.invalid ?? meta.why}</span>
      </div>

      {stateEntries.length > 0 && (
        <div className={`flex flex-wrap gap-1 border-t px-2.5 py-2 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          {stateEntries.map(([key, value]) => (
            <span key={key} className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${isDark ? 'bg-white/5 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
              {key}={String(value)}
            </span>
          ))}
        </div>
      )}

      {collections.length > 0 && (
        <div className={`space-y-1 border-t px-2.5 py-2 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          {collections.map((collection) => (
            <div key={collection.label} className="flex min-w-0 items-baseline gap-2">
              <span className={`shrink-0 font-mono text-[8px] uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{collection.label}</span>
              <span className={`truncate font-mono text-[9px] ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                [{collection.values.join(', ')}]
              </span>
            </div>
          ))}
        </div>
      )}

      {meta.invariant && (
        <div className={`border-t px-2.5 py-2 text-[9px] leading-[1.4] ${isDark ? 'border-white/5 text-violet-300' : 'border-black/5 text-violet-700'}`}>
          <span className="mr-1.5 font-mono text-[8px] uppercase tracking-wider opacity-60">Invariant</span>
          {meta.invariant}
        </div>
      )}
    </section>
  );
};
