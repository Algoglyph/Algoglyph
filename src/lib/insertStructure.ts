import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { bindTextContainers } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';

// Vertical gap left between an existing drawing and a newly inserted structure.
const INSERT_GAP = 70;

/**
 * Insert a DSA structure onto the canvas without overlapping existing content.
 *
 * If the canvas is empty the structure is placed near the top of the current
 * viewport. Otherwise it is stacked *below* everything already on the canvas
 * (aligned to the same left edge) so repeated inserts form a vertical column
 * that stays within the window width instead of marching off to the right.
 */
export function insertStructureIntoCanvas(
  structure: DSAStructure,
  onError?: (message: string) => void,
): void {
  const api = (window as any).excalidrawAPI;
  if (!api) {
    onError?.('Canvas is not ready yet');
    return;
  }

  const existing = api.getSceneElements().filter((el: any) => !el.isDeleted);

  let startX: number;
  let startY: number;

  if (existing.length === 0) {
    // Empty canvas → drop it near the top-centre of what the user is looking at,
    // leaving room below for the next inserts to stack.
    const appState = api.getAppState();
    const zoom = appState.zoom.value || 1;
    const scrollX = appState.scrollX || 0;
    const scrollY = appState.scrollY || 0;
    const width = appState.width || window.innerWidth / 2;
    const height = appState.height || window.innerHeight;
    startX = -scrollX + width / 2 / zoom - 100;
    startY = -scrollY + height / 6 / zoom;
  } else {
    // Stack below the current content's bounding box, keeping the same left
    // edge → a tidy vertical column, never a horizontal line.
    let minX = Infinity;
    let maxY = -Infinity;
    for (const el of existing) {
      minX = Math.min(minX, el.x || 0);
      maxY = Math.max(maxY, (el.y || 0) + (el.height || 0));
    }
    startX = minX;
    startY = maxY + INSERT_GAP;
  }

  const skeletons = bindTextContainers(structure.generate(startX, startY));
  const newElements = convertToExcalidrawElements(skeletons, { regenerateIds: false });

  api.updateScene({
    elements: [...api.getSceneElements(), ...newElements],
    commitToHistory: true,
  });

  // Bring the freshly inserted structure into view so it never feels like
  // "nothing happened" when it lands below the current viewport.
  try {
    api.scrollToContent(newElements, { fitToContent: true, animate: true, duration: 300 });
  } catch {
    // scrollToContent is best-effort; ignore if the API shape differs.
  }
}
