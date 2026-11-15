import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { placeSkeletonsBelowAnchor, type CanvasPlacementAnchor } from './canvasPlacement';
import type { CanvasPointer } from '../workspaces/canvasCollaboration';

type CanvasApi = {
  getSceneElements: () => any[];
  getSceneElementsIncludingDeleted?: () => any[];
  updateScene: (update: { elements?: any[]; commitToHistory?: boolean }) => void;
  scrollToContent?: (elements: any[], options?: Record<string, unknown>) => void;
};

interface CanvasDrawingOptions {
  api: CanvasApi;
  anchor: CanvasPlacementAnchor;
  signal?: AbortSignal;
  onCursor: (pointer: CanvasPointer | null) => void;
  onError?: (message: string) => void;
  onLimit?: () => void;
}

const ELEMENT_ANIMATION_MS = 150;
const MAX_TOTAL_ANIMATION_MS = 5_000;
const MAX_ELEMENTS_PER_ACTION = 96;

const randomId = () => crypto.randomUUID().replaceAll('-', '').slice(0, 20);
const randomNonce = () => Math.floor(Math.random() * 2_147_483_647);
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const pointAlong = (points: number[][], progress: number): [number, number] => {
  if (!points.length) return [0, 0];
  if (points.length === 1) return [points[0]?.[0] ?? 0, points[0]?.[1] ?? 0];
  const lengths = points.slice(1).map((point, index) => {
    const previous = points[index] ?? [0, 0];
    return Math.hypot((point[0] ?? 0) - (previous[0] ?? 0), (point[1] ?? 0) - (previous[1] ?? 0));
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total <= 0) return [points[0]?.[0] ?? 0, points[0]?.[1] ?? 0];
  let remaining = total * progress;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index] ?? 0;
    const start = points[index] ?? [0, 0];
    const end = points[index + 1] ?? start;
    if (remaining <= length || index === lengths.length - 1) {
      const ratio = length ? Math.min(1, remaining / length) : 1;
      return [
        (start[0] ?? 0) + ((end[0] ?? 0) - (start[0] ?? 0)) * ratio,
        (start[1] ?? 0) + ((end[1] ?? 0) - (start[1] ?? 0)) * ratio,
      ];
    }
    remaining -= length;
  }
  const last = points[points.length - 1] ?? [0, 0];
  return [last[0] ?? 0, last[1] ?? 0];
};

const revealedPoints = (points: number[][], progress: number): number[][] => {
  if (points.length < 2 || progress >= 1) return points.map((point) => [...point]);
  const lengths = points.slice(1).map((point, index) => {
    const previous = points[index] ?? [0, 0];
    return Math.hypot((point[0] ?? 0) - (previous[0] ?? 0), (point[1] ?? 0) - (previous[1] ?? 0));
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const target = total * progress;
  const visible = [points[0]?.slice() ?? [0, 0]];
  let traversed = 0;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index] ?? 0;
    const start = points[index] ?? [0, 0];
    const end = points[index + 1] ?? start;
    if (traversed + length <= target) {
      visible.push(end.slice());
      traversed += length;
      continue;
    }
    const ratio = length ? Math.max(0, Math.min(1, (target - traversed) / length)) : 1;
    visible.push([
      (start[0] ?? 0) + ((end[0] ?? 0) - (start[0] ?? 0)) * ratio,
      (start[1] ?? 0) + ((end[1] ?? 0) - (start[1] ?? 0)) * ratio,
    ]);
    break;
  }
  return visible.length > 1 ? visible : [visible[0] ?? [0, 0], visible[0] ?? [0, 0]];
};

const shapeOutlinePoint = (element: any, progress: number): [number, number] => {
  const x = Number(element.x) || 0;
  const y = Number(element.y) || 0;
  const width = Math.max(1, Number(element.width) || 1);
  const height = Math.max(1, Number(element.height) || 1);
  if (element.type === 'ellipse') {
    const angle = -Math.PI / 2 + Math.PI * 2 * progress;
    return [x + width / 2 + Math.cos(angle) * width / 2, y + height / 2 + Math.sin(angle) * height / 2];
  }
  if (element.type === 'diamond') {
    return pointAlong([
      [x + width / 2, y],
      [x + width, y + height / 2],
      [x + width / 2, y + height],
      [x, y + height / 2],
      [x + width / 2, y],
    ], progress);
  }
  const perimeter = 2 * (width + height);
  let distance = perimeter * progress;
  if (distance <= width) return [x + distance, y];
  distance -= width;
  if (distance <= height) return [x + width, y + distance];
  distance -= height;
  if (distance <= width) return [x + width - distance, y + height];
  distance -= width;
  return [x, y + height - Math.min(height, distance)];
};

export class CanvasDrawingSession {
  private readonly options: CanvasDrawingOptions;
  private readonly idMap = new Map<string, string>();
  private offset: { x: number; y: number } | null = null;
  private pending = Promise.resolve();
  private closed = false;
  private enqueued = 0;
  private drawn = 0;
  private animationSpentMs = 0;
  private lastCursor: [number, number] | null = null;
  private readonly drawnElements: any[] = [];

  constructor(options: CanvasDrawingOptions) {
    this.options = options;
  }

  enqueue(skeletons: Record<string, unknown>[]): void {
    if (this.closed || this.options.signal?.aborted || !skeletons.length) return;
    const remaining = MAX_ELEMENTS_PER_ACTION - this.enqueued;
    if (remaining <= 0) {
      this.options.onLimit?.();
      this.closed = true;
      return;
    }
    const accepted = skeletons.slice(0, remaining);
    if (accepted.length < skeletons.length) this.options.onLimit?.();
    this.enqueued += accepted.length;
    this.pending = this.pending.then(() => this.drawBatch(accepted)).catch((error: unknown) => {
      this.options.onError?.(error instanceof Error ? error.message : 'An AI drawing step could not be added.');
    });
  }

  async finish(): Promise<number> {
    this.closed = true;
    await this.pending;
    this.options.onCursor(null);
    if (this.drawnElements.length) {
      try {
        this.options.api.scrollToContent?.(this.drawnElements, { fitToContent: true, animate: false });
      } catch {
        // Scrolling is best-effort.
      }
    }
    return this.drawn;
  }

  private async drawBatch(skeletons: Record<string, unknown>[]): Promise<void> {
    if (this.options.signal?.aborted) return;
    const existing = this.getElements();
    const prepared = skeletons.map((skeleton) => ({ ...skeleton }));
    if (!this.offset) {
      const placed = placeSkeletonsBelowAnchor(prepared, existing, this.options.anchor);
      const sourceX = Number(prepared[0]?.x) || 0;
      const sourceY = Number(prepared[0]?.y) || 0;
      this.offset = {
        x: (Number(placed[0]?.x) || 0) - sourceX,
        y: (Number(placed[0]?.y) || 0) - sourceY,
      };
    }
    const idAssignments = new Map<string, string>();
    prepared.forEach((skeleton) => {
      const modelId = typeof skeleton.id === 'string' ? skeleton.id : null;
      if (!modelId) return;
      if (!this.idMap.has(modelId)) this.idMap.set(modelId, randomId());
      idAssignments.set(modelId, this.idMap.get(modelId) as string);
    });
    const remapped = prepared.map((skeleton) => {
      const originalId = typeof skeleton.id === 'string' ? skeleton.id : null;
      const next: Record<string, any> = {
        ...skeleton,
        ...(originalId ? { id: idAssignments.get(originalId) } : {}),
        ...(typeof skeleton.x === 'number' ? { x: skeleton.x + this.offset!.x } : {}),
        ...(typeof skeleton.y === 'number' ? { y: skeleton.y + this.offset!.y } : {}),
      };
      for (const key of ['start', 'end'] as const) {
        const binding = next[key];
        if (binding && typeof binding === 'object' && typeof binding.id === 'string') {
          next[key] = { ...binding, id: idAssignments.get(binding.id) ?? this.idMap.get(binding.id) ?? binding.id };
        }
      }
      return next;
    });
    const newElements = convertToExcalidrawElements(remapped as any, { regenerateIds: false }) as any[];
    if (!newElements.length) return;
    if (this.animationSpentMs >= MAX_TOTAL_ANIMATION_MS) {
      this.commit(newElements);
      this.drawnElements.push(...newElements);
      this.drawn += skeletons.length;
      return;
    }
    for (let index = 0; index < newElements.length; index += 1) {
      if (this.options.signal?.aborted) {
        break;
      }
      const element = newElements[index];
      if (!element) continue;
      const animateThis = this.canAnimate(element);
      if (animateThis) await this.animateElement(element);
      else await this.moveCursorToElement(element);
      if (!animateThis) this.replacePreview(element);
    }
    this.commit(newElements);
    this.drawnElements.push(...newElements);
    this.drawn += skeletons.length;
  }

  private canAnimate(element: any): boolean {
    return ['rectangle', 'ellipse', 'diamond', 'line', 'arrow', 'freedraw'].includes(element.type)
      && (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond'
        ? Number(element.width) > 0 && Number(element.height) > 0
        : Array.isArray(element.points) && element.points.length >= 2);
  }

  private async animateElement(finalElement: any): Promise<void> {
    const duration = Math.min(ELEMENT_ANIMATION_MS, MAX_TOTAL_ANIMATION_MS - this.animationSpentMs);
    const started = performance.now();
    const initialX = Number(finalElement.x) || 0;
    const initialY = Number(finalElement.y) || 0;
    const finalPoints = Array.isArray(finalElement.points)
      ? finalElement.points.map((point: number[]) => [...point])
      : [];
    const unbound = { ...finalElement };
    delete unbound.boundElements;
    delete unbound.startBinding;
    delete unbound.endBinding;
    let lastVersion = Number(finalElement.version) || 1;
    while (true) {
      const progress = Math.min(1, (performance.now() - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      let partial = { ...unbound };
      let pointer: [number, number];
      if (['rectangle', 'ellipse', 'diamond'].includes(finalElement.type)) {
        partial = {
          ...partial,
          width: Math.max(1, Number(finalElement.width) * eased),
          height: Math.max(1, Number(finalElement.height) * eased),
        };
        pointer = shapeOutlinePoint(finalElement, eased);
      } else {
        const points = revealedPoints(finalPoints, eased);
        partial = { ...partial, points };
        const point = pointAlong(finalPoints, eased);
        pointer = [initialX + point[0], initialY + point[1]];
      }
      lastVersion += 1;
      partial = { ...partial, version: lastVersion, versionNonce: randomNonce() };
      this.setCursor(pointer, 'down');
      this.replacePreview(partial);
      if (progress >= 1 || this.options.signal?.aborted) break;
      await nextFrame();
    }
    this.animationSpentMs += Math.min(duration, performance.now() - started);
    if (this.options.signal?.aborted) {
      this.replacePreview(finalElement);
      this.lastCursor = shapeOutlinePoint(finalElement, 1);
    }
  }

  private async moveCursorToElement(element: any): Promise<void> {
    const x = Number(element.x) || 0;
    const y = Number(element.y) || 0;
    const target: [number, number] = [x + Math.max(1, Number(element.width) || 1) / 2, y + Math.max(1, Number(element.height) || 1) / 2];
    const start = this.lastCursor ?? target;
    const duration = Math.min(80, MAX_TOTAL_ANIMATION_MS - this.animationSpentMs);
    const started = performance.now();
    let progress = 0;
    while (progress < 1 && !this.options.signal?.aborted && duration > 0) {
      progress = Math.min(1, (performance.now() - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      this.setCursor([start[0] + (target[0] - start[0]) * eased, start[1] + (target[1] - start[1]) * eased], 'up');
      await nextFrame();
    }
    this.animationSpentMs += Math.min(duration, performance.now() - started);
    this.lastCursor = target;
  }

  private setCursor(point: [number, number], button: 'up' | 'down'): void {
    this.lastCursor = point;
    this.options.onCursor({ x: point[0], y: point[1], tool: 'pointer', button });
  }

  private replacePreview(element: any): void {
    const current = this.getElements();
    const index = current.findIndex((item) => item.id === element.id);
    const next = current.slice();
    if (index === -1) next.push(element);
    else next[index] = element;
    this.options.api.updateScene({ elements: next, commitToHistory: false });
  }

  private commit(elements: any[]): void {
    const scene = this.getElements();
    const ids = new Set(elements.map((element) => element.id));
    const existingUpdates = new Map<string, any>();
    elements.forEach((element) => {
      if (element.type !== 'arrow') return;
      for (const binding of [element.startBinding, element.endBinding]) {
        const boundId = binding?.elementId;
        if (typeof boundId !== 'string' || ids.has(boundId)) continue;
        const boundShape = existingUpdates.get(boundId) ?? scene.find((candidate) => candidate.id === boundId);
        if (!boundShape) continue;
        const boundElements = Array.isArray(boundShape.boundElements) ? boundShape.boundElements : [];
        if (boundElements.some((bound: any) => bound.id === element.id)) continue;
        existingUpdates.set(boundId, {
          ...boundShape,
          boundElements: [...boundElements, { id: element.id, type: 'arrow' }],
          version: (Number(boundShape.version) || 1) + 1,
          versionNonce: randomNonce(),
        });
      }
    });
    const existing = scene
      .filter((element) => !ids.has(element.id))
      .map((element) => existingUpdates.get(element.id) ?? element);
    const baseVersion = Math.max(1, ...scene.filter((element) => ids.has(element.id)).map((element) => Number(element.version) || 1));
    const finalElements = elements.map((element) => ({
      ...element,
      version: Math.max(Number(element.version) || 1, baseVersion + 1),
      versionNonce: randomNonce(),
    }));
    this.options.api.updateScene({ elements: [...existing, ...finalElements], commitToHistory: true });
  }

  private getElements(): any[] {
    return this.options.api.getSceneElementsIncludingDeleted?.() ?? this.options.api.getSceneElements();
  }
}
