import type {
  BillingApiTokens,
  BillingCheckoutResult,
  BillingPlanKey,
  BillingRegion,
  BillingStatus,
  ConnectorGrantRequest,
  ConnectorGrantResult,
} from './types';

const BILLING_API_URL = (import.meta.env.VITE_BILLING_API_URL || 'https://api.algoglyph.com').replace(/\/$/, '');
const MAX_RESPONSE_BYTES = 256 * 1024;

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
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${tokens.idToken}`);
  headers.set('X-Firebase-AppCheck', tokens.appCheckToken);
  if (init.body) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${BILLING_API_URL}/${path.replace(/^\//, '')}`, {
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
      messageFrom(payload, response.status === 402 ? 'Upgrade to AlgoGlyph Pro to use MCP.' : 'The billing request failed.'),
      response.status,
    );
  }
  return payload as T;
};

export const getBillingStatus = (tokens: BillingApiTokens): Promise<BillingStatus> =>
  requestBillingApi<BillingStatus>('v1/billing/status', tokens);

export const createBillingCheckout = (
  tokens: BillingApiTokens,
  planKey: BillingPlanKey,
  billingRegion: BillingRegion,
): Promise<BillingCheckoutResult> => requestBillingApi<BillingCheckoutResult>(
  'v1/billing/checkout',
  tokens,
  { method: 'POST', body: JSON.stringify({ planKey, billingRegion }) },
);

export const cancelBillingSubscription = (
  tokens: BillingApiTokens,
): Promise<{ cancelAtPeriodEnd: true }> => requestBillingApi(
  'v1/billing/cancel',
  tokens,
  { method: 'POST', body: '{}' },
);

export const createConnectorGrant = (
  tokens: BillingApiTokens,
  request: ConnectorGrantRequest,
): Promise<ConnectorGrantResult> => requestBillingApi(
  'v1/connector/grants',
  tokens,
  { method: 'POST', body: JSON.stringify(request) },
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
  onComplete: () => void,
  onDismiss: () => void,
): Promise<void> => {
  const Razorpay = await loadRazorpay();
  let completed = false;
  const checkout = new Razorpay({
    key: result.razorpay.keyId,
    subscription_id: result.razorpay.subscriptionId,
    name: result.razorpay.name,
    description: result.razorpay.description,
    handler: () => {
      completed = true;
      onComplete();
    },
    modal: { ondismiss: () => { if (!completed) onDismiss(); } },
    theme: { color: '#111111' },
  });
  checkout.open();
};
