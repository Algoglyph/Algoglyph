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
  expireElapsedEntitlements,
  getBillingStatus,
  listBillingSubjects,
  listReconciliationCandidates,
  markCancellationRequested,
  releaseCheckout,
  reserveCheckout,
  recordRazorpayCheckoutVerification,
  subscriptionForCancellation,
  subscriptionForRazorpayVerification,
} from './services.js';
import {
  acceptWorkspaceInvite,
  createCanvas,
  createMcpAccessToken,
  createOrganization,
  createWorkspace,
  createWorkspaceInvite,
  getWorkspace,
  inspectWorkspaceInvite,
  listCanvases,
  listMcpAccessTokens,
  listOrganizations,
  listWorkspaceMembers,
  listWorkspaces,
  requireCanvasAccess,
  requireMcpAccessToken,
  revokeMcpAccessToken,
  revokeWorkspaceInvite,
  upsertIdentity,
  updateCanvasMetadata,
} from './workspaces.js';
import { handleMcpRequest } from './mcp.js';
import { runManagedAgent } from './managedAgent.js';

initializeApp();

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');
const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const razorpayWebhookSecret = defineSecret('RAZORPAY_WEBHOOK_SECRET');
const managedAgentApiKey = defineSecret('MANAGED_AGENT_API_KEY');

const stripeMonthlyPrice = defineString('STRIPE_PRO_MONTHLY_PRICE_ID');
const stripeAnnualPrice = defineString('STRIPE_PRO_ANNUAL_PRICE_ID');
const razorpayMonthlyPlan = defineString('RAZORPAY_PRO_MONTHLY_PLAN_ID');
const razorpayAnnualPlan = defineString('RAZORPAY_PRO_ANNUAL_PLAN_ID');
const checkoutSuccessUrl = defineString('CHECKOUT_SUCCESS_URL');
const checkoutCancelUrl = defineString('CHECKOUT_CANCEL_URL');
const inviteBaseUrl = defineString('INVITE_BASE_URL');
const managedAgentApiUrl = defineString('MANAGED_AGENT_API_URL');
const managedAgentModel = defineString('MANAGED_AGENT_MODEL');

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

const exactBrowserPaths = new Set([
  '/v1/workspaces',
  '/v1/organizations',
  '/v1/invites/inspect',
  '/v1/invites/accept',
  '/v1/mcp-tokens/revoke',
  '/v1/billing/subjects',
  '/v1/billing/status',
  '/v1/billing/checkout',
  '/v1/billing/cancel',
  '/v1/billing/razorpay/verify',
  '/v1/managed-agent/authorize',
  '/v1/managed-agent/run',
]);
const isBrowserPath = (path: string): boolean => exactBrowserPaths.has(path)
  || /^\/v1\/workspaces\/[A-Za-z0-9_-]{6,120}(?:\/(?:canvases|members|invites|mcp-tokens)(?:\/[A-Za-z0-9_-]{6,120})?)?$/.test(path);
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
  timeoutSeconds: 60,
  memory: '256MiB',
  secrets: [
    stripeSecretKey,
    stripeWebhookSecret,
    razorpayKeyId,
    razorpayKeySecret,
    razorpayWebhookSecret,
    managedAgentApiKey,
  ],
}, async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  const path = request.path.replace(/\/$/, '') || '/';
  const workspaceRootMatch = path.match(/^\/v1\/workspaces\/([A-Za-z0-9_-]{6,120})$/);
  const workspaceChildMatch = path.match(
    /^\/v1\/workspaces\/([A-Za-z0-9_-]{6,120})\/(canvases|members|invites|mcp-tokens)(?:\/([A-Za-z0-9_-]{6,120}))?$/,
  );

  try {
    if (isBrowserPath(path)) {
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
      if (request.method === 'POST' || request.method === 'PATCH') requireJsonContentType(request);
      await requireAppCheck(request);
    }
    if (webhookPaths.has(path)) {
      assertExactKeys(request.query as Record<string, unknown>, []);
      requireRequestBodyWithin(request, MAX_WEBHOOK_REQUEST_BYTES);
    }
    if (path === '/v1/mcp') {
      assertExactKeys(request.query as Record<string, unknown>, []);
      requireRequestBodyWithin(request, 1024 * 1024);
      if (request.method === 'POST') requireJsonContentType(request);
    }

    if (request.method === 'GET' && path === '/v1/workspaces') {
      const principal = await requireFirebaseUser(request);
      await upsertIdentity(principal);
      await enforceRateLimit('workspace_list', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 60, 60);
      json(response, 200, { workspaces: await listWorkspaces(principal) });
      return;
    }

    if (request.method === 'POST' && path === '/v1/workspaces') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['name', 'organizationId']);
      const organizationId = optionalOrganizationId(body.organizationId);
      await enforceRateLimit('workspace_create', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 20, 60 * 60);
      json(response, 201, await createWorkspace(principal, body.name, organizationId));
      return;
    }

    if (request.method === 'GET' && path === '/v1/organizations') {
      const principal = await requireFirebaseUser(request);
      json(response, 200, { organizations: await listOrganizations(principal) });
      return;
    }

    if (request.method === 'POST' && path === '/v1/organizations') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['name']);
      await enforceRateLimit('organization_create', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 5, 60 * 60);
      json(response, 201, { organization: await createOrganization(principal, body.name) });
      return;
    }

    if (request.method === 'GET' && workspaceRootMatch) {
      const principal = await requireFirebaseUser(request);
      const workspace = await getWorkspace(principal, workspaceRootMatch[1]!);
      const canvases = await listCanvases(principal, workspace.id);
      json(response, 200, { workspace, canvases });
      return;
    }

    if (request.method === 'GET' && workspaceChildMatch?.[2] === 'canvases' && !workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      json(response, 200, { canvases: await listCanvases(principal, workspaceChildMatch[1]!) });
      return;
    }

    if (request.method === 'POST' && workspaceChildMatch?.[2] === 'canvases' && !workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['name']);
      json(response, 201, { canvas: await createCanvas(principal, workspaceChildMatch[1]!, body.name) });
      return;
    }

    if (request.method === 'PATCH' && workspaceChildMatch?.[2] === 'canvases' && workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['name']);
      json(response, 200, { canvas: await updateCanvasMetadata(
        principal, workspaceChildMatch[1]!, workspaceChildMatch[3]!, body.name,
      ) });
      return;
    }

    if (request.method === 'GET' && workspaceChildMatch?.[2] === 'members' && !workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      json(response, 200, { members: await listWorkspaceMembers(principal, workspaceChildMatch[1]!) });
      return;
    }

    if (request.method === 'POST' && workspaceChildMatch?.[2] === 'invites' && !workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['role', 'expiresInHours']);
      const baseUrl = requireConfiguredBrowserUrl(
        requireConfigured(inviteBaseUrl.value(), 'INVITE_BASE_URL'),
        'INVITE_BASE_URL',
      );
      json(response, 201, { invite: await createWorkspaceInvite(
        principal,
        workspaceChildMatch[1]!,
        body.role,
        body.expiresInHours,
        baseUrl,
      ) });
      return;
    }

    if (request.method === 'POST' && workspaceChildMatch?.[2] === 'invites' && workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, []);
      await revokeWorkspaceInvite(principal, workspaceChildMatch[1]!, workspaceChildMatch[3]!);
      json(response, 200, { revoked: true });
      return;
    }

    if (request.method === 'POST' && path === '/v1/invites/inspect') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['token']);
      json(response, 200, { invite: await inspectWorkspaceInvite(principal, body.token) });
      return;
    }

    if (request.method === 'POST' && path === '/v1/invites/accept') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['token']);
      await enforceRateLimit('invite_accept', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 20, 60 * 60);
      json(response, 200, await acceptWorkspaceInvite(principal, body.token));
      return;
    }

    if (request.method === 'GET' && workspaceChildMatch?.[2] === 'mcp-tokens' && !workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      json(response, 200, { tokens: await listMcpAccessTokens(principal, workspaceChildMatch[1]!) });
      return;
    }

    if (request.method === 'POST' && workspaceChildMatch?.[2] === 'mcp-tokens' && !workspaceChildMatch[3]) {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['label']);
      await enforceRateLimit('mcp_token_create', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 20, 60 * 60);
      json(response, 201, await createMcpAccessToken(principal, workspaceChildMatch[1]!, body.label));
      return;
    }

    if (request.method === 'POST' && path === '/v1/mcp-tokens/revoke') {
      const principal = await requireFirebaseUser(request);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['workspaceId', 'tokenId']);
      const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
      await revokeMcpAccessToken(principal, workspaceId, body.tokenId);
      json(response, 200, { revoked: true });
      return;
    }

    if (request.method === 'GET' && path === '/v1/billing/status') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      const organizationId = optionalOrganizationId(request.query.organizationId);
      const billingSubjectId = organizationId ? `organization_${organizationId}` : `user_${principal.uid}`;
      await enforceRateLimit(
        'billing_status',
        [`uid:${principal.uid}`, `subject:${billingSubjectId}`, `ip:${requestIp(request)}`],
        60,
        60,
      );
      json(response, 200, await getBillingStatus(principal, organizationId));
      return;
    }

    if (request.method === 'GET' && path === '/v1/billing/subjects') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      await enforceRateLimit('billing_subjects', [`uid:${principal.uid}`, `ip:${requestIp(request)}`], 30, 60);
      json(response, 200, { subjects: await listBillingSubjects(principal) });
      return;
    }

    if (request.method === 'POST' && path === '/v1/billing/checkout') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['planKey', 'billingRegion', 'organizationId']);
      const plan = resolvePlan(body.planKey, body.billingRegion);
      const organizationId = optionalOrganizationId(body.organizationId);
      const billingSubjectId = organizationId ? `organization_${organizationId}` : `user_${principal.uid}`;
      await enforceRateLimit(
        'billing_checkout',
        [`uid:${principal.uid}`, `subject:${billingSubjectId}`, `ip:${requestIp(request)}`],
        5,
        15 * 60,
      );
      const reservation = await reserveCheckout(principal, plan, organizationId);
      try {
        const result = await createHostedCheckout({
          billingSubjectId: reservation.subject.id,
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
        await completeCheckout(principal, reservation.subject, reservation.attemptId, plan, result);
        json(response, 200, result);
      } catch (error) {
        await releaseCheckout(reservation.subject.id, reservation.attemptId);
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
        [`uid:${principal.uid}`, `subject:${subscription.billingSubjectId}`, `ip:${requestIp(request)}`],
        5,
        60 * 60,
      );
      await cancelProviderSubscription(
        subscription.provider,
        subscription.providerSubscriptionId,
        configuredSecrets(),
      );
      await markCancellationRequested(principal, subscription.billingSubjectId);
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
      const billingSubjectId = organizationId ? `organization_${organizationId}` : `user_${principal.uid}`;
      await enforceRateLimit(
        'razorpay_callback_verify',
        [`uid:${principal.uid}`, `subject:${billingSubjectId}`, `ip:${requestIp(request)}`],
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
        subscription.billingSubjectId,
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

    if (request.method === 'POST' && path === '/v1/managed-agent/run') {
      const principal = await requireFirebaseUser(request);
      requireBillingAuthorization(principal);
      const body = assertJsonObject(request.body);
      assertExactKeys(body, ['workspaceId', 'canvasId', 'prompt']);
      const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
      const canvasId = typeof body.canvasId === 'string' ? body.canvasId : '';
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      if (!workspaceId || !canvasId || !prompt || Buffer.byteLength(prompt, 'utf8') > 24 * 1024) {
        throw new HttpError(400, 'A valid workspace, canvas, and bounded prompt are required.');
      }
      await requireCanvasAccess(principal, workspaceId, canvasId, { write: true });
      const authorization = await canUseManagedAgent(principal, workspaceId);
      await enforceRateLimit(
        'managed_agent_run',
        [`uid:${principal.uid}`, `workspace:${workspaceId}`, `ip:${requestIp(request)}`],
        30,
        60,
      );
      const output = await runManagedAgent({
        endpoint: requireConfigured(managedAgentApiUrl.value(), 'MANAGED_AGENT_API_URL'),
        apiKey: managedAgentApiKey.value(),
        model: requireConfigured(managedAgentModel.value(), 'MANAGED_AGENT_MODEL'),
        prompt,
      });
      json(response, 200, { output, authorization });
      return;
    }

    if (request.method === 'POST' && path === '/v1/mcp') {
      const principal = await requireMcpAccessToken(request.header('authorization'));
      const result = await handleMcpRequest(principal, request.body);
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.setHeader('MCP-Protocol-Version', '2025-06-18');
      if (result === null) response.status(202).end();
      else json(response, 200, result);
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

    if (isBrowserPath(path) || webhookPaths.has(path) || path === '/v1/mcp') {
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
        billingSubjectIdHash: sha256(candidate.billingSubjectId).slice(0, 16),
        provider: candidate.provider,
        errorName: error instanceof Error ? error.name : 'unknown',
      });
    }
  }
  const expired = await expireElapsedEntitlements();
  logger.info('billing_reconciliation_completed', { candidates: candidates.length, reconciled, failed, expired });
});
