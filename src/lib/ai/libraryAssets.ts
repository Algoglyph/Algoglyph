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
const boundedTemplateText = (value: string): string => value.trim().replace(/^['"`]|['"`]$/g, '').slice(0, 80);

const parseTemplateList = (value: string): string[] => {
  const source = value
    .replace(/^\s*[\[(]/, '')
    .replace(/[\])].*$/, '')
    .replace(/\b(?:in|with)\s+(?:ascending|descending|reverse)\s+order\b.*$/i, '');
  const quoted = [...source.matchAll(/['"`]([^'"`]+)['"`]/g)].map((match) => boundedTemplateText(match[1]));
  if (quoted.length) return quoted.filter(Boolean).slice(0, 40);
  const parts = source.includes(',') || source.includes('->')
    ? source.split(/\s*(?:,|->|\band\b)\s*/i)
    : source.trim().split(/\s+/).every((part) => /^-?\d+(?:\.\d+)?$|^[a-z]$/i.test(part))
      ? source.trim().split(/\s+/)
      : [source];
  return parts.map(boundedTemplateText).filter(Boolean).slice(0, 40);
};

const inferTemplateSpec = (request: string): LibraryTemplateSpec | undefined => {
  const labelsMatch = request.match(
    /\b(?:values?|labels?|entries|items?|elements?|cells?)\b\s*(?:are|of|=|:)?\s*(\[[^\]]+\]|[^.;]+?)(?=\s+\b(?:with\s+)?(?:width|height|size|count|length)\b|$)/i,
  );
  const labels = labelsMatch ? parseTemplateList(labelsMatch[1]) : undefined;
  const countMatch = request.match(/\b(\d{1,2})\s*[- ]?(?:nodes?|elements?|items?|cells?|entries)\b/i)
    || request.match(/\b(?:size|length|count)\s*(?:of|=|:)?\s*(\d{1,2})\b/i);
  const count = countMatch ? Math.max(1, Math.min(40, Number(countMatch[1]))) : undefined;
  const replace = [...request.matchAll(
    /\b(?:replace|rename|change)\s+['"`]?([^,'"`;]+?)['"`]?\s+(?:with|to)\s+['"`]?([^,;'"`]+)['"`]?/gi,
  )].slice(0, 40).flatMap((match) => {
    const from = boundedTemplateText(match[1]);
    const to = boundedTemplateText(match[2]);
    return from && to ? [{ from, to }] : [];
  });
  const mutationList = (verb: string): string[] | undefined => {
    const match = request.match(new RegExp(`\\b(?:${verb})\\s+(?:values?|labels?|items?|elements?)?\\s*([^.;]+)$`, 'i'));
    if (!match || /\b(?:node|element|item|cell)s?\b/i.test(match[1])) return undefined;
    const values = parseTemplateList(match[1]);
    return values.length ? values : undefined;
  };
  const append = mutationList('add|append');
  const prepend = mutationList('prepend');
  const remove = mutationList('remove|delete');
  const order = /\b(?:reverse|reversed)\s+order\b|\breverse\b/i.test(request)
    ? 'reverse'
    : /\bdescending\s+order\b|\bsort(?:ed)?\s+descending\b/i.test(request)
      ? 'descending'
      : /\bascending\s+order\b|\bsort(?:ed)?\s+ascending\b/i.test(request) ? 'ascending' : undefined;
  if (!labels?.length && count === undefined && !replace.length && !append && !prepend && !remove && !order) return undefined;
  return {
    ...(labels?.length ? { labels } : {}),
    ...(count !== undefined ? { count } : {}),
    ...(replace.length ? { replace } : {}),
    ...(append ? { append } : {}),
    ...(prepend ? { prepend } : {}),
    ...(remove ? { remove } : {}),
    ...(order ? { order } : {}),
  };
};

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
  if (/\b(?:nodes?|elements?|values?|entries|cells?|length|size)\b/.test(context)) {
    if (entry.libraryId === 'dsa') score += 36;
    if (entry.libraryId === 'dsa-ii') score += 20;
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
    label: typeof source.label === 'string' && source.label.trim() ? source.label : entry.name,
    librarySource: entry.source,
    libraryId: entry.libraryId,
    libraryItemId: entry.itemId,
    libraryHasText: entry.hasText,
    libraryIconHeight: size.iconHeight,
    width: typeof source.width === 'number' && Number.isFinite(source.width) ? source.width : size.width,
    height: typeof source.height === 'number' && Number.isFinite(source.height) ? source.height : size.height,
  };
};

const libraryMatchFromRequest = (
  request: string,
  prompt: string,
  catalog: readonly LibraryCatalogEntry[],
): LibraryCatalogEntry | null => {
  const exactNames = [...new Set(catalog
    .map((entry) => canonicalQuery(entry.name))
    .filter((name) => name.length >= 3 && request.includes(name)))]
    .sort((left, right) => right.length - left.length);
  if (exactNames.length) return resolveLibraryItem(exactNames[0], prompt, catalog, true);
  const stripped = request
    .replace(/\b\d{1,2}\s*[- ]?(?:nodes?|elements?|items?|cells?|entries)\b/g, '')
    .replace(/\b(?:size|length|count)\s*(?:of|=|:)?\s*\d{1,2}\b/g, '')
    .replace(/\b(?:values?|labels?|entries|items?|elements?|cells?)\b\s*(?:are|of|=|:)?\s*(?:\[[^\]]+\]|.+)$/g, '')
    .replace(/\b(?:in\s+)?(?:reverse|ascending|descending)\s+order\b/g, '')
    .replace(/\b(?:with|having|containing)\b.*$/g, '')
    .trim();
  return resolveLibraryItem(stripped, prompt, catalog, true);
};

const isCompositionalRequest = (
  candidate: string,
  catalog: readonly LibraryCatalogEntry[],
): boolean => {
  if (
    /\b(?:link|connect|attach|join|wire|route|send|feed|forward|bridge|pair|integrate)\b/.test(candidate)
    || /\b(?:linked|connected|attached|joined|wired|routed|integrated)\s+(?:to|with|and|through|via|into)\b/.test(candidate)
    || /\b(?:flows?|feeds?|sends?|routes?|points?)\s+(?:to|through|into|from|via)\b/.test(candidate)
    || /\bfrom\b.+\bto\b|\bbetween\b|\bnext\s+to\b|\b(?:above|below|beside|inside|outside|around)\b/.test(candidate)
  ) return true;

  const mentionedNames = new Set(catalog
    .map((entry) => canonicalQuery(entry.name))
    .filter((name) => name.length >= 3 && candidate.includes(name)));
  if (mentionedNames.size > 1 && [...mentionedNames].some((name) =>
    [...mentionedNames].some((other) => name !== other && !name.includes(other) && !other.includes(name)),
  )) return true;

  const withClause = candidate.match(/\bwith\s+(.+)$/)?.[1];
  if (withClause && !/^(?:(?:a\s+)?(?:label|text|name|title|caption|values?|labels?|items?|elements?|entries|size|width|height|dimensions?|count|length|color|colour|style|order)\b|\d{1,2}\s*(?:nodes?|cells?|items?|elements?|entries)\b)/.test(withClause)) {
    return true;
  }
  return /\band\b/.test(candidate)
    && !/\b(?:values?|labels?|items?|elements?|entries)\b.*\band\b/.test(candidate);
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
  if (!candidate || /\b(?:architecture|diagram of)\b/.test(candidate) || isCompositionalRequest(candidate, catalog)) {
    return null;
  }
  const match = libraryMatchFromRequest(candidate, userRequest, catalog);
  if (!match) return null;
  const libraryTemplate = inferTemplateSpec(userRequest);
  if (!libraryTemplate && candidate.split(' ').length > 6) return null;
  const dimensions = userRequest.match(/\b(\d{2,4})\s*[x*]\s*(\d{2,4})\b/i);
  const widthMatch = userRequest.match(/\bwidth\s*(?:of|=|:)?\s*(\d{2,4})\b/i);
  const heightMatch = userRequest.match(/\bheight\s*(?:of|=|:)?\s*(\d{2,4})\b/i);
  const width = dimensions ? Number(dimensions[1]) : widthMatch ? Number(widthMatch[1]) : undefined;
  const height = dimensions ? Number(dimensions[2]) : heightMatch ? Number(heightMatch[1]) : undefined;
  return {
    intent: 'illustration',
    layout: 'auto',
    elements: [libraryElement(match, `library-${normalize(match.name).replace(/ /g, '-')}`, {
      x: 0,
      y: 0,
      ...(width !== undefined ? { width: Math.max(40, Math.min(480, width)) } : {}),
      ...(height !== undefined ? { height: Math.max(40, Math.min(360, height)) } : {}),
      ...(libraryTemplate ? { libraryTemplate } : {}),
    })],
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
      const libraryTemplate = isRecord(element.libraryTemplate)
        ? element.libraryTemplate
        : isRecord(element.template) ? element.template : undefined;
      return libraryElement(match, id, { ...element, ...(libraryTemplate ? { libraryTemplate } : {}) });
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

const elementText = (element: Record<string, unknown>): string | undefined => {
  if (element.type === 'text' && typeof element.text === 'string') return element.text;
  return isRecord(element.label) && typeof element.label.text === 'string' ? element.label.text : undefined;
};

const withElementText = (element: Record<string, unknown>, text: string): Record<string, unknown> => {
  if (element.type === 'text') return { ...element, text };
  return isRecord(element.label) ? { ...element, label: { ...element.label, text } } : element;
};

const elementBox = (element: Record<string, unknown>): AssetBounds => {
  const x = Number(element.x) || 0;
  const y = Number(element.y) || 0;
  const width = Number(element.width) || 0;
  const height = Number(element.height) || 0;
  const points = Array.isArray(element.points) ? element.points : [];
  const xs = [x, x + width];
  const ys = [y, y + height];
  for (const point of points) {
    if (!Array.isArray(point)) continue;
    xs.push(x + (Number(point[0]) || 0));
    ys.push(y + (Number(point[1]) || 0));
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
};

const elementCenter = (element: Record<string, unknown>): { x: number; y: number } => {
  const box = elementBox(element);
  return { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
};

const visualFingerprint = (element: Record<string, unknown>): string => {
  const rounded = (value: unknown): number => Math.round((Number(value) || 0) / 5) * 5;
  return [
    element.type,
    rounded(element.width),
    rounded(element.height),
    rounded(element.fontSize),
    element.strokeColor,
    element.backgroundColor,
    element.fillStyle,
    element.strokeStyle,
  ].join('|');
};

const orderedSlotIndexes = (
  elements: Array<Record<string, unknown>>,
  indexes: number[],
): number[] => {
  const centers = indexes.map((index) => ({ index, ...elementCenter(elements[index]) }));
  const spanY = Math.max(...centers.map((center) => center.y)) - Math.min(...centers.map((center) => center.y));
  const medianHeight = indexes
    .map((index) => Math.max(1, elementBox(elements[index]).maxY - elementBox(elements[index]).minY))
    .sort((left, right) => left - right)[Math.floor(indexes.length / 2)];
  return centers
    .sort(spanY > Math.max(8, medianHeight * 0.6)
      ? (left, right) => left.y - right.y || left.x - right.x
      : (left, right) => left.x - right.x || left.y - right.y)
    .map((center) => center.index);
};

const templateSlotIndexes = (elements: Array<Record<string, unknown>>): number[] => {
  const labeledShapes = elements.flatMap((element, index) =>
    element.type !== 'text' && elementText(element)?.trim() ? [{ element, index }] : [],
  );
  const candidates = labeledShapes.length
    ? labeledShapes
    : elements.flatMap((element, index) => element.type === 'text' && elementText(element)?.trim() ? [{ element, index }] : []);
  if (!candidates.length) return [];
  const groups = new Map<string, typeof candidates>();
  for (const candidate of candidates) {
    const key = visualFingerprint(candidate.element);
    groups.set(key, [...(groups.get(key) || []), candidate]);
  }
  const best = [...groups.values()].sort((left, right) => {
    const semantic = (group: typeof candidates): number => group.filter(({ element }) => /[a-z0-9]/i.test(elementText(element) || '')).length;
    return right.length - left.length || semantic(right) - semantic(left);
  })[0];
  return orderedSlotIndexes(elements, best.map(({ index }) => index));
};

interface OrdinalAnnotation {
  prefix: string;
  value: number;
  suffix: string;
}

const parseOrdinalAnnotation = (text: string): OrdinalAnnotation | null => {
  const match = text.match(/^(\D*?)(-?\d+)(\D*)$/);
  if (!match) return null;
  const value = Number(match[2]);
  return Number.isSafeInteger(value)
    ? { prefix: match[1], value, suffix: match[3] }
    : null;
};

const ordinalStyleFingerprint = (element: Record<string, unknown>): string => [
  element.type,
  element.fontSize,
  element.fontFamily,
  element.textAlign,
  element.verticalAlign,
  element.strokeColor,
  element.backgroundColor,
].join('|');

const continueAuxiliaryOrdinals = (
  elements: Array<Record<string, unknown>>,
  slots: readonly number[],
  originalSlotCount: number,
): Array<Record<string, unknown>> => {
  if (originalSlotCount < 2 || slots.length <= originalSlotCount) return elements;
  // Standalone text can itself be the template's primary content. Only inspect
  // numeric annotations when the repeated units are actual labeled shapes.
  if (slots.some((slot) => elements[slot].type === 'text')) return elements;

  const groups = new Map<string, Array<{ index: number; ordinal: OrdinalAnnotation }>>();
  elements.forEach((element, index) => {
    if (element.type !== 'text' || typeof element.text !== 'string') return;
    const ordinal = parseOrdinalAnnotation(element.text);
    if (!ordinal) return;
    const key = [
      ordinalStyleFingerprint(element),
      normalize(ordinal.prefix),
      normalize(ordinal.suffix),
    ].join('|');
    groups.set(key, [...(groups.get(key) || []), { index, ordinal }]);
  });

  let result = elements;
  for (const candidates of groups.values()) {
    if (candidates.length !== slots.length) continue;
    const bySlot = new Map<number, (typeof candidates)[number]>();
    let ambiguous = false;
    for (const candidate of candidates) {
      const center = elementCenter(elements[candidate.index]);
      const nearest = slots.reduce((best, slot, slotOrder) => {
        const slotCenter = elementCenter(elements[slot]);
        const distance = Math.hypot(center.x - slotCenter.x, center.y - slotCenter.y);
        return distance < best.distance ? { slotOrder, distance } : best;
      }, { slotOrder: 0, distance: Infinity });
      if (bySlot.has(nearest.slotOrder)) {
        ambiguous = true;
        break;
      }
      bySlot.set(nearest.slotOrder, candidate);
    }
    if (ambiguous || bySlot.size !== slots.length) continue;

    const ordered = slots.map((_, slotOrder) => bySlot.get(slotOrder));
    if (ordered.some((candidate) => !candidate)) continue;
    const original = ordered.slice(0, originalSlotCount) as Array<(typeof candidates)[number]>;
    const deltas = original.slice(1).map((candidate, index) => candidate.ordinal.value - original[index].ordinal.value);
    const step = deltas[0];
    if (!step || deltas.some((delta) => delta !== step)) continue;

    if (result === elements) result = [...elements];
    const start = original[0].ordinal.value;
    for (let slotOrder = originalSlotCount; slotOrder < ordered.length; slotOrder += 1) {
      const candidate = ordered[slotOrder];
      if (!candidate) continue;
      result[candidate.index] = withElementText(
        result[candidate.index],
        `${candidate.ordinal.prefix}${start + step * slotOrder}${candidate.ordinal.suffix}`,
      );
    }
  }
  return result;
};

const cloneElementSet = (
  elements: Array<Record<string, unknown>>,
  indexes: readonly number[],
  idPrefix: string,
  dx: number,
  dy: number,
): Array<Record<string, unknown>> => {
  const idMap = new Map<string, string>();
  indexes.forEach((index, sequence) => {
    const id = typeof elements[index].id === 'string' ? elements[index].id : `anonymous-${index}`;
    idMap.set(id, `${idPrefix}-${sequence}`);
  });
  return indexes.map((index, sequence) => {
    const element = elements[index];
    const sourceId = typeof element.id === 'string' ? element.id : `anonymous-${index}`;
    return {
      ...element,
      id: idMap.get(sourceId) || `${idPrefix}-${sequence}`,
      x: (Number(element.x) || 0) + dx,
      y: (Number(element.y) || 0) + dy,
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
};

const unitClusters = (
  elements: Array<Record<string, unknown>>,
  slots: readonly number[],
): Map<number, number[]> => {
  const clusters = new Map(slots.map((slot) => [slot, [slot]]));
  const slotSet = new Set(slots);
  const styleGroups = new Map<string, number[]>();
  elements.forEach((element, index) => {
    if (slotSet.has(index)) return;
    const key = visualFingerprint(element);
    styleGroups.set(key, [...(styleGroups.get(key) || []), index]);
  });
  for (const indexes of styleGroups.values()) {
    const connector = indexes.some((index) => elements[index].type === 'arrow' || elements[index].type === 'line');
    const boundConnector = connector && indexes.some((index) =>
      isRecord(elements[index].startBinding) || isRecord(elements[index].endBinding),
    );
    if (indexes.length < slots.length && !(boundConnector && indexes.length >= slots.length - 1)) continue;
    for (const index of indexes) {
      const center = elementCenter(elements[index]);
      const nearest = slots.reduce((best, slot) => {
        const slotCenter = elementCenter(elements[slot]);
        const distance = Math.hypot(center.x - slotCenter.x, center.y - slotCenter.y);
        return distance < best.distance ? { slot, distance } : best;
      }, { slot: slots[0], distance: Infinity });
      clusters.get(nearest.slot)?.push(index);
    }
  }
  return clusters;
};

const adjustTemplateTail = (
  source: Array<Record<string, unknown>>,
  slots: readonly number[],
  clustered: ReadonlySet<number>,
  dx: number,
  dy: number,
  directionX = dx,
  directionY = dy,
): Array<Record<string, unknown>> => {
  const distance = Math.hypot(directionX, directionY);
  if (!slots.length || distance < 1) return source;
  const ux = directionX / distance;
  const uy = directionY / distance;
  const projections = slots.map((slot) => {
    const center = elementCenter(source[slot]);
    return center.x * ux + center.y * uy;
  });
  const first = Math.min(...projections);
  const last = Math.max(...projections);
  return source.map((element, index) => {
    if (clustered.has(index)) return element;
    const box = elementBox(element);
    const corners = [
      box.minX * ux + box.minY * uy,
      box.minX * ux + box.maxY * uy,
      box.maxX * ux + box.minY * uy,
      box.maxX * ux + box.maxY * uy,
    ];
    const min = Math.min(...corners);
    const max = Math.max(...corners);
    if ((element.type === 'line' || element.type === 'arrow') && Array.isArray(element.points) && min < first && max > last) {
      const points = element.points.map((point) => Array.isArray(point) ? [...point] : point);
      let farthest = -1;
      let farthestProjection = -Infinity;
      points.forEach((point, pointIndex) => {
        if (!Array.isArray(point)) return;
        const projection = (Number(point[0]) || 0) * ux + (Number(point[1]) || 0) * uy;
        if (projection > farthestProjection) {
          farthest = pointIndex;
          farthestProjection = projection;
        }
      });
      if (farthest >= 0 && Array.isArray(points[farthest])) {
        points[farthest][0] = (Number(points[farthest][0]) || 0) + dx;
        points[farthest][1] = (Number(points[farthest][1]) || 0) + dy;
      }
      return { ...element, points };
    }
    const center = elementCenter(element);
    const projection = center.x * ux + center.y * uy;
    return projection > last
      ? { ...element, x: (Number(element.x) || 0) + dx, y: (Number(element.y) || 0) + dy }
      : element;
  });
};

const expandTreeLikeTemplate = (
  source: Array<Record<string, unknown>>,
  slots: readonly number[],
  clusters: ReadonlyMap<number, number[]>,
  desiredCount: number,
  idPrefix: string,
): Array<Record<string, unknown>> | null => {
  if (desiredCount <= slots.length) return null;
  const slotIds = new Map<string, number>();
  slots.forEach((slot, order) => {
    if (typeof source[slot].id === 'string') slotIds.set(source[slot].id as string, order);
  });
  if (slotIds.size !== slots.length) return null;
  const edges = source.flatMap((element) => {
    if (element.type !== 'arrow' && element.type !== 'line') return [];
    const startId = isRecord(element.startBinding) && typeof element.startBinding.elementId === 'string'
      ? element.startBinding.elementId : undefined;
    const endId = isRecord(element.endBinding) && typeof element.endBinding.elementId === 'string'
      ? element.endBinding.elementId : undefined;
    const from = startId ? slotIds.get(startId) : undefined;
    const to = endId ? slotIds.get(endId) : undefined;
    return from === undefined || to === undefined ? [] : [{ element, from, to }];
  });
  if (edges.length !== slots.length - 1) return null;
  const indegree = new Array(slots.length).fill(0);
  const children = new Map<number, number[]>();
  for (const edge of edges) {
    indegree[edge.to] += 1;
    children.set(edge.from, [...(children.get(edge.from) || []), edge.to]);
  }
  const roots = indegree.flatMap((degree, index) => degree === 0 ? [index] : []);
  if (roots.length !== 1 || indegree.some((degree, index) => index !== roots[0] && degree !== 1)) return null;
  const branching = Math.max(...[...children.values()].map((nodes) => nodes.length));
  if (branching < 1) return null;

  const rootChildren = children.get(roots[0]) || [];
  const rootCenter = elementCenter(source[slots[roots[0]]]);
  const offsets = rootChildren
    .map((child) => {
      const center = elementCenter(source[slots[child]]);
      return { x: center.x - rootCenter.x, y: center.y - rootCenter.y };
    })
    .sort((left, right) => left.x - right.x);
  const levelGap = Math.max(50, offsets.reduce((sum, offset) => sum + Math.abs(offset.y), 0) / Math.max(1, offsets.length));
  const siblingGap = offsets.length > 1
    ? Math.max(50, (offsets.at(-1)?.x || 0) - (offsets[0]?.x || 0))
    : Math.max(60, Number(source[slots[0]].width) || 60) * 1.5;
  const templateSlot = slots[slots.length - 1];
  const templateCenter = elementCenter(source[templateSlot]);
  const templateCluster = (clusters.get(templateSlot) || [templateSlot])
    .filter((index) => source[index].type !== 'arrow' && source[index].type !== 'line');
  const templatePosition = templateCluster.indexOf(templateSlot);
  if (templatePosition < 0) return null;

  const result = [...source];
  const centers = slots.map((slot) => elementCenter(source[slot]));
  const ids = slots.map((slot) => String(source[slot].id));
  const levels = new Array(slots.length).fill(0);
  for (let pass = 0; pass < slots.length; pass += 1) {
    for (const edge of edges) levels[edge.to] = Math.max(levels[edge.to], levels[edge.from] + 1);
  }
  const edgeStyle = edges[0].element;
  for (let index = slots.length; index < desiredCount; index += 1) {
    const parent = Math.floor((index - 1) / branching);
    const ordinal = (index - 1) % branching;
    const parentCenter = centers[parent];
    const level = levels[parent] + 1;
    const levelScale = 2 ** Math.max(0, level - 1);
    const offsetX = (offsets[ordinal]?.x
      ?? (ordinal - (branching - 1) / 2) * siblingGap) / levelScale;
    const target = { x: parentCenter.x + offsetX, y: parentCenter.y + levelGap };
    const clones = cloneElementSet(
      source,
      templateCluster,
      `${idPrefix}-unit-${index}`,
      target.x - templateCenter.x,
      target.y - templateCenter.y,
    ).map(({ boundElements: _boundElements, ...element }) => element);
    const node = clones[templatePosition];
    const nodeId = String(node.id);
    centers.push(target);
    ids.push(nodeId);
    levels.push(level);
    result.push(...clones, {
      ...edgeStyle,
      id: `${idPrefix}-edge-${index}`,
      x: parentCenter.x,
      y: parentCenter.y,
      width: Math.abs(target.x - parentCenter.x),
      height: Math.abs(target.y - parentCenter.y),
      points: [[0, 0], [target.x - parentCenter.x, target.y - parentCenter.y]],
      startBinding: { elementId: ids[parent] },
      endBinding: { elementId: nodeId },
      boundElements: [],
    });
  }
  return result;
};

const resizeTemplateUnits = (
  source: Array<Record<string, unknown>>,
  desiredCount: number,
  idPrefix: string,
): Array<Record<string, unknown>> => {
  const slots = templateSlotIndexes(source);
  if (!slots.length || desiredCount === slots.length) return source;
  const clusters = unitClusters(source, slots);
  const clustered = new Set([...clusters.values()].flat());
  if (desiredCount < slots.length) {
    const originalLast = elementCenter(source[slots[slots.length - 1]]);
    const remainingLast = elementCenter(source[slots[Math.max(0, desiredCount - 1)]]);
    source = adjustTemplateTail(
      source,
      slots,
      clustered,
      remainingLast.x - originalLast.x,
      remainingLast.y - originalLast.y,
      originalLast.x - remainingLast.x,
      originalLast.y - remainingLast.y,
    );
    const removedIndexes = new Set(slots.slice(desiredCount).flatMap((slot) => clusters.get(slot) || [slot]));
    const removedIds = new Set([...removedIndexes].flatMap((index) =>
      typeof source[index].id === 'string' ? [source[index].id as string] : [],
    ));
    return source.filter((element, index) => {
      if (removedIndexes.has(index)) return false;
      const startId = isRecord(element.startBinding) && typeof element.startBinding.elementId === 'string'
        ? element.startBinding.elementId : undefined;
      const endId = isRecord(element.endBinding) && typeof element.endBinding.elementId === 'string'
        ? element.endBinding.elementId : undefined;
      return !removedIds.has(startId || '') && !removedIds.has(endId || '');
    });
  }

  const topologyExpansion = expandTreeLikeTemplate(source, slots, clusters, desiredCount, idPrefix);
  if (topologyExpansion) return topologyExpansion;

  const last = slots[slots.length - 1];
  const previous = slots[Math.max(0, slots.length - 2)];
  const lastCenter = elementCenter(source[last]);
  const previousCenter = elementCenter(source[previous]);
  let stepX = lastCenter.x - previousCenter.x;
  let stepY = lastCenter.y - previousCenter.y;
  if (slots.length === 1 || Math.hypot(stepX, stepY) < 8) {
    stepX = Math.max(40, Number(source[last].width) || 60) * 1.25;
    stepY = 0;
  }
  const cluster = clusters.get(last) || [last];
  const additions: Array<Record<string, unknown>> = [];
  for (let index = slots.length; index < desiredCount; index += 1) {
    const multiplier = index - slots.length + 1;
    additions.push(...cloneElementSet(source, cluster, `${idPrefix}-unit-${index}`, stepX * multiplier, stepY * multiplier));
  }
  const added = desiredCount - slots.length;
  const adjusted = adjustTemplateTail(source, slots, clustered, stepX * added, stepY * added);
  return [...adjusted, ...additions];
};

const nextTemplateLabel = (labels: readonly string[], index: number): string => {
  const last = labels.at(-1) || '';
  if (/^-?\d+(?:\.\d+)?$/.test(last)) {
    const previous = labels.length > 1 && /^-?\d+(?:\.\d+)?$/.test(labels.at(-2) || '') ? Number(labels.at(-2)) : Number(last) - 1;
    return String(Number(last) + (Number(last) - previous || 1) * (index - labels.length + 1));
  }
  if (/^[A-Z]$/.test(last)) return String.fromCharCode(Math.min(90, last.charCodeAt(0) + index - labels.length + 1));
  if (/^[a-z]$/.test(last)) return String.fromCharCode(Math.min(122, last.charCodeAt(0) + index - labels.length + 1));
  return `Item ${index + 1}`;
};

const transformLibraryTemplate = (
  placeholder: Record<string, unknown>,
  source: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> => {
  if (!isRecord(placeholder.libraryTemplate)) return source;
  const template = placeholder.libraryTemplate as unknown as LibraryTemplateSpec;
  let elements = source.map((element) => ({
    ...element,
    ...(isRecord(element.label) ? { label: { ...element.label } } : {}),
  }));
  let slots = templateSlotIndexes(elements);
  if (!slots.length) return elements;
  const originalSlotCount = slots.length;
  let labels = template.labels
    ? [...template.labels]
    : slots.map((index) => elementText(elements[index]) || '');
  for (const replacement of template.replace || []) {
    labels = labels.map((label) => normalize(label) === normalize(replacement.from) ? replacement.to : label);
  }
  const removed = new Set((template.remove || []).map(normalize));
  if (removed.size) labels = labels.filter((label) => !removed.has(normalize(label)));
  labels = [...(template.prepend || []), ...labels, ...(template.append || [])];
  if (template.order === 'reverse') labels.reverse();
  if (template.order === 'ascending' || template.order === 'descending') {
    const direction = template.order === 'ascending' ? 1 : -1;
    labels.sort((left, right) => direction * left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }));
  }
  const desiredCount = Math.max(1, Math.min(40, template.count ?? labels.length ?? slots.length));
  labels = labels.slice(0, desiredCount);
  while (labels.length < desiredCount) labels.push(nextTemplateLabel(labels, labels.length));
  elements = resizeTemplateUnits(elements, desiredCount, String(placeholder.id || 'library-template'));
  slots = templateSlotIndexes(elements);
  elements = continueAuxiliaryOrdinals(elements, slots, originalSlotCount);
  slots.slice(0, labels.length).forEach((slot, index) => {
    elements[slot] = withElementText(elements[slot], labels[index]);
  });
  return elements;
};

const expandLibraryNode = (
  placeholder: Record<string, unknown>,
  elements: Array<Record<string, unknown>>,
): Record<string, unknown>[] => {
  const originalBounds = boundsOf(elements);
  const originalWidth = Math.max(1, originalBounds.maxX - originalBounds.minX);
  const originalHeight = Math.max(1, originalBounds.maxY - originalBounds.minY);
  elements = transformLibraryTemplate(placeholder, elements);
  const id = String(placeholder.id);
  const originalX = Number(placeholder.x) || 0;
  const y = Number(placeholder.y) || 0;
  const originalDisplayWidth = Number(placeholder.width) || 160;
  const originalDisplayHeight = Number(placeholder.height) || 100;
  const originalIconHeight = Math.min(
    originalDisplayHeight,
    Number(placeholder.libraryIconHeight) || originalDisplayHeight,
  );
  const sourceBounds = boundsOf(elements);
  const sourceWidth = Math.max(1, sourceBounds.maxX - sourceBounds.minX);
  const sourceHeight = Math.max(1, sourceBounds.maxY - sourceBounds.minY);
  const templateScale = Math.min(originalDisplayWidth / originalWidth, originalIconHeight / originalHeight);
  const parameterized = isRecord(placeholder.libraryTemplate);
  // Repeated templates must grow with their structure. Squeezing an expanded
  // template back into its original frame makes bound text wrap and causes
  // Excalidraw to enlarge individual containers to different heights.
  const width = parameterized
    ? Math.max(originalDisplayWidth, sourceWidth * templateScale)
    : originalDisplayWidth;
  const iconHeight = parameterized
    ? Math.max(originalIconHeight, sourceHeight * templateScale)
    : originalIconHeight;
  const height = originalDisplayHeight + iconHeight - originalIconHeight;
  const x = originalX - (width - originalDisplayWidth) / 2;
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
    const label = isRecord(element.label) ? element.label : undefined;
    const labelText = label && typeof label.text === 'string' ? label.text : '';
    const scaledWidth = typeof element.width === 'number' ? element.width * scale : 0;
    const scaledHeight = typeof element.height === 'number' ? element.height * scale : 0;
    const requestedLabelSize = label && typeof label.fontSize === 'number' ? label.fontSize * scale : 14 * scale;
    const widthFit = labelText
      ? Math.max(4, (scaledWidth - 10) / Math.max(1, labelText.length * 0.65))
      : requestedLabelSize;
    const heightFit = scaledHeight ? Math.max(4, (scaledHeight - 6) / 1.3) : requestedLabelSize;
    const fittedLabel = label
      ? { ...label, fontSize: Math.max(4, Math.min(requestedLabelSize, widthFit, heightFit)) }
      : undefined;
    return {
      ...element,
      id: idMap.get(originalId),
      x: offsetX + (Number(element.x) || 0) * scale,
      y: offsetY + (Number(element.y) || 0) * scale,
      ...(typeof element.width === 'number' ? { width: element.width * scale } : {}),
      ...(typeof element.height === 'number' ? { height: element.height * scale } : {}),
      ...(typeof element.fontSize === 'number' ? { fontSize: Math.max(6, element.fontSize * scale) } : {}),
      ...(fittedLabel ? { label: fittedLabel } : {}),
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
