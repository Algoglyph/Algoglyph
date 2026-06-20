import React, { useRef } from 'react';
import { AlgorithmSidebar } from './AlgorithmSidebar';
import { VisualizerCanvas } from './VisualizerCanvas';
import type { VisualizerCanvasHandle } from './VisualizerCanvas';

// Root of the "Visualizer" layout mode: a sidebar of draggable algorithm
// templates beside an infinite, pannable/zoomable node canvas.
export const VisualizerWorkspace: React.FC = () => {
  const canvasRef = useRef<VisualizerCanvasHandle>(null);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0c0c0e]">
      <AlgorithmSidebar onAdd={(id) => canvasRef.current?.addAtCenter(id)} />
      <VisualizerCanvas ref={canvasRef} />
    </div>
  );
};
