import { dsaStructures } from '../../config/dsaStructures.ts';
import type { CanvasResponse } from './diagramLayout.ts';

export interface LibraryCatalogEntry {
  source: 'static' | 'dsa';
  libraryId: string;
  libraryName: string;
  itemId: string;
  name: string;
  description: string;
  commands: string[];
  width: number;
  height: number;
  hasText: boolean;
  elementCount: number;
}

type LibraryItem = {
  id: string;
  name: string;
  description?: string;
  elements?: Array<Record<string, unknown>>;
};

type LibraryLoader = (libraryId: string) => Promise<LibraryItem[]>;

const STATIC_LIBRARY_PRIORITY = [
  'system-design',
  'architecture-diagram-components',
  'systems-design-components',
  'db-eng',
  'aws-architecture-icons',
  'cloud-design-patterns',
  'decision-flow-control',
  'data-viz',
  'system-design-template',
  'dsa-ii',
];

const normalize = (value: string): string => value
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const queryAliases = new Map([
  ['db', 'database'],
  ['data store', 'database'],
  ['datastore', 'database'],
  ['sql database', 'relational database'],
  ['sql db', 'relational database'],
  ['queue', 'message queue'],
  ['message broker', 'message queue'],
  ['lb', 'load balancer'],
  ['api server', 'application server'],
  ['app server', 'application server'],
  ['web app', 'web application'],
  ['mobile app', 'mobile client'],
  ['object store', 'object storage'],
  ['blob storage', 'object storage'],
  ['user group', 'users'],
]);

const canonicalQuery = (value: string): string => queryAliases.get(normalize(value)) || normalize(value);
const tokens = (value: string): string[] => normalize(value).split(' ').filter((token) => token.length > 1);

const dsaCatalog = (): LibraryCatalogEntry[] => dsaStructures.map((item) => ({
  source: 'dsa',
  libraryId: 'dsa',
  libraryName: 'DSA',
  itemId: item.id,
  name: item.name,
  description: item.description,
  commands: item.commands,
  width: 320,
  height: 230,
  hasText: true,
  elementCount: 1,
}));

export const includeDsaCatalog = (entries: readonly LibraryCatalogEntry[]): LibraryCatalogEntry[] => [
  ...entries,
  ...dsaCatalog(),
];

let catalogPromise: Promise<LibraryCatalogEntry[]> | null = null;

const assetBaseUrl = (): string => {
  const configured = typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/';
  return configured.endsWith('/') ? configured : `${configured}/`;
};

export const loadLibraryCatalog = async (): Promise<LibraryCatalogEntry[]> => {
  if (!catalogPromise) {
    catalogPromise = fetch(`${assetBaseUrl()}libraries/catalog.json`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Library catalog request failed (${response.status}).`);
        return await response.json() as LibraryCatalogEntry[];
      })
      .then(includeDsaCatalog)
      .catch((error) => {
        catalogPromise = null;
        throw error;
      });
  }
  return catalogPromise;
};

const contextScore = (entry: LibraryCatalogEntry, prompt: string): number => {
  const context = normalize(prompt);
  let score = Math.max(0, 12 - STATIC_LIBRARY_PRIORITY.indexOf(entry.libraryId));
  if (/\b(?:aws|amazon|ec2|s3|lambda|vpc|cloudfront|dynamodb)\b/.test(context)) {
    score += entry.libraryId === 'aws-architecture-icons' ? 55 : -5;
  }
  if (/\b(?:system design|architecture|microservice|distributed|gateway|service|load balancer|cache|queue)\b/.test(context)) {
    if (entry.libraryId === 'system-design') score += 34;
    if (entry.libraryId === 'architecture-diagram-components') score += 20;
    if (entry.libraryId === 'systems-design-components') score += 16;
  }
  if (/\b(?:database architecture|database design|database engineering|db engineering|schema|table|index|query plan)\b/.test(context)) {
    if (entry.libraryId === 'db-eng') score += 50;
    if (entry.libraryId === 'system-design') score += 6;
  }
  if (/\b(?:cloud pattern|retry|circuit breaker|saga|event sourcing)\b/.test(context)) {
    if (entry.libraryId === 'cloud-design-patterns') score += 45;
  }
  if (/\b(?:algorithm|data structure|dsa|linked list|binary tree|sorting|searching)\b/.test(context)) {
    if (entry.libraryId === 'dsa') score += 42;
    if (entry.libraryId === 'dsa-ii') score += 28;
  }
  return score;
};

export const resolveLibraryItem = (
  query: string,
  prompt: string,
  catalog: readonly LibraryCatalogEntry[],
  allowPartial = false,
): LibraryCatalogEntry | null => {
  const wanted = canonicalQuery(query);
  if (!wanted) return null;
  const wantedTokens = new Set(tokens(wanted));
  const ranked = catalog.map((entry) => {
    const name = canonicalQuery(entry.name);
    const nameTokens = new Set(tokens(name));
    let score = contextScore(entry, prompt);
    if (name === wanted) score += 150;
    else if (normalize(entry.name) === normalize(query)) score += 145;
    else {
      const overlap = [...wantedTokens].filter((token) => nameTokens.has(token)).length;
      score += overlap * 14;
      const vendorPrefix = name.endsWith(` ${wanted}`) ? name.slice(0, -(wanted.length + 1)) : '';
      if (vendorPrefix && normalize(prompt).includes(vendorPrefix)) score += 140;
      if (allowPartial && wanted.length >= 4 && name.includes(wanted)) score += 72;
      if (allowPartial && name.length >= 4 && wanted.includes(name)) score += 64;
    }
    const descriptionTokens = new Set(tokens(entry.description));
    score += Math.min(18, [...new Set(tokens(prompt))].filter((token) => descriptionTokens.has(token)).length * 3);
    return { entry, score };
  }).sort((a, b) => b.score - a.score || a.entry.elementCount - b.entry.elementCount);
  const best = ranked[0];
  return best && best.score >= (allowPartial ? 92 : 130) ? best.entry : null;
};

const displaySize = (entry: LibraryCatalogEntry): { width: number; height: number; iconHeight: number } => {
  const maxWidth = entry.source === 'dsa' ? 420 : 190;
  const maxHeight = entry.source === 'dsa' ? 300 : 150;
  const scale = Math.min(maxWidth / entry.width, maxHeight / entry.height, entry.source === 'dsa' ? 1 : 1.35);
  const width = Math.max(70, entry.width * scale);
  const iconHeight = Math.max(54, entry.height * scale);
  return { width, iconHeight, height: iconHeight + (entry.hasText ? 0 : 30) };
};

const libraryElement = (
  entry: LibraryCatalogEntry,
  id: string,
  source: Record<string, unknown> = {},
): Record<string, unknown> => {
  const size = displaySize(entry);
  return {
    ...source,
    type: 'library',
    id,
    name: entry.name,
    label: entry.name,
    librarySource: entry.source,
    libraryId: entry.libraryId,
    libraryItemId: entry.itemId,
    libraryHasText: entry.hasText,
    libraryIconHeight: size.iconHeight,
    width: size.width,
    height: size.height,
  };
};

export const createSingleLibraryPlan = (
  userRequest: string,
  catalog: readonly LibraryCatalogEntry[],
): Record<string, unknown> | null => {
  const request = normalize(userRequest);
  if (!request || /\b(?:what|why|explain|define|compare|versus|vs)\b/.test(request)) return null;
  const candidate = request
    .replace(/^(?:please )?(?:draw|create|make|add|insert|show|generate|place|sketch|illustrate)\s+/, '')
    .replace(/^(?:a|an|the)\s+/, '')
    .replace(/\s+(?:icon|symbol|illustration|drawing)$/, '')
    .trim();
  if (!candidate || candidate.split(' ').length > 6 || /\b(?:with|architecture|diagram of)\b|\b(?:linked|connected)\s+to\b/.test(candidate)) {
    return null;
  }
  const match = resolveLibraryItem(candidate, userRequest, catalog, true);
  if (!match) return null;
  return {
    intent: 'illustration',
    layout: 'auto',
    elements: [libraryElement(match, `library-${normalize(match.name).replace(/ /g, '-')}`, { x: 0, y: 0 })],
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const applyLibraryMatches = (
  raw: unknown,
  prompt: string,
  catalog: readonly LibraryCatalogEntry[],
): unknown => {
  if (!isRecord(raw) || !Array.isArray(raw.elements)) return raw;
  return {
    ...raw,
    elements: raw.elements.map((element, index) => {
      if (!isRecord(element)) return element;
      const type = typeof element.type === 'string' ? element.type : '';
      const label = typeof element.name === 'string'
        ? element.name
        : typeof element.label === 'string' ? element.label : '';
      if (!label || !['library', 'rectangle', 'ellipse', 'diamond'].includes(type)) return element;
      const match = resolveLibraryItem(label, prompt, catalog, type === 'library');
      if (!match) {
        return type === 'library' ? { ...element, type: element.role === 'storage' ? 'ellipse' : 'rectangle' } : element;
      }
      const id = typeof element.id === 'string' && element.id.trim() ? element.id : `library-node-${index}`;
      return libraryElement(match, id, element);
    }),
  };
};

export const relevantLibraryNames = (
  prompt: string,
  catalog: readonly LibraryCatalogEntry[],
  limit = 12,
): string[] => {
  const normalizedPrompt = normalize(prompt);
  const matches = catalog
    .filter((entry) => {
      const name = normalize(entry.name);
      return name.length >= 4 && normalizedPrompt.includes(name);
    })
    .sort((a, b) => contextScore(b, prompt) - contextScore(a, prompt));
  return [...new Set(matches.map((entry) => entry.name))].slice(0, limit);
};

const defaultLibraryLoader: LibraryLoader = async (libraryId) => {
  const response = await fetch(`${assetBaseUrl()}libraries/${encodeURIComponent(libraryId)}.json`);
  if (!response.ok) throw new Error(`Library ${libraryId} request failed (${response.status}).`);
  return await response.json() as LibraryItem[];
};

interface AssetBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const boundsOf = (elements: Array<Record<string, unknown>>): AssetBounds => elements.reduce<AssetBounds>(
  (bounds, element) => {
    const x = typeof element.x === 'number' ? element.x : 0;
    const y = typeof element.y === 'number' ? element.y : 0;
    const width = typeof element.width === 'number' ? element.width : 0;
    const height = typeof element.height === 'number' ? element.height : 0;
    const points = Array.isArray(element.points) ? element.points : [];
    const xs = [x, x + width];
    const ys = [y, y + height];
    for (const point of points) {
      if (Array.isArray(point) && typeof point[0] === 'number' && typeof point[1] === 'number') {
        xs.push(x + point[0]);
        ys.push(y + point[1]);
      }
    }
    return {
      minX: Math.min(bounds.minX, ...xs),
      minY: Math.min(bounds.minY, ...ys),
      maxX: Math.max(bounds.maxX, ...xs),
      maxY: Math.max(bounds.maxY, ...ys),
    };
  },
  { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
);

const rewriteBinding = (value: unknown, ids: ReadonlyMap<string, string>): unknown => {
  if (!isRecord(value) || typeof value.elementId !== 'string') return value;
  return { ...value, elementId: ids.get(value.elementId) || value.elementId };
};

const expandLibraryNode = (
  placeholder: Record<string, unknown>,
  elements: Array<Record<string, unknown>>,
): Record<string, unknown>[] => {
  const id = String(placeholder.id);
  const x = Number(placeholder.x) || 0;
  const y = Number(placeholder.y) || 0;
  const width = Number(placeholder.width) || 160;
  const height = Number(placeholder.height) || 100;
  const iconHeight = Math.min(height, Number(placeholder.libraryIconHeight) || height);
  const sourceBounds = boundsOf(elements);
  const sourceWidth = Math.max(1, sourceBounds.maxX - sourceBounds.minX);
  const sourceHeight = Math.max(1, sourceBounds.maxY - sourceBounds.minY);
  const scale = Math.min(width / sourceWidth, iconHeight / sourceHeight);
  const offsetX = x + (width - sourceWidth * scale) / 2 - sourceBounds.minX * scale;
  const offsetY = y + (iconHeight - sourceHeight * scale) / 2 - sourceBounds.minY * scale;
  const instanceGroup = `${id}-library-instance`;
  const idMap = new Map(elements.map((element, index) => [String(element.id || index), `${id}-asset-${index}`]));
  const groupMap = new Map<string, string>();
  const expanded: Record<string, unknown>[] = elements.map((element, index) => {
    const originalId = String(element.id || index);
    const originalGroups = Array.isArray(element.groupIds) ? element.groupIds.filter((group): group is string => typeof group === 'string') : [];
    const groupIds = [...originalGroups.map((group) => {
      if (!groupMap.has(group)) groupMap.set(group, `${id}-group-${groupMap.size}`);
      return groupMap.get(group) as string;
    }), instanceGroup];
    return {
      ...element,
      id: idMap.get(originalId),
      x: offsetX + (Number(element.x) || 0) * scale,
      y: offsetY + (Number(element.y) || 0) * scale,
      ...(typeof element.width === 'number' ? { width: element.width * scale } : {}),
      ...(typeof element.height === 'number' ? { height: element.height * scale } : {}),
      ...(typeof element.fontSize === 'number' ? { fontSize: Math.max(6, element.fontSize * scale) } : {}),
      ...(Array.isArray(element.points)
        ? { points: element.points.map((point) => Array.isArray(point) ? [Number(point[0]) * scale, Number(point[1]) * scale] : point) }
        : {}),
      groupIds,
      startBinding: rewriteBinding(element.startBinding, idMap),
      endBinding: rewriteBinding(element.endBinding, idMap),
      ...(typeof element.containerId === 'string' ? { containerId: idMap.get(element.containerId) || null } : {}),
      ...(Array.isArray(element.boundElements)
        ? { boundElements: element.boundElements.map((binding) => isRecord(binding) && typeof binding.id === 'string'
            ? { ...binding, id: idMap.get(binding.id) || binding.id }
            : binding) }
        : {}),
    };
  });
  const anchor: Record<string, unknown> = {
    type: 'rectangle',
    id,
    x,
    y,
    width,
    height,
    strokeColor: 'transparent',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    opacity: 0,
    roughness: 0,
    groupIds: [instanceGroup],
  };
  if (placeholder.libraryHasText !== true) {
    const caption = String(placeholder.label || placeholder.name || '');
    const captionWidth = Math.min(width, Math.max(30, caption.length * 9));
    expanded.push({
      type: 'text',
      id: `${id}-caption`,
      x: x + (width - captionWidth) / 2,
      y: y + iconHeight + 5,
      text: caption,
      fontSize: 16,
      strokeColor: '#343a40',
      textAlign: 'center',
      groupIds: [instanceGroup],
    });
  }
  return [anchor, ...expanded];
};

const fallbackSkeleton = (placeholder: Record<string, unknown>): Record<string, unknown> => ({
  type: placeholder.role === 'storage' ? 'ellipse' : 'rectangle',
  id: placeholder.id,
  x: placeholder.x,
  y: placeholder.y,
  width: placeholder.width,
  height: placeholder.height,
  strokeColor: '#1971c2',
  backgroundColor: '#e7f5ff',
  fillStyle: 'solid',
  roughness: 1,
  label: { text: String(placeholder.label || placeholder.name || 'Component'), fontSize: 16 },
});

export const hydrateLibrarySkeletons = async (
  response: CanvasResponse,
  loader: LibraryLoader = defaultLibraryLoader,
): Promise<CanvasResponse> => {
  const placeholders = response.skeletons.filter((element) => element.type === 'library');
  if (!placeholders.length) return response;
  const loaded = new Map<string, Promise<LibraryItem[]>>();
  const load = (placeholder: Record<string, unknown>): Promise<LibraryItem[]> => {
    const source = placeholder.librarySource;
    const libraryId = String(placeholder.libraryId || '');
    if (source === 'dsa') {
      const structure = dsaStructures.find((item) => item.id === placeholder.libraryItemId);
      return Promise.resolve(structure ? [{ id: structure.id, name: structure.name, elements: structure.generate(0, 0) }] : []);
    }
    if (!loaded.has(libraryId)) loaded.set(libraryId, loader(libraryId));
    return loaded.get(libraryId) as Promise<LibraryItem[]>;
  };
  const replacements = new Map<string, Record<string, unknown>[]>();
  await Promise.all(placeholders.map(async (placeholder) => {
    const id = String(placeholder.id);
    try {
      const items = await load(placeholder);
      const item = items.find((candidate) => candidate.id === placeholder.libraryItemId);
      replacements.set(id, item?.elements?.length ? expandLibraryNode(placeholder, item.elements) : [fallbackSkeleton(placeholder)]);
    } catch {
      replacements.set(id, [fallbackSkeleton(placeholder)]);
    }
  }));
  return {
    ...response,
    skeletons: response.skeletons.flatMap((element) =>
      element.type === 'library' ? replacements.get(String(element.id)) || [fallbackSkeleton(element)] : [element],
    ),
  };
};
