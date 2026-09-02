import type { McpSessionScope } from '../mcp/types';

export type BillingPlanKey = 'pro_monthly' | 'pro_annual';
export type BillingRegion = 'india' | 'international';
export type BillingProvider = 'razorpay' | 'stripe';
export type EntitlementStatus = 'pending' | 'active' | 'grace' | 'canceled' | 'locked';

export interface PersonalWorkspace {
  id: string;
  name: string;
  role: 'owner';
}

export interface BillingStatus {
  workspace: PersonalWorkspace;
  planKey: BillingPlanKey | null;
  provider: BillingProvider | null;
  providerStatus: string | null;
  entitlement: {
    mcpAccess: boolean;
    status: EntitlementStatus;
    currentPeriodEnd: string | null;
    gracePeriodEnd: string | null;
    accessUntil: string | null;
    cancelAtPeriodEnd: boolean;
    version: number;
  };
}

export interface StripeCheckoutResult {
  provider: 'stripe';
  checkoutUrl: string;
  providerCustomerId: string;
}

export interface RazorpayCheckoutResult {
  provider: 'razorpay';
  providerSubscriptionId: string;
  razorpay: {
    keyId: string;
    subscriptionId: string;
    name: string;
    description: string;
  };
}

export type BillingCheckoutResult = StripeCheckoutResult | RazorpayCheckoutResult;

export interface ConnectorGrantRequest {
  pairingCredentialHash: string;
  origin: string;
  connectorVersion: string;
  requestedScopes: McpSessionScope[];
}

export interface ConnectorGrantResult {
  entitlementGrant: string;
  expiresAt: string;
}

export interface BillingApiTokens {
  idToken: string;
  appCheckToken: string;
}
