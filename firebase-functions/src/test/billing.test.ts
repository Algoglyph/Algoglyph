import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request } from 'firebase-functions/v2/https';
import { GRACE_PERIOD_MS, projectEntitlement, type NormalizedProviderEvent } from '../model.js';
import {
  cancelProviderSubscription,
  createHostedCheckout,
  isSupportedRazorpayBillingEvent,
  isSupportedStripeBillingEvent,
  normalizeRazorpayEvent,
  normalizeStripeEvent,
  verifyRazorpayCheckoutWithProvider,
  verifyRazorpayWebhook,
  verifyRazorpayCheckoutSignature,
  verifyStripeWebhook,
} from '../providers.js';
import type { PlanDefinition } from '../model.js';
import {
  assertExactKeys,
  HttpError,
  requireAppCheck,
  requireBillingAuthorization,
  requireConfiguredBrowserUrl,
  requireFirebaseUser,
  requireJsonContentType,
  requirePersonalWorkspaceAccess,
  requireRequestBodyWithin,
} from '../security.js';

const baseEvent = (overrides: Partial<NormalizedProviderEvent> = {}): NormalizedProviderEvent => ({
  provider: 'stripe',
  eventId: 'evt_test',
  eventType: 'customer.subscription.updated',
  occurredAtMs: 1_700_000_000_000,
  workspaceId: 'personal_user_1',
  providerSubscriptionId: 'sub_test',
  planKey: 'pro_monthly',
  providerStatus: 'active',
  currentPeriodEndMs: 1_800_000_000_000,
  cancelAtPeriodEnd: false,
  transition: 'activate',
  ...overrides,
});

test('entitlement projection separates activation, grace, cancellation, and immediate revocation', () => {
  const now = 1_700_000_000_000;
  const active = projectEntitlement(baseEvent(), now);
  assert.equal(active.managedAgentAccess, true);
  assert.equal(active.status, 'active');

  const canceled = projectEntitlement(baseEvent({ transition: 'cancel_at_period_end', cancelAtPeriodEnd: true }), now);
  assert.equal(canceled.managedAgentAccess, true);
  assert.equal(canceled.status, 'canceled');
  assert.equal(canceled.accessUntilMs, 1_800_000_000_000);

  const initialFailure = projectEntitlement(baseEvent({ transition: 'renewal_failed' }), now);
  assert.equal(initialFailure.managedAgentAccess, false);
  assert.equal(initialFailure.status, 'locked');

  const grace = projectEntitlement(baseEvent({ transition: 'renewal_failed' }), now, true);
  assert.equal(grace.managedAgentAccess, true);
  assert.equal(grace.status, 'grace');
  assert.equal(grace.gracePeriodEndMs, now + GRACE_PERIOD_MS);

  const refunded = projectEntitlement(baseEvent({ transition: 'revoke', revocationReason: 'refund' }), now);
  assert.equal(refunded.managedAgentAccess, false);
  assert.equal(refunded.status, 'locked');
  assert.equal(refunded.revocationReason, 'refund');
});

test('Stripe webhook verification uses the unmodified body and enforces timestamp tolerance', () => {
  const rawBody = Buffer.from('{"id":"evt_1"}');
  const secret = 'whsec_test';
  const nowMs = 1_700_000_000_000;
  const timestamp = String(nowMs / 1_000);
  const signature = createHmac('sha256', secret).update(`${timestamp}.${rawBody.toString('utf8')}`).digest('hex');
  assert.equal(verifyStripeWebhook(rawBody, `t=${timestamp},v1=${signature}`, secret, nowMs), true);
  assert.equal(verifyStripeWebhook(Buffer.from('{"id":"evt_2"}'), `t=${timestamp},v1=${signature}`, secret, nowMs), false);
  assert.equal(verifyStripeWebhook(rawBody, `t=${Number(timestamp) - 301},v1=${signature}`, secret, nowMs), false);
});

test('Razorpay webhook verification uses the raw request body', () => {
  const rawBody = Buffer.from('{"event":"subscription.activated"}');
  const secret = 'razorpay_webhook_test';
  const signature = createHmac('sha256', secret).update(rawBody).digest('hex');
  assert.equal(verifyRazorpayWebhook(rawBody, signature, secret), true);
  assert.equal(verifyRazorpayWebhook(Buffer.from(`${rawBody.toString('utf8')} `), signature, secret), false);
});

test('Razorpay browser callback signature binds the payment to the expected subscription', () => {
  const secret = 'razorpay_key_secret';
  const signature = createHmac('sha256', secret).update('pay_test123|sub_test456').digest('hex');
  assert.equal(verifyRazorpayCheckoutSignature('pay_test123', 'sub_test456', signature, secret), true);
  assert.equal(verifyRazorpayCheckoutSignature('pay_forged', 'sub_test456', signature, secret), false);
  assert.equal(verifyRazorpayCheckoutSignature('pay_test123', 'sub_other', signature, secret), false);
});

test('provider facade creates and cancels server-priced Stripe and Razorpay subscriptions', async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; method: string; body: string }> = [];
  const secrets = {
    stripeSecretKey: 'sk_test_server_only',
    stripeWebhookSecret: 'whsec_test',
    razorpayKeyId: 'rzp_test_public_checkout_id',
    razorpayKeySecret: 'rzp_test_server_only',
    razorpayWebhookSecret: 'rzp_webhook_test',
  };
  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    const body = init.body?.toString() ?? '';
    requests.push({ url, method: init.method ?? 'GET', body });
    if (url.endsWith('/customers')) return new Response(JSON.stringify({ id: 'cus_server_created' }), { status: 200 });
    if (url.endsWith('/checkout/sessions')) {
      return new Response(JSON.stringify({ id: 'cs_server_created', url: 'https://checkout.stripe.test/session' }), { status: 200 });
    }
    if (url.endsWith('/subscriptions')) return new Response(JSON.stringify({ id: 'sub_server_created' }), { status: 200 });
    if (url.includes('/subscriptions/sub_server_created/cancel')) return new Response('{}', { status: 200 });
    if (url.endsWith('/subscriptions/sub_server_created')) return new Response('{}', { status: 200 });
    return new Response('{}', { status: 404 });
  };

  try {
    const stripePlan: PlanDefinition = {
      key: 'pro_monthly',
      interval: 'month',
      currency: 'USD',
      provider: 'stripe',
      providerPriceId: 'price_server_monthly',
    };
    const stripe = await createHostedCheckout({
      workspaceId: 'personal_user_1',
      uid: 'user_1',
      email: 'user@example.com',
      plan: stripePlan,
      successUrl: 'https://algoglyph.com/workspace?billing=success',
      cancelUrl: 'https://algoglyph.com/workspace?billing=cancelled',
    }, secrets);
    assert.equal(stripe.providerCheckoutId, 'cs_server_created');
    const stripeCheckout = requests.find((request) => request.url.endsWith('/checkout/sessions'));
    assert.ok(stripeCheckout);
    const stripeForm = new URLSearchParams(stripeCheckout.body);
    assert.equal(stripeForm.get('mode'), 'subscription');
    assert.equal(stripeForm.get('line_items[0][price]'), 'price_server_monthly');
    assert.equal(stripeForm.get('line_items[0][quantity]'), '1');
    assert.equal(stripeForm.has('amount'), false);

    const razorpayPlan: PlanDefinition = {
      key: 'pro_annual',
      interval: 'year',
      currency: 'INR',
      provider: 'razorpay',
      providerPriceId: 'plan_server_annual',
    };
    const razorpay = await createHostedCheckout({
      workspaceId: 'personal_user_1',
      uid: 'user_1',
      plan: razorpayPlan,
      successUrl: 'https://algoglyph.com/workspace?billing=success',
      cancelUrl: 'https://algoglyph.com/workspace?billing=cancelled',
    }, secrets);
    assert.equal(razorpay.providerSubscriptionId, 'sub_server_created');
    const razorpayCreate = requests.find((request) => request.url.endsWith('/v1/subscriptions'));
    assert.ok(razorpayCreate);
    const razorpayBody = JSON.parse(razorpayCreate.body) as Record<string, unknown>;
    assert.equal(razorpayBody.plan_id, 'plan_server_annual');
    assert.equal(razorpayBody.total_count, 10);
    assert.equal('amount' in razorpayBody, false);

    await cancelProviderSubscription('stripe', 'sub_server_created', secrets);
    await cancelProviderSubscription('razorpay', 'sub_server_created', secrets);
    assert.ok(requests.some((request) => request.url.endsWith('/subscriptions/sub_server_created')
      && new URLSearchParams(request.body).get('cancel_at_period_end') === 'true'));
    assert.ok(requests.some((request) => request.url.endsWith('/subscriptions/sub_server_created/cancel')
      && JSON.parse(request.body).cancel_at_cycle_end === 1));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Razorpay provider verification retrieves and matches payment, subscription, plan, amount, and currency', async () => {
  const originalFetch = globalThis.fetch;
  const secrets = {
    stripeSecretKey: 'sk_test',
    stripeWebhookSecret: 'whsec_test',
    razorpayKeyId: 'rzp_test',
    razorpayKeySecret: 'rzp_secret',
    razorpayWebhookSecret: 'rzp_webhook',
  };
  let paymentAmount = 49900;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith('/payments/pay_verified')) {
      return new Response(JSON.stringify({
        id: 'pay_verified',
        subscription_id: 'sub_verified',
        status: 'captured',
        amount: paymentAmount,
        currency: 'INR',
      }), { status: 200 });
    }
    if (url.endsWith('/subscriptions/sub_verified')) {
      return new Response(JSON.stringify({ id: 'sub_verified', plan_id: 'plan_expected' }), { status: 200 });
    }
    if (url.endsWith('/plans/plan_expected')) {
      return new Response(JSON.stringify({ item: { amount: 49900, currency: 'INR' } }), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  };
  try {
    const verified = await verifyRazorpayCheckoutWithProvider(
      'pay_verified',
      'sub_verified',
      'plan_expected',
      secrets,
    );
    assert.deepEqual(verified, { paymentStatus: 'captured', amount: 49900, currency: 'INR' });
    paymentAmount = 1;
    await assert.rejects(
      verifyRazorpayCheckoutWithProvider('pay_verified', 'sub_verified', 'plan_expected', secrets),
      /did not match the server-created subscription/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider payloads normalize only server-created workspace and plan metadata', () => {
  const stripe = normalizeStripeEvent({
    id: 'evt_1',
    type: 'customer.subscription.updated',
    created: 1_700_000_000,
    data: {
      object: {
        object: 'subscription',
        id: 'sub_1',
        status: 'active',
        customer: 'cus_1',
        current_period_end: 1_800_000_000,
        metadata: { workspaceId: 'personal_user_1', planKey: 'pro_monthly' },
      },
    },
  });
  assert.equal(stripe?.workspaceId, 'personal_user_1');
  assert.equal(stripe?.transition, 'activate');
  assert.equal(stripe?.planKey, 'pro_monthly');

  const razorpay = normalizeRazorpayEvent({
    event: 'subscription.halted',
    created_at: 1_700_000_000,
    payload: {
      subscription: {
        entity: {
          id: 'sub_rzp_1',
          status: 'halted',
          current_end: 1_800_000_000,
          notes: { workspaceId: 'personal_user_1', planKey: 'pro_annual' },
        },
      },
    },
  }, 'rzp_event_1');
  assert.equal(razorpay?.transition, 'renewal_failed');
  assert.equal(razorpay?.planKey, 'pro_annual');

  const stripeInvoice = normalizeStripeEvent({
    id: 'evt_invoice',
    type: 'invoice.paid',
    created: 1_700_000_001,
    data: {
      object: {
        object: 'invoice',
        customer: 'cus_1',
        parent: {
          subscription_details: {
            subscription: 'sub_1',
            metadata: { workspaceId: 'personal_user_1', planKey: 'pro_monthly' },
          },
        },
      },
    },
  });
  assert.equal(stripeInvoice?.providerSubscriptionId, 'sub_1');
  assert.equal(stripeInvoice?.transition, 'renewed');

  const stripeItemPeriod = normalizeStripeEvent({
    id: 'evt_item_period',
    type: 'customer.subscription.updated',
    created: 1_700_000_002,
    data: {
      object: {
        object: 'subscription',
        id: 'sub_1',
        status: 'active',
        metadata: { workspaceId: 'personal_user_1', planKey: 'pro_monthly' },
        items: { data: [{ current_period_end: 1_800_000_000 }] },
      },
    },
  });
  assert.equal(stripeItemPeriod?.currentPeriodEndMs, 1_800_000_000_000);

  const stripeRefund = normalizeStripeEvent({
    id: 'evt_refund',
    type: 'refund.updated',
    created: 1_700_000_003,
    data: {
      object: {
        object: 'refund',
        status: 'succeeded',
        subscription: 'sub_1',
        metadata: { workspaceId: 'personal_user_1' },
      },
    },
  });
  assert.equal(stripeRefund?.transition, 'revoke');
  assert.equal(stripeRefund?.revocationReason, 'refund');

  const stripeFraud = normalizeStripeEvent({
    id: 'evt_fraud',
    type: 'radar.early_fraud_warning.created',
    created: 1_700_000_004,
    data: {
      object: {
        object: 'radar.early_fraud_warning',
        subscription: 'sub_1',
        metadata: { workspaceId: 'personal_user_1' },
      },
    },
  });
  assert.equal(stripeFraud?.transition, 'revoke');
  assert.equal(stripeFraud?.revocationReason, 'fraud');

  const stripeWonDispute = normalizeStripeEvent({
    id: 'evt_dispute_won',
    type: 'charge.dispute.closed',
    created: 1_700_000_005,
    data: {
      object: {
        object: 'dispute',
        status: 'won',
        metadata: { workspaceId: 'personal_user_1' },
        subscription: {
          id: 'sub_1',
          status: 'active',
          current_period_end: 1_800_000_000,
        },
      },
    },
  });
  assert.equal(stripeWonDispute?.transition, 'recover');

  const razorpayLostDispute = normalizeRazorpayEvent({
    event: 'payment.dispute.lost',
    payload: {
      subscription: {
        entity: {
          id: 'sub_rzp_1',
          status: 'active',
          current_end: 1_800_000_000,
          notes: { workspaceId: 'personal_user_1', planKey: 'pro_annual' },
        },
      },
      dispute: { entity: { status: 'lost' } },
    },
  }, 'rzp_event_dispute_lost');
  assert.equal(razorpayLostDispute?.transition, 'revoke');
  assert.equal(razorpayLostDispute?.revocationReason, 'dispute');

  const razorpayWonDispute = normalizeRazorpayEvent({
    event: 'payment.dispute.won',
    payload: {
      subscription: {
        entity: {
          id: 'sub_rzp_1',
          status: 'active',
          current_end: 1_800_000_000,
          notes: { workspaceId: 'personal_user_1', planKey: 'pro_annual' },
        },
      },
      dispute: { entity: { status: 'won' } },
    },
  }, 'rzp_event_dispute_won');
  assert.equal(razorpayWonDispute?.transition, 'recover');

  assert.equal(normalizeStripeEvent({
    id: 'evt_forged',
    type: 'customer.subscription.updated',
    data: { object: { id: 'sub_forged', metadata: { amount: 1, managedAgentAccess: true } } },
  }), null);
  assert.equal(normalizeRazorpayEvent({
    event: 'subscription.activated',
    payload: { subscription: { entity: { id: 'sub_forged', notes: { amount: 1 } } } },
  }, 'event_forged'), null);
});

test('only recognized billing events enter provider processing', () => {
  assert.equal(isSupportedStripeBillingEvent({ type: 'invoice.paid' }), true);
  assert.equal(isSupportedStripeBillingEvent({ type: 'radar.early_fraud_warning.created' }), true);
  assert.equal(isSupportedStripeBillingEvent({ type: 'charge.dispute.closed' }), true);
  assert.equal(isSupportedStripeBillingEvent({ type: 'customer.created' }), false);
  assert.equal(isSupportedRazorpayBillingEvent({ event: 'subscription.charged' }), true);
  assert.equal(isSupportedRazorpayBillingEvent({ event: 'payment.dispute.created' }), true);
  assert.equal(isSupportedRazorpayBillingEvent({ event: 'payment.dispute.won' }), true);
  assert.equal(isSupportedRazorpayBillingEvent({ event: 'dispute.won' }), false);
  assert.equal(isSupportedRazorpayBillingEvent({ event: 'payment.authorized' }), false);
});

test('checkout inputs reject client-owned pricing, provider, and entitlement fields', () => {
  for (const key of ['amount', 'currency', 'provider', 'priceId', 'managedAgentAccess', 'entitlement', 'workspaceId']) {
    assert.throws(
      () => assertExactKeys({ planKey: 'pro_monthly', billingRegion: 'india', [key]: 'forged' }, [
        'planKey',
        'billingRegion',
        'organizationId',
      ]),
      (error: unknown) => error instanceof HttpError && error.status === 400,
    );
  }
});

test('browser API requests enforce JSON media type and bounded bodies', () => {
  const requestWith = (contentType: string | undefined, rawBody: Buffer): Request => ({
    rawBody,
    header: (name: string) => name.toLowerCase() === 'content-type' ? contentType : undefined,
  }) as unknown as Request;
  assert.doesNotThrow(() => requireJsonContentType(requestWith('application/json; charset=utf-8', Buffer.from('{}'))));
  assert.throws(
    () => requireJsonContentType(requestWith('text/plain', Buffer.from('{}'))),
    (error: unknown) => error instanceof HttpError && error.status === 415,
  );
  assert.doesNotThrow(() => requireRequestBodyWithin(requestWith('application/json', Buffer.alloc(16)), 16));
  assert.throws(
    () => requireRequestBodyWithin(requestWith('application/json', Buffer.alloc(17)), 16),
    (error: unknown) => error instanceof HttpError && error.status === 413,
  );
});

test('missing, invalid, expired, wrong-project, and revoked Firebase tokens fail with the same 401 boundary', async () => {
  const requestWith = (authorization?: string): Request => ({
    header: (name: string) => name.toLowerCase() === 'authorization' ? authorization : undefined,
  }) as unknown as Request;
  await assert.rejects(
    requireFirebaseUser(requestWith()),
    (error: unknown) => error instanceof HttpError && error.status === 401,
  );
  for (const providerFailure of [
    new Error('invalid'),
    new Error('expired'),
    new Error('wrong audience/project'),
    new Error('revoked'),
  ]) {
    await assert.rejects(
      requireFirebaseUser(
        requestWith('Bearer firebase-token'),
        async (): Promise<DecodedIdToken> => { throw providerFailure; },
      ),
      (error: unknown) => error instanceof HttpError
        && error.status === 401
        && error.message === 'Authentication required.',
    );
  }
});

test('billing authorization requires verified email and recent auth for sensitive changes', () => {
  const principal = (token: Partial<DecodedIdToken>) => ({
    uid: 'user_1',
    email: 'user@example.com',
    token: { uid: 'user_1', ...token },
  }) as unknown as import('../security.js').AuthenticatedPrincipal;
  assert.throws(
    () => requireBillingAuthorization(principal({ email_verified: false })),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  const now = Math.floor(Date.now() / 1_000);
  assert.doesNotThrow(() => requireBillingAuthorization(
    principal({ email_verified: true, auth_time: now - 60 }),
    { recentAuthentication: true },
  ));
  assert.throws(
    () => requireBillingAuthorization(
      principal({ email_verified: true, auth_time: now - 601 }),
      { recentAuthentication: true },
    ),
    (error: unknown) => error instanceof HttpError && error.status === 401,
  );
});

test('workspace and return URL authorization is UID- and allowlist-bound', () => {
  const principal = { uid: 'user_a' } as import('../security.js').AuthenticatedPrincipal;
  assert.doesNotThrow(() => requirePersonalWorkspaceAccess(principal, 'personal_user_a'));
  assert.throws(
    () => requirePersonalWorkspaceAccess(principal, 'personal_user_b'),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  const original = process.env.ALLOWED_WEB_ORIGINS;
  process.env.ALLOWED_WEB_ORIGINS = 'https://staging.algoglyph.example';
  try {
    assert.equal(
      requireConfiguredBrowserUrl('https://staging.algoglyph.example/workspace?billing=success', 'return URL'),
      'https://staging.algoglyph.example/workspace?billing=success',
    );
    assert.throws(
      () => requireConfiguredBrowserUrl('https://algoglyph.com/workspace?billing=success', 'return URL'),
      (error: unknown) => error instanceof HttpError && error.status === 503,
    );
  } finally {
    if (original === undefined) delete process.env.ALLOWED_WEB_ORIGINS;
    else process.env.ALLOWED_WEB_ORIGINS = original;
  }
});

test('missing and invalid App Check tokens fail before browser billing operations', async () => {
  const requestWith = (appCheckToken?: string): Request => ({
    header: (name: string) => name.toLowerCase() === 'x-firebase-appcheck' ? appCheckToken : undefined,
  }) as unknown as Request;
  await assert.rejects(
    requireAppCheck(requestWith()),
    (error: unknown) => error instanceof HttpError && error.status === 401,
  );
  await assert.rejects(
    requireAppCheck(requestWith('invalid-app-check'), async () => { throw new Error('invalid'); }),
    (error: unknown) => error instanceof HttpError
      && error.status === 401
      && error.message === 'App verification required.',
  );
});
