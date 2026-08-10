export interface CanvasPlacementAnchor {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  elementIds?: readonly string[];
}

interface ElementBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const elementBounds = (element: Record<string, unknown>): ElementBounds => {
  const x = Number(element.x) || 0;
  const y = Number(element.y) || 0;
  const width = Number(element.width) || 0;
  const height = Number(element.height) || 0;
  const xs = [x, x + width];
  const ys = [y, y + height];
  if (Array.isArray(element.points)) {
    for (const point of element.points) {
      if (!Array.isArray(point)) continue;
      xs.push(x + (Number(point[0]) || 0));
      ys.push(y + (Number(point[1]) || 0));
    }
  }
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};

const groupBounds = (elements: readonly Record<string, unknown>[]): ElementBounds | null => {
  if (!elements.length) return null;
  return elements.reduce<ElementBounds>((bounds, element) => {
    const box = elementBounds(element);
    return {
      minX: Math.min(bounds.minX, box.minX),
      minY: Math.min(bounds.minY, box.minY),
      maxX: Math.max(bounds.maxX, box.maxX),
      maxY: Math.max(bounds.maxY, box.maxY),
    };
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
};

const isSolidObstacle = (element: Record<string, unknown>): boolean => {
  if (element.isDeleted || Number(element.opacity) === 0) return false;
  if (element.type === 'arrow' || element.type === 'line') return false;
  return !(element.type === 'text' && typeof element.containerId === 'string');
};

/**
 * Centre generated content immediately below its originating prompt. If that
 * lane is occupied, move only downward so the prompt/drawing relationship is
 * preserved instead of relocating the result elsewhere on the canvas.
 */
export const placeSkeletonsBelowAnchor = (
  skeletons: readonly Record<string, unknown>[],
  existing: readonly Record<string, unknown>[],
  anchor: CanvasPlacementAnchor,
  gap = 48,
): Record<string, unknown>[] => {
  const sourceBounds = groupBounds(skeletons);
  if (!sourceBounds) return [];
  const sourceWidth = sourceBounds.maxX - sourceBounds.minX;
  const anchorCenterX = (anchor.minX + anchor.maxX) / 2;
  const dx = anchorCenterX - sourceWidth / 2 - sourceBounds.minX;
  let targetTop = anchor.maxY + gap;
  const ignoredIds = new Set(anchor.elementIds || []);
  const obstacles = existing
    .filter((element) => !ignoredIds.has(String(element.id || '')) && isSolidObstacle(element))
    .map(elementBounds);

  for (let pass = 0; pass <= obstacles.length; pass += 1) {
    const candidate = {
      minX: sourceBounds.minX + dx,
      maxX: sourceBounds.maxX + dx,
      minY: targetTop,
      maxY: targetTop + sourceBounds.maxY - sourceBounds.minY,
    };
    const blockers = obstacles.filter((obstacle) =>
      candidate.minX < obstacle.maxX + 16
      && candidate.maxX > obstacle.minX - 16
      && candidate.minY < obstacle.maxY + gap
      && candidate.maxY > obstacle.minY - gap,
    );
    if (!blockers.length) break;
    targetTop = Math.max(...blockers.map((obstacle) => obstacle.maxY)) + gap;
  }

  const dy = targetTop - sourceBounds.minY;
  return skeletons.map((skeleton) => ({
    ...skeleton,
    ...(typeof skeleton.x === 'number' ? { x: skeleton.x + dx } : {}),
    ...(typeof skeleton.y === 'number' ? { y: skeleton.y + dy } : {}),
  }));
};

