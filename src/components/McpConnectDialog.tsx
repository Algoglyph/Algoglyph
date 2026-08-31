import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  CircleAlert,
  Copy,
  CreditCard,
  Cpu,
  PlugZap,
  RefreshCw,
  Server,
  Terminal,
  Unplug,
  X,
} from 'lucide-react';
import {
  McpConnectorRequestError,
  inspectMcpConnector,
  invokeMcpTool,
  normalizeConnectorEndpoint,
  revokeMcpConnectorSession,
  testMcpServer,
} from '../lib/mcp/connectorClient';
import { MCP_CONNECTOR_USER_COMMAND, type McpServerTestResult } from '../lib/mcp/types';
import {
  configureMcpAuthorizationProvider,
  requestMcpConnection,
} from '../lib/mcp/bootstrap';
import {
  BillingRequestError,
  cancelBillingSubscription,
  createBillingCheckout,
  getBillingStatus as fetchBillingStatus,
  openRazorpayCheckout,
} from '../lib/billing/billingClient';
import type {
  BillingApiTokens,
  BillingPlanKey,
  BillingRegion,
  BillingStatus,
} from '../lib/billing/types';
import { useMcpStore } from '../store/mcpStore';
import { useAuth } from './authContext';
import { LoadingSpinner } from './LoadingSpinner';

const inputClassName =
  'h-9 w-full rounded-md border border-hairline bg-canvas px-2.5 font-mono text-xs text-ink outline-none transition-colors placeholder:text-mute focus:border-ink';

const errorMessage = (error: unknown): string => {
  if (error instanceof McpConnectorRequestError) return error.message;
  if (error instanceof BillingRequestError) return error.message;
  return 'The connector request could not be completed.';
};

const resultLabel = (result: McpServerTestResult): string => {
  const parts = [];
  if (result.capabilities.tools) parts.push(`${result.tools.length} tools`);
  if (result.capabilities.resources) parts.push('resources');
  if (result.capabilities.prompts) parts.push('prompts');
  return parts.length ? parts.join(' / ') : 'No advertised capabilities';
};

const endpointHost = (endpoint: string): string => {
  try {
    return new URL(endpoint).host;
  } catch {
    return endpoint;
  }
};

export const McpConnectDialog: React.FC = () => {
  const auth = useAuth();
  const isOpen = useMcpStore((state) => state.mcpPanelOpen);
  const connectorEndpoint = useMcpStore((state) => state.connectorEndpoint);
  const connectionState = useMcpStore((state) => state.connectionState);
  const connectorHealth = useMcpStore((state) => state.connectorHealth);
  const connectorCatalog = useMcpStore((state) => state.connectorCatalog);
  const connectionError = useMcpStore((state) => state.connectionError);
  const intentionalDisconnect = useMcpStore((state) => state.intentionalDisconnect);
  const activeAgentId = useMcpStore((state) => state.activeAgentId);
  const closeMcpPanel = useMcpStore((state) => state.closeMcpPanel);
  const setConnectorEndpoint = useMcpStore((state) => state.setConnectorEndpoint);
  const setConnectionState = useMcpStore((state) => state.setConnectionState);
  const setStoredConnectorToken = useMcpStore((state) => state.setConnectorToken);
  const setIntentionalDisconnect = useMcpStore((state) => state.setIntentionalDisconnect);
  const setActiveAgentId = useMcpStore((state) => state.setActiveAgentId);

  const endpointInputRef = useRef<HTMLInputElement>(null);
  const [connectorToken, setConnectorToken] = useState(() => useMcpStore.getState().connectorToken || '');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [serverEndpoint, setServerEndpoint] = useState('');
  const [serverToken, setServerToken] = useState('');
  const [allowPrivateNetwork, setAllowPrivateNetwork] = useState(false);
  const [toolName, setToolName] = useState('');
  const [toolArguments, setToolArguments] = useState('{}');
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [serverResult, setServerResult] = useState<McpServerTestResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [testingServer, setTestingServer] = useState(false);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [billingPlan, setBillingPlan] = useState<BillingPlanKey>('pro_monthly');
  const [billingRegion, setBillingRegion] = useState<BillingRegion>('international');
  const [billingPending, setBillingPending] = useState(false);
  const [billingVerifying, setBillingVerifying] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URL(window.location.href).searchParams.get('billing') === 'success';
  });
  const [billingError, setBillingError] = useState<string | null>(null);
  const clearSessionOwnedUi = useCallback(() => {
    setServerToken('');
    setServerResult(null);
    setServerError(null);
    setToolName('');
    setToolArguments('{}');
    setToolResult(null);
  }, []);
  const closeDialog = useCallback(() => {
    setServerToken('');
    setServerResult(null);
    setServerError(null);
    closeMcpPanel();
  }, [closeMcpPanel]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDialog();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDialog, isOpen]);

  useEffect(() => useMcpStore.subscribe((state, previousState) => {
    if (state.connectorToken === previousState.connectorToken) return;
    setConnectorToken(state.connectorToken || '');
    clearSessionOwnedUi();
  }), [clearSessionOwnedUi]);

  const getApiTokens = useCallback(async (): Promise<BillingApiTokens> => {
    const [idToken, appCheckToken] = await Promise.all([
      auth.actions.getIdToken(),
      auth.actions.getAppCheckToken(),
    ]);
    return { idToken, appCheckToken };
  }, [auth.actions]);

  useEffect(() => {
    if (auth.state.status === 'authenticated') {
      configureMcpAuthorizationProvider({
        getIdToken: auth.actions.getIdToken,
        getAppCheckToken: auth.actions.getAppCheckToken,
      });
    } else {
      configureMcpAuthorizationProvider(null);
    }
    return () => configureMcpAuthorizationProvider(null);
  }, [auth.actions.getAppCheckToken, auth.actions.getIdToken, auth.state.status]);

  const refreshBillingStatus = useCallback(async (): Promise<BillingStatus | null> => {
    if (auth.state.status !== 'authenticated') {
      setBillingStatus(null);
      return null;
    }
    try {
      const status = await fetchBillingStatus(await getApiTokens());
      setBillingStatus(status);
      setBillingError(null);
      return status;
    } catch (error) {
      setBillingError(errorMessage(error));
      return null;
    }
  }, [auth.state.status, getApiTokens]);

  useEffect(() => {
    if (!isOpen || auth.state.status !== 'authenticated') return;
    const timer = window.setTimeout(() => void refreshBillingStatus(), 0);
    return () => window.clearTimeout(timer);
  }, [auth.state.status, isOpen, refreshBillingStatus]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('billing') !== 'success') return;
    url.searchParams.delete('billing');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (!billingVerifying || auth.state.status !== 'authenticated') return;
    let cancelled = false;
    const poll = async () => {
      const status = await refreshBillingStatus();
      if (cancelled || !status?.entitlement.mcpAccess) return;
      setBillingVerifying(false);
      configureMcpAuthorizationProvider({
        getIdToken: auth.actions.getIdToken,
        getAppCheckToken: auth.actions.getAppCheckToken,
      });
      void requestMcpConnection();
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 3_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [auth.actions.getAppCheckToken, auth.actions.getIdToken, auth.state.status, billingVerifying, refreshBillingStatus]);

  const beginCheckout = async () => {
    setBillingPending(true);
    setBillingError(null);
    try {
      const result = await createBillingCheckout(await getApiTokens(), billingPlan, billingRegion);
      if (result.provider === 'stripe') {
        setBillingVerifying(true);
        window.location.assign(result.checkoutUrl);
      } else {
        setBillingVerifying(false);
        await openRazorpayCheckout(
          result,
          () => setBillingVerifying(true),
          () => setBillingVerifying(false),
        );
      }
    } catch (error) {
      setBillingVerifying(false);
      setBillingError(errorMessage(error));
    } finally {
      setBillingPending(false);
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Cancel renewal at the end of the current billing period?')) return;
    setBillingPending(true);
    setBillingError(null);
    try {
      await cancelBillingSubscription(await getApiTokens());
      await refreshBillingStatus();
    } catch (error) {
      setBillingError(errorMessage(error));
    } finally {
      setBillingPending(false);
    }
  };

  const checkConnector = async () => {
    setConnectionState('checking');
    setServerResult(null);
    setServerError(null);

    try {
      const endpoint = normalizeConnectorEndpoint(connectorEndpoint);
      const snapshot = await inspectMcpConnector(endpoint, connectorToken || undefined);
      setConnectorEndpoint(endpoint);

      if (snapshot.catalog) {
        setConnectionState('ready', snapshot.health, snapshot.catalog);
        setStoredConnectorToken(connectorToken || null);
        setEditingConnection(false);
      } else {
        setConnectionState('needs-token', snapshot.health);
        setStoredConnectorToken(null);
      }
    } catch (error) {
      const message = errorMessage(error);
      if (error instanceof McpConnectorRequestError && error.status === 401) {
        setStoredConnectorToken(null);
        setConnectorToken('');
        clearSessionOwnedUi();
        setConnectionState('needs-token', connectorHealth, null, message);
      } else {
        setConnectionState('error', null, null, message);
      }
    }
  };

  const disconnectConnector = async () => {
    const token = useMcpStore.getState().connectorToken || connectorToken;
    setIntentionalDisconnect(true);
    setStoredConnectorToken(null);
    setConnectorToken('');
    clearSessionOwnedUi();
    setConnectionState('idle');
    setEditingConnection(false);
    try {
      await revokeMcpConnectorSession(connectorEndpoint, token || undefined);
    } catch {
      // Local disconnect should still clear the browser-side session if revoke fails.
    }
  };

  const reconnectConnector = async () => {
    setServerResult(null);
    setServerError(null);
    setBillingError(null);
    if (auth.state.status === 'unavailable') {
      setBillingError('Paid MCP is available in the web app when Google sign-in is configured.');
      return;
    }
    if (auth.state.status !== 'authenticated') {
      await auth.actions.signInWithGoogle();
    }
    configureMcpAuthorizationProvider({
      getIdToken: auth.actions.getIdToken,
      getAppCheckToken: auth.actions.getAppCheckToken,
    });
    setIntentionalDisconnect(false);
    await requestMcpConnection();
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(MCP_CONNECTOR_USER_COMMAND);
      setCopiedCommand(true);
      window.setTimeout(() => setCopiedCommand(false), 1500);
    } catch {
      setCopiedCommand(false);
    }
  };

  const testServer = async () => {
    if (connectionState !== 'ready') {
      setServerError('Connect the local connector before testing an MCP server.');
      return;
    }
    setTestingServer(true);
    setServerError(null);
    setServerResult(null);
    try {
      const result = await testMcpServer(
        connectorEndpoint,
        useMcpStore.getState().connectorToken || undefined,
        serverEndpoint,
        serverToken || undefined,
        allowPrivateNetwork,
      );
      setServerResult(result);
      setToolName(result.tools[0]?.name || '');
    } catch (error) {
      if (error instanceof McpConnectorRequestError && error.status === 401) {
        setStoredConnectorToken(null);
        setConnectorToken('');
        clearSessionOwnedUi();
      }
      setServerError(errorMessage(error));
    } finally {
      setTestingServer(false);
    }
  };

  const invokeTool = async () => {
    if (!serverResult || !toolName) return;
    let args: Record<string, unknown>;
    try {
      const parsed = JSON.parse(toolArguments) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      args = parsed as Record<string, unknown>;
    } catch {
      setServerError('Tool arguments must be a JSON object.');
      return;
    }
    const preview = `${toolName}\n${JSON.stringify(args, null, 2)}`;
    if (!window.confirm(`Invoke this MCP tool with exactly these arguments?\n\n${preview}`)) return;
    try {
      setServerError(null);
      const token = useMcpStore.getState().connectorToken;
      if (!token) throw new McpConnectorRequestError('The connector session is no longer available.');
      const result = await invokeMcpTool(connectorEndpoint, token, serverResult.serverId, toolName, args);
      setToolResult(JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof McpConnectorRequestError && error.status === 401) {
        setStoredConnectorToken(null);
        setConnectorToken('');
        clearSessionOwnedUi();
      }
      setServerError(errorMessage(error));
    }
  };

  if (!isOpen) return null;

  const isReady = connectionState === 'ready' && !intentionalDisconnect;
  const isSignedIn = auth.state.status === 'authenticated';
  const hasPaidMcpAccess = billingStatus?.entitlement.mcpAccess === true;
  const needsUpgrade = isSignedIn && billingStatus !== null && !hasPaidMcpAccess;
  const isSearching = !intentionalDisconnect
    && (connectionState === 'searching' || connectionState === 'checking' || connectionState === 'pairing');
  const permissionRequired = connectionState === 'permission-required';
  const permissionDenied = connectionState === 'permission-denied';
  const connectionNeedsAttention = connectionState === 'error' || permissionDenied;
  const isMacOs = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent);
  const showManualConnectionForm = hasPaidMcpAccess
    && (advancedOpen || editingConnection || connectionState === 'needs-token');
  const agents = connectorCatalog?.agents ?? [];
  const availableAgents = agents.filter((agent) => agent.available);
  const activeAgent = agents.find((agent) => agent.id === activeAgentId) || null;

  const statusTitle = !isSignedIn
    ? 'Sign in to use MCP'
    : billingVerifying
      ? 'Verifying payment'
      : needsUpgrade
        ? 'Upgrade required for MCP'
        : intentionalDisconnect
    ? 'Local Agent Disconnected'
    : isReady
    ? 'Local Agent Connected'
    : permissionRequired
      ? 'Ready to connect locally'
      : permissionDenied
        ? 'Local network access blocked'
        : connectionState === 'not-found'
      ? 'Local connector not running'
      : connectionState === 'needs-token'
        ? 'Connector detected'
        : connectionState === 'error'
          ? 'Connection needs attention'
          : 'Looking for AlgoGlyph Connector...';

  const statusDescription = !isSignedIn
    ? 'Your local workspace stays free. Google sign-in is required only for paid MCP access.'
    : billingVerifying
      ? 'Checkout is complete. Access will unlock after the payment provider confirms it to AlgoGlyph.'
      : needsUpgrade
        ? 'Choose a Pro subscription to authorize the official local connector.'
        : intentionalDisconnect
    ? 'Disconnected by you. The local connector was left running and will reconnect only when you choose.'
    : isReady
    ? `Connected to ${endpointHost(connectorEndpoint)}${connectorHealth?.version ? ` / v${connectorHealth.version}` : ''}`
    : permissionRequired
      ? 'Start the connector, then choose Connect. Your browser may ask for permission to reach the connector on this Mac.'
      : permissionDenied
        ? isMacOs
          ? 'In macOS System Settings, allow your browser under Privacy & Security → Local Network. Then allow Local network access for algoglyph.com in the browser site settings.'
          : 'Allow Local network access for algoglyph.com in the browser site settings, then try again.'
        : connectionState === 'needs-token'
      ? connectionError || 'Automatic pairing is unavailable for this connector. Use Advanced to connect manually.'
      : connectionState === 'error'
        ? connectionError || 'The connector request failed.'
        : connectionState === 'not-found'
          ? 'Start the connector locally. This page will connect as soon as it appears.'
          : 'Searching localhost and pairing automatically when the connector is ready.';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-3 py-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={closeDialog}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-connect-title"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-lg border border-hairline bg-canvas shadow-[var(--shadow-modal)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-6 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-body">
              <PlugZap size={15} aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em]">Local AI Agent</span>
            </div>
            <h2 id="mcp-connect-title" className="mt-2 text-base font-semibold text-ink">
              {statusTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-body transition-colors hover:bg-canvas-soft hover:text-ink"
            aria-label="Close connection dialog"
            title="Close"
          >
            <X size={16} />
          </button>
        </header>

        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                isReady ? 'bg-ink' : connectionNeedsAttention ? 'bg-error' : isSearching ? 'bg-mute animate-pulse' : 'bg-mute/70'
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{statusTitle}</p>
              <p className="mt-1 text-xs leading-5 text-body">{statusDescription}</p>
            </div>
            {connectionNeedsAttention && <CircleAlert size={16} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />}
            {isSearching && <LoadingSpinner size={16} className="mt-0.5" />}
          </div>

          {!isSignedIn && (
            <section className="mt-5 rounded-md border border-hairline bg-canvas-soft/45 px-3 py-3" aria-label="MCP sign in">
              <p className="text-xs font-medium text-ink">Continue with Google</p>
              <p className="mt-1 text-[11px] leading-4 text-body">
                Authentication is used for billing and MCP entitlement only. Notes, canvas data, and code remain on this device.
              </p>
              <button
                type="button"
                onClick={() => void reconnectConnector()}
                disabled={auth.state.pending || auth.state.status === 'loading' || auth.state.status === 'unavailable'}
                className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-ink px-3 text-[11px] font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-50"
              >
                {auth.state.pending ? <LoadingSpinner size={13} inverted /> : <CreditCard size={13} />}
                {auth.state.pending ? 'Signing in' : 'Sign in for MCP'}
              </button>
            </section>
          )}

          {isSignedIn && (billingVerifying || needsUpgrade) && (
            <section className="mt-5 rounded-md border border-hairline bg-canvas-soft/45 px-3 py-3" aria-label="MCP billing">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-body" aria-hidden="true" />
                <p className="text-xs font-medium text-ink">
                  {billingVerifying ? 'Payment pending verification' : 'AlgoGlyph Pro'}
                </p>
              </div>
              {billingVerifying ? (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-body">
                  <LoadingSpinner size={14} />
                  Waiting for a verified provider webhook. You can keep this window open.
                </div>
              ) : (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Billing interval">
                    {(['pro_monthly', 'pro_annual'] as const).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        role="radio"
                        aria-checked={billingPlan === plan}
                        onClick={() => setBillingPlan(plan)}
                        className={`rounded-md border px-3 py-2 text-left text-[11px] ${billingPlan === plan ? 'border-ink bg-canvas' : 'border-hairline text-body'}`}
                      >
                        <span className="block font-medium text-ink">{plan === 'pro_monthly' ? 'Monthly' : 'Annual'}</span>
                        <span className="mt-0.5 block text-mute">{plan === 'pro_monthly' ? 'Billed each month' : 'Billed once a year'}</span>
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-billing-region">
                    Billing country / currency
                    <select
                      id="mcp-billing-region"
                      value={billingRegion}
                      onChange={(event) => setBillingRegion(event.target.value as BillingRegion)}
                      className={inputClassName}
                    >
                      <option value="international">International · USD · Stripe</option>
                      <option value="india">India · INR · Razorpay</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => void beginCheckout()}
                    disabled={billingPending}
                    className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-ink px-3 text-xs font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {billingPending ? <LoadingSpinner size={14} inverted /> : <CreditCard size={14} />}
                    {billingPending ? 'Opening checkout' : 'Continue to secure checkout'}
                  </button>
                  <p className="mt-2 text-[10px] leading-4 text-mute">Card and payment details are collected by Stripe or Razorpay, not AlgoGlyph.</p>
                </>
              )}
            </section>
          )}

          {isSignedIn && hasPaidMcpAccess && billingStatus && (
            <section className="mt-5 rounded-md border border-hairline px-3 py-3" aria-label="Current MCP plan">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-ink">
                    Pro {billingStatus.planKey === 'pro_annual' ? 'Annual' : 'Monthly'}
                  </p>
                  <p className="mt-1 text-[11px] text-body">
                    {billingStatus.entitlement.status === 'grace'
                      ? `Payment recovery grace ends ${billingStatus.entitlement.gracePeriodEnd ? new Date(billingStatus.entitlement.gracePeriodEnd).toLocaleDateString() : 'soon'}.`
                      : billingStatus.entitlement.cancelAtPeriodEnd
                        ? `Access ends ${billingStatus.entitlement.accessUntil ? new Date(billingStatus.entitlement.accessUntil).toLocaleDateString() : 'at period end'}.`
                        : `Renews ${billingStatus.entitlement.currentPeriodEnd ? new Date(billingStatus.entitlement.currentPeriodEnd).toLocaleDateString() : 'after the current period'}.`}
                  </p>
                </div>
                {!billingStatus.entitlement.cancelAtPeriodEnd && (
                  <button
                    type="button"
                    onClick={() => void cancelSubscription()}
                    disabled={billingPending}
                    className="shrink-0 rounded-md border border-hairline px-2.5 py-1.5 text-[10px] text-body hover:text-ink disabled:opacity-50"
                  >
                    Cancel renewal
                  </button>
                )}
              </div>
              {billingStatus.entitlement.status === 'grace' && (
                <p className="mt-2 rounded bg-canvas-soft px-2 py-1.5 text-[10px] leading-4 text-error">
                  Renewal failed. Update payment with your provider before grace expires to keep MCP access.
                </p>
              )}
            </section>
          )}

          {billingError && (
            <p className="mt-3 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-[11px] leading-4 text-error" role="alert">
              {billingError}
            </p>
          )}

          {isSignedIn && billingStatus === null && !billingError && !billingVerifying && (
            <div className="mt-5 flex items-center gap-2 rounded-md border border-hairline px-3 py-3 text-[11px] text-body">
              <LoadingSpinner size={14} />
              Loading billing status…
            </div>
          )}

          {hasPaidMcpAccess && !isReady && (
            <section className="mt-5 rounded-md border border-hairline bg-canvas-soft/45 px-3 py-3" aria-label="Start connector">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink">Start the AlgoGlyph Connector</p>
                  <div className="mt-2 flex min-w-0 items-center gap-2 rounded-md border border-hairline bg-canvas px-2.5 py-2">
                    <Terminal size={13} className="shrink-0 text-body" aria-hidden="true" />
                    <code className="truncate font-mono text-[11px] text-ink">{MCP_CONNECTOR_USER_COMMAND}</code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void copyCommand()}
                  className="mt-6 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-hairline px-2.5 text-[11px] font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink"
                >
                  <Copy size={13} />
                  {copiedCommand ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-[11px] leading-4 text-mute">
                  {intentionalDisconnect
                    ? 'Connector process left untouched.'
                    : permissionRequired
                      ? 'Permission is requested only when you choose Connect.'
                      : permissionDenied
                        ? 'Change the permission, then try again.'
                        : 'Waiting for connector...'}
                </p>
                {!isSearching && (
                  <button
                    type="button"
                    onClick={reconnectConnector}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-ink px-2.5 text-[11px] font-medium text-canvas transition-opacity hover:opacity-90"
                  >
                    <RefreshCw size={13} />
                    {intentionalDisconnect ? 'Reconnect' : permissionDenied ? 'Try again' : 'Connect'}
                  </button>
                )}
              </div>
            </section>
          )}

          {isReady && (
            <section className="mt-5" aria-labelledby="ai-agent-title">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-body" aria-hidden="true" />
                <h3 id="ai-agent-title" className="text-sm font-medium text-ink">AI agent</h3>
              </div>
              <p className="mt-1 text-xs leading-5 text-body">
                Powers Ask AI on the canvas and note-making. {activeAgent ? `Using ${activeAgent.label}.` : ''}
              </p>

              {availableAgents.length === 0 ? (
                <p className="mt-3 text-xs text-mute">No CLI detected. Install Codex, Claude Code, or Antigravity and reconnect.</p>
              ) : (
                <div className="mt-3 grid gap-1.5" role="radiogroup" aria-label="AI agent">
                  {agents.map((agent) => {
                    const selected = agent.id === activeAgentId;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={!agent.available}
                        onClick={() => setActiveAgentId(agent.id)}
                        className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                          selected ? 'border-ink bg-canvas-soft' : 'border-hairline hover:border-hairline-strong'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-ink' : 'border-hairline-strong'}`}
                          aria-hidden="true"
                        >
                          {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-ink">{agent.label}</span>
                            <span className="font-mono text-[10px] text-mute">{agent.command}</span>
                          </div>
                          {agent.version && <p className="mt-0.5 truncate font-mono text-[10px] text-mute">{agent.version}</p>}
                        </div>
                        <span className="shrink-0 font-mono text-[10px] text-mute">
                          {!agent.available ? 'not installed' : selected ? 'active' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {hasPaidMcpAccess && <div className="mt-5 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setAdvancedOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={advancedOpen}
            >
              <span className="text-xs font-medium text-body">Advanced settings</span>
              <ChevronDown
                size={15}
                className={`shrink-0 text-mute transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {(showManualConnectionForm || advancedOpen) && (
              <div className="mt-4 grid gap-4">
                <form
                  className="grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void checkConnector();
                  }}
                >
                  <label className="grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-connector-endpoint">
                    Connector URL
                    <input
                      ref={endpointInputRef}
                      id="mcp-connector-endpoint"
                      value={connectorEndpoint}
                      onChange={(event) => setConnectorEndpoint(event.target.value)}
                      className={inputClassName}
                      spellCheck={false}
                      autoCapitalize="none"
                      autoCorrect="off"
                      inputMode="url"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                    {isReady ? (
                      <button
                        type="button"
                        onClick={() => void disconnectConnector()}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink"
                      >
                        <Unplug size={14} />
                        Disconnect
                      </button>
                    ) : (
                      <span className="text-[11px] leading-4 text-mute">Browser pairing always uses a paid, short-lived session.</span>
                    )}
                    <button
                      type="submit"
                      disabled={connectionState === 'checking'}
                      className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-xs font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {connectionState === 'checking' ? <LoadingSpinner size={14} inverted /> : <RefreshCw size={14} />}
                      {connectionState === 'checking' ? 'Checking' : 'Check connector'}
                    </button>
                  </div>
                </form>

                {isReady && (
                  <form
                    className="grid gap-3 border-t border-hairline pt-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void testServer();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Server size={14} className="text-body" aria-hidden="true" />
                      <span className="text-xs font-medium text-body">Test an MCP server</span>
                    </div>
                    <label className="grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-server-endpoint">
                      Server URL
                      <input
                        id="mcp-server-endpoint"
                        value={serverEndpoint}
                        onChange={(event) => setServerEndpoint(event.target.value)}
                        className={inputClassName}
                        placeholder="https://example.com/mcp"
                        spellCheck={false}
                        autoCapitalize="none"
                        autoCorrect="off"
                        inputMode="url"
                      />
                    </label>

                    <label className="grid gap-1.5 text-[11px] font-mono text-body" htmlFor="mcp-server-token">
                      Server token (optional)
                      <input
                        id="mcp-server-token"
                        type="password"
                        value={serverToken}
                        onChange={(event) => setServerToken(event.target.value)}
                        className={inputClassName}
                        placeholder="Bearer token"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </label>

                    <label className="flex items-start gap-2 text-[11px] leading-4 text-body">
                      <input
                        type="checkbox"
                        checked={allowPrivateNetwork}
                        onChange={(event) => setAllowPrivateNetwork(event.target.checked)}
                        className="mt-0.5"
                      />
                      Allow a loopback MCP server on this device. Other private, reserved, link-local, and metadata addresses stay blocked.
                    </label>

                    <div className="flex justify-end pt-0.5">
                      <button
                        type="submit"
                        disabled={testingServer}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline px-3 text-xs font-medium text-body transition-colors hover:border-hairline-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {testingServer ? <LoadingSpinner size={14} /> : <Server size={14} />}
                        {testingServer ? 'Testing' : 'Test server'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>}

          {serverError && <p className="mt-3 border-l-2 border-error pl-3 text-xs leading-5 text-error">{serverError}</p>}

          {serverResult && (
            <div className="mt-4 rounded-md border border-hairline px-3 py-3">
              <p className="truncate text-xs font-medium text-ink">
                {serverResult.server.name}
                {serverResult.server.version ? ` v${serverResult.server.version}` : ''}
              </p>
              <p className="mt-1 font-mono text-[10px] text-mute">
                {serverResult.transport} / {resultLabel(serverResult)}
              </p>
              {(serverResult.resources.length > 0 || serverResult.prompts.length > 0 || serverResult.tools.length > 0) && (
                <div className="mt-3 grid gap-2 border-t border-hairline pt-3 text-[11px] text-body">
                  {serverResult.tools.map((tool) => (
                    <div key={`tool:${tool.name}`}>
                      <span className="font-mono text-ink">tool / {tool.name}</span>
                      {tool.description && <span className="ml-2 text-mute">{tool.description}</span>}
                    </div>
                  ))}
                  {serverResult.resources.map((resource) => (
                    <div key={`resource:${resource.uri}`}>
                      <span className="font-mono text-ink">resource / {resource.name || resource.uri}</span>
                    </div>
                  ))}
                  {serverResult.prompts.map((prompt) => (
                    <div key={`prompt:${prompt.name}`}>
                      <span className="font-mono text-ink">prompt / {prompt.name}</span>
                    </div>
                  ))}
                  {serverResult.truncated && <p className="text-mute">Results were capped at the connector safety limit.</p>}
                </div>
              )}
              {serverResult.tools.length > 0 && (
                <div className="mt-3 grid gap-2 border-t border-hairline pt-3">
                  <select value={toolName} onChange={(event) => setToolName(event.target.value)} className={inputClassName}>
                    {serverResult.tools.map((tool) => <option key={tool.name} value={tool.name}>{tool.name}</option>)}
                  </select>
                  <textarea
                    value={toolArguments}
                    onChange={(event) => setToolArguments(event.target.value)}
                    className={`${inputClassName} h-24 py-2`}
                    spellCheck={false}
                    aria-label="Exact MCP tool arguments as JSON"
                  />
                  <button
                    type="button"
                    onClick={() => void invokeTool()}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-hairline px-3 text-xs font-medium text-body"
                  >
                    Preview and invoke tool
                  </button>
                  {toolResult && <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-[10px] text-body">{toolResult}</pre>}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
