import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft, FileText } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  tabId: string;
  tabTitle: string;
  occurrence: number; // 0-based index of this match within the tab
  before: string; // snippet text before the match
  match: string; // the matched text (original casing)
  after: string; // snippet text after the match
}

const MAX_RESULTS = 200;
const SNIPPET_PAD = 40; // characters of context to show on each side

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const liveNotes = useWorkspaceStore((state) => state.notes); // active tab's unsaved notes
  const switchTab = useWorkspaceStore((state) => state.switchTab);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);

  // Reset state each time the palette opens.
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search every tab's notes for the current query.
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (!isOpen || q.length === 0) return [];

    const needle = q.toLowerCase();
    const found: SearchResult[] = [];

    for (const tab of tabs) {
      if (found.length >= MAX_RESULTS) break;
      // The active tab's freshest content lives in the mirror, not the tabs array.
      const text = tab.id === activeTabId ? liveNotes : tab.notes;
      if (!text) continue;

      const hay = text.toLowerCase();
      let idx = hay.indexOf(needle);
      let occurrence = 0;
      while (idx !== -1 && found.length < MAX_RESULTS) {
        const start = Math.max(0, idx - SNIPPET_PAD);
        const end = Math.min(text.length, idx + q.length + SNIPPET_PAD);
        found.push({
          tabId: tab.id,
          tabTitle: tab.title,
          occurrence,
          before: (start > 0 ? '…' : '') + text.slice(start, idx).replace(/\s+/g, ' '),
          match: text.slice(idx, idx + q.length),
          after: text.slice(idx + q.length, end).replace(/\s+/g, ' ') + (end < text.length ? '…' : ''),
        });
        occurrence += 1;
        idx = hay.indexOf(needle, idx + q.length);
      }
    }

    return found;
  }, [query, isOpen, tabs, activeTabId, liveNotes]);

  // Keep the highlighted row within range as results change.
  useEffect(() => {
    setSelectedIndex((prev) => (prev >= results.length ? 0 : prev));
  }, [results.length]);

  // Find and select the Nth occurrence of the query inside the live editor.
  const selectInEditor = (needle: string, occurrence: number) => {
    const editor = (window as any).notesEditor;
    if (!editor) return;

    const matches: { from: number; to: number }[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (!node.isTextblock) return true;
      const text: string = node.textContent;
      if (!text) return false;
      const hay = text.toLowerCase();
      let i = hay.indexOf(needle);
      while (i !== -1) {
        const from = pos + 1 + i;
        matches.push({ from, to: from + needle.length });
        i = hay.indexOf(needle, i + needle.length);
      }
      return false;
    });

    if (matches.length === 0) return;
    const m = matches[Math.min(occurrence, matches.length - 1)];
    editor.chain().focus().setTextSelection({ from: m.from, to: m.to }).scrollIntoView().run();
  };

  const jumpTo = (result: SearchResult) => {
    const needle = query.trim().toLowerCase();

    // Make sure the notes pane is visible before jumping to it.
    if (layoutMode === 'canvas-only') {
      setLayoutMode('split');
    }

    if (result.tabId !== activeTabId) {
      switchTab(result.tabId);
      onClose();
      // Wait for the editor to re-render with the switched tab's content.
      setTimeout(() => selectInEditor(needle, result.occurrence), 90);
    } else {
      onClose();
      setTimeout(() => selectInEditor(needle, result.occurrence), 0);
    }
  };

  // Keyboard navigation while the palette is open.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          jumpTo(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

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
            placeholder="Search across all tabs..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-zinc-100 focus:outline-none placeholder-zinc-700"
          />
          {query.trim() !== '' && (
            <span className="text-[10px] text-zinc-600 select-none whitespace-nowrap">
              {results.length}{results.length >= MAX_RESULTS ? '+' : ''} match{results.length === 1 ? '' : 'es'}
            </span>
          )}
        </div>

        {/* List of matches */}
        <div className="max-h-72 overflow-y-auto p-1.5 bg-zinc-950/40">
          {query.trim() === '' ? (
            <div className="px-4 py-6 text-xs text-zinc-600 text-center">
              Type to search the notes in every open tab.
            </div>
          ) : results.length > 0 ? (
            results.map((r, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${r.tabId}-${r.occurrence}`}
                  onClick={() => jumpTo(r)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-purple-950/35 text-purple-300 border border-purple-900/40'
                      : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex flex-col text-left min-w-0">
                    <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-600 mb-0.5">
                      <FileText size={9} />
                      <span className="truncate max-w-[200px]">{r.tabTitle}</span>
                      {r.tabId === activeTabId && <span className="text-purple-700">· current</span>}
                    </span>
                    <span className="text-xs truncate">
                      <span className="text-zinc-500">{r.before}</span>
                      <span className="bg-purple-500/25 text-purple-200 rounded px-0.5">{r.match}</span>
                      <span className="text-zinc-500">{r.after}</span>
                    </span>
                  </div>
                  {isSelected && <CornerDownLeft size={12} className="text-purple-500 flex-shrink-0" />}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-xs text-zinc-600 text-center">
              No matches found in any tab.
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950/20 text-[9px] text-zinc-600 flex justify-between select-none">
          <div className="flex gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to jump</span>
          </div>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
};
