import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, PanelLeft, PanelLeftClose, Search } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const TabBar: React.FC = () => {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const switchTab = useWorkspaceStore((state) => state.switchTab);
  const createTab = useWorkspaceStore((state) => state.createTab);
  const closeTab = useWorkspaceStore((state) => state.closeTab);
  const renameTab = useWorkspaceStore((state) => state.renameTab);
  const structuresPanelOpen = useWorkspaceStore((state) => state.structuresPanelOpen);
  const toggleStructuresPanel = useWorkspaceStore((state) => state.toggleStructuresPanel);
  const openSearchPalette = useWorkspaceStore((state) => state.openSearchPalette);
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);
  const canvasVisible = layoutMode !== 'notes-only';

  // Keep the left control cluster exactly as wide as the STRUCTURES sidebar so
  // the tabs begin above the canvas content (to the right of the sidebar),
  // Obsidian-style. 256px == the sidebar's 16rem width (border-box).
  const clusterWidth = !canvasVisible ? 44 : structuresPanelOpen ? 256 : 68;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startRename = (id: string, current: string) => {
    setEditingId(id);
    setDraft(current);
  };

  const commitRename = () => {
    if (editingId) renameTab(editingId, draft);
    setEditingId(null);
  };

  return (
    <div className="flex items-stretch h-9 bg-zinc-950 border-b border-zinc-900 select-none flex-shrink-0">
      {/* Left control cluster: collapse sidebar + search. Width tracks the
          sidebar so the tabs align above the canvas content (Obsidian-style). */}
      <div
        style={{ width: clusterWidth }}
        className="flex items-center overflow-hidden border-r border-zinc-900 flex-shrink-0 transition-[width] duration-300 ease-in-out"
      >
        <div className="flex items-center gap-0.5 px-1.5 flex-shrink-0">
          {canvasVisible && (
            <button
              onClick={toggleStructuresPanel}
              title={structuresPanelOpen ? 'Collapse structures panel' : 'Expand structures panel'}
              className="p-1.5 rounded-md text-zinc-500 hover:text-purple-300 hover:bg-zinc-900 transition-colors cursor-pointer flex items-center"
            >
              {structuresPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
            </button>
          )}
          <button
            onClick={() => openSearchPalette('all')}
            title="Search across all tabs (Ctrl+Shift+F)"
            className="p-1.5 rounded-md text-zinc-500 hover:text-purple-300 hover:bg-zinc-900 transition-colors cursor-pointer flex items-center"
          >
            <Search size={15} />
          </button>
        </div>
      </div>

      <div className="flex items-stretch gap-1 py-1 px-1.5 flex-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => !isEditing && switchTab(tab.id)}
              onDoubleClick={() => startRename(tab.id, tab.title)}
              title={tab.title}
              className={`group flex flex-shrink-0 items-center gap-1.5 pl-3 pr-1.5 rounded-md border text-xs font-mono cursor-pointer transition-colors whitespace-nowrap max-w-[180px] ${
                isActive
                  ? 'bg-zinc-900 border-purple-900/50 text-purple-300'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
              }`}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitRename();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setEditingId(null);
                    }
                  }}
                  className="bg-zinc-800 text-zinc-100 text-xs rounded px-1 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              ) : (
                <span className="truncate">{tab.title}</span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                title="Close tab"
                className={`p-0.5 rounded hover:bg-zinc-700 transition-opacity ${
                  isActive ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100'
                }`}
              >
                <X size={11} />
              </button>
            </div>
          );
        })}

        {/* New tab button — follows the last tab */}
        <button
          onClick={() => createTab()}
          title="New tab"
          className="flex-shrink-0 px-1.5 rounded-md text-zinc-500 hover:text-purple-300 hover:bg-zinc-900 transition-colors cursor-pointer flex items-center"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
