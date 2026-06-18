import React from 'react';
import { dsaStructures } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { Boxes, Info } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { insertStructureIntoCanvas } from '../lib/insertStructure';

export const StructuresPanel: React.FC = () => {
  const isOpen = useWorkspaceStore((state) => state.structuresPanelOpen);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

  const insertStructure = (structure: DSAStructure) => {
    insertStructureIntoCanvas(structure, (msg) => showNotification(msg, 'error'));
  };

  const structures = dsaStructures.filter((s) => s.category === 'structures');
  const algorithms = dsaStructures.filter((s) => s.category === 'algorithms');

  return (
    <div
      style={{ width: isOpen ? '16rem' : '0rem' }}
      className={`h-full flex-shrink-0 select-none z-30 overflow-hidden bg-zinc-950 transition-[width] duration-300 ease-in-out ${
        isOpen ? 'border-r border-zinc-900' : 'border-r-0'
      }`}
    >
      {/* Fixed-width inner content so text doesn't reflow while the panel slides */}
      <div className="flex flex-col h-full w-64 bg-zinc-950 overflow-y-auto">
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
                onClick={() => insertStructure(s)}
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
                onClick={() => insertStructure(s)}
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
          <span>Click to add beside existing, drag onto canvas</span>
        </div>
      </div>
    </div>
  );
};
