import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
};

const waitFor = async (predicate, message) => {
  const deadline = Date.now() + 1_500;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 5));
  }
  assert.fail(message);
};

let vite;
let originalFetch;
let stopConnectionManager;
let useMcpStore;
let connectorRunning = true;
let nextSession = 0;
let pairingCount = 0;
const sessions = new Set();

const jsonResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

before(async () => {
  originalFetch = globalThis.fetch;
  globalThis.window = {
    location: { href: 'http://localhost:5173/workspace' },
    history: { replaceState: () => undefined },
    localStorage: createStorage(),
    sessionStorage: createStorage(),
    setTimeout: (callback, delay) => setTimeout(callback, Math.min(delay, 10)),
    clearTimeout,
  };
  globalThis.document = { title: 'AlgoGlyph' };
  globalThis.fetch = async (input, init = {}) => {
    if (!connectorRunning) throw new TypeError('connector unavailable');
    const path = new URL(String(input)).pathname;
    const headers = new Headers(init.headers);
    const bearer = headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

    if (path === '/health') {
      return jsonResponse({
        service: 'algoglyph-local-connector',
        status: 'ready',
        version: '0.2.5',
        protocolVersion: 2,
        requiresToken: true,
      });
    }
    if (path === '/v1/pairings') {
      pairingCount += 1;
      return jsonResponse({
        pairingToken: `pairing-${pairingCount}`,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        ttlSeconds: 60,
        scopes: ['catalog:read', 'agent:run', 'session:revoke'],
      });
    }
    if (path === '/v1/session') {
      const sessionToken = `session-${++nextSession}`;
      sessions.add(sessionToken);
      return jsonResponse({
        sessionToken,
        tokenType: 'Bearer',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        idleTimeoutSeconds: 60,
        scopes: ['catalog:read', 'agent:run', 'session:revoke'],
      });
    }
    if (path === '/v1/session/revoke') {
      sessions.delete(bearer);
      return jsonResponse({ revoked: true });
    }
    if (path === '/v1/catalog') {
      if (!bearer || !sessions.has(bearer)) {
        return jsonResponse({ error: { message: 'invalid connector session' } }, 401);
      }
      return jsonResponse({
        agents: [{ id: 'codex', label: 'Codex CLI', command: 'codex', available: true }],
        capabilities: { remoteMcpTest: true, agentExecution: true },
      });
    }
    return jsonResponse({ error: { message: 'not found' } }, 404);
  };

  vite = await createServer({
    root: REPO_ROOT,
    appType: 'custom',
    configFile: false,
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true },
  });
  ({ useMcpStore } = await vite.ssrLoadModule('/src/store/mcpStore.ts'));
  const { startMcpConnectionBootstrap } = await vite.ssrLoadModule('/src/lib/mcp/bootstrap.ts');
  stopConnectionManager = startMcpConnectionBootstrap();
});

after(async () => {
  stopConnectionManager?.();
  await vite?.close();
  globalThis.fetch = originalFetch;
  delete globalThis.window;
  delete globalThis.document;
});

test('normal connection, unexpected loss/recovery, and intentional disconnect use one manager', async () => {
  await waitFor(
    () => useMcpStore.getState().connectionState === 'ready',
    'the initial automatic connection did not become ready',
  );
  assert.ok(useMcpStore.getState().connectorToken);
  assert.equal(useMcpStore.getState().connectorCatalog.agents[0].id, 'codex');

  connectorRunning = false;
  await waitFor(
    () => useMcpStore.getState().connectionState === 'not-found',
    'connector termination did not clear the ready state',
  );
  assert.equal(useMcpStore.getState().connectorToken, null);
  assert.equal(useMcpStore.getState().connectorCatalog, null);

  connectorRunning = true;
  await waitFor(
    () => useMcpStore.getState().connectionState === 'ready',
    'the connection manager did not recover after connector restart',
  );

  const pairingsBeforeDisconnect = pairingCount;
  const state = useMcpStore.getState();
  state.setIntentionalDisconnect(true);
  state.setConnectorToken(null);
  state.setConnectionState('idle');
  await new Promise((resolveWait) => setTimeout(resolveWait, 80));
  assert.equal(useMcpStore.getState().connectionState, 'idle');
  assert.equal(useMcpStore.getState().connectorToken, null);
  assert.equal(pairingCount, pairingsBeforeDisconnect);

  useMcpStore.getState().setConnectionState('searching');
  useMcpStore.getState().setIntentionalDisconnect(false);
  await waitFor(
    () => useMcpStore.getState().connectionState === 'ready',
    'an explicit reconnect did not restore the connection',
  );
  assert.equal(pairingCount, pairingsBeforeDisconnect + 1);
});
