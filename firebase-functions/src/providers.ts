import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  BillingProvider,
  NormalizedProviderEvent,
  PlanDefinition,
} from './model.js';
import { isPlanKey } from './model.js';

interface ProviderSecrets {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayWebhookSecret: string;
}

export interface CheckoutContext {
  billingSubjectId: string;
  uid: string;
  email?: string;
  displayName?: string;
  plan: PlanDefinition;
  successUrl: string;
  cancelUrl: string;
  existingCustomerId?: string;
}

export interface CheckoutResult {
  provider: BillingProvider;
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  providerCheckoutId?: string;
  checkoutUrl?: string;
  razorpay?: {
    keyId: string;
    subscriptionId: string;
    name: string;
    description: string;
  };
}

export interface ProviderSubscriptionSnapshot {
  provider: BillingProvider;
  providerSubscriptionId: string;
  providerCustomerId?: string;
  providerStatus: string;
  currentPeriodEndMs?: number;
  cancelAtPeriodEnd: boolean;
  transition: NormalizedProviderEvent['transition'];
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const numberValue = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const objectAt = (source: Record<string, unknown> | null, key: string): Record<string, unknown> | null =>
  source ? asRecord(source[key]) : null;

const firstRecordAt = (source: Record<string, unknown> | null, key: string): Record<string, unknown> | null => {
  const value = source?.[key];
  return Array.isArray(value) ? asRecord(value[0]) : null;
};

const safeEqual = (left: string, right: string): boolean => {
  const leftBytes = Buffer.from(left, 'utf8');
  const rightBytes = Buffer.from(right, 'utf8');
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
};

export const verifyRazorpayWebhook = (
  rawBody: Buffer,
  suppliedSignature: string | undefined,
  secret: string,
): boolean => {
  if (!suppliedSignature || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(expected, suppliedSignature);
};

export const verifyStripeWebhook = (
  rawBody: Buffer,
  signatureHeader: string | undefined,
  secret: string,
  nowMs = Date.now(),
  toleranceSeconds = 300,
): boolean => {
  if (!signatureHeader || !secret) return false;
  const fields = signatureHeader.split(',').map((field) => field.trim());
  const timestamp = fields.find((field) => field.startsWith('t='))?.slice(2);
  const signatures = fields.filter((field) => field.startsWith('v1=')).map((field) => field.slice(3));
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Math.floor(nowMs / 1_000) - Number(timestamp)) > toleranceSeconds) return false;
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody.toString('utf8')}`)
    .digest('hex');
  return signatures.some((signature) => safeEqual(expected, signature));
};

const parseJsonResponse = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = {};
  }
  const record = asRecord(parsed);
  if (!response.ok || !record) {
    throw new Error(`Billing provider request failed with status ${response.status}.`);
  }
  return record;
};

const stripeRequest = async (
  path: string,
  secretKey: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> => {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${secretKey}`);
  if (init.body) headers.set('Content-Type', 'application/x-www-form-urlencoded');
  const response = await fetch(`https://api.stripe.com/v1/${path.replace(/^\//, '')}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  return parseJsonResponse(response);
};

const razorpayRequest = async (
  path: string,
  secrets: ProviderSecrets,
  init: RequestInit = {},
): Promise<Record<string, unknown>> => {
  const headers = new Headers(init.headers);
  headers.set(
    'Authorization',
    `Basic ${Buffer.from(`${secrets.razorpayKeyId}:${secrets.razorpayKeySecret}`).toString('base64')}`,
  );
  if (init.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`https://api.razorpay.com/v1/${path.replace(/^\//, '')}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
  return parseJsonResponse(response);
};

const stripeForm = (entries: Array<[string, string | undefined]>): URLSearchParams => {
  const form = new URLSearchParams();
  for (const [key, value] of entries) if (value !== undefined) form.set(key, value);
  return form;
};

export const createHostedCheckout = async (
  context: CheckoutContext,
  secrets: ProviderSecrets,
): Promise<CheckoutResult> => {
  if (context.plan.provider === 'stripe') {
    let customerId = context.existingCustomerId;
    if (!customerId) {
      const customer = await stripeRequest('customers', secrets.stripeSecretKey, {
        method: 'POST',
        body: stripeForm([
          ['email', context.email],
          ['name', context.displayName],
          ['metadata[billingSubjectId]', context.billingSubjectId],
          ['metadata[purchaserUid]', context.uid],
        ]),
      });
      customerId = stringValue(customer.id);
      if (!customerId) throw new Error('Stripe did not return a customer identifier.');
    }

    const checkout = await stripeRequest('checkout/sessions', secrets.stripeSecretKey, {
      method: 'POST',
      body: stripeForm([
        ['mode', 'subscription'],
        ['customer', customerId],
        ['line_items[0][price]', context.plan.providerPriceId],
        ['line_items[0][quantity]', '1'],
        ['success_url', context.successUrl],
        ['cancel_url', context.cancelUrl],
        ['client_reference_id', context.billingSubjectId],
        ['metadata[billingSubjectId]', context.billingSubjectId],
        ['metadata[planKey]', context.plan.key],
        ['subscription_data[metadata][billingSubjectId]', context.billingSubjectId],
        ['subscription_data[metadata][planKey]', context.plan.key],
      ]),
    });
    const checkoutUrl = stringValue(checkout.url);
    if (!checkoutUrl) throw new Error('Stripe did not return a Checkout URL.');
    const providerCheckoutId = stringValue(checkout.id);
    if (!providerCheckoutId) throw new Error('Stripe did not return a Checkout identifier.');
    return { provider: 'stripe', providerCustomerId: customerId, providerCheckoutId, checkoutUrl };
  }

  const totalCount = context.plan.interval === 'month' ? 120 : 10;
  const subscription = await razorpayRequest('subscriptions', secrets, {
    method: 'POST',
    body: JSON.stringify({
      plan_id: context.plan.providerPriceId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        billingSubjectId: context.billingSubjectId,
        purchaserUid: context.uid,
        planKey: context.plan.key,
      },
    }),
  });
  const subscriptionId = stringValue(subscription.id);
  if (!subscriptionId) throw new Error('Razorpay did not return a subscription identifier.');
  return {
    provider: 'razorpay',
    providerSubscriptionId: subscriptionId,
    razorpay: {
      keyId: secrets.razorpayKeyId,
      subscriptionId,
      name: 'AlgoGlyph Managed Agent',
      description: context.plan.interval === 'month'
        ? 'AlgoGlyph managed agent monthly access'
        : 'AlgoGlyph managed agent annual access',
    },
  };
};

export const cancelProviderSubscription = async (
  provider: BillingProvider,
  providerSubscriptionId: string,
  secrets: ProviderSecrets,
): Promise<void> => {
  if (provider === 'stripe') {
    await stripeRequest(`subscriptions/${encodeURIComponent(providerSubscriptionId)}`, secrets.stripeSecretKey, {
      method: 'POST',
      body: stripeForm([['cancel_at_period_end', 'true']]),
    });
    return;
  }
  await razorpayRequest(`subscriptions/${encodeURIComponent(providerSubscriptionId)}/cancel`, secrets, {
    method: 'POST',
    body: JSON.stringify({ cancel_at_cycle_end: 1 }),
  });
};

export const verifyRazorpayCheckoutSignature = (
  paymentId: string,
  subscriptionId: string,
  suppliedSignature: string,
  secret: string,
): boolean => {
  if (!paymentId || !subscriptionId || !suppliedSignature || !secret) return false;
  const expected = createHmac('sha256', secret).update(`${paymentId}|${subscriptionId}`).digest('hex');
  return safeEqual(expected, suppliedSignature);
};

export const verifyRazorpayCheckoutWithProvider = async (
  paymentId: string,
  expectedSubscriptionId: string,
  expectedPlanId: string,
  secrets: ProviderSecrets,
): Promise<{ paymentStatus: string; amount: number; currency: string }> => {
  const [payment, subscription, plan] = await Promise.all([
    razorpayRequest(`payments/${encodeURIComponent(paymentId)}`, secrets),
    razorpayRequest(`subscriptions/${encodeURIComponent(expectedSubscriptionId)}`, secrets),
    razorpayRequest(`plans/${encodeURIComponent(expectedPlanId)}`, secrets),
  ]);
  const planItem = objectAt(plan, 'item');
  const paymentStatus = stringValue(payment.status);
  const amount = numberValue(payment.amount);
  const currency = stringValue(payment.currency);
  const expectedAmount = numberValue(planItem?.amount) ?? numberValue(planItem?.unit_amount);
  const expectedCurrency = stringValue(planItem?.currency);
  if (stringValue(payment.id) !== paymentId
    || stringValue(payment.subscription_id) !== expectedSubscriptionId
    || stringValue(subscription.id) !== expectedSubscriptionId
    || stringValue(subscription.plan_id) !== expectedPlanId
    || (paymentStatus !== 'authorized' && paymentStatus !== 'captured')
    || amount === undefined
    || expectedAmount === undefined
    || amount !== expectedAmount
    || !currency
    || !expectedCurrency
    || currency !== expectedCurrency) {
    throw new Error('Razorpay checkout verification did not match the server-created subscription.');
  }
  return { paymentStatus, amount, currency };
};

const stripeTransition = (
  eventType: string,
  status: string,
  cancelAtPeriodEnd: boolean,
  cancellationReason?: string,
  disputeStatus?: string,
): Pick<NormalizedProviderEvent, 'transition' | 'revocationReason'> => {
  if (eventType === 'radar.early_fraud_warning.created') return { transition: 'revoke', revocationReason: 'fraud' };
  if (eventType === 'charge.dispute.created') return { transition: 'revoke', revocationReason: 'dispute' };
  if (eventType === 'charge.dispute.closed') {
    return disputeStatus === 'won' || disputeStatus === 'warning_closed'
      ? { transition: 'recover' }
      : { transition: 'revoke', revocationReason: 'dispute' };
  }
  if (eventType === 'charge.refunded') return { transition: 'revoke', revocationReason: 'refund' };
  if ((eventType === 'refund.created' || eventType === 'refund.updated') && status === 'succeeded') {
    return { transition: 'revoke', revocationReason: 'refund' };
  }
  if (cancellationReason === 'payment_disputed') return { transition: 'revoke', revocationReason: 'dispute' };
  if (eventType === 'invoice.payment_failed') return { transition: 'renewal_failed' };
  if (eventType === 'invoice.payment_succeeded' || eventType === 'invoice.paid') return { transition: 'renewed' };
  if (status === 'active' || status === 'trialing') {
    return { transition: cancelAtPeriodEnd ? 'cancel_at_period_end' : 'activate' };
  }
  if (status === 'past_due' || status === 'unpaid') return { transition: 'renewal_failed' };
  if (status === 'canceled' || status === 'incomplete_expired') return { transition: 'expired' };
  return { transition: 'pending' };
};

export const normalizeStripeEvent = (payload: unknown): NormalizedProviderEvent | null => {
  const event = asRecord(payload);
  const data = objectAt(event, 'data');
  const object = objectAt(data, 'object');
  const eventId = stringValue(event?.id);
  const eventType = stringValue(event?.type);
  if (!event || !object || !eventId || !eventType) return null;

  const metadata = objectAt(object, 'metadata');
  const subscriptionDetails = objectAt(object, 'subscription_details')
    ?? objectAt(objectAt(object, 'parent'), 'subscription_details');
  const subscriptionMetadata = objectAt(subscriptionDetails, 'metadata');
  const firstLine = firstRecordAt(objectAt(object, 'lines'), 'data');
  const lineSubscriptionDetails = objectAt(objectAt(firstLine, 'parent'), 'subscription_item_details');
  const billingSubjectId = stringValue(metadata?.billingSubjectId)
    ?? stringValue(subscriptionMetadata?.billingSubjectId)
    ?? stringValue(object.client_reference_id);
  const subscriptionValue = object.subscription;
  const subscriptionObject = asRecord(subscriptionValue);
  const providerSubscriptionId = stringValue(subscriptionObject?.id)
    ?? stringValue(subscriptionValue)
    ?? stringValue(subscriptionDetails?.subscription)
    ?? stringValue(lineSubscriptionDetails?.subscription)
    ?? (object.object === 'subscription' ? stringValue(object.id) : undefined);
  if (!billingSubjectId || !providerSubscriptionId) return null;

  const status = stringValue(subscriptionObject?.status)
    ?? stringValue(object.status)
    ?? (eventType.includes('payment_failed') ? 'past_due' : 'active');
  const cancelAtPeriodEnd = object.cancel_at_period_end === true || subscriptionObject?.cancel_at_period_end === true;
  const cancellationDetails = objectAt(object, 'cancellation_details')
    ?? objectAt(subscriptionObject, 'cancellation_details');
  const cancellationReason = stringValue(cancellationDetails?.reason);
  const disputeStatus = object.object === 'dispute' ? stringValue(object.status) : undefined;
  const subscriptionItems = objectAt(subscriptionObject, 'items') ?? objectAt(object, 'items');
  const firstSubscriptionItem = firstRecordAt(subscriptionItems, 'data');
  const periodEndSeconds = numberValue(subscriptionObject?.current_period_end)
    ?? numberValue(object.current_period_end)
    ?? numberValue(firstSubscriptionItem?.current_period_end)
    ?? numberValue(object.period_end);
  const eventCreatedSeconds = numberValue(event.created) ?? Math.floor(Date.now() / 1_000);
  const planKeyValue = stringValue(metadata?.planKey) ?? stringValue(subscriptionMetadata?.planKey);

  return {
    provider: 'stripe',
    eventId,
    eventType,
    occurredAtMs: eventCreatedSeconds * 1_000,
    billingSubjectId,
    providerSubscriptionId,
    providerCheckoutId: object.object === 'checkout.session' ? stringValue(object.id) : undefined,
    providerCustomerId: stringValue(object.customer) ?? stringValue(subscriptionObject?.customer),
    planKey: isPlanKey(planKeyValue) ? planKeyValue : undefined,
    providerStatus: status,
    currentPeriodEndMs: periodEndSeconds ? periodEndSeconds * 1_000 : undefined,
    cancelAtPeriodEnd,
    ...stripeTransition(eventType, status, cancelAtPeriodEnd, cancellationReason, disputeStatus),
  };
};

const STRIPE_BILLING_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'charge.refunded',
  'charge.dispute.created',
  'charge.dispute.closed',
  'refund.created',
  'refund.updated',
  'radar.early_fraud_warning.created',
]);

export const isSupportedStripeBillingEvent = (payload: unknown): boolean => {
  const event = asRecord(payload);
  const eventType = stringValue(event?.type);
  return Boolean(eventType && STRIPE_BILLING_EVENTS.has(eventType));
};

export const normalizeStripeEventWithLookup = async (
  payload: unknown,
  secrets: ProviderSecrets,
): Promise<NormalizedProviderEvent | null> => {
  const normalized = normalizeStripeEvent(payload);
  if (normalized || !isSupportedStripeBillingEvent(payload)) return normalized;

  const event = asRecord(payload);
  const data = objectAt(event, 'data');
  const sourceObject = objectAt(data, 'object');
  if (!event || !sourceObject) return null;

  let charge: Record<string, unknown> | null = sourceObject.object === 'charge' ? sourceObject : null;
  const chargeId = stringValue(sourceObject.charge);
  if (!charge && chargeId) {
    charge = await stripeRequest(`charges/${encodeURIComponent(chargeId)}`, secrets.stripeSecretKey);
  }

  let invoiceId = stringValue(sourceObject.invoice) ?? stringValue(charge?.invoice);
  const paymentIntentId = stringValue(sourceObject.payment_intent) ?? stringValue(charge?.payment_intent);
  if (!invoiceId && paymentIntentId) {
    const paymentIntent = await stripeRequest(
      `payment_intents/${encodeURIComponent(paymentIntentId)}`,
      secrets.stripeSecretKey,
    );
    invoiceId = stringValue(paymentIntent.invoice);
  }
  if (!invoiceId) return null;
  const invoice = await stripeRequest(
    `invoices/${encodeURIComponent(invoiceId)}?expand[]=subscription`,
    secrets.stripeSecretKey,
  );
  const enrichedObject: Record<string, unknown> = {
    ...invoice,
    ...sourceObject,
    invoice: invoice.id,
    customer: sourceObject.customer ?? charge?.customer ?? invoice.customer,
    subscription: sourceObject.subscription ?? invoice.subscription,
    subscription_details: sourceObject.subscription_details ?? invoice.subscription_details,
    parent: sourceObject.parent ?? invoice.parent,
    lines: sourceObject.lines ?? invoice.lines,
  };
  return normalizeStripeEvent({ ...event, data: { ...data, object: enrichedObject } });
};

const razorpayTransition = (
  eventType: string,
  disputeStatus?: string,
): Pick<NormalizedProviderEvent, 'transition' | 'revocationReason'> => {
  if (/refund\.(?:processed|created)/.test(eventType)) return { transition: 'revoke', revocationReason: 'refund' };
  if (eventType === 'payment.dispute.won'
    || (eventType === 'payment.dispute.closed' && disputeStatus === 'won')) return { transition: 'recover' };
  if (eventType === 'payment.dispute.created'
    || eventType === 'payment.dispute.lost'
    || (eventType === 'payment.dispute.closed' && disputeStatus !== 'won')) {
    return { transition: 'revoke', revocationReason: 'dispute' };
  }
  if (eventType === 'subscription.charged' || eventType === 'subscription.activated' || eventType === 'subscription.resumed') {
    return { transition: eventType === 'subscription.charged' ? 'renewed' : 'activate' };
  }
  if (eventType === 'subscription.pending' || eventType === 'subscription.halted' || eventType === 'payment.failed') {
    return { transition: 'renewal_failed' };
  }
  if (eventType === 'subscription.cancelled') return { transition: 'cancel_at_period_end' };
  if (eventType === 'subscription.completed' || eventType === 'subscription.expired') return { transition: 'expired' };
  return { transition: 'pending' };
};

export const normalizeRazorpayEvent = (
  payload: unknown,
  eventIdHeader?: string,
): NormalizedProviderEvent | null => {
  const event = asRecord(payload);
  const payloadRecord = objectAt(event, 'payload');
  const subscriptionEnvelope = objectAt(payloadRecord, 'subscription');
  const subscription = objectAt(subscriptionEnvelope, 'entity');
  const paymentEnvelope = objectAt(payloadRecord, 'payment');
  const payment = objectAt(paymentEnvelope, 'entity');
  const refundEnvelope = objectAt(payloadRecord, 'refund');
  const refund = objectAt(refundEnvelope, 'entity');
  const disputeEnvelope = objectAt(payloadRecord, 'dispute');
  const dispute = objectAt(disputeEnvelope, 'entity');
  const eventType = stringValue(event?.event);
  const eventId = stringValue(eventIdHeader) ?? stringValue(event?.id);
  if (!event || !eventType || !eventId) return null;

  const notes = objectAt(subscription, 'notes')
    ?? objectAt(payment, 'notes')
    ?? objectAt(refund, 'notes')
    ?? objectAt(dispute, 'notes');
  const billingSubjectId = stringValue(notes?.billingSubjectId);
  const providerSubscriptionId = stringValue(subscription?.id)
    ?? stringValue(payment?.subscription_id)
    ?? stringValue(refund?.subscription_id)
    ?? stringValue(dispute?.subscription_id);
  if (!billingSubjectId || !providerSubscriptionId) return null;

  const status = stringValue(subscription?.status) ?? eventType.replace(/^subscription\./, '');
  const periodEndSeconds = numberValue(subscription?.current_end) ?? numberValue(subscription?.end_at);
  const occurredSeconds = numberValue(event.created_at)
    ?? numberValue(subscription?.updated_at)
    ?? numberValue(payment?.created_at)
    ?? Math.floor(Date.now() / 1_000);
  const planKeyValue = stringValue(notes?.planKey);
  const transition = razorpayTransition(eventType, stringValue(dispute?.status));

  return {
    provider: 'razorpay',
    eventId,
    eventType,
    occurredAtMs: occurredSeconds * 1_000,
    billingSubjectId,
    providerSubscriptionId,
    providerCustomerId: stringValue(subscription?.customer_id),
    planKey: isPlanKey(planKeyValue) ? planKeyValue : undefined,
    providerStatus: status,
    currentPeriodEndMs: periodEndSeconds ? periodEndSeconds * 1_000 : undefined,
    cancelAtPeriodEnd: eventType === 'subscription.cancelled' && Boolean(periodEndSeconds && periodEndSeconds * 1_000 > Date.now()),
    ...transition,
  };
};

const isSupportedRazorpayEventType = (eventType: string): boolean =>
  eventType.startsWith('subscription.')
  || eventType === 'payment.failed'
  || /^(?:refund\.(?:processed|created)|payment\.dispute\.(?:created|won|lost|closed))$/.test(eventType);

export const isSupportedRazorpayBillingEvent = (payload: unknown): boolean => {
  const event = asRecord(payload);
  const eventType = stringValue(event?.event);
  return Boolean(eventType && isSupportedRazorpayEventType(eventType));
};

export const normalizeRazorpayEventWithLookup = async (
  payload: unknown,
  eventIdHeader: string | undefined,
  secrets: ProviderSecrets,
): Promise<NormalizedProviderEvent | null> => {
  const normalized = normalizeRazorpayEvent(payload, eventIdHeader);
  if (normalized || !isSupportedRazorpayBillingEvent(payload)) return normalized;

  const event = asRecord(payload);
  const payloadRecord = objectAt(event, 'payload');
  if (!event || !payloadRecord) return null;
  const payment = objectAt(objectAt(payloadRecord, 'payment'), 'entity');
  const refund = objectAt(objectAt(payloadRecord, 'refund'), 'entity');
  const dispute = objectAt(objectAt(payloadRecord, 'dispute'), 'entity');
  const paymentId = stringValue(payment?.id)
    ?? stringValue(refund?.payment_id)
    ?? stringValue(dispute?.payment_id);
  const hydratedPayment = payment ?? (paymentId
    ? await razorpayRequest(`payments/${encodeURIComponent(paymentId)}`, secrets)
    : null);
  const subscriptionId = stringValue(hydratedPayment?.subscription_id)
    ?? stringValue(refund?.subscription_id)
    ?? stringValue(dispute?.subscription_id);
  if (!subscriptionId) return null;
  const subscription = await razorpayRequest(
    `subscriptions/${encodeURIComponent(subscriptionId)}`,
    secrets,
  );
  return normalizeRazorpayEvent({
    ...event,
    payload: {
      ...payloadRecord,
      subscription: { entity: subscription },
      ...(hydratedPayment ? { payment: { entity: hydratedPayment } } : {}),
    },
  }, eventIdHeader);
};

export const fetchSubscriptionSnapshot = async (
  provider: BillingProvider,
  providerSubscriptionId: string,
  secrets: ProviderSecrets,
): Promise<ProviderSubscriptionSnapshot> => {
  if (provider === 'stripe') {
    const subscription = await stripeRequest(
      `subscriptions/${encodeURIComponent(providerSubscriptionId)}`,
      secrets.stripeSecretKey,
    );
    const status = stringValue(subscription.status) ?? 'unknown';
    const cancelAtPeriodEnd = subscription.cancel_at_period_end === true;
    const firstSubscriptionItem = firstRecordAt(objectAt(subscription, 'items'), 'data');
    const periodEnd = numberValue(subscription.current_period_end)
      ?? numberValue(firstSubscriptionItem?.current_period_end);
    const cancellationReason = stringValue(objectAt(subscription, 'cancellation_details')?.reason);
    return {
      provider,
      providerSubscriptionId,
      providerCustomerId: stringValue(subscription.customer),
      providerStatus: status,
      currentPeriodEndMs: periodEnd ? periodEnd * 1_000 : undefined,
      cancelAtPeriodEnd,
      ...stripeTransition('customer.subscription.updated', status, cancelAtPeriodEnd, cancellationReason),
    };
  }

  const subscription = await razorpayRequest(`subscriptions/${encodeURIComponent(providerSubscriptionId)}`, secrets);
  const status = stringValue(subscription.status) ?? 'unknown';
  const periodEnd = numberValue(subscription.current_end) ?? numberValue(subscription.end_at);
  const transition = status === 'active' || status === 'authenticated'
    ? 'activate'
    : status === 'pending' || status === 'halted'
      ? 'renewal_failed'
      : status === 'cancelled' && periodEnd && periodEnd * 1_000 > Date.now()
        ? 'cancel_at_period_end'
        : status === 'completed' || status === 'expired' || status === 'cancelled'
          ? 'expired'
          : 'pending';
  return {
    provider,
    providerSubscriptionId,
    providerCustomerId: stringValue(subscription.customer_id),
    providerStatus: status,
    currentPeriodEndMs: periodEnd ? periodEnd * 1_000 : undefined,
    cancelAtPeriodEnd: transition === 'cancel_at_period_end',
    transition,
  };
};

export type { ProviderSecrets };
