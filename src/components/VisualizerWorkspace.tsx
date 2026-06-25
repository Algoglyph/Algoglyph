import React, { useRef, useState, useLayoutEffect } from 'react';
import { PanelLeft } from 'lucide-react';
import { AlgorithmSidebar } from './AlgorithmSidebar';
import { VisualizerCanvas } from './VisualizerCanvas';
import type { VisualizerCanvasHandle } from './VisualizerCanvas';
import { DocSidebar } from './DocSidebar';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useIsMobile } from '../hooks/useIsMobile';

export const VisualizerWorkspace: React.FC = () => {
  const canvasRef = useRef<VisualizerCanvasHandle>(null);
  const theme = useWorkspaceStore((s) => s.theme);
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  // The algorithms sidebar is open by default on desktop and collapsed on
  // mobile (where it's a modal drawer). Re-apply when crossing the breakpoint.
  const [open, setOpen] = useState(!isMobile);
  useLayoutEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  // The algorithm doc panel on the right. null = collapsed.
  const [docId, setDocId] = useState<string | null>(null);

  return (
    <div className={`relative flex h-full w-full overflow-hidden ${isDark ? 'bg-[#0c0c0e]' : 'bg-slate-50'}`}>
      <AlgorithmSidebar
        isOpen={open}
        isMobile={isMobile}
        onClose={() => setOpen(false)}
        onAdd={(id) => canvasRef.current?.addAtCenter(id)}
        onOpenDoc={(id) => setDocId(id)}
      />
      <VisualizerCanvas ref={canvasRef} />

      {docId && !isMobile && (
        <DocSidebar algorithmId={docId} onClose={() => setDocId(null)} />
      )}

      {/* Floating toggle to reveal the sidebar when it's collapsed. There's no
          TabBar in the Visualizer, so this is the only way back to the list. */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Show algorithms"
          className={`absolute top-3 left-3 z-30 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-md transition-colors cursor-pointer ${
            isDark
              ? 'border-white/10 bg-black/60 text-zinc-300 hover:border-white/20 hover:text-white'
              : 'border-zinc-200 bg-white/80 text-zinc-600 hover:text-zinc-900 shadow-sm'
          }`}
        >
          <PanelLeft size={14} />
          Algorithms
        </button>
      )}
    </div>
  );
};
