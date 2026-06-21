import React from 'react';
import { ALGORITHMS, ALGORITHM_CATEGORIES } from '../config/algorithms';
import type { AlgorithmDef } from '../config/algorithms';
import { useWorkspaceStore } from '../store/workspaceStore';

interface Props {
  onAdd: (algorithmId: string) => void;
}

export const AlgorithmSidebar: React.FC<Props> = ({ onAdd }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';

  const Card = (a: AlgorithmDef) => (
    <button
      key={a.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-algorithm', a.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => onAdd(a.id)}
      className={`group w-full rounded-lg border px-2.5 py-2 text-left transition-colors cursor-grab active:cursor-grabbing ${
        isDark
          ? 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.06]'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 shadow-sm'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-[12.5px] font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{a.name}</span>
        <span className={`shrink-0 font-mono text-[9px] ${isDark ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-500'}`}>{a.complexity}</span>
      </div>
      <p className={`mt-0.5 text-[10.5px] leading-snug ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{a.blurb}</p>
    </button>
  );

  return (
    <aside className={`flex h-full w-[244px] flex-shrink-0 flex-col border-r ${
      isDark ? 'border-white/10 bg-[#0a0a0a] text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
    }`}>
      <div className="flex items-baseline justify-between px-4 pb-3 pt-4">
        <span className={`text-[15px] font-semibold tracking-[-0.02em] ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>Algorithms</span>
        <span className={`font-mono text-[11px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{ALGORITHMS.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {ALGORITHM_CATEGORIES.map((cat) => {
          const items = ALGORITHMS.filter((a) => a.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-4">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <span className={`font-mono text-[9.5px] uppercase tracking-[0.08em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{cat}</span>
                <span className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />
              </div>
              <div className="flex flex-col gap-1.5">{items.map(Card)}</div>
            </div>
          );
        })}
      </div>

      <div className={`border-t px-4 py-3 text-[10.5px] leading-relaxed ${isDark ? 'border-white/10 text-zinc-500' : 'border-zinc-200 text-zinc-400'}`}>
        <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Drag</span> onto the canvas, or{' '}
        <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>click</span> to drop a block. Each runs on its own.
      </div>
    </aside>
  );
};
