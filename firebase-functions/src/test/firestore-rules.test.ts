import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import { deleteApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Timestamp } from 'firebase-admin/firestore';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import type { NormalizedProviderEvent } from '../model.js';
import { HttpError, type AuthenticatedPrincipal } from '../security.js';
import {
  applyProviderEvent,
  canUseManagedAgent,
  listReconciliationCandidates,
  recordRazorpayCheckoutVerification,
  reserveCheckout,
} from '../services.js';
import {
  acceptWorkspaceInvite,
  applyCanvasElementMutations,
  createMcpAccessToken,
  createWorkspaceInvite,
  inspectWorkspaceInvite,
  requireMcpAccessToken,
  revokeWorkspaceInvite,
} from '../workspaces.js';
import { handleMcpRequest } from '../mcp.js';

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

beforeEach(async () => {
  await environment.clearFirestore();
  await Promise.all([
    getAdminFirestore().collection('workspaces').doc('ws_personal_1').set({
      name: 'Personal canvas', ownerId: 'user_1', organizationId: null, status: 'active',
    }),
    getAdminFirestore().collection('workspaceMembers').doc('ws_personal_1_user_1').set({
      workspaceId: 'ws_personal_1', uid: 'user_1', role: 'owner', status: 'active',
    }),
    getAdminFirestore().collection('workspaces').doc('ws_personal_1').collection('canvases').doc('canvas_main_1').set({
      workspaceId: 'ws_personal_1', name: 'Main canvas', createdBy: 'user_1', status: 'active',
    }),
  ]);
});

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

test('authenticated owners can atomically create organizations and workspaces with the matching membership', async () => {
  const client = environment.authenticatedContext('user_2').firestore();
  const organizationId = 'org_created_123456';
  const organization = doc(client, 'organizations', organizationId);
  const organizationMember = doc(client, 'organizationMembers', `${organizationId}_user_2`);
  const organizationBatch = writeBatch(client);
  organizationBatch.set(organization, {
    name: 'My Organization', ownerId: 'user_2', status: 'active',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  organizationBatch.set(organizationMember, {
    organizationId, uid: 'user_2', role: 'owner', status: 'active', joinedAt: serverTimestamp(),
  });
  await assertSucceeds(organizationBatch.commit());
  await assertSucceeds(getDoc(organization));

  const workspaceId = 'ws_created_123456';
  const workspace = doc(client, 'workspaces', workspaceId);
  const member = doc(client, 'workspaceMembers', `${workspaceId}_user_2`);
  const canvas = doc(client, 'workspaces', workspaceId, 'canvases', 'canvas_main_2');
  const workspaceBatch = writeBatch(client);
  workspaceBatch.set(workspace, {
    name: 'My Workspace', ownerId: 'user_2', organizationId, status: 'active',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  workspaceBatch.set(member, {
    workspaceId, uid: 'user_2', role: 'owner', status: 'active', joinedAt: serverTimestamp(),
  });
  workspaceBatch.set(canvas, {
    workspaceId, name: 'Main canvas', createdBy: 'user_2', status: 'active',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  await assertSucceeds(workspaceBatch.commit());
  await assertSucceeds(getDoc(workspace));
  await assertSucceeds(getDocs(query(
    collection(client, 'workspaceMembers'), where('uid', '==', 'user_2'), where('status', '==', 'active'),
  )));
  await assertSucceeds(getDocs(collection(client, 'workspaces', workspaceId, 'canvases')));
});

test('an organization member without admin rights cannot attach a workspace to that organization', async () => {
  const client = environment.authenticatedContext('user_3').firestore();
  await Promise.all([
    getAdminFirestore().collection('organizations').doc('org_123456').set({ name: 'Example Org', ownerId: 'user_1', status: 'active' }),
    getAdminFirestore().collection('organizationMembers').doc('org_123456_user_3').set({
      organizationId: 'org_123456', uid: 'user_3', role: 'member', status: 'active',
    }),
  ]);
  const workspaceId = 'ws_wrong_org_123456';
  const batch = writeBatch(client);
  batch.set(doc(client, 'workspaces', workspaceId), {
    name: 'Unauthorized workspace', ownerId: 'user_3', organizationId: 'org_123456', status: 'active',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  batch.set(doc(client, 'workspaceMembers', `${workspaceId}_user_3`), {
    workspaceId, uid: 'user_3', role: 'owner', status: 'active', joinedAt: serverTimestamp(),
  });
  batch.set(doc(client, 'workspaces', workspaceId, 'canvases', 'canvas_wrong_org'), {
    workspaceId, name: 'Main canvas', createdBy: 'user_3', status: 'active',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  await assertFails(batch.commit());
});

const elementRecord = (uid: string, id: string, version: number, versionNonce: number, isDeleted = false) => ({
  workspaceId: 'ws_personal_1',
  canvasId: 'canvas_main_1',
  elementId: id,
  element: { id, type: 'rectangle', version, versionNonce, isDeleted, x: version * 10, y: 0 },
  version,
  versionNonce,
  isDeleted,
  updatedBy: uid,
  updatedAt: serverTimestamp(),
});

test('workspace members can collaborate while non-members cannot read, write, or delete element records', async () => {
  const member = environment.authenticatedContext('user_1').firestore();
  const outsider = environment.authenticatedContext('user_2').firestore();
  const workspace = doc(member, 'workspaces', 'ws_personal_1');
  const element = doc(member, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements', 'element_a');
  await assertSucceeds(getDoc(workspace));
  await assertSucceeds(setDoc(element, elementRecord('user_1', 'element_a', 1, 10)));
  await assertFails(getDoc(doc(outsider, 'workspaces', 'ws_personal_1')));
  await assertFails(setDoc(
    doc(outsider, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements', 'element_b'),
    elementRecord('user_2', 'element_b', 1, 11),
  ));
  await assertFails(deleteDoc(element));
});

test('two members receive incremental updates and unrelated concurrent edits do not overwrite each other', async () => {
  await getAdminFirestore().collection('workspaceMembers').doc('ws_personal_1_user_2').set({
    workspaceId: 'ws_personal_1', uid: 'user_2', role: 'member', status: 'active',
  });
  const a = environment.authenticatedContext('user_1').firestore();
  const b = environment.authenticatedContext('user_2').firestore();
  const elementsA = collection(a, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements');
  const receivedByB = new Promise<number>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Realtime listener timed out.')), 5_000);
    const unsubscribe = onSnapshot(
      collection(b, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements'),
      (snapshot) => {
        if (snapshot.size < 2) return;
        clearTimeout(timeout); unsubscribe(); resolve(snapshot.size);
      }, reject,
    );
  });
  await Promise.all([
    setDoc(doc(elementsA, 'element_a'), elementRecord('user_1', 'element_a', 1, 101)),
    setDoc(doc(b, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements', 'element_b'), elementRecord('user_2', 'element_b', 1, 102)),
  ]);
  assert.equal(await receivedByB, 2);
  assert.equal((await getDocs(elementsA)).size, 2);
});

test('a reconnecting member receives the current converged element state', async () => {
  await getAdminFirestore().collection('workspaceMembers').doc('ws_personal_1_user_2').set({
    workspaceId: 'ws_personal_1', uid: 'user_2', role: 'member', status: 'active',
  });
  const writer = environment.authenticatedContext('user_1').firestore();
  await Promise.all([
    setDoc(
      doc(writer, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements', 'element_a'),
      elementRecord('user_1', 'element_a', 2, 31),
    ),
    setDoc(
      doc(writer, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements', 'element_b'),
      elementRecord('user_1', 'element_b', 3, 32, true),
    ),
  ]);
  const reconnected = environment.authenticatedContext('user_2').firestore();
  const current = await getDocs(collection(
    reconnected, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements',
  ));
  assert.equal(current.size, 2);
  assert.equal(current.docs.find((item) => item.id === 'element_b')?.data().isDeleted, true);
});

test('element clocks reject stale and duplicate writes, while higher-version tombstones converge', async () => {
  const client = environment.authenticatedContext('user_1').firestore();
  const element = doc(client, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements', 'element_a');
  await assertSucceeds(setDoc(element, elementRecord('user_1', 'element_a', 2, 20)));
  await assertSucceeds(setDoc(element, elementRecord('user_1', 'element_a', 2, 10)));
  await assertFails(setDoc(element, elementRecord('user_1', 'element_a', 1, 999)));
  await assertFails(setDoc(element, elementRecord('user_1', 'element_a', 2, 20)));
  await assertSucceeds(setDoc(element, elementRecord('user_1', 'element_a', 3, 1, true)));
  assert.equal((await getDoc(element)).data()?.isDeleted, true);
});

test('element clocks reject values outside the Excalidraw clock range and mismatched payload clocks', async () => {
  const client = environment.authenticatedContext('user_1').firestore();
  const element = doc(client, 'workspaces', 'ws_personal_1', 'canvases', 'canvas_main_1', 'elements', 'element_a');
  await assertFails(setDoc(element, elementRecord('user_1', 'element_a', 2_147_483_648, 1)));
  await assertFails(setDoc(element, elementRecord('user_1', 'element_a', 1, 2_147_483_648)));
  const mismatchedClock = elementRecord('user_1', 'element_a', 1, 1);
  mismatchedClock.element.versionNonce = 2;
  await assertFails(setDoc(element, mismatchedClock));
});

test('invite tokens are hashed, expirable, revocable, single-use membership grants', async () => {
  const owner = principal('user_1');
  const invite = await createWorkspaceInvite(owner, 'ws_personal_1', 'member', 24, 'https://algoglyph.example');
  const token = new URL(invite.inviteUrl).pathname.split('/').at(-1)!;
  const stored = await getAdminFirestore().collection('workspaceInvites').doc(invite.id).get();
  assert.equal(stored.data()?.tokenHash, invite.id);
  assert.equal(JSON.stringify(stored.data()).includes(token), false);
  assert.equal((await inspectWorkspaceInvite(principal('user_2'), token)).workspaceId, 'ws_personal_1');
  assert.deepEqual(await acceptWorkspaceInvite(principal('user_2'), token), { workspaceId: 'ws_personal_1', membershipCreated: true });
  await assert.rejects(acceptWorkspaceInvite(principal('user_3'), token), (error: unknown) => error instanceof HttpError && error.status === 410);
  await assert.rejects(inspectWorkspaceInvite(principal('user_3'), 'not-a-token'), (error: unknown) => error instanceof HttpError && error.status === 404);

  const revoked = await createWorkspaceInvite(owner, 'ws_personal_1', 'viewer', 24, 'https://algoglyph.example');
  await revokeWorkspaceInvite(owner, 'ws_personal_1', revoked.id);
  await assert.rejects(inspectWorkspaceInvite(principal('user_2'), new URL(revoked.inviteUrl).pathname.split('/').at(-1)!), (error: unknown) => error instanceof HttpError && error.status === 410);

  const expired = await createWorkspaceInvite(owner, 'ws_personal_1', 'member', 1, 'https://algoglyph.example');
  await getAdminFirestore().collection('workspaceInvites').doc(expired.id).update({ expiresAt: Timestamp.fromMillis(Date.now() - 1) });
  await assert.rejects(inspectWorkspaceInvite(principal('user_2'), new URL(expired.inviteUrl).pathname.split('/').at(-1)!), (error: unknown) => error instanceof HttpError && error.status === 410);
});

test('free MCP access is workspace-scoped and independent of managed-agent entitlement', async () => {
  const issued = await createMcpAccessToken(principal('user_1'), 'ws_personal_1', 'Test agent');
  await getAdminFirestore().collection('entitlements').doc('user_user_1').set({
    managedAgentAccess: false, status: 'locked', accessUntil: Timestamp.fromMillis(Date.now() - 1),
  });
  const mcpPrincipal = await requireMcpAccessToken(`Bearer ${issued.token}`);
  assert.equal(mcpPrincipal.workspaceId, 'ws_personal_1');
  const listed = await handleMcpRequest(mcpPrincipal, { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'algoglyph_canvas_list', arguments: {} } });
  assert.match(JSON.stringify(listed), /canvas_main_1/);
  const updated = await handleMcpRequest(mcpPrincipal, {
    jsonrpc: '2.0', id: 2, method: 'tools/call', params: {
      name: 'algoglyph_canvas_upsert_elements',
      arguments: { canvasId: 'canvas_main_1', elements: [{ id: 'mcp_element', type: 'rectangle', index: 'a0', x: 0, y: 0, version: 1, versionNonce: 9, isDeleted: false }] },
    },
  });
  assert.match(JSON.stringify(updated), /"applied":1/);
  await assert.rejects(
    applyCanvasElementMutations(mcpPrincipal, 'ws_personal_1', 'canvas_main_1', [
      { id: 'invalid_clock', type: 'rectangle', version: 2_147_483_648, versionNonce: 1 },
    ]),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
  const readBack = await handleMcpRequest(mcpPrincipal, {
    jsonrpc: '2.0', id: 3, method: 'tools/call', params: {
      name: 'algoglyph_canvas_get', arguments: { canvasId: 'canvas_main_1' },
    },
  });
  assert.match(JSON.stringify(readBack), /mcp_element/);
  await getAdminFirestore().collection('workspaceMembers').doc('ws_personal_1_user_2').set({
    workspaceId: 'ws_personal_1', uid: 'user_2', role: 'viewer', status: 'active',
  });
  const viewerToken = await createMcpAccessToken(principal('user_2'), 'ws_personal_1', 'Read-only agent');
  const viewerPrincipal = await requireMcpAccessToken(`Bearer ${viewerToken.token}`);
  assert.equal(viewerPrincipal.scopes.includes('canvas:write'), false);
  await assert.rejects(
    handleMcpRequest(viewerPrincipal, {
      jsonrpc: '2.0', id: 4, method: 'tools/call', params: {
        name: 'algoglyph_canvas_upsert_elements',
        arguments: { canvasId: 'canvas_main_1', elements: [{ id: 'forbidden', version: 1, versionNonce: 1 }] },
      },
    }),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  await assert.rejects(requireMcpAccessToken('Bearer ag_mcp_invalid'), (error: unknown) => error instanceof HttpError && error.status === 401);
  await getAdminFirestore().collection('workspaceMembers').doc('ws_personal_1_user_1').update({ status: 'revoked' });
  await assert.rejects(requireMcpAccessToken(`Bearer ${issued.token}`), (error: unknown) => error instanceof HttpError && error.status === 403);
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
  billingSubjectId: 'user_user_1',
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
  await getAdminFirestore().collection('subscriptions').doc('user_user_1').set({
    workspaceId: 'user_user_1',
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
  let entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
  assert.equal(entitlement?.status, 'grace');
  assert.equal(entitlement?.managedAgentAccess, true);

  assert.equal(await applyProviderEvent(providerEvent('evt_recovered', baseTime + 2_000, {
    eventType: 'invoice.paid',
    transition: 'renewed',
  }), 'hash_recovered'), 'processed');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
  assert.equal(entitlement?.status, 'active');

  assert.equal(await applyProviderEvent(providerEvent('evt_refund', baseTime - 2_000, {
    eventType: 'charge.refunded',
    providerStatus: 'refunded',
    transition: 'revoke',
    revocationReason: 'refund',
  }), 'hash_refund'), 'processed');
  assert.equal(await applyProviderEvent(providerEvent('evt_late_activation', baseTime + 3_000), 'hash_late'), 'stale');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, false);
  assert.equal(entitlement?.revocationReason, 'refund');

  assert.equal(await applyProviderEvent(providerEvent('evt_unbound_subscription', baseTime + 4_000, {
    providerSubscriptionId: 'sub_2',
  }), 'hash_unbound_subscription'), 'conflict');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, false);

  await getAdminFirestore().collection('subscriptions').doc('user_user_1').set({
    providerSubscriptionId: 'sub_2',
    terminalRevocationAt: null,
    terminalRevocationReason: null,
  }, { merge: true });
  assert.equal(await applyProviderEvent(providerEvent('evt_new_subscription', baseTime + 5_000, {
    providerSubscriptionId: 'sub_2',
  }), 'hash_new_subscription'), 'processed');
  entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, true);
  assert.equal(entitlement?.status, 'active');
});

test('an initial failed payment does not grant managed-agent access', async () => {
  const now = Date.now();
  await getAdminFirestore().collection('subscriptions').doc('user_user_1').set({
    workspaceId: 'user_user_1',
    billingSubjectId: 'user_user_1',
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
  const entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, false);
  assert.equal(entitlement?.status, 'locked');
});

test('an activated subscription receives grace when renewal failure arrives after period expiry', async () => {
  const now = Date.now();
  await getAdminFirestore().collection('subscriptions').doc('user_user_1').set({
    workspaceId: 'user_user_1',
    billingSubjectId: 'user_user_1',
    purchaserUid: 'user_1',
    provider: 'stripe',
    providerSubscriptionId: 'sub_1',
    planKey: 'pro_monthly',
    providerStatus: 'active',
    hasActivated: true,
  });
  await getAdminFirestore().collection('entitlements').doc('user_user_1').set({
    workspaceId: 'user_user_1',
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

  const entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
  assert.equal(entitlement?.managedAgentAccess, true);
  assert.equal(entitlement?.status, 'grace');
  assert.ok(entitlement?.accessUntil instanceof Timestamp);
  assert.ok(entitlement.accessUntil.toMillis() > now);
});

test('a won dispute can recover its own revocation but cannot undo a refund revocation', async () => {
  const now = Date.now();
  await getAdminFirestore().collection('subscriptions').doc('user_user_1').set({
    workspaceId: 'user_user_1',
    billingSubjectId: 'user_user_1',
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
  let entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
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
  entitlement = (await getAdminFirestore().collection('entitlements').doc('user_user_1').get()).data();
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
    canUseManagedAgent(user, 'ws_personal_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
  await getAdminFirestore().collection('entitlements').doc('user_user_1').set({
    status: 'active',
    mcpAccess: true,
    accessUntil: Timestamp.fromMillis(Date.now() + 60 * 60 * 1_000),
  });
  await assert.rejects(
    canUseManagedAgent(user, 'ws_personal_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
  await getAdminFirestore().collection('entitlements').doc('user_user_1').set({
    ...activeEntitlement(),
    accessUntil: Timestamp.fromMillis(Date.now() - 1),
  });
  await assert.rejects(
    canUseManagedAgent(user, 'ws_personal_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
});

test('managed-agent authorization allows a current individual subscription', async () => {
  await getAdminFirestore().collection('entitlements').doc('user_user_1').set(activeEntitlement());
  const authorization = await canUseManagedAgent(principal('user_1'), 'ws_personal_1');
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
    db.collection('workspaces').doc('ws_org_123456').set({ name: 'Org workspace', ownerId: 'org-owner', organizationId: 'org_123456', status: 'active' }),
    db.collection('workspaceMembers').doc('ws_org_123456_user_1').set({
      workspaceId: 'ws_org_123456', uid: 'user_1', role: 'member', status: memberStatus,
    }),
  ]);
};

test('managed-agent organization authorization requires active membership and an active organization entitlement', async () => {
  const user = principal('user_1');
  await seedOrganization();
  await assert.rejects(
    canUseManagedAgent(user, 'ws_org_123456'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
  await getAdminFirestore().collection('entitlements').doc('organization_org_123456').set(activeEntitlement());
  const authorization = await canUseManagedAgent(user, 'ws_org_123456');
  assert.equal(authorization.source, 'organization');

  await assert.rejects(
    canUseManagedAgent(principal('outsider'), 'ws_org_123456'),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  await getAdminFirestore().collection('organizationMembers').doc('org_123456_user_1').update({ status: 'revoked' });
  await assert.rejects(
    canUseManagedAgent(user, 'ws_org_123456'),
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
  assert.equal(reservation.subject.kind, 'organization');
  assert.equal(reservation.subject.canManageBilling, true);
});

test('revoked organization entitlement disables managed-agent access', async () => {
  await seedOrganization();
  await getAdminFirestore().collection('entitlements').doc('organization_org_123456').set({
    ...activeEntitlement(), managedAgentAccess: false, status: 'locked',
  });
  await assert.rejects(
    canUseManagedAgent(principal('user_1'), 'ws_org_123456'),
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
  await getAdminFirestore().collection('subscriptions').doc('user_user_1').set({
    workspaceId: 'user_user_1',
    billingSubjectId: 'user_user_1',
    provider: 'razorpay',
    providerSubscriptionId: 'sub_12345678',
  });
  await recordRazorpayCheckoutVerification(
    principal, 'user_user_1', 'sub_12345678', 'pay_12345678', 'captured', 100, 'INR',
  );
  await assert.rejects(
    canUseManagedAgent(principal, 'ws_personal_1'),
    (error: unknown) => error instanceof HttpError && error.status === 402,
  );
});

test('a UID cannot access another workspace merely by changing the workspace ID', async () => {
  const principal = {
    uid: 'user_1',
    email: 'user@example.com',
    displayName: 'User',
    token: { uid: 'user_1' },
  } as unknown as AuthenticatedPrincipal;
  await getAdminFirestore().collection('workspaces').doc('ws_other_1').set({
    name: 'Other workspace', ownerId: 'user_2', organizationId: null, status: 'active',
  });
  await getAdminFirestore().collection('workspaceMembers').doc('ws_other_1_user_2').set({
    workspaceId: 'ws_other_1', uid: 'user_2', role: 'owner', status: 'active',
  });
  await assert.rejects(
    canUseManagedAgent(principal, 'ws_other_1'),
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
    db.collection('billingJobs').doc('reconciliation').set({ cursorBillingSubjectId: 'workspace_a' }),
  ]);
  const tail = await listReconciliationCandidates();
  assert.deepEqual(tail.map((candidate) => candidate.billingSubjectId), ['workspace_b']);
  const wrapped = await listReconciliationCandidates();
  assert.deepEqual(wrapped.map((candidate) => candidate.billingSubjectId), ['workspace_a', 'workspace_b']);
});
