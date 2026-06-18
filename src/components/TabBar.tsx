import React, { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

export const TabBar: React.FC = () => {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const switchTab = useWorkspaceStore((state) => state.switchTab);
  const createTab = useWorkspaceStore((state) => state.createTab);
  const closeTab = useWorkspaceStore((state) => state.closeTab);
  const renameTab = useWorkspaceStore((state) => state.renameTab);

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
    <div className="flex items-stretch gap-1 px-2 h-9 bg-zinc-950 border-b border-zinc-900 select-none overflow-x-auto flex-shrink-0">
      <div className="flex items-stretch gap-1 py-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => !isEditing && switchTab(tab.id)}
              onDoubleClick={() => startRename(tab.id, tab.title)}
              title={tab.title}
              className={`group flex items-center gap-1.5 pl-3 pr-1.5 rounded-md border text-xs font-mono cursor-pointer transition-colors whitespace-nowrap max-w-[180px] ${
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
      </div>

      {/* New tab button */}
      <button
        onClick={() => createTab()}
        title="New tab"
        className="my-1 px-1.5 rounded-md text-zinc-500 hover:text-purple-300 hover:bg-zinc-900 transition-colors cursor-pointer flex items-center"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
