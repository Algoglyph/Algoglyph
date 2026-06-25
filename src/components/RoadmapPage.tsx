import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Compass, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Lock, 
  Activity, 
  Code
} from 'lucide-react';
import { ROADMAP_ZONES } from '../config/roadmapData';
import type { SubConcept } from '../config/roadmapData';
import { useWorkspaceStore } from '../store/workspaceStore';

interface RoadmapPageProps {
  onBack: () => void;
  onLaunch: () => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

// ── Node Coordinates database for the 10 spatial stages (15 Nodes) ──
// 0: Hero, 1: Foundations, 2: Memory, 3: Arrays, 4: Linked Lists, 5: Stacks/Queues, 6: Trees, 7: Graphs, 8: Algorithms, 9: Advanced
const NODE_COORDINATES: Record<number, Point3D[]> = {
  0: Array.from({ length: 15 }, (_, i) => {
    // Stage 0: Large floating ring far away
    const angle = (i / 15) * Math.PI * 2;
    return {
      x: Math.cos(angle) * 220,
      y: Math.sin(angle) * 220,
      z: 200,
      color: i % 3 === 0 ? '#3291ff' : '#ffffff',
      size: i % 3 === 0 ? 4 : 2
    };
  }),
  1: Array.from({ length: 15 }, (_, i) => {
    // Stage 1: Grid floor layout (flat bottom surface)
    const row = Math.floor(i / 5);
    const col = i % 5;
    return {
      x: (col - 2) * 110,
      y: 120 + row * 20,
      z: -100 + row * 100,
      color: '#ffffff',
      size: 1.5
    };
  }),
  2: Array.from({ length: 15 }, (_, i) => {
    // Stage 2: Memory Stack (vertical left) & Heap (scattered right)
    const isStack = i < 6;
    if (isStack) {
      // Left vertical stack frame slots
      return {
        x: -160,
        y: -100 + i * 40,
        z: 0,
        color: '#3291ff',
        size: 3.5
      };
    } else {
      // Right heap scattered pointers
      const seed = i * 2.3;
      return {
        x: 100 + Math.sin(seed) * 80,
        y: -80 + Math.cos(seed * 1.5) * 120,
        z: Math.sin(seed * 2) * 150,
        color: '#ffffff',
        size: 2
      };
    }
  }),
  3: Array.from({ length: 15 }, (_, i) => {
    // Stage 3: Contiguous static Array (straight horizontal line)
    return {
      x: -280 + i * 40,
      y: 0,
      z: 0,
      color: i === 4 || i === 9 ? '#3291ff' : '#ffffff',
      size: i === 4 || i === 9 ? 4 : 2.5
    };
  }),
  4: Array.from({ length: 15 }, (_, i) => {
    // Stage 4: Linked Lists (floating fluid node chain)
    const seed = i * 1.8;
    return {
      x: -250 + i * 36,
      y: Math.sin(seed) * 50,
      z: Math.cos(seed * 0.8) * 80,
      color: i === 0 ? '#3291ff' : i === 14 ? '#888888' : '#ffffff',
      size: 3
    };
  }),
  5: Array.from({ length: 15 }, (_, i) => {
    // Stage 5: Stacks & Queues vertical pile morphing
    // Standard stack structure (nodes aligned vertically)
    return {
      x: 0,
      y: 180 - i * 26,
      z: 0,
      color: i >= 12 ? '#3291ff' : '#ffffff',
      size: 3
    };
  }),
  6: Array.from({ length: 15 }, (_, i) => {
    // Stage 6: Binary Search Tree (root, children, sub-children)
    // 0: Root, 1-2: Level 1, 3-6: Level 2, 7-14: Level 3
    let level = 0;
    let offset = 0;
    if (i === 0) { level = 0; offset = 0; }
    else if (i <= 2) { level = 1; offset = i === 1 ? -1 : 1; }
    else if (i <= 6) { level = 2; offset = i === 3 ? -1.5 : i === 4 ? -0.5 : i === 5 ? 0.5 : 1.5; }
    else { level = 3; offset = (i - 10.5) * 0.5; }

    return {
      x: offset * 180,
      y: -120 + level * 80,
      z: -level * 40,
      color: i === 0 ? '#3291ff' : '#ffffff',
      size: 3.5 - level * 0.5
    };
  }),
  7: Array.from({ length: 15 }, (_, i) => {
    // Stage 7: Graphs (relational circular mesh)
    const angle = (i / 15) * Math.PI * 2;
    const r = 180;
    return {
      x: Math.cos(angle) * r + (i % 2 === 0 ? 20 : -20),
      y: Math.sin(angle) * r + (i % 3 === 0 ? -15 : 15),
      z: Math.sin(angle * 3) * 120,
      color: i % 4 === 0 ? '#3291ff' : '#ffffff',
      size: 3
    };
  }),
  8: Array.from({ length: 15 }, (_, i) => {
    // Stage 8: Algorithms (parallel pipelines)
    const track = i % 3;
    const pos = Math.floor(i / 3);
    return {
      x: -200 + pos * 90,
      y: -80 + track * 80,
      z: 0,
      color: (pos === 2 && track === 1) || (pos === 4 && track === 0) ? '#3291ff' : '#ffffff',
      size: 3
    };
  }),
  9: Array.from({ length: 15 }, (_, i) => {
    // Stage 9: Advanced (drift horizon constellation)
    const seed = i * 4.5;
    return {
      x: Math.sin(seed) * 400,
      y: Math.cos(seed * 1.3) * 300,
      z: -400 + i * 50,
      color: i % 5 === 0 ? '#3291ff' : '#ffffff',
      size: i % 5 === 0 ? 5 : 1.5
    };
  })
};

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onBack, onLaunch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedConcept, setSelectedConcept] = useState<SubConcept | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'py'>('py');

  const addVisualizerNode = useWorkspaceStore((state) => state.addVisualizerNode);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const roadmapProgress = useWorkspaceStore((state) => state.roadmapProgress);
  const updateRoadmapProgress = useWorkspaceStore((state) => state.updateRoadmapProgress);

  // ── Scroll Engine ──
  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  // ── Intercept and Map Scroll Progress to Curriculum Sections ──
  const [activeZoneIndex, setActiveZoneIndex] = useState<number>(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const ids = ['hero-section', ...ROADMAP_ZONES.map(z => z.id), 'exit-section'];
      let activeIdx = 0;
      let minDistance = Infinity;
      const viewportMid = window.innerHeight / 2;

      ids.forEach((id, idx) => {
        const child = document.getElementById(id);
        if (!child) return;
        const rect = child.getBoundingClientRect();
        const childMid = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(childMid - viewportMid);
        if (distance < minDistance) {
          minDistance = distance;
          activeIdx = idx;
        }
      });
      setActiveZoneIndex(activeIdx);
    };
    el.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Immersive Scene Renderer (3D Coordinate Interpolation) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const displayWidth = width / window.devicePixelRatio;
      const displayHeight = height / window.devicePixelRatio;
      ctx.translate(displayWidth / 2, displayHeight / 2);

      // Get current scroll-linked progress (0 to 9)
      const currentScroll = scrollYProgress.get();
      const currentProgress = currentScroll * 9;
      const baseStage = Math.floor(currentProgress);
      const nextStage = Math.min(9, baseStage + 1);
      const fraction = currentProgress - baseStage;

      // Base rotations
      const time = Date.now() * 0.0006;
      let rotX = Math.sin(time * 0.2) * 0.15;
      let rotY = time * 0.25;

      // Adjust rotation by scroll speed
      rotY += currentScroll * Math.PI * 2;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Interpolated 3D nodes
      const baseNodes = NODE_COORDINATES[baseStage] || NODE_COORDINATES[0];
      const nextNodes = NODE_COORDINATES[nextStage] || NODE_COORDINATES[0];

      const projected = baseNodes.map((n, i) => {
        const nextNode = nextNodes[i] || n;

        // Linear interpolation of coordinates
        const interpX = n.x + (nextNode.x - n.x) * fraction;
        const interpY = n.y + (nextNode.y - n.y) * fraction;
        const interpZ = n.z + (nextNode.z - n.z) * fraction;

        // Apply 3D Rotations
        // Y-axis rotation
        let rx1 = interpX * cosY - interpZ * sinY;
        let rz1 = interpZ * cosY + interpX * sinY;

        // X-axis rotation
        let ry2 = interpY * cosX - rz1 * sinX;
        let rz2 = rz1 * cosX + interpY * sinX;

        // Perspective Projection
        const fov = 420;
        const scale = fov / (fov + rz2);
        const projX = rx1 * scale;
        const projY = ry2 * scale;

        return {
          x: projX,
          y: projY,
          z: rz2,
          scale,
          color: n.color,
          size: n.size
        };
      });

      // ── Stage-Specific Architectural Overlays (Atmospheres) ──
      
      // 1. Foundations (Laser Grid Floor)
      if (baseStage === 1 || nextStage === 1) {
        const gridAlpha = baseStage === 1 
          ? (1 - fraction) * 0.25 
          : fraction * 0.25;
          
        ctx.strokeStyle = `rgba(255, 255, 255, ${gridAlpha})`;
        ctx.lineWidth = 0.5;

        // Draw perspective grid lines converging to horizon
        const horizon = 60;
        const widthHalf = displayWidth / 2;

        for (let x = -widthHalf; x <= widthHalf; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x * 0.1, horizon);
          ctx.lineTo(x, displayHeight);
          ctx.stroke();
        }
        for (let y = horizon; y < displayHeight; y += 25) {
          const ratio = (y - horizon) / (displayHeight - horizon);
          ctx.beginPath();
          ctx.moveTo(-widthHalf * ratio, y);
          ctx.lineTo(widthHalf * ratio, y);
          ctx.stroke();
        }
      }

      // 2. Memory Stack Box Outline
      if (baseStage === 2 || nextStage === 2) {
        const memoryAlpha = baseStage === 2
          ? (1 - fraction) * 0.18
          : fraction * 0.18;

        // Draw left stack structural pipe boundary
        ctx.strokeStyle = `rgba(50, 145, 255, ${memoryAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-200, -130, 80, 260);

        // Label register stacks
        ctx.fillStyle = `rgba(255, 255, 255, ${memoryAlpha * 0.6})`;
        ctx.font = '7px monospace';
        ctx.fillText('0x7FFF // CALL STACK', -195, -140);
        ctx.fillText('DYNAMIC HEAP REGISTERS', 80, -140);
      }

      // 3. Array Segment Borders
      if (baseStage === 3 || nextStage === 3) {
        const arrayAlpha = baseStage === 3
          ? (1 - fraction) * 0.2
          : fraction * 0.2;

        ctx.strokeStyle = `rgba(255, 255, 255, ${arrayAlpha})`;
        ctx.lineWidth = 1;
        
        // Draw surrounding contiguous cells box
        ctx.strokeRect(-300, -30, 600, 60);

        // Draw internal dividers
        for (let i = 1; i < 15; i++) {
          const x = -300 + i * 40;
          ctx.beginPath();
          ctx.moveTo(x, -30);
          ctx.lineTo(x, 30);
          ctx.stroke();
        }

        // Draw index tags
        ctx.fillStyle = `rgba(255, 255, 255, ${arrayAlpha * 0.5})`;
        ctx.font = '8px monospace';
        projected.forEach((p, idx) => {
          ctx.fillText(`[${idx}]`, p.x - 6, p.y + 40);
        });
      }

      // 4. Linked List Pointer Vector Lines
      if (baseStage === 4 || nextStage === 4) {
        const listAlpha = baseStage === 4
          ? (1 - fraction) * 0.3
          : fraction * 0.3;

        ctx.strokeStyle = `rgba(255, 255, 255, ${listAlpha * 0.6})`;
        ctx.lineWidth = 1.2;

        // Draw connections with arrows
        for (let i = 0; i < projected.length - 1; i++) {
          const from = projected[i];
          const to = projected[i + 1];
          
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();

          // Draw vector arrow midway
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          const angle = Math.atan2(to.y - from.y, to.x - from.x);
          
          ctx.fillStyle = `rgba(50, 145, 255, ${listAlpha})`;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX - 6 * Math.cos(angle - 0.5), midY - 6 * Math.sin(angle - 0.5));
          ctx.lineTo(midX - 6 * Math.cos(angle + 0.5), midY - 6 * Math.sin(angle + 0.5));
          ctx.closePath();
          ctx.fill();
        }
      }

      // 5. Stacks & Queues Enclosure Pipes
      if (baseStage === 5 || nextStage === 5) {
        const pipeAlpha = baseStage === 5
          ? (1 - fraction) * 0.15
          : fraction * 0.15;

        ctx.strokeStyle = `rgba(255, 255, 255, ${pipeAlpha})`;
        ctx.lineWidth = 1.5;
        
        // Draw vertical LIFO cylinder
        ctx.beginPath();
        ctx.moveTo(-35, -200);
        ctx.lineTo(-35, 200);
        ctx.lineTo(35, 200);
        ctx.lineTo(35, -200);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${pipeAlpha * 0.5})`;
        ctx.font = '8px monospace';
        ctx.fillText('LIFO TUBE (SINGLE ACCESS PORT)', -70, -210);
      }

      // 6. Tree Hierarchical Branch Links
      if (baseStage === 6 || nextStage === 6) {
        const treeAlpha = baseStage === 6
          ? (1 - fraction) * 0.4
          : fraction * 0.4;

        ctx.strokeStyle = `rgba(255, 255, 255, ${treeAlpha * 0.5})`;
        ctx.lineWidth = 1;

        // Tree structure relations: Parent-Child line links
        const links = [
          { f: 0, t: 1 }, { f: 0, t: 2 },
          { f: 1, t: 3 }, { f: 1, t: 4 },
          { f: 2, t: 5 }, { f: 2, t: 6 },
          { f: 3, t: 7 }, { f: 3, t: 8 },
          { f: 4, t: 9 }, { f: 4, t: 10 },
          { f: 5, t: 11 }, { f: 5, t: 12 },
          { f: 6, t: 13 }, { f: 6, t: 14 }
        ];

        links.forEach(l => {
          const fromNode = projected[l.f];
          const toNode = projected[l.t];
          if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
          }
        });
      }

      // 7. Graph Relational Web Network
      if (baseStage === 7 || nextStage === 7) {
        const graphAlpha = baseStage === 7
          ? (1 - fraction) * 0.25
          : fraction * 0.25;

        ctx.lineWidth = 0.5;
        // Connecting nearest neighbors dynamically to form circular mesh graph
        for (let i = 0; i < projected.length; i++) {
          const from = projected[i];
          for (let j = i + 1; j < projected.length; j++) {
            const to = projected[j];
            const dist = Math.hypot(from.x - to.x, from.y - to.y);
            if (dist < 140) {
              const alpha = (1 - dist / 140) * graphAlpha;
              ctx.strokeStyle = i % 4 === 0 
                ? `rgba(50, 145, 255, ${alpha})` 
                : `rgba(255, 255, 255, ${alpha * 0.6})`;
              ctx.beginPath();
              ctx.moveTo(from.x, from.y);
              ctx.lineTo(to.x, to.y);
              ctx.stroke();
            }
          }
        }
      }

      // 8. Algorithms Sorting Pipelines
      if (baseStage === 8 || nextStage === 8) {
        const sortingAlpha = baseStage === 8
          ? (1 - fraction) * 0.15
          : fraction * 0.15;

        ctx.strokeStyle = `rgba(255, 255, 255, ${sortingAlpha})`;
        ctx.lineWidth = 1;

        // Draw three parallel horizontal tracks
        for (let track = 0; track < 3; track++) {
          const y = -80 + track * 80;
          ctx.beginPath();
          ctx.moveTo(-displayWidth / 2, y);
          ctx.lineTo(displayWidth / 2, y);
          ctx.stroke();
        }
      }

      // Draw projected nodes
      projected.forEach(p => {
        const radius = p.size * p.scale;
        if (radius <= 0) return;

        // Depth-based shading
        const depthAlpha = Math.max(0.1, Math.min(1, 1 - (p.z + 150) / 450));
        ctx.fillStyle = p.color === '#3291ff' 
          ? `rgba(50, 145, 255, ${depthAlpha})` 
          : `rgba(255, 255, 255, ${depthAlpha * 0.65})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw ring around primary accents
        if (p.color === '#3291ff') {
          ctx.strokeStyle = `rgba(50, 145, 255, ${depthAlpha * 0.45})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollYProgress]);

  // Jump to specific spatial zone section
  const handleScrollToZone = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Launch workspace with active algorithm selected
  const handleLaunchConcept = (concept: SubConcept) => {
    if (concept.visualizerId) {
      useWorkspaceStore.getState().clearVisualizerNodes();
      addVisualizerNode(concept.visualizerId, 100, 100);
      setLayoutMode('visualizer');
      onLaunch();
    } else {
      onLaunch();
    }
  };

  // Get Difficulty Color Tags
  const getDifficultyColor = (diff: 'Easy' | 'Medium' | 'Hard') => {
    if (diff === 'Easy') return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';
    if (diff === 'Medium') return 'border-amber-500/20 text-amber-400 bg-amber-500/5';
    return 'border-rose-500/20 text-rose-400 bg-rose-500/5';
  };

  return (
    <div 
      className="relative w-full h-screen bg-black text-[#ededed] select-none font-sans antialiased overflow-hidden"
    >
      {/* ── Fixed Spatial Viewport Shell (Backdrop canvas) ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none z-0">
        {/* Pure 3D custom Canvas grid matching the OLED CS theme */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(5,5,8,0.25)_0%,#000000_90%)] pointer-events-none z-5" />
      </div>

      {/* ── Scroll Progress Bar ── */}
      <motion.div 
        className="fixed top-20 left-0 right-0 h-[2px] bg-[#3291ff] z-40 transform-origin-left pointer-events-none" 
        style={{ scaleX: scrollYProgress }}
      />

      {/* ── Left-Fixed Timeline Track (Needs pointer-events-auto to click dots) ── */}
      <nav className="fixed left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-5 z-35 font-mono text-[10px] text-white/40 max-w-[200px] pointer-events-auto">
        {ROADMAP_ZONES.map((zone, idx) => {
          // Shift index by 1 to skip Hero (activeZoneIndex maps to 0..10)
          const isActive = idx === activeZoneIndex - 1;
          return (
            <button
              key={zone.id}
              onClick={() => handleScrollToZone(zone.id)}
              className="flex items-center gap-4 text-left group cursor-pointer transition-colors"
            >
              <span className={`w-6 text-[10px] font-mono font-bold tracking-tight text-right ${isActive ? 'text-[#3291ff]' : 'text-white/20 group-hover:text-white/40'}`}>
                {zone.number}
              </span>
              <div className="relative w-1.5 h-6 flex items-center justify-center">
                <div className={`absolute top-0 bottom-0 w-px ${isActive ? 'bg-[#3291ff]' : 'bg-white/5 group-hover:bg-white/10'} transition-all`} />
                {isActive && (
                  <motion.div 
                    layoutId="timeline-tracker-dot"
                    className="absolute w-2 h-2 rounded-full bg-[#3291ff] shadow-[0_0_8px_#3291ff]" 
                  />
                )}
              </div>
              <span className={`transition-all duration-300 truncate max-w-[140px] font-sans text-[12px] font-medium ${isActive ? 'text-[#ededed] translate-x-1' : 'text-white/30 group-hover:text-white/60'}`}>
                {zone.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Top Header Toolbar (Needs pointer-events-auto to click buttons) ── */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/[0.03] bg-black/35 backdrop-blur-md z-40 flex items-center justify-between px-6 sm:px-12 pointer-events-auto">
        <button
           onClick={onBack}
           className="group flex items-center gap-3 text-[13px] font-mono tracking-widest text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
          </div>
          <span className="font-sans font-medium text-white/70 group-hover:text-white transition-colors">Return</span>
        </button>

        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex justify-center items-center pl-6 sm:pl-8 xl:pl-[210px] pr-6 sm:pr-8 md:pr-8">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3291ff] animate-pulse" />
            <span className="font-mono text-[10px] text-white/40 tracking-[0.1em] font-semibold uppercase">Spatial Curriculum</span>
          </div>
        </div>

        <button
          onClick={onLaunch}
          className="group px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-sans shadow-[0_1px_3px_rgba(255,255,255,0.2)]"
        >
          <span>Open Workspace</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </header>

      {/* ── Scrollable Sections (Scrolls naturally in Z-space above canvas) ── */}
      <div 
        ref={containerRef} 
        className="relative z-10 w-full h-screen overflow-y-auto flex flex-col pl-6 sm:pl-8 xl:pl-[210px] pr-6 sm:pr-8 md:pr-8"
      >
         
        {/* Hero Section */}
        <section 
          id="hero-section" 
          className="w-full h-screen shrink-0 flex items-center justify-center text-center relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
              <Compass size={11} className="text-[#3291ff] animate-spin-slow" />
              <span className="text-[10px] font-mono text-white/50 tracking-[0.1em] font-semibold uppercase">Interactive Learning Platform</span>
            </div>

            <h1 className="font-sans text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.03em] text-[#ededed] leading-[1.05] select-none">
              Computer Science <br/>
              <span className="bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent font-light">Spatial Journey</span>
            </h1>

            <p className="text-[15px] sm:text-[17px] leading-[1.65] text-[#a1a1a1] max-w-[620px] select-none font-sans font-normal">
              Deconstruct complex algorithms and data structures through a visual, physical feedback loop. Move through continuous registers, stacks, and meshes.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => handleScrollToZone(ROADMAP_ZONES[0].id)}
                className="group px-7 py-3 rounded-full border border-white/10 hover:border-white/25 bg-white/[0.02] text-[13.5px] font-semibold text-white/80 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>Begin Journey</span>
                <ArrowRight size={13} className="opacity-60 group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* Curriculum Zones */}
        {ROADMAP_ZONES.map((zone) => {
          const zoneStatus = (() => {
            const statuses = zone.subConcepts.map(c => roadmapProgress[c.name] || c.learningStatus || 'Not Started');
            if (statuses.every(s => s === 'Completed')) return 'Completed';
            if (statuses.every(s => s === 'Not Started')) return 'Not Started';
            return 'In Progress';
          })();

          return (
            <section
              key={zone.id}
              id={zone.id}
              className="w-full min-h-screen shrink-0 flex items-start justify-center relative py-32 md:py-40"
            >
              <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-10 gap-10 xl:gap-12 items-start">
                 
                {/* Left block - Concept description */}
                <div className="lg:col-span-5 flex flex-col gap-6 text-left lg:sticky lg:top-[30vh] pb-10">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#3291ff] text-[22px] font-bold">{zone.number}</span>
                    <div className="h-px w-8 bg-white/10" />
                    <span className={`text-[10px] font-mono border px-2.5 py-0.5 rounded-full font-semibold ${getDifficultyColor(zone.difficulty)}`}>
                      {zone.difficulty}
                    </span>
                  </div>

                  <h2 className="font-sans text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.03em] text-[#ededed] leading-[1.05]">
                    {zone.name}
                  </h2>

                  <p className="text-[15.5px] leading-relaxed text-[#a1a1a1] font-sans font-normal">
                    {zone.description}
                  </p>

                  {/* Zone Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/[0.04] pt-5 font-mono">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/30 font-semibold tracking-wide uppercase">Estimate</span>
                      <span className="text-[13px] text-white/80 font-bold flex items-center gap-1.5">
                        <Clock size={12} className="text-[#3291ff]" />
                        {zone.hours} hrs
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/30 font-semibold tracking-wide uppercase">Status</span>
                      <span className="text-[13px] text-white/80 font-bold flex items-center gap-1.5">
                        {zoneStatus === 'Completed' ? (
                          <CheckCircle2 size={12} className="text-emerald-400" />
                        ) : zoneStatus === 'In Progress' ? (
                          <Activity size={12} className="text-[#3291ff]" />
                        ) : (
                          <Lock size={12} className="text-white/20" />
                        )}
                        <span className="text-[11px] font-sans">{zoneStatus}</span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/30 font-semibold tracking-wide uppercase">Sandbox</span>
                      <span className="text-[13px] text-white/80 font-bold font-sans">
                        {zone.visualizerAvailable ? 'Supported' : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right block - Subconcepts interactive matrix */}
                <div className="lg:col-span-5 flex flex-col gap-6 pb-20 lg:relative lg:left-[3px]">
                  {zone.subConcepts.map((concept, cIdx) => {
                    const subStatus = roadmapProgress[concept.name] || concept.learningStatus || 'Not Started';
                    const isSel = selectedConcept?.name === concept.name;

                    return (
                      <div 
                        key={cIdx}
                        onClick={() => setSelectedConcept(isSel ? null : concept)}
                        className={`group border rounded-3xl p-5 text-left cursor-pointer transition-all duration-500 relative overflow-hidden ${
                          isSel 
                            ? 'border-white bg-[#060608] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.5)]'
                            : 'border-white/[0.04] bg-[#030304]/60 hover:border-white/15'
                        }`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.005),transparent_60%)] pointer-events-none" />

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-[#3291ff] font-bold">Concept 0{cIdx + 1}</span>
                            <h3 className="font-sans font-semibold text-[16px] text-[#ededed] group-hover:text-[#3291ff] transition-colors duration-300">
                              {concept.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full ${getDifficultyColor(concept.difficulty)}`}>
                              {concept.difficulty}
                            </span>
                            <span className={`text-[9px] font-sans border px-2 py-0.5 rounded-full ${
                              subStatus === 'Completed'
                                ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                                : subStatus === 'In Progress'
                                  ? 'border-[#3291ff]/20 text-[#3291ff] bg-[#3291ff]/5'
                                  : 'border-white/5 text-white/30 bg-white/[0.01]'
                            }`}>
                              {subStatus}
                            </span>
                          </div>
                        </div>

                        <p className="text-[13px] leading-relaxed text-[#888] mt-2 font-sans font-normal">
                          {concept.desc}
                        </p>

                        {/* Staggered bullet points metrics */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {concept.keyPoints.map((pt, pIdx) => (
                            <span 
                              key={pIdx}
                              className="px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.02] text-[9.5px] font-mono text-white/50"
                            >
                              # {pt}
                            </span>
                          ))}
                        </div>

                        {/* Expanded details layer (Code preview, Sandbox launcher, Status picker) */}
                        <AnimatePresence>
                          {isSel && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden mt-4 pt-4 border-t border-white/[0.05]"
                              onClick={(e) => e.stopPropagation()} // Stop bubble event
                            >
                              <div className="flex flex-col gap-3">
                                 
                                {/* Status Selector */}
                                <div className="flex items-center justify-between text-[9.5px] font-mono text-white/30 px-1 border-b border-white/[0.03] pb-2">
                                  <span>Learning Progress</span>
                                  <div className="flex gap-1.5">
                                    {(['Not Started', 'In Progress', 'Completed'] as const).map((status) => {
                                      const activeSubStatus = roadmapProgress[concept.name] || concept.learningStatus || 'Not Started';
                                      const isStatusSel = activeSubStatus === status;
                                      return (
                                        <button
                                          key={status}
                                          onClick={() => updateRoadmapProgress(concept.name, status)}
                                          className={`px-2 py-0.5 rounded border transition-all cursor-pointer font-sans text-[10px] ${
                                            isStatusSel
                                              ? 'border-white/20 bg-white/10 text-white font-semibold'
                                              : 'border-white/5 bg-white/[0.02] text-white/40 hover:text-white/60'
                                          }`}
                                        >
                                          {status}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {concept.codePreview && (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[9px] font-mono text-white/30 uppercase tracking-widest px-1">
                                      <span>Structure Representation</span>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => setSelectedLanguage('cpp')}
                                          className={`hover:text-white cursor-pointer ${selectedLanguage === 'cpp' ? 'text-[#3291ff]' : ''}`}
                                        >
                                          C++
                                        </button>
                                        <span>/</span>
                                        <button 
                                          onClick={() => setSelectedLanguage('py')}
                                          className={`hover:text-white cursor-pointer ${selectedLanguage === 'py' ? 'text-[#3291ff]' : ''}`}
                                        >
                                          Python
                                        </button>
                                      </div>
                                    </div>
                                    <div className="relative rounded-xl border border-white/5 bg-black/60 p-3 font-mono text-[10.5px] leading-[1.5] text-white/80 max-h-[300px] overflow-auto custom-scrollbar">
                                      <Code className="absolute top-2.5 right-2.5 text-white/10" size={12} />
                                      <pre className="text-left">
                                        {selectedLanguage === 'cpp' 
                                          ? concept.codePreview 
                                          : (concept.codePreviewPython || concept.codePreview)
                                        }
                                      </pre>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-1.5 pt-2 border-t border-white/[0.03]">
                                  <div className="flex items-center gap-1 text-[9.5px] font-mono text-white/30">
                                    <span>Estimated: </span>
                                    <span className="text-white font-bold">{concept.hours} hours</span>
                                  </div>

                                  <button
                                    onClick={() => handleLaunchConcept(concept)}
                                    className="group px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] text-[10.5px] font-semibold text-white/90 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-sans"
                                  >
                                    {concept.visualizerId ? (
                                      <>
                                        <Play size={10} className="text-[#3291ff]" />
                                        <span>Launch Interactive Visualizer</span>
                                      </>
                                    ) : (
                                      <>
                                        <BookOpen size={10} className="text-[#3291ff]" />
                                        <span>Explore in Workspace</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>
          );
        })}

        {/* Exit Section */}
        <section 
          id="exit-section" 
          className="w-full h-screen shrink-0 flex items-center justify-center text-center relative overflow-hidden"
        >
          <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-6">
             <h2 className="font-sans text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#ededed] leading-none select-none">
              Ready to explore? <br/>
              <span className="font-light text-white/30 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent font-light">Enter the Sandbox</span>
            </h2>
            <p className="text-[14.5px] leading-relaxed text-[#a1a1a1] max-w-md select-none font-sans">
              Jump directly into the workspace canvas. Draw nodes, compile algorithms, and test edge cases.
            </p>

            <div className="flex gap-4 mt-2">
              <button
                onClick={onLaunch}
                className="px-6.5 py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-[13px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer font-sans shadow-[0_1px_2px_rgba(255,255,255,0.15)]"
              >
                <span>Launch Workspace</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={onBack}
                className="px-6.5 py-3 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.01] text-[13px] font-semibold text-white/80 hover:text-white transition-all cursor-pointer font-sans"
              >
                <span>Back to Portal</span>
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Scroll tracker helper on the bottom */}
      {activeZoneIndex < 9 && (
        <div className="fixed bottom-6 left-6 sm:left-8 xl:left-[210px] right-6 sm:right-8 md:right-8 flex justify-center pointer-events-none select-none z-30">
          <div className="flex flex-col items-center gap-1.5 opacity-25">
            <span className="font-mono text-[8px] uppercase tracking-widest text-white">Scroll to travel</span>
            <div className="w-[1px] h-4 bg-white" />
          </div>
        </div>
      )}

      {/* Ambient float styles & scroll bar hiding */}
      <style>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  );
};
