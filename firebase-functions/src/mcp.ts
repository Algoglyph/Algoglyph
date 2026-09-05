import type { McpPrincipal } from './workspaces.js';
import {
  applyCanvasElementMutations,
  getWorkspace,
  listCanvasElements,
  listCanvases,
  requireCanvasAccess,
} from './workspaces.js';
import { HttpError } from './security.js';

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
}

const tools = [
  {
    name: 'algoglyph_workspace_get',
    description: 'Read the AlgoGlyph workspace authorized by this free, workspace-scoped MCP token.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'algoglyph_canvas_list',
    description: 'List canvases in the authorized AlgoGlyph workspace.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'algoglyph_canvas_get',
    description: 'Read one canvas and its versioned Excalidraw elements.',
    inputSchema: {
      type: 'object',
      properties: { canvasId: { type: 'string' } },
      required: ['canvasId'],
      additionalProperties: false,
    },
  },
  {
    name: 'algoglyph_canvas_upsert_elements',
    description: 'Create, update, or tombstone versioned Excalidraw elements without replacing the whole canvas.',
    inputSchema: {
      type: 'object',
      properties: {
        canvasId: { type: 'string' },
        elements: { type: 'array', minItems: 1, maxItems: 200, items: { type: 'object' } },
      },
      required: ['canvasId', 'elements'],
      additionalProperties: false,
    },
  },
] as const;

const rpcError = (id: JsonRpcId, code: number, message: string) => ({
  jsonrpc: '2.0' as const,
  id,
  error: { code, message },
});

const rpcResult = (id: JsonRpcId, result: unknown) => ({ jsonrpc: '2.0' as const, id, result });

const textResult = (value: unknown) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
  structuredContent: value,
});

const requestObject = (value: unknown): JsonRpcRequest => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Invalid JSON-RPC request.');
  const request = value as Partial<JsonRpcRequest>;
  if (request.jsonrpc !== '2.0' || typeof request.method !== 'string') {
    throw new HttpError(400, 'Invalid JSON-RPC request.');
  }
  return request as JsonRpcRequest;
};

const argumentsFrom = (params: Record<string, unknown> | undefined): Record<string, unknown> => {
  const args = params?.arguments;
  return args && typeof args === 'object' && !Array.isArray(args) ? args as Record<string, unknown> : {};
};

const requireCanvasId = (args: Record<string, unknown>): string => {
  if (typeof args.canvasId !== 'string' || !args.canvasId.trim()) throw new HttpError(400, 'canvasId is required.');
  return args.canvasId.trim();
};

export const handleMcpRequest = async (
  principal: McpPrincipal,
  input: unknown,
): Promise<Record<string, unknown> | null> => {
  const request = requestObject(input);
  const id = request.id ?? null;
  if (request.method.startsWith('notifications/')) return null;
  if (request.method === 'initialize') {
    return rpcResult(id, {
      protocolVersion: '2025-06-18',
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'algoglyph-workspace-mcp', version: '1.0.0' },
    });
  }
  if (request.method === 'ping') return rpcResult(id, {});
  if (request.method === 'tools/list') return rpcResult(id, { tools });
  if (request.method !== 'tools/call') return rpcError(id, -32601, 'Method not found.');

  const name = typeof request.params?.name === 'string' ? request.params.name : '';
  const args = argumentsFrom(request.params);
  const user = { uid: principal.uid };
  if (name === 'algoglyph_workspace_get') {
    return rpcResult(id, textResult(await getWorkspace(user, principal.workspaceId)));
  }
  if (name === 'algoglyph_canvas_list') {
    return rpcResult(id, textResult({ canvases: await listCanvases(user, principal.workspaceId) }));
  }
  if (name === 'algoglyph_canvas_get') {
    const canvasId = requireCanvasId(args);
    const { canvas } = await requireCanvasAccess(user, principal.workspaceId, canvasId);
    const elements = await listCanvasElements(user, principal.workspaceId, canvasId);
    return rpcResult(id, textResult({
      canvas: { id: canvasId, workspaceId: principal.workspaceId, name: canvas.name },
      elements,
    }));
  }
  if (name === 'algoglyph_canvas_upsert_elements') {
    if (!principal.scopes.includes('canvas:write')) throw new HttpError(403, 'This MCP token is read-only.');
    const canvasId = requireCanvasId(args);
    return rpcResult(id, textResult(await applyCanvasElementMutations(
      user,
      principal.workspaceId,
      canvasId,
      args.elements,
    )));
  }
  return rpcResult(id, { content: [{ type: 'text', text: 'Unknown tool.' }], isError: true });
};
