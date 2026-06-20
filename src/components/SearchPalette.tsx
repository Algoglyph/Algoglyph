import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, CornerDownLeft, FileText, Shapes } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  tabId: string;
  tabTitle: string;
  source: 'notes' | 'canvas';
  occurrence: number; // notes: 0-based index of this match within the tab's notes
  elementId?: string; // canvas: the id of the matched element
  before: string; // snippet text before the match
  match: string; // the matched text (original casing)
  after: string; // snippet text after the match
}

const SNIPPET_PAD = 40; // characters of context to show on each side

// Build a "…before [match] after…" snippet around a match in some text.
const makeSnippet = (text: string, idx: number, len: number) => {
  const start = Math.max(0, idx - SNIPPET_PAD);
  const end = Math.min(text.length, idx + len + SNIPPET_PAD);
  return {
    before: (start > 0 ? '…' : '') + text.slice(start, idx).replace(/\s+/g, ' '),
    match: text.slice(idx, idx + len),
    after: text.slice(idx + len, end).replace(/\s+/g, ' ') + (end < text.length ? '…' : ''),
  };
};

const MAX_RESULTS = 200;

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const liveNotes = useWorkspaceStore((state) => state.notes); // active tab's unsaved notes
  const liveCanvas = useWorkspaceStore((state) => state.canvasElements); // active tab's live canvas
  const switchTab = useWorkspaceStore((state) => state.switchTab);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);
  const scope = useWorkspaceStore((state) => state.searchScope);
  const currentOnly = scope === 'current';

  // Reset state each time the palette opens.
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search every tab's notes AND canvas text for the current query.
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (!isOpen || q.length === 0) return [];

    const needle = q.toLowerCase();
    const found: SearchResult[] = [];

    // Ctrl+F scopes to the current tab; Ctrl+Shift+F searches every tab.
    const searchTabs = currentOnly ? tabs.filter((t) => t.id === activeTabId) : tabs;

    for (const tab of searchTabs) {
      if (found.length >= MAX_RESULTS) break;
      const isActive = tab.id === activeTabId;
      // The active tab's freshest content lives in the mirror, not the tabs array.
      const text = isActive ? liveNotes : tab.notes;

      // --- Notes matches ---
      if (text) {
        const hay = text.toLowerCase();
        let idx = hay.indexOf(needle);
        let occurrence = 0;
        while (idx !== -1 && found.length < MAX_RESULTS) {
          found.push({
            tabId: tab.id,
            tabTitle: tab.title,
            source: 'notes',
            occurrence,
            ...makeSnippet(text, idx, q.length),
          });
          occurrence += 1;
          idx = hay.indexOf(needle, idx + q.length);
        }
      }

      // --- Canvas text matches (one result per matching text element) ---
      const elements: any[] = (isActive ? liveCanvas : tab.canvasElements) || [];
      for (const el of elements) {
        if (found.length >= MAX_RESULTS) break;
        if (el.isDeleted || el.type !== 'text' || typeof el.text !== 'string') continue;
        const idx = el.text.toLowerCase().indexOf(needle);
        if (idx === -1) continue;
        found.push({
          tabId: tab.id,
          tabTitle: tab.title,
          source: 'canvas',
          occurrence: 0,
          elementId: el.id,
          ...makeSnippet(el.text, idx, q.length),
        });
      }
    }

    return found;
  }, [query, isOpen, tabs, activeTabId, liveNotes, liveCanvas, currentOnly]);

  // Keep the highlighted row within range as results change.
  useEffect(() => {
    setSelectedIndex((prev) => (prev >= results.length ? 0 : prev));
  }, [results.length]);

  // Find and select the Nth occurrence of the query inside the live editor.
  const selectInEditor = (editor: any, needle: string, occurrence: number) => {
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

  // After switching tab/layout the editor may need a moment to mount (when the
  // notes pane was hidden) or to re-sync its content. Poll until it's ready.
  const waitAndSelect = (needle: string, occurrence: number, attempts = 0) => {
    const editor = (window as any).notesEditor;
    const ready = editor && editor.getText().toLowerCase().includes(needle);
    if (ready) {
      selectInEditor(editor, needle, occurrence);
      return;
    }
    if (attempts >= 40) {
      // Give up gracefully after ~1s; select whatever the editor has, if anything.
      if (editor) selectInEditor(editor, needle, occurrence);
      return;
    }
    setTimeout(() => waitAndSelect(needle, occurrence, attempts + 1), 25);
  };

  // Select + reveal a canvas element. Re-applied a few times because the canvas,
  // when it (re)mounts after a tab/layout change, runs its own scene-load that
  // would otherwise clear the selection we just set.
  const applyCanvasSelection = (elementId: string, animate: boolean) => {
    const api = (window as any).excalidrawAPI;
    const el = api && api.getSceneElements().find((e: any) => e.id === elementId && !e.isDeleted);
    if (!api || !el) return;
    api.updateScene({ appState: { selectedElementIds: { [elementId]: true } } });
    try {
      api.scrollToContent([el], { fitToContent: true, animate, duration: 300 });
    } catch {
      // best-effort
    }
  };

  // Poll until the Excalidraw API has the target element, then select/reveal it.
  const waitAndSelectOnCanvas = (elementId: string, attempts = 0) => {
    const api = (window as any).excalidrawAPI;
    const el = api && api.getSceneElements().find((e: any) => e.id === elementId && !e.isDeleted);
    if (api && el) {
      applyCanvasSelection(elementId, true);
      // Re-apply after the canvas' own mount/scene-load settles.
      setTimeout(() => applyCanvasSelection(elementId, false), 200);
      setTimeout(() => applyCanvasSelection(elementId, false), 450);
      return;
    }
    if (attempts >= 40) return; // give up after ~1s
    setTimeout(() => waitAndSelectOnCanvas(elementId, attempts + 1), 25);
  };

  const jumpTo = (result: SearchResult) => {
    if (result.source === 'canvas') {
      // The target lives on the canvas, so the canvas pane must be visible.
      if (layoutMode === 'notes-only') {
        setLayoutMode('split');
      }
      if (result.tabId !== activeTabId) {
        switchTab(result.tabId);
      }
      onClose();
      if (result.elementId) waitAndSelectOnCanvas(result.elementId);
      return;
    }

    // Notes result → the find target lives in the editor, so notes must be visible.
    const needle = query.trim().toLowerCase();
    if (layoutMode === 'canvas-only') {
      setLayoutMode('split');
    }
    if (result.tabId !== activeTabId) {
      switchTab(result.tabId);
    }
    onClose();
    waitAndSelect(needle, result.occurrence);
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
            placeholder={currentOnly ? 'Search notes & canvas in this tab...' : 'Search notes & canvas across all tabs...'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-ink focus:outline-none placeholder-mute"
          />
          {query.trim() !== '' && (
            <span className="text-[10px] text-mute select-none whitespace-nowrap">
              {results.length}{results.length >= MAX_RESULTS ? '+' : ''} match{results.length === 1 ? '' : 'es'}
            </span>
          )}
        </div>

        {/* List of matches */}
        <div className="max-h-72 overflow-y-auto p-1.5 bg-transparent">
          {query.trim() === '' ? (
            <div className="px-4 py-6 text-xs text-mute text-center">
              {currentOnly
                ? 'Type to search the notes and canvas text in this tab.'
                : 'Type to search notes and canvas text in every open tab.'}
            </div>
          ) : results.length > 0 ? (
            results.map((r, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${r.tabId}-${r.source}-${r.elementId ?? r.occurrence}`}
                  onClick={() => jumpTo(r)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-link/10 text-link ring-1 ring-inset ring-link/30'
                      : 'border border-transparent text-body hover:text-ink'
                  }`}
                >
                  <div className="flex flex-col text-left min-w-0">
                    <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-mute mb-0.5">
                      {r.source === 'canvas' ? <Shapes size={9} /> : <FileText size={9} />}
                      <span className="truncate max-w-[160px]">{r.tabTitle}</span>
                      <span className="text-mute">· {r.source}</span>
                      {r.tabId === activeTabId && <span className="text-link">· current</span>}
                    </span>
                    <span className="text-xs truncate">
                      <span className="text-body">{r.before}</span>
                      <span className="bg-link/25 text-link rounded px-0.5">{r.match}</span>
                      <span className="text-body">{r.after}</span>
                    </span>
                  </div>
                  {isSelected && <CornerDownLeft size={12} className="text-link flex-shrink-0" />}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-xs text-mute text-center">
              {currentOnly ? 'No matches found in this tab.' : 'No matches found in any tab.'}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-hairline bg-transparent text-[9px] text-mute flex justify-between select-none">
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
