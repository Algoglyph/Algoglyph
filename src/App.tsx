import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import posthog from 'posthog-js';
import { useWorkspaceStore } from './store/workspaceStore';
import { startMcpConnectionBootstrap } from './lib/mcp/bootstrap';
import { useIsMobile } from './hooks/useIsMobile';
import { SEO } from './components/SEO';
import { LANDING_FAQ, SITE_IDENTITY } from './config/siteIdentity';

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
const AboutPage = lazy(() => import('./components/AboutPage').then((m) => ({ default: m.AboutPage })));
const BlogRedirect = lazy(() => import('./components/BlogRedirect').then((m) => ({ default: m.BlogRedirect })));
const Toolbar = lazy(() => import('./components/Toolbar').then((m) => ({ default: m.Toolbar })));
const TabBar = lazy(() => import('./components/TabBar').then((m) => ({ default: m.TabBar })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const SearchPalette = lazy(() => import('./components/SearchPalette').then((m) => ({ default: m.SearchPalette })));
const NotificationToast = lazy(() => import('./components/NotificationToast').then((m) => ({ default: m.NotificationToast })));
const MobileNav = lazy(() => import('./components/MobileNav').then((m) => ({ default: m.MobileNav })));
const McpConnectDialog = lazy(() => import('./components/McpConnectDialog').then((m) => ({ default: m.McpConnectDialog })));
const WorkspaceTour = lazy(() => import('./components/WorkspaceTour').then((m) => ({ default: m.WorkspaceTour })));


type View = 'landing' | 'roadmap' | 'workspace' | 'about' | 'privacy' | 'terms' | 'blog' | 'not-found';

const VIEW_TO_PATH: Record<View, string> = {
  landing: '/',
  roadmap: '/roadmap',
  workspace: '/workspace',
  about: '/about',
  privacy: '/privacy',
  terms: '/terms',
  blog: '/blog',
  'not-found': '/404',
};

const FullScreenLoader: React.FC = () => (
  <div className="flex h-screen w-screen items-center justify-center text-body font-mono">
    <div className="flex flex-col items-center gap-4">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-link/30 border-t-link" />
      <div className="text-[11px] tracking-[0.3em] uppercase text-mute">Loading</div>
    </div>
  </div>
);

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
        } else if (cleanPath === '/about') {
          navigate('/about');
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
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SEO
                schemas={[
                  {
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    '@id': `${SITE_IDENTITY.url}/#faq`,
                    mainEntity: LANDING_FAQ.map((item) => ({
                      '@type': 'Question',
                      name: item.question,
                      acceptedAnswer: { '@type': 'Answer', text: item.answer },
                    })),
                  },
                ]}
              />
              <Suspense fallback={<FullScreenLoader />}>
                <LandingPage
                  onLaunch={() => navigate('/workspace')}
                  onViewRoadmap={() => navigate('/roadmap')}
                />
              </Suspense>
            </>
          }
        />
        <Route
          path="/workspace"
          element={
            <div className="flex flex-col h-full w-full overflow-hidden">
              <SEO
                title="Visual DSA Notes, Coding Sandbox & Algorithm Visualizer | AlgoGlyph"
                description="Create visual computer science notes, editable diagrams, code experiments, and step-by-step algorithm visualizations in one local-first workspace."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Workspace', path: '/workspace' }]}
                schemas={[
                  {
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    '@id': `${SITE_IDENTITY.url}/workspace#application`,
                    name: 'AlgoGlyph Workspace',
                    applicationCategory: 'EducationalApplication',
                    operatingSystem: 'Web, Windows, macOS',
                    url: `${SITE_IDENTITY.url}/workspace`,
                    description: 'A local-first visual computer science workspace for notes, diagrams, code, algorithm visualizers, and MCP-connected agents.',
                    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                    publisher: { '@id': `${SITE_IDENTITY.url}/#organization` },
                  },
                ]}
              />
              <Suspense fallback={<FullScreenLoader />}>
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
              </Suspense>
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
          path="/about"
          element={
            <>
              <SEO
                title="About AlgoGlyph | Visual Computer Science Workspace"
                description="Learn what AlgoGlyph is, who it is for, and how its local-first canvas, notes, code, visualizers, roadmap, and MCP agents support visual computer science learning."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'About AlgoGlyph', path: '/about' }]}
                schemas={[
                  {
                    '@context': 'https://schema.org',
                    '@type': 'AboutPage',
                    '@id': `${SITE_IDENTITY.url}/about#about`,
                    url: `${SITE_IDENTITY.url}/about`,
                    name: 'About AlgoGlyph',
                    mainEntity: { '@id': `${SITE_IDENTITY.url}/#organization` },
                  },
                ]}
              />
              <Suspense fallback={<FullScreenLoader />}>
                <AboutPage />
              </Suspense>
            </>
          }
        />
        <Route
          path="/blog"
          element={<Navigate to="/roadmap" replace />}
        />
        <Route
          path="/blog/:slug"
          element={<Suspense fallback={<FullScreenLoader />}><BlogRedirect /></Suspense>}
        />
        <Route
          path="/privacy"
          element={
            <>
              <SEO
                title="Privacy Policy | AlgoGlyph"
                description="Read how AlgoGlyph handles local-first workspace data, analytics, external code execution, and agent-provider data flows."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]}
              />
              <Suspense fallback={<FullScreenLoader />}><PrivacyPage /></Suspense>
            </>
          }
        />
        <Route
          path="/terms"
          element={
            <>
              <SEO
                title="Terms of Service | AlgoGlyph"
                description="Read the terms governing use of the AlgoGlyph visual computer science workspace, roadmap, applications, and learning tools."
                breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }]}
              />
              <Suspense fallback={<FullScreenLoader />}><TermsPage /></Suspense>
            </>
          }
        />
        <Route
          path="*"
          element={
            <>
              <SEO
                title="Page Not Found | AlgoGlyph"
                description="The requested AlgoGlyph page could not be found."
                index={false}
              />
              <Suspense fallback={<FullScreenLoader />}><NotFoundPage /></Suspense>
            </>
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
