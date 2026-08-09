import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const CONNECTOR_ENTRY = resolve(TEST_DIR, '../../bin/algoglyph-mcp-connector.mjs');
const READY_TIMEOUT_MS = 10_000;
const STOP_TIMEOUT_MS = 5_000;

const reserveLoopbackPort = () =>
  new Promise((resolvePort, reject) => {
    const server = createNetServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not reserve a connector test port.'));
        return;
      }
      server.close((error) => {
        if (error) reject(error);
        else resolvePort(address.port);
      });
    });
  });

const listenOnLoopback = (server, port) =>
  new Promise((resolveListening, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      resolveListening();
    });
  });

const closeServer = (server) =>
  new Promise((resolveClosed, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolveClosed();
    });
  });

const readFixtureBody = (request) =>
  new Promise((resolveBody, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.once('error', reject);
    request.once('end', () => {
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });
  });

const createFixtureProtocolServer = () => {
  const server = new Server(
    { name: 'algoglyph-test-mcp-server', version: '1.2.3' },
    { capabilities: { tools: {}, resources: {}, prompts: {} } },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'echo_for_test',
        title: 'Echo for test',
        description: 'Returns deterministic fixture text.',
        inputSchema: {
          type: 'object',
          properties: { value: { type: 'string' } },
          required: ['value'],
        },
      },
    ],
  }));
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [{ uri: 'fixture://guide', name: 'Fixture guide', mimeType: 'text/plain' }],
  }));
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [{ name: 'fixture_prompt', description: 'A deterministic fixture prompt.' }],
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => ({
    content: [{ type: 'text', text: `echo:${request.params.arguments?.value ?? ''}` }],
  }));
  return server;
};

export const startMcpServerFixture = async ({ accessToken = 'fixture-mcp-access-token' } = {}) => {
  const port = await reserveLoopbackPort();
  const server = createHttpServer(async (request, response) => {
    if (request.url !== '/mcp' || request.method !== 'POST') {
      response.writeHead(405, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Method not allowed.' }));
      return;
    }
    if (request.headers.authorization !== `Bearer ${accessToken}`) {
      response.writeHead(401, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Unauthorized.' }));
      return;
    }

    let protocolServer;
    let transport;
    try {
      const body = await readFixtureBody(request);
      protocolServer = createFixtureProtocolServer();
      transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await protocolServer.connect(transport);
      await transport.handleRequest(request, response, body);
    } catch {
      if (!response.headersSent) response.writeHead(500, { 'Content-Type': 'application/json' });
      if (!response.writableEnded) response.end(JSON.stringify({ error: 'Fixture request failed.' }));
    } finally {
      await transport?.close().catch(() => undefined);
      await protocolServer?.close().catch(() => undefined);
    }
  });

  await listenOnLoopback(server, port);
  return {
    accessToken,
    endpoint: `http://127.0.0.1:${port}/mcp`,
    stop: () => closeServer(server),
  };
};

const waitForReady = (child) =>
  new Promise((resolveReady, reject) => {
    let stderr = '';
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Connector did not become ready.\n${stderr}`));
    }, READY_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timer);
      child.stderr?.off('data', onData);
      child.off('exit', onExit);
      child.off('error', onError);
    };
    const onData = (chunk) => {
      stderr += chunk.toString('utf8');
      if (stderr.includes('Listening on http://127.0.0.1:')) {
        cleanup();
        resolveReady(stderr);
      }
    };
    const onExit = (code, signal) => {
      cleanup();
      reject(new Error(`Connector exited before startup (code=${code}, signal=${signal}).\n${stderr}`));
    };
    const onError = (error) => {
      cleanup();
      reject(error);
    };

    child.stderr?.on('data', onData);
    child.once('exit', onExit);
    child.once('error', onError);
  });

const waitForExit = (child, timeoutMs) =>
  new Promise((resolveExit) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolveExit(true);
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      resolveExit(false);
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      child.off('exit', onExit);
    };
    const onExit = () => {
      cleanup();
      resolveExit(true);
    };
    child.once('exit', onExit);
  });

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const startConnectorHarness = async ({
  allowedOrigin = 'https://algoglyph.com',
  masterToken = 'algoglyph-integration-test-master-token',
  environment = {},
} = {}) => {
  const port = await reserveLoopbackPort();
  const workingDirectory = await mkdtemp(join(tmpdir(), 'algoglyph-mcp-test-'));
  const child = spawn(process.execPath, [CONNECTOR_ENTRY], {
    cwd: workingDirectory,
    env: {
      ...process.env,
      ...environment,
      ALGOGLYPH_CONNECTOR_PORT: String(port),
      ALGOGLYPH_CONNECTOR_TOKEN: masterToken,
      ALGOGLYPH_ALLOWED_ORIGINS: '',
      ALGOGLYPH_DEV_ORIGINS: '0',
    },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let startupOutput;
  try {
    startupOutput = await waitForReady(child);
  } catch (error) {
    child.kill('SIGKILL');
    await rm(workingDirectory, { recursive: true, force: true });
    throw error;
  }

  const endpoint = `http://127.0.0.1:${port}`;

  const request = async (
    path,
    {
      method = 'GET',
      origin = allowedOrigin,
      token,
      body,
      rawBody,
      headers: extraHeaders = {},
    } = {},
  ) => {
    const headers = new Headers(extraHeaders);
    if (origin !== null) headers.set('Origin', origin);
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let requestBody;
    if (rawBody !== undefined) {
      requestBody = rawBody;
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    } else if (body !== undefined) {
      requestBody = JSON.stringify(body);
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(new URL(path, `${endpoint}/`), {
      method,
      headers,
      body: requestBody,
    });

    return {
      status: response.status,
      headers: response.headers,
      body: await parseResponseBody(response),
    };
  };

  const pair = async () => {
    const pairing = await request('v1/pairings', { method: 'POST', body: {} });
    if (pairing.status !== 200 || typeof pairing.body?.pairingToken !== 'string') {
      throw new Error(`Could not create a pairing credential: ${JSON.stringify(pairing.body)}`);
    }
    const session = await request('v1/session', {
      method: 'POST',
      body: { pairingToken: pairing.body.pairingToken },
    });
    if (session.status !== 200 || typeof session.body?.sessionToken !== 'string') {
      throw new Error(`Could not redeem a pairing credential: ${JSON.stringify(session.body)}`);
    }
    return { pairing: pairing.body, session: session.body };
  };

  const stop = async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    if (!(await waitForExit(child, STOP_TIMEOUT_MS))) {
      child.kill('SIGKILL');
      await waitForExit(child, STOP_TIMEOUT_MS);
    }
    await rm(workingDirectory, { recursive: true, force: true });
  };

  return { allowedOrigin, child, endpoint, masterToken, pair, request, startupOutput, stop };
};
