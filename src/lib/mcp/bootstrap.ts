import { useMcpStore } from '../../store/mcpStore';
import { McpConnectorRequestError, inspectMcpConnector, normalizeConnectorEndpoint } from './connectorClient';

/**
 * One-click / silent MCP connect, run once on app load.
 *
 * 1. If the URL carries `?mcpToken=` (and optional `?mcpEndpoint=`) — the link
 *    the connector prints on startup — adopt it, then immediately scrub those
 *    params from the address bar and history so the token isn't left in the URL.
 * 2. Otherwise fall back to a token remembered from earlier this session.
 * 3. Connect quietly. A missing/asleep connector must never disrupt page load,
 *    so failures are swallowed (a stale token is cleared on 401).
 *
 * This mirrors PenEcho's frictionless "run it and open the link" flow across the
 * app↔connector origin boundary, where a same-origin cookie isn't available.
 */
export async function bootstrapMcpConnection(): Promise<void> {
  if (typeof window === 'undefined') return;

  const store = useMcpStore.getState();

  const url = new URL(window.location.href);
  const urlToken = url.searchParams.get('mcpToken');
  const urlEndpoint = url.searchParams.get('mcpEndpoint');

  if (urlToken || urlEndpoint) {
    url.searchParams.delete('mcpToken');
    url.searchParams.delete('mcpEndpoint');
    // Remove the token from the visible URL and this history entry right away.
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }

  const endpoint = urlEndpoint || store.connectorEndpoint;
  const token = urlToken || store.connectorToken || undefined;
  if (!token) return;

  try {
    const normalized = normalizeConnectorEndpoint(endpoint);
    store.setConnectionState('checking');
    const snapshot = await inspectMcpConnector(normalized, token);
    store.setConnectorEndpoint(normalized);

    if (snapshot.catalog) {
      store.setConnectionState('ready', snapshot.health, snapshot.catalog);
      store.setConnectorToken(token);
    } else {
      store.setConnectionState('needs-token', snapshot.health);
    }
  } catch (error) {
    // Clear a token the connector rejected; otherwise stay quiet on load.
    if (error instanceof McpConnectorRequestError && error.status === 401) {
      store.setConnectorToken(null);
    }
    store.setConnectionState('idle');
  }
}
