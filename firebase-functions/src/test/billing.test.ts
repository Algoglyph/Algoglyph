import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request } from 'firebase-functions/v2/https';
import { GRACE_PERIOD_MS, projectEntitlement, type NormalizedProviderEvent } from '../model.js';
import {
  isSupportedRazorpayBillingEvent,
  isSupportedStripeBillingEvent,
  normalizeRazorpayEvent,
  normalizeStripeEvent,
  verifyRazorpayWebhook,
  verifyStripeWebhook,
} from '../providers.js';
import { assertExactKeys, HttpError, requireAppCheck, requireFirebaseUser } from '../security.js';

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
  assert.equal(active.mcpAccess, true);
  assert.equal(active.status, 'active');

  const canceled = projectEntitlement(baseEvent({ transition: 'cancel_at_period_end', cancelAtPeriodEnd: true }), now);
  assert.equal(canceled.mcpAccess, true);
  assert.equal(canceled.status, 'canceled');
  assert.equal(canceled.accessUntilMs, 1_800_000_000_000);

  const grace = projectEntitlement(baseEvent({ transition: 'renewal_failed' }), now);
  assert.equal(grace.mcpAccess, true);
  assert.equal(grace.status, 'grace');
  assert.equal(grace.gracePeriodEndMs, now + GRACE_PERIOD_MS);

  const refunded = projectEntitlement(baseEvent({ transition: 'revoke', revocationReason: 'refund' }), now);
  assert.equal(refunded.mcpAccess, false);
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

  assert.equal(normalizeStripeEvent({
    id: 'evt_forged',
    type: 'customer.subscription.updated',
    data: { object: { id: 'sub_forged', metadata: { amount: 1, mcpAccess: true } } },
  }), null);
  assert.equal(normalizeRazorpayEvent({
    event: 'subscription.activated',
    payload: { subscription: { entity: { id: 'sub_forged', notes: { amount: 1 } } } },
  }, 'event_forged'), null);
});

test('only recognized billing events enter provider processing', () => {
  assert.equal(isSupportedStripeBillingEvent({ type: 'invoice.paid' }), true);
  assert.equal(isSupportedStripeBillingEvent({ type: 'radar.early_fraud_warning.created' }), true);
  assert.equal(isSupportedStripeBillingEvent({ type: 'customer.created' }), false);
  assert.equal(isSupportedRazorpayBillingEvent({ event: 'subscription.charged' }), true);
  assert.equal(isSupportedRazorpayBillingEvent({ event: 'payment.authorized' }), false);
});

test('checkout inputs reject client-owned pricing, provider, and entitlement fields', () => {
  for (const key of ['amount', 'currency', 'provider', 'priceId', 'mcpAccess', 'entitlement', 'workspaceId']) {
    assert.throws(
      () => assertExactKeys({ planKey: 'pro_monthly', billingRegion: 'india', [key]: 'forged' }, [
        'planKey',
        'billingRegion',
      ]),
      (error: unknown) => error instanceof HttpError && error.status === 400,
    );
  }
});

test('missing, invalid, expired, and revoked Firebase tokens fail with the same 401 boundary', async () => {
  const requestWith = (authorization?: string): Request => ({
    header: (name: string) => name.toLowerCase() === 'authorization' ? authorization : undefined,
  }) as unknown as Request;
  await assert.rejects(
    requireFirebaseUser(requestWith()),
    (error: unknown) => error instanceof HttpError && error.status === 401,
  );
  for (const providerFailure of [new Error('invalid'), new Error('expired'), new Error('revoked')]) {
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
