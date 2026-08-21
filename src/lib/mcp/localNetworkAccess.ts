import { DEFAULT_MCP_CONNECTOR_ENDPOINT } from './types';

export type LoopbackPermissionState = 'not-required' | 'granted' | 'prompt' | 'denied' | 'unsupported';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);
const PERMISSION_NAMES = ['loopback-network', 'local-network-access'] as const;

const isLoopbackHost = (hostname: string): boolean =>
  LOOPBACK_HOSTS.has(hostname.toLowerCase());

export const requiresBrowserLoopbackPermission = (
  pageHref = typeof window === 'undefined' ? '' : window.location.href,
  connectorEndpoint = DEFAULT_MCP_CONNECTOR_ENDPOINT,
): boolean => {
  try {
    const page = new URL(pageHref);
    const connector = new URL(connectorEndpoint);
    return page.protocol === 'https:'
      && !isLoopbackHost(page.hostname)
      && isLoopbackHost(connector.hostname);
  } catch {
    return false;
  }
};

export const readBrowserLoopbackPermission = async (
  connectorEndpoint = DEFAULT_MCP_CONNECTOR_ENDPOINT,
): Promise<LoopbackPermissionState> => {
  if (!requiresBrowserLoopbackPermission(undefined, connectorEndpoint)) return 'not-required';

  const permissions = typeof window === 'undefined' ? undefined : window.navigator?.permissions;
  if (!permissions?.query) return 'unsupported';

  for (const name of PERMISSION_NAMES) {
    try {
      const status = await permissions.query({ name: name as PermissionName });
      if (status.state === 'granted' || status.state === 'prompt' || status.state === 'denied') {
        return status.state;
      }
    } catch {
      // Browsers are shipping the fine-grained name gradually; try the alias.
    }
  }

  return 'unsupported';
};
