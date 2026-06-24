import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Code2,
  Workflow,
  Settings,
  Moon,
  FileText,
  Braces,
  LayoutGrid,
  Play,
  Pause,
  RotateCcw,
  X,
  PanelLeftClose,
  PanelRightClose,
  Search,
  GripVertical,
  SkipBack,
  SkipForward,
  Dices,
  Gauge,
  MousePointer2,
  Check,
  Globe,
  Trash2
} from 'lucide-react';

interface MockWorkspaceProps {
  interactive?: boolean;
}

export const MockWorkspace: React.FC<MockWorkspaceProps> = () => {
  const [activeMode, setActiveMode] = useState<'split' | 'code' | 'visualizer'>('split');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Trigger brief saving state animation
  useEffect(() => {
    const timer = setInterval(() => {
      setSaveStatus('saving');
      setTimeout(() => setSaveStatus('saved'), 800);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // ────────────────────────────────────────────────────────
  // Code Editor State
  // ────────────────────────────────────────────────────────
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'cpp'>('python');
  const [isRunning, setIsRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string>('Run your code to see the output here.');

  const handleRunCode = () => {
    setIsRunning(true);
    setCodeOutput('Running on the remote runner…');
    setTimeout(() => {
      setIsRunning(false);
      setCodeOutput(`[wandbox-api] Running main.${codeLanguage === 'python' ? 'py' : 'cpp'}...
Initializing source vertex A with distance 0.
Relaxed node B (new distance: 5)
Relaxed node C (new distance: 12)
Relaxed node D (new distance: 9)
Shortest paths: {A: 0, B: 5, C: 12, D: 9}
Process finished with exit code 0.`);
    }, 1200);
  };

  // ────────────────────────────────────────────────────────
  // Visualizer Node State
  // ────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(true);
  const [vizStep, setVizStep] = useState(0);
  const [vizSpeed, setVizSpeed] = useState<'1×' | '2×'>('1×');
  const [customInput, setCustomInput] = useState('5, 12, 9, 3, 7');
  const [isEditingInput, setIsEditingInput] = useState(false);

  const vizSteps = [
    {
      caption: 'pq.pop_min() -> Extract vertex A (dist: 0). Visited, begin relaxing edges.',
      queue: ['B: 5', 'C: 12'],
      activeNode: 'A',
      visited: ['A'],
      relaxed: [],
    },
    {
      caption: 'Relax edges A->B and A->C. Insert B(5) and C(12) into Priority Queue.',
      queue: ['B: 5', 'C: 12'],
      activeNode: 'A',
      visited: ['A'],
      relaxed: ['AB', 'AC'],
    },
    {
      caption: 'pq.pop_min() -> Extract vertex B (dist: 5). Visited, begin relaxing edges.',
      queue: ['D: 9', 'C: 12'],
      activeNode: 'B',
      visited: ['A', 'B'],
      relaxed: [],
    },
    {
      caption: 'Relax edge B->D. Update path distance of D to 9. Insert D(9) into Heap.',
      queue: ['D: 9', 'C: 12'],
      activeNode: 'B',
      visited: ['A', 'B'],
      relaxed: ['BD'],
    }
  ];

  useEffect(() => {
    if (!isPlaying || activeMode !== 'visualizer') return;
    const intervalTime = vizSpeed === '1×' ? 2600 : 1300;
    const timer = setInterval(() => {
      setVizStep((prev) => (prev + 1) % vizSteps.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, vizSpeed, activeMode, vizSteps.length]);

  return (
    <div className="w-full max-w-[1020px] bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.8)] flex flex-col font-sans select-none text-[#ededed] text-left">
      
      {/* ────────────────────────────────────────────────────────
         1. TOP TOOLBAR (Exactly matching Toolbar.tsx design tokens)
         ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#09090b]/80 border-b border-white/5 text-white/70 select-none h-12 flex-shrink-0 z-40">
        {/* Wordmark & save status */}
        <div className="flex items-center gap-3 flex-1 basis-0 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 shrink-0">
              <img src="/favicon.png" alt="dsadelta logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display text-sm font-semibold tracking-[-0.02em] text-white">DSADelta</span>
          </div>

          <div className="h-3.5 w-px bg-white/10" />

          {/* Save status */}
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono">
            {saveStatus === 'saving' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-white/40">saving</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-white/40">saved locally</span>
              </>
            )}
          </div>
        </div>

        {/* Center Segmented Control - Replicates the actual App.tsx layout toggles */}
        <div className="flex items-center gap-0.5 bg-[#161618] border border-white/10 rounded-lg p-0.5 text-[11.5px]">
          {([
            ['split', 'Split View', <Monitor key="s" size={11} />],
            ['code', 'Code Runner', <Code2 key="code" size={11} />],
            ['visualizer', 'Algorithm Visualizer', <Workflow key="viz" size={11} />],
          ] as const).map(([mode, label, icon]) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                activeMode === mode
                  ? 'bg-[#27272a] text-white shadow-sm border border-white/5'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Actions (Mock settings) */}
        <div className="flex items-center gap-2 flex-1 basis-0 min-w-0 justify-end">
          <button className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer">
            <Settings size={13} />
          </button>
          <button className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer">
            <Moon size={13} />
          </button>
          <div className="h-3.5 w-px bg-white/10" />
          <button className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 text-[10.5px] font-mono cursor-pointer transition-colors">
            Export
          </button>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────
         2. TAB BAR (Exactly matching TabBar.tsx layout)
         ──────────────────────────────────────────────────────── */}
      <div className="flex items-stretch h-9 bg-[#08080a] border-b border-white/5 select-none flex-shrink-0">
        <div className="flex items-center gap-0.5 px-2 border-r border-white/5 flex-shrink-0">
          <button className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <PanelLeftClose size={13} />
          </button>
          <button className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <Search size={13} />
          </button>
        </div>

        <div className="flex items-stretch gap-1 py-1 px-2 flex-1 overflow-x-auto">
          <div className={`flex items-center gap-1.5 px-3 rounded-md text-[11px] font-mono border ${
            activeMode === 'split' ? 'bg-[#18181b] text-white border-white/10' : 'bg-transparent text-white/40 border-transparent'
          }`}>
            <FileText size={10} className="text-[#3291ff]" />
            <span>dijkstra_notes.md</span>
            <X size={9} className="opacity-40 hover:opacity-100 cursor-pointer" />
          </div>

          <div className={`flex items-center gap-1.5 px-3 rounded-md text-[11px] font-mono border ${
            activeMode === 'code' ? 'bg-[#18181b] text-white border-white/10' : 'bg-transparent text-white/40 border-transparent'
          }`}>
            <Braces size={10} className="text-amber-400" />
            <span>shortest_path.py</span>
            <X size={9} className="opacity-40 hover:opacity-100 cursor-pointer" />
          </div>

          <div className={`flex items-center gap-1.5 px-3 rounded-md text-[11px] font-mono border ${
            activeMode === 'visualizer' ? 'bg-[#18181b] text-white border-white/10' : 'bg-transparent text-white/40 border-transparent'
          }`}>
            <LayoutGrid size={10} className="text-emerald-400" />
            <span>visualizer_workspace</span>
            <X size={9} className="opacity-40 hover:opacity-100 cursor-pointer" />
          </div>
        </div>

        <div className="flex items-center px-2 border-l border-white/5 flex-shrink-0">
          <button className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <PanelRightClose size={13} />
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
         3. DYNAMIC CONTENT WORKSPACE
         ──────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-[480px] bg-[#09090b] relative overflow-hidden flex">
        <AnimatePresence mode="wait">
          
          {/* A. SPLIT VIEW MODE: Canvas + Notes side-by-side */}
          {activeMode === 'split' && (
            <motion.div
              key="split-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 divide-x divide-white/5"
            >
              {/* Left Canvas (Excalidraw mockup) */}
              <div className="w-[55%] relative flex flex-col justify-between p-3 select-none">
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1.2px,transparent_1.2px)] [background-size:16px_16px] pointer-events-none" />
                
                {/* Floating Canvas Toolbar */}
                <div className="absolute top-3 left-3 flex gap-0.5 bg-[#121214]/90 border border-white/10 rounded-lg p-0.5 shadow-lg z-20">
                  {['Pointer', 'Square', 'Circle', 'Diamond', 'Arrow', 'Line', 'Text'].map((tool, idx) => (
                    <button
                      key={tool}
                      className={`p-1.5 rounded transition-colors text-[10px] cursor-pointer ${
                        idx === 4 ? 'bg-[#27272a] text-white border border-white/5' : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      {idx === 0 && <MousePointer2 size={11} />}
                      {idx === 1 && <span className="w-2.5 h-2.5 border border-current rounded-sm inline-block" />}
                      {idx === 2 && <span className="w-2.5 h-2.5 border border-current rounded-full inline-block" />}
                      {idx === 3 && <span className="w-2.5 h-2.5 border border-current rotate-45 inline-block" />}
                      {idx === 4 && <span className="text-[10px]">↗</span>}
                      {idx === 5 && <span className="w-3 h-0.5 bg-current inline-block" />}
                      {idx === 6 && <span className="font-serif text-[10px] font-bold">A</span>}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-white/30 z-10">
                  <span>CANVAS WORKSPACE</span>
                  <span>x: -120, y: 45</span>
                </div>

                {/* Hand-drawn / Technical Node Diagram */}
                <div className="flex-grow flex items-center justify-center relative">
                  <svg className="w-[280px] h-[180px] text-white/10">
                    {/* Path connecting nodes */}
                    <path d="M 40,90 Q 110,30 180,50" fill="none" stroke="#a1a1a1" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M 40,90 Q 110,150 180,130" fill="none" stroke="#3291ff" strokeWidth="2" />
                    <path d="M 180,50 L 240,90" fill="none" stroke="#a1a1a1" strokeWidth="1.5" />
                    <path d="M 180,130 L 240,90" fill="none" stroke="#3291ff" strokeWidth="2" />
                    
                    {/* Arrows */}
                    <polygon points="175,53 182,50 178,43" fill="#a1a1a1" />
                    <polygon points="176,125 182,130 181,121" fill="#3291ff" />
                    <polygon points="237,86 242,90 234,94" fill="#3291ff" />
                  </svg>
                  
                  {/* Nodes overlay */}
                  <div className="absolute left-[30px] top-[75px] w-8 h-8 rounded-full border border-white/20 bg-[#121214] flex items-center justify-center font-mono text-xs">
                    A
                  </div>
                  <div className="absolute left-[170px] top-[35px] w-8 h-8 rounded-full border border-white/20 bg-[#121214] flex items-center justify-center font-mono text-xs">
                    B
                  </div>
                  <div className="absolute left-[170px] top-[115px] w-8 h-8 rounded-full border border-blue-500 bg-[#0c1322] flex items-center justify-center font-mono text-xs text-blue-400 font-bold shadow-[0_0_12px_rgba(50,145,255,0.2)]">
                    C
                  </div>
                  <div className="absolute left-[230px] top-[75px] w-8 h-8 rounded-full border border-white/20 bg-[#121214] flex items-center justify-center font-mono text-xs">
                    D
                  </div>
                  
                  {/* Labels */}
                  <div className="absolute left-[80px] top-[40px] text-[10px] font-mono text-white/40">w = 6</div>
                  <div className="absolute left-[80px] top-[125px] text-[10px] font-mono text-blue-400">w = 3</div>
                  <div className="absolute left-[205px] top-[50px] text-[10px] font-mono text-white/40">w = 12</div>
                  <div className="absolute left-[215px] top-[115px] text-[10px] font-mono text-blue-400">w = 2</div>
                </div>

                <div className="text-[8px] font-mono text-white/20 flex justify-between z-10">
                  <span>Pan / zoom active (100%)</span>
                  <span>Adjacency Graph Layout</span>
                </div>
              </div>

              {/* Right Editor (ProseMirror rich text notes mockup) */}
              <div className="w-[45%] bg-[#08080a] p-5 flex flex-col justify-between overflow-y-auto">
                <div className="font-sans text-[#a1a1a1] leading-relaxed flex flex-col gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8.5px] font-mono text-white/50 tracking-wider">DOCUMENTATION</span>
                  </div>
                  
                  <h2 className="font-display font-semibold text-lg text-white leading-snug tracking-tight">
                    Dijkstra's Path Solver
                  </h2>
                  <p className="text-[11.5px] leading-relaxed">
                    Dijkstra's algorithm finds the shortest path between nodes in a weighted graph. We maintain a min-priority queue of vertices sorted by their distance from the source node.
                  </p>
                  
                  <div className="p-2.5 rounded-lg border border-white/5 bg-[#121214] flex flex-col gap-1 mt-1">
                    <span className="font-mono text-[9px] text-white/30 uppercase tracking-wider">// Complexity Analysis</span>
                    <div className="flex justify-between font-mono text-[10.5px]">
                      <span className="text-white/60">Time Complexity:</span>
                      <span className="text-emerald-400 font-semibold">O(E log V)</span>
                    </div>
                    <div className="flex justify-between font-mono text-[10.5px]">
                      <span className="text-white/60">Space Complexity:</span>
                      <span className="text-white/60">O(V)</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/40 italic">
                    Double click coordinates on canvas to link them directly to equations in this text block.
                  </p>
                </div>

                <div className="border-t border-white/5 pt-2 mt-4 text-[9px] font-mono text-white/20 flex justify-between">
                  <span>Markdown notebook sync</span>
                  <span>LaTeX math enabled</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* B. CODE RUNNER MODE: Code Editor + Web Sandbox Compiler */}
          {activeMode === 'code' && (
            <motion.div
              key="code-runner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col select-text"
            >
              {/* Code Editor Header Controls */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-[#0b0b0d] select-none">
                <div className="flex items-center gap-2">
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value as 'python' | 'cpp')}
                    className="rounded bg-[#18181b] border border-white/10 text-white/80 px-2 py-1 text-xs font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC 14)</option>
                  </select>

                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Play size={11} fill="currentColor" />
                    <span>Run</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-white/30">
                  <Globe size={11} />
                  <span>runs online via Wandbox API</span>
                </div>
              </div>

              {/* CodeMirror Textarea Area */}
              <div className="flex-1 p-4 font-mono text-xs leading-normal bg-[#070709] overflow-y-auto flex">
                {/* Line numbers gutter */}
                <div className="text-white/20 text-right pr-3 select-none border-r border-white/5 mr-3 flex flex-col gap-0.5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>
                {/* Syntax Highlighted Code Mockup */}
                <pre className="flex-1 text-[#d4d4d4] font-mono overflow-x-auto whitespace-pre leading-relaxed">
                  {codeLanguage === 'python' ? (
                    <code>
                      <span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">dijkstra</span>(graph, start):{"\n"}
                      {"    "}pq = PriorityQueue(){"\n"}
                      {"    "}pq.put((<span className="text-[#b5cea8]">0</span>, start)){"\n"}
                      {"    "}distances = &#123;node: <span className="text-[#4ec9b0]">float</span>(<span className="text-[#ce9178]">'inf'</span>) <span className="text-[#569cd6]">for</span> node <span className="text-[#569cd6]">in</span> graph&#125;{"\n"}
                      {"    "}distances[start] = <span className="text-[#b5cea8]">0</span>{"\n"}
                      {"    "}{"\n"}
                      {"    "}<span className="text-[#569cd6]">while not</span> pq.empty():{"\n"}
                      {"        "}curr_dist, curr_node = pq.get(){"\n"}
                      {"        "}<span className="text-[#569cd6]">if</span> curr_dist &gt; distances[curr_node]:{"\n"}
                      {"            "}<span className="text-[#569cd6]">continue</span>{"\n"}
                      {"            "}{"\n"}
                      {"        "}<span className="text-[#569cd6]">for</span> neighbor, weight <span className="text-[#569cd6]">in</span> graph[curr_node].items():{"\n"}
                      {"            "}new_dist = curr_dist + weight{"\n"}
                      {"            "}<span className="text-[#569cd6]">if</span> new_dist &lt; distances[neighbor]:{"\n"}
                      {"                "}distances[neighbor] = new_dist{"\n"}
                      {"                "}pq.put((new_dist, neighbor))
                    </code>
                  ) : (
                    <code>
                      <span className="text-[#569cd6]">vector</span>&lt;<span className="text-[#569cd6]">int</span>&gt; <span className="text-[#dcdcaa]">dijkstra</span>(vector&lt;vector&lt;pair&lt;int, int&gt;&gt;&gt;&amp; adj, <span className="text-[#569cd6]">int</span> start) &#123;{"\n"}
                      {"    "}priority_queue&lt;pair&lt;int, int&gt;, vector&lt;pair&lt;int, int&gt;&gt;, greater&lt;pair&lt;int, int&gt;&gt;&gt; pq;{"\n"}
                      {"    "}vector&lt;<span className="text-[#569cd6]">int</span>&gt; dist(adj.size(), <span className="text-[#b5cea8]">1e9</span>);{"\n"}
                      {"    "}{"\n"}
                      {"    "}dist[start] = <span className="text-[#b5cea8]">0</span>;{"\n"}
                      {"    "}pq.push(&#123;<span className="text-[#b5cea8]">0</span>, start&#125;);{"\n"}
                      {"    "}{"\n"}
                      {"    "}<span className="text-[#569cd6]">while</span> (!pq.empty()) &#123;{"\n"}
                      {"        "}<span className="text-[#569cd6]">int</span> u = pq.top().second;{"\n"}
                      {"        "}<span className="text-[#569cd6]">int</span> d = pq.top().first;{"\n"}
                      {"        "}pq.pop();{"\n"}
                      {"        "}{"\n"}
                      {"        "}<span className="text-[#569cd6]">if</span> (d &gt; dist[u]) <span className="text-[#569cd6]">continue</span>;
                    </code>
                  )}
                </pre>
              </div>

              {/* Output Console Pane */}
              <div className="h-[150px] flex flex-col border-t border-white/5 bg-[#050507]">
                <div className="h-8 border-b border-white/5 flex items-center justify-between px-3 bg-[#060608] select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">stdout console</span>
                    {!isRunning && codeOutput.includes('exit code 0') && (
                      <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded border border-emerald-500/20 bg-emerald-950/20 text-emerald-400">exit 0</span>
                    )}
                  </div>
                  <button className="p-1 rounded text-white/30 hover:text-white transition-colors cursor-pointer" onClick={() => setCodeOutput('Run your code to see the output here.')}>
                    <Trash2 size={11} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-[10.5px] leading-relaxed text-white/60">
                  <pre className="whitespace-pre">{codeOutput}</pre>
                </div>
              </div>
            </motion.div>
          )}

          {/* C. VISUALIZER MODE: Sidebar + Drag Blocks Canvas */}
          {activeMode === 'visualizer' && (
            <motion.div
              key="visualizer-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex"
            >
              {/* Algorithm List Sidebar */}
              <aside className="w-[200px] border-r border-white/5 bg-[#070709] flex flex-col justify-between p-3 select-none flex-shrink-0 text-left">
                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between text-[10px] font-semibold text-white/30 tracking-widest uppercase">
                    <span>ALGORITHMS</span>
                    <span className="font-mono text-[9px]">8</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#3291ff]/60">// SORTING</span>
                        <span className="h-px flex-grow bg-white/5" />
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-white/40 pl-1">
                        <div className="p-1.5 rounded-md hover:text-white/80 hover:bg-white/5 cursor-pointer">Quick Sort</div>
                        <div className="p-1.5 rounded-md hover:text-white/80 hover:bg-white/5 cursor-pointer">Merge Sort</div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-emerald-400/60">// GRAPHS</span>
                        <span className="h-px flex-grow bg-white/5" />
                      </div>
                      <div className="flex flex-col gap-1 pl-1">
                        <div className="p-1.5 rounded-md bg-[#18181b] border border-white/10 text-white font-medium flex justify-between items-center text-[11px]">
                          <span>Dijkstra's Solver</span>
                          <span className="text-[8px] font-mono text-emerald-400">O(E log V)</span>
                        </div>
                        <div className="p-1.5 rounded-md hover:text-white/80 hover:bg-white/5 cursor-pointer text-[11px] text-white/40">Depth First Search</div>
                        <div className="p-1.5 rounded-md hover:text-white/80 hover:bg-white/5 cursor-pointer text-[11px] text-white/40">Bellman-Ford</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2 text-[8px] font-mono text-white/20 leading-relaxed">
                  Drag algorithms to drop onto canvas. Each runs independently.
                </div>
              </aside>

              {/* Canvas workspace for block nodes */}
              <div className="flex-grow bg-[#09090b] relative p-3 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:24px_24px]" />
                
                {/* Visualizer Floating Node (Exactly like VisualizerNode.tsx) */}
                <div className="absolute left-[30px] top-[40px] w-[344px] flex flex-col rounded-xl ring-1 ring-white/10 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] bg-gradient-to-b from-[#26262c] to-[#141418] border border-white/10 overflow-hidden font-sans">
                  
                  {/* Node Header */}
                  <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 select-none">
                    <GripVertical size={13} className="text-white/30 cursor-grab" />
                    <span className="flex-grow text-[12.5px] font-semibold text-white">Dijkstra's Algorithm</span>
                    <span className="rounded bg-white/5 border border-white/5 px-1.5 py-0.5 font-mono text-[9px] text-[#3291ff]">O(E log V)</span>
                    <button className="text-white/30 hover:text-rose-400 transition-colors cursor-pointer">
                      <X size={13} />
                    </button>
                  </div>

                  {/* Input row */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
                    {isEditingInput ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setIsEditingInput(false);
                            if (e.key === 'Escape') setIsEditingInput(false);
                          }}
                          className="flex-grow rounded bg-black/40 border border-white/10 px-2 py-0.5 text-[10.5px] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button onClick={() => setIsEditingInput(false)} className="h-5 w-5 bg-emerald-600 rounded flex items-center justify-center text-white cursor-pointer hover:bg-emerald-500 transition-colors">
                          <Check size={10} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono text-emerald-400 truncate">Input queue values: {customInput}</span>
                        <button onClick={() => setIsEditingInput(true)} className="text-[9px] font-mono border border-white/10 px-1.5 py-0.5 rounded text-white/40 hover:text-white transition-colors cursor-pointer">
                          Edit
                        </button>
                      </>
                    )}
                  </div>

                  {/* Visualizer Body (frames renderer) */}
                  <div className="px-2 pt-3">
                    <div className="rounded-lg bg-black/40 border border-white/5 p-3 flex flex-col items-center justify-center min-h-[100px]">
                      
                      {/* Priority queue list frames */}
                      <div className="flex gap-1.5">
                        {vizSteps[vizStep].queue.map((item, idx) => {
                          return (
                            <div
                              key={item}
                              className={`px-2 py-1.5 border rounded-lg flex flex-col items-center justify-center min-w-[54px] transition-all font-mono text-[10px] ${
                                idx === 0 && activeMode === 'visualizer'
                                  ? 'border-[#3291ff] bg-[#3291ff]/10 text-white shadow-[0_0_8px_rgba(50,145,255,0.15)] font-bold'
                                  : 'border-white/5 bg-[#17171a] text-white/50'
                              }`}
                            >
                              <span className="text-[8px] opacity-40">node</span>
                              <span className="text-[11px]">{item.split(': ')[0]}</span>
                              <span className="text-[8px] opacity-50 font-sans mt-0.5">dist: {item.split(': ')[1]}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                    </div>

                    {/* Description text */}
                    <div className="mt-2.5 px-1 pb-1">
                      <p className="h-8 text-[11px] leading-snug text-white/70">
                        {vizSteps[vizStep].caption}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${((vizStep + 1) / vizSteps.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-white/40 tabular-nums">
                          {vizStep + 1}/{vizSteps.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-1 border-t border-white/10 px-2 py-2 select-none">
                    <button
                      onClick={() => setVizStep((prev) => Math.max(0, prev - 1))}
                      disabled={vizStep === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <SkipBack size={13} />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white transition-colors hover:bg-emerald-500 cursor-pointer"
                    >
                      {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                    </button>
                    <button
                      onClick={() => setVizStep((prev) => (prev + 1) % vizSteps.length)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <SkipForward size={13} />
                    </button>
                    <button
                      onClick={() => setVizStep(0)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                    </button>

                    <div className="ml-auto flex items-center gap-1.5">
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                        <Dices size={13} />
                      </button>
                      <button
                        onClick={() => setVizSpeed((s) => (s === '1×' ? '2×' : '1×'))}
                        className="flex h-7 items-center gap-1 rounded-md px-1.5 text-[9px] font-mono text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Gauge size={11} />
                        {vizSpeed}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Grid Navigation HUD controls */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-2 py-1 backdrop-blur-md text-[10px]">
                  <button className="text-white/40 hover:text-white cursor-pointer px-1">-</button>
                  <span className="font-mono text-[9px] text-white/60">100%</span>
                  <button className="text-white/40 hover:text-white cursor-pointer px-1">+</button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
    </div>
  );
};
