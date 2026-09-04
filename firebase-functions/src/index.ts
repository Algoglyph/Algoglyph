import { initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  isPlanKey,
  type BillingProvider,
  type PlanDefinition,
} from './model.js';
import {
  cancelProviderSubscription,
  createHostedCheckout,
  fetchSubscriptionSnapshot,
  isSupportedRazorpayBillingEvent,
  isSupportedStripeBillingEvent,
  normalizeRazorpayEventWithLookup,
  normalizeStripeEventWithLookup,
  verifyRazorpayWebhook,
  verifyRazorpayCheckoutSignature,
  verifyRazorpayCheckoutWithProvider,
  verifyStripeWebhook,
  type ProviderSecrets,
} from './providers.js';
import {
  applyBrowserCors,
  assertExactKeys,
  assertJsonObject,
  enforceRateLimit,
  HttpError,
  redactError,
  requestIp,
  requireAppCheck,
  requireBillingAuthorization,
  requireConfiguredBrowserUrl,
  requireFirebaseUser,
  requireJsonContentType,
  requireRequestBodyWithin,
  sha256,
} from './security.js';
import {
  applyProviderEvent,
  applyReconciliationSnapshot,
  canUseManagedAgent,
  completeCheckout,
  ensurePersonalWorkspace,
  expireElapsedEntitlements,
  getBillingStatus,
  listBillingWorkspaces,
  listReconciliationCandidates,
  markCancellationRequested,
  releaseCheckout,
  reserveCheckout,
  recordRazorpayCheckoutVerification,
  subscriptionForCancellation,
  subscriptionForRazorpayVerification,
} from './services.js';

initializeApp();

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');
const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const razorpayWebhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');

const stripeMonthlyPrice = defineString('STRIPE_PRO_MONTHLY_PRICE_ID');
const stripeAnnualPrice = defineString('STRIPE_PRO_ANNUAL_PRICE_ID');
const razorpayMonthlyPlan = defineString('RAZORPAY_PRO_MONTHLY_PLAN_ID');
const razorpayAnnualPlan = defineString('RAZORPAY_PRO_ANNUAL_PLAN_ID');
const checkoutSuccessUrl = defineString('CHECKOUT_SUCCESS_URL');
const checkoutCancelUrl = defineString('CHECKOUT_CANCEL_URL');

const configuredSecrets = (): ProviderSecrets => ({
  stripeSecretKey: stripeSecretKey.value(),
  stripeWebhookSecret: stripeWebhookSecret.value(),
  razorpayKeyId: razorpayKeyId.value(),
  razorpayKeySecret: razorpayKeySecret.value(),
  razorpayWebhookSecret: razorpayWebhookSecret.value(),
});

const requireConfigured = (value: string, name: string): string => {
  if (!value.trim()) throw new HttpError(503, `${name} is not configured.`);
  return value.trim();
};

const resolvePlan = (planKey: unknown, billingRegion: unknown): PlanDefinition => {
  if (!isPlanKey(planKey)) throw new HttpError(400, 'A supported plan is required.');
  if (billingRegion !== 'india' && billingRegion !== 'international') {
    throw new HttpError(400, 'A supported billing region is required.');
  }
  const provider: BillingProvider = billingRegion === 'india' ? 'razorpay' : 'stripe';
  const providerPriceId = provider === 'stripe'
    ? planKey === 'pro_monthly' ? stripeMonthlyPrice.value() : stripeAnnualPrice.value()
    : planKey === 'pro_monthly' ? razorpayMonthlyPlan.value() : razorpayAnnualPlan.value();
  return {
    key: planKey,
    interval: planKey === 'pro_monthly' ? 'month' : 'year',
    currency: provider === 'stripe' ? 'USD' : 'INR',
    provider,
    providerPriceId: requireConfigured(providerPriceId, `${provider} ${planKey}`),
  };
};

const browserPaths = new Set([
  '/v1/workspace',
  '/v1/billing/workspaces',
  '/v1/billing/status',
  '/v1/billing/checkout',
  '/v1/billing/cancel',
  '/v1/billing/razorpay/verify',
  '/v1/managed-agent/authorize',
]);
const webhookPaths = new Set(['/v1/webhooks/stripe', '/v1/webhooks/razorpay']);
const MAX_BROWSER_REQUEST_BYTES = 32 * 1024;
const MAX_WEBHOOK_REQUEST_BYTES = 1024 * 1024;

const json = (response: { status(code: number): { json(body: unknown): void } }, status: number, body: unknown): void => {
  response.status(status).json(body);
};

const optionalOrganizationId = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{6,80}$/.test(value)) {
    throw new HttpError(400, 'Invalid organization identifier.');
  }
  return value;
};

export const api = onRequest({
  region: 'us-central1',
  cors: false,
  timeoutSeconds: 30,
  memory: '256MiB',
  secrets: [
    stripeSecretKey,
    stripeWebhookSecret,
    razorpayKeyId,
    razorpayKeySecret,
    razorpayWebhookSecret,
  ],
}, async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  const path = request.path.replace(/\/$/, '') || '/';

  try {
    if (browserPaths.has(path)) {
      applyBrowserCors(request, response);
      if (request.method === 'OPTIONS') {
        response.status(204).end();
        return;
      }
      requireRequestBodyWithin(request, MAX_BROWSER_REQUEST_BYTES);
      assertExactKeys(
        request.query as Record<string, unknown>,
        path === '/v1/billing/status' ? ['organizationId'] : [],
      );
      if (request.method === 'POST') requireJsonContentType(request);
      await requireAppCheck(request);
    }
    if (webhookPaths.has(path)) {
      assertExactKeys(request.query as Record<string, unknown>, []);
      requireRequestBodyWithin(request, MAX_WEBHOOK_REQUEST_BYTES);
    }

    if (request.method === 'GET' && path === '/v1/workspace') {
      const principal = await requireFirebaseUser(request);
      await enforceRateLimit('workspace', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 60, 60);
      json(response, 200, { workspace: await ensurePersonalWorkspace(principal) });
      return;
    }

    if (request.method === 'GET' && path === '/v1/billing/status') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      const organizationId = optionalOrganizationId(request.query.organizationId);
      const workspaceId = organizationId ? `organization_${organizationId}` : `personal_${principal.uid}`;
      await enforceRateLimit(
        'billing_status',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        60,
        60,
      );
      json(response, 200, await getBillingStatus(principal, organizationId));
      return;
    }

    if (request.method === 'GET' && path === '/v1/billing/workspaces') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      await enforceRateLimit('billing_workspaces', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 30, 60);
      json(response, 200, { workspaces: await listBillingWorkspaces(principal) });
      return;
    }

    if (request.method === 'POST' && path === '/v1/billing/checkout') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['planKey', 'billingRegion', 'organizationId']);
      const plan = resolvePlan(body.planKey, body.billingRegion);
      const organizationId = optionalOrganizationId(body.organizationId);
      const workspaceId = organizationId ? `organization_${organizationId}` : `personal_${principal.uid}`;
      await enforceRateLimit(
        'billing_checkout',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        5,
        15 * 60,
      );
      const reservation = await reserveCheckout(principal, plan, organizationId);
      try {
        const result = await createHostedCheckout({
          workspaceId: reservation.workspace.id,
          uid: principal.uid,
          email: principal.email,
          displayName: principal.displayName,
          plan,
          successUrl: requireConfiguredBrowserUrl(
            requireConfigured(checkoutSuccessUrl.value(), 'CHECKOUT_SUCCESS_URL'),
            'CHECKOUT_SUCCESS_URL',
          ),
          cancelUrl: requireConfiguredBrowserUrl(
            requireConfigured(checkoutCancelUrl.value(), 'CHECKOUT_CANCEL_URL'),
            'CHECKOUT_CANCEL_URL',
          ),
          existingCustomerId: reservation.existingCustomerId,
        }, configuredSecrets());
        await completeCheckout(principal, reservation.workspace, reservation.attemptId, plan, result);
        json(response, 200, result);
      } catch (error) {
        await releaseCheckout(reservation.workspace.id, reservation.attemptId);
        throw error;
      }
      return;
    }

    if (request.method === 'POST' && path === '/v1/billing/cancel') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal, { recentAuthentication: true });
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['organizationId']);
      const organizationId = optionalOrganizationId(body.organizationId);
      const subscription = await subscriptionForCancellation(principal, organizationId);
      await enforceRateLimit(
        'billing_cancel',
        [`uid:${principal.uid}`, `workspace:${subscription.workspaceId}`, `ip:${requestIp(request)}`],
        5,
        60 * 60,
      );
      await cancelProviderSubscription(
        subscription.provider,
        subscription.providerSubscriptionId,
        configuredSecrets(),
      );
      await markCancellationRequested(principal, subscription.workspaceId);
      json(response, 200, { cancelAtPeriodEnd: true });
      return;
    }

    if (request.method === 'POST' && path === '/v1/billing/razorpay/verify') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['paymentId', 'subscriptionId', 'signature', 'organizationId']);
      const organizationId = optionalOrganizationId(body.organizationId);
      const paymentId = typeof body.paymentId === 'string' ? body.paymentId.trim() : '';
      const subscriptionId = typeof body.subscriptionId === 'string' ? body.subscriptionId.trim() : '';
      const signature = typeof body.signature === 'string' ? body.signature.trim() : '';
      if (!/^pay_[A-Za-z0-9]{8,48}$/.test(paymentId)
        || !/^sub_[A-Za-z0-9]{8,48}$/.test(subscriptionId)
        || !/^[a-f0-9]{64}$/i.test(signature)) {
        throw new HttpError(400, 'Invalid Razorpay verification payload.');
      }
      const workspaceId = organizationId ? `organization_${organizationId}` : `personal_${principal.uid}`;
      await enforceRateLimit(
        'razorpay_callback_verify',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        10,
        15 * 60,
      );
      const subscription = await subscriptionForRazorpayVerification(principal, subscriptionId, organizationId);
      const secrets = configuredSecrets();
      if (!verifyRazorpayCheckoutSignature(paymentId, subscriptionId, signature, secrets.razorpayKeySecret)) {
        throw new HttpError(400, 'Invalid Razorpay payment signature.');
      }
      const plan = resolvePlan(subscription.planKey, 'india');
      const verified = await verifyRazorpayCheckoutWithProvider(
        paymentId,
        subscription.providerSubscriptionId,
        plan.providerPriceId,
        secrets,
      );
      await recordRazorpayCheckoutVerification(
        principal,
        subscription.workspaceId,
        subscription.providerSubscriptionId,
        paymentId,
        verified.paymentStatus,
        verified.amount,
        verified.currency,
      );
      json(response, 200, { verified: true, entitlementPending: true });
      return;
    }

    if (request.method === 'POST' && path === '/v1/managed-agent/authorize') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['workspaceId']);
      const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
      if (!workspaceId || workspaceId.length > 200 || workspaceId.includes('/')) {
        throw new HttpError(400, 'Invalid workspace identifier.');
      }
      await enforceRateLimit(
        'managed_agent_authorize',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        30,
        60,
      );
      json(response, 200, await canUseManagedAgent(principal, workspaceId));
      return;
    }

    if (request.method === 'POST' && path === '/v1/webhooks/stripe') {
      const secrets = configuredSecrets();
      const signature = request.header('stripe-signature');
      if (!verifyStripeWebhook(request.rawBody, signature, secrets.stripeWebhookSecret)) {
        throw new HttpError(400, 'Invalid webhook signature.');
      }
      const payload: unknown = JSON.parse(request.rawBody.toString('utf8'));
      if (!isSupportedStripeBillingEvent(payload)) {
        json(response, 200, { received: true, outcome: 'ignored' });
        return;
      }
      const event = await normalizeStripeEventWithLookup(payload, secrets);
      if (!event) throw new Error('A supported Stripe event could not be resolved to a subscription.');
      const outcome = await applyProviderEvent(event, sha256(request.rawBody));
      json(response, 200, { received: true, outcome });
      return;
    }

    if (request.method === 'POST' && path === '/v1/webhooks/razorpay') {
      const secrets = configuredSecrets();
      const signature = request.header('x-razorpay-signature');
      if (!verifyRazorpayWebhook(request.rawBody, signature, secrets.razorpayWebhookSecret)) {
        throw new HttpError(400, 'Invalid webhook signature.');
      }
      const payload: unknown = JSON.parse(request.rawBody.toString('utf8'));
      if (!isSupportedRazorpayBillingEvent(payload)) {
        json(response, 200, { received: true, outcome: 'ignored' });
        return;
      }
      const eventId = request.header('x-razorpay-event-id');
      if (!eventId || !/^[A-Za-z0-9_-]{8,200}$/.test(eventId)) {
        throw new HttpError(400, 'A valid Razorpay event identifier is required.');
      }
      const event = await normalizeRazorpayEventWithLookup(
        payload,
        eventId,
        secrets,
      );
      if (!event) throw new Error('A supported Razorpay event could not be resolved to a subscription.');
      const outcome = await applyProviderEvent(event, sha256(request.rawBody));
      json(response, 200, { received: true, outcome });
      return;
    }

    if ([...browserPaths, ...webhookPaths].includes(path)) {
      throw new HttpError(405, 'Method not allowed.');
    }
    throw new HttpError(404, 'Not found.');
  } catch (error) {
    const { status, message } = redactError(error);
    if (status >= 500) {
      logger.error('billing_api_request_failed', {
        path,
        method: request.method,
        status,
        errorName: error instanceof Error ? error.name : 'unknown',
      });
    }
    json(response, status, { error: { status, message } });
  }
});

export const reconcileBilling = onSchedule({
  schedule: 'every 60 minutes',
  region: 'us-central1',
  timeZone: 'Etc/UTC',
  timeoutSeconds: 540,
  memory: '256MiB',
  secrets: [
    stripeSecretKey,
    stripeWebhookSecret,
    razorpayKeyId,
    razorpayKeySecret,
    razorpayWebhookSecret,
  ],
}, async () => {
  const candidates = await listReconciliationCandidates();
  const secrets = configuredSecrets();
  let reconciled = 0;
  let failed = 0;
  for (const candidate of candidates) {
    try {
      const snapshot = await fetchSubscriptionSnapshot(
        candidate.provider,
        candidate.providerSubscriptionId,
        secrets,
      );
      await applyReconciliationSnapshot(candidate, snapshot);
      reconciled += 1;
    } catch (error) {
      failed += 1;
      logger.error('billing_reconciliation_item_failed', {
        workspaceIdHash: sha256(candidate.workspaceId).slice(0, 16),
        provider: candidate.provider,
        errorName: error instanceof Error ? error.name : 'unknown',
      });
    }
  }
  const expired = await expireElapsedEntitlements();
  logger.info('billing_reconciliation_completed', { candidates: candidates.length, reconciled, failed, expired });
});
