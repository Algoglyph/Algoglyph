import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Search } from 'lucide-react';

interface MorphingArenaProps {
  activeStage: number; // 0 (Hero) to 6 (Workspace)
}

interface NodeCoord {
  x: number;
  y: number;
}

// Map stage positions
const stagePositions: Record<number, Record<string, NodeCoord>> = {
  0: { // Hero Stage: Circular organic layout
    A: { x: -80, y: -80 },
    B: { x: 80, y: -80 },
    C: { x: 110, y: 40 },
    D: { x: 0, y: 110 },
    E: { x: -110, y: 40 },
  },
  1: { // Array Stage: Base contiguous layout
    A: { x: -128, y: 0 },
    B: { x: -64, y: 0 },
    C: { x: 0, y: 0 },
    D: { x: 64, y: 0 },
    E: { x: 128, y: 0 },
  },
  2: { // Linked List: Staggered references layout
    A: { x: -200, y: -50 },
    B: { x: -100, y: 30 },
    C: { x: 0, y: -30 },
    D: { x: 100, y: 50 },
    E: { x: 200, y: -10 },
  },
  3: { // Stack Layout
    E: { x: 0, y: -100 }, // Top
    D: { x: 0, y: -50 },
    C: { x: 0, y: 0 },
    B: { x: 0, y: 50 },
    A: { x: 0, y: 100 },  // Bottom
  },
  4: { // BST Tree Layout
    A: { x: 0, y: -110 },   // Root (42)
    B: { x: -100, y: -20 }, // Left Child (17)
    C: { x: 100, y: -20 },  // Right Child (89)
    D: { x: -50, y: 70 },   // Sub-child (23)
    E: { x: 50, y: 70 },    // Sub-child (56)
  },
  5: { // Graph Layout
    A: { x: -50, y: -110 },
    B: { x: -120, y: -10 },
    C: { x: 110, y: -50 },
    D: { x: 70, y: 80 },
    E: { x: -60, y: 80 },
  },
  6: { // Workspace Centered (scaled down within the Canvas pane)
    A: { x: 30, y: -60 },
    B: { x: -40, y: -15 },
    C: { x: 100, y: -15 },
    D: { x: 70, y: 60 },
    E: { x: -10, y: 60 },
  }
};

const nodeMetaData = [
  { id: 'A', value: 42, label: '0x01' },
  { id: 'B', value: 17, label: '0x02' },
  { id: 'C', value: 89, label: '0x03' },
  { id: 'D', value: 23, label: '0x04' },
  { id: 'E', value: 56, label: '0x05' },
];

export const MorphingArena: React.FC<MorphingArenaProps> = ({ activeStage }) => {
  // Local Stage 1 (Array) Insertion Animation States
  const [arrayInserted, setArrayInserted] = useState(false);
  const [isInserting, setIsInserting] = useState(false);

  // Local Stage 4 (BST) Traversal States
  const [bstSearchActive, setBstSearchActive] = useState(false);
  const [bstStep, setBstStep] = useState<number>(-1); // -1=idle, 0=Root, 1=Right Child, 2=Target Found

  // Local Stage 5 (Graph) Loop Edge pulse timing
  const [graphPulseTime, setGraphPulseTime] = useState(0);

  // Stage 5 Graph pulse timer
  useEffect(() => {
    if (activeStage === 5 || activeStage === 6) {
      const interval = setInterval(() => {
        setGraphPulseTime((t) => (t + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeStage]);

  // Handle stage change auto-resets
  useEffect(() => {
    const timer = setTimeout(() => {
      setArrayInserted(false);
      setIsInserting(false);
      setBstSearchActive(false);
      setBstStep(-1);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeStage]);

  // Stage 1 Array Insertion triggers
  const triggerArrayInsert = async () => {
    if (isInserting) return;
    setIsInserting(true);
    // 1. Shift existing cells rightward
    setArrayInserted(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsInserting(false);
  };

  const resetArrayInsert = () => {
    setArrayInserted(false);
    setIsInserting(false);
  };

  // Stage 4 BST Traversal Loop
  const triggerBSTSearch = async () => {
    if (bstSearchActive) return;
    setBstSearchActive(true);
    setBstStep(0); // Check root 42
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setBstStep(1); // Check right child 89 (since 56 > 42)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setBstStep(2); // Check right-left child 56 (since 56 < 89) -- Found!
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setBstSearchActive(false);
    setBstStep(-1);
  };

  // Return coordinates matching active stage
  const getCoordinates = () => {
    const base = stagePositions[activeStage] || stagePositions[0];

    // Modify array positions if element is inserted
    if (activeStage === 1 && arrayInserted) {
      return {
        A: { x: -128, y: 0 },  // Index 0
        B: { x: 0, y: 0 },     // Shifted from -64 to 0 (Index 2)
        C: { x: 64, y: 0 },    // Shifted from 0 to 64 (Index 3)
        D: { x: 128, y: 0 },   // Shifted from 64 to 128 (Index 4)
        E: { x: 192, y: 0 },   // Shifted from 128 to 192 (Index 5)
      };
    }
    return base;
  };

  const activeCoords = getCoordinates();

  const getSpringConfig = () => {
    if (activeStage === 3) {
      // Stack Gravity drop config
      return { stiffness: 260, damping: 20, mass: 1 };
    }
    // Cinematic structural morph config
    return { stiffness: 95, damping: 16, mass: 1 };
  };

  const spring = getSpringConfig();

  // Connection links logic
  const getLinks = () => {
    if (activeStage === 2) {
      // Linked List links
      return [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'E' },
      ];
    }
    if (activeStage === 4) {
      // BST Tree links
      return [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
        { from: 'B', to: 'D' },
        { from: 'C', to: 'E' },
      ];
    }
    if (activeStage === 5 || activeStage === 6) {
      // Graph Mesh cyclic links
      return [
        { from: 'A', to: 'C' },
        { from: 'C', to: 'D' },
        { from: 'D', to: 'E' },
        { from: 'E', to: 'B' },
        { from: 'B', to: 'A' },
        { from: 'A', to: 'D' },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    // Wrapper sized to the *scaled* footprint so the demo doesn't reserve a full
    // 500px box on mobile. The inner arena keeps the fixed 500px design (the node
    // coords + SVG center=250 all assume it) and is scaled down uniformly so the
    // connector lines stay aligned with the nodes.
    <div className="flex items-center justify-center shrink-0 w-[310px] h-[310px] sm:w-[500px] sm:h-[500px]">
    <div className="relative w-[500px] h-[500px] shrink-0 flex items-center justify-center select-none scale-[0.62] sm:scale-100">
      {/* Workspace Mockup container for Stage 6 climax */}
      <motion.div
        animate={{
          scale: activeStage === 6 ? 1 : 0.82,
          opacity: activeStage === 6 ? 1 : 0,
          y: activeStage === 6 ? 0 : 40,
          pointerEvents: activeStage === 6 ? 'auto' : 'none',
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        className="absolute inset-0 bg-[#0d0d0f] border border-white/[0.04] rounded-xl overflow-hidden flex flex-col z-0 shadow-[0_24px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Mock window titlebar chrome */}
        <div className="h-10 border-b border-white/[0.03] bg-[#080809] flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">DSADelta Workspace</div>
          <div className="w-12" />
        </div>

        {/* Mock layout columns */}
        <div className="flex-1 flex overflow-hidden">
          {/* Notes pane */}
          <div className="w-[45%] border-r border-white/[0.03] bg-[#0a0a0c]/60 p-4 font-mono text-[9px] text-[#a1a1a1]/70 select-none flex flex-col gap-3">
            <div className="border-b border-white/5 pb-2 text-[10px] text-white/50 font-semibold tracking-wider font-sans">0x00 // CONCEPT NOTEBOOK</div>
            <div className="font-sans text-[11px] text-white/40 leading-relaxed">
              Pointers generalize into edges between nodes, building freeform networks. Trees dissolve into cyclic graphs.
            </div>
            <div className="mt-2 text-white/70">
              <span className="text-[#3291ff]">void</span> <span className="text-white">solve</span>() &#123;
              <div className="pl-3 text-white/40">
                adj[u].push_back(v);
              </div>
              &#125;
            </div>
          </div>

          {/* Canvas area (where nodes render) */}
          <div className="flex-1 bg-[#0c0c0e]/30 relative">
            <div className="absolute top-3 right-3 text-[8px] font-mono text-white/10 tracking-widest">CANVAS PANE</div>
          </div>
        </div>
      </motion.div>

      {/* SVG edge lines connecting elements */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <marker
            id="landing-arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 2.5 L 7 5 L 0 7.5 z" fill="var(--color-link)" />
          </marker>
        </defs>

        {links.map((link, idx) => {
          const fromNode = activeCoords[link.from];
          const toNode = activeCoords[link.to];
          if (!fromNode || !toNode) return null;

          // Compute screen offsets centered in 500x500 container
          const center = 250;
          const scaleOffset = activeStage === 6 ? 0.65 : 1;
          const x1 = (fromNode.x * scaleOffset) + center;
          const y1 = (fromNode.y * scaleOffset) + center;
          const x2 = (toNode.x * scaleOffset) + center;
          const y2 = (toNode.y * scaleOffset) + center;

          // Shorten paths slightly to not clip with circles
          const dx = x2 - x1;
          const dy = y2 - y1;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const gap = activeStage === 6 ? 24 : 36;
          const sx1 = distance > 0 ? x1 + (dx / distance) * gap : x1;
          const sy1 = distance > 0 ? y1 + (dy / distance) * gap : y1;
          const sx2 = distance > 0 ? x2 - (dx / distance) * gap : x2;
          const sy2 = distance > 0 ? y2 - (dy / distance) * gap : y2;

          // Highlight BST path searches: A -> C -> E
          let isHighlighted = false;
          if (activeStage === 4 && bstSearchActive) {
            if (bstStep >= 0 && link.from === 'A' && link.to === 'C') isHighlighted = true;
            if (bstStep >= 1 && link.from === 'C' && link.to === 'E') isHighlighted = true;
          }

          return (
            <React.Fragment key={`${link.from}-${link.to}-${idx}`}>
              <motion.line
                initial={{ opacity: 0 }}
                animate={{
                  x1: sx1,
                  y1: sy1,
                  x2: sx2,
                  y2: sy2,
                  opacity: 1,
                }}
                transition={{ type: 'spring', ...spring }}
                stroke={isHighlighted ? 'var(--color-link)' : 'rgba(255,255,255,0.06)'}
                strokeWidth={isHighlighted ? '2' : '1.5'}
                markerEnd={activeStage === 2 ? 'url(#landing-arrow)' : undefined}
              />

              {/* Pulsing signal dot traffic on Graph (Stage 5) */}
              {(activeStage === 5 || activeStage === 6) && distance > 0 && (
                <motion.circle
                  cx={sx1 + (dx / distance) * (distance - 2 * gap) * (graphPulseTime / 100)}
                  cy={sy1 + (dy / distance) * (distance - 2 * gap) * (graphPulseTime / 100)}
                  r="2"
                  fill="var(--color-link)"
                  opacity={0.8}
                />
              )}
            </React.Fragment>
          );
        })}
      </svg>

      {/* Visual representations of constraints (e.g. Stack Chamber borders) */}
      <motion.div
        animate={{
          opacity: activeStage === 3 ? 1 : 0,
          scale: activeStage === 3 ? 1 : 0.8,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
        className="absolute w-[80px] h-[300px] border-l-2 border-r-2 border-b-2 border-white/10 rounded-b-xl bg-white/[0.01] pointer-events-none z-0"
        style={{ transform: 'translateY(16px)' }}
      />

      {/* Array slots visual cells container */}
      <AnimatePresence>
        {activeStage === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          >
            {/* The outer container border/backdrop */}
            <motion.div
              animate={{
                width: arrayInserted ? 408 : 344,
                x: arrayInserted ? 32 : 0,
              }}
              transition={{ type: 'spring', stiffness: 95, damping: 16 }}
              className="absolute h-[72px] border border-white/10 bg-[#0c0c0e]/30 rounded-2xl"
            />

            {/* Individual Slot boxes */}
            {[-128, -64, 0, 64, 128].map((offsetX, idx) => {
              let targetX = offsetX;
              if (arrayInserted && idx >= 1) {
                targetX = offsetX + 64;
              }
              return (
                <motion.div
                  key={idx}
                  animate={{ x: targetX }}
                  transition={{ type: 'spring', stiffness: 95, damping: 16 }}
                  className="absolute w-[58px] h-[58px] border border-white/10 bg-black/40 rounded-xl flex flex-col items-center justify-between py-1"
                >
                  <span className="text-[6.5px] font-mono text-white/20">0x7ffe{String((idx + (arrayInserted && idx >= 1 ? 1 : 0)) * 4).padStart(2, '0')}</span>
                  <span className="text-[8px] font-mono text-white/30">[{idx + (arrayInserted && idx >= 1 ? 1 : 0)}]</span>
                </motion.div>
              );
            })}

            {arrayInserted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -64 }}
                animate={{ opacity: 1, scale: 1, x: -64 }}
                exit={{ opacity: 0, scale: 0.8, x: -64 }}
                transition={{ type: 'spring', stiffness: 95, damping: 16 }}
                className="absolute w-[58px] h-[58px] border border-white/10 bg-black/40 rounded-xl flex flex-col items-center justify-between py-1"
              >
                <span className="text-[6.5px] font-mono text-white/20">0x7ffe04</span>
                <span className="text-[8px] font-mono text-white/30">[1]</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactivity Buttons rendered directly in panels */}
      {/* Array Insertion trigger */}
      <AnimatePresence>
        {activeStage === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 flex gap-2 z-30"
          >
            <button
              onClick={triggerArrayInsert}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#121215]/80 hover:bg-white/[0.03] text-[10px] font-mono tracking-wide text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play size={11} className={isInserting ? 'animate-spin' : ''} />
              <span>Insert [99] at Index 1</span>
            </button>
            {arrayInserted && (
              <button
                onClick={resetArrayInsert}
                className="p-1.5 rounded-lg border border-white/10 bg-[#121215]/80 hover:bg-white/[0.03] text-[#a1a1a1] hover:text-white transition-colors cursor-pointer"
                title="Reset Array"
              >
                <RotateCcw size={11} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BST Traversal Search trigger */}
      <AnimatePresence>
        {activeStage === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 z-30"
          >
            <button
              onClick={triggerBSTSearch}
              disabled={bstSearchActive}
              className="px-3.5 py-1.5 rounded-lg border border-[#3291ff]/30 bg-[#3291ff]/10 hover:bg-[#3291ff]/20 text-[10px] font-mono tracking-wide text-[#3291ff] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Search size={11} className={bstSearchActive ? 'animate-pulse' : ''} />
              <span>Search Target 56</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BST search comparisons HUD */}
      <AnimatePresence>
        {activeStage === 4 && bstStep >= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 border border-[#3291ff]/20 bg-[#0d0d0f]/90 px-3 py-2 rounded-lg text-[10px] font-mono text-center flex flex-col gap-1 z-30 shadow-md"
          >
            <span className="text-[#a1a1a1]">Target: <span className="text-white font-bold">56</span></span>
            {bstStep === 0 && (
              <span className="text-[#3291ff] animate-pulse">Checking Root: 56 &gt; 42 ? Traverse Right</span>
            )}
            {bstStep === 1 && (
              <span className="text-[#3291ff] animate-pulse">Checking Level 1: 56 &lt; 89 ? Traverse Left</span>
            )}
            {bstStep === 2 && (
              <span className="text-emerald-400 font-semibold animate-pulse">Target Found! (3 comparisons)</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extra Node 99 spawned during Array Insertion */}
      <AnimatePresence>
        {activeStage === 1 && arrayInserted && (
          <motion.div
            initial={{ x: -64, y: -100, opacity: 0 }}
            animate={{ x: -64, y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 140, damping: 16 }}
            className="absolute w-[54px] h-[54px] rounded-xl border border-white/15 bg-[#0d0d10] flex flex-col items-center justify-center z-25 shadow-lg"
          >
            <span className="font-sans font-bold text-[16px] text-white">99</span>
            <span className="absolute -bottom-6 text-[9px] font-mono text-white/50 uppercase tracking-wider font-semibold">New</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Unified Morphing Data Structure Nodes */}
      {nodeMetaData.map((node) => {
        const coord = activeCoords[node.id] || { x: 0, y: 0 };
        const scaleVal = activeStage === 6 ? 0.65 : 1;

        // Apply a gentle floating drift in Stage 0 (Hero)
        const isHero = activeStage === 0;

        // Determine if this node is currently highlighted in traversal path (Stage 4 BST search)
        let isFocused = false;
        if (activeStage === 4) {
          if (bstStep === 0 && node.id === 'A') isFocused = true;
          if (bstStep === 1 && node.id === 'C') isFocused = true;
          if (bstStep === 2 && node.id === 'E') isFocused = true;
        }

        return (
          <motion.div
            key={node.id}
            animate={{
              x: isHero ? coord.x : coord.x * scaleVal,
              y: isHero ? coord.y : coord.y * scaleVal,
              scale: scaleVal,
            }}
            transition={{
              type: 'spring',
              ...spring,
            }}
            style={
              isHero
                ? {
                    animation: `ambientFloat-${node.id} ${4 + nodeMetaData.indexOf(node) * 0.8}s ease-in-out infinite alternate`,
                  }
                : {}
            }
            className={`absolute w-[54px] h-[54px] rounded-xl border flex flex-col items-center justify-center z-20 shadow-lg select-none transition-all duration-200 ${
              isFocused
                ? 'border-white bg-[#1a1a20] shadow-[0_0_16px_rgba(255,255,255,0.08)]'
                : 'border-white/15 bg-[#0d0d10] hover:border-white/30'
            }`}
          >
            {/* Ambient float keyframes styles injected locally */}
            {isHero && (
              <style>{`
                @keyframes ambientFloat-A { 0% { transform: translate(-3px, -2px); } 100% { transform: translate(3px, 2px); } }
                @keyframes ambientFloat-B { 0% { transform: translate(2px, -3px); } 100% { transform: translate(-2px, 3px); } }
                @keyframes ambientFloat-C { 0% { transform: translate(-2px, 2px); } 100% { transform: translate(2px, -2px); } }
                @keyframes ambientFloat-D { 0% { transform: translate(3px, -1px); } 100% { transform: translate(-3px, 1px); } }
                @keyframes ambientFloat-E { 0% { transform: translate(-1px, 3px); } 100% { transform: translate(1px, -3px); } }
              `}</style>
            )}

            {/* Cell Value */}
            <span className="font-sans font-bold text-[16px] text-white">
              {node.value}
            </span>

            {/* Helper address label for Linked List */}
            {activeStage === 2 && (
              <span className="text-[8px] font-mono text-[#a1a1a1]/40 mt-0.5">
                {node.label}
              </span>
            )}

            {/* Head/Tail label overlays for Linked List */}
            {activeStage === 2 && node.id === 'A' && (
              <span className="absolute -top-6 text-[9px] font-mono text-[#3291ff] tracking-widest uppercase font-semibold">
                Head
              </span>
            )}
            {activeStage === 2 && node.id === 'E' && (
              <span className="absolute -top-6 text-[9px] font-mono text-[#6f6f6f] tracking-widest uppercase">
                Tail
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
    </div>
  );
};
