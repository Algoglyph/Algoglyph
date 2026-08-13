import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { dsaStructures } from '../config/dsaStructures';
import { useWorkspaceStore } from '../store/workspaceStore';
import { LoadingSpinner } from './LoadingSpinner';
import { insertStructureIntoCanvas } from '../lib/insertStructure';
import type { InsertableStructure } from '../lib/insertStructure';
import { useIsMobile } from '../hooks/useIsMobile';
import { SearchField } from './SearchField';
import { matchesQuery } from '../lib/search';

export const StructuresPanel: React.FC = () => {
  const isOpen = useWorkspaceStore((state) => state.structuresPanelOpen);
  const width = useWorkspaceStore((state) => state.structuresWidth);
  const setStructuresWidth = useWorkspaceStore((state) => state.setStructuresWidth);
  const setStructuresPanelOpen = useWorkspaceStore((state) => state.setStructuresPanelOpen);
  const showNotification = useWorkspaceStore((state) => state.showNotification);
  const isMobile = useIsMobile();

  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState('');
  
  const [activeLibraryId, setActiveLibraryId] = useState<string>('dsa');
  const [loadedLibrary, setLoadedLibrary] = useState<any[] | null>(null);
  const [librariesIndex, setLibrariesIndex] = useState<any[]>([]);

  useEffect(() => {
    import('../config/librariesIndex.json').then((module) => {
      setLibrariesIndex(module.default);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeLibraryId === 'dsa') {
      setLoadedLibrary(null);
    } else {
      fetch(`/libraries/${activeLibraryId}.json`)
        .then(res => res.json())
        .then(data => setLoadedLibrary(data))
        .catch(console.error);
    }
  }, [activeLibraryId]);

  // The panel defaults open for the desktop sidebar. On mobile it's a modal
  // drawer, so close it when entering mobile so it doesn't cover the screen on
  // load. useLayoutEffect runs before paint to avoid a visible slide-out flash.
  useLayoutEffect(() => {
    if (isMobile && isOpen) setStructuresPanelOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Drag the right edge to resize. The panel's left edge sits at viewport x=0,
  // so the pointer's clientX is the new width.
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => setStructuresWidth(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, setStructuresWidth]);

  const insertStructure = (structure: InsertableStructure) => {
    insertStructureIntoCanvas(structure, (msg) => showNotification(msg, 'error'));
    // On mobile the panel is a modal drawer — close it after inserting so the
    // canvas is visible again.
    if (isMobile) setStructuresPanelOpen(false);
  };

  const visible = (s: InsertableStructure) =>
    matchesQuery(`${s.name} ${s.description || ''} ${(s.commands || []).join(' ')} ${s.id}`, query);
    
  const dsaStructuresVisible = dsaStructures.filter((s) => s.category === 'structures' && visible(s));
  const dsaAlgorithmsVisible = dsaStructures.filter((s) => s.category === 'algorithms' && visible(s));
  
  const loadedLibraryVisible = (loadedLibrary || []).filter(visible);

  // Options for the library switcher: the built-in DSA set + every imported lib.
  const libraryOptions: LibraryOption[] = [
    { id: 'dsa', name: 'DSA', count: dsaStructures.length },
    // Force DSA II to appear directly underneath DSA
    ...librariesIndex
      .filter((l: any) => l.id === 'dsa-ii')
      .map((l: any) => ({ id: l.id, name: l.name, count: l.itemCount })),
    ...librariesIndex
      .filter((l: any) => l.id !== 'dsa-ii')
      .map((l: any) => ({ id: l.id, name: l.name, count: l.itemCount })),
  ];

  // One index row. A left-edge indicator bar marks hover/active (ex-app-shell-row);
  // the name reads in Geist, the insert command sits in a mono tag.
  const Row = (s: InsertableStructure) => {
    const libElements = (s as { elements?: unknown[] }).elements;
    const isLibraryItem = Array.isArray(libElements);
    return (
      <button
        key={s.id}
        draggable
        onDragStart={(e) => {
          if (isLibraryItem) {
            e.dataTransfer.setData('application/json', JSON.stringify(s));
          } else {
            e.dataTransfer.setData('text/plain', s.id);
          }
        }}
        onClick={() => insertStructure(s)}
        className="group relative w-full pl-3.5 pr-3 py-2.5 text-left cursor-grab active:cursor-grabbing hover:bg-canvas-soft transition-colors"
      >
        {/* left-edge active indicator */}
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-transparent group-hover:bg-ink transition-colors" />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-medium text-ink truncate">{s.name}</span>
          {isLibraryItem ? (
            <span className="shrink-0 font-mono text-[10px] text-mute group-hover:text-body lowercase transition-colors">
              insert
            </span>
          ) : (
            <span className="shrink-0 font-mono text-[10px] text-mute group-hover:text-body lowercase transition-colors">
              {s.commands?.[0] || 'item'}
            </span>
          )}
        </div>
        {s.description && (
          <p className="text-[12px] leading-snug text-mute mt-0.5 pr-6">{s.description}</p>
        )}
      </button>
    );
  };

  // The scrollable index body, shared between the desktop sidebar and the
  // mobile drawer. `widthStyle` pins the inner width on desktop so text doesn't
  // reflow while the sidebar animates open/closed.
  const body = (widthStyle?: React.CSSProperties) => (
    <div style={widthStyle} className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      {/* Panel heading — library switcher */}
      <div className="px-4 pt-4 pb-3 border-b border-hairline/50 mb-1">
        <LibrarySwitcher
          value={activeLibraryId}
          options={libraryOptions}
          onChange={(id) => {
            setActiveLibraryId(id);
            setQuery('');
          }}
        />
      </div>

      <div className="px-4 pb-2 pt-2">
        <SearchField value={query} onChange={setQuery} placeholder="Search library…" />
      </div>

      {activeLibraryId === 'dsa' ? (
        <>
          {dsaStructuresVisible.length > 0 && (
            <Section label="data structures" count={dsaStructuresVisible.length}>
              {dsaStructuresVisible.map(Row)}
            </Section>
          )}
          {dsaAlgorithmsVisible.length > 0 && (
            <Section label="algorithms" count={dsaAlgorithmsVisible.length}>
              {dsaAlgorithmsVisible.map(Row)}
            </Section>
          )}
          {dsaStructuresVisible.length === 0 && dsaAlgorithmsVisible.length === 0 && (
            <p className="px-4 py-6 text-[12px] text-mute">Nothing matches “{query}”.</p>
          )}
        </>
      ) : (
        <>
          {loadedLibraryVisible.length > 0 ? (
            <Section label="library items" count={loadedLibraryVisible.length}>
              {loadedLibraryVisible.map(Row)}
            </Section>
          ) : (
            <div className="flex items-center gap-2 px-4 py-6 text-[12px] text-mute">
              {!loadedLibrary && <LoadingSpinner size={13} />}
              <span>{!loadedLibrary ? 'Loading…' : `Nothing matches “${query}”.`}</span>
            </div>
          )}
        </>
      )}

      <div className="mt-auto px-4 py-3 text-[11px] leading-relaxed text-mute border-t border-hairline">
        <span className="text-ink font-medium">Click</span> to place beside your work,
        or <span className="text-ink font-medium">drag</span> onto the canvas.
      </div>
    </div>
  );

  // Mobile: overlay drawer that slides in from the left over the canvas.
  if (isMobile) {
    return (
      <>
        {/* Click-away backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setStructuresPanelOpen(false)}
          />
        )}
        <div
          className={`fixed left-0 top-0 z-50 h-full w-[min(82vw,300px)] bg-canvas border-r border-hairline shadow-[var(--shadow-soft)] select-none transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {body()}
        </div>
      </>
    );
  }

  // Desktop: inline, resizable sidebar.
  return (
    <div
      style={{ width: isOpen ? width : 0 }}
      className={`relative h-full flex-shrink-0 select-none z-30 bg-canvas ${
        isDragging ? '' : 'transition-[width] duration-300 ease-in-out'
      } ${isOpen ? 'border-r border-hairline' : 'border-r-0 overflow-hidden'}`}
    >
      {/* Transparent overlay so Excalidraw doesn't swallow the drag */}
      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize" />}

      {/* Resize handle on the right edge */}
      {isOpen && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          title="Drag to resize"
          className={`group absolute top-0 right-0 z-40 h-full w-1.5 translate-x-1/2 cursor-col-resize flex justify-center ${
            isDragging ? '' : 'hover:bg-hairline/0'
          }`}
        >
          <span
            className={`h-full w-px transition-colors ${
              isDragging ? 'bg-link' : 'bg-transparent group-hover:bg-link'
            }`}
          />
        </div>
      )}

      {body({ width })}
    </div>
  );
};

const Section: React.FC<{ label: string; count: number; children: React.ReactNode }> = ({
  label,
  count,
  children,
}) => (
  <div className="pb-2">
    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
      <span className="font-mono text-[10px] tracking-wide text-mute">{label}</span>
      <span className="h-px flex-1 bg-hairline" />
      <span className="font-mono text-[10px] text-mute">{count}</span>
    </div>
    <div className="flex flex-col">{children}</div>
  </div>
);

interface LibraryOption {
  id: string;
  name: string;
  count: number;
}

// Library switcher — a design-system dropdown (not a native <select>): a display
// trigger with a rotating chevron, opening a filterable, scrollable popover that
// uses the same ink/hairline/canvas tokens as the rest of the workspace.
const LibrarySwitcher: React.FC<{
  value: string;
  options: LibraryOption[];
  onChange: (id: string) => void;
}> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const active = options.find((o) => o.id === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const q = filter.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setFilter('');
        }}
        className="group flex w-full items-center gap-1.5 text-left"
      >
        <span className="font-display text-[14px] font-semibold tracking-[-0.01em] text-ink truncate">
          {active?.name}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-body' : 'text-mute group-hover:text-body'
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-xl border border-hairline bg-canvas shadow-[var(--shadow-soft)]">
          <div className="border-b border-hairline/60 p-2">
            <SearchField value={filter} onChange={setFilter} placeholder="Filter libraries…" />
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-[12px] text-mute">No libraries match.</p>
            )}
            {filtered.map((opt) => {
              const isActive = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className="group flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-canvas-soft"
                >
                  <Check size={13} className={`shrink-0 ${isActive ? 'text-ink' : 'text-transparent'}`} />
                  <span
                    className={`flex-1 truncate text-[13px] ${
                      isActive ? 'font-medium text-ink' : 'text-body group-hover:text-ink'
                    }`}
                  >
                    {opt.name}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-mute">{opt.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
