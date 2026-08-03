import { spawn } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const SERVICE_NAME = 'algoglyph-local-connector';
const CONNECTOR_VERSION = '0.1.0';
const DEFAULT_PORT = 4319;
const MAX_BODY_BYTES = 64 * 1024;
const PAIRING_TTL_MS = 90_000;
const MCP_REQUEST_TIMEOUT_MS = 10_000;
const AGENT_RUN_TIMEOUT_MS = 120_000;
const MAX_AGENT_OUTPUT_BYTES = 256 * 1024;
const MAX_PROMPT_BYTES = 32 * 1024;
const MAX_CONCURRENT_AGENT_RUNS = 1;
const PRODUCTION_ORIGINS = ['https://algoglyph.com', 'https://www.algoglyph.com'];
const DEVELOPMENT_ORIGINS = [
  'https://algoglyph.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// The connector — never the browser — owns the command and its fixed arguments.
// `runArgs` are constant; the user's prompt is delivered via stdin (`promptVia:
// 'stdin'`), or as a single positional placed after the `--` separator in
// `runArgs` (`promptVia: 'arg'`) so it can never be read as a flag. The exact
// headless subcommand for each CLI should be confirmed against its `--help`.
const AGENTS = [
  {
    id: 'codex',
    label: 'Codex CLI',
    command: 'codex',
    runArgs: ['exec', '--'],
    promptVia: 'stdin',
  },
  {
    // `agy -p "<prompt>"` runs a single prompt non-interactively (the prompt is
    // the value of -p). No --dangerously-skip-permissions, so tool use stays gated.
    id: 'antigravity',
    label: 'Antigravity CLI',
    command: 'agy',
    runArgs: ['-p'],
    promptVia: 'arg',
  },
  {
    // Claude Code headless: `-p`/`--print` runs non-interactively and reads the
    // prompt from stdin. No auto-approve flag — tool use stays default-gated.
    id: 'claude',
    label: 'Claude Code',
    command: 'claude',
    runArgs: ['-p'],
    promptVia: 'stdin',
  },
];

class ConnectorError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const parsePort = (value) => {
  if (!value) return DEFAULT_PORT;
  if (!/^\d+$/.test(value)) throw new Error('ALGOGLYPH_CONNECTOR_PORT must be a number.');
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error('ALGOGLYPH_CONNECTOR_PORT must be between 1024 and 65535.');
  }
  return port;
};

const parseAllowedOrigins = () => {
  const origins = new Set(PRODUCTION_ORIGINS);
  if (process.env.ALGOGLYPH_DEV_ORIGINS === '1') {
    for (const origin of DEVELOPMENT_ORIGINS) origins.add(origin);
  }
  const configured = process.env.ALGOGLYPH_ALLOWED_ORIGINS || '';

  for (const item of configured.split(',')) {
    const candidate = item.trim();
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.origin !== 'null') origins.add(url.origin);
    } catch {
      console.error(`[${SERVICE_NAME}] Ignoring invalid allowed origin: ${candidate}`);
    }
  }

  return origins;
};

const DEFAULT_APP_URL = 'https://algoglyph.com';

// Where the AlgoGlyph web app is served. Used to print a one-click "quick
// connect" link (Jupyter-style) that carries the token so the user never pastes
// it. Its origin is also auto-allowed for CORS.
const normalizeAppUrl = (value) => {
  const raw = (value || DEFAULT_APP_URL).trim();
  try {
    const url = new URL(raw);
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    console.error(`[${SERVICE_NAME}] Invalid ALGOGLYPH_APP_URL; using ${DEFAULT_APP_URL}.`);
    return DEFAULT_APP_URL;
  }
};

const port = parsePort(process.env.ALGOGLYPH_CONNECTOR_PORT);
const appUrl = normalizeAppUrl(process.env.ALGOGLYPH_APP_URL);
const allowedOrigins = parseAllowedOrigins();
try {
  allowedOrigins.add(new URL(appUrl).origin);
} catch {
  // appUrl is already validated above; ignore.
}
const configuredToken = process.env.ALGOGLYPH_CONNECTOR_TOKEN?.trim();
const connectorToken = configuredToken || randomBytes(24).toString('base64url');

const pairingCredentials = new Map();
const sessionTokens = new Set();

const createSecret = () => randomBytes(32).toString('base64url');

const createPairingCredential = () => {
  const token = createSecret();
  const expiresAt = Date.now() + PAIRING_TTL_MS;
  pairingCredentials.set(token, { expiresAt, used: false });
  return { token, expiresAt };
};

const prunePairings = () => {
  const now = Date.now();
  for (const [token, pairing] of pairingCredentials) {
    if (pairing.used || pairing.expiresAt <= now) pairingCredentials.delete(token);
  }
};
// A ready-to-open link the app reads once, auto-connects from, then scrubs.
const quickConnectUrl = () => {
  const pairing = createPairingCredential();
  const params = new URLSearchParams({ mcpPair: pairing.token });
  if (port !== DEFAULT_PORT) params.set('mcpEndpoint', `http://127.0.0.1:${port}`);
  return `${appUrl}/#${params.toString()}`;
};

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const responseError = (status, message) => ({
  error: { status, message },
});

const writeJson = (response, status, body) => {
  if (response.writableEnded) return;
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
};

const requestOrigin = (request) => {
  const origin = request.headers.origin;
  return typeof origin === 'string' ? origin : undefined;
};

const applyCors = (request, response) => {
  const origin = requestOrigin(request);
  if (!origin || !allowedOrigins.has(origin)) return false;

  response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (request.headers['access-control-request-private-network'] === 'true') {
    response.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  response.setHeader('Access-Control-Max-Age', '600');
  response.setHeader('Vary', 'Origin');
  return true;
};

const ensureAllowedOrigin = (request, response) => {
  const origin = requestOrigin(request);
  if (!origin) return;
  if (!applyCors(request, response)) {
    throw new ConnectorError(403, 'This browser origin is not allowed by the connector.');
  }
};

const headerValue = (request, name) => {
  const value = request.headers[name];
  return typeof value === 'string' ? value : undefined;
};

const isAuthorized = (request) => {
  const authorization = headerValue(request, 'authorization');
  if (!authorization?.startsWith('Bearer ')) return false;

  const token = authorization.slice(7);
  const supplied = Buffer.from(token);
  const expected = Buffer.from(connectorToken);
  if (supplied.length === expected.length && timingSafeEqual(supplied, expected)) return true;
  return sessionTokens.has(token);
};

const requireAuthorization = (request) => {
  if (!isAuthorized(request)) {
    throw new ConnectorError(401, 'A valid connector token is required.');
  }
};

const redeemPairingCredential = (body) => {
  const token = optionalToken(body.pairingToken, 'Pairing credential');
  const pairing = token ? pairingCredentials.get(token) : null;

  if (!pairing || pairing.used) {
    throw new ConnectorError(401, 'The pairing credential is invalid or already used.');
  }
  if (pairing.expiresAt <= Date.now()) {
    pairingCredentials.delete(token);
    throw new ConnectorError(410, 'The pairing credential has expired.');
  }

  pairing.used = true;
  pairingCredentials.delete(token);

  prunePairings();
  const sessionToken = createSecret();
  sessionTokens.add(sessionToken);
  return sessionToken;
};

const revokeSession = (request) => {
  const authorization = headerValue(request, 'authorization');
  if (!authorization?.startsWith('Bearer ')) return false;
  return sessionTokens.delete(authorization.slice(7));
};

const readJsonBody = (request) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let settled = false;

    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    request.on('data', (chunk) => {
      if (settled) return;
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        fail(new ConnectorError(413, 'Request body is too large.'));
        request.resume();
        return;
      }
      chunks.push(chunk);
    });
    request.on('error', () => fail(new ConnectorError(400, 'Could not read the request body.')));
    request.on('end', () => {
      if (settled) return;
      settled = true;
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) throw new Error('Expected a JSON object.');
        resolve(parsed);
      } catch {
        reject(new ConnectorError(400, 'Request body must be a JSON object.'));
      }
    });
  });

const runVersionCheck = (command) =>
  new Promise((resolve) => {
    let output = '';
    let settled = false;
    let child;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    try {
      child = spawn(command, ['--version'], {
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
    } catch {
      finish({ available: false });
      return;
    }

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
    }, 3_000);
    const capture = (chunk) => {
      if (output.length < 512) output += chunk.toString('utf8');
    };

    child.stdout.on('data', capture);
    child.stderr.on('data', capture);
    child.on('error', () => {
      clearTimeout(timer);
      finish({ available: false });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const version = output.replace(/\s+/g, ' ').trim().slice(0, 160);
      finish({ available: code === 0, version: version || undefined });
    });
  });

const detectAgents = async () =>
  Promise.all(
    AGENTS.map(async (agent) => {
      const result = await runVersionCheck(agent.command);
      // Only public fields leave the connector — `runArgs`/`promptVia` stay local.
      return { id: agent.id, label: agent.label, command: agent.command, ...result };
    }),
  );

const normalizeMcpEndpoint = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ConnectorError(400, 'An MCP server URL is required.');
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ConnectorError(400, 'Enter a valid MCP server URL.');
  }

  const isLoopback = ['127.0.0.1', '::1', 'localhost'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) {
    throw new ConnectorError(400, 'MCP servers must use HTTPS, except for a loopback development server.');
  }
  if (url.username || url.password || url.hash) {
    throw new ConnectorError(400, 'The MCP server URL cannot include credentials or a fragment.');
  }

  return url;
};

const optionalToken = (value, label) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > 4096) {
    throw new ConnectorError(400, `${label} is invalid.`);
  }
  return value;
};

const createAuthorizedFetch = (accessToken, controller) => async (input, init = {}) => {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  return fetch(input, { ...init, headers, signal: controller.signal });
};

const summaryFromClient = async (transportName, endpoint, accessToken, makeTransport) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MCP_REQUEST_TIMEOUT_MS);
  const fetchWithAuthorization = createAuthorizedFetch(accessToken, controller);
  const client = new Client(
    { name: 'algoglyph-local-connector', version: CONNECTOR_VERSION },
    { capabilities: {} },
  );
  const transport = makeTransport(fetchWithAuthorization);

  try {
    await client.connect(transport);
    const capabilities = client.getServerCapabilities() || {};
    const tools = capabilities.tools ? (await client.listTools()).tools : [];
    const server = client.getServerVersion();

    return {
      transport: transportName,
      server: {
        name: server?.name || 'MCP server',
        version: server?.version,
      },
      capabilities: {
        tools: Boolean(capabilities.tools),
        resources: Boolean(capabilities.resources),
        prompts: Boolean(capabilities.prompts),
      },
      tools: tools.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
      })),
    };
  } finally {
    clearTimeout(timer);
    await client.close().catch(() => undefined);
  }
};

const redactError = (error, secrets) => {
  const raw = error instanceof Error ? error.message : 'Could not connect to the MCP server.';
  return secrets
    .filter(Boolean)
    .reduce((message, secret) => message.replaceAll(secret, '[redacted]'), raw)
    .slice(0, 500);
};

const inspectMcpServer = async (body) => {
  const endpoint = normalizeMcpEndpoint(body.endpoint);
  const accessToken = optionalToken(body.accessToken, 'MCP server token');

  try {
    return await summaryFromClient('streamable-http', endpoint, accessToken, (fetchWithAuthorization) =>
      new StreamableHTTPClientTransport(endpoint, { fetch: fetchWithAuthorization }),
    );
  } catch (streamableError) {
    try {
      return await summaryFromClient('sse', endpoint, accessToken, (fetchWithAuthorization) =>
        new SSEClientTransport(endpoint, { fetch: fetchWithAuthorization }),
      );
    } catch (sseError) {
      const streamableMessage = redactError(streamableError, [accessToken]);
      const sseMessage = redactError(sseError, [accessToken]);
      throw new ConnectorError(
        502,
        `Could not connect to the MCP server. Streamable HTTP: ${streamableMessage}. SSE fallback: ${sseMessage}.`,
      );
    }
  }
};

const findAgent = (id) => (typeof id === 'string' ? AGENTS.find((agent) => agent.id === id) : undefined);

const validatePrompt = (value) => {
  if (typeof value !== 'string') {
    throw new ConnectorError(400, 'A prompt string is required.');
  }
  if (!value.trim()) {
    throw new ConnectorError(400, 'The prompt cannot be empty.');
  }
  if (Buffer.byteLength(value, 'utf8') > MAX_PROMPT_BYTES) {
    throw new ConnectorError(413, 'The prompt is too large.');
  }
  return value;
};

const agentRunSecrets = (prompt, body) => {
  const secrets = [prompt];
  const server = body.mcpServer;
  if (isRecord(server) && typeof server.accessToken === 'string') {
    secrets.push(server.accessToken);
  }
  return secrets;
};

let activeAgentRuns = 0;

// Spawns an allowlisted agent for a single headless prompt and streams its output
// back as Server-Sent Events. All validation that can reject the request happens
// *before* the 200/SSE headers are written, so the outer handler can still emit a
// normal JSON error. Once streaming begins, failures are surfaced as `error`
// events. The run is bounded by a wall-clock timeout, a max-output cap, and is
// killed if the client disconnects.
const streamAgentRun = (request, response, body) => {
  const agent = findAgent(body.agentId);
  if (!agent) {
    throw new ConnectorError(404, 'Unknown agent.');
  }
  const prompt = validatePrompt(body.prompt);
  const secrets = agentRunSecrets(prompt, body);

  if (activeAgentRuns >= MAX_CONCURRENT_AGENT_RUNS) {
    throw new ConnectorError(429, 'An agent run is already in progress. Try again once it finishes.');
  }

  const args = agent.promptVia === 'arg' ? [...agent.runArgs, prompt] : agent.runArgs;

  // Visible transparency: which CLI is being run (never the prompt itself).
  console.error(`[${SERVICE_NAME}] agent run: ${agent.label} — ${agent.command} ${agent.runArgs.join(' ')}`);

  let child;
  try {
    child = spawn(agent.command, args, {
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
  } catch (error) {
    throw new ConnectorError(500, redactError(error, secrets));
  }

  activeAgentRuns += 1;

  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let settled = false;
  let timedOut = false;
  let truncated = false;
  let outputBytes = 0;

  const send = (event, data) => {
    if (response.writableEnded) return;
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const timer = setTimeout(() => {
    timedOut = true;
    child.kill('SIGTERM');
  }, AGENT_RUN_TIMEOUT_MS);

  const cleanup = () => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    activeAgentRuns = Math.max(0, activeAgentRuns - 1);
  };

  const relay = (streamName) => (chunk) => {
    if (settled || truncated) return;
    const remaining = MAX_AGENT_OUTPUT_BYTES - outputBytes;
    const slice = chunk.length > remaining ? chunk.subarray(0, remaining) : chunk;
    if (slice.length > 0) {
      outputBytes += slice.length;
      send('output', { stream: streamName, chunk: slice.toString('utf8') });
    }
    if (outputBytes >= MAX_AGENT_OUTPUT_BYTES) {
      truncated = true;
      send('output', { stream: 'stderr', chunk: '\n[output truncated: limit reached]\n' });
      child.kill('SIGTERM');
    }
  };

  child.stdout.on('data', relay('stdout'));
  child.stderr.on('data', relay('stderr'));

  child.on('error', (error) => {
    if (settled) return;
    send('error', { message: redactError(error, secrets) });
    cleanup();
    response.end();
  });

  child.on('close', (code) => {
    if (settled) return;
    if (timedOut) {
      send('error', { message: `The agent run timed out after ${AGENT_RUN_TIMEOUT_MS / 1000}s.` });
    }
    send('exit', { code });
    cleanup();
    response.end();
  });

  // Client navigated away / pressed Stop → the fetch is aborted, the socket
  // closes, and we terminate the child. The `close` handler above then cleans up.
  const onClientGone = () => {
    if (settled) return;
    child.kill('SIGTERM');
  };
  request.on('close', onClientGone);
  response.on('close', onClientGone);

  if (agent.promptVia === 'arg') {
    child.stdin.end();
  } else {
    // Ignore EPIPE if the agent exits before consuming stdin.
    child.stdin.on('error', () => undefined);
    child.stdin.end(prompt);
  }
};

const handleRequest = async (request, response) => {
  ensureAllowedOrigin(request, response);
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url || '/', 'http://127.0.0.1');

  if (request.method === 'GET' && (url.pathname === '/health' || url.pathname === '/v1/health')) {
    writeJson(response, 200, {
      service: SERVICE_NAME,
      status: 'ready',
      version: CONNECTOR_VERSION,
      protocolVersion: 1,
      requiresToken: true,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/pairings') {
    prunePairings();
    const pairing = createPairingCredential();
    writeJson(response, 200, {
      pairingToken: pairing.token,
      expiresAt: new Date(pairing.expiresAt).toISOString(),
      ttlSeconds: Math.floor(PAIRING_TTL_MS / 1000),
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/session') {
    const body = await readJsonBody(request);
    const sessionToken = redeemPairingCredential(body);
    writeJson(response, 200, {
      sessionToken,
      tokenType: 'Bearer',
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/session/revoke') {
    requireAuthorization(request);
    revokeSession(request);
    writeJson(response, 200, { revoked: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog') {
    requireAuthorization(request);
    writeJson(response, 200, {
      agents: await detectAgents(),
      capabilities: {
        remoteMcpTest: true,
        agentExecution: true,
      },
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/mcp/test') {
    requireAuthorization(request);
    const body = await readJsonBody(request);
    writeJson(response, 200, await inspectMcpServer(body));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/agents/run') {
    requireAuthorization(request);
    const body = await readJsonBody(request);
    streamAgentRun(request, response, body);
    return;
  }

  throw new ConnectorError(404, 'Route not found.');
};

const server = createServer((request, response) => {
  void handleRequest(request, response).catch((error) => {
    const status = error instanceof ConnectorError ? error.status : 500;
    const message = error instanceof ConnectorError ? error.message : 'Connector request failed.';
    writeJson(response, status, responseError(status, message));
  });
});

server.on('error', (error) => {
  console.error(`[${SERVICE_NAME}] ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.error(`[${SERVICE_NAME}] Listening on http://127.0.0.1:${port}`);
  if (configuredToken) {
    console.error(`[${SERVICE_NAME}] Manual fallback token is loaded from ALGOGLYPH_CONNECTOR_TOKEN.`);
  } else {
    console.error(`[${SERVICE_NAME}] Manual fallback token (this process only): ${connectorToken}`);
  }
  console.error('');
  console.error(`[${SERVICE_NAME}] Quick connect (one-time, expires in ${PAIRING_TTL_MS / 1000}s):`);
  console.error(`[${SERVICE_NAME}]    ${quickConnectUrl()}`);
  console.error('');
});

const shutDown = () => server.close(() => process.exit(0));
process.once('SIGINT', shutDown);
process.once('SIGTERM', shutDown);
