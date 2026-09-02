import { initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  isMcpScope,
  isPlanKey,
  type BillingProvider,
  type McpScope,
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
  requireFirebaseUser,
  sha256,
} from './security.js';
import {
  applyProviderEvent,
  applyReconciliationSnapshot,
  completeCheckout,
  createConnectorGrant,
  ensurePersonalWorkspace,
  expireElapsedEntitlements,
  getBillingStatus,
  listReconciliationCandidates,
  markCancellationRequested,
  redeemConnectorGrant,
  releaseCheckout,
  reserveCheckout,
  subscriptionForCancellation,
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
const checkoutSuccessUrl = defineString('CHECKOUT_SUCCESS_URL', {
  default: 'https://algoglyph.com/workspace?billing=success',
});
const checkoutCancelUrl = defineString('CHECKOUT_CANCEL_URL', {
  default: 'https://algoglyph.com/workspace?billing=cancelled',
});

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
  '/v1/billing/status',
  '/v1/billing/checkout',
  '/v1/billing/cancel',
  '/v1/connector/grants',
]);

const json = (response: { status(code: number): { json(body: unknown): void } }, status: number, body: unknown): void => {
  response.status(status).json(body);
};

const validateGrantInput = (body: Record<string, unknown>, expectedOrigin?: string) => {
  assertExactKeys(body, ['pairingCredentialHash', 'origin', 'connectorVersion', 'requestedScopes', 'entitlementGrant']);
  const pairingCredentialHash = typeof body.pairingCredentialHash === 'string' ? body.pairingCredentialHash : '';
  const origin = typeof body.origin === 'string' ? body.origin : '';
  const connectorVersion = typeof body.connectorVersion === 'string' ? body.connectorVersion : '';
  if (!/^[a-f0-9]{64}$/.test(pairingCredentialHash)) throw new HttpError(400, 'Invalid pairing credential binding.');
  try {
    if (new URL(origin).origin !== origin) throw new Error('not an origin');
  } catch {
    throw new HttpError(400, 'Invalid connector origin.');
  }
  if (expectedOrigin && origin !== expectedOrigin) throw new HttpError(403, 'Connector origin does not match this request.');
  if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][A-Za-z0-9.-]+)?$/.test(connectorVersion)) {
    throw new HttpError(400, 'Invalid connector version.');
  }
  if (!Array.isArray(body.requestedScopes) || body.requestedScopes.length === 0 || body.requestedScopes.length > 5) {
    throw new HttpError(400, 'At least one supported connector scope is required.');
  }
  const requestedScopes = [...new Set(body.requestedScopes)];
  if (!requestedScopes.every(isMcpScope)) throw new HttpError(400, 'Unsupported connector scope.');
  return { pairingCredentialHash, origin, connectorVersion, requestedScopes: requestedScopes as McpScope[] };
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
      await requireAppCheck(request);
    }

    if (request.method === 'GET' && path === '/v1/workspace') {
      const principal = await requireFirebaseUser(request);
      await enforceRateLimit('workspace', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 60, 60);
      json(response, 200, { workspace: await ensurePersonalWorkspace(principal) });
      return;
    }

    if (request.method === 'GET' && path === '/v1/billing/status') {
      const principal = await requireFirebaseUser(request);
      const workspaceId = `personal_${principal.uid}`;
      await enforceRateLimit(
        'billing_status',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        60,
        60,
      );
      json(response, 200, await getBillingStatus(principal));
      return;
    }

    if (request.method === 'POST' && path === '/v1/billing/checkout') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['planKey', 'billingRegion']);
      const plan = resolvePlan(body.planKey, body.billingRegion);
      const workspaceId = `personal_${principal.uid}`;
      await enforceRateLimit(
        'billing_checkout',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        5,
        15 * 60,
      );
      const reservation = await reserveCheckout(principal, plan);
      try {
        const result = await createHostedCheckout({
          workspaceId: reservation.workspace.id,
          uid: principal.uid,
          email: principal.email,
          displayName: principal.displayName,
          plan,
          successUrl: checkoutSuccessUrl.value(),
          cancelUrl: checkoutCancelUrl.value(),
          existingCustomerId: reservation.existingCustomerId,
        }, configuredSecrets());
        await completeCheckout(principal, reservation.workspace.id, reservation.attemptId, plan, result);
        json(response, 200, result);
      } catch (error) {
        await releaseCheckout(reservation.workspace.id, reservation.attemptId);
        throw error;
      }
      return;
    }

    if (request.method === 'POST' && path === '/v1/billing/cancel') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, []);
      const subscription = await subscriptionForCancellation(principal);
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

    if (request.method === 'POST' && path === '/v1/connector/grants') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      const origin = request.header('origin');
      if (!origin) throw new HttpError(403, 'Origin is required.');
      const input = validateGrantInput(body, origin);
      const workspaceId = `personal_${principal.uid}`;
      await enforceRateLimit(
        'connector_grant',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        10,
        60,
      );
      json(response, 200, await createConnectorGrant(principal, input));
      return;
    }

    if (request.method === 'POST' && path === '/v1/connector/grants/redeem') {
      const body = assertJsonObject(request.body);
      const input = validateGrantInput(body);
      const entitlementGrant = typeof body.entitlementGrant === 'string' ? body.entitlementGrant : '';
      if (!/^[A-Za-z0-9_-]{40,64}$/.test(entitlementGrant)) throw new HttpError(401, 'Invalid connector grant.');
      await enforceRateLimit('connector_redeem', [`ip:${requestIp(request)}`], 30, 60);
      json(response, 200, await redeemConnectorGrant({ ...input, entitlementGrant }));
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
      const event = await normalizeRazorpayEventWithLookup(
        payload,
        request.header('x-razorpay-event-id'),
        secrets,
      );
      if (!event) throw new Error('A supported Razorpay event could not be resolved to a subscription.');
      const outcome = await applyProviderEvent(event, sha256(request.rawBody));
      json(response, 200, { received: true, outcome });
      return;
    }

    if ([...browserPaths, '/v1/connector/grants/redeem', '/v1/webhooks/stripe', '/v1/webhooks/razorpay'].includes(path)) {
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
