import { useEffect, useRef, useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from './authContext';

type AccountSurface = 'landing' | 'workspace';

const getUserInitial = (displayName: string | null, email: string | null) => {
  const source = displayName?.trim() || email?.trim() || '?';
  return source.charAt(0).toUpperCase();
};

const getSafePhotoUrl = (photoURL: string | null) => {
  if (!photoURL) return null;
  try {
    const url = new URL(photoURL);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

const LoadingPlaceholder = ({ surface }: { surface: AccountSurface }) => (
  <span
    aria-hidden="true"
    className={surface === 'landing' ? 'block h-9 w-9 shrink-0 sm:w-[76px]' : 'block h-7 w-7 shrink-0'}
  />
);

const AuthError = ({ surface }: { surface: AccountSurface }) => {
  const {
    state: { error },
  } = useAuth();

  if (!error) return null;

  return (
    <div
      role="alert"
      className={surface === 'landing'
        ? 'absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-[var(--lp-rose-border)] bg-[var(--lp-surface)] px-3 py-2 text-xs leading-5 text-[var(--lp-rose)] shadow-[var(--lp-shadow-card)]'
        : 'absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-rose-400/20 bg-canvas px-3 py-2 text-xs leading-5 text-rose-400 shadow-[var(--shadow-soft)]'}
    >
      {error}
    </div>
  );
};

const AccountMenu = ({ surface }: { surface: AccountSurface }) => {
  const {
    state: { user, pending },
    actions: { signOut, clearError },
  } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const triggerClassName = surface === 'landing'
    ? 'flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--lp-border-strong)] bg-[var(--lp-fill-subtle)] text-sm font-semibold text-[var(--lp-text)] transition-colors hover:bg-[var(--lp-fill-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)]'
    : 'flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-hairline bg-canvas-soft text-[11px] font-semibold text-ink transition-colors hover:border-ink/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link';
  const menuClassName = surface === 'landing'
    ? 'absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-[var(--lp-border-strong)] bg-[var(--lp-surface)] p-1.5 text-[var(--lp-text)] shadow-[var(--lp-shadow-heavy)]'
    : 'absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-hairline bg-canvas p-1.5 text-ink shadow-[var(--shadow-soft)]';
  const secondaryTextClassName = surface === 'landing' ? 'text-[var(--lp-text-3)]' : 'text-mute';
  const signOutClassName = surface === 'landing'
    ? 'mt-1 flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium text-[var(--lp-text-2)] transition-colors hover:bg-[var(--lp-fill-hover)] hover:text-[var(--lp-text)] disabled:cursor-not-allowed disabled:opacity-50'
    : 'mt-1 flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium text-body transition-colors hover:bg-canvas-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50';
  const safePhotoURL = getSafePhotoUrl(user.photoURL);

  return (
    <div ref={containerRef} className="relative flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        onClick={() => {
          clearError();
          setOpen((current) => !current);
        }}
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        title={user.displayName || user.email || 'Account'}
      >
        {safePhotoURL ? (
          <img
            src={safePhotoURL}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          getUserInitial(user.displayName, user.email)
        )}
      </button>

      {open ? (
        <div role="menu" aria-label="Account" className={menuClassName}>
          <div className="min-w-0 px-2.5 py-2">
            <p className="truncate text-sm font-medium">{user.displayName || 'Google account'}</p>
            {user.email ? <p className={`mt-0.5 truncate text-xs ${secondaryTextClassName}`}>{user.email}</p> : null}
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={pending}
            className={signOutClassName}
            onClick={() => {
              void signOut().then(() => setOpen(false));
            }}
          >
            {pending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : null}
      <AuthError surface={surface} />
    </div>
  );
};

const SignInControl = ({ surface }: { surface: AccountSurface }) => {
  const {
    state: { pending },
    actions: { signInWithGoogle },
  } = useAuth();
  const className = surface === 'landing'
    ? 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--lp-text-2)] transition-colors hover:bg-[var(--lp-fill-hover)] hover:text-[var(--lp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)] sm:w-auto sm:px-3'
    : 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-body transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link';

  return (
    <div className="relative flex shrink-0">
      <button
        type="button"
        disabled={pending}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
        onClick={() => void signInWithGoogle()}
        aria-label={pending ? 'Signing in with Google' : 'Sign in with Google'}
        title={pending ? 'Signing in with Google' : 'Sign in with Google'}
      >
        <LogIn aria-hidden="true" size={surface === 'landing' ? 15 : 14} />
        {surface === 'landing' ? (
          <span className="hidden text-sm font-medium sm:inline">
            {pending ? 'Signing in…' : 'Sign in'}
          </span>
        ) : null}
      </button>
      <AuthError surface={surface} />
    </div>
  );
};

export const LandingAccountControl = () => {
  const {
    state: { status },
  } = useAuth();

  if (status === 'unavailable') return null;
  if (status === 'loading') return <LoadingPlaceholder surface="landing" />;
  if (status === 'authenticated') return <AccountMenu surface="landing" />;
  return <SignInControl surface="landing" />;
};

export const WorkspaceAccountControl = () => {
  const {
    state: { status },
  } = useAuth();

  if (status === 'unavailable') return null;
  if (status === 'loading') return <LoadingPlaceholder surface="workspace" />;
  if (status === 'authenticated') return <AccountMenu surface="workspace" />;
  return <SignInControl surface="workspace" />;
};
