import React, { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { useWorkspaceStore } from './store/workspaceStore';
import { Toolbar } from './components/Toolbar';
import { TabBar } from './components/TabBar';
import { CommandPalette } from './components/CommandPalette';
import { SearchPalette } from './components/SearchPalette';
import { NotificationToast } from './components/NotificationToast';
import { MobileNav } from './components/MobileNav';
import { useIsMobile } from './hooks/useIsMobile';

// Heavy, route-/pane-level components are code-split so the first paint (the
// landing page) doesn't ship Excalidraw, CodeMirror, TipTap, KaTeX and Mermaid.
// They load on demand when their view/pane is actually shown.
const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
const RoadmapPage = lazy(() => import('./components/RoadmapPage').then((m) => ({ default: m.RoadmapPage })));
const Canvas = lazy(() => import('./components/Canvas').then((m) => ({ default: m.Canvas })));
const Editor = lazy(() => import('./components/Editor').then((m) => ({ default: m.Editor })));
const CodeEditor = lazy(() => import('./components/CodeEditor').then((m) => ({ default: m.CodeEditor })));
const VisualizerWorkspace = lazy(() => import('./components/VisualizerWorkspace').then((m) => ({ default: m.VisualizerWorkspace })));

// ── URL routing (web only) ──────────────────────────────────────────────────
// Each view maps to a real path so the homepage is `/`, the workspace is
// `/workspace`, and the roadmap is `/roadmap` — deep-linkable and back/forward
// aware. Electron loads over file:// with no address bar, so it stays on the
// in-memory `view` state and never touches history.
type View = 'landing' | 'roadmap' | 'workspace';

const VIEW_TO_PATH: Record<View, string> = {
  landing: '/',
  roadmap: '/roadmap',
  workspace: '/workspace',
};

const pathToView = (pathname: string): View => {
  if (pathname.startsWith('/workspace')) return 'workspace';
  if (pathname.startsWith('/roadmap')) return 'roadmap';
  return 'landing';
};

const FullScreenLoader: React.FC = () => (
  <div className="flex h-screen w-screen items-center justify-center text-body font-mono">
    <div className="flex flex-col items-center gap-4">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-link/30 border-t-link" />
      <div className="text-[11px] tracking-[0.3em] uppercase text-mute">Loading</div>
    </div>
  </div>
);

const App: React.FC = () => {
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);
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
  const theme = useWorkspaceStore((state) => state.theme);

  const [isDragging, setIsDragging] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const isElectron = typeof window !== 'undefined' && /electron/i.test(navigator.userAgent);
  // On the web the initial view comes from the URL (so deep links / refreshes
  // land on the right screen); Electron always opens straight into the workspace.
  const [view, setView] = useState<View>(
    isElectron ? 'workspace' : pathToView(window.location.pathname),
  );
  const isMobile = useIsMobile();

  // Navigate between views and keep the URL in sync (web only). `push` is false
  // when the change originated from the browser's back/forward buttons.
  const goTo = useCallback(
    (next: View, { push = true }: { push?: boolean } = {}) => {
      const apply = () => setView(next);
      if (!isElectron && push && window.location.pathname !== VIEW_TO_PATH[next]) {
        window.history.pushState({ view: next }, '', VIEW_TO_PATH[next]);
      }
      if (document.startViewTransition) {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    },
    [isElectron],
  );

  // Reflect browser back/forward onto the view.
  useEffect(() => {
    if (isElectron) return;
    const onPopState = () => goTo(pathToView(window.location.pathname), { push: false });
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isElectron, goTo]);

  // Initialize workspace from IndexedDB on load
  useEffect(() => {
    initializeWorkspace();
    (window as any).useWorkspaceStore = useWorkspaceStore;
    (window as any).goToLanding = () => goTo('landing');
  }, [initializeWorkspace, goTo]);

  // Reflect the active theme onto <html> so the .dark token overrides apply.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

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
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, [toggleLayoutMode, saveCurrentWorkspace, createTab, setSearchPaletteOpen, openSearchPalette]);

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
      <div className="flex h-screen w-screen items-center justify-center text-body font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-link/30 border-t-link"></div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-mute">Opening workspace</div>
        </div>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <Suspense fallback={<FullScreenLoader />}>
      <LandingPage
        onLaunch={() => goTo('workspace')}
        onViewRoadmap={() => goTo('roadmap')}
      />
      </Suspense>
    );
  }

  if (view === 'roadmap') {
    return (
      <Suspense fallback={<FullScreenLoader />}>
      <RoadmapPage
        onBack={() => goTo('landing')}
        onLaunch={() => goTo('workspace')}
      />
      </Suspense>
    );
  }


  // Calculate which panes to show based on layoutMode
  const showCode = layoutMode === 'code';
  const showVisualizer = layoutMode === 'visualizer';
  // Full-area modes hide the canvas/notes split entirely.
  const fullAreaMode = layoutMode === 'code' || layoutMode === 'visualizer';
  // Calculate widths based on layoutMode.
  const showCanvas = layoutMode !== 'notes-only' && !fullAreaMode;
  // The notes pane stays mounted so it can slide open/closed; its width animates
  // to 0 when collapsed instead of unmounting.
  // On mobile there's only ever one pane: the active view fills the width and the
  // divider is hidden (Split collapses to the Canvas pane). On desktop the split
  // percentage applies as before.
  const canvasWidth = isMobile
    ? (showCanvas ? 100 : 0)
    : (layoutMode === 'canvas-only' ? 100 : splitWidth);
  const notesWidth = isMobile
    ? (layoutMode === 'notes-only' ? 100 : 0)
    : (layoutMode === 'canvas-only' || fullAreaMode ? 0 : layoutMode === 'notes-only' ? 100 : 100 - splitWidth);
  // Animate width changes from layout toggles, but not while dragging the divider
  // (that needs to track the cursor 1:1).
  const paneTransition = isDragging ? '' : 'transition-[width] duration-300 ease-in-out';


  return (
    <div className="flex flex-col h-screen w-screen text-ink overflow-hidden select-none">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Tab strip — hidden in the Visualizer, whose blocks are a single global
          workspace rather than per-tab content. */}
      {!showVisualizer && <TabBar />}

      {/* Main Workspace Panels — leave room for the fixed bottom nav on mobile.
          Wrapped in Suspense because the panes (Canvas/Editor/Code/Visualizer)
          are code-split and load on demand. */}
      <Suspense
        fallback={
          <div className="flex flex-1 w-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-link/30 border-t-link" />
          </div>
        }
      >
      <div className="flex flex-1 w-full overflow-hidden relative pb-14 md:pb-0">
        {/* Transparent drag overlay to prevent Excalidraw from absorbing events while resizing */}
        {isDragging && (
          <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
        )}

        {/* Full-area Code Runner */}
        {showCode && (
          <div className="h-full w-full overflow-hidden">
            {/* Key by tab so each tab gets its own code buffer / starter template. */}
            <CodeEditor key={activeTabId} />
          </div>
        )}

        {/* Full-area Algorithm Visualizer — always mounted (display toggled) so
            its canvas pan/zoom and each block's playback position survive when
            switching layouts and coming back. */}
        <div className={`h-full w-full overflow-hidden ${showVisualizer ? '' : 'hidden'}`}>
          <VisualizerWorkspace />
        </div>

        {/* Left pane: Drawing Canvas */}
        {showCanvas && (
          <div
            style={{ width: `${canvasWidth}%` }}
            className={`h-full overflow-hidden bg-canvas ${paneTransition}`}
          >
            {/* Key by tab so the canvas remounts with each tab's own scene
                instead of leaking the previous tab's elements via a stale onChange. */}
            <Canvas key={activeTabId} />
          </div>
        )}

        {/* Resizer bar — desktop only; mobile is single-pane with no divider. */}
        {layoutMode === 'split' && !isMobile && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-px hover:w-1 bg-hairline hover:bg-link transition-all cursor-col-resize h-full flex-shrink-0 z-40 relative ${isDragging ? 'bg-link w-1' : ''
              }`}
          />
        )}

        {/* Right pane: Notes Editor — always mounted so it can slide closed */}
        <div
          style={{ width: `${notesWidth}%` }}
          className={`h-full overflow-hidden flex-shrink-0 ${paneTransition}`}
        >
          <Editor />
        </div>
      </div>
      </Suspense>

      {/* Global Command Palette triggered by Ctrl+K */}
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />

      {/* Cross-tab Search Palette — opened by the tab-bar search icon or Ctrl+Shift+F */}
      <SearchPalette isOpen={searchPaletteOpen} onClose={() => setSearchPaletteOpen(false)} />

      {/* Global Toast Notification Popup */}
      <NotificationToast />

      {/* Mobile-only bottom navigation for switching views */}
      {isMobile && <MobileNav />}
    </div>
  );
};

export default App;
