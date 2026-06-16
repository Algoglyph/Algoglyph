import React, { useState } from 'react';
import { dsaStructures, bindTextContainers } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { ChevronLeft, ChevronRight, Boxes, Info } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const StructuresPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

  const insertStructureAtCenter = (structure: DSAStructure) => {
    const api = (window as any).excalidrawAPI;
    if (!api) {
      showNotification('Canvas is not ready yet', 'error');
      return;
    }

    const appState = api.getAppState();
    const zoom = appState.zoom.value || 1;
    const scrollX = appState.scrollX || 0;
    const scrollY = appState.scrollY || 0;
    const width = appState.width || window.innerWidth / 2;
    const height = appState.height || window.innerHeight;

    // Calculate center of current viewport in canvas coordinates
    const centerX = -scrollX + (width / 2) / zoom;
    const centerY = -scrollY + (height / 2) / zoom;

    // Center the template
    const startX = centerX - 100;
    const startY = centerY - 50;

    const skeletons = bindTextContainers(structure.generate(startX, startY));
    const newElements = convertToExcalidrawElements(skeletons, { regenerateIds: false });

    api.updateScene({
      elements: [...api.getSceneElements(), ...newElements],
      commitToHistory: true,
    });
  };

  const structures = dsaStructures.filter((s) => s.category === 'structures');
  const algorithms = dsaStructures.filter((s) => s.category === 'algorithms');

  return (
    <div className="flex h-full border-r border-zinc-900 bg-zinc-950 flex-shrink-0 relative select-none z-30 transition-all duration-300">
      {/* Sidebar Content */}
      <div
        className={`flex flex-col h-full bg-zinc-950 overflow-y-auto transition-all duration-300 ${
          isOpen ? 'w-64 border-r border-zinc-900' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-zinc-900 flex items-center gap-2">
          <Boxes size={16} className="text-purple-400" />
          <span className="font-mono text-xs font-bold tracking-wider text-zinc-100">STRUCTURES</span>
        </div>

        {/* Structures Category */}
        <div className="p-3">
          <h3 className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase mb-2">Data Structures</h3>
          <div className="flex flex-col gap-1.5">
            {structures.map((s) => (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', s.id);
                }}
                onClick={() => insertStructureAtCenter(s)}
                className="group p-2.5 rounded bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900 cursor-grab active:cursor-grabbing transition-all text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-purple-400 font-mono transition-colors">{s.name}</span>
                  <span className="text-[9px] font-mono bg-zinc-800/80 px-1 py-0.5 rounded text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase select-none">
                    {s.commands[0]}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal mt-1">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithms Category */}
        <div className="p-3 border-t border-zinc-900/60">
          <h3 className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase mb-2">Algorithms</h3>
          <div className="flex flex-col gap-1.5">
            {algorithms.map((s) => (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', s.id);
                }}
                onClick={() => insertStructureAtCenter(s)}
                className="group p-2.5 rounded bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900 cursor-grab active:cursor-grabbing transition-all text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-purple-400 font-mono transition-colors">{s.name}</span>
                  <span className="text-[9px] font-mono bg-zinc-800/80 px-1 py-0.5 rounded text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase select-none">
                    {s.commands[0]}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal mt-1">{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-3 bg-zinc-950/40 text-[9px] text-zinc-600 font-mono border-t border-zinc-900 flex items-center gap-1.5">
          <Info size={10} />
          <span>Click to center, drag onto canvas</span>
        </div>
      </div>

      {/* Collapse Tab handle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -translate-y-1/2 -right-3.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 w-3.5 h-12 rounded-r flex items-center justify-center cursor-pointer z-40 transition-colors shadow-lg"
      >
        {isOpen ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
      </button>
    </div>
  );
};
