import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './authContext';
import { WorkspaceAccountControl } from './AccountControls';
import { acceptWorkspaceInvite, getCloudWorkspace, inspectWorkspaceInvite } from '../lib/workspaces/workspaceClient';

export const InvitePage = () => {
  const { token = '' } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<{ workspaceName: string; role: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (auth.state.status !== 'authenticated' || !token) return;
    void (async () => {
      try {
        const result = await inspectWorkspaceInvite(token);
        setInvite(result.invite);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'This invite is invalid.');
      }
    })();
  }, [auth.state.status, token]);

  const accept = async () => {
    setPending(true);
    try {
      const result = await acceptWorkspaceInvite(token);
      const detail = await getCloudWorkspace(result.workspaceId);
      const canvas = detail.canvases[0];
      navigate(canvas ? `/workspace/${result.workspaceId}/canvas/${canvas.id}` : '/workspaces');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not accept this invite.');
      setPending(false);
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-canvas p-5 text-ink">
    <section className="w-full max-w-md rounded-2xl border border-hairline bg-canvas p-7 shadow-[var(--shadow-modal)]">
      <p className="text-xs uppercase tracking-[0.2em] text-mute">Workspace invitation</p>
      <h1 className="mt-3 text-2xl font-semibold">{invite?.workspaceName || 'Join AlgoGlyph'}</h1>
      {auth.state.status !== 'authenticated' ? <div className="mt-6"><p className="mb-4 text-sm text-body">Sign in first. The link only proves the invitation; your Firebase identity becomes the workspace member.</p><WorkspaceAccountControl /></div> : error ? <p role="alert" className="mt-5 text-sm text-rose-500">{error}</p> : invite ? <><p className="mt-3 text-sm text-body">You’ll join as <strong>{invite.role}</strong>. This invite expires {new Date(invite.expiresAt).toLocaleString()}.</p><button type="button" disabled={pending} onClick={() => void accept()} className="mt-6 h-10 w-full cursor-pointer rounded-lg bg-ink text-sm font-semibold text-canvas disabled:opacity-50">{pending ? 'Joining…' : 'Accept invitation'}</button></> : <p className="mt-5 text-sm text-mute">Validating invite…</p>}
    </section>
  </main>;
};
