import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { fileURLToPath } from 'node:url';
import { after, before, describe, test } from 'node:test';
import { startConnectorHarness, startMcpServerFixture } from './helpers/connectorHarness.mjs';

const ALLOWED_ORIGIN = 'https://algoglyph.com';
const BLOCKED_ORIGIN = 'https://attacker.example';
const ALL_SESSION_SCOPES = ['catalog:read', 'mcp:test', 'mcp:invoke', 'agent:run', 'session:revoke'];
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const CHUNKED_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/chunkedAgent.mjs', import.meta.url));
const INSPECT_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/inspectAgent.mjs', import.meta.url));
const FAILING_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/failingAgent.mjs', import.meta.url));
const OVERSIZED_AGENT_FIXTURE = fileURLToPath(new URL('./fixtures/oversizedAgent.mjs', import.meta.url));
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

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
      version: '0.1.0',
      protocolVersion: 1,
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
    assert.match(connectorSource, /resolveAgentExecutable/);
    assert.match(connectorSource, /--sandbox/);
    assert.match(connectorSource, /runArgs: \['--sandbox', '--disable-slash-commands', '-p'\]/);
    assert.match(clientSource, /MAX_SSE_BUFFER_BYTES/);
    assert.match(clientSource, /ended without a terminal event/);
    assert.match(clientSource, /useMcpStore\.getState\(\)\.failAgentRun/);
    assert.match(dialogSource, /useMcpStore\.getState\(\)\.connectorToken/);
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
    const packageJson = JSON.parse(await readFile(`${REPO_ROOT}/packages/mcp-connector/package.json`, 'utf8'));
    assert.match(mainSource, /app:\/\/algoglyph/);
    assert.match(mainSource, /Content-Security-Policy/);
    assert.match(mainSource, /contextIsolation: true/);
    assert.match(mainSource, /nodeIntegration: false/);
    assert.doesNotMatch(docs, /quick-connect link/i);
    assert.doesNotMatch(packageReadme, /credentials.*link is opened/i);
    assert.equal(packageJson.license, 'UNLICENSED');
    assert.deepEqual(packageJson.files.sort(), [
      'README.md', 'bin/algoglyph-mcp-connector.js', 'bin/algoglyph-mcp-connector.mjs',
    ].sort());
  });
});
