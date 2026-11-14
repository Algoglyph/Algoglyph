import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
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
  if (!configuredApiUrl) return 'Cloud workspace invites and MCP are not configured. Set VITE_ALGOGLYPH_API_URL.';
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

const db = () => getFirestore(getApp());

const currentUid = (): string => {
  const user = getAuth(getApp()).currentUser;
  if (!user) throw new WorkspaceRequestError('Sign in to use cloud workspaces.', 401);
  return user.uid;
};

const timestampToIso = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('toDate' in value) || typeof value.toDate !== 'function') return null;
  return (value.toDate as () => Date)().toISOString();
};

const workspaceRole = (value: unknown): WorkspaceRole => {
  if (value === 'owner' || value === 'admin' || value === 'member' || value === 'viewer') return value;
  throw new WorkspaceRequestError('Workspace membership data is invalid.');
};

const workspaceFrom = (id: string, data: Record<string, unknown>, role: WorkspaceRole): CloudWorkspace => ({
  id,
  name: typeof data.name === 'string' ? data.name : 'Untitled workspace',
  ownerId: typeof data.ownerId === 'string' ? data.ownerId : '',
  organizationId: typeof data.organizationId === 'string' ? data.organizationId : null,
  role,
  createdAt: timestampToIso(data.createdAt),
  updatedAt: timestampToIso(data.updatedAt),
});

const canvasFrom = (workspaceId: string, id: string, data: Record<string, unknown>): CloudCanvas => ({
  id,
  workspaceId,
  name: typeof data.name === 'string' ? data.name : 'Untitled canvas',
  createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
  createdAt: timestampToIso(data.createdAt),
  updatedAt: timestampToIso(data.updatedAt),
});

const organizationRole = (value: unknown): CloudOrganization['role'] => {
  if (value === 'owner' || value === 'admin' || value === 'billing_admin' || value === 'member') return value;
  throw new WorkspaceRequestError('Organization membership data is invalid.');
};

export const listCloudWorkspaces = async (): Promise<{ workspaces: CloudWorkspace[] }> => {
  const uid = currentUid();
  const memberships = await getDocs(query(
    collection(db(), 'workspaceMembers'), where('uid', '==', uid), where('status', '==', 'active'), limit(200),
  ));
  const workspaces = await Promise.all(memberships.docs.map(async (membership) => {
    const data = membership.data();
    if (typeof data.workspaceId !== 'string') return null;
    const workspace = await getDoc(doc(db(), 'workspaces', data.workspaceId));
    if (!workspace.exists() || workspace.data().status !== 'active') return null;
    return workspaceFrom(workspace.id, workspace.data(), workspaceRole(data.role));
  }));
  return { workspaces: workspaces.filter((workspace): workspace is CloudWorkspace => workspace !== null) };
};

export const createCloudWorkspace = async (
  requestedName: string,
  organizationId?: string,
): Promise<{ workspace: CloudWorkspace; canvas: CloudCanvas }> => {
  const uid = currentUid();
  const name = requestedName.trim().replace(/\s+/g, ' ');
  if (!name || name.length > 100) throw new WorkspaceRequestError('Name must be between 1 and 100 characters.', 400);

  const firestore = db();
  const workspaceRef = doc(collection(firestore, 'workspaces'));
  const canvasRef = doc(collection(workspaceRef, 'canvases'));
  const memberRef = doc(firestore, 'workspaceMembers', `${workspaceRef.id}_${uid}`);
  const batch = writeBatch(firestore);
  batch.set(workspaceRef, {
    name,
    ownerId: uid,
    organizationId: organizationId ?? null,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(memberRef, {
    workspaceId: workspaceRef.id,
    uid,
    role: 'owner',
    status: 'active',
    joinedAt: serverTimestamp(),
  });
  batch.set(canvasRef, {
    workspaceId: workspaceRef.id,
    name: 'Main canvas',
    createdBy: uid,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();

  return {
    workspace: { id: workspaceRef.id, name, ownerId: uid, organizationId: organizationId ?? null, role: 'owner', createdAt: null, updatedAt: null },
    canvas: { id: canvasRef.id, workspaceId: workspaceRef.id, name: 'Main canvas', createdBy: uid, createdAt: null, updatedAt: null },
  };
};

export const getCloudWorkspace = async (
  workspaceId: string,
): Promise<{ workspace: CloudWorkspace; canvases: CloudCanvas[] }> => {
  const uid = currentUid();
  const firestore = db();
  const [workspace, membership, canvasSnapshot] = await Promise.all([
    getDoc(doc(firestore, 'workspaces', workspaceId)),
    getDoc(doc(firestore, 'workspaceMembers', `${workspaceId}_${uid}`)),
    getDocs(query(collection(firestore, 'workspaces', workspaceId, 'canvases'), where('status', '==', 'active'), limit(200))),
  ]);
  if (!workspace.exists() || workspace.data().status !== 'active' || !membership.exists() || membership.data().status !== 'active') {
    throw new WorkspaceRequestError('Workspace access denied.', 403);
  }
  const canvases = canvasSnapshot.docs.map((canvas) => canvasFrom(workspaceId, canvas.id, canvas.data()));
  return { workspace: workspaceFrom(workspace.id, workspace.data(), workspaceRole(membership.data().role)), canvases };
};

export const createCloudCanvas = async (
  workspaceId: string,
  requestedName: string,
): Promise<{ canvas: CloudCanvas }> => {
  const uid = currentUid();
  const name = requestedName.trim().replace(/\s+/g, ' ');
  if (!name || name.length > 100) throw new WorkspaceRequestError('Name must be between 1 and 100 characters.', 400);
  const firestore = db();
  const canvasRef = doc(collection(firestore, 'workspaces', workspaceId, 'canvases'));
  await writeBatch(firestore).set(canvasRef, {
    workspaceId,
    name,
    createdBy: uid,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).commit();
  return { canvas: { id: canvasRef.id, workspaceId, name, createdBy: uid, createdAt: null, updatedAt: null } };
};

export const listCloudOrganizations = async (): Promise<{ organizations: CloudOrganization[] }> => {
  const uid = currentUid();
  const memberships = await getDocs(query(
    collection(db(), 'organizationMembers'), where('uid', '==', uid), where('status', '==', 'active'), limit(100),
  ));
  const organizations = await Promise.all(memberships.docs.map(async (membership) => {
    const data = membership.data();
    if (typeof data.organizationId !== 'string') return null;
    const organization = await getDoc(doc(db(), 'organizations', data.organizationId));
    if (!organization.exists() || organization.data().status !== 'active') return null;
    const orgData = organization.data();
    return {
      id: organization.id,
      name: typeof orgData.name === 'string' ? orgData.name : 'Organization',
      ownerId: typeof orgData.ownerId === 'string' ? orgData.ownerId : '',
      role: organizationRole(data.role),
    };
  }));
  return { organizations: organizations.filter((organization): organization is CloudOrganization => organization !== null) };
};

export const createCloudOrganization = async (
  requestedName: string,
): Promise<{ organization: CloudOrganization }> => {
  const uid = currentUid();
  const name = requestedName.trim().replace(/\s+/g, ' ');
  if (!name || name.length > 100) throw new WorkspaceRequestError('Name must be between 1 and 100 characters.', 400);

  const firestore = db();
  const organizationRef = doc(collection(firestore, 'organizations'));
  const memberRef = doc(firestore, 'organizationMembers', `${organizationRef.id}_${uid}`);
  const batch = writeBatch(firestore);
  batch.set(organizationRef, {
    name,
    ownerId: uid,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(memberRef, {
    organizationId: organizationRef.id,
    uid,
    role: 'owner',
    status: 'active',
    joinedAt: serverTimestamp(),
  });
  await batch.commit();
  return { organization: { id: organizationRef.id, name, ownerId: uid, role: 'owner' } };
};

export const listWorkspaceMembers = async (
  workspaceId: string,
): Promise<{ members: WorkspaceMember[] }> => {
  const snapshot = await getDocs(query(
    collection(db(), 'workspaceMembers'), where('workspaceId', '==', workspaceId), where('status', '==', 'active'), limit(250),
  ));
  return {
    members: snapshot.docs.map((membership) => {
      const data = membership.data();
      return {
        uid: String(data.uid ?? ''),
        role: workspaceRole(data.role),
        status: 'active',
        displayName: typeof data.displayName === 'string' ? data.displayName : null,
        email: typeof data.email === 'string' ? data.email : null,
        joinedAt: timestampToIso(data.joinedAt),
      };
    }),
  };
};

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
