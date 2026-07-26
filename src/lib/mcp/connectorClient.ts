import {
  DEFAULT_MCP_CONNECTOR_ENDPOINT,
  type McpAgentRunEvent,
  type McpAgentRunRequest,
  type McpAgentStatus,
  type McpConnectorCatalog,
  type McpConnectorHealth,
  type McpConnectorSnapshot,
  type McpServerTestResult,
  type McpToolSummary,
} from './types';

const REQUEST_TIMEOUT_MS = 8_000;

type JsonRecord = Record<string, unknown>;

export class McpConnectorRequestError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'McpConnectorRequestError';
    this.status = status;
  }
}

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asTrimmedString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const errorMessageFromPayload = (payload: unknown, fallback: string): string => {
  if (!isRecord(payload)) return fallback;
  const error = payload.error;
  if (isRecord(error)) return asTrimmedString(error.message) || fallback;
  return asTrimmedString(payload.message) || fallback;
};

export const normalizeConnectorEndpoint = (value: string): string => {
  const candidate = value.trim() || DEFAULT_MCP_CONNECTOR_ENDPOINT;
  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    throw new McpConnectorRequestError('Enter a valid connector URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new McpConnectorRequestError('The connector URL must use HTTP or HTTPS.');
  }
  if (!url.hostname || url.username || url.password) {
    throw new McpConnectorRequestError('The connector URL cannot include credentials.');
  }

  url.hash = '';
  url.search = '';
  url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString().replace(/\/$/, '');
};

const connectorUrl = (endpoint: string, path: string): string =>
  new URL(path, `${normalizeConnectorEndpoint(endpoint)}/`).toString();

const requestJson = async (
  endpoint: string,
  path: string,
  accessToken?: string,
  body?: JsonRecord,
): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers = new Headers({ Accept: 'application/json' });
  const token = accessToken?.trim();

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body) headers.set('Content-Type', 'application/json');

  try {
    const response = await fetch(connectorUrl(endpoint, path), {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const raw = await response.text();
    let payload: unknown = {};

    if (raw) {
      try {
        payload = JSON.parse(raw) as unknown;
      } catch {
        throw new McpConnectorRequestError('The connector returned an invalid response.', response.status);
      }
    }

    if (!response.ok) {
      throw new McpConnectorRequestError(
        errorMessageFromPayload(payload, `Connector request failed (${response.status}).`),
        response.status,
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof McpConnectorRequestError) throw error;
    if (controller.signal.aborted) {
      throw new McpConnectorRequestError('The connector did not respond in time.');
    }
    throw new McpConnectorRequestError('Could not reach the local connector.');
  } finally {
    globalThis.clearTimeout(timeout);
  }
};

const parseHealth = (payload: unknown): McpConnectorHealth => {
  if (!isRecord(payload) || payload.service !== 'algoglyph-local-connector') {
    throw new McpConnectorRequestError('That URL is not an Algoglyph connector.');
  }
  const version = asTrimmedString(payload.version);
  const protocolVersion = payload.protocolVersion;

  if (!version || typeof protocolVersion !== 'number' || typeof payload.requiresToken !== 'boolean') {
    throw new McpConnectorRequestError('The connector returned incomplete health data.');
  }

  return {
    service: 'algoglyph-local-connector',
    version,
    protocolVersion,
    requiresToken: payload.requiresToken,
  };
};

const parseAgent = (value: unknown): McpAgentStatus | null => {
  if (!isRecord(value)) return null;
  const id = asTrimmedString(value.id);
  const label = asTrimmedString(value.label);
  const command = asTrimmedString(value.command);

  if (!id || !label || !command || typeof value.available !== 'boolean') return null;

  return {
    id,
    label,
    command,
    available: value.available,
    version: asTrimmedString(value.version),
  };
};

const parseCatalog = (payload: unknown): McpConnectorCatalog => {
  if (!isRecord(payload) || !Array.isArray(payload.agents) || !isRecord(payload.capabilities)) {
    throw new McpConnectorRequestError('The connector returned incomplete catalog data.');
  }

  const capabilities = payload.capabilities;
  if (typeof capabilities.remoteMcpTest !== 'boolean' || typeof capabilities.agentExecution !== 'boolean') {
    throw new McpConnectorRequestError('The connector returned an invalid capability catalog.');
  }

  return {
    agents: payload.agents.flatMap((agent) => {
      const parsed = parseAgent(agent);
      return parsed ? [parsed] : [];
    }),
    capabilities: {
      remoteMcpTest: capabilities.remoteMcpTest,
      agentExecution: capabilities.agentExecution,
    },
  };
};

const parseTool = (value: unknown): McpToolSummary | null => {
  if (!isRecord(value)) return null;
  const name = asTrimmedString(value.name);
  if (!name) return null;
  return {
    name,
    title: asTrimmedString(value.title),
    description: asTrimmedString(value.description),
  };
};

const parseMcpServerTest = (payload: unknown): McpServerTestResult => {
  if (!isRecord(payload) || !isRecord(payload.server) || !isRecord(payload.capabilities)) {
    throw new McpConnectorRequestError('The connector returned an invalid MCP server result.');
  }

  const transport = payload.transport;
  const serverName = asTrimmedString(payload.server.name);
  const capabilities = payload.capabilities;

  if (
    (transport !== 'streamable-http' && transport !== 'sse') ||
    !serverName ||
    typeof capabilities.tools !== 'boolean' ||
    typeof capabilities.resources !== 'boolean' ||
    typeof capabilities.prompts !== 'boolean' ||
    !Array.isArray(payload.tools)
  ) {
    throw new McpConnectorRequestError('The connector returned incomplete MCP server data.');
  }

  return {
    transport,
    server: {
      name: serverName,
      version: asTrimmedString(payload.server.version),
    },
    capabilities: {
      tools: capabilities.tools,
      resources: capabilities.resources,
      prompts: capabilities.prompts,
    },
    tools: payload.tools.flatMap((tool) => {
      const parsed = parseTool(tool);
      return parsed ? [parsed] : [];
    }),
  };
};

export const inspectMcpConnector = async (
  endpoint: string,
  accessToken?: string,
): Promise<McpConnectorSnapshot> => {
  const health = parseHealth(await requestJson(endpoint, 'v1/health'));
  const token = accessToken?.trim();

  if (health.requiresToken && !token) {
    return { health, catalog: null };
  }

  const catalog = parseCatalog(await requestJson(endpoint, 'v1/catalog', token));
  return { health, catalog };
};

export const testMcpServer = async (
  connectorEndpoint: string,
  connectorToken: string | undefined,
  serverEndpoint: string,
  serverToken?: string,
): Promise<McpServerTestResult> =>
  parseMcpServerTest(
    await requestJson(connectorEndpoint, 'v1/mcp/test', connectorToken, {
      endpoint: serverEndpoint,
      accessToken: serverToken?.trim() || undefined,
    }),
  );

const toAgentRunEvent = (eventName: string, data: JsonRecord): McpAgentRunEvent | null => {
  if (eventName === 'output') {
    return {
      type: 'output',
      stream: data.stream === 'stderr' ? 'stderr' : 'stdout',
      chunk: typeof data.chunk === 'string' ? data.chunk : '',
    };
  }
  if (eventName === 'exit') {
    return { type: 'exit', code: typeof data.code === 'number' ? data.code : null };
  }
  if (eventName === 'error') {
    return { type: 'error', message: asTrimmedString(data.message) || 'The agent run failed.' };
  }
  return null;
};

const parseSseRecord = (record: string): McpAgentRunEvent | null => {
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of record.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }

  if (!dataLines.length) return null;

  let data: unknown;
  try {
    data = JSON.parse(dataLines.join('\n'));
  } catch {
    return null;
  }

  return isRecord(data) ? toAgentRunEvent(eventName, data) : null;
};

const readErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `Agent run failed (${response.status}).`;
  try {
    const raw = await response.text();
    if (!raw) return fallback;
    return errorMessageFromPayload(JSON.parse(raw) as unknown, fallback);
  } catch {
    return fallback;
  }
};

/**
 * POSTs a headless run to the connector and yields each streamed event. The run
 * is bounded by the connector, so there is no client timeout here — pass a
 * `signal` (from an `AbortController`) to stop it, which the connector turns into
 * a `SIGTERM` for the child process.
 */
export async function* runAgent(
  connectorEndpoint: string,
  connectorToken: string | undefined,
  request: McpAgentRunRequest,
  signal?: AbortSignal,
): AsyncGenerator<McpAgentRunEvent> {
  const headers = new Headers({ Accept: 'text/event-stream', 'Content-Type': 'application/json' });
  const token = connectorToken?.trim();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(connectorUrl(connectorEndpoint, 'v1/agents/run'), {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal,
    });
  } catch {
    if (signal?.aborted) return;
    throw new McpConnectorRequestError('Could not reach the local connector.');
  }

  if (!response.ok || !response.body) {
    throw new McpConnectorRequestError(await readErrorMessage(response), response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const event = parseSseRecord(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (event) yield event;
        boundary = buffer.indexOf('\n\n');
      }
    }

    const tail = (buffer + decoder.decode()).trim();
    if (tail) {
      const event = parseSseRecord(tail);
      if (event) yield event;
    }
  } catch {
    if (signal?.aborted) return;
    throw new McpConnectorRequestError('The agent stream ended unexpectedly.');
  } finally {
    reader.cancel().catch(() => undefined);
  }
}
