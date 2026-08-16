import {
  DEFAULT_MCP_CONNECTOR_ENDPOINT,
  MCP_CONNECTOR_PROTOCOL_VERSION,
  type McpAgentRunEvent,
  type McpAgentRunRequest,
  type McpAgentStatus,
  type McpConnectorCatalog,
  type McpConnectorHealth,
  type McpConnectorSession,
  type McpConnectorSnapshot,
  type McpPairedConnectorSnapshot,
  type McpPairingCredential,
  type McpServerTestResult,
  type McpToolSummary,
} from './types';
import { useMcpStore } from '../../store/mcpStore';

const REQUEST_TIMEOUT_MS = 8_000;
const MCP_OPERATION_TIMEOUT_MS = 22_000;
const AGENT_RUN_WATCHDOG_MS = 125_000;
const MAX_CONNECTOR_RESPONSE_BYTES = 1024 * 1024;
const MAX_SSE_BUFFER_BYTES = 512 * 1024;

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
  if (!['127.0.0.1', 'localhost'].includes(url.hostname.toLowerCase())) {
    throw new McpConnectorRequestError('The AlgoGlyph connector must run on this device (loopback only).');
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new McpConnectorRequestError('The connector URL must point to the local connector root.');
  }

  return url.origin;
};

const connectorUrl = (endpoint: string, path: string): string =>
  new URL(path, `${normalizeConnectorEndpoint(endpoint)}/`).toString();

const readBoundedText = async (response: Response, maximum = MAX_CONNECTOR_RESPONSE_BYTES): Promise<string> => {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let output = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximum) {
      await reader.cancel();
      throw new McpConnectorRequestError('The connector response exceeded its safety limit.', response.status);
    }
    output += decoder.decode(value, { stream: true });
  }
  return output + decoder.decode();
};

const requestJson = async (
  endpoint: string,
  path: string,
  accessToken?: string,
  body?: JsonRecord,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
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
    const raw = await readBoundedText(response);
    let payload: unknown = {};

    if (raw) {
      try {
        payload = JSON.parse(raw) as unknown;
      } catch {
        throw new McpConnectorRequestError('The connector returned an invalid response.', response.status);
      }
    }

    if (!response.ok) {
      if (response.status === 401 && token) clearStoredConnectorSession();
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

const clearStoredConnectorSession = (): void => {
  const store = useMcpStore.getState();
  store.setConnectorToken(null);
  store.setConnectionState('needs-token', store.connectorHealth, null, 'The connector session is no longer valid.');
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
  if (protocolVersion !== MCP_CONNECTOR_PROTOCOL_VERSION) {
    throw new McpConnectorRequestError(
      `Incompatible connector protocol: AlgoGlyph requires v${MCP_CONNECTOR_PROTOCOL_VERSION}, but the connector reports v${protocolVersion}.`,
    );
  }

  return {
    service: 'algoglyph-local-connector',
    ...(payload.status === 'ready' ? { status: 'ready' as const } : {}),
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
    inputSchema: isRecord(value.inputSchema) ? value.inputSchema : undefined,
  };
};

const parsePairingCredential = (payload: unknown): McpPairingCredential => {
  if (!isRecord(payload)) {
    throw new McpConnectorRequestError('The connector returned an invalid pairing credential.');
  }
  const pairingToken = asTrimmedString(payload.pairingToken);
  const expiresAt = asTrimmedString(payload.expiresAt);
  const ttlSeconds = payload.ttlSeconds;
  const scopes = payload.scopes;

  if (!pairingToken || !expiresAt || typeof ttlSeconds !== 'number' || !Array.isArray(scopes)) {
    throw new McpConnectorRequestError('The connector returned incomplete pairing data.');
  }

  return { pairingToken, expiresAt, ttlSeconds, scopes: scopes.filter(isMcpSessionScope) };
};

const isMcpSessionScope = (value: unknown): value is McpConnectorSession['scopes'][number] =>
  value === 'catalog:read' || value === 'mcp:test' || value === 'mcp:invoke'
  || value === 'agent:run' || value === 'session:revoke';

const parseSession = (payload: unknown): McpConnectorSession => {
  if (!isRecord(payload)) {
    throw new McpConnectorRequestError('The connector returned an invalid session.');
  }
  const sessionToken = asTrimmedString(payload.sessionToken);
  const expiresAt = asTrimmedString(payload.expiresAt);
  const idleTimeoutSeconds = payload.idleTimeoutSeconds;
  const scopes = payload.scopes;
  if (
    !sessionToken ||
    payload.tokenType !== 'Bearer' ||
    !expiresAt ||
    typeof idleTimeoutSeconds !== 'number' ||
    !Array.isArray(scopes)
  ) {
    throw new McpConnectorRequestError('The connector returned incomplete session data.');
  }
  return {
    sessionToken,
    tokenType: 'Bearer',
    expiresAt,
    idleTimeoutSeconds,
    scopes: scopes.filter(isMcpSessionScope),
  };
};

const parseMcpServerTest = (payload: unknown): McpServerTestResult => {
  if (!isRecord(payload) || !isRecord(payload.server) || !isRecord(payload.capabilities)) {
    throw new McpConnectorRequestError('The connector returned an invalid MCP server result.');
  }

  const transport = payload.transport;
  const serverId = asTrimmedString(payload.serverId);
  const serverName = asTrimmedString(payload.server.name);
  const capabilities = payload.capabilities;

  if (
    (transport !== 'streamable-http' && transport !== 'sse') ||
    !serverName || !serverId ||
    typeof capabilities.tools !== 'boolean' ||
    typeof capabilities.resources !== 'boolean' ||
    typeof capabilities.prompts !== 'boolean' ||
    !Array.isArray(payload.tools) || !Array.isArray(payload.resources) || !Array.isArray(payload.prompts)
  ) {
    throw new McpConnectorRequestError('The connector returned incomplete MCP server data.');
  }

  return {
    serverId,
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
    resources: payload.resources.flatMap((value) => {
      if (!isRecord(value)) return [];
      const uri = asTrimmedString(value.uri);
      if (!uri) return [];
      return [{
        uri,
        name: asTrimmedString(value.name),
        title: asTrimmedString(value.title),
        description: asTrimmedString(value.description),
        mimeType: asTrimmedString(value.mimeType),
      }];
    }),
    prompts: payload.prompts.flatMap((value) => {
      if (!isRecord(value)) return [];
      const name = asTrimmedString(value.name);
      if (!name) return [];
      return [{
        name,
        title: asTrimmedString(value.title),
        description: asTrimmedString(value.description),
        arguments: Array.isArray(value.arguments) ? value.arguments.filter(isRecord) : undefined,
      }];
    }),
    truncated: payload.truncated === true,
  };
};

export const inspectMcpConnectorHealth = async (endpoint: string): Promise<McpConnectorHealth> =>
  parseHealth(await requestJson(endpoint, 'health'));

export const createMcpPairingCredential = async (
  endpoint: string,
): Promise<McpPairingCredential> =>
  parsePairingCredential(await requestJson(endpoint, 'v1/pairings', undefined, {}));

export const redeemMcpPairingCredential = async (
  endpoint: string,
  pairingToken: string,
): Promise<McpConnectorSession> =>
  parseSession(await requestJson(endpoint, 'v1/session', undefined, { pairingToken }));

export const pairMcpConnectorWithCredential = async (
  endpoint: string,
  pairingToken: string,
): Promise<McpPairedConnectorSnapshot> => {
  const normalized = normalizeConnectorEndpoint(endpoint);
  const health = await inspectMcpConnectorHealth(normalized);
  const session = await redeemMcpPairingCredential(normalized, pairingToken);
  const catalog = parseCatalog(await requestJson(normalized, 'v1/catalog', session.sessionToken));
  return { health, catalog, session };
};

export const pairMcpConnector = async (
  endpoint: string,
): Promise<McpPairedConnectorSnapshot> => {
  const normalized = normalizeConnectorEndpoint(endpoint);
  const health = await inspectMcpConnectorHealth(normalized);
  const pairing = await createMcpPairingCredential(normalized);
  const session = await redeemMcpPairingCredential(normalized, pairing.pairingToken);
  const catalog = parseCatalog(await requestJson(normalized, 'v1/catalog', session.sessionToken));
  return { health, catalog, session };
};

export const revokeMcpConnectorSession = async (
  endpoint: string,
  connectorToken: string | undefined,
): Promise<void> => {
  const token = connectorToken === undefined
    ? useMcpStore.getState().connectorToken?.trim()
    : connectorToken.trim();
  if (!token) return;
  await requestJson(endpoint, 'v1/session/revoke', token, {});
};

export const inspectMcpConnector = async (
  endpoint: string,
  accessToken?: string,
): Promise<McpConnectorSnapshot> => {
  const health = await inspectMcpConnectorHealth(endpoint);
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
  allowPrivateNetwork = false,
): Promise<McpServerTestResult> =>
  parseMcpServerTest(
    await requestJson(connectorEndpoint, 'v1/mcp/test', connectorToken, {
      endpoint: serverEndpoint,
      accessToken: serverToken?.trim() || undefined,
      allowPrivateNetwork,
    }, MCP_OPERATION_TIMEOUT_MS),
  );

export const invokeMcpTool = async (
  connectorEndpoint: string,
  connectorToken: string,
  serverId: string,
  toolName: string,
  args: JsonRecord,
): Promise<unknown> => requestJson(connectorEndpoint, 'v1/mcp/invoke', connectorToken, {
  serverId,
  toolName,
  arguments: args,
  confirmed: true,
}, MCP_OPERATION_TIMEOUT_MS);

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
  if (eventName === 'timing' && isRecord(data.stages)) {
    const stages = Object.fromEntries(
      Object.entries(data.stages).filter((entry): entry is [string, number] =>
        typeof entry[1] === 'number' && Number.isFinite(entry[1])),
    );
    return { type: 'timing', traceId: asTrimmedString(data.traceId), stages };
  }
  if (eventName === 'error') {
    return { type: 'error', message: asTrimmedString(data.message) || 'The agent run failed.' };
  }
  return null;
};

const parseSseRecord = (record: string): McpAgentRunEvent => {
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of record.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }

  if (!dataLines.length) throw new McpConnectorRequestError('The agent stream contained a malformed event.');

  let data: unknown;
  try {
    data = JSON.parse(dataLines.join('\n'));
  } catch {
    throw new McpConnectorRequestError('The agent stream contained invalid JSON.');
  }

  const event = isRecord(data) ? toAgentRunEvent(eventName, data) : null;
  if (!event) throw new McpConnectorRequestError('The agent stream contained an unsupported event.');
  return event;
};

const readErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `Agent run failed (${response.status}).`;
  try {
    const raw = await readBoundedText(response);
    if (!raw) return fallback;
    return errorMessageFromPayload(JSON.parse(raw) as unknown, fallback);
  } catch {
    return fallback;
  }
};

/**
 * POSTs a headless run to the connector and yields each streamed event. The run
 * is bounded by the connector and by a slightly longer browser watchdog. Pass
 * a `signal` (from an `AbortController`) to stop it early, which the connector
 * turns into process-tree cancellation.
 */
export async function* runAgent(
  connectorEndpoint: string,
  connectorToken: string | undefined,
  request: McpAgentRunRequest,
  signal?: AbortSignal,
): AsyncGenerator<McpAgentRunEvent> {
  const runState = useMcpStore.getState();
  runState.startAgentRun(request.agentId);
  const headers = new Headers({ Accept: 'text/event-stream', 'Content-Type': 'application/json' });
  const token = connectorToken === undefined ? runState.connectorToken?.trim() : connectorToken.trim();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const watchdogController = new AbortController();
  let watchdogTimedOut = false;
  const forwardCallerAbort = () => watchdogController.abort(signal?.reason);
  if (signal?.aborted) forwardCallerAbort();
  else signal?.addEventListener('abort', forwardCallerAbort, { once: true });
  const watchdogTimer = globalThis.setTimeout(() => {
    watchdogTimedOut = true;
    watchdogController.abort();
  }, AGENT_RUN_WATCHDOG_MS);
  const clearWatchdog = () => {
    globalThis.clearTimeout(watchdogTimer);
    signal?.removeEventListener('abort', forwardCallerAbort);
  };

  let response: Response;
  try {
    response = await fetch(connectorUrl(connectorEndpoint, 'v1/agents/run'), {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: watchdogController.signal,
    });
  } catch {
    clearWatchdog();
    if (signal?.aborted) {
      useMcpStore.getState().failAgentRun('The agent run was cancelled.');
      throw new McpConnectorRequestError('The agent run was cancelled.');
    }
    if (watchdogTimedOut) {
      useMcpStore.getState().failAgentRun('The local connector did not finish the agent run in time.');
      throw new McpConnectorRequestError('The local connector did not finish the agent run in time.');
    }
    useMcpStore.getState().failAgentRun('Could not reach the local connector.');
    throw new McpConnectorRequestError('Could not reach the local connector.');
  }

  if (!response.ok || !response.body) {
    const message = await readErrorMessage(response);
    clearWatchdog();
    if (response.status === 401 && token) clearStoredConnectorSession();
    useMcpStore.getState().failAgentRun(message);
    throw new McpConnectorRequestError(message, response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let sawExit = false;
  let failureMessage: string | undefined;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      if (new TextEncoder().encode(buffer).byteLength > MAX_SSE_BUFFER_BYTES) {
        throw new McpConnectorRequestError('The agent stream buffer exceeded its safety limit.');
      }

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const event = parseSseRecord(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (sawExit) throw new McpConnectorRequestError('The agent stream continued after its terminal event.');
        if (event.type === 'output') useMcpStore.getState().appendAgentOutput(event.chunk);
        if (event.type === 'error') {
          failureMessage = event.message;
          useMcpStore.getState().failAgentRun(event.message);
        }
        if (event.type === 'exit') {
          sawExit = true;
          if (event.code !== 0) {
            throw new McpConnectorRequestError(failureMessage || `The agent exited unsuccessfully (code ${event.code ?? 'unknown'}).`);
          }
          useMcpStore.getState().finishAgentRun(event.code);
        }
        yield event;
        boundary = buffer.indexOf('\n\n');
      }
    }

    const tail = (buffer + decoder.decode()).trim();
    if (tail) {
      const event = parseSseRecord(tail);
      if (sawExit) throw new McpConnectorRequestError('The agent stream continued after its terminal event.');
      if (event.type === 'output') useMcpStore.getState().appendAgentOutput(event.chunk);
      if (event.type === 'error') {
        failureMessage = event.message;
        useMcpStore.getState().failAgentRun(event.message);
      }
      if (event.type === 'exit') {
        sawExit = true;
        if (event.code !== 0) throw new McpConnectorRequestError(failureMessage || 'The agent exited unsuccessfully.');
        useMcpStore.getState().finishAgentRun(event.code);
      }
      yield event;
    }
    if (!sawExit) throw new McpConnectorRequestError(failureMessage || 'The agent stream ended without a terminal event.');
    if (failureMessage) throw new McpConnectorRequestError(failureMessage);
  } catch (error) {
    const message = signal?.aborted
      ? 'The agent run was cancelled.'
      : watchdogTimedOut
        ? 'The local connector did not finish the agent run in time.'
        : error instanceof Error ? error.message : 'The agent stream ended unexpectedly.';
    useMcpStore.getState().failAgentRun(message);
    if (signal?.aborted) throw new McpConnectorRequestError('The agent run was cancelled.');
    if (watchdogTimedOut) {
      throw new McpConnectorRequestError('The local connector did not finish the agent run in time.');
    }
    if (error instanceof McpConnectorRequestError) throw error;
    throw new McpConnectorRequestError('The agent stream ended unexpectedly.');
  } finally {
    reader.cancel().catch(() => undefined);
    clearWatchdog();
  }
}
