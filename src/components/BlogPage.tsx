import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Play,
  Code,
  ArrowLeft,
  Clock,
  Calendar,
  User,
  ChevronRight,
  Search,
  Compass,
  Network,
  Award,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { BLOG_POSTS } from '../config/blogData';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '../config/editorTheme';
import { ALGORITHM_SNIPPETS } from '../config/algorithmSnippets';
import { useParams } from 'react-router-dom';

interface BlogPageProps {
  onBack: () => void;
  onLaunch: () => void;
  onViewRoadmap: () => void;
  onNavigate: (slug?: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBack, onLaunch, onViewRoadmap, onNavigate }) => {
  const theme = useWorkspaceStore((state) => state.theme);
  const addVisualizerNode = useWorkspaceStore((state) => state.addVisualizerNode);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const updateCode = useWorkspaceStore((state) => state.updateCode);
  const isDark = theme === 'dark';

  const { slug } = useParams<{ slug?: string }>();
  const activeSlug = slug || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [codeLang, setCodeLang] = useState<'cpp' | 'py'>('cpp');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('introduction');

  // Monitor scroll for Table of Contents tracking
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  const activePost = useMemo(() => {
    if (!activeSlug) return null;
    return BLOG_POSTS.find((p) => p.slug === activeSlug) || null;
  }, [activeSlug]);

  // Reset scroll and sidebar on slug changes
  useEffect(() => {
    setMobileSidebarOpen(false);
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0;
    }
  }, [slug]);

  const handleSlugNavigate = (slug?: string) => {
    onNavigate(slug);
  };

  // Bounded width layout parameters to fit the screen
  const columns = 4;
  const svgWidth = 980;

  // Dynamically compute layout coordinates and dimensions to support future categories (DSA, ML, System Design, etc.)
  const uniqueCategories = useMemo(() => {
    // Collect all categories dynamically from post data and sort them for consistent layout
    const categories = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));
    return categories.sort();
  }, []);

  const layoutData = useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {};
    const categoryHeaderY: Record<string, number> = {};
    const boundaries: number[] = [];
    let currentY = 30;

    uniqueCategories.forEach((category, idx) => {
      const catPosts = BLOG_POSTS.filter((p) => p.category === category);
      const count = catPosts.length;
      const rowsCount = Math.ceil(count / columns) || 1;
      
      categoryHeaderY[category] = currentY + (rowsCount * 85) / 2;

      catPosts.forEach((post, postIdx) => {
        const col = postIdx % columns;
        const row = Math.floor(postIdx / columns);
        // Alternating stagger to prevent horizontal label collisions
        const stagger = col % 2 === 0 ? -12 : 12;
        // Space nodes in columns across the bounded width
        const x = 200 + col * 230;
        const y = currentY + row * 85 + 40 + stagger;
        coords[post.slug] = { x, y };
      });

      currentY += rowsCount * 85 + 30;
      if (idx < uniqueCategories.length - 1) {
        boundaries.push(currentY - 15);
      }
    });

    return {
      coords,
      categoryHeaderY,
      boundaries,
      svgHeight: Math.max(400, currentY)
    };
  }, [uniqueCategories]);

  const computedCoords = layoutData.coords;
  const categoryHeaderY = layoutData.categoryHeaderY;
  const svgHeight = layoutData.svgHeight;

  // Extract edges/links for the Knowledge Graph
  const graphLinks = useMemo(() => {
    const links: Array<{ from: string; to: string; id: string }> = [];
    const seen = new Set<string>();

    BLOG_POSTS.forEach((post) => {
      post.related.forEach((rel) => {
        const key = [post.slug, rel].sort().join('-');
        if (!seen.has(key) && computedCoords[post.slug] && computedCoords[rel]) {
          seen.add(key);
          links.push({
            from: post.slug,
            to: rel,
            id: key
          });
        }
      });
    });

    return links;
  }, [computedCoords]);

  // Handle intersection of sections for the right sidebar Table of Contents
  useEffect(() => {
    if (!activePost) return;
    const container = contentContainerRef.current;
    if (!container) return;

    const sections = [
      'introduction',
      'why-important',
      'real-world-apps',
      'complexity',
      'implementation',
      'common-mistakes',
      'interview-questions',
      'practice-problems',
      'summary'
    ];

    const handleScroll = () => {
      // Calculate reading progress
      const scrollHeight = container.scrollHeight - container.clientHeight;
      if (scrollHeight > 0) {
        setReadingProgress(Math.min(100, (container.scrollTop / scrollHeight) * 100));
      }

      // Track active section
      let active = 'introduction';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the element's top is near the top of the container, mark active
          if (rect.top <= 160) {
            active = sectionId;
          }
        }
      }
      setActiveHeadingId(active);
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activePost]);

  // Launch modes
  const launchVisualizer = (visualizerId?: string) => {
    if (!visualizerId) return;
    useWorkspaceStore.getState().clearVisualizerNodes();
    addVisualizerNode(visualizerId, 100, 100);
    setLayoutMode('visualizer');
    onLaunch();
  };

  const launchWorkspace = () => {
    setLayoutMode('split');
    onLaunch();
  };

  const launchSandbox = (slug: string) => {
    const codeSnippet = ALGORITHM_SNIPPETS[slug] || '';
    if (codeSnippet) {
      updateCode(codeSnippet);
    }
    setLayoutMode('code');
    onLaunch();
  };

  // Filter blog posts by search query
  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return BLOG_POSTS;
    return BLOG_POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);



  return (
    <div className={`flex flex-col h-screen w-screen font-sans antialiased select-text overflow-hidden ${
      isDark ? 'bg-canvas-soft text-[#f4f0e8]' : 'bg-[#fafafa] text-[#171717]'
    }`}>
      {/* Dynamic Reading Progress Bar at the top of the header */}
      {activePost && (
        <div 
          className="fixed top-0 left-0 h-[2.5px] bg-link z-[60] transition-all duration-75"
          style={{ width: `${readingProgress}%` }}
        />
      )}

      {/* Header */}
      <header className={`h-14 shrink-0 flex items-center justify-between px-6 border-b z-50 ${
        isDark ? 'border-hairline bg-[#0a0a0a]/90' : 'border-zinc-200 bg-white/90'
      } backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activePost) {
                handleSlugNavigate(undefined);
              } else {
                onBack();
              }
            }}
            className={`flex items-center justify-center p-1.5 rounded-md hover:bg-canvas-soft-2 transition-colors cursor-pointer ${
              isDark ? 'text-[#cdbf9f]' : 'text-zinc-600'
            }`}
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-link animate-pulse" />
            <span className="font-mono text-[10px] tracking-[0.25em] font-semibold uppercase text-mute">
              Algoglyph · Theory Graph
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onViewRoadmap}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              isDark
                ? 'border-white/10 hover:border-white/20 bg-white/[0.02] text-zinc-300 hover:text-white'
                : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-900 shadow-sm'
            }`}
          >
            Curriculum Roadmap
          </button>
          <button
            onClick={onLaunch}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-[var(--shadow-soft)] ${
              isDark
                ? 'bg-[#f4f0e8] hover:bg-white text-[#0c0c0e]'
                : 'bg-[#171717] hover:bg-black text-white'
            }`}
          >
            <span>Open Sandbox</span>
            <ArrowRight size={11} />
          </button>
        </div>
      </header>

      {/* Main Panel */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!activePost ? (
            /* ────────────────────────────────────────────────────────────
               BLOG INDEX / OVERVIEW GRID
               ──────────────────────────────────────────────────────────── */
            <motion.div
              key="index"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto px-6 py-10 sm:px-12 md:px-16"
            >
              <div className="max-w-6xl mx-auto flex flex-col gap-10">
                {/* Headline Banner */}
                <div className="flex flex-col gap-3 text-center sm:text-left">
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink font-display">
                    Computer Science <span className="italic font-normal text-[#d8bf8f] font-serif">Theory Graph</span>
                  </h1>
                  <p className="text-[15px] leading-relaxed text-body max-w-2xl">
                    Deconstruct critical algorithms and data structures. Jump seamlessly between deep theory articles, spatial canvas models, and interactive runtime playbacks.
                  </p>
                </div>

                {/* Search field */}
                <div className="relative max-w-md w-full">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
                  <input
                    type="text"
                    placeholder="Search arrays, queues, segment trees, dijkstra..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border outline-none font-mono ${
                      isDark
                        ? 'border-hairline bg-[#0a0a0a]/50 text-white focus:border-link'
                        : 'border-zinc-200 bg-white text-zinc-900 focus:border-link shadow-sm'
                    }`}
                  />
                </div>

                {/* ── INTERACTIVE KNOWLEDGE GRAPH CANVAS (SVG) ── */}
                {searchQuery.trim().length === 0 && (
                  <div className={`rounded-2xl border p-4 relative overflow-hidden ${
                    isDark ? 'border-hairline bg-[#0a0a0a]/30' : 'border-zinc-200 bg-white shadow-sm'
                  }`}>
                    <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono text-mute uppercase tracking-widest pointer-events-none">
                      <Network size={11} className="text-link" />
                      <span>Interconnected Concept Mesh</span>
                    </div>

                    <div className="overflow-x-auto select-none p-4 mt-6 scrollbar-thin">
                      <svg width={svgWidth} height={svgHeight} className="mx-auto block overflow-visible">
                        {/* Define arrows */}
                        <defs>
                          <marker
                            id="arrow"
                            viewBox="0 0 10 10"
                            refX="18"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                          >
                            <path d="M 0 0 L 10 5 L 0 10 z" fill={isDark ? '#2a2a2a' : '#e4e4e7'} />
                          </marker>
                        </defs>

                        {/* Vertical separation boundary line */}
                        <line
                          x1="160"
                          y1="10"
                          x2="160"
                          y2={svgHeight - 10}
                          stroke={isDark ? '#222222' : '#e4e4e7'}
                          strokeWidth="1"
                          strokeDasharray="2 4"
                        />

                        {/* Category guidance separators */}
                        {uniqueCategories.map((category) => {
                          const headerY = categoryHeaderY[category] || 90;
                          return (
                            <g key={category} className="pointer-events-none opacity-45">
                              <text
                                x="20"
                                y={headerY + 3}
                                fill={isDark ? '#d8bf8f' : '#171717'}
                                className="font-mono text-[9px] font-bold uppercase tracking-widest"
                              >
                                {category}
                              </text>
                            </g>
                          );
                        })}

                        {/* Category boundary divider lines */}
                        {layoutData.boundaries.map((boundaryY, idx) => (
                          <line
                            key={idx}
                            x1="20"
                            y1={boundaryY}
                            x2={svgWidth - 20}
                            y2={boundaryY}
                            stroke={isDark ? '#222222' : '#e4e4e7'}
                            strokeWidth="1.5"
                            strokeDasharray="1 6"
                          />
                        ))}

                        {/* Link lines */}
                        {graphLinks.map((link) => {
                          const fromNode = computedCoords[link.from];
                          const toNode = computedCoords[link.to];
                          if (!fromNode || !toNode) return null;

                          return (
                            <line
                              key={link.id}
                              x1={fromNode.x}
                              y1={fromNode.y}
                              x2={toNode.x}
                              y2={toNode.y}
                              stroke={isDark ? '#222222' : '#e4e4e7'}
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />
                          );
                        })}

                        {/* Nodes */}
                        {BLOG_POSTS.map((post) => {
                          const coord = computedCoords[post.slug];
                          if (!coord) return null;

                          const getCategoryColor = (category: string) => {
                            if (category === 'Data Structures') return 'text-[#d8bf8f]';
                            if (category === 'Algorithms') return 'text-link';
                            if (category === 'Machine Learning') return 'text-[#a78bfa]';
                            if (category === 'System Design') return 'text-[#34d399]';
                            return 'text-amber-500';
                          };

                          return (
                            <g
                              key={post.slug}
                              className="cursor-pointer group"
                              transform={`translate(${coord.x}, ${coord.y})`}
                              onClick={() => handleSlugNavigate(post.slug)}
                            >
                              <circle
                                r="8"
                                fill={isDark ? '#000' : '#fff'}
                                stroke={isDark ? '#444' : '#ccc'}
                                strokeWidth="2"
                                className="group-hover:stroke-link group-hover:fill-link/10 transition-all duration-300"
                              />
                              <circle
                                r="4"
                                fill="currentColor"
                                className={`transition-all duration-300 ${getCategoryColor(post.category)} group-hover:scale-125`}
                              />
                              <text
                                x="12"
                                y="4"
                                fill={isDark ? '#999' : '#555'}
                                className="font-mono text-[9px] font-semibold group-hover:fill-link group-hover:translate-x-0.5 transition-all duration-300"
                              >
                                {post.title.split(' & ')[0].split(' (')[0]}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                )}

                {/* Category Sections */}
                <div className="columns-1 md:columns-2 gap-8 space-y-8">
                  {uniqueCategories.map((category) => {
                    const catPosts = filteredPosts.filter((p) => p.category === category);
                    if (catPosts.length === 0) return null;

                    return (
                      <div key={category} className="break-inside-avoid flex flex-col gap-4">
                        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-mute border-b border-hairline pb-2">
                          {category}
                        </h2>
                        <div className="flex flex-col gap-3">
                          {catPosts.map((post) => (
                            <div
                              key={post.slug}
                              onClick={() => handleSlugNavigate(post.slug)}
                              className={`p-4 rounded-xl border cursor-pointer text-left transition-all duration-300 ${
                                isDark
                                  ? 'border-hairline bg-[#0c0c0e]/50 hover:bg-[#101012] hover:border-white/10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                                  : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold text-[15px] text-ink group-hover:text-link">
                                  {post.title}
                                </h3>
                                <span className="font-mono text-[10px] text-mute shrink-0">{post.readTime} min read</span>
                              </div>
                              <p className="text-[12px] leading-relaxed text-body mt-1.5 line-clamp-2">
                                {post.tagline}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ────────────────────────────────────────────────────────────
               BLOG ARTICLE POST VIEW (/blog/:slug)
               ──────────────────────────────────────────────────────────── */
            <motion.div
              key="post"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex overflow-hidden w-full relative"
            >
              {/* Toggle menu for mobile sidebar */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className={`fixed bottom-4 right-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-full border shadow-md cursor-pointer ${
                  isDark ? 'bg-canvas text-white border-hairline' : 'bg-white text-zinc-900 border-zinc-200'
                }`}
              >
                {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              {/* LEFT STICKY SIDEBAR: Article Navigation List */}
              <aside className={`w-64 shrink-0 border-r overflow-y-auto z-40 transition-transform duration-300 md:translate-x-0 ${
                isDark ? 'border-hairline bg-[#0a0a0a]' : 'border-zinc-200 bg-zinc-50'
              } ${
                mobileSidebarOpen
                  ? 'translate-x-0 fixed inset-y-0 left-0 pt-14'
                  : '-translate-x-full absolute md:relative h-full'
              }`}>
                <div className="p-4 flex flex-col gap-6">
                  {/* Category: Data Structures */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute px-2.5">
                      Data Structures
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {BLOG_POSTS.filter((p) => p.category === 'Data Structures').map((p) => (
                        <button
                          key={p.slug}
                          onClick={() => handleSlugNavigate(p.slug)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                            p.slug === activeSlug
                              ? 'bg-link/10 text-link font-semibold'
                              : 'text-body hover:text-ink hover:bg-canvas-soft-2'
                          }`}
                        >
                          {p.title.split(' (')[0].split(' & ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category: Algorithms */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-mute px-2.5">
                      Algorithms
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {BLOG_POSTS.filter((p) => p.category === 'Algorithms' || p.category === 'Advanced CP').map((p) => (
                        <button
                          key={p.slug}
                          onClick={() => handleSlugNavigate(p.slug)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                            p.slug === activeSlug
                              ? 'bg-link/10 text-link font-semibold'
                              : 'text-body hover:text-ink hover:bg-canvas-soft-2'
                          }`}
                        >
                          {p.title.split(' (')[0].split(' & ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-hairline my-2" />

                  {/* Return options */}
                  <button
                    onClick={() => handleSlugNavigate(undefined)}
                    className="w-full text-left px-2.5 py-2 text-[12px] font-mono text-mute hover:text-ink flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Return to Index</span>
                  </button>
                </div>
              </aside>

              {/* CENTER PANEL: Article Scroll Container */}
              <div
                ref={contentContainerRef}
                className="flex-1 overflow-y-auto px-6 py-10 sm:px-12 md:px-14 lg:px-16"
              >
                <div className="max-w-[720px] mx-auto flex flex-col gap-8">
                  {/* Breadcrumbs */}
                  <nav className="flex items-center gap-1.5 text-[10px] font-mono text-mute uppercase tracking-widest">
                    <span>Theory</span>
                    <ChevronRight size={10} />
                    <span>{activePost.category}</span>
                    <ChevronRight size={10} />
                    <span className="text-ink font-semibold">{activePost.title.split(' (')[0].split(' & ')[0]}</span>
                  </nav>

                  {/* Title & Tagline */}
                  <div className="flex flex-col gap-3">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight font-display">
                      {activePost.title}
                    </h1>
                    <p className="text-[16px] leading-relaxed text-body font-normal">
                      {activePost.tagline}
                    </p>
                  </div>

                  {/* Metadata bar */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[11px] font-mono text-mute border-y border-hairline py-3">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-link" />
                      <span>By: <span className="text-ink font-medium">Algoglyph Admin</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#d8bf8f]" />
                      <span>Updated: <span className="text-ink font-medium">{activePost.lastUpdated}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#d8bf8f]" />
                      <span>Time: <span className="text-ink font-medium">{activePost.readTime} mins</span></span>
                    </div>
                  </div>

                  {/* ── SANDBOX INTERACTIVE TRIGGERS ── */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row gap-3.5 items-center justify-between bg-canvas ${
                    isDark ? 'border-hairline' : 'border-zinc-200 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Compass size={16} className="text-link" />
                      <span className="text-xs font-semibold font-mono tracking-wide text-ink">
                        Spatial CS Sandbox
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
                      {activePost.visualizerId && (
                        <button
                          onClick={() => launchVisualizer(activePost.visualizerId)}
                          className="px-3.5 py-1.5 rounded-full border border-link/25 hover:border-link/50 bg-link/[0.04] text-[11px] font-semibold text-link transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play size={11} />
                          <span>Launch Visualizer</span>
                        </button>
                      )}
                      <button
                        onClick={() => launchSandbox(activePost.slug)}
                        className="px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] text-[11px] font-semibold text-body hover:text-ink transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Code size={11} />
                        <span>Practice in Sandbox</span>
                      </button>
                      <button
                        onClick={launchWorkspace}
                        className="px-3.5 py-1.5 rounded-full border border-[#d8bf8f]/25 hover:border-[#d8bf8f]/50 bg-[#d8bf8f]/[0.04] text-[11px] font-semibold text-[#ddc18c] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen size={11} />
                        <span>Interactive Workspace</span>
                      </button>
                    </div>
                  </div>

                  {/* Article content panels */}
                  <div className="flex flex-col gap-8 text-[14.5px] leading-relaxed text-body font-normal">
                    {/* Introduction */}
                    <section id="introduction" className="flex flex-col gap-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Introduction</h2>
                      <p>{activePost.content.introduction}</p>
                    </section>

                    {/* Why Important */}
                    <section id="why-important" className="flex flex-col gap-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Why it is important</h2>
                      <p>{activePost.content.whyImportant}</p>
                    </section>

                    {/* Real world apps */}
                    <section id="real-world-apps" className="flex flex-col gap-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Real-world applications</h2>
                      <ul className="flex flex-col gap-1.5 pl-4 list-disc">
                        {activePost.content.realWorldApps.map((app, i) => (
                          <li key={i}>{app}</li>
                        ))}
                      </ul>
                    </section>

                    {/* Callout */}
                    <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
                      isDark ? 'border-hairline bg-[#161616]' : 'border-zinc-200 bg-zinc-50'
                    }`}>
                      <AlertTriangle size={15} className="text-[#ddc18c] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-ink">Prerequisite check:</span>{' '}
                        {activePost.prerequisites.length > 0 ? (
                          <span>
                            Before continuing, ensure you are comfortable with{' '}
                            {activePost.prerequisites.map((p, i) => (
                              <button
                                key={p}
                                onClick={() => handleSlugNavigate(p)}
                                className="text-link font-semibold hover:underline cursor-pointer inline"
                              >
                                {p.replace('-', ' ')}
                                {i < activePost.prerequisites.length - 1 ? ', ' : ''}
                              </button>
                            ))}
                          </span>
                        ) : (
                          <span>None! This is an excellent starting point for this curriculum branch.</span>
                        )}
                      </div>
                    </div>

                    {/* Complexity Table */}
                    <section id="complexity" className="flex flex-col gap-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Complexity Analysis</h2>
                      <div className={`overflow-hidden rounded-lg border ${
                        isDark ? 'border-hairline' : 'border-zinc-200 shadow-sm'
                      }`}>
                        <table className="w-full text-left text-xs font-mono">
                          <thead className={isDark ? 'bg-canvas-soft-2' : 'bg-zinc-50'}>
                            <tr className="border-b border-hairline">
                              <th className="px-4 py-2.5 font-semibold text-ink">Metric</th>
                              <th className="px-4 py-2.5 font-semibold text-ink">Complexity</th>
                              <th className="px-4 py-2.5 font-semibold text-ink">Context</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activePost.content.complexity.map((row, i) => (
                              <tr
                                key={i}
                                className={`border-b border-hairline last:border-0 ${
                                  isDark ? 'hover:bg-white/[0.01]' : 'hover:bg-zinc-50'
                                }`}
                              >
                                <td className="px-4 py-2.5 font-semibold text-ink">{row.label}</td>
                                <td className="px-4 py-2.5 font-semibold text-link">{row.value}</td>
                                <td className="px-4 py-2.5 text-mute">{row.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Code Reference Implementation */}
                    <section id="implementation" className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between border-b border-hairline pb-2">
                        <h2 className="text-lg font-bold tracking-tight text-ink">Implementation</h2>
                        <div className="flex gap-2 text-[10px] font-mono">
                          <button
                            onClick={() => setCodeLang('cpp')}
                            className={`cursor-pointer transition-colors ${
                              codeLang === 'cpp' ? 'text-link font-bold underline' : 'text-mute hover:text-body'
                            }`}
                          >
                            C++
                          </button>
                          <span className="text-mute/30">/</span>
                          <button
                            onClick={() => setCodeLang('py')}
                            className={`cursor-pointer transition-colors ${
                              codeLang === 'py' ? 'text-link font-bold underline' : 'text-mute hover:text-body'
                            }`}
                          >
                            Python
                          </button>
                        </div>
                      </div>
                      
                      <div className={`overflow-hidden rounded-xl border text-[11.5px] [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent ${
                        isDark ? 'border-hairline bg-black/40' : 'border-zinc-200 bg-zinc-50 shadow-sm'
                      }`}>
                        <CodeMirror
                          value={
                            codeLang === 'cpp'
                              ? activePost.content.implementationCpp
                              : activePost.content.implementationPython
                          }
                          readOnly={true}
                          editable={false}
                          theme={vscodeDark}
                          extensions={codeLang === 'cpp' ? [cpp()] : [python()]}
                          basicSetup={{
                            lineNumbers: true,
                            foldGutter: false,
                            highlightActiveLine: false,
                            highlightActiveLineGutter: false
                          }}
                        />
                      </div>
                    </section>

                    {/* Common Mistakes */}
                    <section id="common-mistakes" className="flex flex-col gap-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Common Mistakes</h2>
                      <ul className="flex flex-col gap-1.5 pl-4 list-decimal">
                        {activePost.content.commonMistakes.map((mistake, i) => (
                          <li key={i}>{mistake}</li>
                        ))}
                      </ul>
                    </section>

                    {/* Interview Questions */}
                    <section id="interview-questions" className="flex flex-col gap-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Interview Questions</h2>
                      <div className="flex flex-col gap-3">
                        {activePost.content.interviewQuestions.map((q, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border flex gap-3 text-xs ${
                              isDark ? 'border-hairline bg-[#0a0a0a]/50' : 'border-zinc-200 bg-white shadow-sm'
                            }`}
                          >
                            <HelpCircle size={14} className="text-link shrink-0 mt-0.5" />
                            <div>{q}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Practice Problems */}
                    <section id="practice-problems" className="flex flex-col gap-2.5">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Practice Problems</h2>
                      <div className="flex flex-col gap-2">
                        {activePost.practiceProblems.map((prob, i) => (
                          <a
                            key={i}
                            href={prob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              isDark
                                ? 'border-hairline bg-[#0c0c0e]/30 hover:bg-[#101012] hover:border-white/10'
                                : 'border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Award size={13} className="text-[#d8bf8f]" />
                              <span className="text-xs font-semibold text-ink font-mono">{prob.title}</span>
                            </div>
                            <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full ${
                              prob.difficulty === 'Easy'
                                ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.04]'
                                : prob.difficulty === 'Medium'
                                ? 'border-amber-500/20 text-amber-400 bg-amber-500/[0.04]'
                                : 'border-rose-500/20 text-rose-400 bg-rose-500/[0.04]'
                            }`}>
                              {prob.difficulty}
                            </span>
                          </a>
                        ))}
                      </div>
                    </section>

                    {/* Summary */}
                    <section id="summary" className="flex flex-col gap-2.5 border-t border-hairline pt-6">
                      <h2 className="text-lg font-bold tracking-tight text-ink">Summary</h2>
                      <div className="flex gap-3">
                        <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="italic text-body">{activePost.content.summary}</p>
                      </div>
                    </section>
                  </div>

                  {/* Bottom Navigation: Related & Neighbors */}
                  <div className="flex flex-col gap-5 border-t border-hairline pt-8 mt-4 pb-14">
                    <div className="flex flex-wrap gap-2.5">
                      <span className="text-[10px] font-mono text-mute uppercase tracking-widest mt-1">
                        Related:
                      </span>
                      {activePost.related.map((relSlug) => {
                        const relPost = BLOG_POSTS.find((p) => p.slug === relSlug);
                        if (!relPost) return null;
                        return (
                          <button
                            key={relSlug}
                            onClick={() => handleSlugNavigate(relSlug)}
                            className={`px-3 py-1 rounded-full border text-[11px] font-medium transition cursor-pointer ${
                              isDark
                                ? 'border-white/10 hover:border-white/20 bg-white/[0.02] text-zinc-300 hover:text-white'
                                : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-900 shadow-sm'
                            }`}
                          >
                            {relPost.title.split(' (')[0].split(' & ')[0]}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {activePost.prevTopic ? (
                        <button
                          onClick={() => handleSlugNavigate(activePost.prevTopic)}
                          className={`p-4 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                            isDark ? 'border-hairline bg-[#0c0c0e]/30 hover:bg-[#101012]' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[9px] font-mono text-mute uppercase tracking-wider">Previous Topic</span>
                          <span className="text-xs font-semibold text-ink truncate">
                            {BLOG_POSTS.find((p) => p.slug === activePost.prevTopic)?.title.split(' (')[0]}
                          </span>
                        </button>
                      ) : (
                        <div />
                      )}

                      {activePost.nextTopic ? (
                        <button
                          onClick={() => handleSlugNavigate(activePost.nextTopic)}
                          className={`p-4 rounded-xl border text-right flex flex-col gap-1 cursor-pointer transition-all ${
                            isDark ? 'border-hairline bg-[#0c0c0e]/30 hover:bg-[#101012]' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[9px] font-mono text-mute uppercase tracking-wider">Next Topic</span>
                          <span className="text-xs font-semibold text-ink truncate">
                            {BLOG_POSTS.find((p) => p.slug === activePost.nextTopic)?.title.split(' (')[0]}
                          </span>
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT STICKY SIDEBAR: Current Table of Contents */}
              <aside className="w-56 shrink-0 border-l overflow-y-auto hidden lg:block z-40 bg-transparent">
                <div className="p-4 flex flex-col gap-3 font-mono text-[10px] text-mute uppercase tracking-widest sticky top-10">
                  <span className="text-ink font-semibold tracking-wider pb-1">On This Page</span>
                  
                  {([
                    ['introduction', 'Introduction'],
                    ['why-important', 'Why Important'],
                    ['real-world-apps', 'Applications'],
                    ['complexity', 'Complexity'],
                    ['implementation', 'Implementation'],
                    ['common-mistakes', 'Mistakes'],
                    ['interview-questions', 'Questions'],
                    ['practice-problems', 'Practice'],
                    ['summary', 'Summary']
                  ] as const).map(([headingId, headingLabel]) => (
                    <a
                      key={headingId}
                      href={`#${headingId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`text-left py-1 hover:text-ink transition-colors cursor-pointer border-l-2 pl-3 ${
                        activeHeadingId === headingId
                          ? 'text-link font-bold border-link'
                          : 'border-hairline text-mute'
                      }`}
                    >
                      {headingLabel}
                    </a>
                  ))}
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
