import assert from 'node:assert/strict';
import { access, chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, test } from 'node:test';
import {
  buildExecutableCandidates,
  executableSearchDirectories,
  resolveCliInvocation,
  resolveCliInvocations,
} from '../bin/cli-runtime.mjs';
import {
  startConnectorHarness,
  startMcpServerFixture,
  startRedirectServerFixture,
} from './helpers/connectorHarness.mjs';

const ALLOWED_ORIGIN = 'https://algoglyph.com';
const SECOND_ALLOWED_ORIGIN = 'https://www.algoglyph.com';
const BLOCKED_ORIGIN = 'https://attacker.example';
const ALL_SESSION_SCOPES = ['catalog:read', 'mcp:test', 'mcp:invoke', 'agent:run', 'session:revoke'];
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const CHUNKED_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/chunkedAgent.mjs', import.meta.url));
const INSPECT_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/inspectAgent.mjs', import.meta.url));
const FAILING_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/failingAgent.mjs', import.meta.url));
const UNAUTHENTICATED_AGENT_FIXTURE = fileURLToPath(
  new URL('./fixtures/unauthenticatedAgent.mjs', import.meta.url),
);
const OVERSIZED_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/oversizedAgent.mjs', import.meta.url));
const SLOW_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/slowAgent.mjs', import.meta.url));
const HANGING_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/hangingAgent.mjs', import.meta.url));
const WARM_ANTIGRAVITY_FIXTURE = fileURLToPath(new URL('./fixtures/warmAntigravityAgent.mjs', import.meta.url));
const RECOVERING_ANTIGRAVITY_FIXTURE = fileURLToPath(
  new URL('./fixtures/recoveringAntigravityAgent.mjs', import.meta.url),
);
const UNAUTHENTICATED_ANTIGRAVITY_FIXTURE = fileURLToPath(
  new URL('./fixtures/unauthenticatedAntigravityAgent.mjs', import.meta.url),
);
const SIGNING_IN_ANTIGRAVITY_FIXTURE = fileURLToPath(
  new URL('./fixtures/signingInAntigravityAgent.mjs', import.meta.url),
);
const CODEX_APP_SERVER_FIXTURE = fileURLToPath(new URL('./fixtures/codexAppServerAgent.mjs', import.meta.url));
const CLAUDE_STREAM_FIXTURE = fileURLToPath(new URL('./fixtures/claudeStreamAgent.mjs', import.meta.url));
const VERSION_PROBE_PRELOAD = fileURLToPath(new URL('./fixtures/versionProbePreload.cjs', import.meta.url));
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const createVirtualCliFileSystem = ({ files, aliases = {} }) => {
  const entries = new Map(Object.entries(files).map(([path, value]) => [
    path,
    {
      content: Buffer.from(value.content || ''),
      executable: value.executable !== false,
    },
  ]));
  const resolvePath = (path) => aliases[path] || path;
  const getEntry = (path) => {
    const resolved = resolvePath(path);
    const entry = entries.get(resolved);
    if (!entry) {
      const error = new Error(`ENOENT: ${path}`);
      error.code = 'ENOENT';
      throw error;
    }
    return { resolved, entry };
  };
  return {
    access: async (path) => {
      const { entry } = getEntry(path);
      if (!entry.executable) {
        const error = new Error(`EACCES: ${path}`);
        error.code = 'EACCES';
        throw error;
      }
    },
    readFile: async (path, encoding) => {
      const { entry } = getEntry(path);
      return encoding ? entry.content.toString(encoding) : Buffer.from(entry.content);
    },
    readFilePrefix: async (path, byteLimit) => {
      const { entry } = getEntry(path);
      return entry.content.subarray(0, byteLimit);
    },
    realpath: async (path) => getEntry(path).resolved,
    stat: async (path) => {
      const { entry } = getEntry(path);
      return { isFile: () => true, size: entry.content.length };
    },
  };
};

const waitForPathRemoval = async (path, timeoutMs = 5_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await access(path);
    } catch {
      return true;
    }
    await wait(50);
  }
  return false;
};

const waitForJsonFile = async (path, predicate, timeoutMs = 5_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const value = JSON.parse(await readFile(path, 'utf8'));
      if (predicate(value)) return value;
    } catch {
      // The fixture may not have created its coordination file yet.
    }
    await wait(25);
  }
  return undefined;
};

const processIsAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const waitForProcessExit = async (pid, timeoutMs = 5_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!processIsAlive(pid)) return true;
    await wait(50);
  }
  return !processIsAlive(pid);
};

const readFirstSseEvent = async (reader) => {
  const decoder = new TextDecoder();
  let raw = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) throw new Error('The fixture stream ended before emitting an event.');
    raw += decoder.decode(value, { stream: true });
    const boundary = raw.indexOf('\n\n');
    if (boundary !== -1) return parseSseEvents(raw.slice(0, boundary + 2))[0];
  }
};

const parseSseEvents = (raw) => raw.split('\n\n').filter(Boolean).map((record) => {
  const event = record.split('\n').find((line) => line.startsWith('event:'))?.slice(6).trim();
  const data = record.split('\n').filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
  return { event, data: JSON.parse(data) };
});

const runRawFixtureAgent = async (fixtureConnector, token, body) => {
  const response = await fetch(`${fixtureConnector.endpoint}/v1/agents/run`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Origin: fixtureConnector.allowedOrigin,
    },
    body: JSON.stringify({ agentId: 'fixture', prompt: 'security fixture', outputMode: 'buffered', ...body }),
  });
  return { status: response.status, events: response.ok ? parseSseEvents(await response.text()) : [], response };
};

const runWarmAntigravity = async (fixtureConnector, token, marker, mcpServerId) => {
  const response = await fetch(`${fixtureConnector.endpoint}/v1/agents/run`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Origin: fixtureConnector.allowedOrigin,
    },
    body: JSON.stringify({
      agentId: 'antigravity',
      prompt: marker,
      outputMode: 'buffered',
      ...(mcpServerId ? { mcpServerId } : {}),
    }),
  });
  const events = response.ok ? parseSseEvents(await response.text()) : [];
  const error = response.ok ? undefined : await response.json();
  const output = events.find((event) => event.event === 'output');
  return {
    status: response.status,
    events,
    error,
    output: output ? JSON.parse(output.data.chunk) : undefined,
  };
};

const requestWithHost = (endpoint, host) => new Promise((resolveRequest, reject) => {
  const target = new URL('/health', endpoint);
  const request = httpRequest({
    hostname: target.hostname,
    port: target.port,
    path: target.pathname,
    method: 'GET',
    headers: { Host: host, Origin: ALLOWED_ORIGIN },
  }, (response) => {
    response.resume();
    response.once('end', () => resolveRequest(response.statusCode));
  });
  request.once('error', reject);
  request.end();
});

const runFixtureAgent = async (fixtureConnector, token, outputMode) => {
  const response = await fetch(`${fixtureConnector.endpoint}/v1/agents/run`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Origin: fixtureConnector.allowedOrigin,
    },
    body: JSON.stringify({ agentId: 'fixture', prompt: 'draw one node', outputMode }),
  });
  assert.equal(response.status, 200);
  const records = (await response.text()).split('\n\n').filter(Boolean);
  return records.filter((record) => record.startsWith('event: output'));
};

let connector;
let mcpServer;

before(async () => {
  connector = await startConnectorHarness({ allowedOrigin: ALLOWED_ORIGIN });
  mcpServer = await startMcpServerFixture();
});

after(async () => {
  await mcpServer?.stop();
  await connector?.stop();
});

describe('connector HTTP security baseline', { concurrency: false }, () => {
  test('terminal startup relies on automatic local pairing without links or printed secrets', () => {
    assert.match(connector.startupOutput, /Listening on http:\/\/127\.0\.0\.1:/i);
    assert.doesNotMatch(connector.startupOutput, /mcpPair|quick connect|workspace#/i);
    assert.doesNotMatch(connector.startupOutput, new RegExp(connector.masterToken));
  });

  test('health exposes only non-sensitive connector metadata', async () => {
    const response = await connector.request('health');

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), ALLOWED_ORIGIN);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(response.body, {
      service: 'algoglyph-local-connector',
      status: 'ready',
      version: '0.2.4',
      protocolVersion: 2,
      requiresToken: true,
    });
    assert.equal(JSON.stringify(response.body).includes(connector.masterToken), false);
  });

  test('non-browser health checks without an Origin header remain supported', async () => {
    const response = await connector.request('health', { origin: null });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  });

  test('requests from an untrusted browser origin are rejected', async () => {
    const response = await connector.request('health', { origin: BLOCKED_ORIGIN });

    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.match(response.body.error.message, /origin is not allowed/i);
  });

  test('development origins trust only local Vite hosts unless preview is explicitly enabled', async () => {
    const developmentConnector = await startConnectorHarness({
      allowedOrigin: 'http://localhost:5173',
      devOrigins: '1',
    });
    try {
      const local = await developmentConnector.request('health');
      assert.equal(local.status, 200);

      const pagesPreview = await developmentConnector.request('health', {
        origin: 'https://algoglyph.pages.dev',
      });
      assert.equal(pagesPreview.status, 403);
    } finally {
      await developmentConnector.stop();
    }
  });

  test('allowed Private Network Access preflights are explicit and origin-scoped', async () => {
    const response = await connector.request('v1/agents/run', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Private-Network': 'true',
      },
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), ALLOWED_ORIGIN);
    assert.equal(response.headers.get('access-control-allow-private-network'), 'true');
    assert.match(response.headers.get('vary') || '', /Origin/i);
  });

  test('protected operations reject missing bearer credentials', async () => {
    const response = await connector.request('v1/agents/run', {
      method: 'POST',
      body: { agentId: 'codex', prompt: 'test' },
    });

    assert.equal(response.status, 401);
    assert.match(response.body.error.message, /valid connector token/i);
  });

  test('JSON endpoints reject non-object request bodies', async () => {
    const response = await connector.request('v1/session', {
      method: 'POST',
      rawBody: '[]',
    });

    assert.equal(response.status, 400);
    assert.match(response.body.error.message, /JSON object/i);
  });

  test('JSON request bodies are size bounded', async () => {
    const response = await connector.request('v1/session', {
      method: 'POST',
      rawBody: JSON.stringify({ padding: 'x'.repeat(70_000) }),
    });

    assert.equal(response.status, 413);
    assert.match(response.body.error.message, /too large/i);
  });

  test('the trusted app origin can pair automatically after the connector starts', async () => {
    const pairingResponse = await connector.request('v1/pairings', {
      method: 'POST',
      body: {},
    });

    assert.equal(pairingResponse.status, 200);
    assert.match(pairingResponse.body.pairingToken, /^[A-Za-z0-9_-]{40,}$/);
    assert.equal(pairingResponse.body.ttlSeconds, 90);
    assert.ok(Date.parse(pairingResponse.body.expiresAt) > Date.now());
    assert.deepEqual(pairingResponse.body.scopes, ALL_SESSION_SCOPES);

    const firstRedemption = await connector.request('v1/session', {
      method: 'POST',
      body: { pairingToken: pairingResponse.body.pairingToken },
    });
    assert.equal(firstRedemption.status, 200);
    assert.match(firstRedemption.body.sessionToken, /^[A-Za-z0-9_-]{40,}$/);
    assert.ok(Date.parse(firstRedemption.body.expiresAt) > Date.now());
    assert.ok(firstRedemption.body.idleTimeoutSeconds > 0);
    assert.deepEqual(firstRedemption.body.scopes, ALL_SESSION_SCOPES);

    const secondRedemption = await connector.request('v1/session', {
      method: 'POST',
      body: { pairingToken: pairingResponse.body.pairingToken },
    });
    assert.equal(secondRedemption.status, 401);
  });

  test('sessions enforce absolute and idle expiration', async () => {
    const absoluteConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_SESSION_TTL_MS: '80',
        ALGOGLYPH_TEST_SESSION_IDLE_TTL_MS: '2000',
      },
    });
    try {
      const { session } = await absoluteConnector.pair();
      await wait(120);
      const expired = await absoluteConnector.request('v1/mcp/test', {
        method: 'POST',
        token: session.sessionToken,
        body: {},
      });
      assert.equal(expired.status, 401);
    } finally {
      await absoluteConnector.stop();
    }

    const idleConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_SESSION_TTL_MS: '2000',
        ALGOGLYPH_TEST_SESSION_IDLE_TTL_MS: '80',
      },
    });
    try {
      const { session } = await idleConnector.pair();
      await wait(120);
      const idleExpired = await idleConnector.request('v1/mcp/test', {
        method: 'POST',
        token: session.sessionToken,
        body: {},
      });
      assert.equal(idleExpired.status, 401);
    } finally {
      await idleConnector.stop();
    }
  });

  test('session scopes are enforced and always retain revocation authority', async () => {
    const pairing = await connector.request('v1/pairings', {
      method: 'POST',
      token: connector.masterToken,
      body: { scopes: ['catalog:read'] },
    });
    assert.equal(pairing.status, 200);
    assert.deepEqual(pairing.body.scopes, ['session:revoke', 'catalog:read']);

    const session = await connector.request('v1/session', {
      method: 'POST',
      body: { pairingToken: pairing.body.pairingToken },
    });
    assert.equal(session.status, 200);

    const forbidden = await connector.request('v1/mcp/test', {
      method: 'POST',
      token: session.body.sessionToken,
      body: {},
    });
    assert.equal(forbidden.status, 403);

    const revoke = await connector.request('v1/session/revoke', {
      method: 'POST',
      token: session.body.sessionToken,
      body: {},
    });
    assert.equal(revoke.status, 200);
  });

  test('agent version probes use an isolated cwd and deny parent environment inheritance', async () => {
    const markerDirectory = await mkdtemp(join(tmpdir(), 'algoglyph-version-probe-test-'));
    const markerPath = join(markerDirectory, 'inherited-secret.txt');
    const probeConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        NODE_OPTIONS: `--require=${VERSION_PROBE_PRELOAD}`,
        ALGOGLYPH_TEST_VERSION_MARKER: markerPath,
        ALGOGLYPH_TEST_PARENT_SECRET: 'must-not-reach-version-probe',
        ALGOGLYPH_CODEX_PATH: process.execPath,
        ALGOGLYPH_ANTIGRAVITY_PATH: process.execPath,
        ALGOGLYPH_CLAUDE_PATH: process.execPath,
      },
    });
    try {
      const catalog = await probeConnector.request('v1/catalog', {
        token: probeConnector.masterToken,
      });
      assert.equal(catalog.status, 200);
      assert.equal(catalog.body.agents.every((agent) => agent.available), true);
      await assert.rejects(access(markerPath), /ENOENT/);

      const connectorSource = await readFile(
        `${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`,
        'utf8',
      );
      const probeSource = connectorSource.slice(
        connectorSource.indexOf('const runVersionCheck ='),
        connectorSource.indexOf('let agentCatalogPromise'),
      );
      assert.match(probeSource, /const environment = \{\}/);
      assert.match(probeSource, /cwd: probeDirectory,\s*env: environment/);
      assert.match(probeSource, /environment\.HOME = probeDirectory/);
      assert.match(probeSource, /environment\.USERPROFILE = probeDirectory/);
      assert.doesNotMatch(probeSource, /env:\s*process\.env|\.\.\.process\.env/);
      assert.doesNotMatch(probeSource, /TOKEN|SECRET|PASSWORD|API_KEY/);
    } finally {
      await probeConnector.stop();
      await rm(markerDirectory, { recursive: true, force: true });
    }
  });

  test('agent version labels use stdout and do not surface diagnostic stderr warnings', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'algoglyph-version-output-test-'));
    const entryPath = join(fixtureRoot, 'version-entry.js');
    const executablePath = process.platform === 'win32'
      ? join(fixtureRoot, 'version-cli.cmd')
      : join(fixtureRoot, 'version-cli');
    await writeFile(entryPath, [
      '#!/usr/bin/env node',
      "if (process.argv.includes('--version')) {",
      "  console.error('WARNING: harmless version probe diagnostic');",
      "  console.log('fixture-cli 7.8.9');",
      '  process.exit(0);',
      '}',
      'process.exit(0);',
    ].join('\n'));
    if (process.platform === 'win32') {
      await writeFile(executablePath, [
        '@ECHO off',
        'GOTO start',
        ':find_dp0',
        'SET dp0=%~dp0',
        'EXIT /b',
        ':start',
        'SETLOCAL',
        'CALL :find_dp0',
        'SET "_prog=node"',
        'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" "%dp0%\\version-entry.js" %*',
      ].join('\r\n'));
    } else {
      await writeFile(executablePath, await readFile(entryPath));
      await chmod(executablePath, 0o755);
    }

    const versionConnector = await startConnectorHarness({
      environment: {
        ALGOGLYPH_CODEX_PATH: executablePath,
        ALGOGLYPH_ANTIGRAVITY_PATH: executablePath,
        ALGOGLYPH_CLAUDE_PATH: executablePath,
      },
    });
    try {
      const catalog = await versionConnector.request('v1/catalog', { token: versionConnector.masterToken });
      assert.equal(catalog.status, 200);
      assert.equal(catalog.body.agents.every((agent) => agent.version === 'fixture-cli 7.8.9'), true);
    } finally {
      await versionConnector.stop();
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  test('agent discovery falls through when an earlier PATH candidate fails its version probe', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'algoglyph-cli-fallback-test-'));
    const firstDirectory = join(fixtureRoot, 'first');
    const secondDirectory = join(fixtureRoot, 'second');
    await Promise.all([
      mkdir(firstDirectory, { recursive: true }),
      mkdir(secondDirectory, { recursive: true }),
    ]);
    const makeLauncher = async (directory, exitCode, version) => {
      const entryPath = join(directory, 'codex-entry.js');
      await writeFile(entryPath, [
        '#!/usr/bin/env node',
        `if (process.argv.includes('--version')) { ${version ? `console.log('${version}');` : ''} process.exit(${exitCode}); }`,
        "process.exit(0);",
      ].join('\n'));
      if (process.platform === 'win32') {
        const shimPath = join(directory, 'codex.cmd');
        await writeFile(shimPath, [
          '@ECHO off',
          'GOTO start',
          ':find_dp0',
          'SET dp0=%~dp0',
          'EXIT /b',
          ':start',
          'SETLOCAL',
          'CALL :find_dp0',
          'SET "_prog=node"',
          'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" "%dp0%\\codex-entry.js" %*',
        ].join('\r\n'));
      } else {
        const executablePath = join(directory, 'codex');
        await writeFile(executablePath, await readFile(entryPath));
        await chmod(executablePath, 0o755);
      }
    };
    await makeLauncher(firstDirectory, 1);
    await makeLauncher(secondDirectory, 0, 'codex-cli portable-fixture');

    const fallbackConnector = await startConnectorHarness({
      environment: {
        PATH: [firstDirectory, secondDirectory].join(delimiter),
        ALGOGLYPH_ANTIGRAVITY_PATH: process.execPath,
        ALGOGLYPH_CLAUDE_PATH: process.execPath,
      },
    });
    try {
      const catalog = await fallbackConnector.request('v1/catalog', {
        token: fallbackConnector.masterToken,
      });
      assert.equal(catalog.status, 200);
      assert.deepEqual(catalog.body.agents.find((agent) => agent.id === 'codex'), {
        id: 'codex',
        label: 'Codex CLI',
        command: 'codex',
        available: true,
        version: 'codex-cli portable-fixture',
      });
    } finally {
      await fallbackConnector.stop();
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  test('Windows npm command shims resolve and launch without enabling a shell', {
    skip: process.platform !== 'win32',
  }, async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'algoglyph-cli-shim-test-'));
    const shimDirectory = join(fixtureRoot, 'npm');
    const emptyCodexHome = join(fixtureRoot, 'empty-codex-home');
    const entryDirectory = join(shimDirectory, 'node_modules', '@openai', 'codex', 'bin');
    const entryPath = join(entryDirectory, 'codex.js');
    const shimPath = join(shimDirectory, 'codex.cmd');
    const claudeEntryDirectory = join(shimDirectory, 'node_modules', '@anthropic-ai', 'claude-code');
    const claudeEntryPath = join(claudeEntryDirectory, 'cli.js');
    const claudeShimPath = join(shimDirectory, 'claude.cmd');
    await mkdir(entryDirectory, { recursive: true });
    await mkdir(claudeEntryDirectory, { recursive: true });
    await mkdir(emptyCodexHome, { recursive: true });
    await writeFile(entryPath, [
      "if (process.argv.includes('--version')) { console.log('codex-cli 9.9.9'); process.exit(0); }",
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (chunk) => { input += chunk; });",
      "process.stdin.on('end', () => { console.log(input ? 'shim-run-ok' : 'missing-prompt'); });",
    ].join('\n'));
    await writeFile(shimPath, [
      '@ECHO off',
      'GOTO start',
      ':find_dp0',
      'SET dp0=%~dp0',
      'EXIT /b',
      ':start',
      'SETLOCAL',
      'CALL :find_dp0',
      'SET "_prog=node"',
      'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" "%dp0%\\node_modules\\@openai\\codex\\bin\\codex.js" %*',
    ].join('\r\n'));
    await writeFile(claudeEntryPath, [
      "if (process.argv.includes('--version')) { console.log('claude-cli 8.8.8'); process.exit(0); }",
      "let input = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (chunk) => { input += chunk; });",
      "process.stdin.on('end', () => { console.log(input ? 'claude-shim-run-ok' : 'missing-prompt'); });",
    ].join('\n'));
    await writeFile(claudeShimPath, [
      '@ECHO off',
      'GOTO start',
      ':find_dp0',
      'SET dp0=%~dp0',
      'EXIT /b',
      ':start',
      'SETLOCAL',
      'CALL :find_dp0',
      'SET "_prog=node"',
      'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" "%dp0%\\node_modules\\@anthropic-ai\\claude-code\\cli.js" %*',
    ].join('\r\n'));

    const invocation = await resolveCliInvocation({
      command: 'codex',
      configuredPath: shimPath,
      platform: 'win32',
    });
    assert.equal(invocation?.kind, 'npm-node-shim');
    assert.equal(invocation?.command, process.execPath);
    assert.deepEqual(invocation?.argsPrefix, [entryPath]);
    const claudeInvocation = await resolveCliInvocation({
      command: 'claude',
      configuredPath: claudeShimPath,
      platform: 'win32',
    });
    assert.equal(claudeInvocation?.kind, 'npm-node-shim');
    assert.equal(claudeInvocation?.command, process.execPath);
    assert.deepEqual(claudeInvocation?.argsPrefix, [claudeEntryPath]);

    const shimConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        CODEX_HOME: emptyCodexHome,
        ALGOGLYPH_CODEX_PATH: shimPath,
        ALGOGLYPH_ANTIGRAVITY_PATH: process.execPath,
        ALGOGLYPH_CLAUDE_PATH: claudeShimPath,
      },
    });
    try {
      const { session } = await shimConnector.pair();
      const catalog = await shimConnector.request('v1/catalog', { token: session.sessionToken });
      const codex = catalog.body.agents.find((agent) => agent.id === 'codex');
      assert.deepEqual(codex, {
        id: 'codex',
        label: 'Codex CLI',
        command: 'codex',
        available: true,
        version: 'codex-cli 9.9.9',
      });
      const claude = catalog.body.agents.find((agent) => agent.id === 'claude');
      assert.deepEqual(claude, {
        id: 'claude',
        label: 'Claude Code',
        command: 'claude',
        available: true,
        version: 'claude-cli 8.8.8',
      });

      const run = await runRawFixtureAgent(shimConnector, session.sessionToken, { agentId: 'codex' });
      assert.equal(run.status, 200);
      assert.match(run.events.find((event) => event.event === 'output')?.data.chunk || '', /shim-run-ok/);
      assert.equal(run.events.at(-1)?.event, 'exit');
      assert.equal(run.events.at(-1)?.data.code, 0);
      const claudeRun = await runRawFixtureAgent(shimConnector, session.sessionToken, { agentId: 'claude' });
      assert.equal(claudeRun.status, 200);
      assert.match(
        claudeRun.events.find((event) => event.event === 'output')?.data.chunk || '',
        /claude-shim-run-ok/,
      );
      assert.equal(claudeRun.events.at(-1)?.event, 'exit');
      assert.equal(claudeRun.events.at(-1)?.data.code, 0);
    } finally {
      await shimConnector.stop();
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  test('cross-platform CLI candidates include reduced-GUI and package-manager locations', () => {
    const macCandidates = buildExecutableCandidates('agy', {
      platform: 'darwin',
      pathValue: '/custom/bin',
      nodeExecutable: '/Applications/Node/bin/node',
      homeDirectory: '/Users/example',
      environment: {
        PNPM_HOME: '/Users/example/custom-pnpm',
        NPM_CONFIG_PREFIX: '/Users/example/custom-npm',
      },
    });
    assert.deepEqual(macCandidates.slice(0, 2), ['/custom/bin/agy', '/Applications/Node/bin/agy']);
    assert.equal(macCandidates.includes('/Users/example/custom-pnpm/agy'), true);
    assert.equal(macCandidates.includes('/Users/example/custom-npm/bin/agy'), true);
    assert.equal(macCandidates.includes('/opt/homebrew/bin/agy'), true);
    assert.equal(macCandidates.includes('/usr/local/bin/agy'), true);
    assert.equal(macCandidates.includes('/Users/example/.volta/bin/agy'), true);
    const macClaudeCandidates = buildExecutableCandidates('claude', {
      platform: 'darwin',
      pathValue: '/custom/bin',
      nodeExecutable: '/Applications/Node/bin/node',
      homeDirectory: '/Users/example',
      environment: {},
    });
    assert.equal(macClaudeCandidates.includes('/opt/homebrew/bin/claude'), true);
    assert.equal(macClaudeCandidates.includes('/usr/local/bin/claude'), true);
    assert.equal(macClaudeCandidates.includes('/Users/example/.local/bin/claude'), true);
    assert.equal(macClaudeCandidates.includes('/Users/example/.npm-global/bin/claude'), true);

    const windowsCandidates = buildExecutableCandidates('codex', {
      platform: 'win32',
      pathValue: 'C:\\npm;C:\\tools',
      pathExtValue: '.EXE;.CMD',
      nodeExecutable: 'C:\\node\\node.exe',
      homeDirectory: 'C:\\Users\\example',
      environment: {
        APPDATA: 'D:\\Profiles\\example\\Roaming',
        LOCALAPPDATA: 'D:\\Profiles\\example\\Local',
        VOLTA_HOME: 'D:\\toolchains\\volta',
      },
    });
    assert.deepEqual(windowsCandidates.slice(0, 6), [
      'C:\\npm\\codex.EXE',
      'C:\\npm\\codex.CMD',
      'C:\\npm\\codex.COM',
      'C:\\tools\\codex.EXE',
      'C:\\tools\\codex.CMD',
      'C:\\tools\\codex.COM',
    ]);
    assert.equal(windowsCandidates.includes('D:\\Profiles\\example\\Roaming\\npm\\codex.CMD'), true);
    assert.equal(windowsCandidates.includes('D:\\Profiles\\example\\Local\\agy\\bin\\codex.EXE'), true);
    assert.equal(windowsCandidates.includes('D:\\toolchains\\volta\\bin\\codex.EXE'), true);
    const windowsClaudeCandidates = buildExecutableCandidates('claude', {
      platform: 'win32',
      pathValue: '',
      pathExtValue: '.EXE;.CMD',
      nodeExecutable: 'C:\\node\\node.exe',
      homeDirectory: 'C:\\Users\\example',
      environment: {},
    });
    assert.equal(windowsClaudeCandidates.includes('C:\\Users\\example\\AppData\\Roaming\\npm\\claude.CMD'), true);
    assert.equal(windowsClaudeCandidates.includes('C:\\Users\\example\\.local\\bin\\claude.EXE'), true);
    assert.equal(windowsClaudeCandidates.includes('C:\\Users\\example\\.volta\\bin\\claude.EXE'), true);
    assert.equal(buildExecutableCandidates('claude', {
      platform: 'win32',
      pathValue: '"C:\\Program Files\\Portable Bin";relative-bin',
      nodeExecutable: 'C:\\node\\node.exe',
      homeDirectory: 'C:\\Users\\example',
      environment: {},
    }).includes('C:\\Program Files\\Portable Bin\\claude.EXE'), true);

    const reducedMacDirectories = executableSearchDirectories({
      platform: 'darwin',
      pathValue: '/usr/bin:/bin',
      nodeExecutable: '/Applications/AlgoGlyph/node',
      homeDirectory: '/Users/example',
      environment: { FNM_MULTISHELL_PATH: '/private/tmp/fnm-shell' },
    });
    assert.equal(reducedMacDirectories.includes('/private/tmp/fnm-shell'), true);
    assert.equal(reducedMacDirectories.includes('/Users/example/Library/pnpm'), true);
    const relativePathDirectories = executableSearchDirectories({
      platform: 'darwin',
      pathValue: 'relative-bin:/safe/bin',
      nodeExecutable: '/Applications/AlgoGlyph/node',
      homeDirectory: '/Users/example',
      environment: {},
    });
    assert.equal(relativePathDirectories.some((directory) => directory.includes('relative-bin')), false);
  });

  test('simulated macOS npm shims use trusted Node while native CLIs stay native', async () => {
    const nodePath = '/Applications/AlgoGlyph Runtime/bin/node';
    const npmShim = '/Users/example/.npm-global/bin/codex';
    const npmEntry = '/Users/example/.npm-global/lib/node_modules/@openai/codex/bin/codex.js';
    const nativeAgy = '/opt/homebrew/bin/agy';
    const fileSystem = createVirtualCliFileSystem({
      files: {
        [nodePath]: { content: '\u00cf\u00fa\u00ed\u00fe' },
        [npmEntry]: { content: '#!/usr/bin/env node\nconsole.log("codex");\n' },
        [nativeAgy]: { content: '\u00cf\u00fa\u00ed\u00fe' },
      },
      aliases: { [npmShim]: npmEntry },
    });

    const codex = await resolveCliInvocation({
      command: 'codex',
      platform: 'darwin',
      pathValue: '',
      nodeExecutable: nodePath,
      homeDirectory: '/Users/example',
      projectDirectory: '/Users/example/project',
      environment: { NPM_CONFIG_PREFIX: '/Users/example/.npm-global' },
      fileSystem,
    });
    assert.equal(codex?.kind, 'node-script');
    assert.equal(codex?.command, nodePath);
    assert.deepEqual(codex?.argsPrefix, [npmEntry]);
    assert.equal(codex?.pathEntries[0], '/Applications/AlgoGlyph Runtime/bin');

    const agy = await resolveCliInvocation({
      command: 'agy',
      platform: 'darwin',
      pathValue: '/opt/homebrew/bin',
      nodeExecutable: nodePath,
      homeDirectory: '/Users/example',
      projectDirectory: '/Users/example/project',
      environment: {},
      fileSystem,
    });
    assert.equal(agy?.kind, 'native');
    assert.equal(agy?.command, nativeAgy);
    assert.deepEqual(agy?.argsPrefix, []);
  });

  test('resolver rejects malformed launchers and falls through to a valid candidate', async () => {
    const nodePath = 'C:\\Runtime\\node.exe';
    const malformedShim = 'C:\\first\\claude.CMD';
    const escapedEntry = 'C:\\outside\\steal.js';
    const nativeFallback = 'C:\\second\\claude.EXE';
    const packageManagerShim = 'C:\\pnpm\\claude.CMD';
    const packageManagerEntry = 'C:\\store\\claude\\cli.js';
    const fileSystem = createVirtualCliFileSystem({
      files: {
        [nodePath]: { content: 'node' },
        [malformedShim]: {
          content: '@ECHO off\r\nCALL :find_dp0\r\nSET "_prog=node"\r\n"%dp0%\\..\\outside\\steal.js" %*',
        },
        [escapedEntry]: { content: 'console.log("unsafe")' },
        [nativeFallback]: { content: 'native' },
        [packageManagerShim]: {
          content: '@echo off\r\n"%~dp0..\\runtime\\node.exe" "%~dp0..\\store\\claude\\cli.js" %*',
        },
        [packageManagerEntry]: { content: 'console.log("claude")' },
      },
    });
    const invocations = await resolveCliInvocations({
      command: 'claude',
      platform: 'win32',
      pathValue: 'C:\\first;C:\\second',
      pathExtValue: '.CMD;.EXE',
      nodeExecutable: nodePath,
      homeDirectory: 'C:\\Users\\example',
      projectDirectory: 'C:\\project',
      environment: {},
      fileSystem,
    });
    assert.equal(invocations.length, 1);
    assert.equal(invocations[0].kind, 'native');
    assert.equal(invocations[0].command, nativeFallback);

    const packageManagerInvocation = await resolveCliInvocation({
      command: 'claude',
      platform: 'win32',
      pathValue: 'C:\\pnpm',
      pathExtValue: '.CMD',
      nodeExecutable: nodePath,
      homeDirectory: 'C:\\Users\\example',
      projectDirectory: 'C:\\project',
      environment: {},
      fileSystem,
    });
    assert.equal(packageManagerInvocation?.kind, 'node-command-shim');
    assert.equal(packageManagerInvocation?.command, nodePath);
    assert.deepEqual(packageManagerInvocation?.argsPrefix, [packageManagerEntry]);

    const missing = await resolveCliInvocation({
      command: 'codex',
      platform: 'win32',
      pathValue: 'C:\\missing',
      nodeExecutable: nodePath,
      homeDirectory: 'C:\\Users\\example',
      projectDirectory: 'C:\\project',
      environment: {},
      fileSystem,
    });
    assert.equal(missing, undefined);
    await assert.rejects(
      resolveCliInvocation({
        command: 'codex',
        configuredPath: '.\\codex.cmd',
        platform: 'win32',
        nodeExecutable: nodePath,
        fileSystem,
      }),
      /must be absolute/,
    );
  });

  test('shared CLI runtime never delegates discovery or execution to a shell', async () => {
    const [runtimeSource, connectorSource] = await Promise.all([
      readFile(`${REPO_ROOT}/packages/mcp-connector/bin/cli-runtime.mjs`, 'utf8'),
      readFile(`${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`, 'utf8'),
    ]);
    assert.doesNotMatch(runtimeSource, /where\.exe|\bwhich\b|login-shell|bash|zsh|powershell/i);
    assert.doesNotMatch(connectorSource, /shell:\s*true/);
    assert.match(connectorSource, /spawn\(invocation\.command,[\s\S]*?shell:\s*false/);
    assert.match(connectorSource, /spawn\(appInvocation\.command,[\s\S]*?shell:\s*false/);
  });

  test('Codex app-server reuses one worker while every request gets a fresh ephemeral thread', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'algoglyph-codex-app-server-test-'));
    const statePath = join(fixtureRoot, 'state.json');
    const warmConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_DEV_TIMING: '1',
        ALGOGLYPH_CODEX_PATH: process.execPath,
        ALGOGLYPH_TEST_CODEX_APP_SERVER_FIXTURE: CODEX_APP_SERVER_FIXTURE,
        ALGOGLYPH_TEST_CODEX_STATE_FILE: statePath,
      },
    });
    try {
      const { session } = await warmConnector.pair();
      const runs = [];
      for (const prompt of ['cold-request', 'warm-request-two', 'warm-request-three']) {
        const run = await runRawFixtureAgent(warmConnector, session.sessionToken, {
          agentId: 'codex',
          prompt,
        });
        assert.equal(run.status, 200);
        assert.match(
          run.events.find((event) => event.event === 'output')?.data.chunk || '',
          new RegExp(`fixture:${prompt}`),
        );
        assert.equal(run.events.at(-1)?.event, 'exit');
        assert.equal(run.events.at(-1)?.data.code, 0);
        runs.push(run);
      }

      const state = await waitForJsonFile(statePath, (value) => value.turns?.length === 3);
      assert.equal(state.processes.length, 1);
      assert.equal(new Set(state.turns.map((turn) => turn.pid)).size, 1);
      assert.equal(new Set(state.threads.map((thread) => thread.threadId)).size, 3);
      assert.equal(state.threads.every((thread) => thread.ephemeral === true), true);
      assert.equal(state.threads.every((thread) => thread.approvalPolicy === 'never'), true);
      assert.equal(state.turns.every((turn) => turn.approvalPolicy === 'never'), true);
      assert.deepEqual(state.processes[0].security, {
        approvalNever: true,
        rootDenied: true,
        childEnvironmentDenied: true,
        historyDisabled: true,
      });

      const timings = runs.map((run) => run.events.find((event) => event.event === 'timing')?.data.stages);
      assert.equal(timings[0].codex_worker_reused, 0);
      assert.equal(timings[1].codex_worker_reused, 1);
      assert.equal(timings[2].codex_worker_reused, 1);
      assert.equal(new Set(timings.map((timing) => timing.codex_process_pid)).size, 1);

      const abortController = new AbortController();
      const cancelledRun = fetch(`${warmConnector.endpoint}/v1/agents/run`, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${session.sessionToken}`,
          'Content-Type': 'application/json',
          Origin: warmConnector.allowedOrigin,
        },
        body: JSON.stringify({ agentId: 'codex', prompt: 'slow-turn', outputMode: 'buffered' }),
        signal: abortController.signal,
      });
      setTimeout(() => abortController.abort(), 100);
      await assert.rejects(cancelledRun, /abort/i);
      const interrupted = await waitForJsonFile(statePath, (value) => value.interrupts === 1);
      assert.equal(interrupted.interrupts, 1);

      const afterCancel = await runRawFixtureAgent(warmConnector, session.sessionToken, {
        agentId: 'codex',
        prompt: 'after-cancel',
      });
      assert.equal(afterCancel.status, 200);
      assert.match(afterCancel.events.find((event) => event.event === 'output')?.data.chunk || '', /after-cancel/);
      const afterCancelState = await waitForJsonFile(statePath, (value) => value.turns?.length === 5);
      assert.equal(afterCancelState.processes.length, 1);
      assert.equal(new Set(afterCancelState.turns.map((turn) => turn.pid)).size, 1);

      const workerPid = state.processes[0].pid;
      const workerHome = state.processes[0].homeDirectory;
      const revoked = await warmConnector.request('v1/session/revoke', {
        method: 'POST',
        token: session.sessionToken,
        body: {},
      });
      assert.equal(revoked.status, 200);
      assert.equal(await waitForProcessExit(workerPid), true);
      assert.equal(await waitForPathRemoval(workerHome), true);
    } finally {
      await warmConnector.stop();
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  test('Claude stream-json reuses one worker and clears context before every later request', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'algoglyph-claude-stream-test-'));
    const statePath = join(fixtureRoot, 'state.json');
    const warmConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_DEV_TIMING: '1',
        ALGOGLYPH_CLAUDE_PATH: process.execPath,
        ALGOGLYPH_TEST_CLAUDE_STREAM_FIXTURE: CLAUDE_STREAM_FIXTURE,
        ALGOGLYPH_TEST_CLAUDE_STATE_FILE: statePath,
      },
    });
    try {
      const { session } = await warmConnector.pair();
      const runs = [];
      for (const prompt of ['first-request', 'second-request', 'third-request']) {
        const run = await runRawFixtureAgent(warmConnector, session.sessionToken, {
          agentId: 'claude',
          prompt,
        });
        assert.equal(run.status, 200);
        assert.equal(run.events.find((event) => event.event === 'output')?.data.chunk, `fixture:${prompt}`);
        assert.equal(run.events.at(-1)?.event, 'exit');
        assert.equal(run.events.at(-1)?.data.code, 0);
        runs.push(run);
      }

      const state = await waitForJsonFile(statePath, (value) => value.prompts?.length === 3);
      assert.equal(state.processes.length, 1);
      assert.equal(new Set(state.prompts.map((prompt) => prompt.pid)).size, 1);
      assert.equal(state.clears.length, 2);
      assert.equal(new Set(state.prompts.map((prompt) => prompt.sessionId)).size, 3);
      const timings = runs.map((run) => run.events.find((event) => event.event === 'timing')?.data.stages);
      assert.equal(timings[0].claude_worker_reused, 0);
      assert.equal(timings[1].claude_worker_reused, 1);
      assert.equal(timings[2].claude_worker_reused, 1);
      assert.equal(new Set(timings.map((timing) => timing.claude_process_pid)).size, 1);
    } finally {
      await warmConnector.stop();
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });

  test('session count is bounded by evicting the least-recently-used grant', async () => {
    const boundedConnector = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_MAX_SESSIONS: '2' },
    });
    try {
      const first = await boundedConnector.pair();
      await boundedConnector.pair();
      const third = await boundedConnector.pair();

      const evicted = await boundedConnector.request('v1/mcp/test', {
        method: 'POST',
        token: first.session.sessionToken,
        body: {},
      });
      assert.equal(evicted.status, 401);

      const newest = await boundedConnector.request('v1/mcp/test', {
        method: 'POST',
        token: third.session.sessionToken,
        body: {},
      });
      assert.equal(newest.status, 400);
    } finally {
      await boundedConnector.stop();
    }
  });

  test('pairing issuance and redemption are rate limited', async () => {
    const limitedConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_PAIRING_ISSUE_RATE_LIMIT: '2',
        ALGOGLYPH_TEST_PAIRING_REDEEM_RATE_LIMIT: '2',
        ALGOGLYPH_TEST_AUTH_RATE_WINDOW_MS: '500',
      },
    });
    try {
      const issued = [];
      for (let index = 0; index < 2; index += 1) {
        issued.push(await limitedConnector.request('v1/pairings', {
          method: 'POST',
          token: limitedConnector.masterToken,
          body: {},
        }));
      }
      const issueLimited = await limitedConnector.request('v1/pairings', {
        method: 'POST',
        token: limitedConnector.masterToken,
        body: {},
      });
      assert.equal(issueLimited.status, 429);
      assert.ok(Number(issueLimited.headers.get('retry-after')) >= 1);

      for (const pairing of issued) {
        const redeemed = await limitedConnector.request('v1/session', {
          method: 'POST',
          body: { pairingToken: pairing.body.pairingToken },
        });
        assert.equal(redeemed.status, 200);
      }
      const redeemLimited = await limitedConnector.request('v1/session', {
        method: 'POST',
        body: { pairingToken: 'invalid-but-rate-limited' },
      });
      assert.equal(redeemLimited.status, 429);
      assert.ok(Number(redeemLimited.headers.get('retry-after')) >= 1);
    } finally {
      await limitedConnector.stop();
    }
  });

  test('revoked session credentials no longer authorize protected operations', async () => {
    const { session } = await connector.pair();
    const revoke = await connector.request('v1/session/revoke', {
      method: 'POST',
      token: session.sessionToken,
      body: {},
    });
    assert.equal(revoke.status, 200);
    assert.deepEqual(revoke.body, { revoked: true });

    const protectedResponse = await connector.request('v1/mcp/test', {
      method: 'POST',
      token: session.sessionToken,
      body: {},
    });
    assert.equal(protectedResponse.status, 401);
  });

  test('authenticated MCP inspection connects to a local Streamable HTTP server', async () => {
    const { session } = await connector.pair();
    const response = await connector.request('v1/mcp/test', {
      method: 'POST',
      token: session.sessionToken,
      body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken, allowPrivateNetwork: true },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.transport, 'streamable-http');
    assert.deepEqual(response.body.server, { name: 'algoglyph-test-mcp-server', version: '1.2.3' });
    assert.equal(response.body.capabilities.tools, true);
    assert.equal(response.body.tools.length, 1);
    assert.deepEqual(response.body.tools[0], {
      name: 'echo_for_test',
      title: 'Echo for test',
      description: 'Returns deterministic fixture text.',
      inputSchema: {
        type: 'object',
        properties: { value: { type: 'string' } },
        required: ['value'],
      },
    });
  });

  test('approved tool invocation stays on its inspected transport after dispatch failure', async () => {
    const failingTransportServer = await startMcpServerFixture({ failToolAfterDispatch: true });
    try {
      const inspected = await connector.request('v1/mcp/test', {
        method: 'POST',
        token: connector.masterToken,
        body: {
          endpoint: failingTransportServer.endpoint,
          accessToken: failingTransportServer.accessToken,
          allowPrivateNetwork: true,
        },
      });
      assert.equal(inspected.status, 200);
      assert.equal(inspected.body.transport, 'streamable-http');
      const getRequestsBeforeInvocation = failingTransportServer.stats.getRequests;

      const invoked = await connector.request('v1/mcp/invoke', {
        method: 'POST',
        token: connector.masterToken,
        body: {
          serverId: inspected.body.serverId,
          toolName: 'echo_for_test',
          arguments: { value: 'fail-after-dispatch' },
          confirmed: true,
        },
      });

      assert.equal(invoked.status, 502);
      assert.equal(
        failingTransportServer.stats.toolDispatches,
        1,
        JSON.stringify(failingTransportServer.stats),
      );
      // Streamable HTTP opens one GET event channel per connection. An SSE
      // fallback after the failed call would add a second GET connection.
      assert.equal(failingTransportServer.stats.getRequests, getRequestsBeforeInvocation + 1);
    } finally {
      await failingTransportServer.stop();
    }
  });

  test('diagram-mode agent output is coalesced into one transport event', async () => {
    const fixtureConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_AGENT_FIXTURE: CHUNKED_AGENT_FIXTURE,
      },
    });
    try {
      const { session } = await fixtureConnector.pair();
      const streamedEvents = await runFixtureAgent(fixtureConnector, session.sessionToken, 'stream');
      const bufferedEvents = await runFixtureAgent(fixtureConnector, session.sessionToken, 'buffered');
      assert.ok(streamedEvents.length >= 4, `expected chunked output, received ${streamedEvents.length} events`);
      assert.equal(bufferedEvents.length, 1);
      assert.match(bufferedEvents[0], /Batched/);
    } finally {
      await fixtureConnector.stop();
    }
  });

  test('unknown routes return a bounded JSON error', async () => {
    const response = await connector.request('v1/not-a-route');

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { error: { status: 404, message: 'Route not found.' } });
  });
});

describe('connector adversarial regression coverage', { concurrency: false }, () => {
  test('automatic pairing requires a trusted origin and binds pairing and session grants to it', async () => {
    const originlessPairing = await connector.request('v1/pairings', {
      method: 'POST',
      origin: null,
      body: {},
    });
    assert.equal(originlessPairing.status, 403);

    const originlessMasterPairing = await connector.request('v1/pairings', {
      method: 'POST',
      origin: null,
      token: connector.masterToken,
      body: {},
    });
    assert.equal(originlessMasterPairing.status, 403);

    const pairing = await connector.request('v1/pairings', { method: 'POST', body: {} });
    assert.equal(pairing.status, 200);

    const wrongOriginRedemption = await connector.request('v1/session', {
      method: 'POST',
      origin: SECOND_ALLOWED_ORIGIN,
      body: { pairingToken: pairing.body.pairingToken },
    });
    assert.equal(wrongOriginRedemption.status, 403);
    assert.match(wrongOriginRedemption.body.error.message, /different browser origin/i);

    const originlessRedemption = await connector.request('v1/session', {
      method: 'POST',
      origin: null,
      body: { pairingToken: pairing.body.pairingToken },
    });
    assert.equal(originlessRedemption.status, 403);

    const session = await connector.request('v1/session', {
      method: 'POST',
      body: { pairingToken: pairing.body.pairingToken },
    });
    assert.equal(session.status, 200);

    const wrongOriginUse = await connector.request('v1/mcp/test', {
      method: 'POST',
      origin: SECOND_ALLOWED_ORIGIN,
      token: session.body.sessionToken,
      body: {},
    });
    assert.equal(wrongOriginUse.status, 403);

    const originlessUse = await connector.request('v1/mcp/test', {
      method: 'POST',
      origin: null,
      token: session.body.sessionToken,
      body: {},
    });
    assert.equal(originlessUse.status, 403);
  });

  test('JSON endpoints enforce media type, bounded structure, safe keys, and strict fields', async () => {
    const inputConnector = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: INSPECT_AGENT_FIXTURE },
    });
    try {
      const unsupportedMediaType = await inputConnector.request('v1/session', {
        method: 'POST',
        rawBody: '{}',
        headers: { 'Content-Type': 'text/plain' },
      });
      assert.equal(unsupportedMediaType.status, 415);

      const malformed = await inputConnector.request('v1/session', {
        method: 'POST',
        rawBody: '{"pairingToken":',
      });
      assert.equal(malformed.status, 400);

      let nested = '"value"';
      for (let index = 0; index < 15; index += 1) nested = `{"level":${nested}}`;
      const tooDeep = await inputConnector.request('v1/session', {
        method: 'POST',
        rawBody: nested,
      });
      assert.equal(tooDeep.status, 400);
      assert.match(tooDeep.body.error.message, /nested too deeply/i);

      const prototypePollution = await inputConnector.request('v1/session', {
        method: 'POST',
        rawBody: '{"pairingToken":"x","__proto__":{"polluted":true}}',
      });
      assert.equal(prototypePollution.status, 400);
      assert.match(prototypePollution.body.error.message, /unsafe JSON object keys/i);
      assert.equal(Object.prototype.polluted, undefined);

      const { session } = await inputConnector.pair();
      for (const [field, value] of [
        ['command', 'calc.exe'],
        ['path', 'C:\\Windows\\System32\\cmd.exe'],
        ['args', ['--dangerously-skip-permissions']],
        ['env', { OPENAI_API_KEY: 'must-not-be-reflected' }],
      ]) {
        const rejected = await inputConnector.request('v1/agents/run', {
          method: 'POST',
          token: session.sessionToken,
          body: { agentId: 'fixture', prompt: 'safe prompt', [field]: value },
        });
        assert.equal(rejected.status, 400, `expected ${field} to be rejected`);
        assert.match(rejected.body.error.message, new RegExp(`unsupported request field: ${field}`, 'i'));
        assert.doesNotMatch(JSON.stringify(rejected.body), /must-not-be-reflected|calc\.exe|cmd\.exe/i);
      }

      const invalidOutputMode = await inputConnector.request('v1/agents/run', {
        method: 'POST',
        token: session.sessionToken,
        body: { agentId: 'fixture', prompt: 'safe prompt', outputMode: 'unsafe' },
      });
      assert.equal(invalidOutputMode.status, 400);

      const invalidMcpBoolean = await inputConnector.request('v1/mcp/test', {
        method: 'POST',
        token: session.sessionToken,
        body: { endpoint: mcpServer.endpoint, allowPrivateNetwork: 'yes' },
      });
      assert.equal(invalidMcpBoolean.status, 400);
    } finally {
      await inputConnector.stop();
    }
  });

  test('known routes reject unsupported methods and all routes reject query strings', async () => {
    const unsupportedMethod = await connector.request('v1/agents/run', { method: 'PUT' });
    assert.equal(unsupportedMethod.status, 405);
    assert.match(unsupportedMethod.body.error.message, /method not allowed/i);

    const query = await connector.request('health?debug=true');
    assert.equal(query.status, 400);
    assert.match(query.body.error.message, /query strings and fragments/i);

    const encodedRoute = await connector.request('v1/%61gents/run');
    assert.equal(encodedRoute.status, 404);
  });

  test('startup rejects a weak configured master token', async () => {
    await assert.rejects(
      startConnectorHarness({ masterToken: 'too-short' }),
      /at least 32 bytes long and unpredictable/i,
    );
  });

  test('MCP destination validation blocks malformed, credentialed, insecure, private, and redirected targets', async () => {
    const ssrfConnector = await startConnectorHarness();
    const redirect = await startRedirectServerFixture('http://169.254.169.254/latest/meta-data');
    try {
      const fixturePort = new URL(mcpServer.endpoint).port;
      const cases = [
        { endpoint: 'file:///etc/passwd', status: 400 },
        { endpoint: 'http://example.com/mcp', status: 400 },
        { endpoint: 'https://user:password@example.com/mcp', status: 400 },
        { endpoint: 'https://example.com/mcp#credential', status: 400 },
        { endpoint: 'https://127.0.0.1:1/mcp', status: 403 },
        { endpoint: 'https://169.254.169.254/latest/meta-data', status: 403 },
        { endpoint: 'https://[::1]/mcp', status: 403 },
        { endpoint: `http://2130706433:${fixturePort}/mcp`, status: 403 },
      ];
      for (const scenario of cases) {
        const response = await ssrfConnector.request('v1/mcp/test', {
          method: 'POST',
          token: ssrfConnector.masterToken,
          body: { endpoint: scenario.endpoint, accessToken: 'ssrf-secret' },
        });
        assert.equal(response.status, scenario.status, scenario.endpoint);
        assert.doesNotMatch(JSON.stringify(response.body), /ssrf-secret/);
      }

      const approvedLoopback = await ssrfConnector.request('v1/mcp/test', {
        method: 'POST',
        token: ssrfConnector.masterToken,
        body: {
          endpoint: mcpServer.endpoint,
          accessToken: mcpServer.accessToken,
          allowPrivateNetwork: true,
        },
      });
      assert.equal(approvedLoopback.status, 200);

      const redirected = await ssrfConnector.request('v1/mcp/test', {
        method: 'POST',
        token: ssrfConnector.masterToken,
        body: { endpoint: redirect.endpoint, allowPrivateNetwork: true, accessToken: 'redirect-secret' },
      });
      assert.notEqual(redirected.status, 200);
      assert.doesNotMatch(JSON.stringify(redirected.body), /redirect-secret/);

      const connectorSource = await readFile(
        `${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`,
        'utf8',
      );
      const safeFetchSource = connectorSource.slice(
        connectorSource.indexOf('const createSafeMcpFetch ='),
        connectorSource.indexOf('const collectMcpPages ='),
      );
      assert.match(safeFetchSource, /initialDestination \|\|= destination/);
      assert.match(
        safeFetchSource,
        /if \(destination\.isPrivate && !initialDestination\.isPrivate\)[\s\S]*?Public MCP endpoints may not redirect to private or loopback destinations/,
      );
    } finally {
      await redirect.stop();
      await ssrfConnector.stop();
    }
  });

  test('MCP DNS resolution cannot outlive the operation deadline', async () => {
    const deadlineConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_MCP_REQUEST_TIMEOUT_MS: '80',
        ALGOGLYPH_TEST_DNS_DELAY_MS: '250',
      },
    });
    try {
      const endpoint = new URL(mcpServer.endpoint);
      endpoint.hostname = 'localhost';
      const response = await deadlineConnector.request('v1/mcp/test', {
        method: 'POST',
        token: deadlineConnector.masterToken,
        body: {
          endpoint: endpoint.toString(),
          accessToken: mcpServer.accessToken,
          allowPrivateNetwork: true,
        },
      });
      assert.equal(response.status, 504);
      assert.match(response.body.error.message, /time/i);
    } finally {
      await deadlineConnector.stop();
    }
  });

  test('approved MCP grants are owner-scoped, capped, and removed with their owning session', async () => {
    const lifecycleConnector = await startConnectorHarness();
    const cappedServers = [];
    try {
      const { session: firstSession } = await lifecycleConnector.pair();
      const firstApproval = await lifecycleConnector.request('v1/mcp/test', {
        method: 'POST',
        token: firstSession.sessionToken,
        body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken, allowPrivateNetwork: true },
      });
      assert.equal(firstApproval.status, 200);

      const { session: secondSession } = await lifecycleConnector.pair();
      const crossSession = await lifecycleConnector.request('v1/mcp/invoke', {
        method: 'POST',
        token: secondSession.sessionToken,
        body: {
          serverId: firstApproval.body.serverId,
          toolName: 'echo_for_test',
          arguments: { value: 'cross-session' },
          confirmed: true,
        },
      });
      assert.equal(crossSession.status, 404);

      const revoke = await lifecycleConnector.request('v1/session/revoke', {
        method: 'POST',
        token: firstSession.sessionToken,
        body: {},
      });
      assert.equal(revoke.status, 200);

      const revokedOwner = await lifecycleConnector.request('v1/mcp/invoke', {
        method: 'POST',
        token: firstSession.sessionToken,
        body: {
          serverId: firstApproval.body.serverId,
          toolName: 'echo_for_test',
          arguments: { value: 'revoked' },
          confirmed: true,
        },
      });
      assert.equal(revokedOwner.status, 401);

      const repeatedApproval = await lifecycleConnector.request('v1/mcp/test', {
        method: 'POST',
        token: lifecycleConnector.masterToken,
        body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken, allowPrivateNetwork: true },
      });
      const repeatedAgain = await lifecycleConnector.request('v1/mcp/test', {
        method: 'POST',
        token: lifecycleConnector.masterToken,
        body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken, allowPrivateNetwork: true },
      });
      assert.equal(repeatedApproval.status, 200);
      assert.equal(repeatedAgain.status, 200);
      assert.equal(repeatedAgain.body.serverId, repeatedApproval.body.serverId);

      const approvals = [];
      for (let index = 0; index < 5; index += 1) {
        const distinctServer = await startMcpServerFixture({ accessToken: `fixture-access-${index}` });
        cappedServers.push(distinctServer);
        const approval = await lifecycleConnector.request('v1/mcp/test', {
          method: 'POST',
          token: lifecycleConnector.masterToken,
          body: {
            endpoint: distinctServer.endpoint,
            accessToken: distinctServer.accessToken,
            allowPrivateNetwork: true,
          },
        });
        assert.equal(approval.status, 200);
        approvals.push(approval.body.serverId);
      }

      const evictedApproval = await lifecycleConnector.request('v1/mcp/invoke', {
        method: 'POST',
        token: lifecycleConnector.masterToken,
        body: {
          serverId: approvals[0],
          toolName: 'echo_for_test',
          arguments: { value: 'evicted' },
          confirmed: true,
        },
      });
      assert.equal(evictedApproval.status, 404);

      const newestApproval = await lifecycleConnector.request('v1/mcp/invoke', {
        method: 'POST',
        token: lifecycleConnector.masterToken,
        body: {
          serverId: approvals.at(-1),
          toolName: 'echo_for_test',
          arguments: { value: 'newest' },
          confirmed: true,
        },
      });
      assert.equal(newestApproval.status, 200);

      const connectorSource = await readFile(
        `${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`,
        'utf8',
      );
      assert.match(connectorSource, /deleteSession[\s\S]*stopOwnerResources/);
      assert.match(connectorSource, /removeApprovedServersForOwner/);
      assert.match(connectorSource, /pruneSessions[\s\S]{0,500}deleteSession\(token\)/);
      assert.match(connectorSource, /sessions\.size >= maxSessions[\s\S]{0,500}deleteSession\(oldest\[0\]\)/);
    } finally {
      await Promise.allSettled(cappedServers.map((server) => server.stop()));
      await lifecycleConnector.stop();
    }
  });

  test('agent admission is atomic and rejects a concurrent second run', async () => {
    const slowConnector = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: SLOW_AGENT_FIXTURE },
    });
    try {
      const { session } = await slowConnector.pair();
      const headers = {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${session.sessionToken}`,
        'Content-Type': 'application/json',
        Origin: slowConnector.allowedOrigin,
      };
      const first = await fetch(`${slowConnector.endpoint}/v1/agents/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ agentId: 'fixture', prompt: 'first', outputMode: 'stream' }),
      });
      assert.equal(first.status, 200);

      const second = await fetch(`${slowConnector.endpoint}/v1/agents/run`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ agentId: 'fixture', prompt: 'second', outputMode: 'stream' }),
      });
      assert.equal(second.status, 429);
      assert.match((await second.json()).error.message, /already in progress/i);
      assert.match(await first.text(), /slow-fixture-complete/);
    } finally {
      await slowConnector.stop();
    }
  });

  test('agent environment, MCP relay, cancellation, and temporary-directory cleanup remain isolated', async () => {
    const isolated = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_AGENT_FIXTURE: INSPECT_AGENT_FIXTURE,
        ALGOGLYPH_TEST_PARENT_SECRET: 'arbitrary-parent-secret',
        AWS_SECRET_ACCESS_KEY: 'aws-parent-secret',
        OPENAI_API_KEY: 'openai-parent-secret',
      },
    });
    try {
      const { session } = await isolated.pair();
      const approved = await isolated.request('v1/mcp/test', {
        method: 'POST',
        token: session.sessionToken,
        body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken, allowPrivateNetwork: true },
      });
      assert.equal(approved.status, 200);

      const withoutApproval = await runRawFixtureAgent(isolated, session.sessionToken, {});
      assert.equal(withoutApproval.status, 200);
      const plainInspection = JSON.parse(withoutApproval.events.find((event) => event.event === 'output').data.chunk);
      assert.deepEqual(plainInspection.leaks, {
        arbitraryParentSecret: false,
        awsSecret: false,
        connectorToken: false,
        openAiKey: false,
      });
      assert.equal(plainInspection.isolation.approvedMcpConfig, false);
      assert.equal(plainInspection.isolation.approvedMcpTokenPresent, false);
      assert.equal(plainInspection.isolation.userProfileIsCwd, true);
      assert.equal(plainInspection.isolation.tempIsCwd, true);
      assert.equal(await waitForPathRemoval(plainInspection.cwd), true);

      const withApproval = await runRawFixtureAgent(isolated, session.sessionToken, {
        mcpServerId: approved.body.serverId,
      });
      assert.equal(withApproval.status, 200);
      const relayInspection = JSON.parse(withApproval.events.find((event) => event.event === 'output').data.chunk);
      assert.equal(relayInspection.isolation.approvedMcpConfig, true);
      assert.equal(relayInspection.isolation.approvedMcpTokenPresent, true);
      assert.equal(relayInspection.isolation.approvedMcpUsesInternalRelay, true);
      assert.equal(relayInspection.isolation.approvedMcpTokenMatchesEnvironment, true);
      assert.equal(relayInspection.isolation.upstreamFixtureTokenPresent, false);
      assert.deepEqual(relayInspection.isolation.relayProbe, {
        attempted: true,
        listedTool: true,
        result: 'echo:relay-compatibility',
      });
      assert.equal(await waitForPathRemoval(relayInspection.cwd), true);

      const clientSource = await readFile(`${REPO_ROOT}/src/lib/mcp/connectorClient.ts`, 'utf8');
      assert.match(clientSource, /body:\s*JSON\.stringify\(request\)/);
      assert.doesNotMatch(clientSource, /approvedMcpServerId/);
    } finally {
      await isolated.stop();
    }

    const cancellable = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: HANGING_AGENT_FIXTURE },
    });
    try {
      const { session } = await cancellable.pair();
      const response = await fetch(`${cancellable.endpoint}/v1/agents/run`, {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${session.sessionToken}`,
          'Content-Type': 'application/json',
          Origin: cancellable.allowedOrigin,
        },
        body: JSON.stringify({ agentId: 'fixture', prompt: 'cancel me', outputMode: 'stream' }),
      });
      assert.equal(response.status, 200);
      const reader = response.body.getReader();
      const firstEvent = await readFirstSseEvent(reader);
      assert.equal(firstEvent.event, 'output');
      const inspection = JSON.parse(firstEvent.data.chunk);
      await reader.cancel();
      assert.equal(await waitForPathRemoval(inspection.cwd), true);
    } finally {
      await cancellable.stop();
    }
  });

  test('warm Antigravity reuses only one owner, returns only post-reset output, and awaits tree cleanup', async () => {
    const warmConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: WARM_ANTIGRAVITY_FIXTURE,
        ALGOGLYPH_TEST_ANTIGRAVITY_ELIGIBILITY_RETRY_DELAY_MS: '50',
      },
    });
    const descendantPids = new Set();
    try {
      const { session: firstSession } = await warmConnector.pair();
      const first = await runWarmAntigravity(
        warmConnector,
        firstSession.sessionToken,
        'WARM_REQUEST_ONE',
      );
      assert.equal(first.status, 200);
      assert.equal(first.output.marker, 'WARM_REQUEST_ONE');
      assert.equal(first.output.submissionCount, 1);
      assert.deepEqual(first.output.promptPolicy, {
        approvedToolsAvailable: false,
        denyAllTools: true,
        saysToolCallWillBeDenied: true,
      });
      descendantPids.add(first.output.descendantPid);

      const stalePartial = await runWarmAntigravity(
        warmConnector,
        firstSession.sessionToken,
        'WARM_REQUEST_STALE_PARTIAL',
      );
      assert.equal(stalePartial.status, 200);
      assert.equal(stalePartial.output.marker, 'WARM_REQUEST_STALE_PARTIAL');
      assert.equal(stalePartial.output.homeDirectory, first.output.homeDirectory);

      const eligibilityRetry = await runWarmAntigravity(
        warmConnector,
        firstSession.sessionToken,
        'WARM_REQUEST_ELIGIBILITY',
      );
      assert.equal(eligibilityRetry.status, 200);
      assert.equal(eligibilityRetry.output.marker, 'WARM_REQUEST_ELIGIBILITY');
      assert.equal(eligibilityRetry.output.submissionCount, 2);
      assert.ok(eligibilityRetry.output.retryElapsedMs >= 40);
      assert.equal(eligibilityRetry.output.homeDirectory, first.output.homeDirectory);

      const repeatedEligibilityRetry = await runWarmAntigravity(
        warmConnector,
        firstSession.sessionToken,
        'WARM_REQUEST_ELIGIBILITY_MULTIPLE',
      );
      assert.equal(repeatedEligibilityRetry.status, 200);
      assert.equal(repeatedEligibilityRetry.output.marker, 'WARM_REQUEST_ELIGIBILITY_MULTIPLE');
      assert.equal(repeatedEligibilityRetry.output.submissionCount, 4);
      assert.ok(repeatedEligibilityRetry.output.retryElapsedMs >= 120);
      assert.equal(repeatedEligibilityRetry.output.homeDirectory, first.output.homeDirectory);

      const second = await runWarmAntigravity(
        warmConnector,
        firstSession.sessionToken,
        'WARM_REQUEST_TWO',
      );
      assert.equal(second.status, 200);
      assert.equal(second.output.marker, 'WARM_REQUEST_TWO');
      assert.equal(second.output.submissionCount, 1);
      assert.equal(second.output.homeDirectory, first.output.homeDirectory);

      const { session: nextSession } = await warmConnector.pair();
      const nextOwner = await runWarmAntigravity(
        warmConnector,
        nextSession.sessionToken,
        'WARM_REQUEST_NEXT_OWNER',
      );
      assert.equal(nextOwner.status, 200);
      assert.equal(nextOwner.output.marker, 'WARM_REQUEST_NEXT_OWNER');
      assert.notEqual(nextOwner.output.homeDirectory, first.output.homeDirectory);
      descendantPids.add(nextOwner.output.descendantPid);
      assert.equal(await waitForPathRemoval(first.output.homeDirectory), true);
      assert.equal(await waitForProcessExit(first.output.descendantPid), true);

      const revoked = await warmConnector.request('v1/session/revoke', {
        method: 'POST',
        token: nextSession.sessionToken,
        body: {},
      });
      assert.equal(revoked.status, 200);
      assert.equal(await waitForPathRemoval(nextOwner.output.homeDirectory), true);
      assert.equal(await waitForProcessExit(nextOwner.output.descendantPid), true);
    } finally {
      await warmConnector.stop();
      for (const pid of descendantPids) {
        if (processIsAlive(pid)) {
          try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ }
        }
      }
    }
  });

  test('Antigravity provisions the current OAuth token into its isolated home', async () => {
    const sourceHome = await mkdtemp(join(tmpdir(), 'algoglyph-antigravity-auth-source-'));
    const authToken = 'fixture-antigravity-oauth-token';
    let authConnector;
    try {
      const authDirectory = join(sourceHome, '.gemini', 'antigravity-cli');
      await mkdir(authDirectory, { recursive: true });
      await writeFile(join(authDirectory, 'antigravity-oauth-token'), authToken, { mode: 0o600 });
      authConnector = await startConnectorHarness({
        environment: {
          NODE_ENV: 'test',
          HOME: sourceHome,
          USERPROFILE: sourceHome,
          ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: WARM_ANTIGRAVITY_FIXTURE,
          ALGOGLYPH_TEST_PROVISION_ANTIGRAVITY_CREDENTIALS: '1',
        },
      });
      const { session } = await authConnector.pair();
      const run = await runWarmAntigravity(
        authConnector,
        session.sessionToken,
        'WARM_REQUEST_AUTH_TOKEN',
      );
      assert.equal(run.status, 200);
      assert.equal(run.output.credentialIsolation.currentAuthTokenPresent, true);
      assert.equal(run.output.credentialIsolation.currentAuthTokenMatchesFixture, true);
    } finally {
      await authConnector?.stop();
      await rm(sourceHome, { recursive: true, force: true });
    }
  });

  test('macOS Antigravity uses isolated file auth without linking the login Keychain', {
    skip: process.platform !== 'darwin',
  }, async () => {
    const sourceHome = await mkdtemp(join(tmpdir(), 'algoglyph-antigravity-keychain-source-'));
    let keychainConnector;
    try {
      const keychainDirectory = join(sourceHome, 'Library', 'Keychains');
      await mkdir(keychainDirectory, { recursive: true });
      await writeFile(join(keychainDirectory, 'login.keychain-db'), 'fixture-login-keychain', { mode: 0o600 });
      keychainConnector = await startConnectorHarness({
        environment: {
          NODE_ENV: 'test',
          HOME: sourceHome,
          USERPROFILE: sourceHome,
          ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: WARM_ANTIGRAVITY_FIXTURE,
          ALGOGLYPH_TEST_PROVISION_ANTIGRAVITY_CREDENTIALS: '1',
        },
      });
      const { session } = await keychainConnector.pair();
      const run = await runWarmAntigravity(
        keychainConnector,
        session.sessionToken,
        'WARM_REQUEST_MACOS_KEYCHAIN',
      );
      assert.equal(run.status, 200);
      assert.equal(run.output.credentialIsolation.currentAuthTokenPresent, false);
      assert.equal(run.output.credentialIsolation.fileStorageForced, true);
      assert.equal(run.output.credentialIsolation.timezoneIsUtc, true);
      assert.equal(run.output.credentialIsolation.macOsLoginKeychainPresent, false);
    } finally {
      await keychainConnector?.stop();
      await rm(sourceHome, { recursive: true, force: true });
    }
  });

  test('Antigravity reports an interactive sign-in requirement without waiting for readiness timeout', async () => {
    const unauthenticatedConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: UNAUTHENTICATED_ANTIGRAVITY_FIXTURE,
        ALGOGLYPH_TEST_ANTIGRAVITY_READY_TIMEOUT_MS: '1000',
      },
    });
    try {
      const { session } = await unauthenticatedConnector.pair();
      const startedAt = performance.now();
      const run = await runWarmAntigravity(
        unauthenticatedConnector,
        session.sessionToken,
        'WARM_REQUEST_UNAUTHENTICATED',
      );
      assert.equal(run.status, 503);
      assert.ok(performance.now() - startedAt < 750);
      assert.match(run.error?.error?.message || '', /sign in to Antigravity CLI/i);
    } finally {
      await unauthenticatedConnector.stop();
    }
  });

  test('Antigravity allows silent sign-in recovery to finish before requiring interaction', async () => {
    const signingInConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: SIGNING_IN_ANTIGRAVITY_FIXTURE,
        ALGOGLYPH_TEST_ANTIGRAVITY_READY_TIMEOUT_MS: '1000',
      },
    });
    try {
      const { session } = await signingInConnector.pair();
      const run = await runWarmAntigravity(
        signingInConnector,
        session.sessionToken,
        'WARM_REQUEST_SILENT_SIGN_IN',
      );
      assert.equal(run.status, 200);
      assert.equal(run.output.marker, 'WARM_REQUEST_SILENT_SIGN_IN');
    } finally {
      await signingInConnector.stop();
    }
  });

  test('an owner request recovers from a failed background Antigravity prewarm and remains warm', async () => {
    const stateDirectory = await mkdtemp(join(tmpdir(), 'algoglyph-antigravity-recovery-test-'));
    const stateFile = join(stateDirectory, 'attempt.txt');
    let recoveryConnector;
    try {
      recoveryConnector = await startConnectorHarness({
        environment: {
          NODE_ENV: 'test',
          ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: RECOVERING_ANTIGRAVITY_FIXTURE,
          ALGOGLYPH_TEST_PREWARM_ANTIGRAVITY: '1',
          ALGOGLYPH_TEST_ANTIGRAVITY_READY_TIMEOUT_MS: '1000',
          ALGOGLYPH_TEST_ANTIGRAVITY_STATE_FILE: stateFile,
        },
      });

      // Enter the precise race window: the connector has published its global
      // prewarm session, but that session has not and will not become ready.
      const prewarmState = await waitForJsonFile(
        stateFile,
        (value) => value.phase === 'prewarm-started',
      );
      assert.equal(typeof prewarmState?.prewarmHomeDirectory, 'string');

      const { session } = await recoveryConnector.pair();
      const recovered = await runWarmAntigravity(
        recoveryConnector,
        session.sessionToken,
        'RECOVERY_REQUEST_ONE',
      );
      assert.equal(recovered.status, 200);
      assert.equal(recovered.output.marker, 'RECOVERY_REQUEST_ONE');
      const healthyState = await waitForJsonFile(
        stateFile,
        (value) => value.phase === 'healthy-started',
      );
      assert.equal(typeof healthyState?.healthyHomeDirectory, 'string');
      assert.notEqual(healthyState.healthyHomeDirectory, prewarmState.prewarmHomeDirectory);
      assert.equal(await waitForPathRemoval(prewarmState.prewarmHomeDirectory), true);

      const followUp = await runWarmAntigravity(
        recoveryConnector,
        session.sessionToken,
        'RECOVERY_REQUEST_TWO',
      );
      assert.equal(followUp.status, 200);
      assert.equal(followUp.output.marker, 'RECOVERY_REQUEST_TWO');
      assert.equal(followUp.output.homeDirectory, recovered.output.homeDirectory);
    } finally {
      await recoveryConnector?.stop();
      await rm(stateDirectory, { recursive: true, force: true });
    }
  });

  test('Antigravity receives an approved relay only through its isolated current MCP config', async () => {
    const relayConnector = await startConnectorHarness({
      environment: {
        NODE_ENV: 'test',
        ALGOGLYPH_TEST_ANTIGRAVITY_FIXTURE: WARM_ANTIGRAVITY_FIXTURE,
      },
    });
    const descendantPids = new Set();
    try {
      const { session } = await relayConnector.pair();
      const approved = await relayConnector.request('v1/mcp/test', {
        method: 'POST',
        token: session.sessionToken,
        body: {
          endpoint: mcpServer.endpoint,
          accessToken: mcpServer.accessToken,
          allowPrivateNetwork: true,
        },
      });
      assert.equal(approved.status, 200);

      const run = await runWarmAntigravity(
        relayConnector,
        session.sessionToken,
        'WARM_REQUEST_MCP_CONFIG',
        approved.body.serverId,
      );
      assert.equal(run.status, 200);
      assert.equal(run.output.marker, 'WARM_REQUEST_MCP_CONFIG');
      descendantPids.add(run.output.descendantPid);
      assert.deepEqual(run.output.promptPolicy, {
        approvedToolsAvailable: true,
        denyAllTools: false,
        saysToolCallWillBeDenied: false,
      });
      assert.deepEqual(run.output.mcpIsolation, {
        currentConfigPresent: true,
        currentServerUrlIsLoopback: true,
        authorizationHeaderPresent: true,
        authorizationMatchesIsolatedRelay: true,
        legacyMcpServersPresent: false,
        legacyHttpUrlPresent: false,
        exactMcpPermissionPresent: true,
        broadMcpPermissionPresent: false,
      });
    } finally {
      await relayConnector.stop();
      for (const pid of descendantPids) {
        if (processIsAlive(pid)) {
          try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ }
        }
      }
    }
  });

  test('production Codex adapter disables local, open-world, hook, and subagent tools', async () => {
    const connectorSource = await readFile(
      `${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`,
      'utf8',
    );
    assert.match(connectorSource, /const CODEX_SECURITY_CONFIG_ARGS = \[[\s\S]*?'features\.shell_tool=false'/);
    assert.match(connectorSource, /const CODEX_SECURITY_CONFIG_ARGS = \[[\s\S]*?'features\.unified_exec=false'/);
    assert.match(connectorSource, /const CODEX_SECURITY_CONFIG_ARGS = \[[\s\S]*?'features\.apps=false'/);
    assert.match(connectorSource, /const CODEX_SECURITY_CONFIG_ARGS = \[[\s\S]*?'features\.multi_agent=false'/);
    assert.match(connectorSource, /const CODEX_SECURITY_CONFIG_ARGS = \[[\s\S]*?'features\.hooks=false'/);
    assert.match(connectorSource, /const CODEX_SECURITY_CONFIG_ARGS = \[[\s\S]*?'web_search="disabled"'/);
    assert.match(connectorSource, /id: 'codex'[\s\S]*?\.\.\.CODEX_SECURITY_CONFIG_ARGS/);
    assert.match(connectorSource, /id: 'codex'[\s\S]*?'--ignore-rules'/);
    assert.match(connectorSource, /default_permissions = "algoglyph_connector"/);
    assert.match(connectorSource, /filesystem = \{ ":root" = "deny" \}/);
    assert.match(connectorSource, /\[shell_environment_policy\][\s\S]*?inherit = "none"/);
    assert.match(connectorSource, /if \(copiedFileCredential\) delete environment\.OPENAI_API_KEY/);
    assert.match(connectorSource, /'app-server', '--listen', 'stdio:\/\/', '--strict-config'/);
    assert.match(connectorSource, /requestCodexAppServer\(session, 'thread\/start'[\s\S]*?approvalPolicy: 'never'[\s\S]*?ephemeral: true/);
    assert.match(connectorSource, /requestCodexAppServer\(session, 'turn\/start'[\s\S]*?approvalPolicy: 'never'/);
    assert.match(connectorSource, /requestCodexAppServer\(session, 'thread\/unsubscribe'/);
    assert.match(connectorSource, /Codex app-server unavailable; using isolated one-shot fallback/);
  });

  test('Claude adapter exposes no built-ins and auto-approves only exact per-run MCP tools', async () => {
    const connectorSource = await readFile(
      `${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`,
      'utf8',
    );
    assert.match(
      connectorSource,
      /id: 'claude'[\s\S]*?runArgs: \['-p', '--tools', '', '--permission-mode', 'dontAsk', '--no-session-persistence'\]/,
    );
    assert.match(connectorSource, /id: 'claude'[\s\S]*?inheritProfileEnvironment: true/);
    assert.match(
      connectorSource,
      /if \(agent\.inheritProfileEnvironment\)[\s\S]*?environment\.CLAUDE_CODE_SAFE_MODE = '1'/,
    );
    assert.match(
      connectorSource,
      /if \(agent\.inheritProfileEnvironment\)[\s\S]*?delete environment\.CLAUDE_CONFIG_DIR/,
    );
    assert.match(connectorSource, /if \(agent\.id === 'claude'\)[\s\S]*?`mcp__\$\{name\}__\$\{tool\.name\}`/);
    assert.match(
      connectorSource,
      /extraArgs: \['--mcp-config', configPath, '--strict-mcp-config', '--allowedTools', \.\.\.allowedTools\]/,
    );
    assert.doesNotMatch(connectorSource, /mcp__\$\{name\}__\*/);
    assert.doesNotMatch(
      connectorSource,
      /const allowedTools = server\.summary\.tools\s*\.map\([^;]+\)\s*\.join\(/,
    );
  });
});

describe('security remediation contract', () => {
  test('Stage 3: Host, browser endpoint, SSRF, redirect, credential, and response policies are enforced', async () => {
    const token = connector.masterToken;
    assert.equal(await requestWithHost(connector.endpoint, 'attacker.example'), 403);

    const blockedPrivate = await connector.request('v1/mcp/test', {
      method: 'POST',
      token,
      body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken },
    });
    assert.equal(blockedPrivate.status, 403);

    const clientSource = await readFile(`${REPO_ROOT}/src/lib/mcp/connectorClient.ts`, 'utf8');
    const connectorSource = await readFile(`${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`, 'utf8');
    assert.match(clientSource, /connector must run on this device \(loopback only\)/);
    assert.match(connectorSource, /redirect: 'manual'/);
    assert.match(connectorSource, /currentUrl\.origin === originalOrigin/);
    assert.match(connectorSource, /dispatcher/);
    assert.match(connectorSource, /MAX_MCP_RESPONSE_BYTES/);
  });

  test('Stages 4/6: agent runs use an isolated cwd/env and connector-side approved MCP configuration', async () => {
    const isolated = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: INSPECT_AGENT_FIXTURE },
    });
    try {
      const { session } = await isolated.pair();
      const approved = await isolated.request('v1/mcp/test', {
        method: 'POST',
        token: session.sessionToken,
        body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken, allowPrivateNetwork: true },
      });
      assert.equal(approved.status, 200);
      const run = await runRawFixtureAgent(isolated, session.sessionToken, { mcpServerId: approved.body.serverId });
      assert.equal(run.status, 200);
      const output = run.events.find((event) => event.event === 'output');
      const inspection = JSON.parse(output.data.chunk);
      assert.match(inspection.cwd, /algoglyph-agent-/);
      assert.deepEqual(inspection.argv, []);
      assert.equal(inspection.environment.ALGOGLYPH_CONNECTOR_TOKEN, undefined);
      assert.equal(inspection.isolation.userProfileIsCwd, true);
      assert.equal(inspection.isolation.approvedMcpConfig, true);
      assert.equal(inspection.isolation.approvedMcpTokenPresent, true);
      assert.equal(run.events.at(-1).event, 'exit');
      assert.equal(run.events.at(-1).data.code, 0);
    } finally {
      await isolated.stop();
    }
  });

  test('Stages 4/5: fixed adapters, process-tree shutdown, failures, truncation, and strict client streams are enforced', async () => {
    const failing = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: FAILING_AGENT_FIXTURE },
    });
    try {
      const { session } = await failing.pair();
      const run = await runRawFixtureAgent(failing, session.sessionToken, {});
      assert.equal(run.events.some((event) => event.event === 'error' && /code 7/.test(event.data.message)), true);
      assert.equal(run.events.at(-1).data.code, 7);
    } finally {
      await failing.stop();
    }

    const unauthenticated = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: UNAUTHENTICATED_AGENT_FIXTURE },
    });
    try {
      const { session } = await unauthenticated.pair();
      const run = await runRawFixtureAgent(unauthenticated, session.sessionToken, {});
      assert.equal(run.events.some((event) => (
        event.event === 'error'
        && /Claude Code is not authenticated.*claude auth login/i.test(event.data.message)
      )), true);
      assert.equal(run.events.at(-1).data.code, 1);
    } finally {
      await unauthenticated.stop();
    }

    const oversized = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: OVERSIZED_AGENT_FIXTURE },
    });
    try {
      const { session } = await oversized.pair();
      const run = await runRawFixtureAgent(oversized, session.sessionToken, {});
      assert.equal(run.events.some((event) => event.event === 'error' && /output safety limit/.test(event.data.message)), true);
    } finally {
      await oversized.stop();
    }

    const connectorSource = await readFile(`${REPO_ROOT}/packages/mcp-connector/bin/algoglyph-mcp-connector.mjs`, 'utf8');
    const clientSource = await readFile(`${REPO_ROOT}/src/lib/mcp/connectorClient.ts`, 'utf8');
    const dialogSource = await readFile(`${REPO_ROOT}/src/components/McpConnectDialog.tsx`, 'utf8');
    assert.match(connectorSource, /taskkill\.exe.*\/T.*\/F/s);
    assert.match(connectorSource, /resolveAgentInvocation/);
    assert.match(connectorSource, /--sandbox/);
    assert.match(connectorSource, /runArgs: \['--sandbox', '--disable-slash-commands', '-p'\]/);
    assert.match(connectorSource, /ptyRuntime\.spawn\(invocation\.command, invocationArgs\(/);
    assert.match(connectorSource, /session\.pty\.write\('\/clear\\r'\)/);
    assert.doesNotMatch(connectorSource, /agy models/);
    const antigravityWaitSource = connectorSource.slice(
      connectorSource.indexOf('const waitForAntigravity ='),
      connectorSource.indexOf('const stopAntigravitySession ='),
    );
    assert.match(antigravityWaitSource, /monotonicMilliseconds\(\)/);
    assert.doesNotMatch(antigravityWaitSource, /Date\.now\(\)/);
    assert.match(connectorSource, /eligibilityRetryAt \|\|= monotonicMilliseconds\(\)/);
    assert.match(connectorSource, /expiresAtMonotonic: monotonicMilliseconds\(\) \+ PAIRING_TTL_MS/);
    assert.match(connectorSource, /timestamps\.push\(monotonicMilliseconds\(\)\)/);
    assert.match(connectorSource, /session\.expiresAtMonotonic <= now/);
    assert.match(connectorSource, /server\.expiresAtMonotonic <= now/);
    assert.doesNotMatch(connectorSource, /\.expiresAt\s*<=\s*Date\.now\(\)/);
    assert.doesNotMatch(connectorSource, /timestamps\.push\(Date\.now\(\)\)/);
    assert.match(clientSource, /MAX_SSE_BUFFER_BYTES/);
    assert.match(clientSource, /AGENT_RUN_WATCHDOG_MS/);
    assert.match(clientSource, /watchdogController/);
    assert.match(clientSource, /ended without a terminal event/);
    assert.match(clientSource, /useMcpStore\.getState\(\)\.failAgentRun/);
    assert.match(dialogSource, /useMcpStore\.getState\(\)\.connectorToken/);
    const dialogConnectionEffect = dialogSource.slice(
      dialogSource.indexOf('useEffect(() => {\n    const initialState'),
      dialogSource.indexOf('  const checkConnector = async'),
    );
    assert.match(dialogConnectionEffect, /inspectMcpConnector/);
    assert.doesNotMatch(dialogConnectionEffect, /connectionState === 'ready'\) return/);
  });

  test('Stage 6: raw MCP credentials and unapproved server IDs cannot be supplied to agents', async () => {
    const fixture = await startConnectorHarness({
      environment: { NODE_ENV: 'test', ALGOGLYPH_TEST_AGENT_FIXTURE: INSPECT_AGENT_FIXTURE },
    });
    try {
      const { session } = await fixture.pair();
      const raw = await fixture.request('v1/agents/run', {
        method: 'POST',
        token: session.sessionToken,
        body: { agentId: 'fixture', prompt: 'test', mcpServer: { endpoint: mcpServer.endpoint, accessToken: 'secret' } },
      });
      assert.equal(raw.status, 400);
      assert.doesNotMatch(JSON.stringify(raw.body), /secret/);
    } finally {
      await fixture.stop();
    }
  });

  test('Stage 7: explorer details and confirmed tool invocation work through the approved server', async () => {
    const token = connector.masterToken;
    const inspected = await connector.request('v1/mcp/test', {
      method: 'POST',
      token,
      body: { endpoint: mcpServer.endpoint, accessToken: mcpServer.accessToken, allowPrivateNetwork: true },
    });
    assert.equal(inspected.status, 200);
    assert.equal(inspected.body.resources[0].uri, 'fixture://guide');
    assert.equal(inspected.body.prompts[0].name, 'fixture_prompt');
    assert.equal(inspected.body.tools[0].inputSchema.type, 'object');

    const denied = await connector.request('v1/mcp/invoke', {
      method: 'POST', token,
      body: { serverId: inspected.body.serverId, toolName: 'echo_for_test', arguments: { value: 'hi' } },
    });
    assert.equal(denied.status, 400);
    const invoked = await connector.request('v1/mcp/invoke', {
      method: 'POST', token,
      body: { serverId: inspected.body.serverId, toolName: 'echo_for_test', arguments: { value: 'hi' }, confirmed: true },
    });
    assert.equal(invoked.status, 200);
    assert.equal(invoked.body.content[0].text, 'echo:hi');
  });

  test('Stage 8: Electron origin, CSP, script isolation, docs, license, and tarball inventory agree', async () => {
    const mainSource = await readFile(`${REPO_ROOT}/main.cjs`, 'utf8');
    const docs = await readFile(`${REPO_ROOT}/docs/mcp-connector.md`, 'utf8');
    const packageReadme = await readFile(`${REPO_ROOT}/packages/mcp-connector/README.md`, 'utf8');
    const packageLicense = await readFile(`${REPO_ROOT}/packages/mcp-connector/LICENSE`, 'utf8');
    const packageNotice = await readFile(`${REPO_ROOT}/packages/mcp-connector/NOTICE`, 'utf8');
    const packageJson = JSON.parse(await readFile(`${REPO_ROOT}/packages/mcp-connector/package.json`, 'utf8'));
    const reviewLock = JSON.parse(await readFile(`${REPO_ROOT}/packages/mcp-connector/package-lock.json`, 'utf8'));
    assert.match(mainSource, /app:\/\/algoglyph/);
    assert.match(mainSource, /Content-Security-Policy/);
    assert.match(mainSource, /contextIsolation: true/);
    assert.match(mainSource, /nodeIntegration: false/);
    assert.doesNotMatch(docs, /quick-connect link/i);
    assert.doesNotMatch(packageReadme, /credentials.*link is opened/i);
    assert.equal(packageJson.license, 'Apache-2.0');
    assert.match(packageLicense, /Apache License\s+Version 2\.0, January 2004/);
    assert.match(packageNotice, /Copyright 2026 AlgoGlyph contributors/);
    assert.equal(reviewLock.version, packageJson.version);
    assert.deepEqual(reviewLock.packages[''].dependencies, packageJson.dependencies);
    assert.deepEqual(packageJson.files.sort(), [
      'LICENSE', 'NOTICE', 'README.md',
      'bin/algoglyph-mcp-connector.js', 'bin/algoglyph-mcp-connector.mjs', 'bin/cli-runtime.mjs',
    ].sort());
  });
});
