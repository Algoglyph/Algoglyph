import type {
  BillingApiTokens,
  BillingCheckoutResult,
  BillingPlanKey,
  BillingRegion,
  BillingStatus,
  BillingSubjectsResult,
  ManagedAgentResult,
  ManagedAgentAuthorization,
  RazorpayCheckoutCallback,
} from './types';

const configuredBillingApiUrl = (import.meta.env.VITE_ALGOGLYPH_API_URL || import.meta.env.VITE_BILLING_API_URL || '').trim().replace(/\/$/, '');
const MAX_RESPONSE_BYTES = 256 * 1024;

export const getBillingConfigurationError = (): string | null => {
  if (!configuredBillingApiUrl) return 'Billing is not configured. Set VITE_ALGOGLYPH_API_URL for this environment.';
  try {
    const url = new URL(configuredBillingApiUrl);
    const localDevelopment = import.meta.env.DEV && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(localDevelopment && url.protocol === 'http:')) {
      return 'VITE_ALGOGLYPH_API_URL must use HTTPS (local development may use a loopback HTTP URL).';
    }
    if (url.username || url.password || url.search || url.hash) {
      return 'VITE_ALGOGLYPH_API_URL must be a clean API origin without credentials, query parameters, or fragments.';
    }
    return null;
  } catch {
    return 'VITE_ALGOGLYPH_API_URL is not a valid URL.';
  }
};

export class BillingRequestError extends Error {
  readonly status: number | undefined;

  constructor(
    message: string,
    status?: number,
  ) {
    super(message);
    this.status = status;
  }
}

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
    throw new BillingRequestError('The billing service returned too much data.');
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new BillingRequestError('The billing service returned an invalid response.', response.status);
  }
};

const messageFrom = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) return fallback;
  const error = payload.error;
  if (!error || typeof error !== 'object' || !('message' in error)) return fallback;
  return typeof error.message === 'string' ? error.message : fallback;
};

const requestBillingApi = async <T>(
  path: string,
  tokens: BillingApiTokens,
  init: RequestInit = {},
): Promise<T> => {
  const configurationError = getBillingConfigurationError();
  if (configurationError) throw new BillingRequestError(configurationError, 503);
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${tokens.idToken}`);
  headers.set('X-Firebase-AppCheck', tokens.appCheckToken);
  if (init.body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${configuredBillingApiUrl}/${path.replace(/^\//, '')}`, {
      ...init,
      headers,
      credentials: 'omit',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new BillingRequestError('Could not reach the AlgoGlyph billing service.');
  }
  const payload = await readJson(response);
  if (!response.ok) {
    throw new BillingRequestError(
      messageFrom(payload, response.status === 402 ? 'An active managed-agent subscription is required.' : 'The billing request failed.'),
      response.status,
    );
  }
  return payload as T;
};

const organizationPayload = (organizationId?: string): { organizationId?: string } => (
  organizationId ? { organizationId } : {}
);

export const getBillingSubjects = (tokens: BillingApiTokens): Promise<BillingSubjectsResult> =>
  requestBillingApi<BillingSubjectsResult>('v1/billing/subjects', tokens);

export const getBillingStatus = (
  tokens: BillingApiTokens,
  organizationId?: string,
): Promise<BillingStatus> => {
  const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : '';
  return requestBillingApi<BillingStatus>(`v1/billing/status${query}`, tokens);
};

export const createBillingCheckout = (
  tokens: BillingApiTokens,
  planKey: BillingPlanKey,
  billingRegion: BillingRegion,
  organizationId?: string,
): Promise<BillingCheckoutResult> => requestBillingApi<BillingCheckoutResult>(
  'v1/billing/checkout',
  tokens,
  { method: 'POST', body: JSON.stringify({ planKey, billingRegion, ...organizationPayload(organizationId) }) },
);

export const cancelBillingSubscription = (
  tokens: BillingApiTokens,
  organizationId?: string,
): Promise<{ cancelAtPeriodEnd: true }> => requestBillingApi(
  'v1/billing/cancel',
  tokens,
  { method: 'POST', body: JSON.stringify(organizationPayload(organizationId)) },
);

export const verifyRazorpayCheckout = (
  tokens: BillingApiTokens,
  callback: RazorpayCheckoutCallback,
  organizationId?: string,
): Promise<{ verified: true; entitlementPending: true }> => requestBillingApi(
  'v1/billing/razorpay/verify',
  tokens,
  { method: 'POST', body: JSON.stringify({ ...callback, ...organizationPayload(organizationId) }) },
);

export const authorizeManagedAgent = (
  tokens: BillingApiTokens,
  workspaceId: string,
): Promise<ManagedAgentAuthorization> => requestBillingApi(
  'v1/managed-agent/authorize',
  tokens,
  { method: 'POST', body: JSON.stringify({ workspaceId }) },
);

export const runManagedAgent = (
  tokens: BillingApiTokens,
  workspaceId: string,
  canvasId: string,
  prompt: string,
): Promise<ManagedAgentResult> => requestBillingApi(
  'v1/managed-agent/run',
  tokens,
  { method: 'POST', body: JSON.stringify({ workspaceId, canvasId, prompt }) },
);

interface RazorpayConstructor {
  new(options: Record<string, unknown>): { open(): void };
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const loadRazorpay = async (): Promise<RazorpayConstructor> => {
  if (window.Razorpay) return window.Razorpay;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-algoglyph-razorpay]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Razorpay Checkout failed to load.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.algoglyphRazorpay = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Razorpay Checkout failed to load.')), { once: true });
    document.head.appendChild(script);
  });
  if (!window.Razorpay) throw new BillingRequestError('Razorpay Checkout is unavailable.');
  return window.Razorpay;
};

export const openRazorpayCheckout = async (
  result: Extract<BillingCheckoutResult, { provider: 'razorpay' }>,
  onComplete: (callback: RazorpayCheckoutCallback) => void,
  onDismiss: () => void,
): Promise<void> => {
  const Razorpay = await loadRazorpay();
  let completed = false;
  const checkout = new Razorpay({
    key: result.razorpay.keyId,
    subscription_id: result.razorpay.subscriptionId,
    name: result.razorpay.name,
    description: result.razorpay.description,
    handler: (response: Record<string, unknown>) => {
      completed = true;
      const paymentId = typeof response.razorpay_payment_id === 'string' ? response.razorpay_payment_id : '';
      const subscriptionId = typeof response.razorpay_subscription_id === 'string'
        ? response.razorpay_subscription_id
        : '';
      const signature = typeof response.razorpay_signature === 'string' ? response.razorpay_signature : '';
      if (!paymentId || !subscriptionId || !signature) {
        onDismiss();
        return;
      }
      onComplete({ paymentId, subscriptionId, signature });
    },
    modal: { ondismiss: () => { if (!completed) onDismiss(); } },
    theme: { color: '#111111' },
  });
  checkout.open();
};
