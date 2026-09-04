export type BillingPlanKey = 'pro_monthly' | 'pro_annual';
export type BillingRegion = 'india' | 'international';
export type BillingProvider = 'razorpay' | 'stripe';
export type EntitlementStatus = 'pending' | 'active' | 'grace' | 'canceled' | 'locked';

export interface BillingWorkspace {
  id: string;
  name: string;
  kind: 'individual' | 'organization';
  role: 'owner' | 'billing_admin' | 'member';
  organizationId?: string;
  canManageBilling: boolean;
}

export interface BillingWorkspacesResult {
  workspaces: BillingWorkspace[];
}

export interface BillingStatus {
  workspace: BillingWorkspace;
  planKey: BillingPlanKey | null;
  provider: BillingProvider | null;
  providerStatus: string | null;
  entitlement: {
    managedAgentAccess: boolean;
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

export interface BillingApiTokens {
  idToken: string;
  appCheckToken: string;
}

export interface RazorpayCheckoutCallback {
  paymentId: string;
  subscriptionId: string;
  signature: string;
}

export interface ManagedAgentAuthorization {
  managedAgentAccess: true;
  source: 'individual' | 'organization';
  subjectId: string;
  accessUntil: string;
}
