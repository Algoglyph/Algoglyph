import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  Terminal,
  FileText,
  LayoutGrid,
  Layers,
  Network,
  BookOpen,
  CheckCircle2,
  Download,
  ChevronDown
} from 'lucide-react';
import { MockWorkspace } from './landing/MockWorkspace';
import { MorphingArena } from './landing/MorphingArena';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark } from '../config/editorTheme';

interface LandingPageProps {
  onLaunch: () => void;
  onViewRoadmap: () => void;
}

interface StageDetail {
  title: string;
  description: string;
  complexity: string;
  footnote: string;
}

const stageCopy: Record<number, StageDetail> = {
  1: {
    title: 'Contiguous Array Layout',
    description: 'Elements are allocated in adjacent physical memory blocks. Offset computation enables O(1) random access reads. Resizing requires full re-allocation, and insertion triggers O(N) memory shifts as elements are physically moved.',
    complexity: 'Random Access: O(1)  ·  Index Shift: O(N)',
    footnote: 'System trade-off: Maximum cache locality, expensive write operations.',
  },
  2: {
    title: 'Staggered Linked List References',
    description: 'Memory contiguity is bypassed. Nodes are allocated anywhere in heap memory and connected via directed address references (pointers). Modifications are O(1) by updating references, but search degrades to O(N) linear scan traversals.',
    complexity: 'Pointer Relink: O(1)  ·  Linear Traversal: O(N)',
    footnote: 'System trade-off: Constant-time write updates, zero random access.',
  },
  3: {
    title: 'Restricted LIFO Stack frames',
    description: 'Structural constraints enforce Call Stack execution behavior. Operations are restricted to a single endpoint: the top node. Data flows follow Last-In-First-Out (LIFO) order, matching operating system runtime stack frames.',
    complexity: 'Frame Push: O(1)  ·  Frame Pop: O(1)',
    footnote: 'Constraint: Deep random traversal is blocked; only recent state is visible.',
  },
  4: {
    title: 'Balanced Binary Search Tree',
    description: 'Branching pointers divide the search space by half at each node traversal. Arranging nodes hierarchically (smaller values left, larger values right) guarantees O(log N) operations, shielding lookups from linear scaling.',
    complexity: 'Search Depth: O(log N)  ·  Balance Rotations: O(log N)',
    footnote: 'Logic: Dividing search space at each depth check to balance height.',
  },
  5: {
    title: 'Cyclic Graph Mesh Network',
    description: 'Pointers generalize into relational edges between vertices. Hierarchical constraints dissolve, unlocking mesh topologies, routing meshes, networks, and cycles. Graphs map complex relations in real-world networks.',
    complexity: 'BFS Traversal: O(V + E)  ·  Dijkstra Relax: O(E + V log V)',
    footnote: 'Topology: General mesh structure with cyclic edge patterns.',
  }
};

const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const heroWorkspaceVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.45 },
  },
};

const sectionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const listItemContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, onViewRoadmap }) => {
  const [activeStage, setActiveStage] = useState(1); // 1 (Array) to 5 (Graph)
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'py' | 'java' | 'js'>('py');
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeStageContent = stageCopy[activeStage];

  const codeSnippets = {
    cpp: `// C++ Dijkstra path relaxation\nwhile (!pq.empty()) {\n  int u = pq.top().second;\n  pq.pop();\n  for (auto& edge : adj[u]) {\n    int v = edge.first, w = edge.second;\n    if (dist[v] > dist[u] + w) {\n      dist[v] = dist[u] + w;\n      pq.push({dist[v], v});\n    }\n  }\n}`,
    py: `# Python path relaxation\nwhile not pq.is_empty():\n    u, dist = pq.pop_min()\n    for v, weight in graph.adj[u]:\n        if dists[v] > dist + weight:\n            dists[v] = dist + weight\n            pq.insert(v, dists[v])`,
    java: `// Java path relaxation\nwhile (!pq.isEmpty()) {\n    Node curr = pq.poll();\n    for (Edge edge : adj.get(curr.id)) {\n        if (dist[edge.to] > dist[curr.id] + edge.weight) {\n            dist[edge.to] = dist[curr.id] + edge.weight;\n            pq.add(new Node(edge.to, dist[edge.to]));\n        }\n    }\n}`,
    js: `// JS path relaxation\nwhile (!pq.isEmpty()) {\n  const [u, dist] = pq.popMin();\n  for (const [v, weight] of graph.adj[u]) {\n    if (dists[v] > dist + weight) {\n      dists[v] = dist + weight;\n      pq.insert(v, dists[v]);\n    }\n  }\n}`
  };

  return (
    <div className="relative w-full bg-[#000000] text-[#ededed] overflow-x-hidden selection:bg-[#ededed] selection:text-[#000000] min-h-screen font-sans antialiased">
      
      {/* Background canvas subtle grids */}
      <div className="absolute top-0 left-0 right-0 h-[1000px] bg-[radial-gradient(rgba(255,255,255,0.006)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 right-0 h-[700px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(255,255,255,0.012),transparent_70%)] pointer-events-none z-0" />

      {/* Premium Minimal Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/[0.04] bg-[#000000]/60 backdrop-blur-md z-50 flex items-center justify-between px-6 sm:px-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 shrink-0">
            <img src="/favicon.png" alt="algoglyph logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-lg tracking-[-0.03em] text-white">Algoglyph</span>
        </div>

        {/* Center menu links like QuantPad */}
        <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-white/70">
          <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="hover:text-white transition-colors">Features</a>
          <a href="#visualizer" onClick={(e) => handleScrollTo(e, 'visualizer')} className="hover:text-white transition-colors">Visualizers</a>
          <a href="#usecases" onClick={(e) => handleScrollTo(e, 'usecases')} className="hover:text-white transition-colors">Use Cases</a>
          <button 
            onClick={onViewRoadmap} 
            className="hover:text-white transition-colors font-mono tracking-wider bg-white/[0.04] px-2 py-0.5 rounded border border-white/5 uppercase text-[11px] text-white/80 cursor-pointer"
          >
            Roadmap
          </button>
        </div>

        <nav className="flex items-center gap-4">
          <button
            onClick={onLaunch}
            className="px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-[14.5px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <span>Launch Workspace</span>
            <ArrowRight size={13} />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 sm:px-12 md:px-16 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-7 max-w-[800px] mb-16"
        >
          <motion.div variants={heroItemVariants} className="flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/[0.02] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[11px] font-mono text-white/50 tracking-widest uppercase font-semibold">Visual Computer Science Workspace</span>
          </motion.div>

          <motion.h1 variants={heroItemVariants} className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] text-white leading-[1.1] max-w-3xl text-center">
            Learn computer science visually. Not by memorization.
          </motion.h1>

          <motion.p variants={heroItemVariants} className="text-[16px] sm:text-[18px] lg:text-[20px] leading-relaxed text-[#a1a1a1] max-w-[700px] text-center">
            Algoglyph is a spatial workspace integrating engineering notebooks, infinite drawing canvases, interactive compilers, and state visualizers. It replaces disconnected tabs with a unified feedback loop to help developers build spatial mental models.
          </motion.p>

          <motion.div variants={heroItemVariants} className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <button
              onClick={onLaunch}
              className="px-7.5 py-3.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-[15px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans shadow-[0_1px_2px_rgba(255,255,255,0.15)]"
            >
              <span>Launch Free Workspace</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onViewRoadmap}
              className="px-6.5 py-3.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.01] text-[15px] font-semibold text-white hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              <span>Explore CS Roadmap</span>
              <ArrowRight size={14} className="opacity-60" />
            </button>
            <div className="relative">
              <button
                onClick={() => setDownloadMenuOpen((prev) => !prev)}
                className="px-6.5 py-3.5 rounded-lg border border-white/10 hover:border-white/25 bg-white/[0.02] text-[15px] font-semibold text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-sans w-full"
              >
                <Download size={14} />
                <span>Get App</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${downloadMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {downloadMenuOpen && (
                  <>
                    {/* Invisible backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setDownloadMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 mt-2.5 w-56 rounded-xl border border-white/[0.08] bg-[#0d0d0f]/90 backdrop-blur-md p-1.5 shadow-[0_24px_50px_rgba(0,0,0,0.6)] z-50 flex flex-col text-left select-none"
                    >
                      <a
                        href="/release/Scratchpad Setup 1.0.3.exe"
                        download
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-white/[0.04] text-[13.5px] font-medium text-white/80 hover:text-white transition-all duration-150 cursor-pointer"
                        onClick={() => setDownloadMenuOpen(false)}
                      >
                        <span className="font-mono text-[9px] text-[#3291ff] font-bold border border-[#3291ff]/20 bg-[#3291ff]/10 px-1.5 py-0.5 rounded">WIN</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">Windows Installer</span>
                          <span className="text-[10px] text-white/40">Windows 10/11 (.exe)</span>
                        </div>
                      </a>
                      <a
                        href="/release/Scratchpad-1.0.3.dmg"
                        download
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-white/[0.04] text-[13.5px] font-medium text-white/80 hover:text-white transition-all duration-150 cursor-pointer"
                        onClick={() => setDownloadMenuOpen(false)}
                      >
                        <span className="font-mono text-[9px] text-[#3291ff] font-bold border border-[#3291ff]/20 bg-[#3291ff]/10 px-1.5 py-0.5 rounded">MAC</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">macOS DMG</span>
                          <span className="text-[10px] text-white/40">Intel & Apple Silicon (.dmg)</span>
                        </div>
                      </a>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={heroWorkspaceVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex items-center justify-center mt-10"
        >
          <MockWorkspace />
        </motion.div>
      </section>

      <section id="features" className="py-24 border-y border-white/[0.04] bg-[#09090b]/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 text-center flex flex-col items-center gap-12">
          <div className="max-w-2xl flex flex-col gap-3">
            <span className="text-[11px] font-mono tracking-[0.2em] text-[#3291ff] font-bold uppercase">Workspace Fragmentation</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
              Why traditional computer science study feels fragmented
            </h2>
            <p className="text-[15px] leading-relaxed text-[#a1a1a1]">
              Developers split focus across six isolated programs. Explanations live on YouTube tabs, code runs in standalone compilers, textbook notes sit in Notion databases, and layouts are sketched on physical scratchpads. Algoglyph closes this loop.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionContainerVariants}
            className="w-full max-w-[860px] grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
          >
            {/* The Disconnected Stack */}
            <motion.div
              variants={cardVariants}
              whileHover={{
                translateY: -5,
                borderColor: 'rgba(239, 68, 68, 0.25)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.03)',
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
              className="border border-white/[0.05] bg-[#0c0c0e]/60 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-between text-left transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239, 68, 68, 0.02),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex flex-col gap-3 relative z-10">
                <span className="text-[10px] font-mono text-rose-400 tracking-wider uppercase border border-rose-500/20 bg-rose-500/5 px-2.5 py-0.5 rounded-full w-fit">
                  Fragmented Environment
                </span>
                <h3 className="font-display font-bold text-[19px] text-white">Context Switching Cost</h3>
                <p className="text-[14.5px] text-[#a1a1a1] leading-relaxed">
                  Every jump between tabs resets focus. Static visuals are detached from compiler outputs.
                </p>

                <motion.div
                  variants={listItemContainerVariants}
                  className="flex flex-col gap-2 mt-1.5 font-mono text-[11.5px] text-white/50"
                >
                  <motion.div variants={listItemVariants} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <span>🎬 YouTube Walkthrough</span>
                    <span className="text-rose-400/80 font-medium">Static / Passive</span>
                  </motion.div>
                  <motion.div variants={listItemVariants} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <span>📄 Notion / Markdown Files</span>
                    <span className="text-rose-400/80 font-medium">No Execution</span>
                  </motion.div>
                  <motion.div variants={listItemVariants} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <span>💻 Local Compiler Terminal</span>
                    <span className="text-rose-400/80 font-medium">Dry Console Log</span>
                  </motion.div>
                  <motion.div variants={listItemVariants} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                    <span>✏️ Physical Sketchbook</span>
                    <span className="text-rose-400/80 font-medium">No connection</span>
                  </motion.div>
                </motion.div>
              </div>
              <div className="mt-5 text-[11.5px] font-mono text-[#6f6f6f] italic relative z-10">
                Result: Rote memorization of equations rather than spatial understanding.
              </div>
            </motion.div>

            {/* The Unified Workspace */}
            <motion.div
              variants={cardVariants}
              whileHover={{
                translateY: -5,
                borderColor: 'rgba(50, 145, 255, 0.4)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(50, 145, 255, 0.08)',
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
              className="border border-[#3291ff]/30 bg-[#0c0d12]/70 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-between text-left transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(50, 145, 255, 0.05),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex flex-col gap-3 relative z-10">
                <span className="text-[10px] font-mono text-[#3291ff] tracking-wider uppercase border border-[#3291ff]/20 bg-[#3291ff]/5 px-2.5 py-0.5 rounded-full w-fit">
                  Connected Loop
                </span>
                <h3 className="font-display font-bold text-[19px] text-white">The Unified Feedback Loop</h3>
                <p className="text-[14.5px] text-[#a1a1a1] leading-relaxed">
                  Notes, code execution, visual representation, and spatial layouts run as a synchronized system.
                </p>

                <motion.div
                  variants={listItemContainerVariants}
                  className="flex flex-col gap-2 mt-1.5 font-mono text-[11.5px] text-white"
                >
                  <motion.div variants={listItemVariants} className="flex items-center justify-between p-2.5 rounded-lg bg-[#3291ff]/5 border border-[#3291ff]/15 hover:bg-[#3291ff]/10 transition-colors">
                    <span className="flex items-center gap-2">
                      <LayoutGrid size={11} className="text-[#3291ff]" />
                      Infinite Spatial Canvas
                    </span>
                    <span className="text-[#3291ff] font-medium">Active Drawing Sandbox</span>
                  </motion.div>
                  <motion.div variants={listItemVariants} className="flex items-center justify-between p-2.5 rounded-lg bg-[#3291ff]/5 border border-[#3291ff]/15 hover:bg-[#3291ff]/10 transition-colors">
                    <span className="flex items-center gap-2">
                      <FileText size={11} className="text-[#3291ff]" />
                      Tiptap Concept Notebook
                    </span>
                    <span className="text-[#3291ff] font-medium">Syncs with Canvas</span>
                  </motion.div>
                  <motion.div variants={listItemVariants} className="flex items-center justify-between p-2.5 rounded-lg bg-[#3291ff]/5 border border-[#3291ff]/15 hover:bg-[#3291ff]/10 transition-colors">
                    <span className="flex items-center gap-2">
                      <Terminal size={11} className="text-[#3291ff]" />
                      Active Sandbox Compiler
                    </span>
                    <span className="text-[#3291ff] font-medium">Visual State Outputs</span>
                  </motion.div>
                </motion.div>
              </div>
              <div className="mt-5 text-[11.5px] font-mono text-[#3291ff] font-medium relative z-10">
                Result: Permanent spatial mental models that scale to complex design problems.
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 z-10 relative">
        <div className="w-full bg-[#0c0c0e]/50 border border-white/[0.05] rounded-3xl p-8 sm:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_24px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
          {/* Faint ambient glow inside card */}
          <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(50,145,255,0.015),transparent_70%)] pointer-events-none" />

          <div className="flex-1 flex flex-col gap-5 max-w-[480px] relative z-10">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#3291ff] font-bold uppercase bg-[#3291ff]/10 border border-[#3291ff]/20 px-2.5 py-0.5 rounded-full w-fit">The Spatial Canvas</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white leading-tight bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              An infinite canvas for spatial thinking
            </h2>
            <p className="text-[15px] leading-relaxed text-[#a1a1a1]">
              Data structures are spatial layouts in memory. Algoglyph places your visualizations on an infinite whiteboard. Draw links, organize nodes in frames, zoom out to examine complex system topologies, and map out memory networks manually.
            </p>
            <div className="flex flex-col gap-2 font-mono text-[13px] text-white/60 mt-1">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-[#3291ff]" />
                Pan, zoom, and build multi-structure diagrams
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-[#3291ff]" />
                Excalidraw drawing engines integrated
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-[#3291ff]" />
                Maintain coordinate states permanently
              </span>
            </div>
          </div>

          <div className="flex-1 w-full bg-[#070709]/80 border border-white/[0.08] rounded-2xl overflow-hidden p-4 relative min-h-[260px] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_12px_30px_rgba(0,0,0,0.4)] relative z-10">
            {/* Tech grid */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="relative w-full max-w-[380px] h-[200px] flex items-center justify-center z-10">
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/5 font-mono text-[10px] text-white/35">
                Canvas Workspace Pane
              </div>

              <div className="flex gap-4 items-center">
                <div className="border border-[#3291ff]/20 bg-[#3291ff]/5 p-2 rounded flex flex-col gap-0.5 items-center w-16">
                  <span className="font-mono text-[10px] text-white/40">Node 0</span>
                  <span className="text-sm font-semibold">17</span>
                </div>
                
                <div className="text-white/25 select-none font-mono text-[12px] sm:text-sm">
                  <span>──►</span>
                </div>

                <div className="border border-white/5 bg-[#121215] p-2 rounded flex flex-col gap-0.5 items-center w-16">
                  <span className="font-mono text-[10px] text-white/30">Node 1</span>
                  <span className="text-sm font-semibold">42</span>
                </div>
              </div>

              <div className="absolute bottom-1 right-2 border border-white/5 bg-[#09090b]/90 p-2 rounded shadow-md text-[10.5px] font-mono max-w-[130px]">
                <span className="text-[#3291ff] font-semibold">Spatial Link</span>
                <p className="text-white/40 mt-0.5 leading-normal">
                  Pointers link disjoint memory locations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 z-10 relative">
        <div className="w-full bg-[#0c0c0e]/50 border border-white/[0.05] rounded-3xl p-8 sm:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_24px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden flex flex-col lg:flex-row-reverse items-center gap-12">
          {/* Faint ambient glow inside card */}
          <div className="absolute -left-20 -top-20 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(50,145,255,0.015),transparent_70%)] pointer-events-none" />

          <div className="flex-1 flex flex-col gap-5 max-w-[480px] relative z-10">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#3291ff] font-bold uppercase bg-[#3291ff]/10 border border-[#3291ff]/20 px-2.5 py-0.5 rounded-full w-fit">Notebook Documentation</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white leading-tight bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              Notebooks built for computer science
            </h2>
            <p className="text-[15px] leading-relaxed text-[#a1a1a1]">
              Document your understanding with a Markdown editor. Write detailed descriptions, format mathematical complexity notations with LaTeX equations (such as $O(V + E)$), embed executable compiler blocks, and link paragraphs directly to canvas layout coordinates.
            </p>
            <div className="flex flex-col gap-2 font-mono text-[13px] text-white/60 mt-1">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-[#3291ff]" />
                TipTap powered rich text workspace
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-[#3291ff]" />
                LaTeX complexity equation parsing
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={11} className="text-[#3291ff]" />
                Hyperlink notebook sentences to canvas targets
              </span>
            </div>
          </div>

          <div className="flex-1 w-full bg-[#070709]/80 border border-white/[0.08] rounded-2xl p-6 relative select-none text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_12px_30px_rgba(0,0,0,0.4)] relative z-10">
            <div className="font-mono text-[10px] text-white/20 mb-3">// Notebook Editor Interface</div>
            <div className="flex flex-col gap-3 font-sans text-[14px] text-[#a1a1a1] leading-relaxed">
              <h3 className="text-white text-lg font-bold tracking-tight">Recursive Pre-order Traversal</h3>
              <p>
                To trace execution flow depth-first, we use call stack recursive frames. Let's trace runtime performance metrics:
              </p>
              
              <div className="p-2 border-l border-[#3291ff] bg-[#3291ff]/5 font-mono text-[12px] text-[#3291ff] flex flex-col gap-0.5 rounded-r">
                <span>Time Complexity: O(N)</span>
                <span>Space Complexity: O(H)</span>
              </div>

              <p>
                We load parameters sequentially onto operating system memory stack frames:
              </p>
              
              <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11.5px] [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent">
                <CodeMirror
                  value={`void preOrder(Node* root) {\n  if (!root) return;\n  visit(root);\n  preOrder(root->left);\n  preOrder(root->right);\n}`}
                  readOnly={true}
                  editable={false}
                  theme={vscodeDark}
                  extensions={[cpp()]}
                  basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 z-10 relative">
        <div className="w-full bg-[#0c0c0e]/50 border border-white/[0.05] rounded-3xl p-8 sm:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_24px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
          {/* Faint ambient glow inside card */}
          <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(50,145,255,0.015),transparent_70%)] pointer-events-none" />

          <div className="flex-1 flex flex-col gap-5 max-w-[480px] relative z-10">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#3291ff] font-bold uppercase bg-[#3291ff]/10 border border-[#3291ff]/20 px-2.5 py-0.5 rounded-full w-fit">Compiler Runtime</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white leading-tight bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              An active sandbox compiler
            </h2>
            <p className="text-[15px] leading-relaxed text-[#a1a1a1]">
              Write and execute logic in C++, Python, Java, or JavaScript inside the notebook. The runner operates in a sandboxed output panel. Watch print statements, arrays, and memory maps output logs update in sync with your canvas diagrams.
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {(['cpp', 'py', 'java', 'js'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-[11.5px] font-mono transition-all duration-200 cursor-pointer border ${
                    selectedLanguage === lang
                      ? 'border-[#3291ff] bg-[#3291ff]/15 text-white shadow-[0_0_12px_rgba(50,145,255,0.15)] font-medium'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  {lang === 'cpp' && 'C++'}
                  {lang === 'py' && 'Python'}
                  {lang === 'java' && 'Java'}
                  {lang === 'js' && 'JavaScript'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full bg-[#070709]/80 border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col select-none text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_12px_30px_rgba(0,0,0,0.4)] relative z-10">
            <div className="h-8 border-b border-white/[0.04] bg-[#070709] flex items-center justify-between px-3.5">
              <span className="text-[11px] font-mono text-white/35">editor_compiler.{selectedLanguage}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <div className="p-3.5 font-mono text-[12px] text-white/70 bg-[#0a0a0c] leading-relaxed min-h-[120px] overflow-y-auto [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent">
              <div className="text-white/20 font-mono text-[11px] mb-1.5">// Code execution runner</div>
              <CodeMirror
                value={codeSnippets[selectedLanguage]}
                readOnly={true}
                editable={false}
                theme={vscodeDark}
                extensions={[
                  selectedLanguage === 'cpp' ? cpp() :
                  selectedLanguage === 'py' ? python() :
                  selectedLanguage === 'java' ? java() :
                  javascript()
                ]}
                basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false }}
              />
            </div>
            
            <div className="border-t border-white/[0.04] p-3 bg-[#060608] font-mono text-[11px] text-emerald-400/90">
              <span className="text-[#a1a1a1]/30 select-none">// Stdout stdout trace logs</span>
              <pre className="mt-0.5 font-mono leading-normal">
                [Running runner...]{"\n"}
                Visited: 42 -&gt; 17 -&gt; 89 -&gt; 23 -&gt; 56{"\n"}
                Process finished with exit code 0.
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section id="visualizer" className="py-32 relative z-10 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(50,145,255,0.04),transparent_70%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16">

          {/* Section header — left-aligned for visual weight */}
          <div className="max-w-xl mb-16">
            <span className="text-[11px] font-mono tracking-[0.2em] text-[#3291ff] font-bold uppercase block mb-4">Visualizer</span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-white leading-[1.1] mb-5">
              Watch memory reshape itself
            </h2>
            <p className="text-[16px] leading-relaxed text-[#666]">
              Five nodes. Same data. Click a structure to see how connections, constraints, and memory layout transform.
            </p>
          </div>

          {/* Stage selector — compact pill bar */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit mb-12">
            {([1, 2, 3, 4, 5] as const).map((stage) => {
              const labels: Record<number, string> = {
                1: 'Array',
                2: 'Linked List',
                3: 'Stack',
                4: 'Tree',
                5: 'Graph'
              };
              return (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`px-5 py-2 rounded-lg text-[13px] font-sans font-medium transition-all duration-200 cursor-pointer ${
                    activeStage === stage
                      ? 'bg-white text-black shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                      : 'text-[#666] hover:text-white'
                  }`}
                >
                  {labels[stage]}
                </button>
              );
            })}
          </div>

          {/* Main content: text + visualization side by side */}
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-20">

            {/* Left: copy block */}
            <div className="w-full lg:w-[38%] flex flex-col justify-center lg:pt-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex flex-col gap-5"
                >
                  <h3 className="font-display text-[28px] sm:text-[32px] font-semibold tracking-[-0.03em] text-white leading-[1.15]">
                    {activeStageContent.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7] text-[#888]">
                    {activeStageContent.description}
                  </p>

                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[15px] text-white font-mono font-semibold tracking-wide">
                      {activeStageContent.complexity}
                    </span>
                    <span className="text-[13px] text-[#555] font-sans">
                      {activeStageContent.footnote}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: visualization canvas */}
            <div className="flex-1 w-full flex items-center justify-center relative min-h-[480px] sm:min-h-[520px] bg-[#0c0c0e]/50 border border-white/[0.05] rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_24px_50px_rgba(0,0,0,0.5)] overflow-hidden p-4 sm:p-8">
              {/* Subtle dot grid behind the canvas */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" />
              {/* Faint glow behind active visualization */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(50,145,255,0.06),transparent_65%)] pointer-events-none" />
              <MorphingArena activeStage={activeStage} />
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap" className="py-28 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 z-10 relative">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-3 mb-12">
          <span className="text-[11px] font-mono tracking-[0.2em] text-[#3291ff] font-bold uppercase">Concept Lessons Portal</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
            Lessons designed for algorithmic intuition
          </h2>
          <p className="text-[15px] leading-relaxed text-[#a1a1a1]">
            Algoglyph provides visual intuition breakdowns. Study algorithmic workflows by watching states resolve dynamically, rather than dry traces of code lines.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionContainerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              translateY: -5,
              borderColor: 'rgba(50, 145, 255, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(50, 145, 255, 0.05)',
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            className="border border-white/[0.05] bg-[#0c0c0e]/60 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 text-left transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(50,145,255,0.04),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3291ff]/15 to-[#3291ff]/5 border border-[#3291ff]/25 flex items-center justify-center text-[#3291ff] shadow-[0_4px_12px_rgba(50,145,255,0.1)] group-hover:scale-110 transition-transform duration-300">
              <Layers size={18} />
            </div>
            <h3 className="font-display font-bold text-white text-[17px]">Dynamic Programming Memoization</h3>
            <p className="text-[14px] text-[#a1a1a1] leading-relaxed">
              Visualize memoization tables mapping sub-problems onto coordinate grids. Watch shortest pathways compute sequentially.
            </p>
            <span className="mt-auto text-[10px] font-mono text-[#3291ff] uppercase tracking-wider font-semibold">Future Roadmap</span>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              translateY: -5,
              borderColor: 'rgba(50, 145, 255, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(50, 145, 255, 0.05)',
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            className="border border-white/[0.05] bg-[#0c0c0e]/60 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 text-left transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(50,145,255,0.04),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3291ff]/15 to-[#3291ff]/5 border border-[#3291ff]/25 flex items-center justify-center text-[#3291ff] shadow-[0_4px_12px_rgba(50,145,255,0.1)] group-hover:scale-110 transition-transform duration-300">
              <Network size={18} />
            </div>
            <h3 className="font-display font-bold text-white text-[17px]">Priority Queue Mesh Relaxation</h3>
            <p className="text-[14px] text-[#a1a1a1] leading-relaxed">
              Step through Dijkstra and Bellman-Ford algorithms. Nodes highlight in real-time as priority queue states dynamically re-balance.
            </p>
            <span className="mt-auto text-[10px] font-mono text-[#3291ff] uppercase tracking-wider font-semibold">Future Roadmap</span>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              translateY: -5,
              borderColor: 'rgba(50, 145, 255, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(50, 145, 255, 0.05)',
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            className="border border-white/[0.05] bg-[#0c0c0e]/60 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 text-left transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(50,145,255,0.04),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3291ff]/15 to-[#3291ff]/5 border border-[#3291ff]/25 flex items-center justify-center text-[#3291ff] shadow-[0_4px_12px_rgba(50,145,255,0.1)] group-hover:scale-110 transition-transform duration-300">
              <BookOpen size={18} />
            </div>
            <h3 className="font-display font-bold text-white text-[17px]">Self-Balancing Binary Trees</h3>
            <p className="text-[14px] text-[#a1a1a1] leading-relaxed">
              Understand AVL trees and Red-Black tree rotations. Drag nodes to watch balancing metrics calculate height thresholds automatically.
            </p>
            <span className="mt-auto text-[10px] font-mono text-[#3291ff] uppercase tracking-wider font-semibold">Future Roadmap</span>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 border-y border-white/[0.04] bg-[#09090b]/30 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 text-center flex flex-col items-center gap-12">
          <div className="max-w-2xl flex flex-col gap-3">
            <span className="text-[11px] font-mono tracking-[0.2em] text-[#3291ff] font-bold uppercase">Workspace Workflow</span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
              The Connected Learning Cycle
            </h2>
            <p className="text-[15px] leading-relaxed text-[#a1a1a1]">
              Algoglyph runs as an integrated feedback loop. As you write, draw, execute code, and debug, your visual understanding updates.
            </p>
          </div>

          {/* Workflow flow */}
          <div className="w-full max-w-[840px] relative p-8 sm:p-10 bg-[#0c0c0e]/50 border border-white/[0.05] rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-3 overflow-hidden select-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_24px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

            {[
              { title: 'Read Concept', desc: 'Break down complex logic' },
              { title: 'Draft Notes', desc: 'Detail variables in text' },
              { title: 'Map Canvas', desc: 'Draw relationships visually' },
              { title: 'Run Compiler', desc: 'Compile active logs' },
              { title: 'Build Intuition', desc: 'Retain spatial memory' }
            ].map((step, idx, arr) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2 relative z-10 text-center flex-1 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1c1c24] to-[#0d0d10] border border-[#3291ff]/40 text-white flex items-center justify-center font-mono text-[14px] font-bold shadow-[0_4px_12px_rgba(50,145,255,0.15)] group-hover:scale-105 transition-transform duration-300">
                    {idx + 1}
                  </div>
                  <span className="text-[13.5px] font-semibold text-[#ededed] mt-1">{step.title}</span>
                  <span className="text-[11px] text-[#6f6f6f] leading-snug px-1">{step.desc}</span>
                </div>
                {idx < arr.length - 1 && (
                  <span className="hidden sm:inline text-white/10 font-mono text-[18px] select-none">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section id="usecases" className="py-28 max-w-7xl mx-auto px-6 sm:px-12 md:px-16 z-10 relative">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4 mb-16">
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#3291ff] font-bold uppercase bg-[#3291ff]/10 border border-[#3291ff]/20 px-2.5 py-0.5 rounded-full w-fit">Use Cases</span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
            Designed for engineers, students, and educators
          </h2>
          <p className="text-[15px] leading-relaxed text-[#a1a1a1]">
            From dry runs to whiteboard design, Algoglyph is a computer science workspace.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionContainerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Coding Interview Preparation',
              desc: 'Stop memorizing LeetCode templates. Build spatial memory models that help you generalize to unexpected questions.',
              icon: <Terminal size={15} />
            },
            {
              title: 'Academic Studies & Notes',
              desc: 'Keep textbook definitions, code logic, and canvas drafts side-by-side. Unify notes and homework testing.',
              icon: <FileText size={15} />
            },
            {
              title: 'Self-Directed CS Study',
              desc: 'Master complex concepts (MST algorithms, balancing trees, segment trees) by drawing them as you code.',
              icon: <BookOpen size={15} />
            },
            {
              title: 'Whiteboard Demonstrations',
              desc: 'Instructors can explain data structures interactively, moving nodes dynamically instead of tracing equations.',
              icon: <LayoutGrid size={15} />
            },
            {
              title: 'Competitive Programming',
              desc: 'Draft complex custom cyclic graphs, trace coordinates, and dry run test cases with visual stdout logs.',
              icon: <Network size={15} />
            },
            {
              title: 'Concepts Indexing & Reference',
              desc: 'Retrieve notes weeks later. Scan spatial canvas drawings to recall complex structural mechanisms instantly.',
              icon: <Layers size={15} />
            }
          ].map((useCase, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{
                translateY: -5,
                borderColor: 'rgba(50, 145, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(50, 145, 255, 0.04)',
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
              className="border border-white/[0.05] bg-[#0c0c0e]/60 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-3.5 text-left transition-all duration-300 relative overflow-hidden group"
            >
              {/* Radial hover background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(50,145,255,0.03),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3291ff]/15 to-[#3291ff]/5 border border-[#3291ff]/20 flex items-center justify-center text-[#3291ff] shadow-[0_2px_8px_rgba(50,145,255,0.05)] group-hover:scale-105 transition-transform duration-300 relative z-10">
                {useCase.icon}
              </div>

              <div className="flex flex-col gap-1.5 relative z-10">
                <h4 className="font-display font-bold text-white text-[15px] group-hover:text-[#3291ff] transition-colors">{useCase.title}</h4>
                <p className="text-[13.5px] text-[#a1a1a1] leading-relaxed">{useCase.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>


      {/* Final CTA */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.008),transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.05em] text-white">
            Stop memorizing. Start understanding.
          </h2>
          <p className="text-[16px] leading-relaxed text-[#a1a1a1] max-w-md">
            Launch Algoglyph to build mental models of algorithms. Experience the spatial CS sandbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-1.5">
            <button
              onClick={onLaunch}
              className="px-6.5 py-3 rounded-lg bg-white hover:bg-[#ededed] text-black text-[14.5px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-sans shadow-[0_1px_2px_rgba(255,255,255,0.15)]"
            >
              <span>Launch Algoglyph Workspace</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-10 border-t border-white/[0.04] bg-[#070709] relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/30">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Algoglyph. Workspace Sandbox client.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
