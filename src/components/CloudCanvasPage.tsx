import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Bot, Check, Copy, Link2, Plug, Plus, UserPlus, Users, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from './Canvas';
import { BillingDialog } from './BillingDialog';
import { WorkspaceAccountControl } from './AccountControls';
import { useAuth } from './authContext';
import { LoadingSpinner } from './LoadingSpinner';
import type { CanvasSyncStatus } from '../lib/workspaces/canvasCollaboration';
import {
  createMcpToken,
  createCloudCanvas,
  createWorkspaceInvite,
  getCloudWorkspace,
  listWorkspaceMembers,
  revokeWorkspaceInvite,
} from '../lib/workspaces/workspaceClient';
import type { WorkspaceInvite } from '../lib/workspaces/types';
import type { CloudCanvas, CloudWorkspace, WorkspaceApiTokens, WorkspaceMember } from '../lib/workspaces/types';

type WorkspaceDialog = 'canvas' | 'invite' | 'members' | 'mcp' | null;

export const CloudCanvasPage = () => {
  const { workspaceId = '', canvasId = '' } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<CloudWorkspace | null>(null);
  const [canvas, setCanvas] = useState<CloudCanvas | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [canvases, setCanvases] = useState<CloudCanvas[]>([]);
  const [invite, setInvite] = useState<WorkspaceInvite | null>(null);
  const [dialog, setDialog] = useState<WorkspaceDialog>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [canvasName, setCanvasName] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [mcpSetup, setMcpSetup] = useState<string | null>(null);
  const [mcpCopied, setMcpCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborationStatus, setCollaborationStatus] = useState<CanvasSyncStatus>('connecting');
  const [collaborationError, setCollaborationError] = useState<string | null>(null);
  const [billingOpen, setBillingOpen] = useState(false);
  const inviteInputRef = useRef<HTMLInputElement>(null);
  const mcpSetupRef = useRef<HTMLTextAreaElement>(null);

  const collaboration = useMemo(() => {
    if (auth.state.status !== 'authenticated' || !auth.state.user) return undefined;
    return { workspaceId, canvasId, user: auth.state.user };
  }, [auth.state.status, auth.state.user, canvasId, workspaceId]);
  const handleCollaborationStatus = useCallback((status: CanvasSyncStatus, message?: string) => {
    setCollaborationStatus(status);
    setCollaborationError(message ?? null);
  }, []);

  const tokens = useCallback(async (): Promise<WorkspaceApiTokens> => {
    const [idToken, appCheckToken] = await Promise.all([auth.actions.getIdToken(), auth.actions.getAppCheckToken()]);
    return { idToken, appCheckToken };
  }, [auth.actions]);

  useEffect(() => {
    if (auth.state.status !== 'authenticated') return;
    let cancelled = false;
    void (async () => {
      try {
        const detail = await getCloudWorkspace(workspaceId);
        const selected = detail.canvases.find((item) => item.id === canvasId);
        if (!selected) throw new Error('Canvas not found in this workspace.');
        const memberResult = await listWorkspaceMembers(workspaceId).catch(() => ({ members: [] }));
        if (!cancelled) {
          setError(null);
          setWorkspace(detail.workspace);
          setCanvas(selected);
          setCanvases(detail.canvases);
          setMembers(memberResult.members);
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Workspace access denied.');
      }
    })();
    return () => { cancelled = true; };
  }, [auth.state.status, canvasId, workspaceId]);

  useEffect(() => {
    if (!dialog) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !dialogBusy) setDialog(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [dialog, dialogBusy]);

  const openDialog = (next: Exclude<WorkspaceDialog, null>) => {
    setDialog(next);
    setDialogError(null);
    if (next === 'canvas') setCanvasName('');
    if (next === 'invite') setInviteCopied(false);
    if (next === 'mcp') { setMcpSetup(null); setMcpCopied(false); }
  };

  const inviteCollaborator = async () => {
    openDialog('invite');
    setDialogBusy(true);
    setInvite(null);
    try {
      const result = await createWorkspaceInvite(workspaceId);
      setInvite(result.invite);
      setError(null);
    } catch (requestError) {
      setDialogError(requestError instanceof Error ? requestError.message : 'Could not create the invite link.');
    } finally {
      setDialogBusy(false);
    }
  };

  const submitCanvas = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = canvasName.trim();
    if (!name) { setDialogError('Enter a canvas name to continue.'); return; }
    setDialogBusy(true);
    setDialogError(null);
    try {
      const result = await createCloudCanvas(workspaceId, name);
      setCanvases((current) => [...current, result.canvas]);
      setDialog(null);
      navigate(`/workspace/${workspaceId}/canvas/${result.canvas.id}`);
    } catch (requestError) {
      setDialogError(requestError instanceof Error ? requestError.message : 'Could not create the canvas.');
    } finally {
      setDialogBusy(false);
    }
  };

  const revokeInvite = async () => {
    if (!invite) return;
    setDialogBusy(true);
    setDialogError(null);
    try {
      await revokeWorkspaceInvite(workspaceId, invite.id);
      setInvite(null);
      setDialog(null);
    } catch (requestError) {
      setDialogError(requestError instanceof Error ? requestError.message : 'Could not revoke this invite.');
    } finally {
      setDialogBusy(false);
    }
  };

  const copyInvite = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.inviteUrl);
      setInviteCopied(true);
      setDialogError(null);
    } catch {
      inviteInputRef.current?.select();
      setDialogError('The link is selected. Copy it with Ctrl+C or Command+C.');
    }
  };

  const connectWorkspaceMcp = async () => {
    openDialog('mcp');
    setDialogBusy(true);
    try {
      const result = await createMcpToken(await tokens(), workspaceId, 'My agent');
      const endpoint = `${(import.meta.env.VITE_ALGOGLYPH_API_URL || import.meta.env.VITE_BILLING_API_URL || '').replace(/\/$/, '')}/v1/mcp`;
      setMcpSetup(`${result.token}\n${endpoint}`);
    } catch (requestError) {
      setDialogError(requestError instanceof Error ? requestError.message : 'Could not connect a workspace MCP client.');
    } finally {
      setDialogBusy(false);
    }
  };

  const copyMcpSetup = async () => {
    if (!mcpSetup) return;
    try {
      await navigator.clipboard.writeText(mcpSetup);
      setMcpCopied(true);
      setDialogError(null);
    } catch {
      mcpSetupRef.current?.select();
      setDialogError('The connection details are selected. Copy them with Ctrl+C or Command+C.');
    }
  };

  if (auth.state.status !== 'authenticated' || !auth.state.user) {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas text-ink"><p className="text-sm">Sign in to verify workspace membership.</p><WorkspaceAccountControl /></main>;
  }
  if (error && !workspace) return <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center text-sm text-rose-500">{error}</main>;
  if (!workspace || !canvas) return <main className="flex min-h-screen items-center justify-center bg-canvas text-mute"><LoadingSpinner size={20} /> <span className="ml-2 text-sm">Verifying workspace membership…</span></main>;

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-canvas text-ink">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-hairline px-3">
        <button type="button" onClick={() => navigate('/workspaces')} className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-mute hover:text-ink"><ArrowLeft size={14} /> Workspaces</button>
        <span className="mx-1 h-4 w-px bg-hairline" />
        <strong className="truncate text-xs">{workspace.name}</strong>
        <select value={canvas.id} onChange={(event) => navigate(`/workspace/${workspaceId}/canvas/${event.target.value}`)} className="max-w-44 cursor-pointer bg-transparent text-xs text-mute outline-none" aria-label="Canvas">
          {canvases.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        {workspace.role !== 'viewer' ? <button type="button" onClick={() => openDialog('canvas')} className="cursor-pointer rounded p-1 text-mute hover:bg-canvas-soft hover:text-ink" aria-label="Create canvas"><Plus size={13} /></button> : null}
        <span className="ml-auto hidden text-[11px] text-mute md:inline">{members.length || 1} member{members.length === 1 ? '' : 's'}</span>
        <button type="button" onClick={() => openDialog('members')} className="cursor-pointer rounded-md border border-hairline p-1.5 text-mute hover:bg-canvas-soft hover:text-ink" aria-label="View members"><Users size={13} /></button>
        {(workspace.role === 'owner' || workspace.role === 'admin') ? <button type="button" onClick={() => void inviteCollaborator()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-[11px] hover:bg-canvas-soft"><UserPlus size={13} /> Invite</button> : null}
        <button type="button" onClick={() => void connectWorkspaceMcp()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-[11px] hover:bg-canvas-soft" title="Connect an external MCP client"><Plug size={13} /> Free MCP</button>
        <button type="button" onClick={() => setBillingOpen(true)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 text-[11px] text-canvas" title="Paid hosted agent"><Bot size={13} /> Managed agent</button>
        <WorkspaceAccountControl />
      </header>
      {error ? <div role="alert" className="border-b border-rose-400/30 bg-rose-400/5 px-3 py-2 text-xs text-rose-500">{error}</div> : null}
      <div className="min-h-0 flex-1 ph-no-capture">
        <Canvas collaboration={collaboration} onCollaborationStatus={handleCollaborationStatus} />
      </div>
      <div
        role="status"
        aria-live="polite"
        title={collaborationError || undefined}
        className={`absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-hairline bg-canvas/90 px-3 py-1.5 text-[10px] shadow-sm backdrop-blur ${collaborationStatus === 'error' ? 'text-rose-500' : collaborationStatus === 'syncing' ? 'text-amber-500' : 'text-mute'}`}
      >
        <Link2 className="mr-1 inline" size={11} />
        {collaborationStatus === 'connecting' ? 'Connecting to live canvas…' : collaborationStatus === 'syncing' ? 'Syncing canvas…' : collaborationStatus === 'error' ? 'Canvas sync issue · hover for details' : 'Live element-level sync · MCP stays free'}
      </div>
      {billingOpen ? <BillingDialog surface="workspace" onClose={() => setBillingOpen(false)} /> : null}

      {dialog ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !dialogBusy) setDialog(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="cloud-canvas-dialog-title" className="relative w-full max-w-md rounded-2xl border border-hairline bg-canvas p-6 text-ink shadow-[var(--shadow-modal)]">
            <button type="button" onClick={() => setDialog(null)} disabled={dialogBusy} aria-label="Close dialog" className="absolute right-4 top-4 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-mute transition-colors hover:bg-canvas-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"><X size={16} /></button>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-mute">Cloud collaboration</p>
            <h2 id="cloud-canvas-dialog-title" className="mt-2 pr-8 text-xl font-semibold tracking-tight">
              {dialog === 'canvas' ? 'Create a canvas' : dialog === 'invite' ? 'Invite a collaborator' : dialog === 'members' ? 'Workspace members' : 'Connect an MCP client'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-body">
              {dialog === 'canvas' ? 'Give the new canvas a name.' : dialog === 'invite' ? 'Share this single-use link with the person joining your workspace.' : dialog === 'members' ? 'People who currently have access to this workspace.' : 'Use these details to connect an external MCP client to this workspace.'}
            </p>

            {dialog === 'canvas' ? (
              <form className="mt-6 space-y-4" onSubmit={(event) => void submitCanvas(event)}>
                <div>
                  <label htmlFor="cloud-canvas-name" className="mb-1.5 block text-sm font-medium">Canvas name</label>
                  <input id="cloud-canvas-name" autoFocus required maxLength={100} value={canvasName} onChange={(event) => setCanvasName(event.target.value)} placeholder="e.g. Graph algorithms" className="h-11 w-full rounded-lg border border-hairline bg-canvas px-3 text-sm placeholder:text-mute focus:border-link focus:outline-none focus:ring-2 focus:ring-link/20" />
                </div>
                {dialogError ? <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 text-sm text-rose-500">{dialogError}</p> : null}
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setDialog(null)} disabled={dialogBusy} className="h-10 cursor-pointer rounded-lg px-4 text-sm font-medium text-body hover:bg-canvas-soft disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={dialogBusy} className="inline-flex h-10 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-canvas disabled:cursor-wait disabled:opacity-60">{dialogBusy ? <><LoadingSpinner size={14} inverted /> Creating…</> : 'Create canvas'}</button>
                </div>
              </form>
            ) : dialog === 'invite' ? (
              <div className="mt-6 space-y-4">
                {dialogBusy ? <div className="flex items-center gap-2 text-sm text-mute"><LoadingSpinner size={16} /> Creating a secure invite link…</div> : invite ? <>
                  <div>
                    <label htmlFor="workspace-invite-link" className="mb-1.5 block text-sm font-medium">Invite link · {invite.role} · expires {new Date(invite.expiresAt).toLocaleString()}</label>
                    <input ref={inviteInputRef} id="workspace-invite-link" readOnly value={invite.inviteUrl} onFocus={(event) => event.currentTarget.select()} className="h-11 w-full rounded-lg border border-hairline bg-canvas-soft px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-link/20" />
                  </div>
                  <div className="flex justify-between gap-2">
                    <button type="button" onClick={() => void revokeInvite()} className="h-10 cursor-pointer rounded-lg px-3 text-sm font-medium text-rose-500 hover:bg-rose-500/5">Revoke link</button>
                    <button type="button" onClick={() => void copyInvite()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-canvas">{inviteCopied ? <Check size={15} /> : <Copy size={15} />}{inviteCopied ? 'Copied' : 'Copy link'}</button>
                  </div>
                </> : null}
                {dialogError ? <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 text-sm text-rose-500">{dialogError}</p> : null}
                {!dialogBusy && !invite ? <div className="flex justify-end"><button type="button" onClick={() => setDialog(null)} className="h-10 cursor-pointer rounded-lg px-4 text-sm font-medium text-body hover:bg-canvas-soft">Close</button></div> : null}
              </div>
            ) : dialog === 'members' ? (
              <div className="mt-6 space-y-2">
                {members.length ? members.map((member) => (
                  <div key={member.uid} className="flex items-center gap-3 rounded-xl border border-hairline bg-canvas-soft p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-mute">{(member.displayName || member.email || member.uid).slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{member.displayName || member.email || member.uid}</p>{member.displayName && member.email ? <p className="truncate text-xs text-mute">{member.email}</p> : null}</div>
                    <span className="text-xs capitalize text-mute">{member.role}</span>
                  </div>
                )) : <p className="rounded-lg bg-canvas-soft p-4 text-sm text-mute">No member records are available yet.</p>}
                <div className="flex justify-end pt-2"><button type="button" onClick={() => setDialog(null)} className="h-10 cursor-pointer rounded-lg px-4 text-sm font-medium text-body hover:bg-canvas-soft">Close</button></div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {dialogBusy ? <div className="flex items-center gap-2 text-sm text-mute"><LoadingSpinner size={16} /> Preparing workspace connection…</div> : null}
                {mcpSetup ? <>
                  <label htmlFor="workspace-mcp-setup" className="block text-sm font-medium">Bearer token and endpoint</label>
                  <textarea ref={mcpSetupRef} id="workspace-mcp-setup" readOnly rows={3} value={mcpSetup} onFocus={(event) => event.currentTarget.select()} className="w-full resize-none rounded-lg border border-hairline bg-canvas-soft p-3 font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-link/20" />
                  <div className="flex justify-end"><button type="button" onClick={() => void copyMcpSetup()} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-canvas">{mcpCopied ? <Check size={15} /> : <Copy size={15} />}{mcpCopied ? 'Copied' : 'Copy details'}</button></div>
                </> : null}
                {dialogError ? <p role="alert" className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 text-sm text-rose-500">{dialogError}</p> : null}
                {!dialogBusy && !mcpSetup ? <div className="flex justify-end"><button type="button" onClick={() => setDialog(null)} className="h-10 cursor-pointer rounded-lg px-4 text-sm font-medium text-body hover:bg-canvas-soft">Close</button></div> : null}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
};

export const CloudWorkspaceEntryPage = () => {
  const { workspaceId = '' } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (auth.state.status !== 'authenticated') return;
    let cancelled = false;
    void (async () => {
      try {
        const detail = await getCloudWorkspace(workspaceId);
        if (!cancelled) navigate(detail.canvases[0] ? `/workspace/${workspaceId}/canvas/${detail.canvases[0].id}` : '/workspaces', { replace: true });
      } catch {
        if (!cancelled) navigate('/workspaces', { replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [auth.state.status, navigate, workspaceId]);
  if (auth.state.status !== 'authenticated' || !auth.state.user) {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas text-ink"><p className="text-sm">Sign in to verify workspace membership.</p><WorkspaceAccountControl /></main>;
  }
  return <main className="flex min-h-screen items-center justify-center bg-canvas text-mute"><LoadingSpinner size={20} /><span className="ml-2 text-sm">Opening workspace…</span></main>;
};
