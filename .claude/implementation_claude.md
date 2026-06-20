# Implementation Plan for Claude Code: Node-Based Algorithm Visualizer

## Objective
Implement a new "Visualizer" layout mode in the ScratchPad application. This mode acts as a block-based infinite workspace. It must feature a left sidebar of draggable algorithm templates, and an infinite 2D canvas where users can drop interactive algorithm visualization blocks. 

Each dropped block must act like a block/node in a block-based framework (): freely movable around the canvas, independent, and equipped with its own internal playback controls (Play, Pause, Step).

## Design & Architecture Directives (Vercel Standards)
You must apply premium modern web design and Vercel-level React best practices:
1. **Frontend Design**: Use polished, premium aesthetics. Implement glassmorphism for node backgrounds, subtle 1px borders (`ring-1 ring-white/10`), modern typography, and high-quality dark-mode contrast. 
2. **Vercel Composition Patterns**: Build the visualizer nodes using compound component patterns (e.g., `<VisNode>`, `<VisNode.Header>`, `<VisNode.Canvas>`, `<VisNode.Controls>`) to keep the code scalable and clean.
3. **Performance Optimization**: Ensure the infinite canvas sis highly performant. Use proper React memoization so that playing an animation inside one node doesn't re-render the entire canvas or other nodes.
4. **Smooth Animations**: Rely entirely on `framer-motion` for the 2D illustrations inside the nodes (e.g., array elements swapping) to ensure buttery smooth layout transitions.

## Layout Integration
1. **Global Store (`workspaceStore.ts`)**: Update `LayoutMode` to include `'visualizer'`.
2. **Toolbar (`Toolbar.tsx`)**: Add a new layout toggle button for the Visualizer (use a Lucide icon like `PlaySquare` or `BoxSelect`).
3. **App Layout (`App.tsx`)**: Conditionally render the new `<VisualizerWorkspace />` when the layout mode is active.

## Component Structure

### 1. `VisualizerWorkspace.tsx`
The root component for this mode. It contains the Sidebar and the Infinite Canvas.

### 2. `AlgorithmSidebar.tsx` (Left Sidebar)
A sidebar similar to the existing `StructuresPanel`. It lists all algorithms categorized by type. Users can drag these items.
**Required Algorithms (Interview Prep Focus):**
- **Sorting**: Bubble Sort, Merge Sort, Quick Sort
- **Searching**: Binary Search
- **Graph & Trees**: BFS, DFS, Dijkstra's Algorithm, Topological Sort
- **Pointers & Arrays**: Two Pointers, Sliding Window
- **Advanced**: Dynamic Programming (e.g., 0/1 Knapsack), Backtracking (e.g., N-Queens), Union-Find

### 3. `VisualizerCanvas.tsx` (The Main Right Workspace)
An infinite, pannable, and zoomable 2D workspace (you can implement a simple CSS transform-based pan/zoom or use a lightweight library). It acts as a drop target for the algorithms.

### 4. `VisualizerNode.tsx` (The Draggable Blocks)
When an algorithm is dropped on the canvas, it renders as a "Node".
- **Header**: Contains the algorithm title and acts as the drag handle to move the node around the canvas.
- **Body**: The 2D visualization area powered by `framer-motion` (e.g., array bars, tree SVG nodes).
- **Footer/Controls**: Play, Pause, Step Back, Step Forward, and Reset buttons.

## State Management
Update `workspaceStore.ts` to track the state of the visualizer canvas:
```typescript
interface VisualizerNodeData {
  id: string;
  algorithmId: string;
  x: number;
  y: number;
  // internal algorithm state (current step, inputs, etc.)
}
```

## Getting Started
1. Install necessary dependencies: `npm install framer-motion` (and a drag-and-drop or panning library if you deem it necessary for the infinite canvas).
2. Scaffold the `VisualizerWorkspace` and hook it into `App.tsx` and the `Toolbar`.
3. Implement the `AlgorithmSidebar` and the base `VisualizerCanvas` drop target.
4. Build the first `VisualizerNode` (e.g., Bubble Sort) to perfect the Framer Motion layout transitions before scaling to the other algorithms.
