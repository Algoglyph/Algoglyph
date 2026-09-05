import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bot, Link2, Plug, Plus, UserPlus, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Canvas } from './Canvas';
import { BillingDialog } from './BillingDialog';
import { WorkspaceAccountControl } from './AccountControls';
import { useAuth } from './authContext';
import { LoadingSpinner } from './LoadingSpinner';
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

export const CloudCanvasPage = () => {
  const { workspaceId = '', canvasId = '' } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<CloudWorkspace | null>(null);
  const [canvas, setCanvas] = useState<CloudCanvas | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [canvases, setCanvases] = useState<CloudCanvas[]>([]);
  const [lastInvite, setLastInvite] = useState<WorkspaceInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingOpen, setBillingOpen] = useState(false);

  const tokens = useCallback(async (): Promise<WorkspaceApiTokens> => {
    const [idToken, appCheckToken] = await Promise.all([auth.actions.getIdToken(), auth.actions.getAppCheckToken()]);
    return { idToken, appCheckToken };
  }, [auth.actions]);

  useEffect(() => {
    if (auth.state.status !== 'authenticated') return;
    let cancelled = false;
    void (async () => {
      try {
        const apiTokens = await tokens();
        const detail = await getCloudWorkspace(apiTokens, workspaceId);
        const selected = detail.canvases.find((item) => item.id === canvasId);
        if (!selected) throw new Error('Canvas not found in this workspace.');
        const memberResult = await listWorkspaceMembers(apiTokens, workspaceId).catch(() => ({ members: [] }));
        if (!cancelled) { setWorkspace(detail.workspace); setCanvas(selected); setCanvases(detail.canvases); setMembers(memberResult.members); }
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Workspace access denied.');
      }
    })();
    return () => { cancelled = true; };
  }, [auth.state.status, canvasId, tokens, workspaceId]);

  const invite = async () => {
    try {
      const result = await createWorkspaceInvite(await tokens(), workspaceId);
      await navigator.clipboard.writeText(result.invite.inviteUrl);
      setLastInvite(result.invite);
      window.alert('Invite link copied. It expires in 24 hours and can be accepted once.');
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not create invite.'); }
  };

  const addCanvas = async () => {
    const name = window.prompt('Canvas name');
    if (!name?.trim()) return;
    try {
      const result = await createCloudCanvas(await tokens(), workspaceId, name);
      navigate(`/workspace/${workspaceId}/canvas/${result.canvas.id}`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not create canvas.'); }
  };

  const revokeLastInvite = async () => {
    if (!lastInvite) return;
    try {
      await revokeWorkspaceInvite(await tokens(), workspaceId, lastInvite.id);
      setLastInvite(null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not revoke invite.'); }
  };

  const createToken = async () => {
    try {
      const result = await createMcpToken(await tokens(), workspaceId, 'My agent');
      const endpoint = `${(import.meta.env.VITE_ALGOGLYPH_API_URL || import.meta.env.VITE_BILLING_API_URL || '').replace(/\/$/, '')}/v1/mcp`;
      window.prompt('Copy this token now. AlgoGlyph stores only its hash. Use it as a Bearer token at the MCP endpoint below.', `${result.token}\n${endpoint}`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Could not create MCP token.'); }
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
        {workspace.role !== 'viewer' ? <button type="button" onClick={() => void addCanvas()} className="cursor-pointer rounded p-1 text-mute hover:bg-canvas-soft hover:text-ink" aria-label="Create canvas"><Plus size={13} /></button> : null}
        <span className="ml-auto hidden text-[11px] text-mute md:inline">{members.length || 1} member{members.length === 1 ? '' : 's'}</span>
        <button type="button" onClick={() => window.alert(members.map((member) => `${member.displayName || member.email || member.uid} · ${member.role}`).join('\n') || 'Member list is available to authorized workspace members.')} className="cursor-pointer rounded-md border border-hairline p-1.5 text-mute hover:bg-canvas-soft hover:text-ink" aria-label="View members"><Users size={13} /></button>
        {(workspace.role === 'owner' || workspace.role === 'admin') ? <button type="button" onClick={() => void invite()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-[11px] hover:bg-canvas-soft"><UserPlus size={13} /> Invite</button> : null}
        {lastInvite ? <button type="button" onClick={() => void revokeLastInvite()} className="cursor-pointer text-[10px] text-rose-500 underline underline-offset-2">Revoke invite</button> : null}
        <button type="button" onClick={() => void createToken()} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1.5 text-[11px] hover:bg-canvas-soft" title="Free — connect your own agent"><Plug size={13} /> Free MCP</button>
        <button type="button" onClick={() => setBillingOpen(true)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 text-[11px] text-canvas" title="Paid hosted agent"><Bot size={13} /> Managed agent</button>
        <WorkspaceAccountControl />
      </header>
      {error ? <div role="alert" className="border-b border-rose-400/30 bg-rose-400/5 px-3 py-2 text-xs text-rose-500">{error}</div> : null}
      <div className="min-h-0 flex-1 ph-no-capture">
        <Canvas collaboration={{ workspaceId, canvasId, user: auth.state.user }} />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-hairline bg-canvas/90 px-3 py-1.5 text-[10px] text-mute shadow-sm backdrop-blur"><Link2 className="mr-1 inline" size={11} /> Live element-level sync · MCP stays free</div>
      {billingOpen ? <BillingDialog surface="workspace" onClose={() => setBillingOpen(false)} /> : null}
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
        const [idToken, appCheckToken] = await Promise.all([auth.actions.getIdToken(), auth.actions.getAppCheckToken()]);
        const detail = await getCloudWorkspace({ idToken, appCheckToken }, workspaceId);
        if (!cancelled) navigate(detail.canvases[0] ? `/workspace/${workspaceId}/canvas/${detail.canvases[0].id}` : '/workspaces', { replace: true });
      } catch {
        if (!cancelled) navigate('/workspaces', { replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [auth.actions, auth.state.status, navigate, workspaceId]);
  if (auth.state.status !== 'authenticated' || !auth.state.user) {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas text-ink"><p className="text-sm">Sign in to verify workspace membership.</p><WorkspaceAccountControl /></main>;
  }
  return <main className="flex min-h-screen items-center justify-center bg-canvas text-mute"><LoadingSpinner size={20} /><span className="ml-2 text-sm">Opening workspace…</span></main>;
};
