import { useMcpStore } from '../../store/mcpStore';
import {
  McpConnectorRequestError,
  inspectMcpConnector,
  normalizeConnectorEndpoint,
  pairMcpConnector,
  revokeMcpConnectorSession,
} from './connectorClient';
import type { McpPairedConnectorSnapshot } from './types';
import { BillingRequestError } from '../billing/billingClient';
import type { BillingApiTokens } from '../billing/types';
import {
  readBrowserLoopbackPermission,
  requiresBrowserLoopbackPermission,
} from './localNetworkAccess';

let connectionUrlScrubbed = false;
const BACKGROUND_RETRY_DELAYS_MS = [1_500, 3_000, 5_000, 8_000, 12_000, 20_000] as const;
const CONNECTED_HEALTH_CHECK_INTERVAL_MS = 4_000;
type BootstrapOutcome = 'ready' | 'retry' | 'terminal' | 'paused';
let bootstrapInFlight: Promise<BootstrapOutcome> | null = null;
type McpAuthorizationProvider = {
  getIdToken: () => Promise<string>;
  getAppCheckToken: () => Promise<string>;
};
let authorizationProvider: McpAuthorizationProvider | null = null;

export const configureMcpAuthorizationProvider = (provider: McpAuthorizationProvider | null): void => {
  authorizationProvider = provider;
};

const getBillingApiTokens = async (): Promise<BillingApiTokens> => {
  if (!authorizationProvider) {
    throw new BillingRequestError('Sign in with Google to connect MCP.', 401);
  }
  const [idToken, appCheckToken] = await Promise.all([
    authorizationProvider.getIdToken(),
    authorizationProvider.getAppCheckToken(),
  ]);
  return { idToken, appCheckToken };
};

const readParams = (source: string): URLSearchParams => new URLSearchParams(source.replace(/^#/, '').replace(/^\?/, ''));

const valueFrom = (params: URLSearchParams, key: string): string | undefined => {
  const value = params.get(key)?.trim();
  return value || undefined;
};

/**
 * Removes legacy MCP credentials from the visible URL before analytics or
 * pageview tracking can read them. Current connectors pair automatically and
 * never require a connection link.
 */
export const scrubMcpConnectionUrl = (): void => {
  if (typeof window === 'undefined' || connectionUrlScrubbed) return;
  connectionUrlScrubbed = true;

  const url = new URL(window.location.href);
  const search = url.searchParams;
  const hash = readParams(url.hash);

  const hadMcpParams = ['mcpPair', 'mcpToken', 'mcpEndpoint']
    .some((key) => Boolean(valueFrom(search, key) || valueFrom(hash, key)));
  if (hadMcpParams) {
    search.delete('mcpPair');
    search.delete('mcpToken');
    search.delete('mcpEndpoint');
    hash.delete('mcpPair');
    hash.delete('mcpToken');
    hash.delete('mcpEndpoint');

    const nextHash = hash.toString();
    url.search = search.toString();
    url.hash = nextHash ? `#${nextHash}` : '';
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }
};

const adoptPairedSnapshot = (endpoint: string, snapshot: McpPairedConnectorSnapshot): boolean => {
  const store = useMcpStore.getState();
  if (store.intentionalDisconnect) return false;
  store.setConnectorEndpoint(endpoint);
  store.setConnectorToken(snapshot.session.sessionToken, snapshot.session);
  store.setConnectionState('ready', snapshot.health, snapshot.catalog);
  return true;
};

const isRetryableConnectionError = (error: unknown): boolean =>
  error instanceof McpConnectorRequestError
  && (error.message === 'Could not reach the local connector.' || error.message === 'The connector did not respond in time.');

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Could not connect to the local connector.';

const deniedLoopbackMessage =
  'Local network access is blocked. Allow it for AlgoGlyph in your browser site settings, then try again.';

const attemptMcpConnection = async (): Promise<BootstrapOutcome> => {
  if (typeof window === 'undefined') return 'terminal';

  const initial = useMcpStore.getState();
  if (initial.intentionalDisconnect) return 'paused';
  if (initial.connectionState === 'ready' && initial.connectorToken) return 'ready';

  scrubMcpConnectionUrl();

  try {
    const normalized = normalizeConnectorEndpoint(initial.connectorEndpoint);
    const token = initial.connectorToken || undefined;

    if (token) {
      initial.setConnectionState('checking');
      try {
        const snapshot = await inspectMcpConnector(normalized, token);
        const store = useMcpStore.getState();
        store.setConnectorEndpoint(normalized);
        if (snapshot.catalog) {
          store.setConnectorToken(token);
          store.setConnectionState('ready', snapshot.health, snapshot.catalog);
          return 'ready';
        }
      } catch (error) {
        if (error instanceof McpConnectorRequestError && error.status === 401) {
          useMcpStore.getState().setConnectorToken(null);
        } else {
          throw error;
        }
      }
    }

    const paired = await pairMcpConnector(normalized, await getBillingApiTokens());
    if (!adoptPairedSnapshot(normalized, paired)) {
      await revokeMcpConnectorSession(normalized, paired.session.sessionToken).catch(() => undefined);
      return 'paused';
    }
    return 'ready';
  } catch (error) {
    const store = useMcpStore.getState();
    if (store.intentionalDisconnect) return 'paused';
    if (store.connectionState === 'ready' && store.connectorToken) return 'ready';
    if (error instanceof BillingRequestError && error.status === 401) {
      store.setConnectorToken(null);
      store.setConnectionState('sign-in-required', null, null, error.message);
      return 'terminal';
    }
    if ((error instanceof BillingRequestError || error instanceof McpConnectorRequestError) && error.status === 402) {
      store.setConnectorToken(null);
      store.setConnectionState('payment-required', null, null, error.message);
      return 'terminal';
    }
    if (isRetryableConnectionError(error)) {
      if (requiresBrowserLoopbackPermission(window.location.href, store.connectorEndpoint)) {
        const permission = await readBrowserLoopbackPermission(store.connectorEndpoint);
        if (permission === 'denied') {
          store.setConnectorToken(null);
          store.setConnectionState('permission-denied', null, null, deniedLoopbackMessage);
          return 'terminal';
        }
      }
      store.setConnectorToken(null);
      store.setConnectionState('not-found', null, null, errorMessage(error));
      return 'retry';
    }
    store.setConnectionState('error', null, null, errorMessage(error));
    return 'terminal';
  }
};

/**
 * Performs one deduplicated automatic connection attempt.
 */
export function bootstrapMcpConnection(): Promise<BootstrapOutcome> {
  if (!bootstrapInFlight) {
    bootstrapInFlight = attemptMcpConnection().finally(() => {
      bootstrapInFlight = null;
    });
  }
  return bootstrapInFlight;
}

/**
 * Starts the first public-site loopback request directly from a user gesture so
 * Chromium can show its Local Network Access prompt instead of silently denying
 * a background probe. Local development and already-granted sessions keep the
 * existing automatic connection manager.
 */
export async function requestMcpConnection(): Promise<void> {
  const store = useMcpStore.getState();
  store.setIntentionalDisconnect(false);
  store.setConnectionState('pairing');
  await bootstrapMcpConnection();
}

const refreshConnectedMcpConnection = async (): Promise<BootstrapOutcome> => {
  const initial = useMcpStore.getState();
  if (initial.intentionalDisconnect) return 'paused';
  if (!initial.connectorToken) return attemptMcpConnection();

  try {
    const endpoint = normalizeConnectorEndpoint(initial.connectorEndpoint);
    const snapshot = await inspectMcpConnector(endpoint, initial.connectorToken);
    const store = useMcpStore.getState();
    if (store.intentionalDisconnect) return 'paused';
    if (!snapshot.catalog) {
      store.setConnectorToken(null);
      store.setConnectionState('needs-token', snapshot.health);
      return 'retry';
    }
    store.setConnectorEndpoint(endpoint);
    store.setConnectionState('ready', snapshot.health, snapshot.catalog);
    return 'ready';
  } catch (error) {
    const store = useMcpStore.getState();
    if (store.intentionalDisconnect) return 'paused';
    if (error instanceof McpConnectorRequestError && error.status === 401) {
      store.setConnectorToken(null);
      return attemptMcpConnection();
    }
    if (isRetryableConnectionError(error)) {
      store.setConnectorToken(null);
      store.setConnectionState('not-found', null, null, errorMessage(error));
      return 'retry';
    }
    store.setConnectorToken(null);
    store.setConnectionState('error', null, null, errorMessage(error));
    return 'terminal';
  }
};

/**
 * Owns automatic connection and health recovery for the page lifetime. The
 * connector's real health/catalog handshake is the source of truth; a user
 * initiated Disconnect pauses this manager until an explicit reconnect.
 */
export function startMcpConnectionBootstrap(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let cancelled = false;
  let retryIndex = 0;
  let running = false;
  let rerunRequested = false;
  let timer: number | undefined;

  const schedule = (delay: number) => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = window.setTimeout(() => void run(), delay);
  };

  const run = async () => {
    if (cancelled || useMcpStore.getState().intentionalDisconnect) return;
    if (running) {
      rerunRequested = true;
      return;
    }
    running = true;
    const state = useMcpStore.getState();
    const outcome = state.connectionState === 'ready' && state.connectorToken
      ? await refreshConnectedMcpConnection()
      : await bootstrapMcpConnection();
    running = false;

    if (cancelled || useMcpStore.getState().intentionalDisconnect) return;
    if (rerunRequested) {
      rerunRequested = false;
      schedule(0);
      return;
    }
    if (outcome === 'paused') return;
    if (outcome === 'ready') {
      retryIndex = 0;
      schedule(CONNECTED_HEALTH_CHECK_INTERVAL_MS);
      return;
    }
    if (outcome === 'retry') {
      const delay = BACKGROUND_RETRY_DELAYS_MS[Math.min(retryIndex, BACKGROUND_RETRY_DELAYS_MS.length - 1)];
      retryIndex += 1;
      schedule(delay);
    }
  };

  const unsubscribe = useMcpStore.subscribe((state, previousState) => {
    if (state.intentionalDisconnect !== previousState.intentionalDisconnect) {
      if (timer !== undefined) window.clearTimeout(timer);
      if (state.intentionalDisconnect) {
        rerunRequested = false;
        return;
      }
      retryIndex = 0;
      schedule(0);
      return;
    }

    if (
      state.connectionState !== previousState.connectionState
      && (state.connectionState === 'pairing' || state.connectionState === 'searching')
    ) {
      retryIndex = 0;
      schedule(0);
    }
  });

  const initialize = async () => {
    const state = useMcpStore.getState();
    const initialConnectionState = state.connectionState;
    if (state.intentionalDisconnect) return;
    if (state.connectorToken || !requiresBrowserLoopbackPermission(window.location.href, state.connectorEndpoint)) {
      await run();
      return;
    }

    const permission = await readBrowserLoopbackPermission(state.connectorEndpoint);
    const current = useMcpStore.getState();
    if (
      cancelled
      || current.intentionalDisconnect
      || current.connectorToken
      || current.connectionState !== initialConnectionState
    ) return;
    if (permission === 'granted') {
      await run();
      return;
    }

    const store = useMcpStore.getState();
    if (permission === 'denied') {
      store.setConnectionState('permission-denied', null, null, deniedLoopbackMessage);
    } else {
      store.setConnectionState('permission-required');
    }
  };

  void initialize();
  return () => {
    cancelled = true;
    unsubscribe();
    if (timer !== undefined) window.clearTimeout(timer);
  };
}
