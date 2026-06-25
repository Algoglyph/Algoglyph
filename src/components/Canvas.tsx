import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { useWorkspaceStore } from '../store/workspaceStore';
import { StructuresPanel } from './StructuresPanel';
import { dsaStructures, bindTextContainers } from '../config/dsaStructures';
import '@excalidraw/excalidraw/index.css';

export const Canvas: React.FC = () => {
  // Select only loading, import counters, and save methods reactively.
  // DO NOT select elements, appState, or tool state to keep the component render-independent.
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const lastImportTime = useWorkspaceStore((state) => state.lastImportTime);
  const updateCanvas = useWorkspaceStore((state) => state.updateCanvas);
  const setActiveCanvasTool = useWorkspaceStore((state) => state.setActiveCanvasTool);
  const theme = useWorkspaceStore((state) => state.theme);

  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [localLastImportTime, setLocalLastImportTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Capture the initial data only once when the canvas mount occurs (after loading completes)
  const initialElements = useRef<any[]>([]);
  const initialAppState = useRef<any>({});
  const initialFiles = useRef<any>({});
  const hasLoadedInitialData = useRef(false);

  if (!isLoading && !hasLoadedInitialData.current) {
    const state = useWorkspaceStore.getState();
    initialElements.current = state.canvasElements || [];
    initialAppState.current = state.canvasAppState || {};
    initialFiles.current = state.canvasFiles || {};
    hasLoadedInitialData.current = true;
  }

  // Stable references for Excalidraw configuration to prevent prop-change loops
  const initialData = useMemo(() => {
    return {
      elements: initialElements.current,
      appState: {
        ...initialAppState.current,
        theme,
      },
      files: initialFiles.current,
    };
    // Capture the theme present at mount; live changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep Excalidraw's theme in sync with the app theme toggle.
  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({ appState: { theme } });
    }
  }, [excalidrawAPI, theme]);

  const UIOptions = useMemo(() => {
    return {
      canvasActions: {
        changeViewBackgroundColor: false,
        clearCanvas: true,
        export: false,
        loadScene: false,
        saveToActiveFile: false,
        toggleTheme: false,
      },
      welcomeScreen: false,
    } as const;
  }, []);

  // Sync scene ONLY on manual workspace imports
  useEffect(() => {
    if (excalidrawAPI && !isLoading && lastImportTime > localLastImportTime) {
      const state = useWorkspaceStore.getState();
      excalidrawAPI.updateScene({
        elements: state.canvasElements,
        appState: {
          ...state.canvasAppState,
          theme, // follow the app theme
        },
        files: state.canvasFiles,
      });
      setLocalLastImportTime(lastImportTime);
    }
  }, [excalidrawAPI, isLoading, lastImportTime, localLastImportTime, theme]);

  // Handle global keyboard shortcuts for tool switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        !excalidrawAPI ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.ProseMirror')
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();
      let toolType: string | null = null;

      switch (key) {
        case 't':
          toolType = 'text';
          break;
        case 'd':
          toolType = 'freedraw';
          break;
        case 'e':
          toolType = 'eraser';
          break;
        case 'a':
          toolType = 'arrow';
          break;
        case 'l':
          toolType = 'line';
          break;
        case 'r':
          toolType = 'rectangle';
          break;
        default:
          return;
      }

      if (toolType) {
        e.preventDefault();
        excalidrawAPI.setActiveTool({ type: toolType });
        setActiveCanvasTool(toolType);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [excalidrawAPI, setActiveCanvasTool]);

  const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {
    const activeTool = appState.activeTool?.type;
    if (activeTool) {
      // Keep store updated without triggering rendering
      const state = useWorkspaceStore.getState();
      if (state.activeCanvasTool !== activeTool) {
        setActiveCanvasTool(activeTool);
      }
    }

    // Show Excalidraw's style ("color palette") panel only once elements are
    // selected — but NOT mid-gesture while a marquee selection box is still being
    // dragged (appState.selectionElement is set throughout that drag, and clears on
    // release). Toggled imperatively to keep this component render-independent.
    if (containerRef.current) {
      const hasSelection = Object.values(appState.selectedElementIds || {}).some(Boolean);
      const isMarqueeSelecting = !!appState.selectionElement;
      const showPanel = hasSelection && !isMarqueeSelecting;
      containerRef.current.classList.toggle('canvas-no-selection', !showPanel);

      if (showPanel) {
        // Dock the style panel on the side opposite the selection so it never
        // covers the selected object. Compare the selection's centre (mapped to
        // screen space) against the canvas midpoint: object on the left half →
        // panel docks right, and vice-versa.
        const selected = elements.filter((el) => appState.selectedElementIds[el.id] && !el.isDeleted);
        if (selected.length) {
          let minX = Infinity;
          let maxX = -Infinity;
          for (const el of selected) {
            minX = Math.min(minX, el.x);
            maxX = Math.max(maxX, el.x + (el.width || 0));
          }
          const zoom = appState.zoom?.value || 1;
          const selCenterScreenX = ((minX + maxX) / 2 + appState.scrollX) * zoom;
          const dockRight = selCenterScreenX < (appState.width || 0) / 2;
          containerRef.current.classList.toggle('panel-dock-right', dockRight);
        }
      }
    }

    updateCanvas([...elements], appState, files);
  };

  // Handle Drag & Drop Insertion onto the canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const structureId = e.dataTransfer.getData('text/plain');
    const structure = dsaStructures.find((s) => s.id === structureId);
    if (!structure || !excalidrawAPI) return;

    // Calculate coordinates relative to the canvas viewport container
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const appState = excalidrawAPI.getAppState();
    const zoom = appState.zoom.value || 1;
    const scrollX = appState.scrollX || 0;
    const scrollY = appState.scrollY || 0;

    // Translate client coordinates into Canvas zoom space coordinates
    const canvasX = -scrollX + clientX / zoom;
    const canvasY = -scrollY + clientY / zoom;

    // Offsets to center the dropped structure under the cursor
    const startX = canvasX - 100;
    const startY = canvasY - 20;

    const skeletons = bindTextContainers(structure.generate(startX, startY));
    const newElements = convertToExcalidrawElements(skeletons, { regenerateIds: false });

    excalidrawAPI.updateScene({
      elements: [...excalidrawAPI.getSceneElements(), ...newElements],
      commitToHistory: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-canvas text-mute">
        <div className="text-xs font-mono tracking-widest uppercase animate-pulse">Loading canvas</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-canvas flex relative">
      {/* Custom DSA Structures sidebar canvas-soft */}
      <StructuresPanel />

      {/* Excalidraw canvas container with drop handlers */}
      <div
        ref={containerRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex-1 h-full relative canvas-no-selection"
      >
        <Excalidraw
          excalidrawAPI={(api) => {
            setExcalidrawAPI(api);
            (window as any).excalidrawAPI = api;
          }}
          theme={theme}
          initialData={initialData}
          onChange={handleCanvasChange}
          UIOptions={UIOptions}
        />
      </div>
    </div>
  );
};
