import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CreditCard, X } from 'lucide-react';
import {
  BillingRequestError,
  cancelBillingSubscription,
  createBillingCheckout,
  getBillingStatus,
  getBillingWorkspaces,
  getBillingConfigurationError,
  openRazorpayCheckout,
  verifyRazorpayCheckout,
} from '../lib/billing/billingClient';
import type {
  BillingApiTokens,
  BillingPlanKey,
  BillingRegion,
  BillingStatus,
  BillingWorkspace,
} from '../lib/billing/types';
import { useAuth } from './authContext';
import { LoadingSpinner } from './LoadingSpinner';

type BillingSurface = 'landing' | 'workspace';
type BillingReturnState = 'success' | 'cancelled' | null;

const readBillingReturnState = (): BillingReturnState => {
  if (typeof window === 'undefined') return null;
  const value = new URL(window.location.href).searchParams.get('billing');
  return value === 'success' || value === 'cancelled' ? value : null;
};

const billingErrorMessage = (error: unknown): string => {
  if (error instanceof BillingRequestError) return error.message;
  if (error instanceof Error && error.message === 'Firebase App Check is not configured.') {
    return 'Billing app verification is not configured. Set VITE_FIREBASE_APPCHECK_SITE_KEY for this environment.';
  }
  if (error instanceof Error && error.message.includes('Sign in')) return error.message;
  return 'The billing request could not be completed. Please try again.';
};

const formatDate = (value: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const BillingDialog = ({
  surface,
  onClose,
}: {
  surface: BillingSurface;
  onClose: () => void;
}) => {
  const auth = useAuth();
  const { getAppCheckToken, getIdToken } = auth.actions;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [returnState] = useState<BillingReturnState>(readBillingReturnState);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [workspaces, setWorkspaces] = useState<BillingWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [plan, setPlan] = useState<BillingPlanKey>('pro_monthly');
  const [region, setRegion] = useState<BillingRegion>('international');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [verifying, setVerifying] = useState(returnState === 'success');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    returnState === 'cancelled' ? 'Checkout was cancelled. No subscription changes were made.' : null,
  );
  const [needsRecentAuthentication, setNeedsRecentAuthentication] = useState(false);

  const getApiTokens = useCallback(async (): Promise<BillingApiTokens> => {
    const [idToken, appCheckToken] = await Promise.all([
      getIdToken(),
      getAppCheckToken(),
    ]);
    return { idToken, appCheckToken };
  }, [getAppCheckToken, getIdToken]);

  const refreshStatus = useCallback(async (): Promise<BillingStatus | null> => {
    const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
    try {
      const nextStatus = await getBillingStatus(await getApiTokens(), selectedWorkspace?.organizationId);
      setStatus(nextStatus);
      setError(null);
      return nextStatus;
    } catch (requestError) {
      setError(billingErrorMessage(requestError));
      return null;
    } finally {
      setLoading(false);
    }
  }, [getApiTokens, selectedWorkspaceId, workspaces]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!returnState || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('billing');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }, [returnState]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const tokens = await getApiTokens();
        const result = await getBillingWorkspaces(tokens);
        if (cancelled) return;
        setWorkspaces(result.workspaces);
        const rememberedId = window.sessionStorage.getItem('algoglyph-billing-workspace-id');
        const selected = result.workspaces.find((workspace) => workspace.id === rememberedId)
          ?? result.workspaces[0];
        if (!selected) throw new BillingRequestError('No billing workspace is available.');
        setSelectedWorkspaceId(selected.id);
        const nextStatus = await getBillingStatus(tokens, selected.organizationId);
        if (!cancelled) {
          setStatus(nextStatus);
          setError(null);
        }
      } catch (requestError) {
        if (!cancelled) setError(billingErrorMessage(requestError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [getApiTokens]);

  useEffect(() => {
    if (!selectedWorkspaceId) return;
    const timer = window.setTimeout(() => void refreshStatus(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshStatus, selectedWorkspaceId]);

  useEffect(() => {
    if (!verifying) return;
    let cancelled = false;
    const poll = async () => {
      const nextStatus = await refreshStatus();
      if (cancelled || !nextStatus?.entitlement.managedAgentAccess) return;
      setVerifying(false);
      setNotice('Your managed-agent subscription is active.');
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 3_000);
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      setVerifying(false);
      setNotice('Payment verification is still pending. Your plan will update after the provider webhook is processed.');
    }, 2 * 60 * 1_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, [refreshStatus, verifying]);

  const beginCheckout = async () => {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
      if (!selectedWorkspace) throw new BillingRequestError('Choose a billing workspace first.');
      window.sessionStorage.setItem('algoglyph-billing-workspace-id', selectedWorkspace.id);
      const checkout = await createBillingCheckout(
        await getApiTokens(),
        plan,
        region,
        selectedWorkspace.organizationId,
      );
      if (checkout.provider === 'stripe') {
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      await openRazorpayCheckout(
        checkout,
        (callback) => {
          void (async () => {
            setPending(true);
            try {
              await verifyRazorpayCheckout(await getApiTokens(), callback, selectedWorkspace.organizationId);
              setVerifying(true);
              setNotice('Payment details verified. Waiting for the provider webhook to activate your plan…');
            } catch (requestError) {
              setError(billingErrorMessage(requestError));
            } finally {
              setPending(false);
            }
          })();
        },
        () => setNotice('Checkout was closed. No subscription changes were made.'),
      );
    } catch (requestError) {
      setError(billingErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  const cancelSubscription = async (confirmed = false) => {
    if (!confirmed && !window.confirm('Cancel renewal at the end of the current billing period?')) return;
    setPending(true);
    setError(null);
    setNotice(null);
    setNeedsRecentAuthentication(false);
    try {
      const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
      await cancelBillingSubscription(await getApiTokens(), selectedWorkspace?.organizationId);
      await refreshStatus();
      setNotice('Renewal is cancelled. Access remains available through the current period.');
    } catch (requestError) {
      if (requestError instanceof BillingRequestError
        && requestError.status === 401
        && /recent authentication/i.test(requestError.message)) {
        setNeedsRecentAuthentication(true);
      }
      setError(billingErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  const isLanding = surface === 'landing';
  const panelClassName = isLanding
    ? 'relative w-full max-w-md rounded-2xl border border-[var(--lp-border-strong)] bg-[var(--lp-surface)] p-6 text-[var(--lp-text)] shadow-[var(--lp-shadow-heavy)]'
    : 'relative w-full max-w-md rounded-2xl border border-hairline bg-canvas p-6 text-ink shadow-[var(--shadow-soft)]';
  const mutedClassName = isLanding ? 'text-[var(--lp-text-3)]' : 'text-mute';
  const subtleClassName = isLanding
    ? 'border-[var(--lp-border-strong)] bg-[var(--lp-fill-subtle)]'
    : 'border-hairline bg-canvas-soft';
  const buttonClassName = isLanding
    ? 'bg-[var(--lp-text)] text-[var(--lp-surface)] focus-visible:ring-[var(--lp-hero-cyan)]'
    : 'bg-ink text-canvas focus-visible:ring-link';
  const hasAccess = status?.entitlement.managedAgentAccess === true;
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  const configurationError = getBillingConfigurationError();
  const renewalDate = formatDate(status?.entitlement.currentPeriodEnd ?? null);
  const accessEndDate = formatDate(status?.entitlement.accessUntil ?? null);

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
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
        className={panelClassName}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full ${mutedClassName} hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2`}
          aria-label="Close billing dialog"
        >
          <X aria-hidden="true" size={16} />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${subtleClassName}`}>
            <CreditCard aria-hidden="true" size={20} />
          </span>
          <div>
            <h2 id={titleId} className="text-xl font-semibold tracking-tight">Plan &amp; billing</h2>
            <p id={descriptionId} className={`mt-0.5 text-xs ${mutedClassName}`}>
              Manage access to the AlgoGlyph managed agent.
            </p>
          </div>
        </div>

        {notice ? (
          <p className={`mt-5 rounded-lg border px-3 py-2 text-xs leading-5 ${subtleClassName}`}>{notice}</p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-5 rounded-lg border border-rose-400/30 bg-rose-400/5 px-3 py-2 text-xs leading-5 text-rose-500">
            {error}
          </p>
        ) : null}

        {needsRecentAuthentication ? (
          <button
            type="button"
            disabled={pending || auth.state.pending}
            onClick={() => {
              void (async () => {
                const reauthenticated = await auth.actions.reauthenticateWithGoogle();
                if (reauthenticated) await cancelSubscription(true);
              })();
            }}
            className={`mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border text-xs font-semibold ${subtleClassName} disabled:opacity-50`}
          >
            Confirm with Google and cancel renewal
          </button>
        ) : null}

        {configurationError ? (
          <div className={`mt-6 rounded-xl border p-4 text-xs leading-5 ${subtleClassName}`}>
            <p className="font-semibold">Billing setup required</p>
            <p className={`mt-1 ${mutedClassName}`}>{configurationError}</p>
          </div>
        ) : loading ? (
          <div className={`mt-6 flex items-center gap-2 text-sm ${mutedClassName}`}>
            <LoadingSpinner size={16} /> Loading billing status…
          </div>
        ) : error && !status ? (
          <p className={`mt-6 text-xs leading-5 ${mutedClassName}`}>
            Subscription details must load successfully before checkout or account changes are available.
          </p>
        ) : (
          <>
            {workspaces.length > 1 ? (
              <label className={`mt-6 grid gap-1.5 text-xs ${mutedClassName}`} htmlFor="account-billing-workspace">
                Subscription for
                <select
                  id="account-billing-workspace"
                  value={selectedWorkspaceId ?? ''}
                  disabled={pending || verifying}
                  onChange={(event) => {
                    setLoading(true);
                    setSelectedWorkspaceId(event.target.value);
                    window.sessionStorage.setItem('algoglyph-billing-workspace-id', event.target.value);
                  }}
                  className={`h-10 rounded-lg border px-3 text-xs outline-none ${subtleClassName}`}
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.kind === 'organization' ? `${workspace.name} · organization` : workspace.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <p className={`mt-4 text-xs leading-5 ${mutedClassName}`}>
              The local MCP connector is free for everyone and is not affected by this subscription.
            </p>

            {hasAccess && status ? (
          <section className={`mt-6 rounded-xl border p-4 ${subtleClassName}`} aria-label="Current plan">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Managed agent · {status.planKey === 'pro_annual' ? 'Annual' : 'Monthly'}
                </p>
                <p className={`mt-1 text-xs leading-5 ${mutedClassName}`}>
                  {status.entitlement.status === 'grace'
                    ? `Payment recovery is in progress${accessEndDate ? `; access is available until ${accessEndDate}` : ''}.`
                    : status.entitlement.cancelAtPeriodEnd
                      ? `Renewal cancelled${accessEndDate ? `; access ends ${accessEndDate}` : ''}.`
                      : renewalDate
                        ? `Current period ends ${renewalDate}.`
                        : 'Your subscription is active.'}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                {status.entitlement.status === 'grace' ? 'Grace' : 'Active'}
              </span>
            </div>
            {!status.entitlement.cancelAtPeriodEnd && selectedWorkspace?.canManageBilling ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => void cancelSubscription()}
                className={`mt-4 text-xs font-medium underline underline-offset-4 ${mutedClassName} disabled:opacity-50`}
              >
                {pending ? 'Cancelling…' : 'Cancel renewal'}
              </button>
            ) : null}
          </section>
            ) : selectedWorkspace?.canManageBilling ? (
          <section className="mt-6" aria-label="Subscribe to the AlgoGlyph managed agent">
            <p className="text-sm font-semibold">Subscribe to the managed agent</p>
            <p className={`mt-1 text-xs leading-5 ${mutedClassName}`}>
              This buys hosted managed-agent access. Choose a billing interval and payment region; payment details are collected by Stripe or Razorpay.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Billing interval">
              {(['pro_monthly', 'pro_annual'] as const).map((planKey) => (
                <button
                  key={planKey}
                  type="button"
                  role="radio"
                  aria-checked={plan === planKey}
                  onClick={() => setPlan(planKey)}
                  className={`rounded-lg border px-3 py-3 text-left text-xs transition-colors ${
                    plan === planKey ? 'border-current' : `${subtleClassName} ${mutedClassName}`
                  }`}
                >
                  <span className="block font-semibold">{planKey === 'pro_monthly' ? 'Monthly' : 'Annual'}</span>
                  <span className={`mt-1 block text-[11px] ${mutedClassName}`}>
                    {planKey === 'pro_monthly' ? 'Billed every month' : 'Billed once a year'}
                  </span>
                </button>
              ))}
            </div>

            <label className={`mt-4 grid gap-1.5 text-xs ${mutedClassName}`} htmlFor="account-billing-region">
              Billing country / currency
              <select
                id="account-billing-region"
                value={region}
                onChange={(event) => setRegion(event.target.value as BillingRegion)}
                className={`h-10 rounded-lg border px-3 text-xs outline-none ${subtleClassName}`}
              >
                <option value="international">International · USD · Stripe</option>
                <option value="india">India · INR · Razorpay</option>
              </select>
            </label>

            <button
              type="button"
              disabled={pending || verifying}
              onClick={() => void beginCheckout()}
              className={`mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${buttonClassName}`}
            >
              {pending || verifying ? <LoadingSpinner size={15} inverted={!isLanding} /> : <CreditCard aria-hidden="true" size={16} />}
              {pending ? 'Opening checkout…' : verifying ? 'Verifying payment…' : 'Continue to secure checkout'}
            </button>
          </section>
            ) : (
              <section className={`mt-6 rounded-xl border p-4 text-xs leading-5 ${subtleClassName}`}>
                This organization does not currently have managed-agent access. An organization owner or billing admin can manage its subscription.
              </section>
            )}
          </>
        )}

        {!loading && error ? (
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void refreshStatus();
            }}
            className={`mt-3 text-xs font-medium underline underline-offset-4 ${mutedClassName}`}
          >
            Retry billing status
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};
