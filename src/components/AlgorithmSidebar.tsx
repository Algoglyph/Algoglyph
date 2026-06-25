import React, { useEffect, useState } from 'react';
import { PanelLeftClose, BookOpen } from 'lucide-react';
import { ALGORITHMS, ALGORITHM_CATEGORIES } from '../config/algorithms';
import type { AlgorithmDef } from '../config/algorithms';
import { hasAlgorithmDoc } from '../config/algorithmDocs';
import { useWorkspaceStore } from '../store/workspaceStore';
import { SearchField } from './SearchField';
import { matchesQuery } from '../lib/search';

interface Props {
  onAdd: (algorithmId: string) => void;
  onOpenDoc: (algorithmId: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 420;

export const AlgorithmSidebar: React.FC<Props> = ({ onAdd, onOpenDoc, isOpen, isMobile, onClose }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Desktop sidebar width is drag-resizable. The sidebar's left edge sits at
  // viewport x=0 (the Visualizer fills the width), so the pointer's clientX is
  // the new width.
  const [width, setWidth] = useState(272);
  const [isResizing, setIsResizing] = useState(false);
  const [query, setQuery] = useState('');

  const visible = (a: AlgorithmDef) =>
    matchesQuery(`${a.name} ${a.id} ${a.blurb} ${a.complexity}`, query);
  const totalMatches = ALGORITHMS.filter(visible).length;

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX)));
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);

  const addBlock = (id: string) => {
    onAdd(id);
    // On mobile the sidebar is a modal drawer — close it after dropping a block
    // so the canvas is visible again.
    if (isMobile) onClose();
  };

  // A card is its own drag/click target for adding a block, so the whole thing
  // can't be a <button> (the doc trigger inside it needs to be a real button).
  // A keyboard-operable div keeps Enter/Space working without nesting buttons.
  const Card = (a: AlgorithmDef) => (
    <div
      key={a.id}
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-algorithm', a.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => addBlock(a.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          addBlock(a.id);
        }
      }}
      className={`group w-full rounded-lg border px-2.5 py-2 text-left outline-none transition-colors cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-link ${
        isDark
          ? 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.06]'
          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 shadow-sm'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-[12.5px] font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>{a.name}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {hasAlgorithmDoc(a.id) && !isMobile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDoc(a.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title={`Read about ${a.name}`}
              aria-label={`Read about ${a.name}`}
              className={`flex items-center rounded p-0.5 transition-colors cursor-pointer ${
                isDark ? 'text-zinc-500 hover:bg-white/10 hover:text-emerald-400' : 'text-zinc-400 hover:bg-zinc-200 hover:text-emerald-600'
              }`}
            >
              <BookOpen size={13} />
            </button>
          )}
          <span className={`font-mono text-[9px] ${isDark ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-500'}`}>{a.complexity}</span>
        </div>
      </div>
      <p className={`mt-0.5 text-[10.5px] leading-snug ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{a.blurb}</p>
    </div>
  );

  const surface = isDark
    ? 'border-white/10 bg-[#0a0a0a] text-zinc-300'
    : 'border-zinc-200 bg-zinc-50 text-zinc-600';

  // Shared inner content for both the desktop sidebar and the mobile drawer.
  const body = (
    <>
      <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-[15px] font-semibold tracking-[-0.02em] ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>Algorithms</span>
          <span className={`font-mono text-[11px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{ALGORITHMS.length}</span>
        </div>
        <button
          onClick={onClose}
          title={isMobile ? 'Close' : 'Collapse sidebar'}
          className={`flex items-center rounded-md p-1 cursor-pointer transition-colors ${isDark ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div className="px-3 pb-2">
        <SearchField value={query} onChange={setQuery} placeholder="Search algorithms…" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {totalMatches === 0 ? (
          <p className="px-1 py-6 text-[12px] text-zinc-500">No algorithms match “{query}”.</p>
        ) : (
          ALGORITHM_CATEGORIES.map((cat) => {
            const items = ALGORITHMS.filter((a) => a.category === cat && visible(a));
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
          })
        )}
      </div>

      <div className={`border-t px-4 py-3 text-[10.5px] leading-relaxed ${isDark ? 'border-white/10 text-zinc-500' : 'border-zinc-200 text-zinc-400'}`}>
        <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Drag</span> onto the canvas, or{' '}
        <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>click</span> to drop a block. Each runs on its own.
      </div>
    </>
  );

  // Mobile: overlay drawer that slides in from the left over the canvas.
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
        )}
        <aside
          className={`fixed left-0 top-0 z-50 flex h-full w-[min(82vw,280px)] flex-col border-r pb-14 shadow-[var(--shadow-soft)] ${surface} transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {body}
        </aside>
      </>
    );
  }

  // Desktop: inline sidebar that slides open/closed (negative margin-left, so the
  // canvas reflows and the panel clips off-screen — animating a flex item's width
  // fights flexbox sizing) and is resizable by dragging its right edge.
  return (
    <>
      {/* Transparent overlay so the canvas doesn't swallow the drag */}
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}

      <aside
        style={{ width, marginLeft: isOpen ? 0 : -width }}
        className={`relative flex h-full shrink-0 flex-col border-r ${surface} ${
          isResizing ? '' : 'transition-[margin] duration-300 ease-in-out'
        }`}
      >
        {body}

        {/* Resize handle on the right edge */}
        {isOpen && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            title="Drag to resize"
            className="group absolute top-0 right-0 z-40 flex h-full w-1.5 translate-x-1/2 cursor-col-resize justify-center"
          >
            <span
              className={`h-full w-px transition-colors ${
                isResizing ? 'bg-link' : 'bg-transparent group-hover:bg-link'
              }`}
            />
          </div>
        )}
      </aside>
    </>
  );
};
