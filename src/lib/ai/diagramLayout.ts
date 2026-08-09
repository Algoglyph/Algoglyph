export type CanvasIntent = 'answer' | 'draw' | 'illustration' | 'explain' | 'none';

export type CanvasLayout =
  | 'flow-left-to-right'
  | 'flow-top-to-bottom'
  | 'hierarchical-left-to-right'
  | 'hierarchical-top-down'
  | 'hub-and-spoke'
  | 'layered-top-down'
  | 'network'
  | 'auto';

type ShapeType = 'rectangle' | 'ellipse' | 'diamond';
type LayoutShapeType = ShapeType | 'library';
type Point = { x: number; y: number };
type Box = { x: number; y: number; width: number; height: number };

interface ShapeNode extends Box {
  kind: 'shape';
  type: LayoutShapeType;
  id: string;
  positioned: boolean;
  label?: string;
  group?: string;
  role?: string;
  librarySource?: string;
  libraryId?: string;
  libraryItemId?: string;
  libraryHasText?: boolean;
  libraryIconHeight?: number;
  libraryTemplate?: LibraryTemplateSpec;
}

interface LibraryTextReplacement {
  from: string;
  to: string;
}

interface LibraryTemplateSpec {
  labels?: string[];
  count?: number;
  replace?: LibraryTextReplacement[];
  remove?: string[];
  append?: string[];
  prepend?: string[];
  order?: 'preserve' | 'reverse' | 'ascending' | 'descending';
}

interface TextNode extends Box {
  kind: 'text';
  id: string;
  positioned: boolean;
  text: string;
  fontSize: number;
}

type DiagramNode = ShapeNode | TextNode;

interface EdgeSpec {
  type: 'arrow' | 'line';
  from: string;
  to: string;
  label?: string;
}

interface IllustrationPathSpec {
  type: 'path' | 'arc';
  id: string;
  points: Point[];
  closed: boolean;
  startArrowhead?: 'arrow';
  endArrowhead?: 'arrow';
}

interface RoutedEdge {
  points: Point[];
  segments?: Array<[Point, Point]>;
  labelBox?: Box;
}

interface DiagramBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface CanvasResponse {
  intent: CanvasIntent;
  layout: CanvasLayout;
  skeletons: Record<string, unknown>[];
  qualityWarnings: string[];
}

const SHAPES: ReadonlySet<ShapeType> = new Set(['rectangle', 'ellipse', 'diamond']);
const LAYOUTS: ReadonlySet<CanvasLayout> = new Set([
  'flow-left-to-right',
  'flow-top-to-bottom',
  'hierarchical-left-to-right',
  'hierarchical-top-down',
  'hub-and-spoke',
  'layered-top-down',
  'network',
  'auto',
]);
const MAX_ELEMENTS = 120;
const GRID = 10;
const NODE_GAP = 44;
const TEXT_GAP = 22;
const ROUTE_PADDING = 12;
const ROUTE_STUB = 20;
const ROUTE_LANE_GAPS = [52, 92, 132];
const LAYER_GAP = 140;
const PEER_GAP = 80;

const GROUP_PALETTE = [
  { background: '#e7f5ff', stroke: '#1971c2' },
  { background: '#f3f0ff', stroke: '#7048e8' },
  { background: '#e6fcf5', stroke: '#087f5b' },
  { background: '#fff4e6', stroke: '#d9480f' },
  { background: '#fff9db', stroke: '#e67700' },
  { background: '#f8f0fc', stroke: '#9c36b5' },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const finiteNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const boundedStringList = (value: unknown, limit = 40): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const strings = value
    .slice(0, limit)
    .flatMap((item) => typeof item === 'string' && item.trim() ? [item.trim().slice(0, 80)] : []);
  return strings.length ? strings : undefined;
};

const libraryTemplateFromEntry = (value: unknown): LibraryTemplateSpec | undefined => {
  if (!isRecord(value)) return undefined;
  const labels = boundedStringList(value.labels);
  const remove = boundedStringList(value.remove);
  const append = boundedStringList(value.append);
  const prepend = boundedStringList(value.prepend);
  const replace = Array.isArray(value.replace)
    ? value.replace.slice(0, 40).flatMap((candidate) => {
        if (!isRecord(candidate)) return [];
        const from = asString(candidate.from)?.trim().slice(0, 80);
        const to = asString(candidate.to)?.trim().slice(0, 80);
        return from && to ? [{ from, to }] : [];
      })
    : undefined;
  const count = typeof value.count === 'number' && Number.isFinite(value.count)
    ? Math.round(clamp(value.count, 1, 40))
    : undefined;
  const order = value.order === 'reverse' || value.order === 'ascending' || value.order === 'descending'
    ? value.order
    : value.order === 'preserve' ? 'preserve' : undefined;
  if (!labels && !remove && !append && !prepend && !replace?.length && count === undefined && !order) return undefined;
  return { labels, remove, append, prepend, replace, count, order };
};
const snap = (value: number): number => Math.round(value / GRID) * GRID;
const center = (box: Box): Point => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
const right = (box: Box): number => box.x + box.width;
const bottom = (box: Box): number => box.y + box.height;

const estimateTextBox = (text: string, fontSize: number): Pick<Box, 'width' | 'height'> => {
  const lines = text.split('\n');
  const longestLine = Math.max(1, ...lines.map((line) => line.length));
  return {
    width: clamp(longestLine * fontSize * 0.62 + 8, 24, 680),
    height: Math.max(fontSize * 1.35 * lines.length, fontSize * 1.35),
  };
};

const fittedShapeSize = (
  type: ShapeType,
  label: string | undefined,
  requestedWidth: number,
  requestedHeight: number,
): Pick<Box, 'width' | 'height'> => {
  const labelLength = label?.length ?? 0;
  const labelWidth = clamp(labelLength * 9 + 36, 120, 300);
  const lineCount = Math.max(1, Math.ceil(labelLength / 26));
  let width = clamp(Math.max(requestedWidth, labelWidth), 100, 520);
  let height = clamp(Math.max(requestedHeight, lineCount * 24 + 28), 52, 280);

  if (type === 'ellipse') {
    const diameter = clamp(Math.max(width, height, labelWidth * 1.2), 64, 360);
    width = diameter;
    height = diameter;
  }

  return { width: snap(width), height: snap(height) };
};

const normalizeLayout = (value: unknown): CanvasLayout => {
  const candidate = asString(value) as CanvasLayout | undefined;
  return candidate && LAYOUTS.has(candidate) ? candidate : 'auto';
};

const isHorizontalLayout = (layout: CanvasLayout): boolean =>
  layout === 'flow-left-to-right' || layout === 'hierarchical-left-to-right';

const isVerticalLayout = (layout: CanvasLayout): boolean =>
  layout === 'flow-top-to-bottom' || layout === 'hierarchical-top-down' || layout === 'layered-top-down';

const inferLayout = (layout: CanvasLayout, shapes: ShapeNode[]): CanvasLayout => {
  if (layout !== 'auto' || shapes.length < 2) return layout;
  const centers = shapes.map(center);
  const xSpan = Math.max(...centers.map((point) => point.x)) - Math.min(...centers.map((point) => point.x));
  const ySpan = Math.max(...centers.map((point) => point.y)) - Math.min(...centers.map((point) => point.y));
  if (xSpan > ySpan * 1.35) return 'flow-left-to-right';
  if (ySpan > xSpan * 1.35) return 'flow-top-to-bottom';
  return 'network';
};

const inferStructuralLayout = (layout: CanvasLayout, shapes: ShapeNode[], edges: EdgeSpec[]): CanvasLayout => {
  if (layout !== 'auto' || shapes.every((shape) => shape.positioned)) return inferLayout(layout, shapes);
  if (shapes.length < 2) return layout;

  const knownIds = new Set(shapes.map((shape) => shape.id));
  const validEdges = edges.filter((edge) => knownIds.has(edge.from) && knownIds.has(edge.to));
  const degrees = new Map(shapes.map((shape) => [shape.id, 0]));
  const indegrees = new Map(shapes.map((shape) => [shape.id, 0]));
  for (const edge of validEdges) {
    degrees.set(edge.from, (degrees.get(edge.from) ?? 0) + 1);
    degrees.set(edge.to, (degrees.get(edge.to) ?? 0) + 1);
    indegrees.set(edge.to, (indegrees.get(edge.to) ?? 0) + 1);
  }
  const maxDegree = Math.max(0, ...degrees.values());
  if (shapes.length >= 4 && maxDegree >= Math.ceil(shapes.length * 0.6)) return 'hub-and-spoke';
  if (validEdges.length >= shapes.length) return 'network';
  if ([...indegrees.values()].filter((degree) => degree === 0).length === 1) return 'hierarchical-top-down';
  return 'flow-left-to-right';
};

const graphMaps = (shapes: ShapeNode[], edges: EdgeSpec[]) => {
  const knownIds = new Set(shapes.map((shape) => shape.id));
  const outgoing = new Map(shapes.map((shape) => [shape.id, [] as string[]]));
  const incoming = new Map(shapes.map((shape) => [shape.id, [] as string[]]));
  for (const edge of edges) {
    if (!knownIds.has(edge.from) || !knownIds.has(edge.to)) continue;
    outgoing.get(edge.from)?.push(edge.to);
    incoming.get(edge.to)?.push(edge.from);
  }
  return { incoming, outgoing };
};

const layeredShapeIds = (shapes: ShapeNode[], edges: EdgeSpec[]): string[][] => {
  const { incoming, outgoing } = graphMaps(shapes, edges);
  const indegrees = new Map(shapes.map((shape) => [shape.id, incoming.get(shape.id)?.length ?? 0]));
  const ranks = new Map(shapes.map((shape) => [shape.id, 0]));
  const queue = shapes.filter((shape) => indegrees.get(shape.id) === 0).map((shape) => shape.id);
  const processed = new Set<string>();

  while (queue.length) {
    const id = queue.shift() as string;
    if (processed.has(id)) continue;
    processed.add(id);
    for (const target of outgoing.get(id) ?? []) {
      ranks.set(target, Math.max(ranks.get(target) ?? 0, (ranks.get(id) ?? 0) + 1));
      const remaining = (indegrees.get(target) ?? 1) - 1;
      indegrees.set(target, remaining);
      if (remaining === 0) queue.push(target);
    }
  }

  // Cyclic components have no topological root. Keep their model order, but put
  // them on successive layers so routing still has useful whitespace.
  let fallbackRank = Math.max(0, ...ranks.values());
  for (const shape of shapes) {
    if (!processed.has(shape.id)) ranks.set(shape.id, fallbackRank++);
  }

  const layers = new Map<number, string[]>();
  for (const shape of shapes) {
    const rank = ranks.get(shape.id) ?? 0;
    const layer = layers.get(rank) ?? [];
    layer.push(shape.id);
    layers.set(rank, layer);
  }

  const orderedLayers = [...layers.entries()].sort(([a], [b]) => a - b).map(([, ids]) => ids);
  const previousOrder = new Map<string, number>();
  for (const ids of orderedLayers) {
    ids.sort((a, b) => {
      const aParents = incoming.get(a) ?? [];
      const bParents = incoming.get(b) ?? [];
      const barycenter = (parents: string[]) =>
        parents.length
          ? parents.reduce((total, parent) => total + (previousOrder.get(parent) ?? 0), 0) / parents.length
          : Number.POSITIVE_INFINITY;
      return barycenter(aParents) - barycenter(bParents);
    });
    ids.forEach((id, index) => previousOrder.set(id, index));
  }
  return orderedLayers;
};

const placeLayeredShapes = (shapes: ShapeNode[], edges: EdgeSpec[], horizontal: boolean): void => {
  const byId = new Map(shapes.map((shape) => [shape.id, shape]));
  const layers = layeredShapeIds(shapes, edges);
  const primarySizes = layers.map((ids) =>
    Math.max(...ids.map((id) => {
      const shape = byId.get(id) as ShapeNode;
      return horizontal ? shape.width : shape.height;
    })),
  );
  let primaryCursor = 0;

  layers.forEach((ids, layerIndex) => {
    const peers = ids.map((id) => byId.get(id) as ShapeNode);
    const peerTotal = peers.reduce((total, shape) => total + (horizontal ? shape.height : shape.width), 0)
      + Math.max(0, peers.length - 1) * PEER_GAP;
    let peerCursor = -peerTotal / 2;

    for (const shape of peers) {
      if (horizontal) {
        shape.x = snap(primaryCursor + (primarySizes[layerIndex] - shape.width) / 2);
        shape.y = snap(peerCursor);
        peerCursor += shape.height + PEER_GAP;
      } else {
        shape.x = snap(peerCursor);
        shape.y = snap(primaryCursor + (primarySizes[layerIndex] - shape.height) / 2);
        peerCursor += shape.width + PEER_GAP;
      }
      shape.positioned = true;
    }
    primaryCursor += primarySizes[layerIndex] + LAYER_GAP;
  });
};

const networkOrder = (shapes: ShapeNode[], edges: EdgeSpec[]): ShapeNode[] => {
  const { incoming, outgoing } = graphMaps(shapes, edges);
  const byId = new Map(shapes.map((shape) => [shape.id, shape]));
  const neighbors = new Map(
    shapes.map((shape) => [shape.id, [...new Set([...(incoming.get(shape.id) ?? []), ...(outgoing.get(shape.id) ?? [])])]]),
  );
  const starts = [...shapes].sort((a, b) => (neighbors.get(b.id)?.length ?? 0) - (neighbors.get(a.id)?.length ?? 0));
  const seen = new Set<string>();
  const ordered: ShapeNode[] = [];
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const shape = byId.get(id);
    if (shape) ordered.push(shape);
    for (const neighbor of neighbors.get(id) ?? []) visit(neighbor);
  };
  for (const start of starts) visit(start.id);
  return ordered;
};

const placeRadialShapes = (shapes: ShapeNode[], edges: EdgeSpec[], hubAndSpoke: boolean): void => {
  const ordered = networkOrder(shapes, edges);
  if (!ordered.length) return;
  const degree = (shape: ShapeNode) => edges.filter((edge) => edge.from === shape.id || edge.to === shape.id).length;
  const centerShape = hubAndSpoke
    ? [...ordered].sort((a, b) => Number(b.role === 'primary') - Number(a.role === 'primary') || degree(b) - degree(a))[0]
    : null;
  const ring = centerShape ? ordered.filter((shape) => shape !== centerShape) : ordered;
  const radius = Math.max(220, ring.length * 62);

  if (centerShape) {
    centerShape.x = snap(-centerShape.width / 2);
    centerShape.y = snap(-centerShape.height / 2);
    centerShape.positioned = true;
  }
  ring.forEach((shape, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(1, ring.length);
    shape.x = snap(Math.cos(angle) * radius - shape.width / 2);
    shape.y = snap(Math.sin(angle) * radius - shape.height / 2);
    shape.positioned = true;
  });
};

const placeMissingShapes = (shapes: ShapeNode[], edges: EdgeSpec[], layout: CanvasLayout): void => {
  const missing = shapes.filter((shape) => !shape.positioned);
  if (!missing.length) return;
  if (missing.length !== shapes.length) {
    const maxX = Math.max(0, ...shapes.filter((shape) => shape.positioned).map(right));
    missing.forEach((shape, index) => {
      shape.x = snap(maxX + LAYER_GAP);
      shape.y = snap(index * (shape.height + PEER_GAP));
      shape.positioned = true;
    });
    return;
  }

  if (layout === 'hub-and-spoke' || layout === 'network') {
    placeRadialShapes(shapes, edges, layout === 'hub-and-spoke');
  } else {
    placeLayeredShapes(shapes, edges, isHorizontalLayout(layout));
  }
};

const placeMissingTexts = (texts: TextNode[], shapes: ShapeNode[]): void => {
  const missing = texts.filter((text) => !text.positioned);
  if (!missing.length) return;
  if (!shapes.length) {
    let y = 0;
    for (const text of missing) {
      text.x = 0;
      text.y = snap(y);
      text.positioned = true;
      y += text.height + TEXT_GAP;
    }
    return;
  }

  const minX = Math.min(...shapes.map((shape) => shape.x));
  const minY = Math.min(...shapes.map((shape) => shape.y));
  const totalHeight = missing.reduce((total, text) => total + text.height, 0) + Math.max(0, missing.length - 1) * TEXT_GAP;
  let y = minY - totalHeight - 60;
  for (const text of missing) {
    text.x = snap(minX);
    text.y = snap(y);
    text.positioned = true;
    y += text.height + TEXT_GAP;
  }
};

const alignNearbyLayers = (shapes: ShapeNode[], layout: CanvasLayout): void => {
  const axis = isHorizontalLayout(layout) ? 'x' : isVerticalLayout(layout) ? 'y' : null;
  if (!axis) return;

  const pending = [...shapes].sort((a, b) => center(a)[axis] - center(b)[axis]);
  const clusters: ShapeNode[][] = [];
  for (const shape of pending) {
    const shapeCenter = center(shape)[axis];
    const cluster = clusters.find((items) => {
      const average = items.reduce((sum, item) => sum + center(item)[axis], 0) / items.length;
      return Math.abs(shapeCenter - average) <= 28;
    });
    if (cluster) cluster.push(shape);
    else clusters.push([shape]);
  }

  for (const cluster of clusters) {
    if (cluster.length < 2) continue;
    const alignedCenter = snap(cluster.reduce((sum, item) => sum + center(item)[axis], 0) / cluster.length);
    for (const item of cluster) {
      if (axis === 'x') item.x = alignedCenter - item.width / 2;
      else item.y = alignedCenter - item.height / 2;
    }
  }
};

const paddedOverlap = (a: DiagramNode, b: DiagramNode): { x: number; y: number } | null => {
  const gap = a.kind === 'text' || b.kind === 'text' ? TEXT_GAP : NODE_GAP;
  const overlapX = Math.min(right(a), right(b)) - Math.max(a.x, b.x) + gap;
  const overlapY = Math.min(bottom(a), bottom(b)) - Math.max(a.y, b.y) + gap;
  return overlapX > 0 && overlapY > 0 ? { x: overlapX, y: overlapY } : null;
};

const resolveNodeCollisions = (nodes: DiagramNode[], layout: CanvasLayout): void => {
  for (const node of nodes) {
    node.x = snap(node.x);
    node.y = snap(node.y);
  }

  for (let pass = 0; pass < 32; pass++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const first = nodes[i];
        const second = nodes[j];
        const overlap = paddedOverlap(first, second);
        if (!overlap) continue;

        const firstCenter = center(first);
        const secondCenter = center(second);
        let axis: 'x' | 'y';
        if (isHorizontalLayout(layout)) {
          const sameLayer = Math.abs(firstCenter.x - secondCenter.x) < Math.max(first.width, second.width) * 0.45;
          axis = sameLayer ? 'y' : 'x';
        } else if (isVerticalLayout(layout)) {
          const sameLayer = Math.abs(firstCenter.y - secondCenter.y) < Math.max(first.height, second.height) * 0.45;
          axis = sameLayer ? 'x' : 'y';
        } else {
          axis = overlap.x <= overlap.y ? 'x' : 'y';
        }

        if (axis === 'x') {
          const direction = secondCenter.x >= firstCenter.x ? 1 : -1;
          second.x = snap(second.x + direction * overlap.x);
        } else {
          const direction = secondCenter.y >= firstCenter.y ? 1 : -1;
          second.y = snap(second.y + direction * overlap.y);
        }
        moved = true;
      }
    }
    if (!moved) break;
  }

  // Pairwise relaxation preserves the model's layout well, but dense mixed-size
  // clusters can cycle between valid-looking positions. Finish with a monotonic
  // packing pass: previously placed nodes stay fixed and a remaining conflict is
  // moved only along the layout's secondary axis until it clears every peer.
  // This guarantees that a recoverable model layout never fails the whole draw.
  const packingAxis: 'x' | 'y' = isHorizontalLayout(layout) ? 'y' : 'x';
  const placed: DiagramNode[] = [];
  for (const node of nodes) {
    for (let attempt = 0; attempt <= placed.length; attempt++) {
      const conflicts = placed.filter((other) => paddedOverlap(other, node));
      if (!conflicts.length) break;
      const gap = conflicts.some((other) => other.kind === 'text' || node.kind === 'text') ? TEXT_GAP : NODE_GAP;
      if (packingAxis === 'x') {
        node.x = snap(Math.max(...conflicts.map(right)) + gap);
      } else {
        node.y = snap(Math.max(...conflicts.map(bottom)) + gap);
      }
    }
    placed.push(node);
  }
};

const groupStyle = (
  shape: ShapeNode,
  groupColors: ReadonlyMap<string, number>,
): { background: string; stroke: string } => {
  if (!shape.group) {
    if (shape.type === 'diamond') return { background: '#fff9db', stroke: '#e67700' };
    if (shape.type === 'ellipse') return { background: '#f3f0ff', stroke: '#7048e8' };
    return GROUP_PALETTE[0];
  }
  return GROUP_PALETTE[(groupColors.get(shape.group) ?? 0) % GROUP_PALETTE.length];
};

const shapeSkeleton = (
  shape: ShapeNode,
  groupColors: ReadonlyMap<string, number>,
  isIllustration = false,
): Record<string, unknown> => {
  if (shape.type === 'library') {
    return {
      type: 'library',
      id: shape.id,
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      label: shape.label,
      group: shape.group,
      role: shape.role,
      librarySource: shape.librarySource,
      libraryId: shape.libraryId,
      libraryItemId: shape.libraryItemId,
      libraryHasText: shape.libraryHasText,
      libraryIconHeight: shape.libraryIconHeight,
      libraryTemplate: shape.libraryTemplate,
    };
  }
  const style = groupStyle(shape, groupColors);
  const isPrimary = shape.role === 'primary';
  const isExternal = shape.role === 'external';
  return {
    type: shape.type,
    id: shape.id,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    strokeColor: isExternal ? '#495057' : style.stroke,
    backgroundColor: isIllustration ? 'transparent' : isExternal ? '#f1f3f5' : style.background,
    fillStyle: 'solid',
    strokeWidth: isPrimary ? 2.5 : 1.5,
    roughness: 1,
    ...(isExternal ? { strokeStyle: 'dashed' } : {}),
    ...(shape.label
      ? {
          label: {
            text: shape.label,
            fontSize: isPrimary ? 18 : 16,
            strokeColor: isExternal ? '#343a40' : style.stroke,
            textAlign: 'center',
            verticalAlign: 'middle',
          },
        }
      : {}),
  };
};

const textSkeleton = (node: TextNode): Record<string, unknown> => ({
  type: 'text',
  id: node.id,
  x: node.x,
  y: node.y,
  text: node.text,
  fontSize: node.fontSize,
  strokeColor: '#343a40',
});

const expandBox = (box: Box, padding: number): Box => ({
  x: box.x - padding,
  y: box.y - padding,
  width: box.width + padding * 2,
  height: box.height + padding * 2,
});

const pointInsideBox = (point: Point, box: Box): boolean =>
  point.x >= box.x && point.x <= right(box) && point.y >= box.y && point.y <= bottom(box);

// Liang-Barsky clipping: true when any part of the segment enters the box.
const segmentIntersectsBox = (start: Point, end: Point, box: Box): boolean => {
  if (pointInsideBox(start, box) || pointInsideBox(end, box)) return true;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const p = [-dx, dx, -dy, dy];
  const q = [start.x - box.x, right(box) - start.x, start.y - box.y, bottom(box) - start.y];
  let low = 0;
  let high = 1;

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
      continue;
    }
    const ratio = q[i] / p[i];
    if (p[i] < 0) low = Math.max(low, ratio);
    else high = Math.min(high, ratio);
    if (low > high) return false;
  }
  return high >= 0 && low <= 1;
};

const portTowards = (shape: ShapeNode, target: Point): Point => {
  const origin = center(shape);
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  if (dx === 0 && dy === 0) return origin;
  const halfWidth = shape.width / 2;
  const halfHeight = shape.height / 2;
  let scale: number;

  if (shape.type === 'ellipse') {
    scale = 1 / Math.sqrt((dx * dx) / (halfWidth * halfWidth) + (dy * dy) / (halfHeight * halfHeight));
  } else if (shape.type === 'diamond') {
    scale = 1 / (Math.abs(dx) / halfWidth + Math.abs(dy) / halfHeight);
  } else {
    scale = Math.min(halfWidth / Math.max(Math.abs(dx), 0.0001), halfHeight / Math.max(Math.abs(dy), 0.0001));
  }
  return { x: origin.x + dx * scale, y: origin.y + dy * scale };
};

const sidePorts = (from: ShapeNode, to: ShapeNode, horizontal: boolean): { start: Point; end: Point; direction: number } => {
  const fromCenter = center(from);
  const toCenter = center(to);
  if (horizontal) {
    const direction = toCenter.x >= fromCenter.x ? 1 : -1;
    return {
      start: { x: direction > 0 ? right(from) : from.x, y: fromCenter.y },
      end: { x: direction > 0 ? to.x : right(to), y: toCenter.y },
      direction,
    };
  }
  const direction = toCenter.y >= fromCenter.y ? 1 : -1;
  return {
    start: { x: fromCenter.x, y: direction > 0 ? bottom(from) : from.y },
    end: { x: toCenter.x, y: direction > 0 ? to.y : bottom(to) },
    direction,
  };
};

const samePoint = (a: Point, b: Point): boolean => Math.abs(a.x - b.x) < 0.01 && Math.abs(a.y - b.y) < 0.01;

const compactPolyline = (points: Point[]): Point[] => {
  const distinct = points.filter((point, index) => index === 0 || !samePoint(point, points[index - 1]));
  return distinct.filter((point, index) => {
    if (index === 0 || index === distinct.length - 1) return true;
    const previous = distinct[index - 1];
    const next = distinct[index + 1];
    const sameX = Math.abs(previous.x - point.x) < 0.01 && Math.abs(point.x - next.x) < 0.01;
    const sameY = Math.abs(previous.y - point.y) < 0.01 && Math.abs(point.y - next.y) < 0.01;
    return !sameX && !sameY;
  });
};

const polylineSegments = (points: Point[]): Array<[Point, Point]> =>
  points.slice(1).map((point, index) => [points[index], point]);

const polylineLength = (points: Point[]): number =>
  polylineSegments(points).reduce((sum, [start, end]) => sum + Math.hypot(end.x - start.x, end.y - start.y), 0);

const pointAlongPolyline = (points: Point[], ratio: number): Point => {
  const total = polylineLength(points);
  let remaining = total * ratio;
  for (const [start, end] of polylineSegments(points)) {
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (remaining <= length || length === 0) {
      const part = length === 0 ? 0 : remaining / length;
      return { x: start.x + (end.x - start.x) * part, y: start.y + (end.y - start.y) * part };
    }
    remaining -= length;
  }
  return points[points.length - 1];
};

const orientation = (a: Point, b: Point, c: Point): number =>
  Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));

const between = (value: number, a: number, b: number): boolean => value >= Math.min(a, b) && value <= Math.max(a, b);

const segmentsCross = (a: Point, b: Point, c: Point, d: Point): boolean => {
  if (samePoint(a, c) || samePoint(a, d) || samePoint(b, c) || samePoint(b, d)) return false;
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && between(c.x, a.x, b.x) && between(c.y, a.y, b.y)) return true;
  if (o2 === 0 && between(d.x, a.x, b.x) && between(d.y, a.y, b.y)) return true;
  return false;
};

const boxesOverlap = (a: Box, b: Box): boolean =>
  a.x < right(b) && right(a) > b.x && a.y < bottom(b) && bottom(a) > b.y;

const candidateScore = (
  points: Point[],
  obstacles: DiagramNode[],
  paddedObstacles: Box[],
  existingEdges: RoutedEdge[],
  label: string | undefined,
): { score: number; labelBox?: Box } => {
  const segments = polylineSegments(points);
  let obstacleHits = 0;
  let crossings = 0;
  for (const [start, end] of segments) {
    obstacleHits += paddedObstacles.filter((box) => segmentIntersectsBox(start, end, box)).length;
    for (const routed of existingEdges) {
      crossings += (routed.segments ?? polylineSegments(routed.points)).filter(([otherStart, otherEnd]) =>
        segmentsCross(start, end, otherStart, otherEnd),
      ).length;
    }
  }

  let labelBox: Box | undefined;
  let labelPenalty = 0;
  if (label) {
    const size = estimateTextBox(label, 14);
    const midpoint = pointAlongPolyline(points, 0.5);
    labelBox = { x: midpoint.x - size.width / 2, y: midpoint.y - size.height / 2, ...size };
    if (obstacles.some((node) => boxesOverlap(labelBox as Box, expandBox(node, 6)))) labelPenalty += 20_000;
    if (existingEdges.some((edge) => edge.labelBox && boxesOverlap(labelBox as Box, expandBox(edge.labelBox, 6)))) {
      labelPenalty += 4_000;
    }
  }

  return {
    score: obstacleHits * 100_000 + crossings * 1_500 + labelPenalty + polylineLength(points) + (points.length - 2) * 28,
    labelBox,
  };
};

const routeEdge = (
  edge: EdgeSpec,
  from: ShapeNode,
  to: ShapeNode,
  nodes: DiagramNode[],
  routed: RoutedEdge[],
  layout: CanvasLayout,
  edgeIndex: number,
  globalBounds: DiagramBounds,
): RoutedEdge => {
  const fromCenter = center(from);
  const toCenter = center(to);
  const networkStyle = layout === 'network' || layout === 'hub-and-spoke';
  const preferHorizontal = isHorizontalLayout(layout)
    ? Math.abs(toCenter.x - fromCenter.x) >= NODE_GAP
    : isVerticalLayout(layout)
      ? Math.abs(toCenter.y - fromCenter.y) < NODE_GAP
      : Math.abs(toCenter.x - fromCenter.x) >= Math.abs(toCenter.y - fromCenter.y);
  const obstacles = nodes.filter((node) => node.id !== from.id && node.id !== to.id);
  const paddedObstacles = obstacles.map((node) => expandBox(node, ROUTE_PADDING));
  const candidates: Point[][] = [];

  if (networkStyle) {
    candidates.push([portTowards(from, toCenter), portTowards(to, fromCenter)]);
  }

  const ports = sidePorts(from, to, preferHorizontal);
  if (preferHorizontal) {
    const middleX = snap((ports.start.x + ports.end.x) / 2);
    candidates.push([ports.start, { x: middleX, y: ports.start.y }, { x: middleX, y: ports.end.y }, ports.end]);
    const startStubX = ports.start.x + ports.direction * ROUTE_STUB;
    const endStubX = ports.end.x - ports.direction * ROUTE_STUB;
    for (const gap of ROUTE_LANE_GAPS) {
      for (const laneY of [Math.min(ports.start.y, ports.end.y) - gap, Math.max(ports.start.y, ports.end.y) + gap]) {
        candidates.push([
          ports.start,
          { x: startStubX, y: ports.start.y },
          { x: startStubX, y: laneY },
          { x: endStubX, y: laneY },
          { x: endStubX, y: ports.end.y },
          ports.end,
        ]);
      }
    }
    for (const laneY of [globalBounds.minY - 64 - edgeIndex * 8, globalBounds.maxY + 64 + edgeIndex * 8]) {
      candidates.push([
        ports.start,
        { x: startStubX, y: ports.start.y },
        { x: startStubX, y: laneY },
        { x: endStubX, y: laneY },
        { x: endStubX, y: ports.end.y },
        ports.end,
      ]);
    }
  } else {
    const middleY = snap((ports.start.y + ports.end.y) / 2);
    candidates.push([ports.start, { x: ports.start.x, y: middleY }, { x: ports.end.x, y: middleY }, ports.end]);
    const startStubY = ports.start.y + ports.direction * ROUTE_STUB;
    const endStubY = ports.end.y - ports.direction * ROUTE_STUB;
    for (const gap of ROUTE_LANE_GAPS) {
      for (const laneX of [Math.min(ports.start.x, ports.end.x) - gap, Math.max(ports.start.x, ports.end.x) + gap]) {
        candidates.push([
          ports.start,
          { x: ports.start.x, y: startStubY },
          { x: laneX, y: startStubY },
          { x: laneX, y: endStubY },
          { x: ports.end.x, y: endStubY },
          ports.end,
        ]);
      }
    }
    for (const laneX of [globalBounds.minX - 64 - edgeIndex * 8, globalBounds.maxX + 64 + edgeIndex * 8]) {
      candidates.push([
        ports.start,
        { x: ports.start.x, y: startStubY },
        { x: laneX, y: startStubY },
        { x: laneX, y: endStubY },
        { x: ports.end.x, y: endStubY },
        ports.end,
      ]);
    }
  }

  const ranked = candidates
    .map(compactPolyline)
    .filter((points) => points.length >= 2)
    .map((points) => ({ points, ...candidateScore(points, obstacles, paddedObstacles, routed, edge.label) }))
    .sort((a, b) => a.score - b.score);
  return ranked[0];
};

const edgeSkeleton = (edge: EdgeSpec, route: RoutedEdge, index: number): Record<string, unknown> => {
  const origin = route.points[0];
  return {
    type: edge.type,
    id: `edge-${index}-${edge.from}-${edge.to}`,
    x: origin.x,
    y: origin.y,
    points: route.points.map((point) => [point.x - origin.x, point.y - origin.y]),
    strokeColor: '#495057',
    strokeWidth: 1.5,
    roughness: 1,
    start: { id: edge.from },
    end: { id: edge.to },
    ...(edge.label
      ? {
          label: {
            text: edge.label,
            fontSize: 14,
            strokeColor: '#343a40',
          },
        }
      : {}),
  };
};

const rawPoint = (value: unknown): Point | null => {
  if (!Array.isArray(value) || value.length < 2) return null;
  const [x, y] = value;
  if (typeof x !== 'number' || !Number.isFinite(x) || typeof y !== 'number' || !Number.isFinite(y)) return null;
  return { x: clamp(x, -4000, 4000), y: clamp(y, -4000, 4000) };
};

const illustrationPointsEqual = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

const illustrationPathSkeleton = (path: IllustrationPathSpec): Record<string, unknown> => {
  const points = [...path.points];
  if (path.closed && points.length > 2 && !illustrationPointsEqual(points[0], points[points.length - 1])) {
    points.push(points[0]);
  }
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const arrowed = path.startArrowhead === 'arrow' || path.endArrowhead === 'arrow';
  return {
    type: arrowed ? 'arrow' : 'line',
    id: path.id,
    x: minX,
    y: minY,
    points: points.map((point) => [point.x - minX, point.y - minY]),
    strokeColor: '#495057',
    strokeWidth: 2,
    roughness: 1,
    ...(path.startArrowhead ? { startArrowhead: path.startArrowhead } : {}),
    ...(path.endArrowhead ? { endArrowhead: path.endArrowhead } : {}),
  };
};

const illustrationPathFromEntry = (
  entry: Record<string, unknown>,
  type: 'path' | 'arc',
  sequence: number,
): IllustrationPathSpec | null => {
  let points: Point[] = [];
  if (type === 'path' && Array.isArray(entry.points)) {
    points = entry.points.slice(0, 160).flatMap((point) => {
      const parsed = rawPoint(point);
      return parsed ? [parsed] : [];
    });
  } else if (type === 'arc') {
    const x = clamp(finiteNumber(entry.x, 0), -4000, 4000);
    const y = clamp(finiteNumber(entry.y, 0), -4000, 4000);
    const width = clamp(Math.abs(finiteNumber(entry.width, 240)), 10, 2000);
    const height = clamp(Math.abs(finiteNumber(entry.height, width)), 10, 2000);
    const startAngle = clamp(finiteNumber(entry.startAngle, 0), -1440, 1440);
    const endAngle = clamp(finiteNumber(entry.endAngle, 180), -1440, 1440);
    const sweep = endAngle - startAngle;
    if (Math.abs(sweep) < 1) return null;
    const segmentCount = clamp(Math.ceil(Math.abs(sweep) / 8), 8, 90);
    for (let index = 0; index <= segmentCount; index++) {
      const radians = (startAngle + sweep * index / segmentCount) * Math.PI / 180;
      points.push({
        x: x + width / 2 + Math.cos(radians) * width / 2,
        y: y + height / 2 + Math.sin(radians) * height / 2,
      });
    }
  }
  if (points.length < 2) return null;
  return {
    type,
    id: asString(entry.id) || `illustration-${type}-${sequence}`,
    points,
    closed: entry.closed === true,
    startArrowhead: entry.startArrowhead === 'arrow' ? 'arrow' : undefined,
    endArrowhead: entry.endArrowhead === 'arrow' ? 'arrow' : undefined,
  };
};

const rawIntent = (value: unknown): CanvasIntent =>
  value === 'answer' || value === 'draw' || value === 'illustration' || value === 'explain' ? value : 'none';

export const parseCanvasResponse = (raw: unknown): CanvasResponse => {
  if (!isRecord(raw) || !Array.isArray(raw.elements)) {
    throw new Error('The model response was missing an elements array.');
  }

  const shapes: ShapeNode[] = [];
  const texts: TextNode[] = [];
  const edges: EdgeSpec[] = [];
  const illustrationPaths: IllustrationPathSpec[] = [];
  const ids = new Set<string>();
  let shapeSequence = 0;
  let textSequence = 0;

  for (const entry of raw.elements.slice(0, MAX_ELEMENTS)) {
    if (!isRecord(entry)) continue;
    const type = asString(entry.type);
    if (type && SHAPES.has(type as ShapeType)) {
      const shapeType = type as ShapeType;
      const id = asString(entry.id) || `shape-${shapeSequence++}`;
      if (ids.has(id)) continue;
      ids.add(id);
      const label = asString(entry.label)?.slice(0, 80);
      const size = fittedShapeSize(
        shapeType,
        label,
        finiteNumber(entry.width, 160),
        finiteNumber(entry.height, 64),
      );
      shapes.push({
        kind: 'shape',
        type: shapeType,
        id,
        x: finiteNumber(entry.x, 0),
        y: finiteNumber(entry.y, 0),
        positioned: typeof entry.x === 'number' && Number.isFinite(entry.x)
          && typeof entry.y === 'number' && Number.isFinite(entry.y),
        ...size,
        label,
        group: asString(entry.group)?.slice(0, 40),
        role: asString(entry.role)?.slice(0, 24),
      });
    } else if (type === 'library') {
      const id = asString(entry.id) || `library-${shapeSequence++}`;
      const libraryId = asString(entry.libraryId);
      const libraryItemId = asString(entry.libraryItemId);
      if (!libraryId || !libraryItemId || ids.has(id)) continue;
      ids.add(id);
      shapes.push({
        kind: 'shape',
        type: 'library',
        id,
        x: finiteNumber(entry.x, 0),
        y: finiteNumber(entry.y, 0),
        width: clamp(finiteNumber(entry.width, 160), 40, 480),
        height: clamp(finiteNumber(entry.height, 110), 40, 360),
        positioned: typeof entry.x === 'number' && Number.isFinite(entry.x)
          && typeof entry.y === 'number' && Number.isFinite(entry.y),
        label: (asString(entry.label) || asString(entry.name))?.slice(0, 80),
        group: asString(entry.group)?.slice(0, 40),
        role: asString(entry.role)?.slice(0, 24),
        librarySource: asString(entry.librarySource),
        libraryId,
        libraryItemId,
        libraryHasText: entry.libraryHasText === true,
        libraryIconHeight: clamp(finiteNumber(entry.libraryIconHeight, finiteNumber(entry.height, 110)), 30, 330),
        libraryTemplate: libraryTemplateFromEntry(entry.libraryTemplate),
      });
    } else if (type === 'text') {
      const text = asString(entry.text)?.slice(0, 1200);
      if (!text) continue;
      const fontSize = clamp(finiteNumber(entry.fontSize, 20), 12, 48);
      const size = estimateTextBox(text, fontSize);
      texts.push({
        kind: 'text',
        id: `diagram-text-${textSequence++}`,
        x: finiteNumber(entry.x, 0),
        y: finiteNumber(entry.y, 0),
        positioned: typeof entry.x === 'number' && Number.isFinite(entry.x)
          && typeof entry.y === 'number' && Number.isFinite(entry.y),
        ...size,
        text,
        fontSize,
      });
    } else if (type === 'arrow' || type === 'line') {
      const from = asString(entry.from);
      const to = asString(entry.to);
      if (from && to && from !== to) {
        edges.push({ type, from, to, label: asString(entry.label)?.slice(0, 40) });
      }
    } else if (type === 'path' || type === 'arc') {
      const path = illustrationPathFromEntry(entry, type, illustrationPaths.length);
      if (path && !ids.has(path.id)) {
        ids.add(path.id);
        illustrationPaths.push(path);
      }
    }
  }

  const intent = rawIntent(raw.intent);
  const isIllustration = intent === 'illustration';
  const layout = isIllustration
    ? normalizeLayout(raw.layout)
    : inferStructuralLayout(normalizeLayout(raw.layout), shapes, edges);
  if (!isIllustration) {
    placeMissingShapes(shapes, edges, layout);
    placeMissingTexts(texts, shapes);
    alignNearbyLayers(shapes, layout);
  }
  const nodes: DiagramNode[] = [...shapes, ...texts];
  if (!isIllustration) resolveNodeCollisions(nodes, layout);
  const groupColors = new Map<string, number>();
  for (const shape of shapes) {
    if (shape.group && !groupColors.has(shape.group)) groupColors.set(shape.group, groupColors.size);
  }

  const skeletons: Record<string, unknown>[] = [
    ...shapes.map((shape) => shapeSkeleton(shape, groupColors, isIllustration)),
    ...texts.map(textSkeleton),
    ...illustrationPaths.map(illustrationPathSkeleton),
  ];
  const shapeById = new Map(shapes.map((shape) => [shape.id, shape]));
  const routed: RoutedEdge[] = [];
  const globalBounds = nodes.reduce<DiagramBounds>(
    (bounds, node) => ({
      minX: Math.min(bounds.minX, node.x),
      minY: Math.min(bounds.minY, node.y),
      maxX: Math.max(bounds.maxX, right(node)),
      maxY: Math.max(bounds.maxY, bottom(node)),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
  edges.forEach((edge, index) => {
    const from = shapeById.get(edge.from);
    const to = shapeById.get(edge.to);
    if (!from || !to) return;
    const route = routeEdge(edge, from, to, nodes, routed, layout, index, globalBounds);
    route.segments = polylineSegments(route.points);
    routed.push(route);
    skeletons.push(edgeSkeleton(edge, route, index));
  });

  // Geometry quality is diagnostic, not a reason to discard otherwise valid
  // model output. Node overlaps have already been repaired above; if an unusually
  // dense graph leaves a connector warning, render the best route instead of
  // surfacing a misleading "Could not read the response" failure to the user.
  const qualityWarnings = inspectCanvasLayout(skeletons);
  return { intent, layout, skeletons, qualityWarnings };
};

/** Pure geometry validation used both as the final planning pass and by fixtures. */
export const inspectCanvasLayout = (skeletons: Record<string, unknown>[]): string[] => {
  const boxes = new Map<string, Box>();
  const issues: string[] = [];
  for (const element of skeletons) {
    const type = asString(element.type);
    const id = asString(element.id);
    if (!id) continue;
    if ((type && SHAPES.has(type as ShapeType)) || type === 'library') {
      boxes.set(id, {
        x: finiteNumber(element.x, 0),
        y: finiteNumber(element.y, 0),
        width: finiteNumber(element.width, 0),
        height: finiteNumber(element.height, 0),
      });
    } else if (type === 'text') {
      const text = asString(element.text) || '';
      const size = estimateTextBox(text, finiteNumber(element.fontSize, 20));
      boxes.set(id, { x: finiteNumber(element.x, 0), y: finiteNumber(element.y, 0), ...size });
    }
  }

  const boxEntries = [...boxes.entries()];
  for (let i = 0; i < boxEntries.length; i++) {
    for (let j = i + 1; j < boxEntries.length; j++) {
      if (boxesOverlap(boxEntries[i][1], boxEntries[j][1])) {
        issues.push(`${boxEntries[i][0]} overlaps ${boxEntries[j][0]}`);
      }
    }
  }

  for (const element of skeletons) {
    const type = asString(element.type);
    if ((type !== 'arrow' && type !== 'line') || !Array.isArray(element.points)) continue;
    const origin = { x: finiteNumber(element.x, 0), y: finiteNumber(element.y, 0) };
    const points = element.points.flatMap((point) =>
      Array.isArray(point) && point.length >= 2 && typeof point[0] === 'number' && typeof point[1] === 'number'
        ? [{ x: origin.x + point[0], y: origin.y + point[1] }]
        : [],
    );
    const startId = isRecord(element.start) ? asString(element.start.id) : undefined;
    const endId = isRecord(element.end) ? asString(element.end.id) : undefined;
    for (const [segmentStart, segmentEnd] of polylineSegments(points)) {
      for (const [id, box] of boxEntries) {
        if (id === startId || id === endId) continue;
        if (segmentIntersectsBox(segmentStart, segmentEnd, box)) {
          issues.push(`${asString(element.id) || 'connector'} crosses ${id}`);
        }
      }
    }
  }
  return issues;
};
