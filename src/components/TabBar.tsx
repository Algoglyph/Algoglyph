import React, { useEffect, useRef, useState } from 'react';
import { Plus, X, PanelLeft, PanelLeftClose, Search, BookOpen } from 'lucide-react';
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
  const problemsSidebarOpen = useWorkspaceStore((state) => state.problemsSidebarOpen);
  const toggleProblemsSidebar = useWorkspaceStore((state) => state.toggleProblemsSidebar);
  const openSearchPalette = useWorkspaceStore((state) => state.openSearchPalette);
  const splitWidth = useWorkspaceStore((state) => state.splitWidth);
  const leftPaneView = useWorkspaceStore((state) => state.leftPaneView);
  const canvasVisible = splitWidth > 0 && leftPaneView === 'canvas';

  // Keep the left control cluster aligned with the open sidebars.
  const clusterWidth = problemsSidebarOpen
    ? 256
    : (!canvasVisible ? 76 : structuresPanelOpen ? 256 : 100);

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
      {/* Left control cluster: collapse sidebars + search. */}
      <div
        style={{ width: clusterWidth }}
        className="flex items-center overflow-hidden border-r border-zinc-900 flex-shrink-0 transition-[width] duration-300 ease-in-out"
      >
        <div className="flex items-center gap-0.5 px-1.5 flex-shrink-0">
          <button
            onClick={toggleProblemsSidebar}
            title={problemsSidebarOpen ? 'Collapse problems sidebar' : 'Expand problems sidebar'}
            className={`p-1.5 rounded transition-colors cursor-pointer flex items-center ${
              problemsSidebarOpen ? 'text-purple-400 bg-zinc-900 border border-zinc-800/80' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60'
            }`}
          >
            <BookOpen size={14} />
          </button>
          {canvasVisible && (
            <button
              onClick={toggleStructuresPanel}
              title={structuresPanelOpen ? 'Collapse structures panel' : 'Expand structures panel'}
              className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 transition-colors cursor-pointer flex items-center"
            >
              {structuresPanelOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
            </button>
          )}
          <button
            onClick={() => openSearchPalette('all')}
            title="Search across all tabs (Ctrl+Shift+F)"
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 transition-colors cursor-pointer flex items-center"
          >
            <Search size={14} />
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
              className={`group flex flex-shrink-0 items-center gap-1.5 pl-3 pr-1.5 rounded border text-[11px] font-mono cursor-pointer transition-all duration-150 whitespace-nowrap max-w-[180px] ${
                isActive
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-100 font-semibold border-b-transparent shadow-xs'
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30'
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
                  className="bg-zinc-800 text-zinc-100 text-[11px] rounded px-1.5 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-zinc-700"
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
                className={`p-0.5 rounded hover:bg-zinc-800 transition-opacity ${
                  isActive ? 'opacity-70 hover:opacity-100 text-zinc-400' : 'opacity-0 group-hover:opacity-70 hover:!opacity-100 text-zinc-500'
                }`}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}

        {/* New tab button — follows the last tab */}
        <button
          onClick={() => createTab()}
          title="New tab"
          className="flex-shrink-0 p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 transition-colors cursor-pointer flex items-center"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
};
