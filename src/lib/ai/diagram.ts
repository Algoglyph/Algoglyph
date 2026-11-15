import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { runAgent } from '../mcp/connectorClient';
import { serializeCanvasForNotes } from './notes';
import { createBasicIllustrationPlan } from './basicIllustrations';
import { recordCanvasPerfStage, recordCanvasPerfStages } from './devTiming';
import { parseCanvasResponse, type CanvasIntent, type CanvasLayout, type CanvasResponse } from './diagramLayout';
import { extractJsonObject } from './modelJson';
import { placeSkeletonsBelowAnchor, type CanvasPlacementAnchor } from './canvasPlacement';
import {
  applyLibraryMatches,
  createSingleLibraryPlan,
  hydrateLibrarySkeletons,
  loadLibraryCatalog,
  relevantLibraryNames,
  type LibraryCatalogEntry,
} from './libraryAssets';

export { inspectCanvasLayout, parseCanvasResponse } from './diagramLayout';
export { extractJsonObject } from './modelJson';
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
    { "type": "library", "id": "<unique-slug>", "name": "<exact asset name>", "group": "<optional>", "role": "primary" | "secondary" | "supporting" | "external" | "storage", "width": <only if requested>, "height": <only if requested>, "libraryTemplate": { "labels": ["final", "ordered", "texts"], "count": <1-40>, "replace": [{"from":"old","to":"new"}], "remove": [], "append": [], "prepend": [], "order": "preserve" | "reverse" | "ascending" | "descending" } },
    { "type": "path", "id": "<unique-slug>", "points": [[x,y],...], "closed": <optional boolean>, "startArrowhead": <optional "arrow">, "endArrowhead": <optional "arrow"> },
    { "type": "arc", "id": "<unique-slug>", "x": number, "y": number, "width": number, "height": number, "startAngle": degrees, "endAngle": degrees }
  ]
}

First classify the request. Use intent "draw" for diagrams made of semantic nodes and relationships. Use "illustration" for literal geometry, sketches, symbols, or objects (for example polygons, curves, axes, icons). Never represent literal geometry as labeled graph nodes.

For diagrams: inventory requested components and relationships; never omit one because another matches the library. Choose the matching layout, emit nodes first then connectors, group related nodes, use stable ids, diamonds for decisions, and brief labels. Prefer "library" for recognizable computer-science components or icons. Treat it as a template: emit one instance and describe only requested internal changes in libraryTemplate; omit unchanged fields and never emit both base and modified copies. Use labels for the final semantic values/order and count for structural size. AlgoGlyph resolves, clones, edits, places, routes, and collision-checks it. Otherwise omit coordinates and dimensions.

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

const STREAMING_RESPONSE_CONTRACT = `For this run, stream one complete newline-delimited JSON record at a time. Start with:
{"event":"start","intent":"draw","layout":"flow-left-to-right"}
Then emit each finished canvas action immediately, before planning the next action:
{"event":"element","element":{"type":"rectangle","id":"node-a","label":"A","x":0,"y":0,"width":180,"height":80}}
Finish with {"event":"done"}. Do not use markdown, code fences, commentary, or one large JSON object.

An element must use this skeleton schema: text {type:"text",text,x,y,fontSize?}; node {type:"rectangle"|"ellipse"|"diamond",id,label,role?,group?,x,y,width,height}; connector {type:"arrow"|"line",from,to,label?}; illustration {type:"path",id,points,closed?} or {type:"arc",id,x,y,width,height,startAngle,endAngle}; library {type:"library",id,name,label?,x,y,width?,height?}. Keep the complete run fast: emit no more than 32 element records. For diagrams, emit every node before its arrows; give every node explicit x, y, width, and height, spaced to avoid overlap. Emit an arrow only after both endpoint nodes. For illustrations, emit each shape/path as soon as its geometry is ready and use explicit coordinates. Use concise labels and only the elements needed to answer the request. Never emit private reasoning. If a request needs more than 32 actions, simplify the drawing while preserving its main idea.`;

export const buildStreamingCanvasPrompt = (
  userRequest: string,
  canvasContext: string | null,
  libraryHints: readonly string[] = [],
): string => {
  const prompt = buildCanvasPrompt(userRequest, canvasContext, libraryHints);
  const contractStart = prompt.indexOf('Return STRICT JSON ONLY, with no markdown or prose outside this object:');
  const contractEnd = prompt.indexOf('\n\nFirst classify the request.', contractStart);
  if (contractStart < 0 || contractEnd < 0) return `${prompt}\n\n${STREAMING_RESPONSE_CONTRACT}`;
  const remainder = prompt.slice(contractEnd).replace(/\n\nUse at most 40 shapes and 60 connectors\.[\s\S]*$/, '');
  return `${prompt.slice(0, contractStart)}${STREAMING_RESPONSE_CONTRACT}${remainder}`;
};

export class CanvasAiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CanvasAiError';
  }
}

export const parseCanvasAgentOutput = async (
  output: string,
  userRequest: string,
): Promise<CanvasResponse> => {
  try {
    const catalog = await loadLibraryCatalog().catch(() => [] as LibraryCatalogEntry[]);
    const extracted = extractJsonObject(output);
    const matched = applyLibraryMatches(extracted, userRequest, catalog);
    return await hydrateLibrarySkeletons(parseCanvasResponse(matched));
  } catch (error) {
    throw new CanvasAiError(error instanceof Error ? `Could not read the response: ${error.message}` : 'Could not read the response.');
  }
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
    timingTraceId?: string;
    onActions?: (skeletons: Record<string, unknown>[]) => void;
    onLimit?: () => void;
  },
): Promise<CanvasResponse> => {
  const MAX_STREAM_ACTIONS = 32;
  const MAX_DRAW_ELEMENTS = 96;
  const emitActions = (skeletons: Record<string, unknown>[]) => {
    if (!options.onActions || !skeletons.length) return;
    const remaining = MAX_DRAW_ELEMENTS - streamedSkeletons.length;
    if (remaining <= 0) {
      if (!limitReached) options.onLimit?.();
      limitReached = true;
      return;
    }
    const accepted = skeletons.slice(0, remaining);
    streamedSkeletons.push(...accepted);
    options.onActions(accepted);
    if (accepted.length < skeletons.length && !limitReached) {
      limitReached = true;
      options.onLimit?.();
    }
  };
  let limitReached = false;
  const streamedSkeletons: Record<string, unknown>[] = [];

  const basicIllustration = createBasicIllustrationPlan(userRequest);
  if (basicIllustration) {
    const response = parseCanvasResponse(basicIllustration);
    emitActions(response.skeletons);
    return { ...response, skeletons: streamedSkeletons.length ? streamedSkeletons : response.skeletons };
  }

  let catalog: LibraryCatalogEntry[] = [];
  try {
    const catalogStartedAt = performance.now();
    catalog = await loadLibraryCatalog();
    recordCanvasPerfStage(options.timingTraceId, 'library_catalog_ms', performance.now() - catalogStartedAt);
    const directLibraryPlan = createSingleLibraryPlan(userRequest, catalog);
    if (directLibraryPlan) {
      const response = await hydrateLibrarySkeletons(parseCanvasResponse(directLibraryPlan));
      emitActions(response.skeletons);
      return { ...response, skeletons: streamedSkeletons.length ? streamedSkeletons : response.skeletons };
    }
  } catch {
    // The library is an enhancement. Agent planning and generated geometry remain available offline.
  }

  const canvasContext = options.canvasContext === undefined ? serializeCanvasForNotes() : options.canvasContext;
  let stdout = '';
  let stderr = '';
  let lineBuffer = '';
  let streamDetected = false;
  let streamIntent: CanvasIntent = 'draw';
  let streamLayout: CanvasLayout = 'auto';
  let streamActionCount = 0;
  const streamActions: Record<string, unknown>[] = [];
  const emittedSkeletonIds = new Set<string>();
  const processStreamLine = async (line: string) => {
    if (!line.trim() || line.length > 64_000) return;
    let decoded: unknown;
    try { decoded = JSON.parse(line); } catch { return; }
    if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) return;
    const record = decoded as Record<string, unknown>;
    if (record.event === 'start') {
      streamDetected = true;
      if (record.intent === 'answer' || record.intent === 'draw' || record.intent === 'illustration' || record.intent === 'explain') {
        streamIntent = record.intent;
      }
      if (typeof record.layout === 'string') streamLayout = record.layout as CanvasLayout;
      return;
    }
    if (record.event !== 'element' || !record.element || typeof record.element !== 'object' || Array.isArray(record.element)) return;
    streamDetected = true;
    if (streamActionCount >= MAX_STREAM_ACTIONS) {
      if (!limitReached) options.onLimit?.();
      limitReached = true;
      return;
    }
    streamActionCount += 1;
    streamActions.push(record.element as Record<string, unknown>);
    if (!options.onActions) return;
    try {
      const raw = applyLibraryMatches({ intent: streamIntent, layout: streamLayout, elements: streamActions }, userRequest, catalog);
      const parsed = parseCanvasResponse(raw);
      const newSkeletons = parsed.skeletons.filter((skeleton) => {
        const id = typeof skeleton.id === 'string' ? skeleton.id : null;
        if (!id || emittedSkeletonIds.has(id)) return false;
        emittedSkeletonIds.add(id);
        return true;
      });
      if (!newSkeletons.length) return;
      const hydrated = await hydrateLibrarySkeletons({ ...parsed, skeletons: newSkeletons });
      emitActions(hydrated.skeletons);
    } catch {
      // Ignore an incomplete/invalid action and continue consuming the stream.
    }
  };

  try {
    const agentStartedAt = performance.now();
    for await (const event of runAgent(
      options.connectorEndpoint,
      options.connectorToken,
      {
        agentId: options.agentId || 'claude',
        prompt: buildStreamingCanvasPrompt(userRequest, canvasContext, relevantLibraryNames(userRequest, catalog)),
        outputMode: 'stream',
        traceId: options.timingTraceId,
      },
      options.signal,
    )) {
      if (event.type === 'output') {
        if (event.stream === 'stdout') {
          stdout += event.chunk;
          lineBuffer += event.chunk;
          if (stdout.length > 128_000) throw new CanvasAiError('The canvas response exceeded its size limit. Try a smaller request.');
          let newline = lineBuffer.indexOf('\n');
          while (newline !== -1) {
            const line = lineBuffer.slice(0, newline).replace(/\r$/, '');
            lineBuffer = lineBuffer.slice(newline + 1);
            await processStreamLine(line);
            newline = lineBuffer.indexOf('\n');
          }
        }
        else stderr += event.chunk;
      } else if (event.type === 'error') {
        throw new CanvasAiError(event.message);
      } else if (event.type === 'timing') {
        recordCanvasPerfStages(options.timingTraceId, event.stages);
      }
    }
    recordCanvasPerfStage(options.timingTraceId, 'agent_round_trip_ms', performance.now() - agentStartedAt);
  } catch (error) {
    if (error instanceof CanvasAiError) throw error;
    throw new CanvasAiError(error instanceof Error ? error.message : 'Could not reach the local connector.');
  }

  if (lineBuffer.trim()) await processStreamLine(lineBuffer.trim());

  if (streamDetected) {
    if (!streamActions.length) {
      throw new CanvasAiError('The AI did not stream any canvas actions. Try rewording the request.');
    }
    try {
      const raw = applyLibraryMatches({ intent: streamIntent, layout: streamLayout, elements: streamActions }, userRequest, catalog);
      const response = parseCanvasResponse(raw);
      if (!options.onActions) return await hydrateLibrarySkeletons(response);
      return { ...response, skeletons: streamedSkeletons };
    } catch (error) {
      if (streamedSkeletons.length) {
        return { intent: streamIntent, layout: streamLayout, skeletons: streamedSkeletons, qualityWarnings: [] };
      }
      throw error;
    }
  }

  if (!stdout.trim()) {
    throw new CanvasAiError(stderr.trim().slice(0, 200) || 'The agent returned no output.');
  }

  try {
    const jsonStartedAt = performance.now();
    const extracted = extractJsonObject(stdout);
    recordCanvasPerfStage(options.timingTraceId, 'json_parse_ms', performance.now() - jsonStartedAt);
    const matchingStartedAt = performance.now();
    const raw = applyLibraryMatches(extracted, userRequest, catalog);
    recordCanvasPerfStage(options.timingTraceId, 'library_matching_ms', performance.now() - matchingStartedAt);
    const layoutStartedAt = performance.now();
    const response = parseCanvasResponse(raw);
    recordCanvasPerfStage(options.timingTraceId, 'layout_routing_ms', performance.now() - layoutStartedAt);
    const hydrationStartedAt = performance.now();
    const hydrated = await hydrateLibrarySkeletons(response);
    recordCanvasPerfStage(options.timingTraceId, 'library_hydration_ms', performance.now() - hydrationStartedAt);
    emitActions(hydrated.skeletons);
    return { ...hydrated, skeletons: streamedSkeletons.length ? streamedSkeletons : hydrated.skeletons };
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
export const insertCanvasSkeletons = (
  skeletons: Record<string, unknown>[],
  timingTraceId?: string,
  placementAnchor?: CanvasPlacementAnchor,
): number => {
  const api = (window as unknown as { excalidrawAPI?: any }).excalidrawAPI;
  if (!api) throw new CanvasAiError('The canvas is not ready yet.');
  if (!skeletons.length) return 0;

  const sceneElements = api.getSceneElements();
  const existing = sceneElements.filter((el: any) => !el.isDeleted);

  let placed: Record<string, unknown>[];
  if (placementAnchor) {
    placed = placeSkeletonsBelowAnchor(skeletons, existing, placementAnchor);
  } else {
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

    // No originating prompt (dev/benchmark callers): retain viewport/stack placement.
    let minSkelX = Infinity;
    let minSkelY = Infinity;
    for (const skel of skeletons) {
      if (typeof skel.x === 'number') minSkelX = Math.min(minSkelX, skel.x);
      if (typeof skel.y === 'number') minSkelY = Math.min(minSkelY, skel.y);
    }
    const dx = Number.isFinite(minSkelX) ? startX - minSkelX : 0;
    const dy = Number.isFinite(minSkelY) ? startY - minSkelY : 0;
    placed = skeletons.map((skel) => ({
      ...skel,
      ...(typeof skel.x === 'number' ? { x: skel.x + dx } : {}),
      ...(typeof skel.y === 'number' ? { y: skel.y + dy } : {}),
    }));
  }

  const conversionStartedAt = performance.now();
  const newElements = convertToExcalidrawElements(placed as any, { regenerateIds: true });
  recordCanvasPerfStage(timingTraceId, 'excalidraw_conversion_ms', performance.now() - conversionStartedAt);
  const updateStartedAt = performance.now();
  api.updateScene({
    elements: [...sceneElements, ...newElements],
    commitToHistory: true,
  });
  recordCanvasPerfStage(timingTraceId, 'update_scene_ms', performance.now() - updateStartedAt);

  try {
    const promptElements = placementAnchor?.elementIds?.length
      ? sceneElements.filter((element: any) => placementAnchor.elementIds?.includes(element.id))
      : [];
    api.scrollToContent([...promptElements, ...newElements], { fitToContent: true, animate: false });
  } catch {
    // scrollToContent is best-effort.
  }

  return newElements.length;
};
