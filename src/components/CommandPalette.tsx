import React, { useEffect, useState, useRef } from 'react';
import { dsaStructures, bindTextContainers } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { Search, CornerDownLeft } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

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

  const insertStructure = (structure: DSAStructure) => {
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

    const centerX = -scrollX + (width / 2) / zoom;
    const centerY = -scrollY + (height / 2) / zoom;

    const startX = centerX - 100;
    const startY = centerY - 50;

    const skeletons = bindTextContainers(structure.generate(startX, startY));
    const newElements = convertToExcalidrawElements(skeletons, { regenerateIds: false });

    api.updateScene({
      elements: [...api.getSceneElements(), ...newElements],
      commitToHistory: true,
    });
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
        if (filteredStructures[selectedIndex]) {
          insertStructure(filteredStructures[selectedIndex]);
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-[15vh]">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0 cursor-default" onClick={onClose} />

      {/* Main Palette Box */}
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono z-10 mx-4">
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-900 bg-zinc-950">
          <Search size={16} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a structure command (e.g. tree, bst, list)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-zinc-100 focus:outline-none placeholder-zinc-700"
          />
        </div>

        {/* List of matches */}
        <div className="max-h-64 overflow-y-auto p-1.5 bg-zinc-950/40">
          {filteredStructures.length > 0 ? (
            filteredStructures.map((s, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={s.id}
                  onClick={() => insertStructure(s)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-950/35 text-purple-400 border border-purple-900/40'
                      : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold">{s.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{s.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 select-none">
                    <span className="text-[9px] font-semibold font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 uppercase">
                      {s.commands[0]}
                    </span>
                    {isSelected && <CornerDownLeft size={10} className="text-purple-500" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-xs text-zinc-600 text-center">
              No matching structure commands found.
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950/20 text-[9px] text-zinc-600 flex justify-between select-none">
          <div className="flex gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to insert</span>
          </div>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
};
