import React from 'react';
import { Pencil, FileText, Code2, Workflow } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { LayoutMode } from '../store/workspaceStore';

// Bottom tab bar shown only on mobile (md:hidden). Mode-switching here replaces
// the top segmented control, which is hidden on small screens. Split has no
// mobile representation, so it maps to the Canvas destination.
const ITEMS: { mode: LayoutMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'canvas-only', label: 'Canvas', icon: <Pencil size={18} /> },
  { mode: 'notes-only', label: 'Notes', icon: <FileText size={18} /> },
  { mode: 'code', label: 'Code', icon: <Code2 size={18} /> },
  { mode: 'visualizer', label: 'Visualizer', icon: <Workflow size={18} /> },
];

export const MobileNav: React.FC = () => {
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);

  // `split` and `canvas-only` both surface the canvas on mobile.
  const activeMode: LayoutMode = layoutMode === 'split' ? 'canvas-only' : layoutMode;

  return (
    <nav
      data-tour="mobile-nav"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-stretch h-14 bg-canvas/90 backdrop-blur-md border-t border-hairline select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {ITEMS.map(({ mode, label, icon }) => {
        const isActive = activeMode === mode;
        return (
          <button
            key={mode}
            onClick={() => setLayoutMode(mode)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
              isActive ? 'text-link' : 'text-mute hover:text-body'
            }`}
            title={label}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
