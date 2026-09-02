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
import { HttpError, sha256, type AuthenticatedPrincipal } from '../security.js';
import {
  applyProviderEvent,
  createConnectorGrant,
  listReconciliationCandidates,
  redeemConnectorGrant,
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
    'billingCustomers',
    'subscriptions',
    'entitlements',
    'paymentEvents',
    'connectorGrants',
    'auditLogs',
    'rateLimits',
    'billingJobs',
  ]) {
    const reference = doc(client, collection, 'attempt');
    await assertFails(getDoc(reference));
    await assertFails(setDoc(reference, { mcpAccess: true, amount: 1 }));
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

test('provider events are idempotent, ordered, recover grace, and keep terminal revocations locked', async () => {
  const baseTime = Date.now() - 10_000;
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
  assert.equal(entitlement?.mcpAccess, true);

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
  assert.equal(entitlement?.mcpAccess, false);
  assert.equal(entitlement?.revocationReason, 'refund');

  assert.equal(await applyProviderEvent(providerEvent('evt_new_subscription', baseTime + 4_000, {
    providerSubscriptionId: 'sub_2',
  }), 'hash_new_subscription'), 'processed');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('personal_user_1').get()).data();
  assert.equal(entitlement?.mcpAccess, true);
  assert.equal(entitlement?.status, 'active');
});

test('connector grants are paid, short-lived, one-time, and binding-specific', async () => {
  const principal = {
    uid: 'user_1',
    email: 'user@example.com',
    displayName: 'User',
    token: { uid: 'user_1' },
  } as unknown as AuthenticatedPrincipal;
  const input = {
    pairingCredentialHash: 'a'.repeat(64),
    origin: 'https://algoglyph.com',
    connectorVersion: '0.3.0',
    requestedScopes: ['session:revoke', 'catalog:read'] as const,
  };
  const redeemInput = { ...input, requestedScopes: [...input.requestedScopes] };

  await assert.rejects(
    redeemConnectorGrant({ ...redeemInput, entitlementGrant: 'missing-grant-value-that-is-long-enough' }),
    (error: unknown) => error instanceof HttpError && error.status === 401,
  );
  await assert.rejects(
    createConnectorGrant(principal, { ...input, requestedScopes: [...input.requestedScopes] }),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );

  await getAdminFirestore().collection('entitlements').doc('personal_user_1').set({
    workspaceId: 'personal_user_1',
    status: 'active',
    mcpAccess: true,
    accessUntil: Timestamp.fromMillis(Date.now() + 60 * 60 * 1_000),
    version: 7,
  });
  const expiring = await createConnectorGrant(principal, { ...input, requestedScopes: [...input.requestedScopes] });
  await assert.rejects(
    redeemConnectorGrant({
      ...redeemInput,
      pairingCredentialHash: 'b'.repeat(64),
      entitlementGrant: expiring.entitlementGrant,
    }),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  await getAdminFirestore().collection('connectorGrants').doc(sha256(expiring.entitlementGrant)).update({
    expiresAt: Timestamp.fromMillis(Date.now() - 1),
  });
  await assert.rejects(
    redeemConnectorGrant({ ...redeemInput, entitlementGrant: expiring.entitlementGrant }),
    (error: unknown) => error instanceof HttpError && error.status === 410,
  );

  const valid = await createConnectorGrant(principal, { ...input, requestedScopes: [...input.requestedScopes] });
  const redeemed = await redeemConnectorGrant({ ...redeemInput, entitlementGrant: valid.entitlementGrant });
  assert.deepEqual(redeemed.allowedScopes, input.requestedScopes);
  assert.equal(redeemed.entitlementVersion, 7);
  await assert.rejects(
    redeemConnectorGrant({ ...redeemInput, entitlementGrant: valid.entitlementGrant }),
    (error: unknown) => error instanceof HttpError && error.status === 401,
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
