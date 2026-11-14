import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Query,
  type Unsubscribe,
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
  if (!configuredApiUrl) return 'Workspace-scoped MCP is not configured. Set VITE_ALGOGLYPH_API_URL.';
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
  deletionPending: data.status === 'deleting',
});

const canvasFrom = (workspaceId: string, id: string, data: Record<string, unknown>): CloudCanvas => ({
  id,
  workspaceId,
  name: typeof data.name === 'string' ? data.name : 'Untitled canvas',
  createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
  createdAt: timestampToIso(data.createdAt),
  updatedAt: timestampToIso(data.updatedAt),
  deletionPending: data.status === 'deleting',
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
    if (!workspace.exists() || !['active', 'deleting'].includes(String(workspace.data().status))) return null;
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
    getDocs(query(collection(firestore, 'workspaces', workspaceId, 'canvases'), where('status', 'in', ['active', 'deleting']), limit(200))),
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

export const subscribeCloudCanvases = (
  workspaceId: string,
  onCanvases: (canvases: CloudCanvas[], fromCache: boolean) => void,
  onError: (error: Error) => void,
): Unsubscribe => onSnapshot(
  query(collection(db(), 'workspaces', workspaceId, 'canvases'), where('status', 'in', ['active', 'deleting']), limit(200)),
  (snapshot) => onCanvases(snapshot.docs.map((canvas) => canvasFrom(workspaceId, canvas.id, canvas.data())), snapshot.metadata.fromCache),
  onError,
);

const deleteQueryDocuments = async (source: Query): Promise<void> => {
  while (true) {
    const page = await getDocs(query(source, limit(400)));
    if (page.empty) return;
    const batch = writeBatch(db());
    page.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
    if (page.size < 400) return;
  }
};

const markCanvasDeleting = async (workspaceId: string, canvasId: string, uid: string): Promise<void> => {
  const canvasRef = doc(db(), 'workspaces', workspaceId, 'canvases', canvasId);
  const canvas = await getDoc(canvasRef);
  if (!canvas.exists()) return;
  if (canvas.data().status === 'active') {
    await updateDoc(canvasRef, { status: 'deleting', deletedBy: uid, deletedAt: serverTimestamp() });
  } else if (canvas.data().status !== 'deleting') {
    throw new WorkspaceRequestError('This canvas is no longer available.', 404);
  }
};

const clearCanvasData = async (workspaceId: string, canvasId: string): Promise<void> => {
  const canvasRef = doc(db(), 'workspaces', workspaceId, 'canvases', canvasId);
  await deleteQueryDocuments(collection(canvasRef, 'elements'));
  await deleteQueryDocuments(collection(canvasRef, 'files'));
  await deleteQueryDocuments(collection(canvasRef, 'presence'));
  await deleteDoc(canvasRef);
};

const currentWorkspaceRole = async (workspaceId: string): Promise<{ uid: string; role: WorkspaceRole }> => {
  const uid = currentUid();
  const membership = await getDoc(doc(db(), 'workspaceMembers', `${workspaceId}_${uid}`));
  if (!membership.exists() || membership.data().status !== 'active') {
    throw new WorkspaceRequestError('Workspace access denied.', 403);
  }
  return { uid, role: workspaceRole(membership.data().role) };
};

export const deleteCloudCanvas = async (workspaceId: string, canvasId: string): Promise<void> => {
  const { uid, role } = await currentWorkspaceRole(workspaceId);
  if (role !== 'owner' && role !== 'admin') {
    throw new WorkspaceRequestError('Only workspace owners and admins can delete a canvas.', 403);
  }
  await markCanvasDeleting(workspaceId, canvasId, uid);
  await clearCanvasData(workspaceId, canvasId);
};

export const deleteCloudWorkspace = async (workspaceId: string): Promise<void> => {
  const { uid, role } = await currentWorkspaceRole(workspaceId);
  if (role !== 'owner') throw new WorkspaceRequestError('Only the workspace owner can delete it.', 403);
  const firestore = db();
  const workspaceRef = doc(firestore, 'workspaces', workspaceId);
  const workspace = await getDoc(workspaceRef);
  if (!workspace.exists()) return;
  if (workspace.data().status === 'active') {
    await updateDoc(workspaceRef, { status: 'deleting', deletedBy: uid, deletedAt: serverTimestamp() });
  } else if (workspace.data().status !== 'deleting') {
    throw new WorkspaceRequestError('This workspace is no longer available.', 404);
  }

  const canvasesRef = collection(workspaceRef, 'canvases');
  while (true) {
    const page = await getDocs(query(canvasesRef, where('status', 'in', ['active', 'deleting']), limit(50)));
    if (page.empty) break;
    for (const canvas of page.docs) {
      await markCanvasDeleting(workspaceId, canvas.id, uid);
      await clearCanvasData(workspaceId, canvas.id);
    }
  }

  await deleteQueryDocuments(query(collection(firestore, 'workspaceInvites'), where('workspaceId', '==', workspaceId)));

  const ownerMemberId = `${workspaceId}_${uid}`;
  const membershipQuery = query(collection(firestore, 'workspaceMembers'), where('workspaceId', '==', workspaceId), limit(400));
  while (true) {
    const page = await getDocs(membershipQuery);
    const otherMembers = page.docs.filter((membership) => membership.id !== ownerMemberId);
    if (!otherMembers.length) break;
    const batch = writeBatch(firestore);
    otherMembers.forEach((membership) => batch.delete(membership.ref));
    await batch.commit();
  }

  const finalBatch = writeBatch(firestore);
  finalBatch.delete(workspaceRef);
  finalBatch.delete(doc(firestore, 'workspaceMembers', ownerMemberId));
  await finalBatch.commit();
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
    if (!organization.exists() || !['active', 'deleting'].includes(String(organization.data().status))) return null;
    const orgData = organization.data();
    return {
      id: organization.id,
      name: typeof orgData.name === 'string' ? orgData.name : 'Organization',
      ownerId: typeof orgData.ownerId === 'string' ? orgData.ownerId : '',
      role: organizationRole(data.role),
      deletionPending: orgData.status === 'deleting',
    };
  }));
  return { organizations: organizations.filter((organization): organization is NonNullable<typeof organization> => organization !== null) };
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

export const deleteCloudOrganization = async (organizationId: string): Promise<void> => {
  const uid = currentUid();
  const firestore = db();
  const organizationRef = doc(firestore, 'organizations', organizationId);
  const ownerMemberId = `${organizationId}_${uid}`;
  const ownerMemberRef = doc(firestore, 'organizationMembers', ownerMemberId);
  const [organization, membership] = await Promise.all([getDoc(organizationRef), getDoc(ownerMemberRef)]);
  if (!organization.exists()) return;
  if (!membership.exists() || membership.data().status !== 'active' || membership.data().role !== 'owner') {
    throw new WorkspaceRequestError('Only the organization owner can delete it.', 403);
  }
  if (organization.data().status === 'active') {
    await updateDoc(organizationRef, { status: 'deleting', deletedBy: uid, deletedAt: serverTimestamp() });
  } else if (organization.data().status !== 'deleting') {
    throw new WorkspaceRequestError('This organization is no longer available.', 404);
  }

  const associatedWorkspaces = query(collection(firestore, 'workspaces'), where('organizationId', '==', organizationId), limit(400));
  while (true) {
    const page = await getDocs(associatedWorkspaces);
    if (page.empty) break;
    const batch = writeBatch(firestore);
    page.docs.forEach((workspace) => batch.update(workspace.ref, {
      organizationId: null,
      updatedAt: serverTimestamp(),
    }));
    await batch.commit();
  }

  const organizationInvites = query(collection(firestore, 'workspaceInvites'), where('organizationId', '==', organizationId), limit(400));
  while (true) {
    const page = await getDocs(organizationInvites);
    if (page.empty) break;
    const batch = writeBatch(firestore);
    page.docs.forEach((invite) => batch.update(invite.ref, { organizationId: null }));
    await batch.commit();
  }

  const members = query(collection(firestore, 'organizationMembers'), where('organizationId', '==', organizationId), limit(400));
  while (true) {
    const page = await getDocs(members);
    const otherMembers = page.docs.filter((item) => item.id !== ownerMemberId);
    if (!otherMembers.length) break;
    const batch = writeBatch(firestore);
    otherMembers.forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }

  const finalBatch = writeBatch(firestore);
  finalBatch.delete(organizationRef);
  finalBatch.delete(ownerMemberRef);
  await finalBatch.commit();
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

const createInviteToken = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const hashInviteToken = async (token: string): Promise<string> => {
  if (!/^[A-Za-z0-9_-]{40,80}$/.test(token)) throw new WorkspaceRequestError('This invitation link is invalid.', 404);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const createWorkspaceInvite = async (
  workspaceId: string,
  role: Extract<WorkspaceRole, 'member' | 'viewer'> = 'member',
) => {
  const user = getAuth(getApp()).currentUser;
  if (!user) throw new WorkspaceRequestError('Sign in to invite a collaborator.', 401);
  if (role !== 'member' && role !== 'viewer') throw new WorkspaceRequestError('Choose a valid workspace role.', 400);

  const firestore = db();
  const [workspace, membership] = await Promise.all([
    getDoc(doc(firestore, 'workspaces', workspaceId)),
    getDoc(doc(firestore, 'workspaceMembers', `${workspaceId}_${user.uid}`)),
  ]);
  if (!workspace.exists() || workspace.data().status !== 'active') throw new WorkspaceRequestError('Workspace not found.', 404);
  if (!membership.exists() || membership.data().status !== 'active' || !['owner', 'admin'].includes(membership.data().role)) {
    throw new WorkspaceRequestError('Only workspace owners and admins can invite people.', 403);
  }

  const token = createInviteToken();
  const inviteId = await hashInviteToken(token);
  const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1_000);
  const inviteRef = doc(firestore, 'workspaceInvites', inviteId);
  await writeBatch(firestore).set(inviteRef, {
    tokenHash: inviteId,
    tokenHint: token.slice(0, 6),
    workspaceId,
    workspaceName: String(workspace.data().name ?? 'Workspace'),
    organizationId: typeof workspace.data().organizationId === 'string' ? workspace.data().organizationId : null,
    role,
    status: 'active',
    maxUses: 1,
    useCount: 0,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    expiresAt,
  }).commit();

  return {
    invite: {
      id: inviteId,
      inviteUrl: `${window.location.origin}/invite/${encodeURIComponent(token)}`,
      role,
      expiresAt: expiresAt.toDate().toISOString(),
    } satisfies WorkspaceInvite,
  };
};

export const revokeWorkspaceInvite = async (workspaceId: string, inviteId: string): Promise<{ revoked: true }> => {
  const uid = currentUid();
  const inviteRef = doc(db(), 'workspaceInvites', inviteId);
  const invite = await getDoc(inviteRef);
  if (!invite.exists() || invite.data().workspaceId !== workspaceId) {
    throw new WorkspaceRequestError('Invite not found for this workspace.', 404);
  }
  await updateDoc(inviteRef, {
    status: 'revoked',
    revokedBy: uid,
    revokedAt: serverTimestamp(),
  });
  return { revoked: true };
};

export const inspectWorkspaceInvite = async (
  token: string,
): Promise<{ invite: { workspaceId: string; workspaceName: string; role: string; expiresAt: string } }> => {
  currentUid();
  const inviteId = await hashInviteToken(token);
  const snapshot = await getDoc(doc(db(), 'workspaceInvites', inviteId));
  if (!snapshot.exists()) throw new WorkspaceRequestError('This invitation is no longer available.', 404);
  const data = snapshot.data();
  if (data.tokenHash !== inviteId || typeof data.workspaceId !== 'string' || typeof data.workspaceName !== 'string') {
    throw new WorkspaceRequestError('This invitation is invalid.', 404);
  }
  if (data.status !== 'active') throw new WorkspaceRequestError('This invitation has already been used or revoked.', 410);
  if (!(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now()) {
    throw new WorkspaceRequestError('This invitation has expired.', 410);
  }
  if (data.role !== 'member' && data.role !== 'viewer') throw new WorkspaceRequestError('This invitation is invalid.', 404);
  return {
    invite: {
      workspaceId: data.workspaceId,
      workspaceName: data.workspaceName,
      role: data.role,
      expiresAt: data.expiresAt.toDate().toISOString(),
    },
  };
};

export const acceptWorkspaceInvite = async (token: string): Promise<{ workspaceId: string; membershipCreated: boolean }> => {
  const user = getAuth(getApp()).currentUser;
  if (!user) throw new WorkspaceRequestError('Sign in to accept this invitation.', 401);
  const firestore = db();
  const inviteId = await hashInviteToken(token);
  const inviteRef = doc(firestore, 'workspaceInvites', inviteId);

  return runTransaction(firestore, async (transaction) => {
    const inviteSnapshot = await transaction.get(inviteRef);
    if (!inviteSnapshot.exists()) throw new WorkspaceRequestError('This invitation is no longer available.', 404);
    const invite = inviteSnapshot.data();
    if (invite.status !== 'active' || !(invite.expiresAt instanceof Timestamp) || invite.expiresAt.toMillis() <= Date.now()) {
      throw new WorkspaceRequestError('This invitation has expired, been used, or was revoked.', 410);
    }
    if (typeof invite.workspaceId !== 'string' || (invite.role !== 'member' && invite.role !== 'viewer')) {
      throw new WorkspaceRequestError('This invitation is invalid.', 404);
    }

    const memberRef = doc(firestore, 'workspaceMembers', `${invite.workspaceId}_${user.uid}`);
    const memberSnapshot = await transaction.get(memberRef);
    if (memberSnapshot.exists()) {
      if (memberSnapshot.data().status === 'active') throw new WorkspaceRequestError('You already belong to this workspace.', 409);
      throw new WorkspaceRequestError('Your previous workspace membership is inactive. Ask an owner to restore access.', 403);
    }

    let organizationMemberRef: ReturnType<typeof doc> | null = null;
    if (typeof invite.organizationId === 'string') {
      organizationMemberRef = doc(firestore, 'organizationMembers', `${invite.organizationId}_${user.uid}`);
      const organizationMember = await transaction.get(organizationMemberRef);
      if (organizationMember.exists() && organizationMember.data().status !== 'active') {
        throw new WorkspaceRequestError('Your organization membership is inactive. Ask an organization owner for access.', 403);
      }
    }

    transaction.set(memberRef, {
      workspaceId: invite.workspaceId,
      uid: user.uid,
      role: invite.role,
      status: 'active',
      displayName: user.displayName,
      email: user.email,
      joinedAt: serverTimestamp(),
      inviteId,
    });
    if (organizationMemberRef) {
      transaction.set(organizationMemberRef, {
        organizationId: invite.organizationId,
        uid: user.uid,
        role: 'member',
        status: 'active',
        displayName: user.displayName,
        email: user.email,
        joinedAt: serverTimestamp(),
        inviteId,
      });
    }
    transaction.update(inviteRef, {
      status: 'consumed',
      useCount: 1,
      consumedBy: user.uid,
      consumedAt: serverTimestamp(),
    });
    return { workspaceId: invite.workspaceId, membershipCreated: true };
  });
};

export const listMcpTokens = (tokens: WorkspaceApiTokens, workspaceId: string) =>
  api<{ tokens: McpAccessToken[] }>(`v1/workspaces/${encodeURIComponent(workspaceId)}/mcp-tokens`, tokens);

export const createMcpToken = (tokens: WorkspaceApiTokens, workspaceId: string, label: string) =>
  api<{ token: string; tokenId: string; label: string; workspaceId: string; createdAt: string }>(
    `v1/workspaces/${encodeURIComponent(workspaceId)}/mcp-tokens`, tokens,
    { method: 'POST', body: JSON.stringify({ label }) },
  );
