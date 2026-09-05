export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type OrganizationRole = 'owner' | 'admin' | 'billing_admin' | 'member';

export interface CloudWorkspace {
  id: string;
  name: string;
  ownerId: string;
  organizationId: string | null;
  role: WorkspaceRole;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CloudCanvas {
  id: string;
  workspaceId: string;
  name: string;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CloudOrganization {
  id: string;
  name: string;
  ownerId: string;
  role: OrganizationRole;
}

export interface WorkspaceMember {
  uid: string;
  role: WorkspaceRole;
  status: 'active';
  displayName: string | null;
  email: string | null;
  joinedAt: string | null;
}

export interface WorkspaceApiTokens {
  idToken: string;
  appCheckToken: string;
}

export interface WorkspaceInvite {
  id: string;
  inviteUrl: string;
  role: Extract<WorkspaceRole, 'member' | 'viewer'>;
  expiresAt: string;
}

export interface McpAccessToken {
  tokenId: string;
  label: string;
  workspaceId: string;
  createdAt: string | null;
  lastUsedAt: string | null;
}
