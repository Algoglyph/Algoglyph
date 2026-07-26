# ScratchPad / dsadelta - Project Overview & Agent Guidelines

This document provides context and guidelines for AI agents working on the ScratchPad (dsadelta) codebase.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Desktop Packaging**: Electron, electron-builder (entry point: `main.cjs`)
- **Styling**: Tailwind CSS v4, Framer Motion, Vanilla CSS (`src/index.css`)
- **State Management**: Zustand (`src/store/workspaceStore.ts`)
- **Persistence**: IndexedDB (`src/db/indexedDB.ts`)
- **Core Integrations**:
  - `Excalidraw` for canvas/diagramming
  - `Tiptap` for rich-text markdown editing
  - `CodeMirror` + `Wandbox API` for code editing and remote execution

## Architecture & Data Flow

1. **Global State Hub (`Zustand`)**
   - Managed in `src/store/workspaceStore.ts`.
   - Serves as the source of truth for the workspace, active tabs, themes, layouts, and visualizer nodes.
   
2. **Local Persistence (`IndexedDB`)**
   - Handled in `src/db/indexedDB.ts`.
   
   - Auto-saves the `WorkspaceData` state via debouncing.
   - Uses structural cloning to serialize states safely and avoid circular reference errors.

3. **Application Layout (`App.tsx`)**
   - Coordinates dynamic panes.
   - Layout modes include: Canvas-only, Notes-only, Split View, Code Runner (full screen), and Algorithm Visualizer (full screen).
   - Global shortcuts (Ctrl+B, Ctrl+K, Ctrl+F) are registered here.

4. **Drawing Canvas (`Canvas.tsx` & `StructuresPanel.tsx`)**
   - Integrates Excalidraw.
   - Users can drag and drop pre-built Data Structures & Algorithms components (defined in `src/config/dsaStructures.ts`) onto the board.
   - `src/lib/insertStructure.ts` manages the placement of newly inserted structures to avoid overlapping existing drawings.

5. **Notes Editor (`Editor.tsx`)**
   - Implements Tiptap v3.
   - Synchronizes changes to `workspaceStore.ts` by treating the buffer source of truth as Markdown text.
   - Exposed globally for cross-tab search integrations.

6. **Code Runner (`CodeEditor.tsx` & `wandbox.ts`)**
   - Uses CodeMirror for the editor.
   - Connects to the public Wandbox API (`src/lib/wandbox.ts`) for online code compilation and execution across various languages (C++, Java, Python, Go, Rust, JS).

7. **Algorithm Visualizer (`VisualizerWorkspace.tsx` / `VisualizerCanvas.tsx`)**
   - Operates on an infinite pan/zoom plane (`VisualizerCanvas.tsx`).
   - Algorithms are cataloged in `src/config/algorithms.ts` and selected from `AlgorithmSidebar.tsx`.
   - `VisualizerNode.tsx` acts as a movable card representing a single active algorithm playback session.
   - The simulation engine (`src/lib/algorithmFrames.ts`) outputs step-by-step frame data.
   - Frames are mapped to specialized DOM/SVG renderings in `src/components/visualizers/Visualizers.tsx` (e.g., Array Bars, DP Tables, N-Queens Grid, Union-Find Trees).

## Agent Guidelines
- **Modifying Global State**: Any new state properties must be initialized in `src/store/workspaceStore.ts`. If they are meant to be persistent, ensure they are integrated into `saveCurrentWorkspace` and backward-compatible with `indexedDB.ts`.
- **Visualizer Nodes Playback**: Each `VisualizerNode.tsx` manages its own playback timer in local component state. This guarantees that running animations do not cause excessive global re-renders. Do not move rapid playback state into the global Zustand store.
- **Excalidraw Integration**: Treat Excalidraw instances as externally managed. When updating the canvas programmatically, use the `updateScene` API rather than trying to force React to re-render the Excalidraw component.
- **Styling**: Continue using Tailwind CSS v4 utility classes combined with the custom CSS tokens defined in `src/index.css`.
- **Search System**: `src/components/SearchPalette.tsx` implements global text search spanning both canvas text elements and markdown notes across all open tabs. If you add new data forms, consider integrating them into the search index.
