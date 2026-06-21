import React, { useEffect, useState, useRef } from 'react';
import { dsaStructures } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { getAlgorithm } from '../config/algorithms';
import { Search, CornerDownLeft, Shapes, Play, Info } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { insertStructureIntoCanvas } from '../lib/insertStructure';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const showNotification = useWorkspaceStore((state) => state.showNotification);
  const addVisualizerNode = useWorkspaceStore((state) => state.addVisualizerNode);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredStructures = dsaStructures.filter((s) => {
    const searchStr = query.toLowerCase();
    return (
      s.name.toLowerCase().includes(searchStr) ||
      s.description.toLowerCase().includes(searchStr) ||
      s.commands.some((c) => c.toLowerCase().includes(searchStr))
    );
  });

  const handleInsert = (structure: DSAStructure) => {
    insertStructureIntoCanvas(structure, (msg) => showNotification(msg, 'error'));
    showNotification(`Inserted ${structure.name} onto canvas`, 'success');
    onClose();
  };

  const handleVisualize = (structure: DSAStructure) => {
    // Check if there's a registered algorithm for it
    const id = structure.id;
    // We support visualizer for all structures that have algorithm frames,
    // fallbacking to id if needed because all 66 items are mapped in algorithmFrames.ts.
    const algoId = getAlgorithm(id) ? id : (getAlgorithm(id.replace('-structure', '')) ? id.replace('-structure', '') : id);
    
    // Add visualizer block at center coordinates (100, 100) or similar
    addVisualizerNode(algoId, 100, 100);
    setLayoutMode('visualizer');
    showNotification(`Loading visualization for ${structure.name}`, 'success');
    onClose();
  };

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredStructures.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredStructures.length) % Math.max(1, filteredStructures.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredStructures[selectedIndex];
        if (selected) {
          if (e.shiftKey) {
            handleVisualize(selected);
          } else {
            handleInsert(selected);
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredStructures, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0 cursor-default" onClick={onClose} />

      {/* Main Palette Box */}
      <div className="w-full max-w-xl bg-canvas border border-hairline rounded-xl shadow-[var(--shadow-modal)] ring-1 ring-hairline overflow-hidden flex flex-col font-mono z-10 mx-4">
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline bg-transparent">
          <Search size={16} className="text-body" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search any DSA structure or algorithm..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-ink focus:outline-none placeholder-mute"
          />
        </div>

        {/* List of matches */}
        <div className="max-h-[340px] overflow-y-auto p-1.5 bg-transparent">
          {filteredStructures.length > 0 ? (
            filteredStructures.map((s, index) => {
              const isSelected = index === selectedIndex;
              
              return (
                <div
                  key={s.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-link/10 text-link ring-1 ring-inset ring-link/30'
                      : 'border border-transparent text-body hover:text-ink'
                  }`}
                >
                  <div className="flex flex-col text-left max-w-[65%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate">{s.name}</span>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border border-hairline tracking-wider text-mute select-none`}>
                        {s.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-body mt-0.5 truncate">{s.description}</span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInsert(s);
                      }}
                      className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded transition-colors border cursor-pointer ${
                        isSelected 
                          ? 'border-link/30 bg-link/10 text-link hover:bg-link/25' 
                          : 'border-hairline bg-canvas hover:bg-canvas-soft text-body'
                      }`}
                      title="Insert on Drawing Canvas"
                    >
                      <Shapes size={10} />
                      Insert
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVisualize(s);
                      }}
                      className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded transition-colors border cursor-pointer ${
                        isSelected 
                          ? 'border-link/30 bg-link/15 text-link hover:bg-link/30' 
                          : 'border-hairline bg-canvas hover:bg-canvas-soft text-body'
                      }`}
                      title="Visualize in Workspace"
                    >
                      <Play size={10} />
                      Visualize
                    </button>
                    {isSelected && <CornerDownLeft size={10} className="text-link" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-xs text-mute text-center">
              No matching algorithms or data structures found.
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-hairline bg-transparent text-[9px] text-mute flex justify-between select-none items-center">
          <div className="flex gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to insert</span>
            <span>shift + ↵ to visualize</span>
          </div>
          <span className="flex items-center gap-1">
            <Info size={10} />
            esc to close
          </span>
        </div>
      </div>
    </div>
  );
};
