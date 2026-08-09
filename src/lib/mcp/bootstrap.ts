import { useMcpStore } from '../../store/mcpStore';
import {
  McpConnectorRequestError,
  inspectMcpConnector,
  normalizeConnectorEndpoint,
  pairMcpConnector,
} from './connectorClient';
import type { McpPairedConnectorSnapshot } from './types';

let connectionUrlScrubbed = false;

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

const adoptPairedSnapshot = (endpoint: string, sessionToken: string, snapshot: McpPairedConnectorSnapshot) => {
  const store = useMcpStore.getState();
  store.setConnectorEndpoint(endpoint);
  store.setConnectionState('ready', snapshot.health, snapshot.catalog);
  store.setConnectorToken(sessionToken);
};

/**
 * Silent local MCP connect, run once on app load. URL-delivered credentials are
 * deliberately ignored; starting the connector is the complete user flow.
 */
export async function bootstrapMcpConnection(): Promise<void> {
  if (typeof window === 'undefined') return;

  const store = useMcpStore.getState();
  scrubMcpConnectionUrl();
  const endpoint = store.connectorEndpoint;

  try {
    const normalized = normalizeConnectorEndpoint(endpoint);

    const token = store.connectorToken || undefined;
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
