import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Building2, Plus, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import { WorkspaceAccountControl } from './AccountControls';
import { LoadingSpinner } from './LoadingSpinner';
import {
  createCloudOrganization,
  createCloudWorkspace,
  getCloudWorkspace,
  listCloudOrganizations,
  listCloudWorkspaces,
} from '../lib/workspaces/workspaceClient';
import type { CloudOrganization, CloudWorkspace } from '../lib/workspaces/types';

type CreationDialog = 'workspace' | 'organization' | null;

export const CloudWorkspacesPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<CloudWorkspace[]>([]);
  const [organizations, setOrganizations] = useState<CloudOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [creationDialog, setCreationDialog] = useState<CreationDialog>(null);
  const [draftName, setDraftName] = useState('');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (auth.state.status !== 'authenticated') return;
    setLoading(true);
    setError(null);
    try {
      const [workspaceResult, organizationResult] = await Promise.all([
        listCloudWorkspaces(), listCloudOrganizations(),
      ]);
      setWorkspaces(workspaceResult.workspaces);
      setOrganizations(organizationResult.organizations);
      setError(null);
      setLoadFailed(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load cloud workspaces.');
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [auth.state.status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const openCreationDialog = (kind: Exclude<CreationDialog, null>) => {
    setCreationDialog(kind);
    setDraftName('');
    setSelectedOrganizationId('');
    setDialogError(null);
  };

  const closeCreationDialog = () => {
    if (saving) return;
    setCreationDialog(null);
    setDialogError(null);
  };

  useEffect(() => {
    if (!creationDialog) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) {
        setCreationDialog(null);
        setDialogError(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [creationDialog, saving]);

  const submitCreation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!creationDialog) return;
    const name = draftName.trim();
    if (!name) {
      setDialogError('Enter a name to continue.');
      return;
    }
    setSaving(true);
    setDialogError(null);
    try {
      if (creationDialog === 'workspace') {
        const result = await createCloudWorkspace(name, selectedOrganizationId || undefined);
        setCreationDialog(null);
        navigate(`/workspace/${result.workspace.id}/canvas/${result.canvas.id}`);
      } else {
        const { organization } = await createCloudOrganization(name);
        setOrganizations((current) => [organization, ...current.filter((item) => item.id !== organization.id)]);
        setError(null);
        setLoadFailed(false);
        setCreationDialog(null);
        await refresh();
      }
    } catch (requestError) {
      setDialogError(requestError instanceof Error ? requestError.message : `Could not create ${creationDialog}.`);
    } finally {
      setSaving(false);
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
              <button type="button" onClick={() => openCreationDialog('organization')} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-hairline px-3 py-2 text-xs hover:bg-canvas-soft"><Building2 size={14} /> Organization</button>
              <button type="button" onClick={() => openCreationDialog('workspace')} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-canvas"><Plus size={14} /> Workspace</button>
            </div>
          ) : null}
        </div>

        {auth.state.status !== 'authenticated' ? (
          <div className="mt-10 rounded-2xl border border-hairline bg-canvas-soft p-8 text-center">
            <Users className="mx-auto text-mute" size={28} />
            <p className="mt-3 text-sm font-medium">Sign in to create or join collaborative workspaces.</p>
            <p className="mt-1 text-xs text-mute">Your existing local workspace remains available without an account.</p>
          </div>
        ) : (
          <>
            {organizations.length > 0 ? (
              <section className="mt-10" aria-labelledby="organizations-heading">
                <h2 id="organizations-heading" className="text-sm font-semibold text-ink">Organizations</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {organizations.map((organization) => (
                    <div key={organization.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-canvas p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas-soft text-mute"><Building2 size={16} /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{organization.name}</p>
                        <p className="mt-0.5 text-xs capitalize text-mute">{organization.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {loading && workspaces.length === 0 ? (
              <div className="mt-12 flex items-center gap-2 text-sm text-mute"><LoadingSpinner size={16} /> Loading workspaces…</div>
            ) : loadFailed && workspaces.length === 0 ? (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4">
                <div>
                  <p className="text-sm font-medium text-ink">Couldn’t load your workspaces</p>
                  <p role="alert" className="mt-1 text-sm text-rose-500">{error || 'Could not reach the AlgoGlyph service.'}</p>
                </div>
                <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-hairline px-3 text-sm font-medium text-ink hover:bg-canvas-soft disabled:cursor-wait disabled:opacity-60">Try again</button>
              </div>
            ) : (
              <section className="mt-10" aria-labelledby="workspaces-heading">
                <h2 id="workspaces-heading" className="text-sm font-semibold text-ink">Workspaces</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {workspaces.map((workspace) => (
                    <button key={workspace.id} type="button" onClick={async () => {
                      try {
                        const result = await getCloudWorkspace(workspace.id);
                        if (result.canvases[0]) navigate(`/workspace/${workspace.id}/canvas/${result.canvases[0].id}`);
                      } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not open workspace.'); }
                    }} className="cursor-pointer rounded-xl border border-hairline bg-canvas p-5 text-left transition-colors hover:bg-canvas-soft">
                      <p className="font-medium">{workspace.name}</p>
                      <p className="mt-2 text-xs text-mute">{workspace.organizationId ? 'Organization' : 'Personal'} · {workspace.role}</p>
                    </button>
                  ))}
                  {!workspaces.length ? <p className="text-sm text-mute">No cloud workspaces yet.</p> : null}
                </div>
              </section>
            )}
          </>
        )}
        {error && !loadFailed ? <p role="alert" className="mt-5 text-sm text-rose-500">{error}</p> : null}
      </section>

      {creationDialog ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreationDialog();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cloud-create-title"
            aria-describedby="cloud-create-description"
            className="relative w-full max-w-md rounded-2xl border border-hairline bg-canvas p-6 text-ink shadow-[var(--shadow-soft)]"
          >
            <button type="button" onClick={closeCreationDialog} disabled={saving} aria-label="Close dialog" className="absolute right-4 top-4 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-mute transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link disabled:cursor-not-allowed disabled:opacity-50">
              <X size={16} />
            </button>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-mute">Cloud collaboration</p>
            <h2 id="cloud-create-title" className="mt-2 pr-8 text-xl font-semibold tracking-tight">
              {creationDialog === 'workspace' ? 'Create a workspace' : 'Create an organization'}
            </h2>
            <p id="cloud-create-description" className="mt-2 text-sm leading-6 text-body">
              {creationDialog === 'workspace'
                ? 'Give your shared workspace a name. You can invite collaborators after it’s created.'
                : 'Organizations help your team manage shared workspaces together.'}
            </p>

            <form className="mt-6 space-y-4" onSubmit={(event) => void submitCreation(event)}>
              <div>
                <label htmlFor="cloud-create-name" className="mb-1.5 block text-sm font-medium text-ink">
                  {creationDialog === 'workspace' ? 'Workspace name' : 'Organization name'}
                </label>
                <input
                  id="cloud-create-name"
                  name="name"
                  type="text"
                  autoFocus
                  required
                  maxLength={100}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder={creationDialog === 'workspace' ? 'e.g. Interview prep' : 'e.g. Acme Engineering'}
                  className="h-11 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-ink placeholder:text-mute focus:border-link focus:outline-none focus:ring-2 focus:ring-link/20"
                />
              </div>

              {creationDialog === 'workspace' ? (
                <div>
                  <label htmlFor="cloud-create-organization" className="mb-1.5 block text-sm font-medium text-ink">Organization <span className="font-normal text-mute">(optional)</span></label>
                  <select
                    id="cloud-create-organization"
                    value={selectedOrganizationId}
                    onChange={(event) => setSelectedOrganizationId(event.target.value)}
                    className="h-11 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm text-ink focus:border-link focus:outline-none focus:ring-2 focus:ring-link/20"
                  >
                    <option value="">Personal workspace</option>
                    {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
                  </select>
                </div>
              ) : null}

              {dialogError ? <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 text-sm text-rose-500">{dialogError}</p> : null}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeCreationDialog} disabled={saving} className="h-10 cursor-pointer rounded-lg px-4 text-sm font-medium text-body transition-colors hover:bg-canvas-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex h-10 min-w-36 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
                  {saving ? <><LoadingSpinner size={14} inverted /> Creating…</> : creationDialog === 'workspace' ? 'Create workspace' : 'Create organization'}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
};
