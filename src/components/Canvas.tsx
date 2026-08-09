import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { Sparkles, Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useMcpStore } from '../store/mcpStore';
import { StructuresPanel } from './StructuresPanel';
import { dsaStructures, bindTextContainers } from '../config/dsaStructures';
import { generateCanvasResponse, insertCanvasSkeletons, CanvasAiError } from '../lib/ai/diagram';
import { serializeCanvasForNotes } from '../lib/ai/notes';
import '@excalidraw/excalidraw/index.css';

/**
 * Read the user's request from the canvas: the text element(s) they typed.
 * Prefers the element being edited, then the current selection (joined in
 * reading order), then the most-recently-edited text element.
 */
function readCanvasPrompt(elements: readonly any[], appState: any): string | null {
  const editing = appState.editingElement;
  if (editing && editing.type === 'text' && typeof editing.text === 'string' && editing.text.trim()) {
    return editing.text.trim();
  }

  const texts = elements.filter(
    (el: any) => !el.isDeleted && el.type === 'text' && typeof el.text === 'string' && el.text.trim(),
  );
  if (!texts.length) return null;

  const selectedIds = appState.selectedElementIds || {};
  const selected = texts.filter((el: any) => selectedIds[el.id]);
  if (selected.length) {
    selected.sort((a: any, b: any) => a.y - b.y || a.x - b.x);
    return selected.map((el: any) => el.text.trim()).join('\n').trim();
  }

  texts.sort((a: any, b: any) => (b.updated || 0) - (a.updated || 0));
  return texts[0].text.trim();
}

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

  // AI-native diagram generation: read the prompt off the canvas → generate.
  const [aiBusy, setAiBusy] = useState(false);
  const aiAbortRef = useRef<AbortController | null>(null);

  const runCanvasAi = useCallback(async () => {
    const api = (window as any).excalidrawAPI;
    if (!api || aiAbortRef.current) return;

    const notify = useWorkspaceStore.getState().showNotification;
    const appState = api.getAppState();
    const sceneElements = api.getSceneElements();
    const prompt = readCanvasPrompt(sceneElements, appState);
    if (!prompt) {
      notify('Type your request as text on the canvas, then Ask AI.', 'info');
      return;
    }

    const mcp = useMcpStore.getState();
    if (!mcp.connectorToken) {
      notify('Run `npm run mcp:connector`; AlgoGlyph will connect automatically, then try Ask AI.', 'error');
      mcp.openMcpPanel();
      return;
    }

    const controller = new AbortController();
    aiAbortRef.current = controller;
    setAiBusy(true);
    notify('Thinking…', 'info');
    try {
      const { intent, skeletons } = await generateCanvasResponse(prompt, {
        connectorEndpoint: mcp.connectorEndpoint,
        connectorToken: mcp.connectorToken,
        agentId: mcp.activeAgentId || undefined,
        signal: controller.signal,
        canvasContext: serializeCanvasForNotes(sceneElements),
      });
      if (!skeletons.length) {
        notify('The AI did not produce a canvas response. Try rewording the request.', 'info');
        return;
      }
      const added = insertCanvasSkeletons(skeletons);
      const verb = intent === 'answer' || intent === 'explain' ? 'Answered' : 'Drew';
      notify(`${verb} on the canvas · ${added} elements`, 'success');
    } catch (error) {
      if (!controller.signal.aborted) {
        notify(error instanceof CanvasAiError ? error.message : 'Canvas AI failed.', 'error');
      }
    } finally {
      aiAbortRef.current = null;
      setAiBusy(false);
    }
  }, []);

  // ⌘/Ctrl + Enter runs the canvas AI, except while typing in the notes editor.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!((e.metaKey || e.ctrlKey) && e.key === 'Enter')) return;
      const target = e.target as HTMLElement;
      if (target.closest('.ProseMirror')) return;
      if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.closest('.excalidraw')) return;
      e.preventDefault();
      void runCanvasAi();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [runCanvasAi]);

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
      // Every non-`default` case assigns this; `default` returns early.
      let toolType: string;

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
    if (!excalidrawAPI) return;

    let structure: any;
    const jsonPayload = e.dataTransfer.getData('application/json');
    if (jsonPayload) {
      try {
        structure = JSON.parse(jsonPayload);
      } catch (err) {
        console.error('Failed to parse dropped structure', err);
      }
    } else {
      const structureId = e.dataTransfer.getData('text/plain');
      structure = dsaStructures.find((s) => s.id === structureId);
    }

    if (!structure) return;

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

    let skeletons: any[];
    let shouldRegenerateIds = false;

    const libraryElements = 'elements' in structure ? structure.elements : undefined;

    if (libraryElements && libraryElements.length) {
      // It's a static library item: offset it to startX, startY
      let minX = Infinity;
      let minY = Infinity;
      for (const el of libraryElements) {
        if (el.x < minX) minX = el.x;
        if (el.y < minY) minY = el.y;
      }
      const dx = startX - minX;
      const dy = startY - minY;

      skeletons = libraryElements.map((el: any) => ({
        ...el,
        x: el.x + dx,
        y: el.y + dy,
      }));
      shouldRegenerateIds = true;
    } else if (structure.generate) {
      // It's a dynamic DSA structure
      skeletons = bindTextContainers(structure.generate(startX, startY));
    } else {
      return;
    }

    const newElements = convertToExcalidrawElements(skeletons, { regenerateIds: shouldRegenerateIds });

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

        {/* AI-native: type a request as text on the canvas, then generate a diagram. */}
        <button
          type="button"
          onClick={() => (aiBusy ? aiAbortRef.current?.abort() : void runCanvasAi())}
          className="absolute bottom-4 right-4 z-20 inline-flex h-9 items-center gap-2 rounded-full border border-hairline bg-canvas px-3.5 text-xs font-medium text-ink shadow-[var(--shadow-modal)] transition-colors hover:border-ink hover:bg-canvas-soft"
          title="Type your request as text on the canvas, then Ask AI (⌘/Ctrl+Enter)"
        >
          {aiBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {aiBusy ? 'Generating…' : 'Ask AI'}
        </button>
      </div>
    </div>
  );
};
