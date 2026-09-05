import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Building2, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import { WorkspaceAccountControl } from './AccountControls';
import { LoadingSpinner } from './LoadingSpinner';
import {
  createCloudOrganization,
  createCloudWorkspace,
  getCloudWorkspace,
  getWorkspaceConfigurationError,
  listCloudOrganizations,
  listCloudWorkspaces,
} from '../lib/workspaces/workspaceClient';
import type { CloudOrganization, CloudWorkspace, WorkspaceApiTokens } from '../lib/workspaces/types';

export const CloudWorkspacesPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<CloudWorkspace[]>([]);
  const [organizations, setOrganizations] = useState<CloudOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokens = useCallback(async (): Promise<WorkspaceApiTokens> => {
    const [idToken, appCheckToken] = await Promise.all([auth.actions.getIdToken(), auth.actions.getAppCheckToken()]);
    return { idToken, appCheckToken };
  }, [auth.actions]);

  const refresh = useCallback(async () => {
    if (auth.state.status !== 'authenticated') return;
    setLoading(true);
    try {
      const apiTokens = await tokens();
      const [workspaceResult, organizationResult] = await Promise.all([
        listCloudWorkspaces(apiTokens), listCloudOrganizations(apiTokens),
      ]);
      setWorkspaces(workspaceResult.workspaces);
      setOrganizations(organizationResult.organizations);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load cloud workspaces.');
    } finally {
      setLoading(false);
    }
  }, [auth.state.status, tokens]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const createWorkspace = async () => {
    const name = window.prompt('Workspace name');
    if (!name?.trim()) return;
    const organizationId = organizations.length
      ? (window.prompt(`Optional organization ID:\n${organizations.map((item) => `${item.name}: ${item.id}`).join('\n')}`) || undefined)
      : undefined;
    setLoading(true);
    try {
      const result = await createCloudWorkspace(await tokens(), name, organizationId);
      navigate(`/workspace/${result.workspace.id}/canvas/${result.canvas.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create workspace.');
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    const name = window.prompt('Organization name');
    if (!name?.trim()) return;
    setLoading(true);
    try {
      await createCloudOrganization(await tokens(), name);
      await refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create organization.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas px-5 py-6 text-ink md:px-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between">
        <button type="button" onClick={() => navigate('/')} className="inline-flex cursor-pointer items-center gap-2 text-sm text-mute hover:text-ink">
          <ArrowLeft size={15} /> AlgoGlyph
        </button>
        <WorkspaceAccountControl />
      </header>
      <section className="mx-auto mt-14 max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-mute">Cloud collaboration</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your workspaces</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-body">Invite members, edit the same canvas live, or connect your own agent through free workspace-scoped MCP.</p>
          </div>
          {auth.state.status === 'authenticated' ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => void createOrganization()} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-xs hover:bg-canvas-soft"><Building2 size={14} /> Organization</button>
              <button type="button" onClick={() => void createWorkspace()} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-canvas"><Plus size={14} /> Workspace</button>
            </div>
          ) : null}
        </div>

        {auth.state.status !== 'authenticated' ? (
          <div className="mt-10 rounded-2xl border border-hairline bg-canvas-soft p-8 text-center">
            <Users className="mx-auto text-mute" size={28} />
            <p className="mt-3 text-sm font-medium">Sign in to create or join collaborative workspaces.</p>
            <p className="mt-1 text-xs text-mute">Your existing local workspace remains available without an account.</p>
          </div>
        ) : getWorkspaceConfigurationError() ? (
          <p className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-600">{getWorkspaceConfigurationError()}</p>
        ) : loading && workspaces.length === 0 ? (
          <div className="mt-12 flex items-center gap-2 text-sm text-mute"><LoadingSpinner size={16} /> Loading workspaces…</div>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <button key={workspace.id} type="button" onClick={async () => {
                try {
                  const result = await getCloudWorkspace(await tokens(), workspace.id);
                  if (result.canvases[0]) navigate(`/workspace/${workspace.id}/canvas/${result.canvases[0].id}`);
                } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not open workspace.'); }
              }} className="cursor-pointer rounded-xl border border-hairline bg-canvas p-5 text-left transition-colors hover:bg-canvas-soft">
                <p className="font-medium">{workspace.name}</p>
                <p className="mt-2 text-xs text-mute">{workspace.organizationId ? 'Organization' : 'Personal'} · {workspace.role}</p>
              </button>
            ))}
            {!workspaces.length ? <p className="text-sm text-mute">No cloud workspaces yet.</p> : null}
          </div>
        )}
        {error ? <p role="alert" className="mt-5 text-sm text-rose-500">{error}</p> : null}
      </section>
    </main>
  );
};
