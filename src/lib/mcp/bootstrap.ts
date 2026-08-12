import { useMcpStore } from '../../store/mcpStore';
import {
  McpConnectorRequestError,
  inspectMcpConnector,
  normalizeConnectorEndpoint,
  pairMcpConnector,
} from './connectorClient';
import type { McpPairedConnectorSnapshot } from './types';

let connectionUrlScrubbed = false;
const BACKGROUND_RETRY_DELAYS_MS = [1_500, 3_000, 5_000, 8_000, 12_000, 20_000] as const;
type BootstrapOutcome = 'ready' | 'retry' | 'terminal';
let bootstrapInFlight: Promise<BootstrapOutcome> | null = null;

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

const adoptPairedSnapshot = (endpoint: string, snapshot: McpPairedConnectorSnapshot) => {
  const store = useMcpStore.getState();
  store.setConnectorEndpoint(endpoint);
  store.setConnectorToken(snapshot.session.sessionToken, snapshot.session);
  store.setConnectionState('ready', snapshot.health, snapshot.catalog);
};

const isRetryableConnectionError = (error: unknown): boolean =>
  error instanceof McpConnectorRequestError
  && (error.message === 'Could not reach the local connector.' || error.message === 'The connector did not respond in time.');

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Could not connect to the local connector.';

const attemptMcpConnection = async (): Promise<BootstrapOutcome> => {
  if (typeof window === 'undefined') return 'terminal';

  const initial = useMcpStore.getState();
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

    const paired = await pairMcpConnector(normalized);
    adoptPairedSnapshot(normalized, paired);
    return 'ready';
  } catch (error) {
    const store = useMcpStore.getState();
    if (store.connectionState === 'ready' && store.connectorToken) return 'ready';
    if (isRetryableConnectionError(error)) {
      store.setConnectionState('idle');
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
 * Starts the no-link connection flow on app load. A small, bounded retry window
 * lets a user launch `npm run mcp:connector` after opening AlgoGlyph without
 * leaving a perpetual background poller behind.
 */
export function startMcpConnectionBootstrap(): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let cancelled = false;
  let retryIndex = 0;
  let timer: number | undefined;

  const run = async () => {
    const outcome = await bootstrapMcpConnection();
    if (cancelled || outcome !== 'retry' || retryIndex >= BACKGROUND_RETRY_DELAYS_MS.length) return;
    const delay = BACKGROUND_RETRY_DELAYS_MS[retryIndex];
    retryIndex += 1;
    timer = window.setTimeout(() => void run(), delay);
  };

  void run();
  return () => {
    cancelled = true;
    if (timer !== undefined) window.clearTimeout(timer);
  };
}
