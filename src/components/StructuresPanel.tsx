import React, { useEffect, useState } from 'react';
import { dsaStructures } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { useWorkspaceStore } from '../store/workspaceStore';
import { insertStructureIntoCanvas } from '../lib/insertStructure';

export const StructuresPanel: React.FC = () => {
  const isOpen = useWorkspaceStore((state) => state.structuresPanelOpen);
  const width = useWorkspaceStore((state) => state.structuresWidth);
  const setStructuresWidth = useWorkspaceStore((state) => state.setStructuresWidth);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

  const [isDragging, setIsDragging] = useState(false);

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

  const insertStructure = (structure: DSAStructure) => {
    insertStructureIntoCanvas(structure, (msg) => showNotification(msg, 'error'));
  };

  const structures = dsaStructures.filter((s) => s.category === 'structures');
  const algorithms = dsaStructures.filter((s) => s.category === 'algorithms');

  // One index row. A left-edge indicator bar marks hover/active (ex-app-shell-row);
  // the name reads in Geist, the insert command sits in a mono tag.
  const Row = (s: DSAStructure) => (
    <button
      key={s.id}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', s.id)}
      onClick={() => insertStructure(s)}
      className="group relative w-full pl-3.5 pr-3 py-2.5 text-left cursor-grab active:cursor-grabbing hover:bg-canvas-soft transition-colors"
    >
      {/* left-edge active indicator */}
      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-transparent group-hover:bg-ink transition-colors" />
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-ink truncate">
          {s.name}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-mute group-hover:text-body lowercase transition-colors">
          {s.commands[0]}
        </span>
      </div>
      <p className="text-[12px] leading-snug text-mute mt-0.5 pr-6">{s.description}</p>
    </button>
  );

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

      <div style={{ width }} className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
        {/* Panel heading */}
        <div className="px-4 pt-4 pb-3 flex items-baseline justify-between">
          <span className="font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Structures
          </span>
          <span className="font-mono text-[11px] text-mute">
            {structures.length + algorithms.length}
          </span>
        </div>

        {/* Data structures */}
        <Section label="data structures" count={structures.length}>
          {structures.map(Row)}
        </Section>

        {/* Algorithms */}
        <Section label="algorithms" count={algorithms.length}>
          {algorithms.map(Row)}
        </Section>

        <div className="mt-auto px-4 py-3 text-[11px] leading-relaxed text-mute border-t border-hairline">
          <span className="text-ink font-medium">Click</span> to place beside your work,
          or <span className="text-ink font-medium">drag</span> onto the canvas.
        </div>
      </div>
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
