import { runAgent } from '../mcp/connectorClient';

/**
 * AI note-making. Three entry points, one engine: the connector's `claude -p`
 * turns an input into clean Markdown study notes, which are appended into the
 * TipTap notes editor. The modes differ only in what they feed the model:
 *   - 'topic'     → text the user typed/selected in the notes editor
 *   - 'explain'   → a serialized description of the canvas diagram
 *   - 'summarize' → everything currently on the canvas
 */

export type NotesMode = 'topic' | 'explain' | 'summarize';

const NOTES_SYSTEM_PROMPT = `You write clear, well-structured study notes in GitHub-Flavored Markdown for AlgoGlyph, a computer-science learning workspace.
Guidelines:
- Use short section headings (## / ###), bullet points, and **bold** for key terms.
- Use fenced code blocks for code, and note time/space complexity (Big-O) where relevant.
- Be accurate, concrete, and concise — favour structure over prose.
Output ONLY the Markdown notes. No preamble like "Here are your notes", and do NOT wrap the whole answer in a code fence.`;

const MODE_INSTRUCTION: Record<NotesMode, string> = {
  topic: 'Write study notes on the following topic:',
  explain:
    'Explain the following diagram as structured notes. Describe each component and how data or control flows between them:',
  summarize: 'Summarize the following canvas content into concise, well-organised notes:',
};

export const buildNotesPrompt = (mode: NotesMode, input: string): string =>
  `${NOTES_SYSTEM_PROMPT}\n\n${MODE_INSTRUCTION[mode]}\n${input.trim().slice(0, 6000)}`;

export class NotesGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotesGenerationError';
  }
}

/** Strip a single fence that wraps the entire response, if the model added one. */
const unwrapOuterFence = (text: string): string => {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i);
  return match ? match[1].trim() : trimmed;
};

/**
 * Run one note generation end to end and return the Markdown. Throws
 * NotesGenerationError with a user-facing message on any failure.
 */
export const generateNotesMarkdown = async (
  mode: NotesMode,
  input: string,
  options: { connectorEndpoint: string; connectorToken?: string; agentId?: string; signal?: AbortSignal },
): Promise<string> => {
  let stdout = '';
  let stderr = '';

  try {
    for await (const event of runAgent(
      options.connectorEndpoint,
      options.connectorToken,
      { agentId: options.agentId || 'claude', prompt: buildNotesPrompt(mode, input) },
      options.signal,
    )) {
      if (event.type === 'output') {
        if (event.stream === 'stdout') stdout += event.chunk;
        else stderr += event.chunk;
      } else if (event.type === 'error') {
        throw new NotesGenerationError(event.message);
      }
    }
  } catch (error) {
    if (error instanceof NotesGenerationError) throw error;
    throw new NotesGenerationError(
      error instanceof Error ? error.message : 'Could not reach the local connector.',
    );
  }

  const markdown = unwrapOuterFence(stdout);
  if (!markdown) {
    throw new NotesGenerationError(stderr.trim().slice(0, 200) || 'The agent returned no notes.');
  }
  return markdown;
};

/**
 * Read the current canvas into a compact textual description the model can
 * reason about: labelled shapes, arrow connections (with labels), and any
 * standalone text annotations. Returns null when there is nothing to describe.
 */
export const serializeCanvasForNotes = (): string | null => {
  const api = (window as unknown as { excalidrawAPI?: any }).excalidrawAPI;
  if (!api) return null;

  const elements = api.getSceneElements().filter((el: any) => !el.isDeleted);
  if (!elements.length) return null;

  // Collapse Excalidraw's label line-wraps so descriptions read on one line.
  const clean = (text: string): string => text.replace(/\s+/g, ' ').trim();

  // Map a container/arrow element id → its bound text label.
  const labelOf = new Map<string, string>();
  for (const el of elements) {
    if (el.type === 'text' && el.containerId && typeof el.text === 'string') {
      labelOf.set(el.containerId, clean(el.text));
    }
  }

  const nameFor = (id: string | undefined): string | undefined => {
    if (!id) return undefined;
    return labelOf.get(id);
  };

  const nodeLines: string[] = [];
  const edgeLines: string[] = [];
  const noteLines: string[] = [];

  for (const el of elements) {
    if (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'diamond') {
      const label = labelOf.get(el.id) || '(unlabelled)';
      nodeLines.push(`- [${el.type}] ${label}`);
    } else if (el.type === 'arrow') {
      const from = nameFor(el.startBinding?.elementId) || '(?)';
      const to = nameFor(el.endBinding?.elementId) || '(?)';
      const via = labelOf.get(el.id);
      edgeLines.push(`- ${from} --${via ? `${via} ` : ''}--> ${to}`);
    } else if (el.type === 'text' && !el.containerId && typeof el.text === 'string' && el.text.trim()) {
      noteLines.push(`- ${clean(el.text)}`);
    }
  }

  const sections: string[] = [];
  if (nodeLines.length) sections.push(`Components:\n${nodeLines.join('\n')}`);
  if (edgeLines.length) sections.push(`Connections:\n${edgeLines.join('\n')}`);
  if (noteLines.length) sections.push(`Text on canvas:\n${noteLines.join('\n')}`);

  return sections.length ? sections.join('\n\n') : null;
};

/** Append generated Markdown into the live TipTap notes editor (parsed as markdown). */
export const appendNotesMarkdown = (markdown: string): void => {
  const editor = (window as unknown as { notesEditor?: any }).notesEditor;
  if (!editor || editor.isDestroyed) {
    throw new NotesGenerationError('The notes editor is not ready.');
  }
  const hasContent = editor.state.doc.content.size > 2;
  const payload = `${hasContent ? '\n\n' : ''}${markdown}\n`;
  // The markdown extension augments insertContent with a runtime `contentType`.
  const mdOpts = { contentType: 'markdown' } as Parameters<typeof editor.commands.insertContent>[1];
  editor.chain().focus('end').insertContent(payload, mdOpts).run();
};

/** Pull the topic from the notes editor: the selection, else the current block. */
export const readNotesTopic = (): string | null => {
  const editor = (window as unknown as { notesEditor?: any }).notesEditor;
  if (!editor || editor.isDestroyed) return null;
  const { from, to } = editor.state.selection;
  let topic = editor.state.doc.textBetween(from, to, '\n').trim();
  if (!topic) topic = editor.state.selection.$from.parent.textContent.trim();
  return topic || null;
};
