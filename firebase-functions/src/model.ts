export const PLAN_KEYS = ['pro_monthly', 'pro_annual'] as const;
export const BILLING_PROVIDERS = ['stripe', 'razorpay'] as const;

export type PlanKey = typeof PLAN_KEYS[number];
export type BillingProvider = typeof BILLING_PROVIDERS[number];
export type EntitlementStatus = 'pending' | 'active' | 'grace' | 'canceled' | 'locked';

export interface PlanDefinition {
  key: PlanKey;
  interval: 'month' | 'year';
  currency: 'USD' | 'INR';
  provider: BillingProvider;
  providerPriceId: string;
}

export interface NormalizedProviderEvent {
  provider: BillingProvider;
  eventId: string;
  eventType: string;
  occurredAtMs: number;
  workspaceId: string;
  providerSubscriptionId: string;
  providerCheckoutId?: string;
  providerCustomerId?: string;
  planKey?: PlanKey;
  providerStatus: string;
  currentPeriodEndMs?: number;
  cancelAtPeriodEnd: boolean;
  transition: 'pending' | 'activate' | 'renewed' | 'recover' | 'renewal_failed' | 'cancel_at_period_end' | 'expired' | 'revoke';
  revocationReason?: 'refund' | 'dispute' | 'fraud' | 'security';
}

export interface EntitlementProjection {
  status: EntitlementStatus;
  managedAgentAccess: boolean;
  currentPeriodEndMs?: number;
  gracePeriodEndMs?: number;
  accessUntilMs?: number;
  cancelAtPeriodEnd: boolean;
  revocationReason?: string;
}

export const GRACE_PERIOD_MS = 72 * 60 * 60 * 1_000;

export const isPlanKey = (value: unknown): value is PlanKey =>
  typeof value === 'string' && PLAN_KEYS.includes(value as PlanKey);

export const isProvider = (value: unknown): value is BillingProvider =>
  typeof value === 'string' && BILLING_PROVIDERS.includes(value as BillingProvider);

export const projectEntitlement = (
  event: NormalizedProviderEvent,
  nowMs: number,
  hadCurrentAccess = false,
): EntitlementProjection => {
  const periodEnd = event.currentPeriodEndMs;

  if (event.transition === 'revoke' || event.transition === 'expired') {
    return {
      status: 'locked',
      managedAgentAccess: false,
      currentPeriodEndMs: periodEnd,
      accessUntilMs: nowMs,
      cancelAtPeriodEnd: event.cancelAtPeriodEnd,
      revocationReason: event.revocationReason ?? (event.transition === 'expired' ? 'expired' : 'security'),
    };
  }

  if (event.transition === 'renewal_failed') {
    if (!hadCurrentAccess) {
      return {
        status: 'locked',
        managedAgentAccess: false,
        currentPeriodEndMs: periodEnd,
        accessUntilMs: nowMs,
        cancelAtPeriodEnd: false,
        revocationReason: 'payment_failed',
      };
    }
    const gracePeriodEndMs = nowMs + GRACE_PERIOD_MS;
    return {
      status: 'grace',
      managedAgentAccess: true,
      currentPeriodEndMs: periodEnd,
      gracePeriodEndMs,
      accessUntilMs: gracePeriodEndMs,
      cancelAtPeriodEnd: false,
    };
  }

  if (event.transition === 'activate' || event.transition === 'renewed' || event.transition === 'recover') {
    const accessUntilMs = periodEnd ?? nowMs;
    return {
      status: event.cancelAtPeriodEnd ? 'canceled' : 'active',
      managedAgentAccess: accessUntilMs > nowMs,
      currentPeriodEndMs: periodEnd,
      accessUntilMs,
      cancelAtPeriodEnd: event.cancelAtPeriodEnd,
    };
  }

  if (event.transition === 'cancel_at_period_end') {
    const accessUntilMs = periodEnd ?? nowMs;
    return {
      status: 'canceled',
      managedAgentAccess: accessUntilMs > nowMs,
      currentPeriodEndMs: periodEnd,
      accessUntilMs,
      cancelAtPeriodEnd: true,
    };
  }

  return {
    status: 'pending',
    managedAgentAccess: false,
    currentPeriodEndMs: periodEnd,
    accessUntilMs: periodEnd,
    cancelAtPeriodEnd: event.cancelAtPeriodEnd,
  };
};
