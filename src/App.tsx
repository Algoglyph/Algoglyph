import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from './store/workspaceStore';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { Editor } from './components/Editor';
import { CommandPalette } from './components/CommandPalette';
import { NotificationToast } from './components/NotificationToast';

const App: React.FC = () => {
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);
  const splitWidth = useWorkspaceStore((state) => state.splitWidth);
  const setSplitWidth = useWorkspaceStore((state) => state.setSplitWidth);
  const toggleLayoutMode = useWorkspaceStore((state) => state.toggleLayoutMode);
  const initializeWorkspace = useWorkspaceStore((state) => state.initializeWorkspace);
  const saveCurrentWorkspace = useWorkspaceStore((state) => state.saveCurrentWorkspace);
  const isLoading = useWorkspaceStore((state) => state.isLoading);

  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Initialize workspace from IndexedDB on load
  useEffect(() => {
    initializeWorkspace();
    (window as any).useWorkspaceStore = useWorkspaceStore;
  }, [initializeWorkspace]);

  // Handle global keyboard shortcuts: Ctrl+B (Toggle views), Ctrl+S (Manual Save), Ctrl+K (Command Palette)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        if (key === 'b') {
          e.preventDefault();
          toggleLayoutMode();
        } else if (key === 's') {
          e.preventDefault();
          saveCurrentWorkspace();
        } else if (key === 'k') {
          e.preventDefault();
          setIsPaletteOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [toggleLayoutMode, saveCurrentWorkspace]);

  // Handle dragging the split divider
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const percentage = (e.clientX / window.innerWidth) * 100;
      setSplitWidth(Math.max(0, Math.min(100, percentage)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setSplitWidth]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          <div className="text-xs tracking-widest animate-pulse uppercase">Opening notebook...</div>
        </div>
      </div>
    );
  }

  // Calculate widths based on layoutMode
  const showCanvas = layoutMode !== 'notes-only';
  const showNotes = layoutMode !== 'canvas-only';

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Workspace Panels */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Transparent drag overlay to prevent Excalidraw from absorbing events while resizing */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
        )}

        {/* Left pane: Drawing Canvas */}
        {showCanvas && (
          <div
            style={{ width: layoutMode === 'canvas-only' ? '100%' : `${splitWidth}%` }}
            className="h-full overflow-hidden bg-zinc-950"
          >
            <Canvas />
          </div>
        )}

        {/* Resizer bar */}
        {layoutMode === 'split' && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 hover:w-1.5 bg-zinc-900 border-x border-zinc-800/80 hover:bg-purple-500 transition-all cursor-col-resize h-full flex-shrink-0 z-40 relative ${
              isDragging ? 'bg-purple-500 w-1.5' : ''
            }`}
          />
        )}

        {/* Right pane: Notes Editor */}
        {showNotes && (
          <div
            style={{ width: layoutMode === 'notes-only' ? '100%' : `${100 - splitWidth}%` }}
            className="h-full overflow-hidden"
          >
            <Editor />
          </div>
        )}
      </div>

      {/* Global Command Palette triggered by Ctrl+K */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Global Toast Notification Popup */}
      <NotificationToast />
    </div>
  );
};

export default App;
