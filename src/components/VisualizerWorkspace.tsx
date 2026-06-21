import React, { useRef } from 'react';
import { AlgorithmSidebar } from './AlgorithmSidebar';
import { VisualizerCanvas } from './VisualizerCanvas';
import type { VisualizerCanvasHandle } from './VisualizerCanvas';
import { useWorkspaceStore } from '../store/workspaceStore';

export const VisualizerWorkspace: React.FC = () => {
  const canvasRef = useRef<VisualizerCanvasHandle>(null);
  const theme = useWorkspaceStore((s) => s.theme);

  return (
    <div className={`flex h-full w-full overflow-hidden ${theme === 'dark' ? 'bg-[#0c0c0e]' : 'bg-slate-50'}`}>
      <AlgorithmSidebar onAdd={(id) => canvasRef.current?.addAtCenter(id)} />
      <VisualizerCanvas ref={canvasRef} />
    </div>
  );
};
