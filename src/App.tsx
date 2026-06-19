import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from './store/workspaceStore';
import { Toolbar } from './components/Toolbar';
import { TabBar } from './components/TabBar';
import { Canvas } from './components/Canvas';
import { Editor } from './components/Editor';
import { CodeEditor } from './components/CodeEditor';
import { CommandPalette } from './components/CommandPalette';
import { SearchPalette } from './components/SearchPalette';
import { NotificationToast } from './components/NotificationToast';
import { ProfileModal } from './components/ProfileModal';
import { AnalyticsView } from './components/AnalyticsView';
import { ProblemsSidebar } from './components/ProblemsSidebar';
import { ProblemViewer } from './components/ProblemViewer';

  const App: React.FC = () => {
    const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
    const splitWidth = useWorkspaceStore((state) => state.splitWidth);
    const setSplitWidth = useWorkspaceStore((state) => state.setSplitWidth);
    const toggleLayoutMode = useWorkspaceStore((state) => state.toggleLayoutMode);
    const initializeWorkspace = useWorkspaceStore((state) => state.initializeWorkspace);
    const saveCurrentWorkspace = useWorkspaceStore((state) => state.saveCurrentWorkspace);
    const createTab = useWorkspaceStore((state) => state.createTab);
    const activeTabId = useWorkspaceStore((state) => state.activeTabId);
    const searchPaletteOpen = useWorkspaceStore((state) => state.searchPaletteOpen);
    const setSearchPaletteOpen = useWorkspaceStore((state) => state.setSearchPaletteOpen);
    const openSearchPalette = useWorkspaceStore((state) => state.openSearchPalette);
    const isLoading = useWorkspaceStore((state) => state.isLoading);
    const leftPaneView = useWorkspaceStore((state) => state.leftPaneView);
    const setLeftPaneView = useWorkspaceStore((state) => state.setLeftPaneView);
    const toggleLeftPaneView = useWorkspaceStore((state) => state.toggleLeftPaneView);
    const toggleProblemsSidebar = useWorkspaceStore((state) => state.toggleProblemsSidebar);
    const problemMeta = useWorkspaceStore((state) => state.problemMeta);

  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Initialize workspace from IndexedDB on load
  useEffect(() => {
    initializeWorkspace();
    (window as any).useWorkspaceStore = useWorkspaceStore;
  }, [initializeWorkspace]);

  // Handle global keyboard shortcuts: Ctrl+B (Toggle views), Ctrl+S (Manual Save), Ctrl+K (Command Palette), Ctrl+Space (Left pane view toggle), Ctrl+1..4 (Layout presets)
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
        } else if (key === 't') {
          // Ctrl/Cmd+T opens a new tab.
          e.preventDefault();
          createTab();
        } else if (key === 'f') {
          // Ctrl/Cmd+F → search this tab; Ctrl/Cmd+Shift+F → search all tabs.
          // Both use the same command-palette UI.
          e.preventDefault();
          setIsPaletteOpen(false);
          openSearchPalette(e.shiftKey ? 'all' : 'current');
        } else if (key === 'k') {
          e.preventDefault();
          setSearchPaletteOpen(false);
          setIsPaletteOpen((prev) => !prev);
        } else if (key === 'p') {
          e.preventDefault();
          toggleProblemsSidebar();
        } else if (e.code === 'Space' || key === ' ') {
          e.preventDefault();
          toggleLeftPaneView();
        } else if (key === '1') {
          e.preventDefault();
          setLayoutMode('code');
        } else if (key === '2') {
          e.preventDefault();
          setLeftPaneView('canvas');
          setLayoutMode('split');
        } else if (key === '3') {
          e.preventDefault();
          setLeftPaneView('notes');
          setLayoutMode('split');
        } else if (key === '4') {
          e.preventDefault();
          setLayoutMode('notes-only');
        } else if (key === '5') {
          e.preventDefault();
          if (useWorkspaceStore.getState().problemMeta) {
            setLeftPaneView('description');
            setLayoutMode('split');
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [toggleLayoutMode, saveCurrentWorkspace, createTab, setSearchPaletteOpen, openSearchPalette, setLayoutMode, setLeftPaneView, toggleLeftPaneView]);

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

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Top Toolbar */}
      <Toolbar onOpenProfile={() => setIsProfileOpen(true)} onOpenAnalytics={() => setIsAnalyticsOpen(true)} />

      {/* Tab strip */}
      <TabBar />

      {/* Main Workspace Panels */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Problems Sidebar */}
        <ProblemsSidebar />

        {/* Transparent drag overlay to prevent Excalidraw from absorbing events while resizing */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
        )}

        {/* Left pane: tabbed between Notes/Description and Canvas */}
        {splitWidth > 0 && (
          <div
            style={{ width: `${splitWidth}%` }}
            className="h-full flex flex-col overflow-hidden bg-zinc-950"
          >
            {/* Sub-header tab strip for Left Pane view toggling */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-b border-zinc-900 select-none flex-shrink-0">
              <div className="flex bg-zinc-900 border border-zinc-800 rounded p-0.5 text-[10px] font-mono">
                {problemMeta && (
                  <button
                    onClick={() => setLeftPaneView('description')}
                    className={`px-3 py-0.5 rounded transition-colors cursor-pointer ${
                      leftPaneView === 'description'
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Description
                  </button>
                )}
                <button
                  onClick={() => setLeftPaneView('notes')}
                  className={`px-3 py-0.5 rounded transition-colors cursor-pointer ${
                    leftPaneView === 'notes'
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setLeftPaneView('canvas')}
                  className={`px-3 py-0.5 rounded transition-colors cursor-pointer ${
                    leftPaneView === 'canvas'
                      ? 'bg-zinc-800 text-zinc-100 font-medium'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Canvas
                </button>
              </div>
              <span className="text-[9px] text-zinc-600 font-mono">Ctrl+Space to swap</span>
            </div>

            {/* Pane Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {leftPaneView === 'description' && problemMeta ? (
                <ProblemViewer />
              ) : leftPaneView === 'canvas' ? (
                <Canvas key={activeTabId} />
              ) : (
                <Editor />
              )}
            </div>
          </div>
        )}

        {/* Resizer bar */}
        {splitWidth > 0 && splitWidth < 100 && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1 hover:w-1.5 bg-zinc-900 border-x border-zinc-800/80 hover:bg-purple-500 transition-all cursor-col-resize h-full flex-shrink-0 z-40 relative ${
              isDragging ? 'bg-purple-500 w-1.5' : ''
            }`}
          />
        )}

        {/* Right pane: Code Editor */}
        {splitWidth < 100 && (
          <div
            style={{ width: `${100 - splitWidth}%` }}
            className="h-full overflow-hidden"
          >
            <CodeEditor key={activeTabId} />
          </div>
        )}
      </div>

      {/* Global Command Palette triggered by Ctrl+K */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Cross-tab Search Palette — opened by the tab-bar search icon or Ctrl+Shift+F */}
      <SearchPalette isOpen={searchPaletteOpen} onClose={() => setSearchPaletteOpen(false)} />

      {/* Global Toast Notification Popup */}
      <NotificationToast />

      {/* User Profile settings window */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* User Analytics dashboard window */}
      <AnalyticsView isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
    </div>
  );
};

export default App;
