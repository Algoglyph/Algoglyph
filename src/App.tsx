import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import posthog from 'posthog-js';
import { useWorkspaceStore } from './store/workspaceStore';
import { Toolbar } from './components/Toolbar';
import { TabBar } from './components/TabBar';
import { CommandPalette } from './components/CommandPalette';
import { SearchPalette } from './components/SearchPalette';
import { NotificationToast } from './components/NotificationToast';
import { MobileNav } from './components/MobileNav';
import { McpConnectDialog } from './components/McpConnectDialog';
import { WorkspaceTour } from './components/WorkspaceTour';
import { startMcpConnectionBootstrap } from './lib/mcp/bootstrap';
import { useIsMobile } from './hooks/useIsMobile';
import { SEO } from './components/SEO';

// Heavy, route-/pane-level components are code-split so the first paint (the
// landing page) doesn't ship Excalidraw, CodeMirror, TipTap, KaTeX and Mermaid.
// They load on demand when their view/pane is actually shown.
const LandingPage = lazy(() => import('./components/LandingPage').then((m) => ({ default: m.LandingPage })));
const RoadmapPage = lazy(() => import('./components/RoadmapPage').then((m) => ({ default: m.RoadmapPage })));
const Canvas = lazy(() => import('./components/Canvas').then((m) => ({ default: m.Canvas })));
const Editor = lazy(() => import('./components/Editor').then((m) => ({ default: m.Editor })));
const CodeEditor = lazy(() => import('./components/CodeEditor').then((m) => ({ default: m.CodeEditor })));
const VisualizerWorkspace = lazy(() => import('./components/VisualizerWorkspace').then((m) => ({ default: m.VisualizerWorkspace })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const PrivacyPage = lazy(() => import('./components/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./components/TermsPage').then((m) => ({ default: m.TermsPage })));


type View = 'landing' | 'roadmap' | 'workspace' | 'privacy' | 'terms' | 'blog' | 'not-found';

const VIEW_TO_PATH: Record<View, string> = {
  landing: '/',
  roadmap: '/roadmap',
  workspace: '/workspace',
  privacy: '/privacy',
  terms: '/terms',
  blog: '/blog',
  'not-found': '/404',
};

import { ROADMAP_ZONES } from './config/roadmapData';

const FullScreenLoader: React.FC = () => (
  <div className="flex h-screen w-screen items-center justify-center text-body font-mono">
    <div className="flex flex-col items-center gap-4">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-link/30 border-t-link" />
      <div className="text-[11px] tracking-[0.3em] uppercase text-mute">Loading</div>
    </div>
  </div>
);

const BlogRedirect: React.FC = () => {
  const { slug } = useParams();
  if (!slug) return <Navigate to="/roadmap" replace />;
  for (const zone of ROADMAP_ZONES) {
    for (const topic of zone.topics) {
      for (const concept of topic.concepts) {
        for (const subtopic of concept.subtopics) {
          if (subtopic.blogSlug === slug) {
            return <Navigate to={`/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`} replace />;
          }
        }
      }
    }
  }
  return <Navigate to="/roadmap" replace />;
};

const AppContent: React.FC = () => {
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
  const isMobile = useIsMobile();

  const navigate = useNavigate();
  const location = useLocation();

  // Track page views on every route change in PostHog
  useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: location.pathname,
      });
    }
  }, [location]);

  // Initialize workspace from IndexedDB on load and map navigation APIs globally
  useEffect(() => {
    initializeWorkspace();
    // Starting the connector command is the entire connection flow. A bounded
    // retry window also covers users who launch it just after opening the app.
    const stopMcpBootstrap = startMcpConnectionBootstrap();
    (window as any).useWorkspaceStore = useWorkspaceStore;
    (window as any).goToLanding = () => navigate('/');
    (window as any).navigateTo = (next: string, customPath?: string) => {
      if (customPath) {
        navigate(customPath);
      } else {
        const path = VIEW_TO_PATH[next as View] || '/';
        navigate(path);
      }
    };
    return stopMcpBootstrap;
  }, [initializeWorkspace, navigate]);

  // Reflect the active theme onto <html> so the .dark token overrides apply.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  // Dynamically inject Google AdSense Auto Ads, but ONLY on non-workspace pages.
  useEffect(() => {
    if (location.pathname.startsWith('/workspace')) return;

    // Prevent injecting duplicates
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3436896061379895";
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [location.pathname]);

  // Intercept all link clicks globally inside Electron so relative routes
  // route client-side (no file:// navigation crashes) and external ones open externally.
  useEffect(() => {
    if (!isElectron) return;

    const handleGlobalLinkClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Intercept local page routes
      if (href.startsWith('/')) {
        e.preventDefault();
        const cleanPath = href.split(/[?#]/)[0].replace(/\/$/, ''); // Remove query/hashes & trailing slashes
        if (cleanPath === '' || cleanPath === '/') {
          navigate('/');
        } else if (cleanPath === '/privacy') {
          navigate('/privacy');
        } else if (cleanPath === '/terms') {
          navigate('/terms');
        } else if (cleanPath === '/roadmap') {
          navigate('/roadmap');
        } else if (cleanPath === '/workspace') {
          navigate('/workspace');
        } else if (cleanPath === '/blog') {
          navigate('/roadmap');
        } else if (cleanPath.startsWith('/blog/')) {
          const slug = cleanPath.substring(6);
          navigate(`/roadmap?blog=${slug}`);
        } else {
          navigate('/404');
        }
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        // Intercept external links and open via setWindowOpenHandler
        e.preventDefault();
        window.open(href, '_blank');
      }
    };

    document.addEventListener('click', handleGlobalLinkClicks, true);
    return () => document.removeEventListener('click', handleGlobalLinkClicks, true);
  }, [isElectron, navigate]);

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
          e.preventDefault();
          createTab();
        } else if (key === 'f') {
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

  // Calculate which panes to show based on layoutMode
  const showCode = layoutMode === 'code';
  const showVisualizer = layoutMode === 'visualizer';
  const fullAreaMode = layoutMode === 'code' || layoutMode === 'visualizer';
  const showCanvas = layoutMode !== 'notes-only' && !fullAreaMode;
  const canvasWidth = isMobile
    ? (showCanvas ? 100 : 0)
    : (layoutMode === 'canvas-only' ? 100 : splitWidth);
  const notesWidth = isMobile
    ? (layoutMode === 'notes-only' ? 100 : 0)
    : (layoutMode === 'canvas-only' || fullAreaMode ? 0 : layoutMode === 'notes-only' ? 100 : 100 - splitWidth);
  const paneTransition = isDragging ? '' : 'transition-[width] duration-300 ease-in-out';

  return (
    <div className="flex flex-col h-screen w-screen text-ink overflow-hidden select-none bg-canvas">
      <SEO />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <LandingPage
                onLaunch={() => navigate('/workspace')}
                onViewRoadmap={() => navigate('/roadmap')}
              />
            </Suspense>
          }
        />
        <Route
          path="/workspace"
          element={
            <div className="flex flex-col h-full w-full overflow-hidden">
              <Toolbar />
              <McpConnectDialog />
              <WorkspaceTour />
              {!showVisualizer && <TabBar />}
              <Suspense
                fallback={
                  <div className="flex flex-1 w-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-link/30 border-t-link" />
                  </div>
                }
              >
                <div className="flex flex-1 w-full overflow-hidden relative pb-14 md:pb-0">
                  {isDragging && (
                    <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
                  )}
                  {showCode && (
                    <div className="h-full w-full overflow-hidden ph-no-capture">
                      <CodeEditor key={activeTabId} />
                    </div>
                  )}
                  <div className={`h-full w-full overflow-hidden ${showVisualizer ? '' : 'hidden'}`}>
                    <VisualizerWorkspace />
                  </div>
                  {showCanvas && (
                    <div
                      style={{ width: `${canvasWidth}%` }}
                      className={`h-full overflow-hidden bg-canvas ${paneTransition} ph-no-capture`}
                    >
                      <Canvas key={activeTabId} />
                    </div>
                  )}
                  {layoutMode === 'split' && !isMobile && (
                    <div
                      onMouseDown={handleMouseDown}
                      className={`w-px hover:w-1 bg-hairline hover:bg-link transition-all cursor-col-resize h-full flex-shrink-0 z-40 relative ${
                        isDragging ? 'bg-link w-1' : ''
                      }`}
                    />
                  )}
                  <div
                    style={{ width: `${notesWidth}%` }}
                    className={`h-full overflow-hidden flex-shrink-0 ${paneTransition} ph-no-capture`}
                  >
                    <Editor />
                  </div>
                </div>
              </Suspense>
              <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
              <SearchPalette isOpen={searchPaletteOpen} onClose={() => setSearchPaletteOpen(false)} />
              <NotificationToast />
              {isMobile && <MobileNav />}
            </div>
          }
        />
        <Route
          path="/roadmap/*"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <RoadmapPage
                onBack={() => navigate('/')}
                onLaunch={() => navigate('/workspace')}
              />
            </Suspense>
          }
        />
        <Route
          path="/blog"
          element={<Navigate to="/roadmap" replace />}
        />
        <Route
          path="/blog/:slug"
          element={<BlogRedirect />}
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <PrivacyPage />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <TermsPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
};

export const App: React.FC = () => {
  const isElectron = typeof window !== 'undefined' && /electron/i.test(navigator.userAgent);
  if (isElectron) {
    return (
      <HashRouter>
        <AppContent />
      </HashRouter>
    );
  }
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
