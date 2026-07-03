import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ROADMAP_ZONES } from '../config/roadmapData';

interface RoadmapConvergenceProps {
  roadmapProgress: Record<string, 'Not Started' | 'In Progress' | 'Completed'>;
  onLaunch: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  kind: 'root' | 'zone';
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
  zoneId?: string;
}

interface GraphEdge {
  a: string;
  b: string;
  targetLength: number;
}

const RADIUS: Record<GraphNode['kind'], number> = {
  root: 11,
  zone: 8
};

const BASE_ALPHA: Record<GraphNode['kind'], number> = {
  root: 1,
  zone: 0.9
};

export const RoadmapConvergence: React.FC<RoadmapConvergenceProps> = ({
  roadmapProgress,
  onLaunch,
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const queryRef = useRef('');
  useEffect(() => {
    queryRef.current = query.trim().toLowerCase();
  }, [query]);

  // Compute status metrics for each zone
  const zoneStats = useMemo(() => {
    return ROADMAP_ZONES.map((zone) => {
      const subtopics = zone.topics.flatMap((t) =>
        t.concepts.flatMap((c) => c.subtopics)
      );
      if (subtopics.length === 0) return { status: 'Not Started', color: '#52525b' };
      const statuses = subtopics.map(
        (s) => roadmapProgress[s.name] || 'Not Started'
      );
      const completedCount = statuses.filter((st) => st === 'Completed').length;
      let status = 'Not Started';
      let color = '#52525b'; // gray

      if (completedCount === subtopics.length) {
        status = 'Completed';
        color = '#10b981'; // emerald
      } else if (completedCount > 0 || statuses.some((st) => st === 'In Progress')) {
        status = 'In Progress';
        color = '#f59e0b'; // amber
      }
      return { status, color };
    });
  }, [roadmapProgress]);

  // Build the node and edge lists
  const { nodes, edges } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const edgeList: GraphEdge[] = [];
    const rootId = 'root';
    
    // Add central root anchor
    nodeList.push({
      id: rootId,
      label: 'Computer Science',
      kind: 'root',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0
    });

    // Add curriculum zone nodes in a surrounding ring
    ROADMAP_ZONES.forEach((zone, i) => {
      const angle = (i / ROADMAP_ZONES.length) * Math.PI * 2;
      const zoneNodeId = `zone:${zone.id}`;
      
      nodeList.push({
        id: zoneNodeId,
        label: `${zone.number}. ${zone.name}`,
        kind: 'zone',
        x: Math.cos(angle) * 190,
        y: Math.sin(angle) * 190,
        vx: 0,
        vy: 0,
        zoneId: zone.id
      });

      // Connect each zone to central curriculum hub
      edgeList.push({ a: rootId, b: zoneNodeId, targetLength: 190 });
    });

    // Wire up sequence and triangulated mesh connections between zones
    // const numZones = ROADMAP_ZONES.length;
    // for (let i = 0; i < numZones; i++) {
    //   const nextId = `zone:${ROADMAP_ZONES[(i + 1) % numZones].id}`;
    //   const skipId = `zone:${ROADMAP_ZONES[(i + 2) % numZones].id}`;
    //   const currId = `zone:${ROADMAP_ZONES[i].id}`;

    //   // edgeList.push({ a: currId, b: nextId, targetLength: 120 }); // removed internode connections
    //   // edgeList.push({ a: currId, b: skipId, targetLength: 210 }); // removed internode connections
    // }

    return { nodes: nodeList, edges: edgeList };
  }, []);

  // Set up force directed simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.offsetWidth;
      height = wrap.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(wrap);
    resize();

    const byId = new Map(nodes.map((n) => [n.id, n]));
    const neighbors = new Map<string, Set<string>>();
    nodes.forEach((n) => neighbors.set(n.id, new Set()));
    edges.forEach((e) => {
      neighbors.get(e.a)?.add(e.b);
      neighbors.get(e.b)?.add(e.a);
    });

    // Central anchor remains anchored
    const rootNode = byId.get('root');
    if (rootNode) {
      rootNode.fx = 0;
      rootNode.fy = 0;
    }

    let hoveredId: string | null = null;
    let draggingId: string | null = null;
    let pointerDownAt: { x: number; y: number } | null = null;
    let dragMoved = false;

    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left - width / 2,
        y: clientY - rect.top - height / 2
      };
    };

    const nodeAt = (lx: number, ly: number): GraphNode | null => {
      let best: GraphNode | null = null;
      let bestD2 = Infinity;
      for (const n of nodes) {
        const dx = n.x - lx;
        const dy = n.y - ly;
        const d2 = dx * dx + dy * dy;
        const hit = RADIUS[n.kind] + 8;
        if (d2 < hit * hit && d2 < bestD2) {
          best = n;
          bestD2 = d2;
        }
      }
      return best;
    };

    const onPointerMove = (e: PointerEvent) => {
      const { x, y } = toLocal(e.clientX, e.clientY);
      if (draggingId) {
        const n = byId.get(draggingId);
        if (n) {
          n.fx = x;
          n.fy = y;
        }
        if (pointerDownAt && Math.hypot(e.clientX - pointerDownAt.x, e.clientY - pointerDownAt.y) > 4) {
          dragMoved = true;
        }
        return;
      }
      const hit = nodeAt(x, y);
      hoveredId = hit ? hit.id : null;
      canvas.style.cursor = hit ? (hit.kind === 'root' ? 'default' : 'pointer') : 'default';
    };

    const onPointerDown = (e: PointerEvent) => {
      const { x, y } = toLocal(e.clientX, e.clientY);
      const hit = nodeAt(x, y);
      if (hit && hit.kind !== 'root') {
        draggingId = hit.id;
        pointerDownAt = { x: e.clientX, y: e.clientY };
        dragMoved = false;
        canvas.style.cursor = 'grabbing';
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch { /* pointer capture unsupported */ }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (draggingId) {
        const n = byId.get(draggingId);
        const wasClick = !dragMoved;
        if (n) {
          n.fx = undefined;
          n.fy = undefined;
        }
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch { /* pointer capture unsupported */ }

        if (wasClick && n && n.zoneId) {
          navigate(`/roadmap/${n.zoneId}`);
        }
        draggingId = null;
        canvas.style.cursor = 'default';
      }
    };

    const onPointerLeave = () => {
      hoveredId = null;
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointercancel', onPointerUp);

    const REPEL = 3600;
    const SPRING = 0.045;
    const DAMPING = 0.86;
    const MIN_DIST = 18;
    const WALL_PAD = 44;
    const WALL_BOUNCE = 0.65;

    let raf = 0;
    let running = true;

    const step = () => {
      // Repulsion force
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            d2 = 1;
          }
          const d = Math.sqrt(d2);
          if (d > 350) continue;
          const force = REPEL / Math.max(d2, MIN_DIST * MIN_DIST);
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // Spring connection forces
      for (const e of edges) {
        const a = byId.get(e.a)!;
        const b = byId.get(e.b)!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.max(Math.hypot(dx, dy), 0.01);
        const force = SPRING * (d - e.targetLength);
        const fx = (dx / d) * force;
        const fy = (dy / d) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // 3. Gentle organic breathing/pulsing wave force to keep the mesh alive
      const time = Date.now() * 0.0012;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === 'root') continue;
        const offsetAngle = time + i * 0.63;
        nodes[i].vx += Math.cos(offsetAngle) * 0.045;
        nodes[i].vy += Math.sin(offsetAngle) * 0.045;
      }

      // Physics Integration & bounds check
      const maxSpeed = 26;
      const limitX = width / 2 - WALL_PAD;
      const limitY = height / 2 - WALL_PAD;
      const limitActive = limitX > 40 && limitY > 40;

      for (const n of nodes) {
        if (n.fx !== undefined && n.fy !== undefined) {
          n.x = n.fx;
          n.y = n.fy;
          n.vx = 0;
          n.vy = 0;
          continue;
        }

        n.vx *= DAMPING;
        n.vy *= DAMPING;
        const speed = Math.hypot(n.vx, n.vy);
        if (speed > maxSpeed) {
          const ratio = maxSpeed / speed;
          n.vx *= ratio;
          n.vy *= ratio;
        }
        n.x += n.vx;
        n.y += n.vy;

        // Bounce mechanics (prevents sticking to wall boundaries)
        if (limitActive) {
          if (n.x < -limitX) {
            n.x = -limitX;
            n.vx = Math.abs(n.vx) * WALL_BOUNCE;
          } else if (n.x > limitX) {
            n.x = limitX;
            n.vx = -Math.abs(n.vx) * WALL_BOUNCE;
          }
          if (n.y < -limitY) {
            n.y = -limitY;
            n.vy = Math.abs(n.vy) * WALL_BOUNCE;
          } else if (n.y > limitY) {
            n.y = limitY;
            n.vy = -Math.abs(n.vy) * WALL_BOUNCE;
          }
        }
      }
    };

    const draw = () => {
      // Read the theme live each frame. This effect + its RAF loop are set up once
      // at mount, so a captured `isDark` goes stale on theme toggle and keeps
      // painting the old palette until a refresh. The store mirrors the theme onto
      // <html class="dark">, so read it here to repaint correctly the moment it flips.
      const isDark = document.documentElement.classList.contains('dark');
      const q = queryRef.current;
      const hasQuery = q.length > 0;
      const hoverNeighbors = hoveredId ? neighbors.get(hoveredId) : null;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.translate(width / 2, height / 2);

      // Draw Connections (Edges)
      for (const e of edges) {
        const a = byId.get(e.a)!;
        const b = byId.get(e.b)!;
        let alpha = 0.08;
        
        if (hoveredId && (e.a === hoveredId || e.b === hoveredId)) {
          alpha = 0.55;
        }
        if (hasQuery) {
          const aMatch = a.label.toLowerCase().includes(q);
          const bMatch = b.label.toLowerCase().includes(q);
          alpha = aMatch && bMatch ? 0.5 : 0.02;
        }

        ctx.strokeStyle = hoveredId && (e.a === hoveredId || e.b === hoveredId) 
          ? (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(38, 35, 26, 0.6)')
          : (isDark ? `rgba(255, 255, 255, ${alpha * 0.4})` : `rgba(38, 35, 26, ${alpha * 0.4})`);
        ctx.lineWidth = hoveredId && (e.a === hoveredId || e.b === hoveredId) ? 1.4 : 0.9;
        
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw Nodes
      for (const n of nodes) {
        const isHovered = n.id === hoveredId;
        const isNeighbor = !!hoverNeighbors?.has(n.id);
        const matches = hasQuery && n.label.toLowerCase().includes(q);

        let alpha = BASE_ALPHA[n.kind];
        let radius = RADIUS[n.kind];
        const fill = isDark ? '#ffffff' : '#26231a';

        if (hasQuery) {
          if (matches) {
            radius *= 1.5;
            alpha = 1;
          } else {
            alpha = 0.15;
          }
        } else if (isHovered) {
          radius *= 1.45;
          alpha = 1;
        } else if (isNeighbor) {
          alpha = Math.min(1, alpha + 0.3);
        }

        // Apply glow for hover/search matches
        if (isHovered || matches) {
          const glowGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 3.5);
          glowGrad.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(38, 35, 26, 0.25)');
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw outer ring if hovered
        if (isHovered) {
          ctx.strokeStyle = isDark ? '#ffffff' : '#26231a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw primary node circle
        ctx.fillStyle = fill;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1; // restore

        // Draw node labels
        const showLabel = n.kind === 'root' || isHovered || isNeighbor || matches || !hasQuery;
        if (showLabel) {
          ctx.font = n.kind === 'root'
            ? '600 11px "Inter", sans-serif'
            : isHovered
            ? '600 9.5px "Inter", sans-serif'
            : '500 9.5px "Inter", sans-serif';
          
          ctx.fillStyle = isHovered || matches 
            ? (isDark ? '#ffffff' : '#26231a')
            : (isDark ? 'rgba(228, 228, 231, 0.75)' : 'rgba(38, 35, 26, 0.75)');
          
          ctx.textAlign = 'center';
          const tw = ctx.measureText(n.label).width;
          
          // Clamp labels inside screen bounds
          const lx = Math.max(-width / 2 + tw / 2 + 8, Math.min(width / 2 - tw / 2 - 8, n.x));
          const ly = Math.max(-height / 2 + 16, n.y - radius - 5);
          
          ctx.fillText(n.label, lx, ly);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = () => {
      if (!running) return;
      step();
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [nodes, edges, zoneStats]);

  return (
    <section className="relative w-full py-10 flex flex-col items-center justify-center border-t border-[var(--rm-border)] mt-10">
      <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--rm-text)] tracking-tight">
            Curriculum Overview Map
          </h2>
          <p className="max-w-xl text-[12.5px] text-[var(--rm-text-muted)] font-sans">
            Visualize the structural connections across all ten domains. Click to open, drag nodes to wiggle.
          </p>
        </div>

        <div className="w-full sm:w-72 shrink-0">
          <div className="flex items-center gap-2 border border-[var(--rm-border)] bg-[var(--rm-bg)] rounded-lg px-3 py-2 transition focus-within:border-[var(--rm-border-strong)] focus-within:ring-1 focus-within:ring-[var(--rm-border-strong)]">
            <Search size={14} className="text-[var(--rm-text-faint)] shrink-0" />
            <input
              type="text"
              placeholder="Highlight a domain…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none text-[12px] text-[var(--rm-text)] !outline-none focus-visible:!outline-none w-full placeholder-[var(--rm-text-faint)] font-sans"
            />
          </div>
        </div>
      </div>

      <div 
        ref={wrapRef} 
        className="relative z-10 w-full h-[460px] bg-[var(--rm-bg)] border border-[var(--rm-border)] rounded-xl overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
        />
        <div className="absolute bottom-3 right-4 font-mono text-[9px] text-[var(--rm-text-faint)] pointer-events-none">
          drag to rearrange · click any node to navigate
        </div>
      </div>

      <button
        onClick={onLaunch}
        className="mt-8 px-5 py-2.5 rounded-lg bg-[var(--rm-btn-bg)] hover:bg-[var(--rm-btn-hover)] border border-[var(--rm-btn-border)] text-[var(--rm-btn-text)] text-[12.5px] font-medium transition cursor-pointer font-sans"
      >
        Open Workspace Sandbox
      </button>
    </section>
  );
};
