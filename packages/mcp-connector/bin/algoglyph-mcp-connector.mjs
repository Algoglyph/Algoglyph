import { execFile, spawn } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { access, copyFile, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { isIP } from 'node:net';
import { tmpdir } from 'node:os';
import { delimiter, dirname, isAbsolute, join, resolve } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Agent as UndiciAgent } from 'undici';

const SERVICE_NAME = 'algoglyph-local-connector';
const CONNECTOR_VERSION = '0.1.0';
const DEFAULT_PORT = 4319;
const MAX_BODY_BYTES = 64 * 1024;
const MAX_JSON_RESPONSE_BYTES = 1024 * 1024;
const MAX_MCP_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_MCP_ITEMS = 200;
const MAX_MCP_PAGES = 8;
const MAX_REDIRECTS = 3;
const PAIRING_TTL_MS = 90_000;
const MCP_REQUEST_TIMEOUT_MS = 10_000;
const AGENT_RUN_TIMEOUT_MS = 120_000;
const ANTIGRAVITY_SESSION_READY_TIMEOUT_MS = 90_000;
const MAX_AGENT_OUTPUT_BYTES = 256 * 1024;
const MAX_PROMPT_BYTES = 32 * 1024;
const MAX_CONCURRENT_AGENT_RUNS = 1;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_IDLE_TTL_MS = 30 * 60 * 1000;
const MAX_SESSIONS = 8;
const PAIRING_ISSUE_RATE_LIMIT = 5;
const PAIRING_REDEEM_RATE_LIMIT = 20;
const AUTH_RATE_WINDOW_MS = 60_000;
const DEV_TIMING_ENABLED = process.env.ALGOGLYPH_DEV_TIMING === '1';
const SESSION_SCOPES = Object.freeze(['catalog:read', 'mcp:test', 'mcp:invoke', 'agent:run', 'session:revoke']);
const PRODUCTION_ORIGINS = ['https://algoglyph.com', 'https://www.algoglyph.com', 'app://algoglyph'];
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
    runArgs: ['exec', '--ephemeral', '--sandbox', 'read-only', '--skip-git-repo-check', '--'],
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
    runArgs: ['-p', '--tools', '', '--no-session-persistence'],
    promptVia: 'stdin',
    authEnv: ['ANTHROPIC_API_KEY'],
  },
];

const testAgentFixture = process.env.NODE_ENV === 'test'
  ? process.env.ALGOGLYPH_TEST_AGENT_FIXTURE?.trim()
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

const port = parsePort(process.env.ALGOGLYPH_CONNECTOR_PORT);
const allowedOrigins = parseAllowedOrigins();
const configuredToken = process.env.ALGOGLYPH_CONNECTOR_TOKEN?.trim();
const connectorToken = configuredToken || randomBytes(24).toString('base64url');

const pairingCredentials = new Map();
const sessions = new Map();
const approvedMcpServers = new Map();
const pairingIssueAttempts = new Map();
const pairingRedeemAttempts = new Map();

const createSecret = () => randomBytes(32).toString('base64url');

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

const createPairingCredential = (scopes = SESSION_SCOPES) => {
  const token = createSecret();
  const expiresAt = Date.now() + PAIRING_TTL_MS;
  pairingCredentials.set(token, { expiresAt, scopes: [...scopes], used: false });
  return { token, expiresAt, scopes: [...scopes] };
};

const prunePairings = () => {
  const now = Date.now();
  for (const [token, pairing] of pairingCredentials) {
    if (pairing.used || pairing.expiresAt <= now) pairingCredentials.delete(token);
  }
};

const pruneSessions = () => {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now || session.lastUsedAt + sessionIdleTtlMs <= now) sessions.delete(token);
  }
};

const pruneRateLimits = (attempts) => {
  const cutoff = Date.now() - authRateWindowMs;
  for (const [key, timestamps] of attempts) {
    const active = timestamps.filter((timestamp) => timestamp > cutoff);
    if (active.length) attempts.set(key, active);
    else attempts.delete(key);
  }
};

const consumeRateLimit = (attempts, key, maximum) => {
  pruneRateLimits(attempts);
  const timestamps = attempts.get(key) || [];
  if (timestamps.length >= maximum) {
    const retryAfterMs = Math.max(1, timestamps[0] + authRateWindowMs - Date.now());
    throw new ConnectorError(429, 'Too many pairing requests. Try again later.', Math.ceil(retryAfterMs / 1000));
  }
  timestamps.push(Date.now());
  attempts.set(key, timestamps);
};

const requestRateKey = (request) => request.socket.remoteAddress || 'unknown';

const pruneAuthState = () => {
  prunePairings();
  pruneSessions();
  pruneRateLimits(pairingIssueAttempts);
  pruneRateLimits(pairingRedeemAttempts);
};

const authSweepTimer = setInterval(
  pruneAuthState,
  Math.max(25, Math.min(60_000, sessionIdleTtlMs, sessionTtlMs, authRateWindowMs)),
);
authSweepTimer.unref();
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const monotonicMilliseconds = () => Number(process.hrtime.bigint()) / 1_000_000;
const roundedMilliseconds = (value) => Math.round(value * 1000) / 1000;

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

const isMasterToken = (token) => {
  if (!token) return false;
  const supplied = Buffer.from(token);
  const expected = Buffer.from(connectorToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};

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

  session.lastUsedAt = Date.now();
  return { kind: 'session', session, token };
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
  pruneSessions();
  if (sessions.size >= maxSessions) {
    const oldest = [...sessions.entries()].sort((left, right) => left[1].lastUsedAt - right[1].lastUsedAt)[0];
    if (oldest) sessions.delete(oldest[0]);
  }

  const now = Date.now();
  const sessionToken = createSecret();
  const session = {
    createdAt: now,
    expiresAt: now + sessionTtlMs,
    lastUsedAt: now,
    scopes: new Set(pairing.scopes),
  };
  sessions.set(sessionToken, session);
  return { session, sessionToken };
};

const revokeSession = (request) => {
  const token = bearerToken(request);
  if (!token) return false;
  for (const [id, server] of approvedMcpServers) {
    if (server.owner === token) approvedMcpServers.delete(id);
  }
  return sessions.delete(token);
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
      const executable = await resolveAgentExecutable(agent);
      const result = executable ? await runVersionCheck(executable) : { available: false };
      // Only public fields leave the connector — `runArgs`/`promptVia` stay local.
      return { id: agent.id, label: agent.label, command: agent.command, ...result };
    }),
  );

const resolvedExecutables = new Map();

const resolveAgentExecutable = async (agent) => {
  if (resolvedExecutables.has(agent.id)) return resolvedExecutables.get(agent.id);
  const configured = process.env[`ALGOGLYPH_${agent.id.toUpperCase()}_PATH`]?.trim();
  const candidates = [];
  if (configured) candidates.push(configured);
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
      await access(absolute);
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
  for (const name of ['SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'LANG', 'LC_ALL']) {
    if (process.env[name]) environment[name] = process.env[name];
  }
  environment.PATH = [dirname(executable), process.env.SystemRoot && join(process.env.SystemRoot, 'System32')]
    .filter(Boolean)
    .join(delimiter);
  environment.HOME = homeDirectory;
  environment.USERPROFILE = homeDirectory;
  environment.CODEX_HOME = join(homeDirectory, '.codex');
  environment.CLAUDE_CONFIG_DIR = join(homeDirectory, '.claude');
  for (const name of agent.authEnv || []) {
    if (process.env[name]) environment[name] = process.env[name];
  }
  return environment;
};

const copyCredentialIfPresent = async (source, destination) => {
  if (!source) return;
  try {
    await access(source);
    await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
    await copyFile(source, destination);
  } catch {
    // Environment-based or OS-keychain authentication may be used instead.
  }
};

const provisionAgentCredentials = async (agent, environment, homeDirectory) => {
  const userProfile = process.env.USERPROFILE || process.env.HOME;
  if (agent.id === 'codex') {
    const sourceHome = process.env.CODEX_HOME || (userProfile && join(userProfile, '.codex'));
    await copyCredentialIfPresent(sourceHome && join(sourceHome, 'auth.json'), join(environment.CODEX_HOME, 'auth.json'));
  } else if (agent.id === 'claude') {
    await copyCredentialIfPresent(
      userProfile && join(userProfile, '.claude', '.credentials.json'),
      join(environment.CLAUDE_CONFIG_DIR, '.credentials.json'),
    );
  } else if (agent.id === 'antigravity') {
    for (const filename of ['oauth_creds.json', 'google_accounts.json']) {
      await copyCredentialIfPresent(
        userProfile && join(userProfile, '.gemini', filename),
        join(homeDirectory, '.gemini', filename),
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
  return { workingDirectory, runDirectory: workingDirectory, homeDirectory: workingDirectory };
};

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

  const isLoopback = ['127.0.0.1', '::1', 'localhost'].includes(url.hostname.toLowerCase());
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
  const normalized = address.toLowerCase().split('%')[0];
  if (isIP(normalized) === 4) {
    const [a, b] = parseIpv4(normalized);
    return a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 0)
      || (a === 192 && b === 168)
      || (a === 198 && (b === 18 || b === 19));
  }
  if (isIP(normalized) === 6) {
    if (normalized === '::' || normalized === '::1') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8')
      || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')
      || normalized.startsWith('ff')) return true;
    if (normalized.startsWith('::ffff:')) return isUnsafeIpAddress(normalized.slice(7));
  }
  return false;
};

const isLoopbackAddress = (address) => {
  const normalized = address.toLowerCase().split('%')[0];
  return normalized === '::1' || normalized.startsWith('127.');
};

const validateMcpDestination = async (url, allowPrivateNetwork) => {
  const hostname = url.hostname.toLowerCase();
  let addresses;
  try {
    addresses = isIP(hostname)
      ? [{ address: hostname }]
      : await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new ConnectorError(502, 'The MCP server hostname could not be resolved.');
  }
  if (!addresses.length) throw new ConnectorError(502, 'The MCP server hostname did not resolve.');
  for (const { address } of addresses) {
    if (!isUnsafeIpAddress(address)) continue;
    if (allowPrivateNetwork === true && isLoopbackAddress(address)) continue;
    throw new ConnectorError(403, 'Private, reserved, link-local, and metadata-network MCP destinations are blocked.');
  }
  return addresses;
};

const boundedResponse = (response, dispatcher) => {
  if (!response.body) {
    void dispatcher.close();
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
    flush() { void dispatcher.close(); },
    cancel() { void dispatcher.close(); },
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
  let body = init.body;
  const originalOrigin = endpoint.origin;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    if (!['http:', 'https:'].includes(currentUrl.protocol)) {
      throw new ConnectorError(403, 'MCP redirects may only use HTTP or HTTPS.');
    }
    if (currentUrl.protocol === 'http:' && currentUrl.hostname.toLowerCase() !== 'localhost'
      && !isLoopbackAddress(currentUrl.hostname)) {
      throw new ConnectorError(403, 'Insecure non-loopback MCP destinations are blocked.');
    }
    const addresses = await validateMcpDestination(currentUrl, allowPrivateNetwork);
    const dispatcher = new UndiciAgent({
      connect: {
        lookup(_hostname, options, callback) {
          const pinned = addresses.map(({ address, family }) => ({ address, family }));
          if (options?.all) callback(null, pinned);
          else callback(null, pinned[0].address, pinned[0].family);
        },
      },
    });
    controller.signal.addEventListener('abort', () => void dispatcher.close(), { once: true });
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    for (const [name, value] of new Headers(init.headers)) headers.set(name, value);
    headers.delete('authorization');
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
      void dispatcher.close();
      throw error;
    }
    if (![301, 302, 303, 307, 308].includes(response.status)) return boundedResponse(response, dispatcher);
    await response.body?.cancel().catch(() => undefined);
    void dispatcher.close();
    if (redirects === MAX_REDIRECTS) throw new ConnectorError(502, 'The MCP server redirected too many times.');
    const location = response.headers.get('location');
    if (!location) throw new ConnectorError(502, 'The MCP server returned an invalid redirect.');
    currentUrl = new URL(location, currentUrl);
    if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === 'POST')) {
      method = 'GET';
      body = undefined;
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

const connectMcpClient = async (transportName, endpoint, accessToken, allowPrivateNetwork, makeTransport, operation) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MCP_REQUEST_TIMEOUT_MS);
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
    clearTimeout(timer);
    await client.close().catch(() => undefined);
  }
};

const summaryFromClient = async (transportName, endpoint, accessToken, allowPrivateNetwork, makeTransport) =>
  connectMcpClient(transportName, endpoint, accessToken, allowPrivateNetwork, makeTransport, async (client) => {
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
  });

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
  const allowPrivateNetwork = body.allowPrivateNetwork === true;
  await validateMcpDestination(endpoint, allowPrivateNetwork);

  try {
    return await summaryFromClient('streamable-http', endpoint, accessToken, allowPrivateNetwork, (safeFetch) =>
      new StreamableHTTPClientTransport(endpoint, { fetch: safeFetch }),
    );
  } catch (streamableError) {
    try {
      return await summaryFromClient('sse', endpoint, accessToken, allowPrivateNetwork, (safeFetch) =>
        new SSEClientTransport(endpoint, { fetch: safeFetch }),
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

const authorizationOwner = (authorization) => authorization.kind === 'session' ? authorization.token : 'master';

const approveMcpServer = async (body, authorization) => {
  const summary = await inspectMcpServer(body);
  const id = `mcp_${createSecret()}`;
  const endpoint = normalizeMcpEndpoint(body.endpoint);
  approvedMcpServers.set(id, {
    id,
    owner: authorizationOwner(authorization),
    endpoint: endpoint.toString(),
    accessToken: optionalToken(body.accessToken, 'MCP server token'),
    allowPrivateNetwork: body.allowPrivateNetwork === true,
    summary,
    createdAt: Date.now(),
  });
  return { ...summary, serverId: id };
};

const requireApprovedMcpServer = (serverId, authorization) => {
  if (typeof serverId !== 'string' || !serverId) throw new ConnectorError(400, 'An approved MCP server is required.');
  const server = approvedMcpServers.get(serverId);
  if (!server || server.owner !== authorizationOwner(authorization)) {
    throw new ConnectorError(404, 'That approved MCP server is unavailable for this session.');
  }
  return server;
};

const invokeApprovedMcpTool = async (body, authorization) => {
  if (body.confirmed !== true) throw new ConnectorError(400, 'Tool invocation requires explicit user confirmation.');
  const server = requireApprovedMcpServer(body.serverId, authorization);
  const toolName = typeof body.toolName === 'string' ? body.toolName.trim() : '';
  if (!toolName || !server.summary.tools.some((tool) => tool.name === toolName)) {
    throw new ConnectorError(400, 'Choose a tool exposed by the approved MCP server.');
  }
  const args = body.arguments === undefined ? {} : body.arguments;
  if (!isRecord(args) || Buffer.byteLength(JSON.stringify(args), 'utf8') > MAX_BODY_BYTES) {
    throw new ConnectorError(400, 'Tool arguments must be a bounded JSON object.');
  }
  const endpoint = new URL(server.endpoint);
  const run = (transportName, makeTransport) => connectMcpClient(
    transportName,
    endpoint,
    server.accessToken,
    server.allowPrivateNetwork,
    makeTransport,
    (client) => client.callTool({ name: toolName, arguments: args }),
  );
  try {
    return await run('streamable-http', (safeFetch) => new StreamableHTTPClientTransport(endpoint, { fetch: safeFetch }));
  } catch (streamableError) {
    try {
      return await run('sse', (safeFetch) => new SSEClientTransport(endpoint, { fetch: safeFetch }));
    } catch (sseError) {
      throw new ConnectorError(502, `MCP tool invocation failed: ${redactError(sseError, [server.accessToken])}`);
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
  return secrets;
};

const promptForAgent = (agent, prompt, approvedServer) => {
  if (agent.id !== 'antigravity') return prompt;
  const permitted = approvedServer
    ? 'You may use only the explicitly configured algoglyph_approved MCP tools when they are genuinely needed.'
    : 'Do not call any tools.';
  return [
    'NON-INTERACTIVE OUTPUT-ONLY MODE:',
    permitted,
    'Never use the command, terminal, shell, browser, file, search, edit, or workspace tools.',
    'Do not inspect the current directory or try to gather additional context.',
    'Answer directly from the request below. A tool call will be denied and will make the task fail.',
    '',
    prompt,
  ].join('\n');
};

const prepareApprovedMcpForAgent = async (agent, server, workingDirectory, environment) => {
  if (agent.id === 'antigravity') {
    const name = 'algoglyph_approved';
    const headers = server?.accessToken ? { Authorization: `Bearer ${server.accessToken}` } : undefined;
    if (server?.accessToken) environment.ALGOGLYPH_APPROVED_MCP_TOKEN = server.accessToken;
    const settingsDirectory = join(environment.HOME, '.gemini', 'antigravity-cli');
    const settingsPath = join(settingsDirectory, 'settings.json');
    await mkdir(settingsDirectory, { recursive: true, mode: 0o700 });
    let settings = {};
    try {
      const existing = JSON.parse(await readFile(settingsPath, 'utf8'));
      if (isRecord(existing)) settings = existing;
    } catch {
      // A missing or corrupt cache must not prevent a clean isolated request.
    }
    settings.mcpServers = server
      ? { [name]: { httpUrl: server.endpoint, ...(headers ? { headers } : {}) } }
      : {};
    await writeFile(settingsPath, JSON.stringify(settings), { mode: 0o600 });
    return { extraArgs: [] };
  }
  if (!server) return { extraArgs: [] };
  const name = 'algoglyph_approved';
  if (server.accessToken) environment.ALGOGLYPH_APPROVED_MCP_TOKEN = server.accessToken;

  if (agent.id === 'codex') {
    await mkdir(environment.CODEX_HOME, { recursive: true });
    const config = [
      `[mcp_servers.${name}]`,
      `url = ${JSON.stringify(server.endpoint)}`,
      ...(server.accessToken ? ['bearer_token_env_var = "ALGOGLYPH_APPROVED_MCP_TOKEN"'] : []),
      '',
    ].join('\n');
    await writeFile(join(environment.CODEX_HOME, 'config.toml'), config, { mode: 0o600 });
    return { extraArgs: [] };
  }

  const headers = server.accessToken ? { Authorization: `Bearer ${server.accessToken}` } : undefined;
  const configPath = join(workingDirectory, 'approved-mcp.json');
  await writeFile(configPath, JSON.stringify({
    mcpServers: { [name]: { type: 'http', url: server.endpoint, ...(headers ? { headers } : {}) } },
  }), { mode: 0o600 });

  if (agent.id === 'claude') return { extraArgs: ['--mcp-config', configPath, '--strict-mcp-config'] };
  if (agent.id === 'fixture') return { extraArgs: [] };
  throw new ConnectorError(400, 'The selected agent does not support isolated MCP configuration.');
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

const readAntigravityTranscript = async (homeDirectory) => {
  const brainDirectory = join(homeDirectory, '.gemini', 'antigravity-cli', 'brain');
  let conversations;
  try {
    conversations = await readdir(brainDirectory, { withFileTypes: true });
  } catch {
    return { eventKeys: new Set(), outputs: [] };
  }

  const eventKeys = new Set();
  const outputs = [];
  await Promise.all(conversations.filter((entry) => entry.isDirectory()).map(async (entry) => {
    const transcriptPath = join(
      brainDirectory,
      entry.name,
      '.system_generated',
      'logs',
      'transcript.jsonl',
    );
    let source;
    try {
      source = await readFile(transcriptPath, 'utf8');
    } catch {
      return;
    }
    for (const line of source.split(/\r?\n/)) {
      if (!line.trim()) continue;
      try {
        const event = JSON.parse(line);
        const eventKey = `${entry.name}:${event.step_index}:${event.source || ''}:${event.type || ''}:${event.created_at || ''}`;
        eventKeys.add(eventKey);
        if (event.source !== 'MODEL' || event.type !== 'PLANNER_RESPONSE'
          || event.status !== 'DONE' || typeof event.content !== 'string') continue;
        outputs.push({
          key: eventKey,
          content: event.content,
          createdAt: typeof event.created_at === 'string' ? event.created_at : '',
        });
      } catch {
        // A partially written JSONL tail is expected while the model is active.
      }
    }
  }));
  return {
    eventKeys,
    outputs: outputs.sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
  };
};

const waitForAntigravity = (session, predicate, timeoutMs) => new Promise((resolveDone, reject) => {
  const startedAt = Date.now();
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
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('The persistent Antigravity session did not become ready in time.'));
        return;
      }
      session.pollTimer = setTimeout(poll, 100);
      session.pollTimer.unref();
    }, reject);
  };
  poll();
});

const stopAntigravitySession = async (session = antigravitySession) => {
  if (!session || session.stopping) return;
  session.stopping = true;
  session.exited = true;
  if (session.pollTimer) clearTimeout(session.pollTimer);
  if (process.platform === 'win32' && session.pty?.pid) {
    await new Promise((resolveDone) => {
      execFile('taskkill.exe', ['/PID', String(session.pty.pid), '/T', '/F'], { windowsHide: true }, () => resolveDone());
    });
  } else {
    try { session.pty?.kill(); } catch { /* already gone */ }
  }
  session.terminal?.dispose();
  await rm(session.rootDirectory, { recursive: true, force: true }).catch(() => undefined);
  if (antigravitySession === session) {
    antigravitySession = undefined;
    antigravitySessionPromise = undefined;
  }
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

const startAntigravitySession = async (approvedServer) => {
  if (connectorShuttingDown) throw new ConnectorError(503, 'The connector is shutting down.');
  const agent = AGENTS.find((candidate) => candidate.id === 'antigravity');
  if (!agent) throw new ConnectorError(503, 'Antigravity is unavailable.');
  const executable = await resolveAgentExecutable(agent);
  if (!executable) throw new ConnectorError(503, 'The Antigravity executable is unavailable.');
  const { ptyRuntime, HeadlessTerminal } = await loadAntigravityPtyModules();

  const rootDirectory = await mkdtemp(join(tmpdir(), 'algoglyph-antigravity-session-'));
  const homeDirectory = join(rootDirectory, 'home');
  const runDirectory = join(rootDirectory, 'workspace');
  let environment;
  try {
    await Promise.all([
      mkdir(homeDirectory, { recursive: true, mode: 0o700 }),
      mkdir(runDirectory, { recursive: true, mode: 0o700 }),
    ]);
    environment = createAgentEnvironment(agent, executable, homeDirectory);
    environment.TERM = 'xterm-256color';
    await seedAntigravityPreferences(homeDirectory);
    await provisionAgentCredentials(agent, environment, homeDirectory);
    await prepareApprovedMcpForAgent(agent, approvedServer, runDirectory, environment);
    if (connectorShuttingDown) {
      throw new ConnectorError(503, 'The connector is shutting down.');
    }
  } catch (error) {
    await rm(rootDirectory, { recursive: true, force: true }).catch(() => undefined);
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
    ptyProcess = ptyRuntime.spawn(executable, ['--sandbox'], {
      cwd: runDirectory,
      env: environment,
      cols: 160,
      rows: 50,
      name: 'xterm-256color',
      useConpty: process.platform === 'win32',
    });
  } catch (error) {
    terminal.dispose();
    await rm(rootDirectory, { recursive: true, force: true });
    throw error;
  }

  const session = {
    key: approvedServer?.id || 'none',
    rootDirectory,
    homeDirectory,
    runDirectory,
    terminal,
    pty: ptyProcess,
    exited: false,
    stopping: false,
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
    if (antigravitySession === session) {
      antigravitySession = undefined;
      antigravitySessionPromise = undefined;
    }
  });

  await waitForAntigravity(session, () => {
    const screen = antigravityScreenText(session);
    return screen.includes('? for shortcuts');
  }, ANTIGRAVITY_SESSION_READY_TIMEOUT_MS);
  return session;
};

const getAntigravitySession = async (approvedServer) => {
  if (connectorShuttingDown) throw new ConnectorError(503, 'The connector is shutting down.');
  const key = approvedServer?.id || 'none';
  if (antigravitySession && antigravitySession.key !== key) {
    await stopAntigravitySession(antigravitySession);
  }
  if (antigravitySession && !antigravitySession.exited && antigravitySession.key === key) {
    return antigravitySessionPromise || antigravitySession;
  }
  antigravitySessionPromise = startAntigravitySession(approvedServer).catch(async (error) => {
    const failedSession = antigravitySession?.key === key ? antigravitySession : undefined;
    if (failedSession) await stopAntigravitySession(failedSession);
    throw error;
  });
  return antigravitySessionPromise;
};

const runPersistentAntigravityPrompt = async (session, prompt, isCancelled) => {
  if (session.used) {
    session.pty.write('/clear\r');
    await new Promise((resolveDone) => {
      const timer = setTimeout(resolveDone, 150);
      timer.unref();
    });
  }
  session.used = true;
  const previousTranscript = await readAntigravityTranscript(session.homeDirectory);
  const terminalSafePrompt = prompt
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  const submit = () => session.pty.write(`\x1b[200~${terminalSafePrompt}\x1b[201~\r`);
  submit();
  let lastSubmitAt = Date.now();
  let submitAttempts = 1;

  return waitForAntigravity(session, async () => {
    if (isCancelled()) throw new Error('The agent run was cancelled.');
    const transcript = await readAntigravityTranscript(session.homeDirectory);
    const output = transcript.outputs.find((candidate) => !previousTranscript.eventKeys.has(candidate.key));
    if (output) return output.content;
    const accepted = [...transcript.eventKeys].some((key) => !previousTranscript.eventKeys.has(key));
    if (!accepted && submitAttempts < 5 && Date.now() - lastSubmitAt >= 3_000) {
      submitAttempts += 1;
      lastSubmitAt = Date.now();
      submit();
    }
    return undefined;
  }, AGENT_RUN_TIMEOUT_MS);
};

let activeAgentRuns = 0;

const streamPersistentAntigravityRun = async (request, response, prompt, approvedServer, secrets) => {
  activeAgentRuns += 1;
  let session;
  try {
    session = await getAntigravitySession(approvedServer);
  } catch (error) {
    activeAgentRuns = Math.max(0, activeAgentRuns - 1);
    throw new ConnectorError(503, redactError(error, secrets));
  }

  applySecurityHeaders(response);
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

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
    if (session.exited) await stopAntigravitySession(session);
  } finally {
    settled = true;
    activeAgentRuns = Math.max(0, activeAgentRuns - 1);
    response.end();
  }
};

// Spawns an allowlisted agent for a single headless prompt and streams its output
// back as Server-Sent Events. All validation that can reject the request happens
// *before* the 200/SSE headers are written, so the outer handler can still emit a
// normal JSON error. Once streaming begins, failures are surfaced as `error`
// events. The run is bounded by a wall-clock timeout, a max-output cap, and is
// killed if the client disconnects.
const streamAgentRun = async (request, response, body, authorization) => {
  const requestStartedAt = monotonicMilliseconds();
  const traceId = DEV_TIMING_ENABLED && typeof body.traceId === 'string'
    ? body.traceId.trim().slice(0, 96)
    : undefined;
  const agent = findAgent(body.agentId);
  if (!agent) {
    throw new ConnectorError(404, 'Unknown agent.');
  }
  const prompt = validatePrompt(body.prompt);
  const secrets = agentRunSecrets(prompt, body);
  const bufferedOutput = body.outputMode === 'buffered';
  const approvedServer = body.mcpServerId
    ? requireApprovedMcpServer(body.mcpServerId, authorization)
    : undefined;
  if (body.mcpServer !== undefined) {
    throw new ConnectorError(400, 'Raw MCP credentials are not accepted for agent runs; test and approve the server first.');
  }

  if (activeAgentRuns >= MAX_CONCURRENT_AGENT_RUNS) {
    throw new ConnectorError(429, 'An agent run is already in progress. Try again once it finishes.');
  }

  if (agent.id === 'antigravity' && process.env.NODE_ENV !== 'test') {
    await streamPersistentAntigravityRun(request, response, prompt, approvedServer, secrets);
    return;
  }

  const executableStartedAt = monotonicMilliseconds();
  const executable = await resolveAgentExecutable(agent);
  const executableResolvedAt = monotonicMilliseconds();
  if (!executable) throw new ConnectorError(503, 'The selected agent executable is unavailable.');
  const { workingDirectory, runDirectory, homeDirectory } = await createIsolatedAgentDirectories(agent);
  const environment = createAgentEnvironment(agent, executable, homeDirectory);
  const credentialsStartedAt = monotonicMilliseconds();
  let credentialsFinishedAt = credentialsStartedAt;
  let mcpConfigStartedAt = credentialsStartedAt;
  let mcpConfigFinishedAt = credentialsStartedAt;
  let extraArgs;
  try {
    // Provision only the credentials required by this isolated one-shot run.
    await provisionAgentCredentials(agent, environment, homeDirectory);
    credentialsFinishedAt = monotonicMilliseconds();
    mcpConfigStartedAt = monotonicMilliseconds();
    ({ extraArgs } = await prepareApprovedMcpForAgent(agent, approvedServer, workingDirectory, environment));
    mcpConfigFinishedAt = monotonicMilliseconds();
  } catch (error) {
    await rm(workingDirectory, { recursive: true, force: true });
    throw error;
  }
  const baseArgs = agent.id === 'claude' && approvedServer
    ? agent.runArgs.filter((argument, index, args) => argument !== '--tools' && args[index - 1] !== '--tools')
    : agent.runArgs;
  let fixedArgs = [...baseArgs, ...extraArgs];
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
    throw new ConnectorError(500, redactError(error, secrets));
  }
  const spawnReturnedAt = monotonicMilliseconds();

  activeAgentRuns += 1;
  activeChildren.add(child);

  applySecurityHeaders(response);
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

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
    activeAgentRuns = Math.max(0, activeAgentRuns - 1);
    activeChildren.delete(child);
    void rm(workingDirectory, { recursive: true, force: true });
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
    consumeRateLimit(pairingIssueAttempts, requestRateKey(request), pairingIssueRateLimit);
    const body = await readJsonBody(request);
    prunePairings();
    const pairing = createPairingCredential(requestedScopes(body));
    writeJson(response, 200, {
      pairingToken: pairing.token,
      expiresAt: new Date(pairing.expiresAt).toISOString(),
      ttlSeconds: Math.floor(PAIRING_TTL_MS / 1000),
      scopes: pairing.scopes,
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/session') {
    consumeRateLimit(pairingRedeemAttempts, requestRateKey(request), pairingRedeemRateLimit);
    const body = await readJsonBody(request);
    const { session, sessionToken } = redeemPairingCredential(body);
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
    revokeSession(request);
    writeJson(response, 200, { revoked: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/v1/catalog') {
    requireAuthorization(request, 'catalog:read');
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
    const body = await readJsonBody(request);
    writeJson(response, 200, await approveMcpServer(body, authorization));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/mcp/invoke') {
    const authorization = requireAuthorization(request, 'mcp:invoke');
    const body = await readJsonBody(request);
    writeJson(response, 200, await invokeApprovedMcpTool(body, authorization));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/v1/agents/run') {
    const authorization = requireAuthorization(request, 'agent:run');
    const body = await readJsonBody(request);
    await streamAgentRun(request, response, body, authorization);
    return;
  }

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
  if (process.env.NODE_ENV !== 'test') {
    void getAntigravitySession(undefined).catch(() => undefined);
  }
});

const shutDown = async () => {
  connectorShuttingDown = true;
  clearInterval(authSweepTimer);
  await Promise.allSettled([...activeChildren].map((child) => terminateProcessTree(child, true)));
  await stopAntigravitySession();
  server.close(() => process.exit(0));
};
process.once('SIGINT', () => void shutDown());
process.once('SIGTERM', () => void shutDown());
