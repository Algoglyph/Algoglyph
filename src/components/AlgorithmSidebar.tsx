import React from 'react';
import { ALGORITHMS, ALGORITHM_CATEGORIES } from '../config/algorithms';
import type { AlgorithmDef } from '../config/algorithms';

interface Props {
  onAdd: (algorithmId: string) => void;
}

export const AlgorithmSidebar: React.FC<Props> = ({ onAdd }) => {
  const Card = (a: AlgorithmDef) => (
    <button
      key={a.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-algorithm', a.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => onAdd(a.id)}
      className="group w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-left transition-colors hover:border-white/15 hover:bg-white/[0.06] cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-medium text-zinc-100">{a.name}</span>
        <span className="shrink-0 font-mono text-[9px] text-zinc-500 group-hover:text-zinc-400">{a.complexity}</span>
      </div>
      <p className="mt-0.5 text-[10.5px] leading-snug text-zinc-500">{a.blurb}</p>
    </button>
  );

  return (
    <aside className="flex h-full w-[244px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0a0a0a] text-zinc-300">
      <div className="flex items-baseline justify-between px-4 pb-3 pt-4">
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-zinc-100">Algorithms</span>
        <span className="font-mono text-[11px] text-zinc-600">{ALGORITHMS.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {ALGORITHM_CATEGORIES.map((cat) => {
          const items = ALGORITHMS.filter((a) => a.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-4">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-zinc-600">{cat}</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <div className="flex flex-col gap-1.5">{items.map(Card)}</div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-4 py-3 text-[10.5px] leading-relaxed text-zinc-500">
        <span className="font-medium text-zinc-300">Drag</span> onto the canvas, or{' '}
        <span className="font-medium text-zinc-300">click</span> to drop a block. Each runs on its own.
      </div>
    </aside>
  );
};
