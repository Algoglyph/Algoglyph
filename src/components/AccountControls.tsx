import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogIn, X } from 'lucide-react';
import { SITE_IDENTITY } from '../config/siteIdentity';
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

const SignInDialog = ({
  surface,
  onClose,
}: {
  surface: AccountSurface;
  onClose: () => void;
}) => {
  const {
    state: { pending, error },
    actions: { signInWithGoogle },
  } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    primaryActionRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isLanding = surface === 'landing';
  const dialogClassName = isLanding
    ? 'relative w-full max-w-sm rounded-2xl border border-[var(--lp-border-strong)] bg-[var(--lp-surface)] p-6 text-[var(--lp-text)] shadow-[var(--lp-shadow-heavy)]'
    : 'relative w-full max-w-sm rounded-2xl border border-hairline bg-canvas p-6 text-ink shadow-[var(--shadow-soft)]';
  const mutedTextClassName = isLanding ? 'text-[var(--lp-text-3)]' : 'text-mute';
  const closeButtonClassName = isLanding
    ? 'absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--lp-text-3)] transition-colors hover:bg-[var(--lp-fill-hover)] hover:text-[var(--lp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)]'
    : 'absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-mute transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link';
  const primaryButtonClassName = isLanding
    ? 'mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--lp-text)] px-4 text-sm font-semibold text-[var(--lp-surface)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-surface)] disabled:cursor-not-allowed disabled:opacity-50'
    : 'mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-canvas transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50';
  const secondaryButtonClassName = isLanding
    ? 'mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium text-[var(--lp-text-2)] transition-colors hover:bg-[var(--lp-fill-hover)] hover:text-[var(--lp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)]'
    : 'mt-2 inline-flex h-10 w-full items-center justify-center rounded-xl text-sm font-medium text-body transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link';

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={dialogClassName}
      >
        <button
          type="button"
          className={closeButtonClassName}
          onClick={onClose}
          aria-label="Close sign-in dialog"
        >
          <X aria-hidden="true" size={16} />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-current/10 bg-white/5">
            <img
              src={SITE_IDENTITY.logoPath}
              alt=""
              aria-hidden="true"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </span>
          <div>
            <p className={`text-xs font-medium uppercase tracking-[0.16em] ${mutedTextClassName}`}>
              Continue to
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight">{SITE_IDENTITY.name}</p>
          </div>
        </div>

        <h2 id={titleId} className="mt-6 text-xl font-semibold tracking-tight">
          Sign in to {SITE_IDENTITY.name}
        </h2>
        <p id={descriptionId} className={`mt-2 text-sm leading-6 ${mutedTextClassName}`}>
          Use your Google account for your AlgoGlyph identity. Your notes, code, and canvas stay on this device.
        </p>

        {error ? (
          <p
            role="alert"
            className={isLanding
              ? 'mt-4 rounded-lg border border-[var(--lp-rose-border)] bg-[var(--lp-fill-subtle)] px-3 py-2 text-xs leading-5 text-[var(--lp-rose)]'
              : 'mt-4 rounded-lg border border-rose-400/20 bg-canvas-soft px-3 py-2 text-xs leading-5 text-rose-400'}
          >
            {error}
          </p>
        ) : null}

        <button
          ref={primaryActionRef}
          type="button"
          disabled={pending}
          className={primaryButtonClassName}
          onClick={() => void signInWithGoogle()}
        >
          <LogIn aria-hidden="true" size={16} />
          {pending ? 'Opening Google sign-in…' : 'Continue with Google'}
        </button>
        <button type="button" className={secondaryButtonClassName} onClick={onClose}>
          Continue without signing in
        </button>

        <p className={`mt-4 text-center text-[11px] leading-5 ${mutedTextClassName}`}>
          Sign-in is optional. Read the{' '}
          <a className="underline underline-offset-2 hover:text-current" href="/privacy">
            privacy policy
          </a>
          .
        </p>
      </div>
    </div>,
    document.body,
  );
};

const SignInControl = ({ surface }: { surface: AccountSurface }) => {
  const {
    state: { pending },
    actions: { clearError },
  } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const className = surface === 'landing'
    ? 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--lp-text-2)] transition-colors hover:bg-[var(--lp-fill-hover)] hover:text-[var(--lp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-hero-cyan)] sm:w-auto sm:px-3'
    : 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-body transition-colors hover:bg-canvas-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link';

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <div className="relative flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        disabled={pending}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}
        onClick={() => {
          clearError();
          setDialogOpen(true);
        }}
        aria-label={`Sign in to ${SITE_IDENTITY.name}`}
        aria-haspopup="dialog"
        aria-expanded={dialogOpen}
        title={`Sign in to ${SITE_IDENTITY.name}`}
      >
        <LogIn aria-hidden="true" size={surface === 'landing' ? 15 : 14} />
        {surface === 'landing' ? (
          <span className="hidden text-sm font-medium sm:inline">
            Sign in
          </span>
        ) : null}
      </button>
      {dialogOpen ? <SignInDialog surface={surface} onClose={closeDialog} /> : null}
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
