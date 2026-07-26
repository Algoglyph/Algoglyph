import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { runAgent } from '../mcp/connectorClient';
import { serializeCanvasForNotes } from './notes';

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

export type CanvasIntent = 'answer' | 'draw' | 'explain' | 'none';
type ShapeType = 'rectangle' | 'ellipse' | 'diamond';

const SHAPES: ReadonlySet<ShapeType> = new Set(['rectangle', 'ellipse', 'diamond']);
const MAX_ELEMENTS = 120;
const DEFAULT_SHAPE_W = 160;
const DEFAULT_SHAPE_H = 60;

export const CANVAS_AI_SYSTEM_PROMPT = `You are the on-canvas AI for AlgoGlyph, a computer-science visual workspace. The user writes a request as text on an Excalidraw canvas. Read the request AND the description of what is already on the canvas, then respond by ADDING the right content to the canvas. Do NOT repeat, trace, or redraw what is already there — only add the answer/continuation/new visual.

Choose the response type from the request:
- A question to solve or a concept to explain (e.g. "what is the time complexity of quicksort?", "solve 3x+2=11", "explain TCP handshake") → answer it with one or more concise "text" elements (key steps and/or the result — keep it tight).
- A request to draw a single shape (e.g. "draw a circle", "draw a box") → emit that one shape.
- A request to draw a data structure, algorithm, system architecture, flowchart, ER/graph, tree, etc. (e.g. "binary search tree", "linked list", "stack", "system design of Instagram") → emit the shapes plus connecting arrows that form it.

Return STRICT JSON ONLY — no prose, no markdown fences, no text before or after:
{
  "intent": "answer" | "draw" | "explain" | "none",
  "elements": [
    { "type": "text", "x": <int>, "y": <int>, "text": "<content>", "fontSize": <int, optional> },
    { "type": "rectangle" | "ellipse" | "diamond", "id": "<unique-slug, optional>", "x": <int>, "y": <int>, "width": <int>, "height": <int>, "label": "<short, optional>" },
    { "type": "arrow" | "line", "from": "<shape id>", "to": "<shape id>", "label": "<short, optional>" }
  ]
}

Rules:
- x/y are pixels in a local space near 0. The app moves the whole result into empty space, so just lay it out cleanly with NO overlaps (shapes at least 40px apart; a box is ~160x60).
- For a circle use "ellipse" with EQUAL width and height. Use "diamond" for a decision/condition.
- Connect shapes with arrows via "from"/"to" referencing shape ids you defined in this response.
- Put short names INSIDE shapes with "label". Use "text" elements for prose answers/explanations; keep them concise (a few lines, <= ~600 chars each).
- Use at most 40 shapes and 60 arrows. If the request is empty or unreadable, return {"intent":"none","elements":[]}.
Return only the JSON object.`;

export const buildCanvasPrompt = (userRequest: string, canvasContext: string | null): string => {
  const context = canvasContext
    ? `\n\nAlready on the canvas (do not redraw this):\n${canvasContext.slice(0, 3000)}`
    : '';
  return `${CANVAS_AI_SYSTEM_PROMPT}\n\nUser request:\n${userRequest.trim().slice(0, 4000)}${context}`;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const num = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export interface CanvasResponse {
  intent: CanvasIntent;
  skeletons: Record<string, unknown>[];
}

/**
 * Validate a raw model response into Excalidraw skeleton elements: text answers,
 * labelled shapes, and id-bound arrows between them. Ids are preserved so arrow
 * bindings resolve inside the batch; the caller regenerates ids on insert.
 */
export const parseCanvasResponse = (raw: unknown): CanvasResponse => {
  if (!isRecord(raw) || !Array.isArray(raw.elements)) {
    throw new Error('The model response was missing an elements array.');
  }

  const intentRaw = asString(raw.intent);
  const intent: CanvasIntent =
    intentRaw === 'answer' || intentRaw === 'draw' || intentRaw === 'explain' ? intentRaw : 'none';

  const skeletons: Record<string, unknown>[] = [];
  const geom = new Map<string, { cx: number; cy: number }>();
  const arrows: { from: string; to: string; label?: string }[] = [];
  let shapeSeq = 0;

  for (const entry of raw.elements) {
    if (skeletons.length + arrows.length >= MAX_ELEMENTS || !isRecord(entry)) continue;
    const type = asString(entry.type);

    if (type === 'text') {
      const text = asString(entry.text);
      if (!text) continue;
      skeletons.push({
        type: 'text',
        x: num(entry.x, 0),
        y: num(entry.y, 0),
        text: text.slice(0, 1200),
        fontSize: clamp(num(entry.fontSize, 20), 12, 48),
      });
    } else if (type && SHAPES.has(type as ShapeType)) {
      const id = asString(entry.id) || `s${shapeSeq++}`;
      if (geom.has(id)) continue;
      const width = clamp(num(entry.width, DEFAULT_SHAPE_W), 20, 1200);
      const height = clamp(num(entry.height, DEFAULT_SHAPE_H), 20, 1200);
      const x = num(entry.x, 0);
      const y = num(entry.y, 0);
      geom.set(id, { cx: x + width / 2, cy: y + height / 2 });
      const label = asString(entry.label);
      skeletons.push({
        type,
        id,
        x,
        y,
        width,
        height,
        ...(label ? { label: { text: label.slice(0, 80) } } : {}),
      });
    } else if (type === 'arrow' || type === 'line') {
      const from = asString(entry.from);
      const to = asString(entry.to);
      if (from && to && from !== to) arrows.push({ from, to, label: asString(entry.label)?.slice(0, 40) });
    }
  }

  // Resolve arrows now that all shape geometry is known.
  arrows.forEach((edge, index) => {
    const start = geom.get(edge.from);
    const end = geom.get(edge.to);
    if (!start || !end) return;
    const width = end.cx - start.cx;
    const height = end.cy - start.cy;
    skeletons.push({
      type: 'arrow',
      id: `edge-${index}-${edge.from}-${edge.to}`,
      x: start.cx,
      y: start.cy,
      width,
      height,
      points: [
        [0, 0],
        [width, height],
      ],
      start: { id: edge.from },
      end: { id: edge.to },
      ...(edge.label ? { label: { text: edge.label } } : {}),
    });
  });

  return { intent, skeletons };
};

/**
 * Run one canvas generation end to end: read the current canvas as context,
 * prompt the connector's `claude` agent, and parse the streamed JSON into
 * Excalidraw skeletons. Throws CanvasAiError with a user-facing message.
 */
export const generateCanvasResponse = async (
  userRequest: string,
  options: { connectorEndpoint: string; connectorToken?: string; agentId?: string; signal?: AbortSignal },
): Promise<CanvasResponse> => {
  const canvasContext = serializeCanvasForNotes();
  let stdout = '';
  let stderr = '';

  try {
    for await (const event of runAgent(
      options.connectorEndpoint,
      options.connectorToken,
      { agentId: options.agentId || 'claude', prompt: buildCanvasPrompt(userRequest, canvasContext) },
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
    return parseCanvasResponse(extractJsonObject(stdout));
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

  const existing = api.getSceneElements().filter((el: any) => !el.isDeleted);

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
    elements: [...api.getSceneElements(), ...newElements],
    commitToHistory: true,
  });

  try {
    api.scrollToContent(newElements, { fitToContent: true, animate: true, duration: 300 });
  } catch {
    // scrollToContent is best-effort.
  }

  return newElements.length;
};
