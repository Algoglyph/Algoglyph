import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import { deleteApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { NormalizedProviderEvent } from '../model.js';
import { HttpError, type AuthenticatedPrincipal } from '../security.js';
import {
  applyProviderEvent,
  canUseManagedAgent,
  listReconciliationCandidates,
  recordRazorpayCheckoutVerification,
  reserveCheckout,
} from '../services.js';

let environment: RulesTestEnvironment;
let adminApp: App;

before(async () => {
  adminApp = initializeApp({ projectId: 'demo-algoglyph-billing' });
  environment = await initializeTestEnvironment({
    projectId: 'demo-algoglyph-billing',
    firestore: {
      rules: await readFile(new URL('../../../firestore.rules', import.meta.url), 'utf8'),
    },
  });
});

beforeEach(async () => environment.clearFirestore());

after(async () => {
  await environment?.cleanup();
  await deleteApp(adminApp);
});

test('authenticated browser clients cannot read or mutate server-owned billing records', async () => {
  const client = environment.authenticatedContext('user_1').firestore();
  for (const collection of [
    'workspaces',
    'workspaceMembers',
    'organizations',
    'organizationMembers',
    'billingCustomers',
    'subscriptions',
    'entitlements',
    'paymentEvents',
    'auditLogs',
    'rateLimits',
    'billingJobs',
  ]) {
    const reference = doc(client, collection, 'attempt');
    await assertFails(getDoc(reference));
    await assertFails(setDoc(reference, { managedAgentAccess: true, amount: 1 }));
  }
  assert.ok(true);
});

const providerEvent = (
  eventId: string,
  occurredAtMs: number,
  overrides: Partial<NormalizedProviderEvent> = {},
): NormalizedProviderEvent => ({
  provider: 'stripe',
  eventId,
  eventType: 'customer.subscription.updated',
  occurredAtMs,
  workspaceId: 'personal_user_1',
  providerSubscriptionId: 'sub_1',
  providerCustomerId: 'cus_1',
  planKey: 'pro_monthly',
  providerStatus: 'active',
  currentPeriodEndMs: Date.now() + 30 * 24 * 60 * 60 * 1_000,
  cancelAtPeriodEnd: false,
  transition: 'activate',
  ...overrides,
});

test('verified provider events grant managed-agent access, remain idempotent, recover grace, and keep revocations locked', async () => {
  const baseTime = Date.now() - 10_000;
  await getAdminFirestore().collection('subscriptions').doc('personal_user_1').set({
    workspaceId: 'personal_user_1',
    ownerUid: 'user_1',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1',
    providerCustomerId: 'cus_1',
    planKey: 'pro_monthly',
    providerStatus: 'payment_verification_pending',
  });
  assert.equal(await applyProviderEvent(providerEvent('evt_active', baseTime), 'hash_active'), 'processed');
  assert.equal(await applyProviderEvent(providerEvent('evt_active', baseTime), 'hash_active'), 'duplicate');
  assert.equal(await applyProviderEvent(providerEvent('evt_active', baseTime), 'hash_tampered'), 'conflict');
  assert.equal(await applyProviderEvent(providerEvent('evt_stale_failure', baseTime - 1_000, {
    eventType: 'invoice.payment_failed',
    providerStatus: 'past_due',
    transition: 'renewal_failed',
  }), 'hash_stale'), 'stale');

  assert.equal(await applyProviderEvent(providerEvent('evt_failure', baseTime + 1_000, {
    eventType: 'invoice.payment_failed',
    providerStatus: 'past_due',
    transition: 'renewal_failed',
  }), 'hash_failure'), 'processed');
  let entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.status, 'grace');
  assert.equal(entitlement?.managedAgentAccess, true);

  assert.equal(await applyProviderEvent(providerEvent('evt_recovered', baseTime + 2_000, {
    eventType: 'invoice.paid',
    transition: 'renewed',
  }), 'hash_recovered'), 'processed');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.status, 'active');

  assert.equal(await applyProviderEvent(providerEvent('evt_refund', baseTime - 2_000, {
    eventType: 'charge.refunded',
    providerStatus: 'refunded',
    transition: 'revoke',
    revocationReason: 'refund',
  }), 'hash_refund'), 'processed');
  assert.equal(await applyProviderEvent(providerEvent('evt_late_activation', baseTime + 3_000), 'hash_late'), 'stale');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, false);
  assert.equal(entitlement?.revocationReason, 'refund');

  assert.equal(await applyProviderEvent(providerEvent('evt_unbound_subscription', baseTime + 4_000, {
    providerSubscriptionId: 'sub_2',
  }), 'hash_unbound_subscription'), 'conflict');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, false);

  await getAdminFirestore().collection('subscriptions').doc('personal_user_1').set({
    providerSubscriptionId: 'sub_2',
    terminalRevocationAt: null,
    terminalRevocationReason: null,
  }, { merge: true });
  assert.equal(await applyProviderEvent(providerEvent('evt_new_subscription', baseTime + 5_000, {
    providerSubscriptionId: 'sub_2',
  }), 'hash_new_subscription'), 'processed');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, true);
  assert.equal(entitlement?.status, 'active');
});

test('an initial failed payment does not grant managed-agent access', async () => {
  const now = Date.now();
  await getAdminFirestore().collection('subscriptions').doc('personal_user_1').set({
    workspaceId: 'personal_user_1',
    billingSubjectId: 'personal_user_1',
    purchaserUid: 'user_1',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1',
    planKey: 'pro_monthly',
    providerStatus: 'payment_verification_pending',
  });
  assert.equal(await applyProviderEvent(providerEvent('evt_initial_failure', now, {
    eventType: 'invoice.payment_failed',
    providerStatus: 'past_due',
    transition: 'renewal_failed',
  }), 'hash_initial_failure'), 'processed');
  const entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, false);
  assert.equal(entitlement?.status, 'locked');
});

test('an activated subscription receives grace when renewal failure arrives after period expiry', async () => {
  const now = Date.now();
  await getAdminFirestore().collection('subscriptions').doc('personal_user_1').set({
    workspaceId: 'personal_user_1',
    billingSubjectId: 'personal_user_1',
    purchaserUid: 'user_1',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1',
    planKey: 'pro_monthly',
    providerStatus: 'active',
    hasActivated: true,
  });
  await getAdminFirestore().collection('entitlements').doc('personal_user_1').set({
    workspaceId: 'personal_user_1',
    managedAgentAccess: false,
    status: 'locked',
    accessUntil: Timestamp.fromMillis(now - 1_000),
  });

  assert.equal(await applyProviderEvent(providerEvent('evt_late_renewal_failure', now, {
    eventType: 'invoice.payment_failed',
    providerStatus: 'past_due',
    currentPeriodEndMs: now - 1_000,
    transition: 'renewal_failed',
  }), 'hash_late_renewal_failure'), 'processed');

  const entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, true);
  assert.equal(entitlement?.status, 'grace');
  assert.ok(entitlement?.accessUntil instanceof Timestamp);
  assert.ok(entitlement.accessUntil.toMillis() > now);
});

test('a won dispute can recover its own revocation but cannot undo a refund revocation', async () => {
  const now = Date.now();
  await getAdminFirestore().collection('subscriptions').doc('personal_user_1').set({
    workspaceId: 'personal_user_1',
    billingSubjectId: 'personal_user_1',
    purchaserUid: 'user_1',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1',
    planKey: 'pro_monthly',
    providerStatus: 'active',
    hasActivated: true,
  });
  assert.equal(await applyProviderEvent(providerEvent('evt_dispute_created', now, {
    eventType: 'charge.dispute.created',
    transition: 'revoke',
    revocationReason: 'dispute',
  }), 'hash_dispute_created'), 'processed');
  assert.equal(await applyProviderEvent(providerEvent('evt_dispute_won', now + 1_000, {
    eventType: 'charge.dispute.closed',
    transition: 'recover',
  }), 'hash_dispute_won'), 'processed');
  let entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, true);

  assert.equal(await applyProviderEvent(providerEvent('evt_refund_after_recovery', now + 2_000, {
    eventType: 'charge.refunded',
    transition: 'revoke',
    revocationReason: 'refund',
  }), 'hash_refund_after_recovery'), 'processed');
  assert.equal(await applyProviderEvent(providerEvent('evt_unrelated_dispute_won', now + 3_000, {
    eventType: 'charge.dispute.closed',
    transition: 'recover',
  }), 'hash_unrelated_dispute_won'), 'stale');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, false);
  assert.equal(entitlement?.revocationReason, 'refund');
});

const principal = (uid: string): AuthenticatedPrincipal => ({
  uid,
  email: `${uid}@example.com`,
  displayName: uid,
  token: { uid },
}) as unknown as AuthenticatedPrincipal;

const activeEntitlement = () => ({
  status: 'active',
  managedAgentAccess: true,
  accessUntil: Timestamp.fromMillis(Date.now() + 60 * 60 * 1_000),
  version: 1,
});

test('managed-agent authorization denies free and expired individual users and ignores legacy MCP flags', async () => {
  const user = principal('user_1');
  await assert.rejects(
    canUseManagedAgent(user, 'personal_user_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
  await getAdminFirestore().collection('entitlements').doc('personal_user_1').set({
    status: 'active',
    mcpAccess: true,
    accessUntil: Timestamp.fromMillis(Date.now() + 60 * 60 * 1_000),
  });
  await assert.rejects(
    canUseManagedAgent(user, 'personal_user_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
  await getAdminFirestore().collection('entitlements').doc('personal_user_1').set({
    ...activeEntitlement(),
    accessUntil: Timestamp.fromMillis(Date.now() - 1),
  });
  await assert.rejects(
    canUseManagedAgent(user, 'personal_user_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
});

test('managed-agent authorization allows a current individual subscription', async () => {
  await getAdminFirestore().collection('entitlements').doc('personal_user_1').set(activeEntitlement());
  const authorization = await canUseManagedAgent(principal('user_1'), 'personal_user_1');
  assert.equal(authorization.managedAgentAccess, true);
  assert.equal(authorization.source, 'individual');
});

const seedOrganization = async (memberStatus: 'active' | 'revoked' = 'active') => {
  const db = getAdminFirestore();
  await Promise.all([
    db.collection('organizations').doc('org_123456').set({ name: 'Example Org', status: 'active' }),
    db.collection('organizationMembers').doc('org_123456_user_1').set({
      organizationId: 'org_123456', uid: 'user_1', role: 'member', status: memberStatus,
    }),
    db.collection('workspaces').doc('organization_org_123456').set({ organizationId: 'org_123456' }),
    db.collection('workspaceMembers').doc('organization_org_123456_user_1').set({
      workspaceId: 'organization_org_123456', uid: 'user_1', role: 'member', status: memberStatus,
    }),
  ]);
};

test('managed-agent organization authorization requires active membership and an active organization entitlement', async () => {
  const user = principal('user_1');
  await seedOrganization();
  await assert.rejects(
    canUseManagedAgent(user, 'organization_org_123456'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
  await getAdminFirestore().collection('entitlements').doc('organization_org_123456').set(activeEntitlement());
  const authorization = await canUseManagedAgent(user, 'organization_org_123456');
  assert.equal(authorization.source, 'organization');

  await assert.rejects(
    canUseManagedAgent(principal('outsider'), 'organization_org_123456'),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  await getAdminFirestore().collection('organizationMembers').doc('org_123456_user_1').update({ status: 'revoked' });
  await assert.rejects(
    canUseManagedAgent(user, 'organization_org_123456'),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
});

test('only organization owners and billing admins can start organization checkout', async () => {
  await seedOrganization();
  const plan = {
    key: 'pro_monthly', interval: 'month', currency: 'USD', provider: 'stripe', providerPriceId: 'price_test',
  } as const;
  await assert.rejects(
    reserveCheckout(principal('user_1'), plan, 'org_123456'),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  await getAdminFirestore().collection('organizationMembers').doc('org_123456_user_1').update({ role: 'billing_admin' });
  const reservation = await reserveCheckout(principal('user_1'), plan, 'org_123456');
  assert.equal(reservation.workspace.kind, 'organization');
  assert.equal(reservation.workspace.canManageBilling, true);
});

test('revoked organization entitlement disables managed-agent access', async () => {
  await seedOrganization();
  await getAdminFirestore().collection('entitlements').doc('organization_org_123456').set({
    ...activeEntitlement(), managedAgentAccess: false, status: 'locked',
  });
  await assert.rejects(
    canUseManagedAgent(principal('user_1'), 'organization_org_123456'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
});

test('a verified Razorpay browser callback records evidence but does not grant managed-agent access', async () => {
  const principal = {
    uid: 'user_1',
    email: 'user@example.com',
    displayName: 'User',
    token: { uid: 'user_1' },
  } as unknown as AuthenticatedPrincipal;
  await getAdminFirestore().collection('subscriptions').doc('personal_user_1').set({
    workspaceId: 'personal_user_1',
    billingSubjectId: 'personal_user_1',
    provider: 'razorpay',
    providerSubscriptionId: 'sub_12345678',
  });
  await recordRazorpayCheckoutVerification(
    principal, 'personal_user_1', 'sub_12345678', 'pay_12345678', 'captured', 100, 'INR',
  );
  await assert.rejects(
    canUseManagedAgent(principal, 'personal_user_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
});

test('a UID cannot adopt another owner record at its personal workspace path', async () => {
  const principal = {
    uid: 'user_1',
    email: 'user@example.com',
    displayName: 'User',
    token: { uid: 'user_1' },
  } as unknown as AuthenticatedPrincipal;
  await getAdminFirestore().collection('workspaces').doc('personal_user_1').set({
    ownerUid: 'user_2',
    displayName: 'Other owner workspace',
  });
  await assert.rejects(
    canUseManagedAgent(principal, 'personal_user_1'),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
});

test('reconciliation advances its document cursor and wraps after the final subscription', async () => {
  const db = getAdminFirestore();
  await Promise.all([
    db.collection('subscriptions').doc('workspace_a').set({
      provider: 'stripe',
      providerSubscriptionId: 'sub_a',
    }),
    db.collection('subscriptions').doc('workspace_b').set({
      provider: 'razorpay',
      providerSubscriptionId: 'sub_b',
    }),
    db.collection('billingJobs').doc('reconciliation').set({ cursorWorkspaceId: 'workspace_a' }),
  ]);
  const tail = await listReconciliationCandidates();
  assert.deepEqual(tail.map((candidate) => candidate.workspaceId), ['workspace_b']);
  const wrapped = await listReconciliationCandidates();
  assert.deepEqual(wrapped.map((candidate) => candidate.workspaceId), ['workspace_a', 'workspace_b']);
});
