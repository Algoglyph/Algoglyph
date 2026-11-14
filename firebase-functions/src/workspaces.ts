import { randomBytes } from 'node:crypto';
import {
  FieldValue,
  getFirestore,
  Timestamp,
  type DocumentData,
  type DocumentReference,
} from 'firebase-admin/firestore';
import { HttpError, sha256, type AuthenticatedPrincipal } from './security.js';

export const WORKSPACE_ROLES = ['owner', 'admin', 'member', 'viewer'] as const;
export const ORGANIZATION_ROLES = ['owner', 'admin', 'billing_admin', 'member'] as const;
export type WorkspaceRole = typeof WORKSPACE_ROLES[number];
export type OrganizationRole = typeof ORGANIZATION_ROLES[number];

export interface WorkspaceWire {
  id: string;
  name: string;
  ownerId: string;
  organizationId: string | null;
  role: WorkspaceRole;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CanvasWire {
  id: string;
  workspaceId: string;
  name: string;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WorkspaceMemberWire {
  uid: string;
  role: WorkspaceRole;
  status: 'active';
  displayName: string | null;
  email: string | null;
  joinedAt: string | null;
}

export interface OrganizationWire {
  id: string;
  name: string;
  ownerId: string;
  role: OrganizationRole;
}

export interface WorkspaceAccess {
  workspace: DocumentData;
  membership: DocumentData;
  role: WorkspaceRole;
}

export interface McpPrincipal {
  uid: string;
  workspaceId: string;
  tokenId: string;
  scopes: string[];
}

const ID_PATTERN = /^[A-Za-z0-9_-]{6,120}$/;
const ELEMENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/;
const ACTIVE_WORKSPACE_ROLES = new Set<string>(WORKSPACE_ROLES);
const EDITOR_ROLES = new Set<WorkspaceRole>(['owner', 'admin', 'member']);
const ADMIN_ROLES = new Set<WorkspaceRole>(['owner', 'admin']);
const ORG_ADMIN_ROLES = new Set<OrganizationRole>(['owner', 'admin']);

const timestampToIso = (value: unknown): string | null =>
  value instanceof Timestamp ? value.toDate().toISOString() : null;

const cleanName = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') throw new HttpError(400, 'A name is required.');
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name || name.length > 100) throw new HttpError(400, 'Name must be between 1 and 100 characters.');
  return name || fallback;
};

export const requireResourceId = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) {
    throw new HttpError(400, `Invalid ${label} identifier.`);
  }
  return value;
};

const workspaceMemberId = (workspaceId: string, uid: string): string => `${workspaceId}_${uid}`;
const organizationMemberId = (organizationId: string, uid: string): string => `${organizationId}_${uid}`;

const workspaceWire = (id: string, data: DocumentData, role: WorkspaceRole): WorkspaceWire => ({
  id,
  name: String(data.name ?? 'Untitled workspace'),
  ownerId: String(data.ownerId ?? ''),
  organizationId: typeof data.organizationId === 'string' ? data.organizationId : null,
  role,
  createdAt: timestampToIso(data.createdAt),
  updatedAt: timestampToIso(data.updatedAt),
});

const canvasWire = (workspaceId: string, id: string, data: DocumentData): CanvasWire => ({
  id,
  workspaceId,
  name: String(data.name ?? 'Untitled canvas'),
  createdBy: String(data.createdBy ?? ''),
  createdAt: timestampToIso(data.createdAt),
  updatedAt: timestampToIso(data.updatedAt),
});

export const upsertIdentity = async (principal: AuthenticatedPrincipal): Promise<void> => {
  const db = getFirestore();
  const ref = db.collection('users').doc(principal.uid);
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    transaction.set(ref, {
      uid: principal.uid,
      email: principal.email ?? null,
      displayName: principal.displayName ?? null,
      updatedAt: FieldValue.serverTimestamp(),
      ...(!existing.exists ? { createdAt: FieldValue.serverTimestamp() } : {}),
    }, { merge: true });
  });
};

export const requireOrganizationAccess = async (
  principal: Pick<AuthenticatedPrincipal, 'uid'>,
  organizationId: string,
  options: { admin?: boolean; billing?: boolean } = {},
): Promise<{ organization: DocumentData; role: OrganizationRole }> => {
  requireResourceId(organizationId, 'organization');
  const db = getFirestore();
  const [organization, member] = await Promise.all([
    db.collection('organizations').doc(organizationId).get(),
    db.collection('organizationMembers').doc(organizationMemberId(organizationId, principal.uid)).get(),
  ]);
  const organizationData = organization.data();
  const memberData = member.data();
  const role = memberData?.role as OrganizationRole;
  const valid = organization.exists
    && organizationData?.status === 'active'
    && member.exists
    && memberData?.organizationId === organizationId
    && memberData?.uid === principal.uid
    && memberData?.status === 'active'
    && ORGANIZATION_ROLES.includes(role);
  if (!valid) throw new HttpError(403, 'Organization access denied.');
  if (options.admin && !ORG_ADMIN_ROLES.has(role)) throw new HttpError(403, 'Organization administration denied.');
  if (options.billing && role !== 'owner' && role !== 'billing_admin') {
    throw new HttpError(403, 'Organization billing access denied.');
  }
  return { organization: organizationData, role };
};

export const requireWorkspaceAccess = async (
  principal: Pick<AuthenticatedPrincipal, 'uid'>,
  workspaceId: string,
  options: { write?: boolean; admin?: boolean } = {},
): Promise<WorkspaceAccess> => {
  requireResourceId(workspaceId, 'workspace');
  const db = getFirestore();
  const [workspace, member] = await Promise.all([
    db.collection('workspaces').doc(workspaceId).get(),
    db.collection('workspaceMembers').doc(workspaceMemberId(workspaceId, principal.uid)).get(),
  ]);
  const workspaceData = workspace.data();
  const memberData = member.data();
  const role = memberData?.role as WorkspaceRole;
  const valid = workspace.exists
    && workspaceData?.status === 'active'
    && member.exists
    && memberData?.workspaceId === workspaceId
    && memberData?.uid === principal.uid
    && memberData?.status === 'active'
    && ACTIVE_WORKSPACE_ROLES.has(role);
  if (!valid) throw new HttpError(403, 'Workspace access denied.');
  if (options.write && !EDITOR_ROLES.has(role)) throw new HttpError(403, 'Workspace is read-only for this member.');
  if (options.admin && !ADMIN_ROLES.has(role)) throw new HttpError(403, 'Workspace administration denied.');
  return { workspace: workspaceData, membership: memberData, role };
};

export const createOrganization = async (
  principal: AuthenticatedPrincipal,
  requestedName: unknown,
): Promise<OrganizationWire> => {
  const db = getFirestore();
  const organizationId = `org_${randomBytes(12).toString('hex')}`;
  const name = cleanName(requestedName, 'Organization');
  const organizationRef = db.collection('organizations').doc(organizationId);
  const memberRef = db.collection('organizationMembers').doc(organizationMemberId(organizationId, principal.uid));
  await db.runTransaction(async (transaction) => {
    transaction.create(organizationRef, {
      name,
      ownerId: principal.uid,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(memberRef, {
      organizationId,
      uid: principal.uid,
      role: 'owner',
      status: 'active',
      joinedAt: FieldValue.serverTimestamp(),
    });
  });
  return { id: organizationId, name, ownerId: principal.uid, role: 'owner' };
};

export const listOrganizations = async (principal: AuthenticatedPrincipal): Promise<OrganizationWire[]> => {
  const db = getFirestore();
  const memberships = await db.collection('organizationMembers')
    .where('uid', '==', principal.uid)
    .where('status', '==', 'active')
    .limit(100)
    .get();
  const organizations = await Promise.all(memberships.docs.map(async (member) => {
    const data = member.data();
    if (typeof data.organizationId !== 'string' || !ORGANIZATION_ROLES.includes(data.role)) return null;
    const organization = await db.collection('organizations').doc(data.organizationId).get();
    if (!organization.exists || organization.data()?.status !== 'active') return null;
    return {
      id: organization.id,
      name: String(organization.data()?.name ?? 'Organization'),
      ownerId: String(organization.data()?.ownerId ?? ''),
      role: data.role as OrganizationRole,
    };
  }));
  return organizations.filter((item): item is OrganizationWire => item !== null);
};

export const createWorkspace = async (
  principal: AuthenticatedPrincipal,
  requestedName: unknown,
  organizationId?: string,
): Promise<{ workspace: WorkspaceWire; canvas: CanvasWire }> => {
  if (organizationId) await requireOrganizationAccess(principal, organizationId, { admin: true });
  const db = getFirestore();
  const workspaceId = `ws_${randomBytes(12).toString('hex')}`;
  const canvasId = `canvas_${randomBytes(12).toString('hex')}`;
  const name = cleanName(requestedName, 'Workspace');
  const workspaceRef = db.collection('workspaces').doc(workspaceId);
  const memberRef = db.collection('workspaceMembers').doc(workspaceMemberId(workspaceId, principal.uid));
  const canvasRef = workspaceRef.collection('canvases').doc(canvasId);
  await db.runTransaction(async (transaction) => {
    transaction.create(workspaceRef, {
      name,
      ownerId: principal.uid,
      organizationId: organizationId ?? null,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(memberRef, {
      workspaceId,
      uid: principal.uid,
      role: 'owner',
      status: 'active',
      joinedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(canvasRef, {
      workspaceId,
      name: 'Main canvas',
      createdBy: principal.uid,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return {
    workspace: {
      id: workspaceId,
      name,
      ownerId: principal.uid,
      organizationId: organizationId ?? null,
      role: 'owner',
      createdAt: null,
      updatedAt: null,
    },
    canvas: {
      id: canvasId,
      workspaceId,
      name: 'Main canvas',
      createdBy: principal.uid,
      createdAt: null,
      updatedAt: null,
    },
  };
};

export const listWorkspaces = async (principal: AuthenticatedPrincipal): Promise<WorkspaceWire[]> => {
  const db = getFirestore();
  const memberships = await db.collection('workspaceMembers')
    .where('uid', '==', principal.uid)
    .where('status', '==', 'active')
    .limit(200)
    .get();
  const workspaces = await Promise.all(memberships.docs.map(async (member) => {
    const memberData = member.data();
    if (typeof memberData.workspaceId !== 'string' || !WORKSPACE_ROLES.includes(memberData.role)) return null;
    const workspace = await db.collection('workspaces').doc(memberData.workspaceId).get();
    if (!workspace.exists || workspace.data()?.status !== 'active') return null;
    return workspaceWire(workspace.id, workspace.data()!, memberData.role as WorkspaceRole);
  }));
  return workspaces.filter((item): item is WorkspaceWire => item !== null);
};

export const getWorkspace = async (
  principal: Pick<AuthenticatedPrincipal, 'uid'>,
  workspaceId: string,
): Promise<WorkspaceWire> => {
  const access = await requireWorkspaceAccess(principal, workspaceId);
  return workspaceWire(workspaceId, access.workspace, access.role);
};

export const createCanvas = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  requestedName: unknown,
): Promise<CanvasWire> => {
  await requireWorkspaceAccess(principal, workspaceId, { write: true });
  const canvasId = `canvas_${randomBytes(12).toString('hex')}`;
  const name = cleanName(requestedName, 'Untitled canvas');
  const ref = getFirestore().collection('workspaces').doc(workspaceId).collection('canvases').doc(canvasId);
  await ref.create({
    workspaceId,
    name,
    createdBy: principal.uid,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: canvasId, workspaceId, name, createdBy: principal.uid, createdAt: null, updatedAt: null };
};

export const updateCanvasMetadata = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  canvasId: string,
  requestedName: unknown,
): Promise<CanvasWire> => {
  const { canvas } = await requireCanvasAccess(principal, workspaceId, canvasId, { write: true });
  const name = cleanName(requestedName, 'Canvas');
  await canvas.ref.set({ name, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return canvasWire(workspaceId, canvasId, { ...canvas.data(), name });
};

export const listCanvases = async (
  principal: Pick<AuthenticatedPrincipal, 'uid'>,
  workspaceId: string,
): Promise<CanvasWire[]> => {
  await requireWorkspaceAccess(principal, workspaceId);
  const snapshot = await getFirestore().collection('workspaces').doc(workspaceId)
    .collection('canvases').where('status', '==', 'active').limit(200).get();
  return snapshot.docs.map((document) => canvasWire(workspaceId, document.id, document.data()));
};

export const requireCanvasAccess = async (
  principal: Pick<AuthenticatedPrincipal, 'uid'>,
  workspaceId: string,
  canvasId: string,
  options: { write?: boolean } = {},
): Promise<{ access: WorkspaceAccess; canvas: DocumentData }> => {
  requireResourceId(canvasId, 'canvas');
  const access = await requireWorkspaceAccess(principal, workspaceId, options);
  const canvas = await getFirestore().collection('workspaces').doc(workspaceId).collection('canvases').doc(canvasId).get();
  if (!canvas.exists || canvas.data()?.workspaceId !== workspaceId || canvas.data()?.status !== 'active') {
    throw new HttpError(404, 'Canvas not found.');
  }
  return { access, canvas: canvas.data()! };
};

export const listWorkspaceMembers = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
): Promise<WorkspaceMemberWire[]> => {
  await requireWorkspaceAccess(principal, workspaceId);
  const db = getFirestore();
  const memberships = await db.collection('workspaceMembers')
    .where('workspaceId', '==', workspaceId)
    .where('status', '==', 'active')
    .limit(250)
    .get();
  return Promise.all(memberships.docs.map(async (membership) => {
    const data = membership.data();
    const identity = await db.collection('users').doc(String(data.uid)).get();
    return {
      uid: String(data.uid),
      role: data.role as WorkspaceRole,
      status: 'active' as const,
      displayName: typeof identity.data()?.displayName === 'string' ? identity.data()?.displayName : null,
      email: typeof identity.data()?.email === 'string' ? identity.data()?.email : null,
      joinedAt: timestampToIso(data.joinedAt),
    };
  }));
};

export const createWorkspaceInvite = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  roleValue: unknown,
  expiresInHoursValue: unknown,
  inviteBaseUrl: string,
): Promise<{ id: string; inviteUrl: string; expiresAt: string; role: 'member' | 'viewer' }> => {
  const access = await requireWorkspaceAccess(principal, workspaceId, { admin: true });
  const role = roleValue === 'viewer' ? 'viewer' : roleValue === undefined || roleValue === 'member' ? 'member' : null;
  if (!role) throw new HttpError(400, 'Invite role must be member or viewer.');
  const expiresInHours = expiresInHoursValue === undefined ? 72 : Number(expiresInHoursValue);
  if (!Number.isInteger(expiresInHours) || expiresInHours < 1 || expiresInHours > 24 * 30) {
    throw new HttpError(400, 'Invite expiry must be between 1 and 720 hours.');
  }
  const token = randomBytes(32).toString('base64url');
  const id = sha256(token);
  const expiresAt = Timestamp.fromMillis(Date.now() + expiresInHours * 60 * 60 * 1_000);
  await getFirestore().collection('workspaceInvites').doc(id).create({
    tokenHash: id,
    tokenHint: token.slice(0, 6),
    workspaceId,
    workspaceName: String(access.workspace.name ?? 'Workspace'),
    organizationId: typeof access.workspace.organizationId === 'string' ? access.workspace.organizationId : null,
    role,
    status: 'active',
    maxUses: 1,
    useCount: 0,
    createdBy: principal.uid,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
  });
  return {
    id,
    inviteUrl: `${inviteBaseUrl.replace(/\/$/, '')}/invite/${encodeURIComponent(token)}`,
    expiresAt: expiresAt.toDate().toISOString(),
    role,
  };
};

const requireInviteToken = (value: unknown): string => {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{40,80}$/.test(value)) {
    throw new HttpError(404, 'Invite not found.');
  }
  return value;
};

const validateInvite = (data: DocumentData | undefined): void => {
  if (!data || data.status !== 'active') throw new HttpError(410, 'This invite is no longer active.');
  if (!(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now()) {
    throw new HttpError(410, 'This invite has expired.');
  }
  if (Number(data.useCount ?? 0) >= Number(data.maxUses ?? 1)) {
    throw new HttpError(410, 'This invite has already been used.');
  }
  if (typeof data.workspaceId !== 'string' || !ID_PATTERN.test(data.workspaceId)) {
    throw new HttpError(404, 'Invite not found.');
  }
};

export const inspectWorkspaceInvite = async (
  principal: AuthenticatedPrincipal,
  tokenValue: unknown,
): Promise<{ workspaceId: string; workspaceName: string; role: string; expiresAt: string }> => {
  void principal;
  const token = requireInviteToken(tokenValue);
  const invite = await getFirestore().collection('workspaceInvites').doc(sha256(token)).get();
  const data = invite.data();
  validateInvite(data);
  const workspace = await getFirestore().collection('workspaces').doc(data!.workspaceId).get();
  if (!workspace.exists || workspace.data()?.status !== 'active') throw new HttpError(410, 'This invite is no longer valid.');
  return {
    workspaceId: workspace.id,
    workspaceName: String(workspace.data()?.name ?? 'Workspace'),
    role: String(data!.role),
    expiresAt: (data!.expiresAt as Timestamp).toDate().toISOString(),
  };
};

export const acceptWorkspaceInvite = async (
  principal: AuthenticatedPrincipal,
  tokenValue: unknown,
): Promise<{ workspaceId: string; membershipCreated: boolean }> => {
  const token = requireInviteToken(tokenValue);
  const db = getFirestore();
  const inviteRef = db.collection('workspaceInvites').doc(sha256(token));
  return db.runTransaction(async (transaction) => {
    const invite = await transaction.get(inviteRef);
    const inviteData = invite.data();
    validateInvite(inviteData);
    const workspaceId = inviteData!.workspaceId as string;
    const workspaceRef = db.collection('workspaces').doc(workspaceId);
    const memberRef = db.collection('workspaceMembers').doc(workspaceMemberId(workspaceId, principal.uid));
    const [workspace, existingMember] = await Promise.all([
      transaction.get(workspaceRef),
      transaction.get(memberRef),
    ]);
    if (!workspace.exists || workspace.data()?.status !== 'active') throw new HttpError(410, 'This invite is no longer valid.');
    const organizationId = workspace.data()?.organizationId;
    let organizationMemberRef: DocumentReference | null = null;
    let organizationMember: DocumentData | undefined;
    if (typeof organizationId === 'string') {
      organizationMemberRef = db.collection('organizationMembers').doc(organizationMemberId(organizationId, principal.uid));
      organizationMember = (await transaction.get(organizationMemberRef)).data();
      if (organizationMember?.status === 'revoked') throw new HttpError(403, 'Organization membership has been revoked.');
    }
    const alreadyActive = existingMember.data()?.status === 'active';
    if (!alreadyActive) {
      transaction.set(memberRef, {
        workspaceId,
        uid: principal.uid,
        role: inviteData!.role,
        status: 'active',
        joinedAt: FieldValue.serverTimestamp(),
        inviteId: invite.id,
      });
    }
    if (organizationMemberRef && !organizationMember) {
      transaction.create(organizationMemberRef, {
        organizationId,
        uid: principal.uid,
        role: 'member',
        status: 'active',
        joinedAt: FieldValue.serverTimestamp(),
        inviteId: invite.id,
      });
    }
    transaction.update(inviteRef, {
      status: 'consumed',
      useCount: FieldValue.increment(1),
      consumedBy: principal.uid,
      consumedAt: FieldValue.serverTimestamp(),
    });
    return { workspaceId, membershipCreated: !alreadyActive };
  });
};

export const revokeWorkspaceInvite = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  inviteIdValue: unknown,
): Promise<void> => {
  await requireWorkspaceAccess(principal, workspaceId, { admin: true });
  const inviteId = typeof inviteIdValue === 'string' && /^[a-f0-9]{64}$/i.test(inviteIdValue)
    ? inviteIdValue
    : '';
  if (!inviteId) throw new HttpError(400, 'Invalid invite identifier.');
  const ref = getFirestore().collection('workspaceInvites').doc(inviteId);
  const invite = await ref.get();
  if (!invite.exists || invite.data()?.workspaceId !== workspaceId) throw new HttpError(404, 'Invite not found.');
  await ref.set({ status: 'revoked', revokedBy: principal.uid, revokedAt: FieldValue.serverTimestamp() }, { merge: true });
};

export const createMcpAccessToken = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  labelValue: unknown,
): Promise<{ token: string; tokenId: string; label: string; workspaceId: string; createdAt: string }> => {
  const access = await requireWorkspaceAccess(principal, workspaceId);
  const label = cleanName(labelValue ?? 'My agent', 'My agent');
  const secret = randomBytes(32).toString('base64url');
  const token = `ag_mcp_${secret}`;
  const tokenId = sha256(token);
  await getFirestore().collection('mcpAccessTokens').doc(tokenId).create({
    tokenHash: tokenId,
    tokenHint: token.slice(-6),
    workspaceId,
    uid: principal.uid,
    label,
    scopes: EDITOR_ROLES.has(access.role)
      ? ['workspace:read', 'canvas:read', 'canvas:write']
      : ['workspace:read', 'canvas:read'],
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    lastUsedAt: null,
  });
  return { token, tokenId, label, workspaceId, createdAt: new Date().toISOString() };
};

export const listMcpAccessTokens = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
): Promise<Array<{ tokenId: string; label: string; hint: string; status: string; createdAt: string | null }>> => {
  await requireWorkspaceAccess(principal, workspaceId);
  const snapshot = await getFirestore().collection('mcpAccessTokens')
    .where('uid', '==', principal.uid)
    .where('workspaceId', '==', workspaceId)
    .limit(100)
    .get();
  return snapshot.docs.map((document) => ({
    tokenId: document.id,
    label: String(document.data().label ?? 'Agent token'),
    hint: String(document.data().tokenHint ?? ''),
    status: String(document.data().status ?? 'revoked'),
    createdAt: timestampToIso(document.data().createdAt),
  }));
};

export const revokeMcpAccessToken = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  tokenIdValue: unknown,
): Promise<void> => {
  await requireWorkspaceAccess(principal, workspaceId);
  const tokenId = typeof tokenIdValue === 'string' && /^[a-f0-9]{64}$/i.test(tokenIdValue) ? tokenIdValue : '';
  if (!tokenId) throw new HttpError(400, 'Invalid MCP token identifier.');
  const ref = getFirestore().collection('mcpAccessTokens').doc(tokenId);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.data()?.uid !== principal.uid || snapshot.data()?.workspaceId !== workspaceId) {
    throw new HttpError(404, 'MCP token not found.');
  }
  await ref.set({ status: 'revoked', revokedAt: FieldValue.serverTimestamp() }, { merge: true });
};

export const requireMcpAccessToken = async (authorization: string | undefined): Promise<McpPrincipal> => {
  if (!authorization?.startsWith('Bearer ')) throw new HttpError(401, 'MCP authentication required.');
  const token = authorization.slice(7).trim();
  if (!/^ag_mcp_[A-Za-z0-9_-]{40,80}$/.test(token)) throw new HttpError(401, 'MCP authentication required.');
  const tokenId = sha256(token);
  const ref = getFirestore().collection('mcpAccessTokens').doc(tokenId);
  const snapshot = await ref.get();
  const data = snapshot.data();
  if (!snapshot.exists || data?.status !== 'active' || typeof data.uid !== 'string' || typeof data.workspaceId !== 'string') {
    throw new HttpError(401, 'MCP authentication required.');
  }
  await requireWorkspaceAccess({ uid: data.uid }, data.workspaceId);
  void ref.set({ lastUsedAt: FieldValue.serverTimestamp() }, { merge: true });
  return {
    uid: data.uid,
    workspaceId: data.workspaceId,
    tokenId,
    scopes: Array.isArray(data.scopes) ? data.scopes.filter((scope): scope is string => typeof scope === 'string') : [],
  };
};

const MAX_EXCALIDRAW_CLOCK = 2_147_483_647;
const SERIALIZED_ELEMENT_FIELD = '__algoglyphSerializedElementV1';

const serializeCanvasElement = (element: Record<string, unknown>) => ({
  id: element.id,
  version: element.version,
  versionNonce: element.versionNonce,
  [SERIALIZED_ELEMENT_FIELD]: JSON.stringify(element),
});

const deserializeCanvasElement = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const stored = value as Record<string, unknown>;
  const serialized = stored[SERIALIZED_ELEMENT_FIELD];
  if (typeof serialized !== 'string') return stored;
  try {
    const parsed: unknown = JSON.parse(serialized);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
};

const elementClock = (element: Record<string, unknown>): [number, number] => [
  Number.isSafeInteger(element.version) ? Number(element.version) : 0,
  Number.isSafeInteger(element.versionNonce) ? Number(element.versionNonce) : 0,
];

const incomingWins = (incoming: Record<string, unknown>, current: DocumentData | undefined): boolean => {
  if (!current) return true;
  const [incomingVersion, incomingNonce] = elementClock(incoming);
  const currentVersion = Number(current.version ?? 0);
  const currentNonce = Number(current.versionNonce ?? 0);
  return incomingVersion > currentVersion || (incomingVersion === currentVersion && incomingNonce < currentNonce);
};

export const listCanvasElements = async (
  principal: Pick<AuthenticatedPrincipal, 'uid'>,
  workspaceId: string,
  canvasId: string,
): Promise<Record<string, unknown>[]> => {
  await requireCanvasAccess(principal, workspaceId, canvasId);
  const snapshot = await getFirestore().collection('workspaces').doc(workspaceId)
    .collection('canvases').doc(canvasId).collection('elements').limit(10_000).get();
  return snapshot.docs.flatMap((document) => {
    const element = deserializeCanvasElement(document.data().element);
    return element ? [element] : [];
  });
};

export const applyCanvasElementMutations = async (
  principal: Pick<AuthenticatedPrincipal, 'uid'>,
  workspaceId: string,
  canvasId: string,
  values: unknown,
): Promise<{ applied: number; stale: number }> => {
  await requireCanvasAccess(principal, workspaceId, canvasId, { write: true });
  if (!Array.isArray(values) || values.length === 0 || values.length > 200) {
    throw new HttpError(400, 'Provide between 1 and 200 canvas elements.');
  }
  const elements = values.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Invalid canvas element.');
    const element = value as Record<string, unknown>;
    if (typeof element.id !== 'string' || !ELEMENT_ID_PATTERN.test(element.id)) throw new HttpError(400, 'Invalid element identifier.');
    const [version, versionNonce] = elementClock(element);
    if (!Number.isSafeInteger(element.version) || !Number.isSafeInteger(element.versionNonce)
      || version < 1 || version > MAX_EXCALIDRAW_CLOCK
      || versionNonce < 0 || versionNonce > MAX_EXCALIDRAW_CLOCK
      || JSON.stringify(element).length > 200_000) {
      throw new HttpError(400, 'Invalid canvas element version or size.');
    }
    return { element, version, versionNonce };
  });
  const db = getFirestore();
  return db.runTransaction(async (transaction) => {
    const refs = elements.map(({ element }) => db.collection('workspaces').doc(workspaceId)
      .collection('canvases').doc(canvasId).collection('elements').doc(String(element.id)));
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    let applied = 0;
    let stale = 0;
    elements.forEach(({ element, version, versionNonce }, index) => {
      const snapshot = snapshots[index];
      const ref = refs[index];
      if (!snapshot || !ref || !incomingWins(element, snapshot.data())) {
        stale += 1;
        return;
      }
      transaction.set(ref, {
        workspaceId,
        canvasId,
        elementId: element.id,
        element: serializeCanvasElement(element),
        version,
        versionNonce,
        isDeleted: element.isDeleted === true,
        updatedBy: principal.uid,
        updatedAt: FieldValue.serverTimestamp(),
      });
      applied += 1;
    });
    if (applied > 0) {
      transaction.set(db.collection('workspaces').doc(workspaceId).collection('canvases').doc(canvasId), {
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    return { applied, stale };
  });
};
