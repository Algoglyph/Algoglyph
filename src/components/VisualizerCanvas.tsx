import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Plus, Minus, Maximize, Trash2, MousePointer2 } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { VisualizerNode } from './VisualizerNode';

const NODE_HALF_W = 172;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export interface VisualizerCanvasHandle {
  addAtCenter: (algorithmId: string) => void;
}

export const VisualizerCanvas = forwardRef<VisualizerCanvasHandle>((_props, ref) => {
  const nodes = useWorkspaceStore((s) => s.visualizerNodes);
  const addNode = useWorkspaceStore((s) => s.addVisualizerNode);
  const clearNodes = useWorkspaceStore((s) => s.clearVisualizerNodes);
  const theme = useWorkspaceStore((s) => s.theme);

  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ tx: 0, ty: 0, scale: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const [isPanning, setIsPanning] = useState(false);

  // Active pointers for a unified gesture model: one pointer pans, two pinch-zoom.
  // Works for mouse, pen and touch alike via the Pointer Events API.
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; cx: number; cy: number } | null>(null);

  // Convert a client (screen) point to canvas-space coordinates.
  const toCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const { tx, ty, scale } = viewRef.current;
    return {
      x: (clientX - rect.left - tx) / scale,
      y: (clientY - rect.top - ty) / scale,
    };
  }, []);

  useImperativeHandle(ref, () => ({
    addAtCenter: (algorithmId: string) => {
      // Place near the top-left of the *visible* viewport (in canvas space),
      // so the node is always on-screen regardless of current pan/zoom. The
      // node is ~344px wide, so on a phone it has to hug the left edge with a
      // gentle cascade or it spills off the right side of the screen.
      const { tx, ty, scale } = viewRef.current;
      const count = useWorkspaceStore.getState().visualizerNodes.length;
      const n = count % 6;
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const baseX = mobile ? 10 : 56;
      const stepX = mobile ? 16 : 60;
      // Clear the floating "Algorithms" toggle (top-left) on mobile.
      const baseY = mobile ? 56 : 48;
      const stepY = mobile ? 28 : 40;
      addNode(algorithmId, (-tx + baseX + n * stepX) / scale, (-ty + baseY + n * stepY) / scale);
    },
  }));

  // ── Zoom (ctrl/⌘ + wheel) and pan (wheel) ──────────────────
  // Attached natively so we can preventDefault (React's onWheel is passive).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      setView((v) => {
        if (e.ctrlKey || e.metaKey) {
          const factor = 1 - e.deltaY * 0.0016;
          const next = clamp(v.scale * factor, 0.35, 2.2);
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          return {
            scale: next,
            tx: cx - ((cx - v.tx) * next) / v.scale,
            ty: cy - ((cy - v.ty) * next) / v.scale,
          };
        }
        return { ...v, tx: v.tx - e.deltaX, ty: v.ty - e.deltaY };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    // Ignore presses that land on a node — those drag the node, not the canvas.
    if ((e.target as HTMLElement).closest('[data-node-root]')) return;

    const isFirst = pointers.current.size === 0;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setIsPanning(true);

    // When a second finger lands, seed the pinch baseline (gap + midpoint).
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      };
    }
    // Only the first pointer wires up the window listeners; later fingers share
    // them via the pointer map so moves aren't processed twice.
    if (!isFirst) return;

    const onMove = (ev: PointerEvent) => {
      if (!pointers.current.has(ev.pointerId)) return;
      const prev = pointers.current.get(ev.pointerId)!;
      pointers.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

      if (pointers.current.size >= 2 && pinch.current) {
        // Two-finger pinch: scale about the pinch midpoint and pan by its drift.
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2;
        const rect = containerRef.current!.getBoundingClientRect();
        const g = pinch.current;
        const panX = cx - g.cx;
        const panY = cy - g.cy;
        setView((v) => {
          const factor = g.dist > 0 ? dist / g.dist : 1;
          const next = clamp(v.scale * factor, 0.35, 2.2);
          const px = cx - rect.left;
          const py = cy - rect.top;
          return {
            scale: next,
            tx: px - ((px - v.tx) * next) / v.scale + panX,
            ty: py - ((py - v.ty) * next) / v.scale + panY,
          };
        });
        pinch.current = { dist, cx, cy };
      } else {
        // Single pointer: pan by this pointer's delta.
        const dx = ev.clientX - prev.x;
        const dy = ev.clientY - prev.y;
        setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
      }
    };
    const onUp = (ev: PointerEvent) => {
      pointers.current.delete(ev.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      if (pointers.current.size === 0) {
        setIsPanning(false);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('application/x-algorithm');
    if (!id) return;
    const c = toCanvas(e.clientX, e.clientY);
    addNode(id, c.x - NODE_HALF_W, c.y - 16);
  };

  const zoomBy = (factor: number) =>
    setView((v) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const next = clamp(v.scale * factor, 0.35, 2.2);
      return {
        scale: next,
        tx: cx - ((cx - v.tx) * next) / v.scale,
        ty: cy - ((cy - v.ty) * next) / v.scale,
      };
    });
  const resetView = () => setView({ tx: 0, ty: 0, scale: 1 });

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={onDrop}
      className={`relative h-full flex-1 overflow-hidden transition-colors ${theme === 'dark' ? 'bg-[#0c0c0e]' : 'bg-[#fafafa]'} ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        // Claim all touch gestures so one-finger pan, node drag, and two-finger
        // pinch-zoom drive the canvas instead of scrolling/zooming the page.
        touchAction: 'none',
        backgroundImage: theme === 'dark'
          ? 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)'
          : 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: `${24 * view.scale}px ${24 * view.scale}px`,
        backgroundPosition: `${view.tx}px ${view.ty}px`,
      }}
    >
      {/* Transformed node layer */}
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})` }}
      >
        
        {nodes.map((n) => (
          <VisualizerNode key={n.id} node={n} scaleRef={viewRef} />
        ))}
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className={`flex flex-col items-center gap-3 ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}`}>
            <MousePointer2 size={26} />
            <div>
              <p className={`text-[15px] font-medium ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-700'}`}>Drop an algorithm to begin</p>
              <p className={`mt-1 text-[12px] ${theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Drag from the sidebar, or click a card. Each block plays on its own.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Zoom / view controls */}
      <div className={`absolute bottom-4 right-4 flex items-center gap-1 rounded-lg border p-1 backdrop-blur-md ${theme === 'dark' ? 'border-white/10 bg-black/60' : 'border-zinc-200 bg-white/80 shadow-sm'}`}>
        <button onClick={() => zoomBy(1 / 1.2)} className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${theme === 'dark' ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'}`} title="Zoom out">
          <Minus size={14} />
        </button>
        <button onClick={resetView} className={`flex h-7 min-w-[44px] items-center justify-center rounded px-1 font-mono text-[10px] cursor-pointer transition-colors ${theme === 'dark' ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'}`} title="Reset view">
          {Math.round(view.scale * 100)}%
        </button>
        <button onClick={() => zoomBy(1.2)} className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${theme === 'dark' ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'}`} title="Zoom in">
          <Plus size={14} />
        </button>
        <div className={`mx-0.5 h-4 w-px ${theme === 'dark' ? 'bg-white/10' : 'bg-zinc-200'}`} />
        <button onClick={resetView} className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${theme === 'dark' ? 'text-zinc-300 hover:bg-white/10 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'}`} title="Center view">
          <Maximize size={13} />
        </button>
      </div>

      {/* Clear all */}
      {nodes.length > 0 && (
        <button
          onClick={clearNodes}
          className={`absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] backdrop-blur-md transition-colors cursor-pointer ${theme === 'dark' ? 'border-white/10 bg-black/60 text-zinc-400 hover:border-rose-500/40 hover:text-rose-400' : 'border-zinc-200 bg-white/80 text-zinc-500 hover:border-rose-300 hover:text-rose-600 shadow-sm'}`}
          title="Remove all blocks"
        >
          <Trash2 size={13} />
          Clear ({nodes.length})
        </button>
      )}
    </div>
  );
});

VisualizerCanvas.displayName = 'VisualizerCanvas';
