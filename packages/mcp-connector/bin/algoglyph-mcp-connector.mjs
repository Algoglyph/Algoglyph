import { execFile, spawn } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { chmod, copyFile, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { isIP } from 'node:net';
import { tmpdir } from 'node:os';
import { delimiter, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { Client, SSEClientTransport, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { Server as McpServer } from '@modelcontextprotocol/server';
import { Agent as UndiciAgent } from 'undici';

const SERVICE_NAME = 'algoglyph-local-connector';
const CONNECTOR_VERSION = '0.2.2';
const CONNECTOR_PROTOCOL_VERSION = 2;
const DEFAULT_PORT = 4319;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_JSON_RESPONSE_BYTES = 1024 * 1024;
const MAX_MCP_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_MCP_ITEMS = 200;
const MAX_MCP_PAGES = 8;
const MAX_REDIRECTS = 3;
const PAIRING_TTL_MS = 90_000;
const MCP_REQUEST_TIMEOUT_MS = 10_000;
const MCP_CLOSE_TIMEOUT_MS = 1_000;
const AGENT_RUN_TIMEOUT_MS = 120_000;
const ANTIGRAVITY_SESSION_READY_TIMEOUT_MS = 90_000;
const MAX_AGENT_OUTPUT_BYTES = 256 * 1024;
const MAX_PROMPT_BYTES = 32 * 1024;
const MAX_CONCURRENT_AGENT_RUNS = 1;
const MAX_CONCURRENT_MCP_OPERATIONS = 2;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_IDLE_TTL_MS = 30 * 60 * 1000;
const MAX_SESSIONS = 8;
const APPROVED_MCP_TTL_MS = 30 * 60 * 1000;
const MAX_APPROVED_MCP_SERVERS_PER_OWNER = 4;
const MAX_MCP_APPROVAL_BYTES = 512 * 1024;
const MAX_JSON_DEPTH = 12;
const MAX_JSON_KEYS = 512;
const MAX_JSON_ARRAY_ITEMS = 256;
const MAX_JSON_STRING_BYTES = 32 * 1024;
const MAX_URL_BYTES = 2_048;
const MAX_TRANSCRIPT_FILES = 2;
const MAX_TRANSCRIPT_FILE_BYTES = 512 * 1024;
const MCP_TOOL_NAME_PATTERN = /^[A-Za-z0-9_.:/-]{1,200}$/;
const PAIRING_ISSUE_RATE_LIMIT = 5;
const PAIRING_REDEEM_RATE_LIMIT = 20;
const CATALOG_RATE_LIMIT = 30;
const MCP_TEST_RATE_LIMIT = 10;
const MCP_INVOKE_RATE_LIMIT = 30;
const AGENT_RUN_RATE_LIMIT = 10;
const AUTH_RATE_WINDOW_MS = 60_000;
const DEV_TIMING_ENABLED = process.env.ALGOGLYPH_DEV_TIMING === '1';
const SESSION_SCOPES = Object.freeze(['catalog:read', 'mcp:test', 'mcp:invoke', 'agent:run', 'session:revoke']);
const PRODUCTION_ORIGINS = ['https://algoglyph.com', 'https://www.algoglyph.com', 'app://algoglyph'];
const DEVELOPMENT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const PREVIEW_ORIGINS = ['https://algoglyph.pages.dev'];

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
    runArgs: [
      'exec',
      '--ephemeral',
      '--ignore-rules',
      '--strict-config',
      '--skip-git-repo-check',
      // Codex needs its credential material in the process environment/home to
      // authenticate, but the model must never receive a command-capable tool
      // that could read those secrets. Keep only the explicitly configured MCP
      // relay available; disable every local/open-world execution surface.
      '-c', 'approval_policy="never"',
      '-c', 'web_search="disabled"',
      '-c', 'features.shell_tool=false',
      '-c', 'features.shell_snapshot=false',
      '-c', 'features.unified_exec=false',
      '-c', 'features.apps=false',
      '-c', 'features.remote_plugin=false',
      '-c', 'features.multi_agent=false',
      '-c', 'features.hooks=false',
      '-c', 'features.skill_mcp_dependency_install=false',
      '--',
    ],
    promptVia: 'stdin',
    authEnv: ['OPENAI_API_KEY'],
  },
  {
    // `agy -p "<prompt>"` runs a single prompt non-interactively (the prompt is
    // the value of -p). No --dangerously-skip-permissions, so tool use stays gated.
    id: 'antigravity',
    label: 'Antigravity CLI',
    command: 'agy',
    // All flags must precede `-p`: Antigravity consumes the argument directly
    // after `-p` as the prompt value.
    runArgs: ['--sandbox', '--disable-slash-commands', '-p'],
    promptVia: 'arg',
    authEnv: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  },
  {
    // Claude Code headless: `-p`/`--print` runs non-interactively and reads the
    // prompt from stdin. No auto-approve flag — tool use stays default-gated.
    id: 'claude',
    label: 'Claude Code',
    command: 'claude',
    // `--tools ''` removes built-ins but leaves configured MCP tools available.
    // `dontAsk` then denies anything outside the exact per-run allowlist below.
    runArgs: ['-p', '--tools', '', '--permission-mode', 'dontAsk', '--no-session-persistence'],
    promptVia: 'stdin',
    authEnv: ['ANTHROPIC_API_KEY'],
  },
];

const testAgentFixture = process.env.NODE_ENV === 'test'
  ? process.env.ALGOGLYPH_TEST_AGENT_FIXTURE?.trim()
  : undefined;
const testAntigravityFixture = process.env.NODE_ENV === 'test'
  ? process.env.ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE?.trim()
  : undefined;
if (testAgentFixture) {
  AGENTS.push({
    id: 'fixture',
    label: 'Test fixture agent',
    command: process.execPath,
    runArgs: [testAgentFixture],
    promptVia: 'stdin',
    authEnv: [],
  });
}

class ConnectorError extends Error {
  constructor(status, message, retryAfterSeconds) {
    super(message);
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const testOverride = (name, fallback, minimum = 1) => {
  if (process.env.NODE_ENV !== 'test') return fallback;
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= minimum ? value : fallback;
};

const sessionTtlMs = testOverride('ALGOGLYPH_TEST_SESSION_TTL_MS', SESSION_TTL_MS, 25);
const sessionIdleTtlMs = testOverride('ALGOGLYPH_TEST_SESSION_IDLE_TTL_MS', SESSION_IDLE_TTL_MS, 25);
const maxSessions = testOverride('ALGOGLYPH_TEST_MAX_SESSIONS', MAX_SESSIONS);
const pairingIssueRateLimit = testOverride('ALGOGLYPH_TEST_PAIRING_ISSUE_RATE_LIMIT', PAIRING_ISSUE_RATE_LIMIT);
const pairingRedeemRateLimit = testOverride('ALGOGLYPH_TEST_PAIRING_REDEEM_RATE_LIMIT', PAIRING_REDEEM_RATE_LIMIT);
const authRateWindowMs = testOverride('ALGOGLYPH_TEST_AUTH_RATE_WINDOW_MS', AUTH_RATE_WINDOW_MS, 25);
const antigravitySessionReadyTimeoutMs = testOverride(
  'ALGOGLYPH_TEST_ANTIGRAVITY_READY_TIMEOUT_MS',
  ANTIGRAVITY_SESSION_READY_TIMEOUT_MS,
  25,
);
const antigravityResetTimeoutMs = testOverride('ALGOGLYPH_TEST_ANTIGRAVITY_RESET_TIMEOUT_MS', 5_000, 25);
const antigravityEligibilityRetryDelayMs = testOverride(
  'ALGOGLYPH_TEST_ANTIGRAVITY_ELIGIBILITY_RETRY_DELAY_MS',
  15_000,
  25,
);
const mcpRequestTimeoutMs = testOverride(
  'ALGOGLYPH_TEST_MCP_REQUEST_TIMEOUT_MS',
  MCP_REQUEST_TIMEOUT_MS,
  25,
);
const testDnsDelayMs = testOverride('ALGOGLYPH_TEST_DNS_DELAY_MS', 0, 0);

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
  if (process.env.ALGOGLYPH_PREVIEW_ORIGINS === '1') {
    for (const origin of PREVIEW_ORIGINS) origins.add(origin);
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

const port = parsePort(process.env.ALGOGLYPH_CONNECTOR_PORT);
const allowedOrigins = parseAllowedOrigins();
const configuredToken = process.env.ALGOGLYPH_CONNECTOR_TOKEN?.trim();
if (configuredToken && Buffer.byteLength(configuredToken, 'utf8') < 32) {
  throw new Error('ALGOGLYPH_CONNECTOR_TOKEN must be at least 32 bytes long and unpredictable.');
}
const connectorToken = configuredToken || randomBytes(24).toString('base64url');

const pairingCredentials = new Map();
const sessions = new Map();
const approvedMcpServers = new Map();
const mcpRelays = new Map();
const pairingIssueAttempts = new Map();
const pairingRedeemAttempts = new Map();
const catalogAttempts = new Map();
const mcpTestAttempts = new Map();
const mcpInvokeAttempts = new Map();
const agentRunAttempts = new Map();
const trackedTempRoots = new Set();

const createSecret = () => randomBytes(32).toString('base64url');
const monotonicMilliseconds = () => Number(process.hrtime.bigint()) / 1_000_000;

const requestedScopes = (body = {}) => {
  if (body.scopes === undefined) return [...SESSION_SCOPES];
  if (!Array.isArray(body.scopes) || body.scopes.length === 0) {
    throw new ConnectorError(400, 'Pairing scopes must be a non-empty array.');
  }

  const scopes = new Set(['session:revoke']);
  for (const scope of body.scopes) {
    if (typeof scope !== 'string' || !SESSION_SCOPES.includes(scope)) {
      throw new ConnectorError(400, 'Pairing scopes contain an unsupported capability.');
    }
    scopes.add(scope);
  }
  return [...scopes];
};

const createPairingCredential = (scopes = SESSION_SCOPES, origin) => {
  const token = createSecret();
  const expiresAt = Date.now() + PAIRING_TTL_MS;
  pairingCredentials.set(token, {
    expiresAt,
    expiresAtMonotonic: monotonicMilliseconds() + PAIRING_TTL_MS,
    scopes: [...scopes],
    used: false,
    origin,
  });
  return { token, expiresAt, scopes: [...scopes] };
};

const prunePairings = () => {
  const now = monotonicMilliseconds();
  for (const [token, pairing] of pairingCredentials) {
    if (pairing.used || pairing.expiresAtMonotonic <= now) pairingCredentials.delete(token);
  }
};

const deleteApprovedServer = (id) => {
  const server = approvedMcpServers.get(id);
  if (!server) return false;
  approvedMcpServers.delete(id);
  for (const [relayId, relay] of mcpRelays) {
    if (relay.server.id === id) mcpRelays.delete(relayId);
  }
  if (antigravitySession?.approvedServerId === id) void stopAntigravitySession(antigravitySession);
  return true;
};

const removeApprovedServersForOwner = (owner) => {
  for (const [id, server] of approvedMcpServers) {
    if (server.owner === owner) deleteApprovedServer(id);
  }
  for (const [id, relay] of mcpRelays) {
    if (relay.owner === owner) mcpRelays.delete(id);
  }
};

const stopOwnerResources = async (owner) => {
  removeApprovedServersForOwner(owner);
  const warmSession = antigravitySession?.owner === owner ? antigravitySession : undefined;
  const ownedChildren = [...activeChildren].filter((entry) => entry.owner === owner);
  await Promise.allSettled([
    ...(warmSession ? [stopAntigravitySession(warmSession)] : []),
    ...ownedChildren.map((entry) => terminateProcessTree(entry.child, true)),
  ]);
};

const deleteSession = (token) => {
  if (!sessions.delete(token)) return false;
  void stopOwnerResources(token);
  return true;
};

const pruneSessions = () => {
  const now = monotonicMilliseconds();
  for (const [token, session] of sessions) {
    if (session.expiresAtMonotonic <= now
      || session.lastUsedAtMonotonic + sessionIdleTtlMs <= now) deleteSession(token);
  }
  for (const [id, server] of approvedMcpServers) {
    if (server.expiresAtMonotonic <= now) deleteApprovedServer(id);
  }
};

const pruneRateLimits = (attempts) => {
  const cutoff = monotonicMilliseconds() - authRateWindowMs;
  for (const [key, timestamps] of attempts) {
    const active = timestamps.filter((timestamp) => timestamp > cutoff);
    if (active.length) attempts.set(key, active);
    else attempts.delete(key);
  }
};

const consumeRateLimit = (attempts, key, maximum, label = 'requests') => {
  pruneRateLimits(attempts);
  const timestamps = attempts.get(key) || [];
  if (timestamps.length >= maximum) {
    const retryAfterMs = Math.max(1, timestamps[0] + authRateWindowMs - monotonicMilliseconds());
    throw new ConnectorError(429, `Too many ${label}. Try again later.`, Math.ceil(retryAfterMs / 1000));
  }
  timestamps.push(monotonicMilliseconds());
  attempts.set(key, timestamps);
};

const requestRateKey = (request) => `${request.socket.remoteAddress || 'unknown'}:${requestOrigin(request) || 'native'}`;

const pruneAuthState = () => {
  prunePairings();
  pruneSessions();
  pruneRateLimits(pairingIssueAttempts);
  pruneRateLimits(pairingRedeemAttempts);
  pruneRateLimits(catalogAttempts);
  pruneRateLimits(mcpTestAttempts);
  pruneRateLimits(mcpInvokeAttempts);
  pruneRateLimits(agentRunAttempts);
};

const authSweepTimer = setInterval(
  pruneAuthState,
  Math.max(25, Math.min(60_000, sessionIdleTtlMs, sessionTtlMs, authRateWindowMs)),
);
authSweepTimer.unref();
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const assertAllowedKeys = (body, allowed) => {
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) throw new ConnectorError(400, `Unsupported request field: ${key}.`);
  }
};

const validateJsonValue = (value, depth = 0, state = { keys: 0 }) => {
  if (depth > MAX_JSON_DEPTH) throw new ConnectorError(400, 'JSON input is nested too deeply.');
  if (typeof value === 'string' && Buffer.byteLength(value, 'utf8') > MAX_JSON_STRING_BYTES) {
    throw new ConnectorError(400, 'A JSON string exceeded the safety limit.');
  }
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new ConnectorError(400, 'JSON numbers must be finite.');
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_JSON_ARRAY_ITEMS) throw new ConnectorError(400, 'A JSON array exceeded the safety limit.');
    for (const item of value) validateJsonValue(item, depth + 1, state);
    return;
  }
  if (!isRecord(value)) throw new ConnectorError(400, 'Request data must be valid JSON.');
  for (const [key, item] of Object.entries(value)) {
    state.keys += 1;
    if (state.keys > MAX_JSON_KEYS) throw new ConnectorError(400, 'JSON input has too many fields.');
    if (['__proto__', 'prototype', 'constructor'].includes(key)) {
      throw new ConnectorError(400, 'Unsafe JSON object keys are not allowed.');
    }
    validateJsonValue(item, depth + 1, state);
  }
};

const roundedMilliseconds = (value) => Math.round(value * 1000) / 1000;

const mcpTimeoutError = () => new ConnectorError(
  504,
  'The MCP server operation did not complete before its time limit.',
);

const raceWithAbort = (operation, signal) => {
  if (signal.aborted) return Promise.reject(mcpTimeoutError());
  return new Promise((resolveDone, reject) => {
    const cleanup = () => signal.removeEventListener('abort', onAbort);
    const onAbort = () => {
      cleanup();
      reject(mcpTimeoutError());
    };
    signal.addEventListener('abort', onAbort, { once: true });
    if (signal.aborted) {
      onAbort();
    }
    Promise.resolve(operation).then((value) => {
      cleanup();
      resolveDone(value);
    }, (error) => {
      cleanup();
      reject(error);
    });
  });
};

const abortableDelay = (milliseconds, signal) => {
  let timer;
  const delay = new Promise((resolveDone) => {
    timer = setTimeout(resolveDone, milliseconds);
    timer.unref();
  });
  return raceWithAbort(delay, signal).finally(() => clearTimeout(timer));
};

const logTimeOfDayMilliseconds = (line) => {
  const match = line.match(/\b[IEWF]\d{4}\s+(\d{2}):(\d{2}):(\d{2})\.(\d{6})\b/);
  if (!match) return undefined;
  return Number(match[1]) * 3_600_000
    + Number(match[2]) * 60_000
    + Number(match[3]) * 1_000
    + Number(match[4]) / 1_000;
};

const elapsedLogMilliseconds = (start, end) => {
  if (start === undefined || end === undefined) return undefined;
  const elapsed = end - start;
  return elapsed >= 0 ? elapsed : elapsed + 24 * 60 * 60 * 1_000;
};

const parseAntigravityTimingLog = (source, approvedServer) => {
  const lines = source.split(/\r?\n/);
  const findTime = (pattern, fromEnd = false) => {
    const candidates = fromEnd ? [...lines].reverse() : lines;
    const line = candidates.find((candidate) => pattern.test(candidate));
    return line ? logTimeOfDayMilliseconds(line) : undefined;
  };
  const startupLine = lines.find((line) => line.includes('CLI startup completed'));
  const startupMatch = startupLine?.match(/took\s+([\d.]+)ms/);
  const startupCompleted = startupLine ? logTimeOfDayMilliseconds(startupLine) : undefined;
  const messageSent = findTime(/Print mode: .*sending message/);
  const firstProviderResponse = findTime(/streamGenerateContent.*ResponseID:/);
  const streamCompleted = findTime(/Stream completed .*clearing ResponsePending/, true);
  const stages = {};
  if (startupMatch) stages.cli_initialization_ms = Number(startupMatch[1]);
  const cliPreModel = elapsedLogMilliseconds(startupCompleted, messageSent);
  if (cliPreModel !== undefined) stages.cli_post_startup_to_model_request_ms = cliPreModel;
  const firstOutput = elapsedLogMilliseconds(messageSent, firstProviderResponse);
  if (firstOutput !== undefined) stages.time_to_first_model_output_ms = firstOutput;
  const inference = elapsedLogMilliseconds(messageSent, streamCompleted);
  if (inference !== undefined) stages.model_inference_ms = inference;
  const generation = elapsedLogMilliseconds(firstProviderResponse, streamCompleted);
  if (generation !== undefined) stages.model_output_after_first_response_ms = generation;
  if (!approvedServer) stages.mcp_initialization_ms = 0;
  return stages;
};

const responseError = (status, message) => ({
  error: { status, message },
});

const applySecurityHeaders = (response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
};

const writeJson = (response, status, body) => {
  if (response.writableEnded) return;
  if (response.headersSent) {
    response.destroy();
    return;
  }
  applySecurityHeaders(response);
  let payload = JSON.stringify(body);
  if (Buffer.byteLength(payload, 'utf8') > MAX_JSON_RESPONSE_BYTES) {
    status = 507;
    payload = JSON.stringify(responseError(status, 'The connector response exceeded its safety limit.'));
  }
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(payload);
};

const requestOrigin = (request) => {
  const origin = request.headers.origin;
  return typeof origin === 'string' ? origin : undefined;
};

const requireTrustedBrowserOrigin = (request) => {
  const origin = requestOrigin(request);
  if (!origin || !allowedOrigins.has(origin)) {
    throw new ConnectorError(403, 'Automatic pairing requires a trusted AlgoGlyph browser origin.');
  }
  return origin;
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

const ensureLoopbackHost = (request) => {
  const supplied = headerValue(request, 'host');
  if (!supplied) throw new ConnectorError(400, 'A valid loopback Host header is required.');
  let parsed;
  try {
    parsed = new URL(`http://${supplied}`);
  } catch {
    throw new ConnectorError(400, 'A valid loopback Host header is required.');
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!['127.0.0.1', 'localhost', '::1'].includes(host) || Number(parsed.port || 80) !== port) {
    throw new ConnectorError(403, 'The connector only accepts its configured loopback Host.');
  }
};

const headerValue = (request, name) => {
  const value = request.headers[name];
  return typeof value === 'string' ? value : undefined;
};

const bearerToken = (request) => {
  const authorization = headerValue(request, 'authorization');
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
};

const constantTimeEquals = (left, right) => {
  if (!left || !right) return false;
  const supplied = Buffer.from(left);
  const expected = Buffer.from(right);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};

const isMasterToken = (token) => constantTimeEquals(token, connectorToken);

const requireAuthorization = (request, requiredScope) => {
  const token = bearerToken(request);
  if (isMasterToken(token)) return { kind: 'master' };

  pruneSessions();
  const session = token ? sessions.get(token) : undefined;
  if (!session) {
    throw new ConnectorError(401, 'A valid connector token is required.');
  }
  if (requiredScope && !session.scopes.has(requiredScope)) {
    throw new ConnectorError(403, 'This connector session does not allow that operation.');
  }
  if (!session.origin || requestOrigin(request) !== session.origin) {
    throw new ConnectorError(403, 'This connector session belongs to a different browser origin.');
  }

  session.lastUsedAtMonotonic = monotonicMilliseconds();
  return { kind: 'session', session, token };
};

const redeemPairingCredential = (body, origin) => {
  const token = optionalToken(body.pairingToken, 'Pairing credential');
  const pairing = token ? pairingCredentials.get(token) : null;

  if (!pairing || pairing.used) {
    throw new ConnectorError(401, 'The pairing credential is invalid or already used.');
  }
  if (pairing.expiresAtMonotonic <= monotonicMilliseconds()) {
    pairingCredentials.delete(token);
    throw new ConnectorError(410, 'The pairing credential has expired.');
  }
  if (!pairing.origin || pairing.origin !== origin) {
    throw new ConnectorError(403, 'The pairing credential belongs to a different browser origin.');
  }

  pairing.used = true;
  pairingCredentials.delete(token);

  prunePairings();
  pruneSessions();
  if (sessions.size >= maxSessions) {
    const oldest = [...sessions.entries()].sort((left, right) => (
      left[1].lastUsedAtMonotonic - right[1].lastUsedAtMonotonic
    ))[0];
    if (oldest) deleteSession(oldest[0]);
  }

  const now = Date.now();
  const nowMonotonic = monotonicMilliseconds();
  const sessionToken = createSecret();
  const session = {
    createdAt: now,
    expiresAt: now + sessionTtlMs,
    expiresAtMonotonic: nowMonotonic + sessionTtlMs,
    lastUsedAtMonotonic: nowMonotonic,
    origin,
    scopes: new Set(pairing.scopes),
  };
  sessions.set(sessionToken, session);
  return { session, sessionToken };
};

const revokeSession = async (request) => {
  const token = bearerToken(request);
  if (!token) return false;
  const deleted = sessions.delete(token);
  if (deleted) await stopOwnerResources(token);
  return deleted;
};

const ensureJsonContentType = (request) => {
  const contentType = headerValue(request, 'content-type') || '';
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new ConnectorError(415, 'JSON requests must use Content-Type: application/json.');
  }
};

const readJsonBody = (request, { objectOnly = true } = {}) =>
  new Promise((resolve, reject) => {
    try {
      ensureJsonContentType(request);
    } catch (error) {
      reject(error);
      request.resume();
      return;
    }
    const chunks = [];
    let total = 0;
    let settled = false;
    const timer = setTimeout(() => {
      fail(new ConnectorError(408, 'Request body timed out.'));
      request.resume();
    }, 10_000);
    timer.unref();

    const fail = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
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
      clearTimeout(timer);
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (objectOnly && !isRecord(parsed)) throw new Error('Expected a JSON object.');
        validateJsonValue(parsed);
        resolve(parsed);
      } catch (error) {
        reject(error instanceof ConnectorError
          ? error
          : new ConnectorError(400, 'Request body must be a JSON object.'));
      }
    });
  });

const runVersionCheck = async (command) => {
  let probeDirectory;
  try {
    probeDirectory = await mkdtemp(join(tmpdir(), 'algoglyph-agent-probe-'));
    trackedTempRoots.add(probeDirectory);
  } catch {
    return { available: false };
  }
  const environment = {};
  for (const name of ['SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'LANG', 'LC_ALL']) {
    if (process.env[name]) environment[name] = process.env[name];
  }
  environment.PATH = [dirname(command), process.env.SystemRoot && join(process.env.SystemRoot, 'System32')]
    .filter(Boolean)
    .join(delimiter);
  environment.HOME = probeDirectory;
  environment.USERPROFILE = probeDirectory;
  environment.TEMP = probeDirectory;
  environment.TMP = probeDirectory;

  try {
    return await new Promise((resolveDone) => {
    let output = '';
    let settled = false;
    let child;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolveDone(result);
    };

    try {
      child = spawn(command, ['--version'], {
        cwd: probeDirectory,
        env: environment,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
    } catch {
      finish({ available: false });
      return;
    }

    const timer = setTimeout(() => {
      void terminateProcessTree(child, true).finally(() => finish({ available: false }));
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
  } finally {
    await rm(probeDirectory, { recursive: true, force: true }).catch(() => undefined);
    trackedTempRoots.delete(probeDirectory);
  }
};

let agentCatalogPromise;
let agentCatalogExpiresAt = 0;
const detectAgents = async () => {
  if (agentCatalogPromise && agentCatalogExpiresAt > monotonicMilliseconds()) return agentCatalogPromise;
  agentCatalogExpiresAt = monotonicMilliseconds() + 30_000;
  agentCatalogPromise = Promise.all(
    AGENTS.map(async (agent) => {
      const executable = await resolveAgentExecutable(agent);
      const result = executable ? await runVersionCheck(executable) : { available: false };
      return { id: agent.id, label: agent.label, command: agent.command, ...result };
    }),
  ).catch((error) => {
    agentCatalogPromise = undefined;
    agentCatalogExpiresAt = 0;
    throw error;
  });
  return agentCatalogPromise;
};

const resolvedExecutables = new Map();

const resolveAgentExecutable = async (agent) => {
  if (resolvedExecutables.has(agent.id)) return resolvedExecutables.get(agent.id);
  const configured = process.env[`ALGOGLYPH_${agent.id.toUpperCase()}_PATH`]?.trim();
  const candidates = [];
  if (configured) {
    if (!isAbsolute(configured)) throw new Error(`ALGOGLYPH_${agent.id.toUpperCase()}_PATH must be absolute.`);
    candidates.push(configured);
  }
  else if (isAbsolute(agent.command)) candidates.push(agent.command);
  else {
    const extensions = process.platform === 'win32'
      ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';')
      : [''];
    for (const directory of (process.env.PATH || '').split(delimiter).filter(Boolean)) {
      for (const extension of extensions) candidates.push(join(directory, `${agent.command}${extension}`));
    }
  }
  for (const candidate of candidates) {
    try {
      const absolute = await realpath(resolve(candidate));
      const metadata = await stat(absolute);
      if (!metadata.isFile()) continue;
      const normalized = process.platform === 'win32' ? absolute.toLowerCase() : absolute;
      const resolvedCwd = resolve(process.cwd());
      const projectRoot = `${process.platform === 'win32' ? resolvedCwd.toLowerCase() : resolvedCwd}${sep}`;
      const dependencyBin = `${sep}node_modules${sep}.bin${sep}`;
      if (!configured && (normalized.startsWith(projectRoot) || normalized.includes(dependencyBin))) continue;
      resolvedExecutables.set(agent.id, absolute);
      return absolute;
    } catch {
      // Try the next explicitly resolved candidate.
    }
  }
  return undefined;
};

const createAgentEnvironment = (agent, executable, homeDirectory) => {
  const environment = {};
  for (const name of ['SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'LANG', 'LC_ALL']) {
    if (process.env[name]) environment[name] = process.env[name];
  }
  environment.PATH = [dirname(executable), process.env.SystemRoot && join(process.env.SystemRoot, 'System32')]
    .filter(Boolean)
    .join(delimiter);
  environment.HOME = homeDirectory;
  environment.USERPROFILE = homeDirectory;
  // Runtime scratch files must live inside the request-owned root as well;
  // inheriting the user's shared TEMP/TMP would weaken cross-request cleanup.
  environment.TEMP = homeDirectory;
  environment.TMP = homeDirectory;
  environment.CODEX_HOME = join(homeDirectory, '.codex');
  environment.CLAUDE_CONFIG_DIR = join(homeDirectory, '.claude');
  for (const name of agent.authEnv || []) {
    if (process.env[name]) environment[name] = process.env[name];
  }
  return environment;
};

const isContainedPath = (candidate, root) => {
  const normalizedCandidate = process.platform === 'win32' ? candidate.toLowerCase() : candidate;
  const normalizedRoot = process.platform === 'win32' ? root.toLowerCase() : root;
  return normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(`${normalizedRoot}${sep}`);
};

const copyCredentialIfPresent = async (source, destination, expectedRoot) => {
  if (!source || !expectedRoot) return false;
  try {
    const sourceMetadata = await lstat(source);
    if (!sourceMetadata.isFile() || sourceMetadata.isSymbolicLink()) return false;
    const [resolvedSource, resolvedRoot] = await Promise.all([realpath(source), realpath(expectedRoot)]);
    if (!isContainedPath(resolvedSource, resolvedRoot)) return false;
    await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
    await copyFile(source, destination);
    await chmod(destination, 0o600);
    return true;
  } catch {
    // Environment-based or OS-keychain authentication may be used instead.
    return false;
  }
};

const provisionAgentCredentials = async (agent, environment, homeDirectory) => {
  const userProfile = process.env.USERPROFILE || process.env.HOME;
  if (agent.id === 'codex') {
    const sourceHome = process.env.CODEX_HOME || (userProfile && join(userProfile, '.codex'));
    const copiedFileCredential = await copyCredentialIfPresent(
      sourceHome && join(sourceHome, 'auth.json'),
      join(environment.CODEX_HOME, 'auth.json'),
      sourceHome,
    );
    // Prefer the isolated 0600 credential copy. If it is available, do not also
    // expose an API key to the Codex host process. Environment auth remains a
    // fallback, but the model-tool environment is independently deny-all below.
    if (copiedFileCredential) delete environment.OPENAI_API_KEY;
  } else if (agent.id === 'claude') {
    const sourceHome = userProfile && join(userProfile, '.claude');
    await copyCredentialIfPresent(
      sourceHome && join(sourceHome, '.credentials.json'),
      join(environment.CLAUDE_CONFIG_DIR, '.credentials.json'),
      sourceHome,
    );
  } else if (agent.id === 'antigravity') {
    const sourceHome = userProfile && join(userProfile, '.gemini');
    for (const filename of ['oauth_creds.json', 'google_accounts.json']) {
      await copyCredentialIfPresent(
        sourceHome && join(sourceHome, filename),
        join(homeDirectory, '.gemini', filename),
        sourceHome,
      );
    }
  }
};

const activeChildren = new Set();

const terminateProcessTree = async (child, force = false) => {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === 'win32') {
    await new Promise((resolveDone) => {
      execFile('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, () => resolveDone());
    });
    return;
  }
  try {
    process.kill(-child.pid, force ? 'SIGKILL' : 'SIGTERM');
  } catch {
    try { child.kill(force ? 'SIGKILL' : 'SIGTERM'); } catch { /* already gone */ }
  }
};

const terminateWithGrace = (child) => {
  void terminateProcessTree(child, false);
  const timer = setTimeout(() => void terminateProcessTree(child, true), 1_500);
  timer.unref();
};

const createIsolatedAgentDirectories = async (agent) => {
  const workingDirectory = await mkdtemp(join(tmpdir(), 'algoglyph-agent-'));
  trackedTempRoots.add(workingDirectory);
  return { workingDirectory, runDirectory: workingDirectory, homeDirectory: workingDirectory };
};

const normalizeMcpEndpoint = (value) => {
  if (typeof value !== 'string' || !value.trim() || Buffer.byteLength(value, 'utf8') > MAX_URL_BYTES) {
    throw new ConnectorError(400, 'An MCP server URL is required.');
  }

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new ConnectorError(400, 'Enter a valid MCP server URL.');
  }

  const normalizedHostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const isLoopback = ['127.0.0.1', '::1', 'localhost'].includes(normalizedHostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) {
    throw new ConnectorError(400, 'MCP servers must use HTTPS, except for an explicitly approved loopback server.');
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

const parseIpv4 = (address) => address.split('.').map(Number);

const isUnsafeIpAddress = (address) => {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
  if (isIP(normalized) === 4) {
    const [a, b] = parseIpv4(normalized);
    return a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 0)
      || (a === 192 && b === 168)
      || (a === 192 && b === 0)
      || (a === 192 && b === 2)
      || (a === 198 && (b === 18 || b === 19 || b === 51))
      || (a === 203 && b === 0);
  }
  if (isIP(normalized) === 6) {
    if (normalized === '::' || normalized === '::1') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8')
      || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')
      || normalized.startsWith('ff') || normalized.startsWith('2001:db8')
      || normalized.startsWith('2001:') || normalized.startsWith('64:ff9b:')
      || normalized.startsWith('100:')) return true;
    const mapped = normalized.match(/^::(?:ffff:)?(?:(\d+\.\d+\.\d+\.\d+)|([0-9a-f]{1,4}):([0-9a-f]{1,4}))$/);
    if (mapped?.[1]) return isUnsafeIpAddress(mapped[1]);
    if (mapped?.[2] && mapped?.[3]) {
      const high = Number.parseInt(mapped[2], 16);
      const low = Number.parseInt(mapped[3], 16);
      return isUnsafeIpAddress(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
    }
  }
  return isIP(normalized) === 0;
};

const isLoopbackAddress = (address) => {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
  if (normalized === '::1' || normalized.startsWith('127.')) return true;
  const mapped = normalized.match(/^::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/);
  return Boolean(mapped && mapped[1].startsWith('127.'));
};

const validateMcpDestination = async (url, allowPrivateNetwork, signal) => {
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const explicitlyLoopback = hostname === 'localhost' || isLoopbackAddress(hostname);
  let addresses;
  try {
    if (testDnsDelayMs > 0) await abortableDelay(testDnsDelayMs, signal);
    addresses = isIP(hostname)
      ? [{ address: hostname }]
      : await raceWithAbort(lookup(hostname, { all: true, verbatim: true }), signal);
  } catch (error) {
    if (error instanceof ConnectorError) throw error;
    throw new ConnectorError(502, 'The MCP server hostname could not be resolved.');
  }
  if (!addresses.length) throw new ConnectorError(502, 'The MCP server hostname did not resolve.');
  let isPrivate = false;
  for (const { address } of addresses) {
    if (!isUnsafeIpAddress(address)) continue;
    isPrivate = true;
    if (allowPrivateNetwork === true && explicitlyLoopback && isLoopbackAddress(address)) continue;
    throw new ConnectorError(403, 'Private, reserved, link-local, and metadata-network MCP destinations are blocked.');
  }
  return { addresses, isPrivate };
};

const closeDispatcher = (dispatcher) => {
  try {
    void dispatcher.close().catch(() => undefined);
  } catch {
    // The dispatcher may already be destroyed by a concurrent abort.
  }
};

const boundedResponse = (response, closeRequestDispatcher) => {
  if (!response.body) {
    closeRequestDispatcher();
    return response;
  }
  let bytes = 0;
  const limiter = new TransformStream({
    transform(chunk, controller) {
      bytes += chunk.byteLength;
      if (bytes > MAX_MCP_RESPONSE_BYTES) {
        controller.error(new ConnectorError(502, 'The MCP server response exceeded its safety limit.'));
        return;
      }
      controller.enqueue(chunk);
    },
    flush() { closeRequestDispatcher(); },
    cancel() { closeRequestDispatcher(); },
  });
  return new Response(response.body.pipeThrough(limiter), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

const createSafeMcpFetch = (endpoint, accessToken, controller, allowPrivateNetwork) => async (input, init = {}) => {
  const firstUrl = new URL(input instanceof Request ? input.url : String(input), endpoint);
  let currentUrl = firstUrl;
  let method = init.method || (input instanceof Request ? input.method : 'GET');
  let body = init.body ?? (input instanceof Request && !['GET', 'HEAD'].includes(method.toUpperCase())
    ? await input.clone().arrayBuffer()
    : undefined);
  const originalOrigin = endpoint.origin;
  let initialDestination;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    if (!['http:', 'https:'].includes(currentUrl.protocol)) {
      throw new ConnectorError(403, 'MCP redirects may only use HTTP or HTTPS.');
    }
    if (currentUrl.protocol === 'http:' && currentUrl.hostname.toLowerCase() !== 'localhost'
      && !isLoopbackAddress(currentUrl.hostname)) {
      throw new ConnectorError(403, 'Insecure non-loopback MCP destinations are blocked.');
    }
    const destination = await validateMcpDestination(currentUrl, allowPrivateNetwork, controller.signal);
    initialDestination ||= destination;
    if (destination.isPrivate && !initialDestination.isPrivate) {
      throw new ConnectorError(403, 'Public MCP endpoints may not redirect to private or loopback destinations.');
    }
    const { addresses } = destination;
    const dispatcher = new UndiciAgent({
      connect: {
        lookup(_hostname, options, callback) {
          const pinned = addresses.map(({ address, family }) => ({ address, family }));
          if (options?.all) callback(null, pinned);
          else callback(null, pinned[0].address, pinned[0].family);
        },
      },
    });
    const closeRequestDispatcher = () => {
      controller.signal.removeEventListener('abort', closeRequestDispatcher);
      closeDispatcher(dispatcher);
    };
    controller.signal.addEventListener('abort', closeRequestDispatcher, { once: true });
    if (controller.signal.aborted) {
      closeRequestDispatcher();
      throw mcpTimeoutError();
    }
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    for (const [name, value] of new Headers(init.headers)) headers.set(name, value);
    headers.delete('authorization');
    headers.delete('cookie');
    headers.delete('proxy-authorization');
    if (accessToken && currentUrl.origin === originalOrigin) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    let response;
    try {
      response = await fetch(currentUrl, {
        ...init,
        method,
        body,
        headers,
        redirect: 'manual',
        signal: controller.signal,
        dispatcher,
      });
    } catch (error) {
      closeRequestDispatcher();
      throw error;
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return boundedResponse(response, closeRequestDispatcher);
    }
    await response.body?.cancel().catch(() => undefined);
    closeRequestDispatcher();
    if (redirects === MAX_REDIRECTS) throw new ConnectorError(502, 'The MCP server redirected too many times.');
    const location = response.headers.get('location');
    if (!location) throw new ConnectorError(502, 'The MCP server returned an invalid redirect.');
    currentUrl = new URL(location, currentUrl);
    if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === 'POST')) {
      method = 'GET';
      body = undefined;
      headers.delete('content-length');
      headers.delete('content-type');
    }
  }
  throw new ConnectorError(502, 'The MCP request could not be completed.');
};

const collectMcpPages = async (requestPage, field) => {
  const items = [];
  let cursor;
  for (let page = 0; page < MAX_MCP_PAGES && items.length < MAX_MCP_ITEMS; page += 1) {
    const response = await requestPage(cursor ? { cursor } : undefined);
    const next = Array.isArray(response?.[field]) ? response[field] : [];
    items.push(...next.slice(0, MAX_MCP_ITEMS - items.length));
    cursor = typeof response?.nextCursor === 'string' ? response.nextCursor : undefined;
    if (!cursor) break;
  }
  return { items, truncated: Boolean(cursor) };
};

const withMcpDeadline = async (operation) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), mcpRequestTimeoutMs);
  try {
    return await operation(controller);
  } catch (error) {
    if (controller.signal.aborted) throw mcpTimeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
};

const connectMcpClient = async (
  transportName,
  endpoint,
  accessToken,
  allowPrivateNetwork,
  makeTransport,
  operation,
  controller,
) => {
  const safeFetch = createSafeMcpFetch(endpoint, accessToken, controller, allowPrivateNetwork);
  const client = new Client(
    { name: 'algoglyph-local-connector', version: CONNECTOR_VERSION },
    { capabilities: {} },
  );
  const transport = makeTransport(safeFetch);

  try {
    await client.connect(transport);
    return await operation(client, transportName);
  } finally {
    let closeTimer;
    await Promise.race([
      client.close().catch(() => undefined),
      new Promise((resolveDone) => {
        closeTimer = setTimeout(resolveDone, MCP_CLOSE_TIMEOUT_MS);
        closeTimer.unref();
      }),
    ]);
    clearTimeout(closeTimer);
  }
};

const summaryFromClient = async (
  transportName,
  endpoint,
  accessToken,
  allowPrivateNetwork,
  makeTransport,
  controller,
) => connectMcpClient(
  transportName,
  endpoint,
  accessToken,
  allowPrivateNetwork,
  makeTransport,
  async (client) => {
    const capabilities = client.getServerCapabilities() || {};
    const toolsPage = capabilities.tools
      ? await collectMcpPages((params) => client.listTools(params), 'tools')
      : { items: [], truncated: false };
    const resourcesPage = capabilities.resources
      ? await collectMcpPages((params) => client.listResources(params), 'resources')
      : { items: [], truncated: false };
    const promptsPage = capabilities.prompts
      ? await collectMcpPages((params) => client.listPrompts(params), 'prompts')
      : { items: [], truncated: false };
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
      tools: toolsPage.items.map((tool) => ({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
      resources: resourcesPage.items.map((resource) => ({
        uri: resource.uri,
        name: resource.name,
        title: resource.title,
        description: resource.description,
        mimeType: resource.mimeType,
      })),
      prompts: promptsPage.items.map((prompt) => ({
        name: prompt.name,
        title: prompt.title,
        description: prompt.description,
        arguments: prompt.arguments,
      })),
      truncated: toolsPage.truncated || resourcesPage.truncated || promptsPage.truncated,
    };
  },
  controller,
);

const redactError = (error, secrets) => {
  const raw = error instanceof Error ? error.message : 'Could not connect to the MCP server.';
  const sensitivePaths = [process.env.USERPROFILE, process.env.HOME, tmpdir(), ...trackedTempRoots];
  return [...secrets, ...sensitivePaths]
    .filter(Boolean)
    .reduce((message, secret) => message.replaceAll(secret, '[redacted]'), raw)
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [redacted]')
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 500);
};

const inspectMcpServer = async (body) => {
  assertAllowedKeys(body, ['endpoint', 'accessToken', 'allowPrivateNetwork']);
  if (body.allowPrivateNetwork !== undefined && typeof body.allowPrivateNetwork !== 'boolean') {
    throw new ConnectorError(400, 'allowPrivateNetwork must be a boolean.');
  }
  const endpoint = normalizeMcpEndpoint(body.endpoint);
  const accessToken = optionalToken(body.accessToken, 'MCP server token');
  const allowPrivateNetwork = body.allowPrivateNetwork === true;
  return withMcpDeadline(async (controller) => {
    await validateMcpDestination(endpoint, allowPrivateNetwork, controller.signal);
    try {
      return await summaryFromClient(
        'streamable-http',
        endpoint,
        accessToken,
        allowPrivateNetwork,
        (safeFetch) => new StreamableHTTPClientTransport(endpoint, { fetch: safeFetch }),
        controller,
      );
    } catch (streamableError) {
      try {
        return await summaryFromClient(
          'sse',
          endpoint,
          accessToken,
          allowPrivateNetwork,
          (safeFetch) => new SSEClientTransport(endpoint, { fetch: safeFetch }),
          controller,
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
  });
};

const authorizationOwner = (authorization) => authorization.kind === 'session' ? authorization.token : 'master';

let activeMcpOperations = 0;
const runBoundedMcpOperation = async (operation) => {
  if (activeMcpOperations >= MAX_CONCURRENT_MCP_OPERATIONS) {
    throw new ConnectorError(429, 'Too many MCP operations are already in progress.');
  }
  activeMcpOperations += 1;
  try {
    return await operation();
  } finally {
    activeMcpOperations = Math.max(0, activeMcpOperations - 1);
  }
};

const approveMcpServer = async (body, authorization) => {
  const summary = await runBoundedMcpOperation(() => inspectMcpServer(body));
  if (summary.tools.some((tool) => !MCP_TOOL_NAME_PATTERN.test(tool?.name || ''))) {
    throw new ConnectorError(502, 'The MCP server exposed an invalid tool name.');
  }
  const serializedSummary = JSON.stringify(summary);
  validateJsonValue(JSON.parse(serializedSummary));
  if (Buffer.byteLength(serializedSummary, 'utf8') > MAX_MCP_APPROVAL_BYTES) {
    throw new ConnectorError(502, 'The MCP server catalog exceeded the approval safety limit.');
  }
  const endpoint = normalizeMcpEndpoint(body.endpoint);
  const accessToken = optionalToken(body.accessToken, 'MCP server token');
  const allowPrivateNetwork = body.allowPrivateNetwork === true;
  const owner = authorizationOwner(authorization);
  const owned = [...approvedMcpServers.values()]
    .filter((server) => server.owner === owner)
    .sort((left, right) => left.lastUsedAtMonotonic - right.lastUsedAtMonotonic);
  const existing = owned.find((server) => (
    server.endpoint === endpoint.toString()
    && server.allowPrivateNetwork === allowPrivateNetwork
    && ((server.accessToken === undefined && accessToken === undefined)
      || constantTimeEquals(server.accessToken, accessToken))
    && JSON.stringify(server.summary) === serializedSummary
  ));
  const now = monotonicMilliseconds();
  if (existing) {
    existing.lastUsedAtMonotonic = now;
    existing.expiresAtMonotonic = now + APPROVED_MCP_TTL_MS;
    return { ...summary, serverId: existing.id };
  }
  while (owned.length >= MAX_APPROVED_MCP_SERVERS_PER_OWNER) {
    const oldest = owned.shift();
    if (oldest) deleteApprovedServer(oldest.id);
  }
  const id = `mcp_${createSecret()}`;
  approvedMcpServers.set(id, {
    id,
    owner,
    endpoint: endpoint.toString(),
    accessToken,
    allowPrivateNetwork,
    summary,
    createdAtMonotonic: now,
    lastUsedAtMonotonic: now,
    expiresAtMonotonic: now + APPROVED_MCP_TTL_MS,
  });
  return { ...summary, serverId: id };
};

const requireApprovedMcpServer = (serverId, authorization) => {
  if (typeof serverId !== 'string' || !/^mcp_[A-Za-z0-9_-]{40,64}$/.test(serverId)) {
    throw new ConnectorError(400, 'An approved MCP server is required.');
  }
  const server = approvedMcpServers.get(serverId);
  const now = monotonicMilliseconds();
  if (!server || server.expiresAtMonotonic <= now || server.owner !== authorizationOwner(authorization)) {
    if (server?.expiresAtMonotonic <= now) deleteApprovedServer(serverId);
    throw new ConnectorError(404, 'That approved MCP server is unavailable for this session.');
  }
  server.lastUsedAtMonotonic = now;
  return server;
};

const callApprovedMcpTool = async (server, toolName, args) => runBoundedMcpOperation(async () => {
  validateJsonValue(args);
  if (!isRecord(args) || Buffer.byteLength(JSON.stringify(args), 'utf8') > MAX_BODY_BYTES) {
    throw new ConnectorError(400, 'Tool arguments must be a bounded JSON object.');
  }
  if (!MCP_TOOL_NAME_PATTERN.test(toolName)
    || !server.summary.tools.some((tool) => tool.name === toolName)) {
    throw new ConnectorError(400, 'Choose a tool exposed by the approved MCP server.');
  }
  const endpoint = new URL(server.endpoint);
  let result;
  try {
    result = await withMcpDeadline(async (controller) => {
      const run = (transportName, makeTransport) => connectMcpClient(
        transportName,
        endpoint,
        server.accessToken,
        server.allowPrivateNetwork,
        makeTransport,
        (client) => client.callTool({ name: toolName, arguments: args }),
        controller,
      );
      if (server.summary.transport === 'streamable-http') {
        return run('streamable-http', (safeFetch) => new StreamableHTTPClientTransport(endpoint, { fetch: safeFetch }));
      }
      if (server.summary.transport === 'sse') {
        return run('sse', (safeFetch) => new SSEClientTransport(endpoint, { fetch: safeFetch }));
      }
      throw new ConnectorError(502, 'The approved MCP transport is unavailable.');
    });
  } catch (error) {
    if (error instanceof ConnectorError && error.status === 504) throw error;
    throw new ConnectorError(502, `MCP tool invocation failed: ${redactError(error, [server.accessToken])}`);
  }
  const serializedResult = JSON.stringify(result);
  if (!serializedResult) throw new ConnectorError(502, 'The MCP tool returned an invalid result.');
  validateJsonValue(JSON.parse(serializedResult));
  if (Buffer.byteLength(serializedResult, 'utf8') > MAX_JSON_RESPONSE_BYTES) {
    throw new ConnectorError(502, 'The MCP tool result exceeded the safety limit.');
  }
  return result;
});

const invokeApprovedMcpTool = async (body, authorization) => {
  assertAllowedKeys(body, ['serverId', 'toolName', 'arguments', 'confirmed']);
  if (body.confirmed !== true) throw new ConnectorError(400, 'Tool invocation requires explicit user confirmation.');
  const server = requireApprovedMcpServer(body.serverId, authorization);
  const toolName = typeof body.toolName === 'string' ? body.toolName.trim() : '';
  const args = body.arguments === undefined ? {} : body.arguments;
  return callApprovedMcpTool(server, toolName, args);
};

const createMcpRelay = (server) => {
  const id = `relay_${createSecret()}`;
  const token = createSecret();
  mcpRelays.set(id, {
    id,
    token,
    owner: server.owner,
    server,
    expiresAtMonotonic: server.expiresAtMonotonic,
  });
  return {
    id,
    token,
    endpoint: `http://127.0.0.1:${port}/internal/mcp/${id}`,
  };
};

const destroyMcpRelay = (relayId) => {
  if (relayId) mcpRelays.delete(relayId);
};

const handleMcpRelayRequest = async (request, response, url) => {
  if (request.method !== 'POST') throw new ConnectorError(405, 'Method not allowed.');
  const match = url.pathname.match(/^\/internal\/mcp\/(relay_[A-Za-z0-9_-]{40,64})$/);
  if (!match) throw new ConnectorError(404, 'Route not found.');
  const relay = mcpRelays.get(match[1]);
  const now = monotonicMilliseconds();
  if (!relay || relay.expiresAtMonotonic <= now || !constantTimeEquals(bearerToken(request), relay.token)) {
    if (relay?.expiresAtMonotonic <= now) mcpRelays.delete(match[1]);
    throw new ConnectorError(401, 'A valid relay credential is required.');
  }
  const approved = approvedMcpServers.get(relay.server.id);
  if (approved !== relay.server || approved.expiresAtMonotonic <= now) {
    mcpRelays.delete(match[1]);
    throw new ConnectorError(410, 'The approved MCP relay has expired.');
  }
  const body = await readJsonBody(request, { objectOnly: false });
  const protocolServer = new McpServer(
    { name: 'algoglyph-approved-mcp-relay', version: CONNECTOR_VERSION },
    { capabilities: { tools: {} } },
  );
  protocolServer.setRequestHandler('tools/list', async () => ({ tools: relay.server.summary.tools }));
  protocolServer.setRequestHandler('tools/call', async (toolRequest) => callApprovedMcpTool(
    relay.server,
    toolRequest.params.name,
    toolRequest.params.arguments || {},
  ));
  const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  try {
    applySecurityHeaders(response);
    await protocolServer.connect(transport);
    await transport.handleRequest(request, response, body);
  } finally {
    await transport.close().catch(() => undefined);
    await protocolServer.close().catch(() => undefined);
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

const agentRunSecrets = (prompt) => [prompt];

const promptForAgent = (agent, prompt, approvedServer) => {
  if (agent.id !== 'antigravity') return prompt;
  const toolPolicy = approvedServer
    ? [
      'The explicitly configured algoglyph_approved MCP tools are available for this request.',
      'Use only those MCP tools, and only when the request genuinely requires them.',
    ]
    : [
      'Do not call any tools.',
      'A tool call will be denied and will make the task fail.',
    ];
  return [
    'NON-INTERACTIVE OUTPUT-ONLY MODE:',
    ...toolPolicy,
    'Never use the command, terminal, shell, browser, file, search, edit, or workspace tools.',
    'Do not inspect the current directory or try to gather additional context.',
    'Answer directly from the request below.',
    '',
    prompt,
  ].join('\n');
};

const prepareApprovedMcpForAgent = async (agent, server, workingDirectory, environment) => {
  const relay = server ? createMcpRelay(server) : undefined;
  const relayHeaders = relay ? { Authorization: `Bearer ${relay.token}` } : undefined;
  if (relay) environment.ALGOGLYPH_APPROVED_MCP_TOKEN = relay.token;
  try {
  if (agent.id === 'antigravity') {
    const name = 'algoglyph_approved';
    // Antigravity 1.1.12 reads the shared Gemini MCP configuration path and
    // requires `serverUrl`. Keep this connector-owned file inside the isolated
    // HOME; never merge the user's global MCP servers or expose the upstream
    // server/token to the CLI.
    const configDirectory = join(environment.HOME, '.gemini', 'config');
    const configPath = join(configDirectory, 'mcp_config.json');
    await mkdir(configDirectory, { recursive: true, mode: 0o700 });
    const config = {
      mcpServers: relay
        ? { [name]: { serverUrl: relay.endpoint, headers: relayHeaders } }
        : {},
    };
    await writeFile(configPath, JSON.stringify(config), { mode: 0o600 });

    // Headless Antigravity cannot display an interactive permission prompt.
    // Auto-approve only tools on this connector-owned relay name; never grant
    // command/file/browser access or the global `mcp(*)` wildcard.
    const settingsDirectory = join(environment.HOME, '.gemini', 'antigravity-cli');
    const settingsPath = join(settingsDirectory, 'settings.json');
    await mkdir(settingsDirectory, { recursive: true, mode: 0o700 });
    let settings = {};
    try {
      const existing = JSON.parse(await readFile(settingsPath, 'utf8'));
      if (isRecord(existing)) settings = existing;
    } catch {
      // A missing or corrupt model-preference cache is safe to replace.
    }
    settings.permissions = { allow: relay ? [`mcp(${name}/*)`] : [] };
    await writeFile(settingsPath, JSON.stringify(settings), { mode: 0o600 });
    return { extraArgs: [], relayId: relay?.id };
  }
  const name = 'algoglyph_approved';

  if (agent.id === 'codex') {
    await mkdir(environment.CODEX_HOME, { recursive: true, mode: 0o700 });
    const safeChildEnvironment = Object.entries({
      PATH: environment.PATH,
      SystemRoot: environment.SystemRoot,
      WINDIR: environment.WINDIR,
      COMSPEC: environment.COMSPEC,
      PATHEXT: environment.PATHEXT,
      TEMP: environment.TEMP,
      TMP: environment.TMP,
    }).filter(([, value]) => typeof value === 'string' && value.length > 0);
    const config = [
      'default_permissions = "algoglyph_connector"',
      'approval_policy = "never"',
      'web_search = "disabled"',
      'history.persistence = "none"',
      '',
      '[permissions.algoglyph_connector]',
      'description = "AlgoGlyph output-only agent with no local filesystem access"',
      'filesystem = { ":root" = "deny" }',
      '',
      '[shell_environment_policy]',
      'inherit = "none"',
      'ignore_default_excludes = false',
      '',
      '[shell_environment_policy.set]',
      ...safeChildEnvironment.map(([key, value]) => `${key} = ${JSON.stringify(value)}`),
      ...(relay ? [
        '',
        `[mcp_servers.${name}]`,
        `url = ${JSON.stringify(relay.endpoint)}`,
        'bearer_token_env_var = "ALGOGLYPH_APPROVED_MCP_TOKEN"',
      ] : []),
      '',
    ].join('\n');
    await writeFile(join(environment.CODEX_HOME, 'config.toml'), config, { mode: 0o600 });
    return { extraArgs: [], relayId: relay?.id };
  }

  if (!relay) return { extraArgs: [], relayId: undefined };

  const configPath = join(workingDirectory, 'approved-mcp.json');
  await writeFile(configPath, JSON.stringify({
    mcpServers: { [name]: { type: 'http', url: relay.endpoint, headers: relayHeaders } },
  }), { mode: 0o600 });

  if (agent.id === 'claude') {
    const allowedTools = server.summary.tools
      .map((tool) => `mcp__${name}__${tool.name}`);
    const serializedAllowedTools = allowedTools.join(',');
    if (!allowedTools.length || Buffer.byteLength(serializedAllowedTools, 'utf8') > 8_192) {
      throw new ConnectorError(400, 'The approved MCP tool allowlist is too large for this agent.');
    }
    return {
      // `--allowedTools` is variadic, so preserve each exact qualified name as
      // one argument instead of relying on comma parsing.
      extraArgs: ['--mcp-config', configPath, '--strict-mcp-config', '--allowedTools', ...allowedTools],
      relayId: relay.id,
    };
  }
  if (agent.id === 'fixture') return { extraArgs: [], relayId: relay.id };
  throw new ConnectorError(400, 'The selected agent does not support isolated MCP configuration.');
  } catch (error) {
    destroyMcpRelay(relay?.id);
    throw error;
  }
};

let antigravitySession;
let antigravitySessionPromise;
let antigravityPtyModulesPromise;
let connectorShuttingDown = false;

const loadAntigravityPtyModules = () => {
  antigravityPtyModulesPromise ||= Promise.all([
    import('node-pty'),
    import('@xterm/headless'),
  ]).then(([ptyModule, xtermModule]) => {
    const ptyRuntime = ptyModule.default || ptyModule;
    const xtermRuntime = xtermModule.default || xtermModule;
    return {
      ptyRuntime,
      HeadlessTerminal: xtermRuntime.Terminal,
    };
  });
  return antigravityPtyModulesPromise;
};

const antigravityScreenText = (session) => {
  const buffer = session.terminal.buffer.active;
  const lines = [];
  for (let index = 0; index < buffer.length; index += 1) {
    lines.push(buffer.getLine(index)?.translateToString(true) || '');
  }
  return lines.join('\n');
};

const readAntigravityTranscript = async (homeDirectory, previousFileSnapshots = new Map()) => {
  const brainDirectory = join(homeDirectory, '.gemini', 'antigravity-cli', 'brain');
  let conversations;
  try {
    conversations = await readdir(brainDirectory, { withFileTypes: true });
  } catch {
    return { eventKeys: new Set(), fileSnapshots: new Map(), outputs: [] };
  }

  const eventKeys = new Set();
  const fileSnapshots = new Map();
  const outputs = [];
  // `readdir()` ordering is unspecified. Rank the actual transcript files by
  // modification time so reset-created conversations are selected
  // deterministically and an older directory cannot enter the bounded window
  // merely because enumeration order changed.
  const rankedConversations = (await Promise.all(conversations
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const transcriptPath = join(
        brainDirectory,
        entry.name,
        '.system_generated',
        'logs',
        'transcript.jsonl',
      );
      try {
        const metadata = await stat(transcriptPath);
        if (!metadata.isFile() || metadata.size > MAX_TRANSCRIPT_FILE_BYTES) return undefined;
        return { id: entry.name, transcriptPath, modifiedAt: metadata.mtimeMs };
      } catch {
        return undefined;
      }
    })))
    .filter(Boolean)
    .sort((left, right) => right.modifiedAt - left.modifiedAt || left.id.localeCompare(right.id))
    .slice(0, MAX_TRANSCRIPT_FILES);

  await Promise.all(rankedConversations.map(async ({ id: conversationId, transcriptPath }) => {
    let handle;
    try {
      handle = await open(transcriptPath, 'r');
      const metadata = await handle.stat();
      if (!metadata.isFile() || metadata.size > MAX_TRANSCRIPT_FILE_BYTES) return;
      const sourceBuffer = Buffer.alloc(metadata.size);
      const { bytesRead } = await handle.read(sourceBuffer, 0, metadata.size, 0);
      const previous = previousFileSnapshots.get(conversationId);
      const sameFile = previous
        && previous.device === String(metadata.dev)
        && previous.inode === String(metadata.ino)
        && bytesRead >= previous.size;
      const startOffset = sameFile ? previous.size : 0;
      fileSnapshots.set(conversationId, {
        device: String(metadata.dev),
        inode: String(metadata.ino),
        size: bytesRead,
      });
      const source = sourceBuffer.subarray(startOffset, bytesRead).toString('utf8');
      for (const line of source.split(/\r?\n/)) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          const eventKey = `${conversationId}:${event.step_index}:${event.source || ''}:${event.type || ''}:${event.created_at || ''}`;
          eventKeys.add(eventKey);
          if (event.source !== 'MODEL' || event.type !== 'PLANNER_RESPONSE'
            || event.status !== 'DONE' || typeof event.content !== 'string') continue;
          const createdAt = typeof event.created_at === 'string' ? event.created_at : '';
          const createdAtMs = Date.parse(createdAt);
          if (!Number.isFinite(createdAtMs)) continue;
          outputs.push({
            key: eventKey,
            conversationId,
            content: event.content,
            createdAt,
            createdAtMs,
          });
        } catch {
          // A partially written JSONL tail is expected while the model is active.
        }
      }
    } catch {
      return;
    } finally {
      await handle?.close().catch(() => undefined);
    }
  }));
  return {
    eventKeys,
    fileSnapshots,
    outputs: outputs.sort((left, right) => (
      left.createdAtMs - right.createdAtMs || left.key.localeCompare(right.key)
    )),
  };
};

const waitForAntigravity = (
  session,
  predicate,
  timeoutMs,
  timeoutMessage = 'The persistent Antigravity session did not become ready in time.',
) => new Promise((resolveDone, reject) => {
  const startedAt = monotonicMilliseconds();
  const poll = () => {
    if (session.exited) {
      reject(new Error('The persistent Antigravity session exited unexpectedly.'));
      return;
    }
    Promise.resolve(predicate()).then((value) => {
      if (value) {
        resolveDone(value);
        return;
      }
      if (session.exited) {
        reject(new Error('The persistent Antigravity session exited unexpectedly.'));
        return;
      }
      if (monotonicMilliseconds() - startedAt >= timeoutMs) {
        reject(new Error(timeoutMessage));
        return;
      }
      session.pollTimer = setTimeout(poll, 250);
      session.pollTimer.unref();
    }, reject);
  };
  poll();
});

const stopAntigravitySession = (session = antigravitySession) => {
  if (!session) return Promise.resolve();
  if (session.stopPromise) return session.stopPromise;

  // Store and return one shared shutdown promise. Session revocation, approval
  // expiry, owner changes, and process shutdown can all race; every caller must
  // wait for the same tree termination and credential-directory cleanup.
  session.stopPromise = (async () => {
    session.stopping = true;
    if (session.pollTimer) clearTimeout(session.pollTimer);
    try {
      if (process.platform === 'win32' && session.pty?.pid) {
        await new Promise((resolveDone) => {
          execFile('taskkill.exe', ['/PID', String(session.pty.pid), '/T', '/F'], { windowsHide: true }, () => resolveDone());
        });
      } else if (session.pty?.pid) {
        try {
          process.kill(-session.pty.pid, 'SIGTERM');
        } catch {
          try { session.pty.kill(); } catch { /* already gone */ }
        }
        await Promise.race([
          session.exitPromise,
          new Promise((resolveDone) => setTimeout(resolveDone, 1_500)),
        ]);
        // The PTY leader can exit on SIGTERM while a descendant deliberately
        // ignores it. Escalate the whole process group even after the leader's
        // exit event so no orphan retains the copied credential environment.
        try {
          process.kill(-session.pty.pid, 'SIGKILL');
        } catch {
          if (!session.exited) {
            try { session.pty.kill(); } catch { /* already gone */ }
          }
        }
        if (!session.exited) {
          await Promise.race([
            session.exitPromise,
            new Promise((resolveDone) => setTimeout(resolveDone, 500)),
          ]);
        }
      }
    } finally {
      session.exited = true;
      session.resolveExit?.();
      session.terminal?.dispose();
      destroyMcpRelay(session.relayId);
      await rm(session.rootDirectory, { recursive: true, force: true }).catch(() => undefined);
      trackedTempRoots.delete(session.rootDirectory);
      if (antigravitySession === session) {
        antigravitySession = undefined;
      }
    }
  })();

  return session.stopPromise;
};

const seedAntigravityPreferences = async (homeDirectory) => {
  const userProfile = process.env.USERPROFILE || process.env.HOME;
  if (!userProfile) return;
  const sourcePath = join(userProfile, '.gemini', 'antigravity-cli', 'settings.json');
  const destinationDirectory = join(homeDirectory, '.gemini', 'antigravity-cli');
  try {
    const source = JSON.parse(await readFile(sourcePath, 'utf8'));
    if (!isRecord(source) || typeof source.model !== 'string') return;
    await mkdir(destinationDirectory, { recursive: true, mode: 0o700 });
    await writeFile(join(destinationDirectory, 'settings.json'), JSON.stringify({ model: source.model }), { mode: 0o600 });
  } catch {
    // Antigravity will use the account default model when no preference exists.
  }
};

const startAntigravitySession = async (approvedServer, owner) => {
  if (connectorShuttingDown) throw new ConnectorError(503, 'The connector is shutting down.');
  const agent = AGENTS.find((candidate) => candidate.id === 'antigravity');
  if (!agent) throw new ConnectorError(503, 'Antigravity is unavailable.');
  const executable = testAntigravityFixture ? process.execPath : await resolveAgentExecutable(agent);
  if (!executable) throw new ConnectorError(503, 'The Antigravity executable is unavailable.');
  const { ptyRuntime, HeadlessTerminal } = await loadAntigravityPtyModules();

  const rootDirectory = await mkdtemp(join(tmpdir(), 'algoglyph-antigravity-session-'));
  trackedTempRoots.add(rootDirectory);
  const homeDirectory = join(rootDirectory, 'home');
  const runDirectory = join(rootDirectory, 'workspace');
  let environment;
  let relayId;
  try {
    await Promise.all([
      mkdir(homeDirectory, { recursive: true, mode: 0o700 }),
      mkdir(runDirectory, { recursive: true, mode: 0o700 }),
    ]);
    environment = createAgentEnvironment(agent, executable, homeDirectory);
    environment.TERM = 'xterm-256color';
    if (testAntigravityFixture) {
      for (const name of agent.authEnv || []) delete environment[name];
      const stateFile = process.env.ALGOGLYPH_TEST_ANTIGRAVITY_STATE_FILE;
      if (stateFile) environment.ALGOGLYPH_TEST_ANTIGRAVITY_STATE_FILE = stateFile;
    } else {
      await seedAntigravityPreferences(homeDirectory);
      await provisionAgentCredentials(agent, environment, homeDirectory);
    }
    ({ relayId } = await prepareApprovedMcpForAgent(agent, approvedServer, runDirectory, environment));
    if (connectorShuttingDown) {
      throw new ConnectorError(503, 'The connector is shutting down.');
    }
  } catch (error) {
    destroyMcpRelay(relayId);
    await rm(rootDirectory, { recursive: true, force: true }).catch(() => undefined);
    trackedTempRoots.delete(rootDirectory);
    throw error;
  }

  const terminal = new HeadlessTerminal({
    cols: 160,
    rows: 50,
    scrollback: 2_000,
    allowProposedApi: true,
  });
  let ptyProcess;
  try {
    // Keep built-in slash commands enabled for the connector-owned `/clear`
    // between requests. User prompts are bracketed-pasted after control-byte
    // stripping, so they cannot inject terminal commands or keystrokes.
    ptyProcess = ptyRuntime.spawn(executable, testAntigravityFixture ? [testAntigravityFixture] : ['--sandbox'], {
      cwd: runDirectory,
      env: environment,
      cols: 160,
      rows: 50,
      name: 'xterm-256color',
      useConpty: process.platform === 'win32',
    });
  } catch (error) {
    terminal.dispose();
    destroyMcpRelay(relayId);
    await rm(rootDirectory, { recursive: true, force: true });
    trackedTempRoots.delete(rootDirectory);
    throw error;
  }

  let resolveExit;
  const exitPromise = new Promise((resolveDone) => {
    resolveExit = resolveDone;
  });
  const session = {
    key: `${owner || 'prewarm'}:${approvedServer?.id || 'none'}`,
    owner,
    approvedServerId: approvedServer?.id,
    relayId,
    rootDirectory,
    homeDirectory,
    runDirectory,
    terminal,
    pty: ptyProcess,
    exited: false,
    stopping: false,
    stopPromise: undefined,
    exitPromise,
    resolveExit,
    rawOutput: '',
    colorHandled: false,
    termsHandled: false,
    trustHandled: false,
    used: false,
  };
  antigravitySession = session;

  ptyProcess.onData((chunk) => {
    terminal.write(chunk);
    session.rawOutput = `${session.rawOutput}${chunk}`.slice(-256 * 1024);
    if (!session.colorHandled && session.rawOutput.includes('Choose your color scheme')) {
      session.colorHandled = true;
      setTimeout(() => ptyProcess.write('\t\r'), 400).unref();
    }
    if (!session.termsHandled && session.rawOutput.includes('Terms of Service & Data Use')) {
      session.termsHandled = true;
      // Opt this isolated connector session out of interaction-data collection,
      // then choose Done. This does not change the user's normal CLI settings.
      setTimeout(() => ptyProcess.write('\r\t\t\r'), 500).unref();
    }
    if (!session.trustHandled && session.rawOutput.includes('Do you trust the contents of this project?')) {
      session.trustHandled = true;
      // The connector created this empty directory and is its sole owner.
      setTimeout(() => ptyProcess.write('\r'), 400).unref();
    }
  });
  ptyProcess.onExit(() => {
    session.exited = true;
    session.resolveExit?.();
    if (antigravitySession === session) {
      antigravitySession = undefined;
    }
  });

  try {
    await waitForAntigravity(session, () => {
      const screen = antigravityScreenText(session);
      return screen.includes('? for shortcuts');
    }, antigravitySessionReadyTimeoutMs);
    return session;
  } catch (error) {
    await stopAntigravitySession(session);
    throw error;
  }
};

const getAntigravitySession = async (approvedServer, owner) => {
  if (connectorShuttingDown) throw new ConnectorError(503, 'The connector is shutting down.');
  // A request must never adopt or mutate a prewarm session until startup has
  // actually reached readiness. If startup fails, wait for its cleanup and let
  // the request create a fresh session instead of reusing a rejected promise.
  while (antigravitySessionPromise) {
    const pendingStartup = antigravitySessionPromise;
    await pendingStartup.catch(() => undefined);
    if (connectorShuttingDown) throw new ConnectorError(503, 'The connector is shutting down.');
  }
  const key = `${owner || 'prewarm'}:${approvedServer?.id || 'none'}`;
  if (owner && !approvedServer && antigravitySession && !antigravitySession.used
    && antigravitySession.key === 'prewarm:none') {
    antigravitySession.owner = owner;
    antigravitySession.key = key;
  }
  if (antigravitySession && antigravitySession.key !== key) {
    await stopAntigravitySession(antigravitySession);
  }
  if (antigravitySession && !antigravitySession.exited && antigravitySession.key === key) {
    return antigravitySession;
  }
  const startupPromise = startAntigravitySession(approvedServer, owner);
  antigravitySessionPromise = startupPromise;
  try {
    return await startupPromise;
  } finally {
    if (antigravitySessionPromise === startupPromise) antigravitySessionPromise = undefined;
  }
};

const runPersistentAntigravityPrompt = async (session, prompt, isCancelled) => {
  if (session.used) {
    session.rawOutput = '';
    session.terminal.reset();
    session.pty.write('/clear\r');
    await waitForAntigravity(session, () => (
      session.rawOutput.length > 0 && antigravityScreenText(session).includes('? for shortcuts')
    ), antigravityResetTimeoutMs, 'The persistent Antigravity session did not reset in time.');
  }
  session.used = true;
  const previousTranscript = await readAntigravityTranscript(session.homeDirectory);
  const terminalSafePrompt = prompt
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  // Antigravity timestamps transcript events. Combine that monotonic request
  // boundary with the prior event-key snapshot so an output from an older
  // conversation can never satisfy this request, even if conversation folders
  // rotate while polling. Floor to the current second because some CLI builds
  // serialize event timestamps without milliseconds.
  const submittedAtMs = Math.floor(Date.now() / 1_000) * 1_000;
  const submit = () => {
    session.rawOutput = '';
    session.pty.write(`\x1b[200~${terminalSafePrompt}\x1b[201~\r`);
  };
  let eligibilityRejected = false;
  let eligibilityRetryAt = 0;
  let eligibilityRetryUsed = false;
  submit();

  return waitForAntigravity(session, async () => {
    if (isCancelled()) throw new Error('The agent run was cancelled.');
    const transcript = await readAntigravityTranscript(
      session.homeDirectory,
      previousTranscript.fileSnapshots,
    );
    const output = transcript.outputs.find((candidate) => (
      candidate.createdAtMs >= submittedAtMs && !previousTranscript.eventKeys.has(candidate.key)
    ));
    if (output) return output.content;
    const accepted = [...transcript.eventKeys].some((key) => !previousTranscript.eventKeys.has(key));
    if (!accepted && session.rawOutput.includes('Verifying your account')
      && session.rawOutput.includes('Please try again shortly')) {
      eligibilityRejected = true;
      eligibilityRetryAt ||= monotonicMilliseconds() + antigravityEligibilityRetryDelayMs;
    }
    // Antigravity 1.1.12 can expose its idle footer before provider account
    // eligibility is ready, then explicitly reject the first prompt without
    // creating any transcript event. Retry exactly once only after observing
    // that specific rejection and a return to idle. Any transcript activity
    // proves acceptance and permanently disables retry, preventing duplicate
    // model/MCP side effects.
    if (!accepted && eligibilityRejected && !eligibilityRetryUsed
      && monotonicMilliseconds() >= eligibilityRetryAt
      && antigravityScreenText(session).includes('? for shortcuts')) {
      eligibilityRetryUsed = true;
      eligibilityRejected = false;
      submit();
    }
    return undefined;
  }, AGENT_RUN_TIMEOUT_MS, 'The persistent Antigravity session did not produce a response in time.');
};

let activeAgentRuns = 0;

const streamPersistentAntigravityRun = async (request, response, prompt, approvedServer, secrets, authorization, releaseSlot) => {
  let session;
  try {
    session = await getAntigravitySession(approvedServer, authorizationOwner(authorization));
  } catch (error) {
    releaseSlot();
    throw new ConnectorError(503, redactError(error, secrets));
  }

  try {
    applySecurityHeaders(response);
    response.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
  } catch (error) {
    await stopAntigravitySession(session);
    releaseSlot();
    throw error;
  }

  let cancelled = false;
  let settled = false;
  const send = (event, data) => {
    if (response.writableEnded || response.destroyed) return;
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  const onClientGone = () => {
    if (settled || cancelled) return;
    cancelled = true;
    try { session.pty.write('\x03'); } catch { /* session already exited */ }
  };
  request.on('close', onClientGone);
  response.on('close', onClientGone);

  try {
    const executionPrompt = promptForAgent(
      AGENTS.find((candidate) => candidate.id === 'antigravity'),
      prompt,
      approvedServer,
    );
    const output = await runPersistentAntigravityPrompt(session, executionPrompt, () => cancelled);
    if (cancelled) {
      send('error', { message: 'The agent run was cancelled.' });
      send('exit', { code: 1 });
    } else if (Buffer.byteLength(output, 'utf8') > MAX_AGENT_OUTPUT_BYTES) {
      send('error', { message: 'The agent run exceeded the output safety limit.' });
      send('exit', { code: 1 });
    } else {
      send('output', { stream: 'stdout', chunk: output });
      send('exit', { code: 0 });
    }
  } catch (error) {
    const message = cancelled
      ? 'The agent run was cancelled.'
      : redactError(error, secrets);
    if (!session.exited) {
      try { session.pty.write('\x03'); } catch { /* session already exited */ }
    }
    send('error', { message });
    send('exit', { code: 1 });
    if (cancelled || !session.exited) await stopAntigravitySession(session);
  } finally {
    settled = true;
    releaseSlot();
    response.end();
  }
};

// Spawns an allowlisted agent for a single headless prompt and streams its output
// back as Server-Sent Events. All validation that can reject the request happens
// *before* the 200/SSE headers are written, so the outer handler can still emit a
// normal JSON error. Once streaming begins, failures are surfaced as `error`
// events. The run is bounded by an elapsed-time deadline, a max-output cap, and is
// killed if the client disconnects.
const streamAgentRun = async (request, response, body, authorization) => {
  assertAllowedKeys(body, ['agentId', 'prompt', 'outputMode', 'mcpServerId', 'traceId']);
  if (body.outputMode !== undefined && !['stream', 'buffered'].includes(body.outputMode)) {
    throw new ConnectorError(400, 'outputMode must be stream or buffered.');
  }
  if (body.traceId !== undefined && (typeof body.traceId !== 'string' || body.traceId.length > 96)) {
    throw new ConnectorError(400, 'traceId is invalid.');
  }
  const requestStartedAt = monotonicMilliseconds();
  const traceId = DEV_TIMING_ENABLED && typeof body.traceId === 'string'
    ? body.traceId.trim().slice(0, 96)
    : undefined;
  const agent = findAgent(body.agentId);
  if (!agent) {
    throw new ConnectorError(404, 'Unknown agent.');
  }
  const prompt = validatePrompt(body.prompt);
  const secrets = agentRunSecrets(prompt);
  const bufferedOutput = body.outputMode === 'buffered';
  const approvedServer = body.mcpServerId
    ? requireApprovedMcpServer(body.mcpServerId, authorization)
    : undefined;
  if (activeAgentRuns >= MAX_CONCURRENT_AGENT_RUNS) {
    throw new ConnectorError(429, 'An agent run is already in progress. Try again once it finishes.');
  }
  activeAgentRuns += 1;
  let slotReleased = false;
  const releaseSlot = () => {
    if (slotReleased) return;
    slotReleased = true;
    activeAgentRuns = Math.max(0, activeAgentRuns - 1);
  };

  if (agent.id === 'antigravity' && (process.env.NODE_ENV !== 'test' || testAntigravityFixture)) {
    await streamPersistentAntigravityRun(
      request,
      response,
      prompt,
      approvedServer,
      secrets,
      authorization,
      releaseSlot,
    );
    return;
  }

  const executableStartedAt = monotonicMilliseconds();
  let executable;
  try {
    executable = await resolveAgentExecutable(agent);
  } catch (error) {
    releaseSlot();
    throw error;
  }
  const executableResolvedAt = monotonicMilliseconds();
  if (!executable) {
    releaseSlot();
    throw new ConnectorError(503, 'The selected agent executable is unavailable.');
  }
  let directories;
  try {
    directories = await createIsolatedAgentDirectories(agent);
  } catch (error) {
    releaseSlot();
    throw error;
  }
  const { workingDirectory, runDirectory, homeDirectory } = directories;
  const environment = createAgentEnvironment(agent, executable, homeDirectory);
  const credentialsStartedAt = monotonicMilliseconds();
  let credentialsFinishedAt = credentialsStartedAt;
  let mcpConfigStartedAt = credentialsStartedAt;
  let mcpConfigFinishedAt = credentialsStartedAt;
  let extraArgs;
  let relayId;
  try {
    // Provision only the credentials required by this isolated one-shot run.
    await provisionAgentCredentials(agent, environment, homeDirectory);
    credentialsFinishedAt = monotonicMilliseconds();
    mcpConfigStartedAt = monotonicMilliseconds();
    ({ extraArgs, relayId } = await prepareApprovedMcpForAgent(agent, approvedServer, workingDirectory, environment));
    mcpConfigFinishedAt = monotonicMilliseconds();
  } catch (error) {
    await rm(workingDirectory, { recursive: true, force: true });
    trackedTempRoots.delete(workingDirectory);
    destroyMcpRelay(relayId);
    releaseSlot();
    throw error;
  }
  let fixedArgs = [...agent.runArgs, ...extraArgs];
  const agentTimingLog = DEV_TIMING_ENABLED && agent.id === 'antigravity'
    ? join(workingDirectory, 'antigravity-timing.log')
    : undefined;
  if (agentTimingLog) {
    const printIndex = fixedArgs.lastIndexOf('-p');
    const insertionIndex = printIndex >= 0 ? printIndex : fixedArgs.length;
    fixedArgs = [
      ...fixedArgs.slice(0, insertionIndex),
      '--log-file',
      agentTimingLog,
      ...fixedArgs.slice(insertionIndex),
    ];
  }
  const executionPrompt = promptForAgent(agent, prompt, approvedServer);
  const args = agent.promptVia === 'arg' ? [...fixedArgs, executionPrompt] : fixedArgs;

  // Visible transparency: which CLI is being run (never the prompt itself).
  console.error(`[${SERVICE_NAME}] agent run: ${agent.label} — ${agent.command} ${agent.runArgs.join(' ')}`);

  let child;
  const spawnStartedAt = monotonicMilliseconds();
  try {
    child = spawn(executable, args, {
      cwd: runDirectory,
      env: environment,
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      detached: process.platform !== 'win32',
    });
  } catch (error) {
    await rm(workingDirectory, { recursive: true, force: true });
    trackedTempRoots.delete(workingDirectory);
    destroyMcpRelay(relayId);
    releaseSlot();
    throw new ConnectorError(500, redactError(error, secrets));
  }
  const spawnReturnedAt = monotonicMilliseconds();

  const activeChild = { child, owner: authorizationOwner(authorization), workingDirectory, relayId };
  activeChildren.add(activeChild);

  try {
    applySecurityHeaders(response);
    response.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
  } catch (error) {
    activeChildren.delete(activeChild);
    terminateWithGrace(child);
    destroyMcpRelay(relayId);
    await rm(workingDirectory, { recursive: true, force: true });
    trackedTempRoots.delete(workingDirectory);
    releaseSlot();
    throw error;
  }

  let settled = false;
  let timedOut = false;
  let truncated = false;
  let cancelled = false;
  let outputBytes = 0;
  let firstStdoutAt;
  let firstStderrAt;
  const outputChunks = { stdout: [], stderr: [] };

  const send = (event, data) => {
    if (response.writableEnded) return;
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const timer = setTimeout(() => {
    timedOut = true;
    terminateWithGrace(child);
  }, AGENT_RUN_TIMEOUT_MS);

  const cleanup = () => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    releaseSlot();
    activeChildren.delete(activeChild);
    destroyMcpRelay(relayId);
    void rm(workingDirectory, { recursive: true, force: true })
      .finally(() => trackedTempRoots.delete(workingDirectory));
  };

  const relay = (streamName) => (chunk) => {
    if (settled || truncated) return;
    const receivedAt = monotonicMilliseconds();
    if (streamName === 'stdout' && firstStdoutAt === undefined) firstStdoutAt = receivedAt;
    if (streamName === 'stderr' && firstStderrAt === undefined) firstStderrAt = receivedAt;
    const remaining = MAX_AGENT_OUTPUT_BYTES - outputBytes;
    const slice = chunk.length > remaining ? chunk.subarray(0, remaining) : chunk;
    if (slice.length > 0) {
      outputBytes += slice.length;
      const text = slice.toString('utf8');
      if (bufferedOutput) outputChunks[streamName].push(text);
      else send('output', { stream: streamName, chunk: text });
    }
    if (outputBytes >= MAX_AGENT_OUTPUT_BYTES) {
      truncated = true;
      const message = '\n[output truncated: limit reached]\n';
      if (bufferedOutput) outputChunks.stderr.push(message);
      else send('output', { stream: 'stderr', chunk: message });
      terminateWithGrace(child);
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

  child.on('close', async (code) => {
    if (settled) return;
    const childClosedAt = monotonicMilliseconds();
    if (bufferedOutput) {
      for (const streamName of ['stdout', 'stderr']) {
        const chunk = outputChunks[streamName].join('');
        if (chunk) send('output', { stream: streamName, chunk });
      }
    }
    if (timedOut) {
      send('error', { message: `The agent run timed out after ${AGENT_RUN_TIMEOUT_MS / 1000}s.` });
    } else if (truncated) {
      send('error', { message: 'The agent run exceeded the output safety limit.' });
    } else if (cancelled) {
      send('error', { message: 'The agent run was cancelled.' });
    } else if (code !== 0) {
      send('error', { message: `The agent exited unsuccessfully (code ${code ?? 'unknown'}).` });
    }
    if (DEV_TIMING_ENABLED) {
      let internalStages = {};
      if (agentTimingLog) {
        try {
          internalStages = parseAntigravityTimingLog(await readFile(agentTimingLog, 'utf8'), approvedServer);
        } catch {
          // A missing diagnostic log must never affect the agent result.
        }
      } else if (!approvedServer) {
        internalStages.mcp_initialization_ms = 0;
      }
      send('timing', {
        traceId,
        stages: {
          connector_request_to_spawn_ms: roundedMilliseconds(spawnStartedAt - requestStartedAt),
          executable_resolution_ms: roundedMilliseconds(executableResolvedAt - executableStartedAt),
          credential_provisioning_ms: roundedMilliseconds(credentialsFinishedAt - credentialsStartedAt),
          mcp_config_write_ms: roundedMilliseconds(mcpConfigFinishedAt - mcpConfigStartedAt),
          cli_spawn_ms: roundedMilliseconds(spawnReturnedAt - spawnStartedAt),
          cli_spawn_to_first_stdout_ms: firstStdoutAt === undefined
            ? roundedMilliseconds(childClosedAt - spawnReturnedAt)
            : roundedMilliseconds(firstStdoutAt - spawnReturnedAt),
          cli_process_total_ms: roundedMilliseconds(childClosedAt - spawnReturnedAt),
          ...(firstStderrAt === undefined
            ? {}
            : { cli_spawn_to_first_stderr_ms: roundedMilliseconds(firstStderrAt - spawnReturnedAt) }),
          ...Object.fromEntries(Object.entries(internalStages).map(([name, value]) => [name, roundedMilliseconds(value)])),
        },
      });
    }
    send('exit', { code });
    cleanup();
    response.end();
  });

  // Client navigated away / pressed Stop → the fetch is aborted, the socket
  // closes, and we terminate the child. The `close` handler above then cleans up.
  const onClientGone = () => {
    if (settled) return;
    cancelled = true;
    terminateWithGrace(child);
  };
  request.on('close', onClientGone);
  response.on('close', onClientGone);

  if (agent.promptVia === 'arg') {
    child.stdin.end();
  } else {
    // Ignore EPIPE if the agent exits before consuming stdin.
    child.stdin.on('error', () => undefined);
    child.stdin.end(executionPrompt);
  }
};

const handleRequest = async (request, response) => {
  ensureLoopbackHost(request);
  const url = new URL(request.url || '/', 'http://127.0.0.1');
  if (url.search || url.hash) throw new ConnectorError(400, 'Query strings and fragments are not accepted.');

  if (url.pathname.startsWith('/internal/mcp/')) {
    await handleMcpRelayRequest(request, response, url);
    return;
  }

  ensureAllowedOrigin(request, response);
  if (request.method === 'OPTIONS') {
    applySecurityHeaders(response);
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === 'GET' && (url.pathname === '/health' || url.pathname === '/v1/health')) {
    writeJson(response, 200, {
      service: SERVICE_NAME,
      status: 'ready',
      version: CONNECTOR_VERSION,
      protocolVersion: CONNECTOR_PROTOCOL_VERSION,
      requiresToken: true,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/pairings') {
    const origin = requireTrustedBrowserOrigin(request);
    consumeRateLimit(pairingIssueAttempts, requestRateKey(request), pairingIssueRateLimit, 'pairing requests');
    const body = await readJsonBody(request);
    assertAllowedKeys(body, ['scopes']);
    prunePairings();
    const pairing = createPairingCredential(requestedScopes(body), origin);
    writeJson(response, 200, {
      pairingToken: pairing.token,
      expiresAt: new Date(pairing.expiresAt).toISOString(),
      ttlSeconds: Math.floor(PAIRING_TTL_MS / 1000),
      scopes: pairing.scopes,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/session') {
    const origin = requireTrustedBrowserOrigin(request);
    consumeRateLimit(pairingRedeemAttempts, requestRateKey(request), pairingRedeemRateLimit, 'pairing requests');
    const body = await readJsonBody(request);
    assertAllowedKeys(body, ['pairingToken']);
    const { session, sessionToken } = redeemPairingCredential(body, origin);
    writeJson(response, 200, {
      sessionToken,
      tokenType: 'Bearer',
      expiresAt: new Date(session.expiresAt).toISOString(),
      idleTimeoutSeconds: Math.floor(sessionIdleTtlMs / 1000),
      scopes: [...session.scopes],
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/session/revoke') {
    requireAuthorization(request, 'session:revoke');
    const body = await readJsonBody(request);
    assertAllowedKeys(body, []);
    await revokeSession(request);
    writeJson(response, 200, { revoked: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog') {
    const authorization = requireAuthorization(request, 'catalog:read');
    consumeRateLimit(catalogAttempts, authorizationOwner(authorization), CATALOG_RATE_LIMIT, 'catalog requests');
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
    const authorization = requireAuthorization(request, 'mcp:test');
    consumeRateLimit(mcpTestAttempts, authorizationOwner(authorization), MCP_TEST_RATE_LIMIT, 'MCP test requests');
    const body = await readJsonBody(request);
    writeJson(response, 200, await approveMcpServer(body, authorization));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/mcp/invoke') {
    const authorization = requireAuthorization(request, 'mcp:invoke');
    consumeRateLimit(mcpInvokeAttempts, authorizationOwner(authorization), MCP_INVOKE_RATE_LIMIT, 'MCP invocation requests');
    const body = await readJsonBody(request);
    writeJson(response, 200, await invokeApprovedMcpTool(body, authorization));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/agents/run') {
    const authorization = requireAuthorization(request, 'agent:run');
    consumeRateLimit(agentRunAttempts, authorizationOwner(authorization), AGENT_RUN_RATE_LIMIT, 'agent requests');
    const body = await readJsonBody(request);
    await streamAgentRun(request, response, body, authorization);
    return;
  }

  const knownPaths = new Set([
    '/health', '/v1/health', '/v1/pairings', '/v1/session', '/v1/session/revoke',
    '/v1/catalog', '/v1/mcp/test', '/v1/mcp/invoke', '/v1/agents/run',
  ]);
  if (knownPaths.has(url.pathname)) throw new ConnectorError(405, 'Method not allowed.');
  throw new ConnectorError(404, 'Route not found.');
};

const server = createServer((request, response) => {
  void handleRequest(request, response).catch((error) => {
    const status = error instanceof ConnectorError ? error.status : 500;
    const message = error instanceof ConnectorError ? error.message : 'Connector request failed.';
    if (error instanceof ConnectorError && error.retryAfterSeconds) {
      response.setHeader('Retry-After', String(error.retryAfterSeconds));
    }
    writeJson(response, status, responseError(status, message));
  });
});

server.headersTimeout = 10_000;
server.requestTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 64;
server.maxRequestsPerSocket = 100;

server.on('error', (error) => {
  console.error(`[${SERVICE_NAME}] ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  console.error(`[${SERVICE_NAME}] Listening on http://127.0.0.1:${port}`);
  if (configuredToken) {
    console.error(`[${SERVICE_NAME}] Advanced token override loaded from ALGOGLYPH_CONNECTOR_TOKEN.`);
  }
  console.error(`[${SERVICE_NAME}] AlgoGlyph will pair automatically while this command is running.`);
  // Keep the actual Antigravity language-server process resident. Subsequent
  // drawings are queued through this session instead of spawning a cold CLI.
  if (process.env.NODE_ENV !== 'test' || process.env.ALGOGLYPH_TEST_PREWARM_ANTIGRAVITY === '1') {
    void getAntigravitySession(undefined, undefined).catch(() => undefined);
  }
});

const shutDown = async () => {
  connectorShuttingDown = true;
  clearInterval(authSweepTimer);
  await Promise.allSettled([...activeChildren].map((entry) => terminateProcessTree(entry.child, true)));
  await stopAntigravitySession();
  await Promise.allSettled([...trackedTempRoots].map(async (root) => {
    await rm(root, { recursive: true, force: true });
    trackedTempRoots.delete(root);
  }));
  mcpRelays.clear();
  approvedMcpServers.clear();
  sessions.clear();
  pairingCredentials.clear();
  server.close(() => process.exit(0));
};
process.once('SIGINT', () => void shutDown());
process.once('SIGTERM', () => void shutDown());
