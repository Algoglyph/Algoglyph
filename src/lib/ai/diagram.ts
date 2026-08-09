import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { runAgent } from '../mcp/connectorClient';
import { serializeCanvasForNotes } from './notes';
import { createBasicIllustrationPlan } from './basicIllustrations';
import { parseCanvasResponse, type CanvasResponse } from './diagramLayout';
import {
  applyLibraryMatches,
  createSingleLibraryPlan,
  hydrateLibrarySkeletons,
  loadLibraryCatalog,
  relevantLibraryNames,
  type LibraryCatalogEntry,
} from './libraryAssets';

export { inspectCanvasLayout, parseCanvasResponse } from './diagramLayout';
export type { CanvasIntent, CanvasLayout, CanvasResponse } from './diagramLayout';

/**
 * AI-native canvas responses (PenEcho-style, adapted to Excalidraw).
 *
 * The user writes a request as text on the canvas. The model reads that request
 * *and a description of what is already on the canvas*, decides the appropriate
 * response — a text answer to a question, a single shape ("draw a circle"), or a
 * structure/diagram of shapes + arrows ("binary search tree", "system design of
 * Instagram") — and returns it as elements we render as real, editable Excalidraw
 * objects placed beside the existing work.
 *
 * The model returns a small, constrained element schema (text / shape / arrow),
 * never raw Excalidraw JSON — far more reliable, and all pixel/binding work
 * happens here.
 */

export const CANVAS_AI_SYSTEM_PROMPT = `You are AlgoGlyph's on-canvas diagram and illustration planner. Read the request and existing-canvas description. Return only the new content; never redraw existing content.

Return STRICT JSON ONLY, with no markdown or prose outside this object:
{
  "intent": "answer" | "draw" | "illustration" | "explain" | "none",
  "layout": "flow-left-to-right" | "flow-top-to-bottom" | "hierarchical-left-to-right" | "hierarchical-top-down" | "hub-and-spoke" | "layered-top-down" | "network" | "auto",
  "elements": [
    { "type": "text", "text": "<concise content>", "x": <illustration only>, "y": <illustration only>, "fontSize": <optional> },
    { "type": "rectangle" | "ellipse" | "diamond", "id": "<unique-slug>", "label": "<short label>", "group": "<optional group>", "role": "primary" | "secondary" | "supporting" | "external" | "storage", "x": <illustration only>, "y": <illustration only>, "width": <illustration only>, "height": <illustration only> },
    { "type": "arrow" | "line", "from": "<shape id>", "to": "<shape id>", "label": "<optional label>" },
    { "type": "library", "id": "<unique-slug>", "name": "<CS component or icon name>", "group": "<optional group>", "role": "primary" | "secondary" | "supporting" | "external" | "storage" },
    { "type": "path", "id": "<unique-slug>", "points": [[x,y],...], "closed": <optional boolean>, "startArrowhead": <optional "arrow">, "endArrowhead": <optional "arrow"> },
    { "type": "arc", "id": "<unique-slug>", "x": number, "y": number, "width": number, "height": number, "startAngle": degrees, "endAngle": degrees }
  ]
}

First classify the request. Use intent "draw" for diagrams made of semantic nodes and relationships. Use "illustration" for literal geometry, sketches, symbols, or objects (for example polygons, curves, axes, icons). Never represent literal geometry as labeled graph nodes.

For diagrams: inventory all components and relationships, choose the matching layout, emit nodes first then connectors, group related nodes, use stable ids, diamonds for decisions, and brief labels. Prefer "library" for recognizable computer-science components or icons; AlgoGlyph resolves it against its library and falls back safely when unavailable. Do not provide coordinates or dimensions: AlgoGlyph places, aligns, routes, and collision-checks the batch.

For illustrations: plan the whole composition in a local coordinate area before emitting it. Use actual paths/arcs and ordinary shapes, with explicit coordinates and dimensions. Keep geometry aligned, proportional, closed where needed, and free of unintended overlaps. Paths/arcs are unbound strokes, not node connectors. Verify the result visually represents what was requested.

Use at most 40 shapes and 60 connectors. For an empty or unreadable request return {"intent":"none","layout":"auto","elements":[]}.`;

export const buildCanvasPrompt = (
  userRequest: string,
  canvasContext: string | null,
  libraryHints: readonly string[] = [],
): string => {
  const context = canvasContext
    ? `\n\nAlready on the canvas (do not redraw this):\n${canvasContext.slice(0, 3000)}`
    : '';
  const available = libraryHints.length
    ? `\n\nRelevant exact library names (prefer these when applicable): ${libraryHints.join(', ')}`
    : '';
  return `${CANVAS_AI_SYSTEM_PROMPT}\n\nUser request:\n${userRequest.trim().slice(0, 4000)}${available}${context}`;
};

export class CanvasAiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CanvasAiError';
  }
}

/** Pull the first balanced JSON object out of a model response. */
export const extractJsonObject = (text: string): unknown => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1] : text;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('The model did not return a JSON object.');
  }
  return JSON.parse(source.slice(start, end + 1));
};

/**
 * Run one canvas generation end to end: read the current canvas as context,
 * prompt the connector's `claude` agent, and parse the streamed JSON into
 * Excalidraw skeletons. Throws CanvasAiError with a user-facing message.
 */
export const generateCanvasResponse = async (
  userRequest: string,
  options: {
    connectorEndpoint: string;
    connectorToken?: string;
    agentId?: string;
    signal?: AbortSignal;
    canvasContext?: string | null;
  },
): Promise<CanvasResponse> => {
  const basicIllustration = createBasicIllustrationPlan(userRequest);
  if (basicIllustration) return parseCanvasResponse(basicIllustration);

  let catalog: LibraryCatalogEntry[] = [];
  try {
    catalog = await loadLibraryCatalog();
    const directLibraryPlan = createSingleLibraryPlan(userRequest, catalog);
    if (directLibraryPlan) return await hydrateLibrarySkeletons(parseCanvasResponse(directLibraryPlan));
  } catch {
    // The library is an enhancement. Agent planning and generated geometry remain available offline.
  }

  const canvasContext = options.canvasContext === undefined ? serializeCanvasForNotes() : options.canvasContext;
  let stdout = '';
  let stderr = '';

  try {
    for await (const event of runAgent(
      options.connectorEndpoint,
      options.connectorToken,
      {
        agentId: options.agentId || 'claude',
        prompt: buildCanvasPrompt(userRequest, canvasContext, relevantLibraryNames(userRequest, catalog)),
        outputMode: 'buffered',
      },
      options.signal,
    )) {
      if (event.type === 'output') {
        if (event.stream === 'stdout') stdout += event.chunk;
        else stderr += event.chunk;
      } else if (event.type === 'error') {
        throw new CanvasAiError(event.message);
      }
    }
  } catch (error) {
    if (error instanceof CanvasAiError) throw error;
    throw new CanvasAiError(error instanceof Error ? error.message : 'Could not reach the local connector.');
  }

  if (!stdout.trim()) {
    throw new CanvasAiError(stderr.trim().slice(0, 200) || 'The agent returned no output.');
  }

  try {
    const raw = applyLibraryMatches(extractJsonObject(stdout), userRequest, catalog);
    return await hydrateLibrarySkeletons(parseCanvasResponse(raw));
  } catch (error) {
    throw new CanvasAiError(
      error instanceof Error ? `Could not read the response: ${error.message}` : 'Could not read the response.',
    );
  }
};

/**
 * Insert generated skeletons onto the Excalidraw canvas, stacked below existing
 * content, and scroll them into view. Returns the number of elements added.
 */
export const insertCanvasSkeletons = (skeletons: Record<string, unknown>[]): number => {
  const api = (window as unknown as { excalidrawAPI?: any }).excalidrawAPI;
  if (!api) throw new CanvasAiError('The canvas is not ready yet.');
  if (!skeletons.length) return 0;

  const sceneElements = api.getSceneElements();
  const existing = sceneElements.filter((el: any) => !el.isDeleted);

  let startX: number;
  let startY: number;
  if (existing.length === 0) {
    const appState = api.getAppState();
    const zoom = appState.zoom?.value || 1;
    const width = appState.width || window.innerWidth / 2;
    const height = appState.height || window.innerHeight;
    startX = -(appState.scrollX || 0) + width / 2 / zoom - 200;
    startY = -(appState.scrollY || 0) + height / 6 / zoom;
  } else {
    let minX = Infinity;
    let maxY = -Infinity;
    for (const el of existing) {
      minX = Math.min(minX, el.x || 0);
      maxY = Math.max(maxY, (el.y || 0) + (el.height || 0));
    }
    startX = minX;
    startY = maxY + 80;
  }

  // Offset the whole result so its top-left lands at (startX, startY).
  let minSkelX = Infinity;
  let minSkelY = Infinity;
  for (const skel of skeletons) {
    if (typeof skel.x === 'number') minSkelX = Math.min(minSkelX, skel.x);
    if (typeof skel.y === 'number') minSkelY = Math.min(minSkelY, skel.y);
  }
  const dx = Number.isFinite(minSkelX) ? startX - minSkelX : 0;
  const dy = Number.isFinite(minSkelY) ? startY - minSkelY : 0;
  const placed = skeletons.map((skel) => ({
    ...skel,
    ...(typeof skel.x === 'number' ? { x: skel.x + dx } : {}),
    ...(typeof skel.y === 'number' ? { y: skel.y + dy } : {}),
  }));

  const newElements = convertToExcalidrawElements(placed as any, { regenerateIds: true });
  api.updateScene({
    elements: [...sceneElements, ...newElements],
    commitToHistory: true,
  });

  try {
    api.scrollToContent(newElements, { fitToContent: true, animate: false });
  } catch {
    // scrollToContent is best-effort.
  }

  return newElements.length;
};
