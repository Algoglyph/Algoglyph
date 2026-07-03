import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { Topic } from '../config/roadmapData';

/**
 * TopicDesignGraph — an Obsidian-style force-directed knowledge graph.
 *
 * The zone's topic → concept → subtopic tree is flattened into nodes wired to a
 * synthetic root, then laid out with a small hand-rolled physics simulation
 * (charge repulsion + spring edges + a fixed root anchor). Clicking a leaf
 * (subtopic) node navigates straight to its article; typing in the filter
 * brightens matching nodes and dims everything else, mirroring Obsidian's
 * graph-view search highlight. Canvas-based like the rest of this page's
 * custom visuals — no new dependency for ~135 nodes at 60fps.
 */

interface GraphNode {
  id: string;
  label: string;
  kind: 'root' | 'concept' | 'subtopic';
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
  topicId?: string;
  conceptId?: string;
  blogSlug?: string;
}

interface GraphEdge {
  a: string;
  b: string;
  targetLength: number;
}

const RADIUS: Record<GraphNode['kind'], number> = {
  root: 11,
  concept: 8,
  subtopic: 5.5,
};

const BASE_ALPHA: Record<GraphNode['kind'], number> = {
  root: 1,
  concept: 0.95,
  subtopic: 0.7,
};

interface TopicDesignGraphProps {
  topic: Topic;
  moduleId: string;
}

export const TopicDesignGraph: React.FC<TopicDesignGraphProps> = ({ topic, moduleId }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const queryRef = useRef('');
  const isDark = useWorkspaceStore((state) => state.theme) === 'dark';
  useEffect(() => {
    queryRef.current = query.trim().toLowerCase();
  }, [query]);

  const stats = useMemo(() => {
    const concepts = topic.concepts.length;
    const subtopics = topic.concepts.reduce((s, c) => s + c.subtopics.length, 0);
    return { concepts, subtopics };
  }, [topic]);

  // Build the node/edge graph once per zone (topic tree doesn't change at runtime).
  const { nodes, edges } = useMemo(() => {
    const nodeList: GraphNode[] = [];
    const edgeList: GraphEdge[] = [];
    const rootId = 'root';
    nodeList.push({ id: rootId, label: topic.name, kind: 'root', x: 0, y: 0, vx: 0, vy: 0 });

    topic.concepts.forEach((concept, ci) => {
      const conceptNodeId = `c:${concept.id}`;
      const conceptAngle = (ci / topic.concepts.length) * Math.PI * 2;
      nodeList.push({
        id: conceptNodeId,
        label: concept.name,
        kind: 'concept',
        x: Math.cos(conceptAngle) * 200,
        y: Math.sin(conceptAngle) * 200,
        vx: 0,
        vy: 0,
        topicId: topic.id,
        conceptId: concept.id,
      });
      edgeList.push({ a: rootId, b: conceptNodeId, targetLength: 200 });

      concept.subtopics.forEach((subtopic, si) => {
        const subNodeId = `s:${topic.id}:${concept.id}:${subtopic.id}`;
        const subAngle = conceptAngle + (si - (concept.subtopics.length - 1) / 2) * 0.35;
        nodeList.push({
          id: subNodeId,
          label: subtopic.name,
          kind: 'subtopic',
          x: Math.cos(subAngle) * 320,
          y: Math.sin(subAngle) * 320,
          vx: 0,
          vy: 0,
          topicId: topic.id,
          conceptId: concept.id,
          blogSlug: subtopic.blogSlug,
        });
        edgeList.push({ a: conceptNodeId, b: subNodeId, targetLength: 90 });
      });
    });

    return { nodes: nodeList, edges: edgeList };
  }, [topic]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Use ResizeObserver instead of window resize listener for layout responsiveness
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

    // Root is a fixed anchor — everything else settles relative to it.
    const root = byId.get('root');
    if (root) {
      root.fx = 0;
      root.fy = 0;
    }

    let hoveredId: string | null = null;
    let draggingId: string | null = null;
    let pointerDownAt: { x: number; y: number } | null = null;
    let dragMoved = false;

    let settleTicks = reduceMotion ? 400 : Infinity; // reduced motion: settle fast then freeze

    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left - width / 2, y: clientY - rect.top - height / 2 };
    };

    const nodeAt = (lx: number, ly: number): GraphNode | null => {
      let best: GraphNode | null = null;
      let bestD2 = Infinity;
      for (const n of nodes) {
        const dx = n.x - lx;
        const dy = n.y - ly;
        const d2 = dx * dx + dy * dy;
        const hit = RADIUS[n.kind] + 6;
        if (d2 < hit * hit && d2 < bestD2) {
          best = n;
          bestD2 = d2;
        }
      }
      return best;
    };

    // Pointer Events support unified touch & mouse
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
        // Reheat simulation continuously during drag so it doesn't freeze mid-drag
        if (reduceMotion) {
          settleTicks = Math.max(settleTicks, 2);
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

        // Reheat simulation on drag start
        if (reduceMotion) {
          settleTicks = Math.max(settleTicks, 100);
        }
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

        if (wasClick && n) {
          // Leaf → open the article. Hubs → open the card page of their children.
          if (n.kind === 'subtopic' && n.blogSlug) {
            navigate(`/roadmap/${moduleId}/${n.topicId}/${n.conceptId}/${n.blogSlug}`);
          } else if (n.kind === 'concept' && n.topicId && n.conceptId) {
            navigate(`/roadmap/${moduleId}/${n.topicId}/${n.conceptId}`);
          }
        }
        draggingId = null;
        canvas.style.cursor = 'default';

        // Keep running for a short settle period after drag release
        if (reduceMotion) {
          settleTicks = Math.max(settleTicks, 300);
        }
      }
    };

    const onPointerLeave = () => {
      hoveredId = null;
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointercancel', onPointerUp); // safety fallback

    const REPEL = 3200;
    const SPRING = 0.045;
    const DAMPING = 0.86;
    const MIN_DIST = 18;
    const WALL_PAD = 44; // keep nodes (and their labels) clear of the edges
    const WALL_BOUNCE = 0.65; // restitution when a node hits a wall

    let raf = 0;
    let running = true;

    const step = () => {
      // Repulsion — O(n^2), trivial at this node count.
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
          if (d > 420) continue; // far pairs don't meaningfully interact — cheap cutoff
          const force = REPEL / Math.max(d2, MIN_DIST * MIN_DIST);
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // Springs along the tree's edges.
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

      // Integrate
      const MAX_SPEED = 26;
      // Invisible walls at the canvas bounds (coords are centred, so ±half-size).
      const wallX = width / 2 - WALL_PAD;
      const wallY = height / 2 - WALL_PAD;
      const wallsActive = wallX > 40 && wallY > 40;
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
        if (speed > MAX_SPEED) {
          const s = MAX_SPEED / speed;
          n.vx *= s;
          n.vy *= s;
        }
        n.x += n.vx;
        n.y += n.vy;

        // Bounce off the walls so every node stays visible.
        if (wallsActive) {
          if (n.x < -wallX) {
            n.x = -wallX;
            n.vx = Math.abs(n.vx) * WALL_BOUNCE;
          } else if (n.x > wallX) {
            n.x = wallX;
            n.vx = -Math.abs(n.vx) * WALL_BOUNCE;
          }
          if (n.y < -wallY) {
            n.y = -wallY;
            n.vy = Math.abs(n.vy) * WALL_BOUNCE;
          } else if (n.y > wallY) {
            n.y = wallY;
            n.vy = -Math.abs(n.vy) * WALL_BOUNCE;
          }
        }
      }
    };

    const draw = () => {
      const q = queryRef.current;
      const hasQuery = q.length > 0;
      const hoverNeighbors = hoveredId ? neighbors.get(hoveredId) : null;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.translate(width / 2, height / 2);

      // Edges
      for (const e of edges) {
        const a = byId.get(e.a)!;
        const b = byId.get(e.b)!;
        let alpha = 0.07;
        if (hoveredId && (e.a === hoveredId || e.b === hoveredId)) alpha = 0.5;
        if (hasQuery) {
          const aMatch = a.label.toLowerCase().includes(q);
          const bMatch = b.label.toLowerCase().includes(q);
          alpha = aMatch && bMatch ? 0.45 : 0.03;
        }
        ctx.strokeStyle = isDark ? `rgba(160, 170, 190, ${alpha})` : `rgba(38, 35, 26, ${alpha * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const isHovered = n.id === hoveredId;
        const isNeighbor = !!hoverNeighbors?.has(n.id);
        const matches = hasQuery && n.label.toLowerCase().includes(q);

        let alpha = BASE_ALPHA[n.kind];
        let radius = RADIUS[n.kind];
        let fill = isDark ? `rgba(226, 232, 244, ${alpha})` : `rgba(38, 35, 26, ${alpha})`;

        if (hasQuery) {
          if (matches) {
            alpha = 1;
            radius *= 1.55;
            fill = isDark ? `rgba(96, 179, 255, ${alpha})` : `rgba(60, 130, 246, ${alpha})`;
          } else {
            alpha = 0.12;
            fill = isDark ? `rgba(226, 232, 244, ${alpha})` : `rgba(38, 35, 26, ${alpha})`;
          }
        } else if (isHovered) {
          alpha = 1;
          radius *= 1.5;
          fill = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
        } else if (isNeighbor) {
          alpha = Math.min(1, alpha + 0.35);
          fill = isDark ? `rgba(226, 232, 244, ${alpha})` : `rgba(38, 35, 26, ${alpha})`;
        }

        if (matches) {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 3.2);
          glow.addColorStop(0, isDark ? 'rgba(96, 179, 255, 0.35)' : 'rgba(60, 130, 246, 0.25)');
          glow.addColorStop(1, isDark ? 'rgba(96, 179, 255, 0)' : 'rgba(60, 130, 246, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();

        const showLabel =
          n.kind === 'root' ||
          (n.kind === 'concept' && !hasQuery) ||
          isHovered ||
          isNeighbor ||
          matches;

        if (showLabel) {
          ctx.font =
            n.kind === 'root'
              ? '600 11px "JetBrains Mono", monospace'
              : '400 9.5px -apple-system, sans-serif';
          ctx.fillStyle =
            matches || isHovered
              ? (isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.95)')
              : (isDark ? `rgba(210, 215, 225, ${n.kind === 'subtopic' ? 0.85 : 0.65})` : `rgba(38, 35, 26, ${n.kind === 'subtopic' ? 0.85 : 0.65})`);
          ctx.textAlign = 'center';
          // Clamp the label into the canvas so edge-hugging nodes stay readable.
          const tw = ctx.measureText(n.label).width;
          const lx = Math.max(-width / 2 + tw / 2 + 6, Math.min(width / 2 - tw / 2 - 6, n.x));
          const ly = Math.max(-height / 2 + 16, n.y - radius - 5);
          ctx.fillText(n.label, lx, ly);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = () => {
      if (!running) return;
      if (settleTicks > 0) {
        step();
        settleTicks--;
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, topic.id, moduleId]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-500">
          <span>
            <span className="text-[var(--rm-text)] font-semibold">{stats.concepts}</span> concepts
          </span>
          <span>
            <span className="text-[var(--rm-text)] font-semibold">{stats.subtopics}</span> articles
          </span>
        </div>

        <div className="w-full sm:w-72">
          <div className="flex items-center gap-2 border border-[var(--rm-border)] bg-[var(--rm-bg)] rounded-lg px-3 py-2 transition focus-within:border-[var(--rm-border-strong)] focus-within:ring-1 focus-within:ring-[var(--rm-border-strong)]">
            <Search size={14} className="text-[var(--rm-text-faint)] shrink-0" />
            <input
              type="text"
              placeholder="Highlight a node…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none text-[12px] text-[var(--rm-text)] !outline-none focus-visible:!outline-none w-full placeholder-[var(--rm-text-faint)] font-sans"
            />
          </div>
        </div>
      </div>

      <div ref={wrapRef} className="relative w-full h-[85vh] min-h-[720px] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none" />
        <div className="absolute bottom-3 right-4 font-mono text-[9.5px] text-[var(--rm-text-faint)] pointer-events-none">
          drag to rearrange · click any node to open it
        </div>
      </div>
    </div>
  );
};
