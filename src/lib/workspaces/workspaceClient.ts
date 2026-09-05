import type {
  CloudCanvas,
  CloudOrganization,
  CloudWorkspace,
  McpAccessToken,
  WorkspaceApiTokens,
  WorkspaceInvite,
  WorkspaceMember,
  WorkspaceRole,
} from './types';

const configuredApiUrl = (import.meta.env.VITE_ALGOGLYPH_API_URL || import.meta.env.VITE_BILLING_API_URL || '')
  .trim().replace(/\/$/, '');

export class WorkspaceRequestError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export const getWorkspaceConfigurationError = (): string | null => {
  if (!configuredApiUrl) return 'Cloud workspaces are not configured. Set VITE_ALGOGLYPH_API_URL.';
  try {
    const url = new URL(configuredApiUrl);
    const loopback = import.meta.env.DEV && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(loopback && url.protocol === 'http:')) return 'The AlgoGlyph API must use HTTPS.';
    if (url.username || url.password || url.search || url.hash) return 'The AlgoGlyph API URL must be a clean origin.';
    return null;
  } catch {
    return 'VITE_ALGOGLYPH_API_URL is not a valid URL.';
  }
};

const api = async <T>(path: string, tokens: WorkspaceApiTokens, init: RequestInit = {}): Promise<T> => {
  const configurationError = getWorkspaceConfigurationError();
  if (configurationError) throw new WorkspaceRequestError(configurationError, 503);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${tokens.idToken}`);
  headers.set('X-Firebase-AppCheck', tokens.appCheckToken);
  if (init.body) headers.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${configuredApiUrl}/${path.replace(/^\//, '')}`, {
      ...init, headers, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new WorkspaceRequestError('Could not reach the AlgoGlyph service.');
  }
  const payload = await response.json().catch(() => ({})) as { error?: { message?: string } };
  if (!response.ok) throw new WorkspaceRequestError(payload.error?.message || 'The workspace request failed.', response.status);
  return payload as T;
};

export const listCloudWorkspaces = (tokens: WorkspaceApiTokens) =>
  api<{ workspaces: CloudWorkspace[] }>('v1/workspaces', tokens);

export const createCloudWorkspace = (tokens: WorkspaceApiTokens, name: string, organizationId?: string) =>
  api<{ workspace: CloudWorkspace; canvas: CloudCanvas }>('v1/workspaces', tokens, {
    method: 'POST', body: JSON.stringify({ name, ...(organizationId ? { organizationId } : {}) }),
  });

export const getCloudWorkspace = (tokens: WorkspaceApiTokens, workspaceId: string) =>
  api<{ workspace: CloudWorkspace; canvases: CloudCanvas[] }>(`v1/workspaces/${encodeURIComponent(workspaceId)}`, tokens);

export const createCloudCanvas = (tokens: WorkspaceApiTokens, workspaceId: string, name: string) =>
  api<{ canvas: CloudCanvas }>(`v1/workspaces/${encodeURIComponent(workspaceId)}/canvases`, tokens, {
    method: 'POST', body: JSON.stringify({ name }),
  });

export const listCloudOrganizations = (tokens: WorkspaceApiTokens) =>
  api<{ organizations: CloudOrganization[] }>('v1/organizations', tokens);

export const createCloudOrganization = (tokens: WorkspaceApiTokens, name: string) =>
  api<{ organization: CloudOrganization }>('v1/organizations', tokens, { method: 'POST', body: JSON.stringify({ name }) });

export const listWorkspaceMembers = (tokens: WorkspaceApiTokens, workspaceId: string) =>
  api<{ members: WorkspaceMember[] }>(`v1/workspaces/${encodeURIComponent(workspaceId)}/members`, tokens);

export const createWorkspaceInvite = (
  tokens: WorkspaceApiTokens,
  workspaceId: string,
  role: Extract<WorkspaceRole, 'member' | 'viewer'> = 'member',
) => api<{ invite: WorkspaceInvite }>(`v1/workspaces/${encodeURIComponent(workspaceId)}/invites`, tokens, {
  method: 'POST', body: JSON.stringify({ role, expiresInHours: 24 }),
});

export const revokeWorkspaceInvite = (tokens: WorkspaceApiTokens, workspaceId: string, inviteId: string) =>
  api<{ revoked: true }>(`v1/workspaces/${encodeURIComponent(workspaceId)}/invites/${encodeURIComponent(inviteId)}`, tokens, {
    method: 'POST', body: JSON.stringify({}),
  });

export const inspectWorkspaceInvite = (tokens: WorkspaceApiTokens, token: string) =>
  api<{ invite: { workspaceId: string; workspaceName: string; role: string; expiresAt: string } }>('v1/invites/inspect', tokens, {
    method: 'POST', body: JSON.stringify({ token }),
  });

export const acceptWorkspaceInvite = (tokens: WorkspaceApiTokens, token: string) =>
  api<{ workspaceId: string; membershipCreated: boolean }>('v1/invites/accept', tokens, {
    method: 'POST', body: JSON.stringify({ token }),
  });

export const listMcpTokens = (tokens: WorkspaceApiTokens, workspaceId: string) =>
  api<{ tokens: McpAccessToken[] }>(`v1/workspaces/${encodeURIComponent(workspaceId)}/mcp-tokens`, tokens);

export const createMcpToken = (tokens: WorkspaceApiTokens, workspaceId: string, label: string) =>
  api<{ token: string; tokenId: string; label: string; workspaceId: string; createdAt: string }>(
    `v1/workspaces/${encodeURIComponent(workspaceId)}/mcp-tokens`, tokens,
    { method: 'POST', body: JSON.stringify({ label }) },
  );
