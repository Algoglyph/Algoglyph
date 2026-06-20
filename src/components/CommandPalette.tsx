import React, { useEffect, useState, useRef } from 'react';
import { dsaStructures } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { Search, CornerDownLeft } from 'lucide-react';
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
    insertStructureIntoCanvas(structure, (msg) => showNotification(msg, 'error'));
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0 cursor-default" onClick={onClose} />

      {/* Main Palette Box */}
      <div className="w-full max-w-lg bg-canvas border border-hairline rounded-xl shadow-[var(--shadow-modal)] ring-1 ring-hairline overflow-hidden flex flex-col font-mono z-10 mx-4">
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline bg-transparent">
          <Search size={16} className="text-body" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a structure command (e.g. tree, bst, list)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-ink focus:outline-none placeholder-mute"
          />
        </div>

        {/* List of matches */}
        <div className="max-h-64 overflow-y-auto p-1.5 bg-transparent">
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
                      ? 'bg-link/10 text-link ring-1 ring-inset ring-link/30'
                      : 'border border-transparent text-body hover:text-ink'
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold">{s.name}</span>
                    <span className="text-[10px] text-body mt-0.5">{s.description}</span>
                  </div>
                  <div className="flex items-center gap-1.5 select-none">
                    <span className="text-[9px] font-semibold font-mono bg-canvas border border-hairline px-1.5 py-0.5 rounded text-body uppercase">
                      {s.commands[0]}
                    </span>
                    {isSelected && <CornerDownLeft size={10} className="text-link" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-xs text-mute text-center">
              No matching structure commands found.
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-hairline bg-transparent text-[9px] text-mute flex justify-between select-none">
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
