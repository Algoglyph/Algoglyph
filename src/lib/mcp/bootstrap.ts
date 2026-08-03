import { useMcpStore } from '../../store/mcpStore';
import {
  McpConnectorRequestError,
  inspectMcpConnector,
  normalizeConnectorEndpoint,
  pairMcpConnector,
  pairMcpConnectorWithCredential,
} from './connectorClient';

interface UrlConnectionParams {
  endpoint?: string;
  legacyToken?: string;
  pairingToken?: string;
}

let pendingUrlConnection: UrlConnectionParams | null | undefined;

const readParams = (source: string): URLSearchParams => new URLSearchParams(source.replace(/^#/, '').replace(/^\?/, ''));

const valueFrom = (params: URLSearchParams, key: string): string | undefined => {
  const value = params.get(key)?.trim();
  return value || undefined;
};

/**
 * Removes MCP pairing data from the visible URL before analytics or pageview
 * tracking can read it. The one-time pairing code is normally carried in the
 * hash fragment, but legacy query params are still scrubbed for compatibility.
 */
export const scrubMcpConnectionUrl = (): UrlConnectionParams | null => {
  if (typeof window === 'undefined') return null;
  if (pendingUrlConnection !== undefined) return pendingUrlConnection;

  const url = new URL(window.location.href);
  const search = url.searchParams;
  const hash = readParams(url.hash);

  const pairingToken = valueFrom(hash, 'mcpPair') || valueFrom(search, 'mcpPair');
  const legacyToken = valueFrom(search, 'mcpToken') || valueFrom(hash, 'mcpToken');
  const endpoint = valueFrom(search, 'mcpEndpoint') || valueFrom(hash, 'mcpEndpoint');

  const hadMcpParams = Boolean(pairingToken || legacyToken || endpoint);
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

  pendingUrlConnection = hadMcpParams ? { endpoint, legacyToken, pairingToken } : null;
  return pendingUrlConnection;
};

const adoptPairedSnapshot = (endpoint: string, sessionToken: string, snapshot: Awaited<ReturnType<typeof pairMcpConnector>>) => {
  const store = useMcpStore.getState();
  store.setConnectorEndpoint(endpoint);
  store.setConnectionState('ready', snapshot.health, snapshot.catalog);
  store.setConnectorToken(sessionToken);
};

/**
 * One-click and silent MCP connect, run once on app load.
 *
 * - Redeems a one-time `mcpPair` credential from the connector's quick link.
 * - Keeps legacy `mcpToken` links/manual sessions working.
 * - If no URL credential exists, quietly attempts local discovery + pairing so
 *   an already-running connector can reconnect without opening the dialog.
 */
export async function bootstrapMcpConnection(): Promise<void> {
  if (typeof window === 'undefined') return;

  const store = useMcpStore.getState();
  const urlConnection = scrubMcpConnectionUrl();
  const endpoint = urlConnection?.endpoint || store.connectorEndpoint;

  try {
    const normalized = normalizeConnectorEndpoint(endpoint);

    if (urlConnection?.pairingToken) {
      store.setConnectionState('pairing');
      const snapshot = await pairMcpConnectorWithCredential(normalized, urlConnection.pairingToken);
      adoptPairedSnapshot(normalized, snapshot.sessionToken, snapshot);
      return;
    }

    const token = urlConnection?.legacyToken || store.connectorToken || undefined;
    if (token) {
      store.setConnectionState('checking');
      try {
        const snapshot = await inspectMcpConnector(normalized, token);
        store.setConnectorEndpoint(normalized);
        if (snapshot.catalog) {
          store.setConnectionState('ready', snapshot.health, snapshot.catalog);
          store.setConnectorToken(token);
          return;
        }
      } catch (error) {
        if (error instanceof McpConnectorRequestError && error.status === 401) {
          store.setConnectorToken(null);
        } else {
          throw error;
        }
      }
    }

    const paired = await pairMcpConnector(normalized);
    adoptPairedSnapshot(normalized, paired.sessionToken, paired);
  } catch {
    // A missing/asleep connector must never disrupt page load.
    store.setConnectionState('idle');
  }
}
