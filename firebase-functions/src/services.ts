import { randomBytes, randomUUID } from 'node:crypto';
import {
  FieldPath,
  FieldValue,
  getFirestore,
  Timestamp,
  type DocumentData,
} from 'firebase-admin/firestore';
import type {
  BillingProvider,
  EntitlementStatus,
  McpScope,
  NormalizedProviderEvent,
  PlanDefinition,
  PlanKey,
} from './model.js';
import {
  CONNECTOR_GRANT_TTL_MS,
  isMcpScope,
  projectEntitlement,
} from './model.js';
import { HttpError, sha256 } from './security.js';
import type { AuthenticatedPrincipal } from './security.js';
import type { CheckoutResult, ProviderSubscriptionSnapshot } from './providers.js';

export interface WorkspaceWire {
  id: string;
  name: string;
  role: 'owner';
}

export interface BillingStatusWire {
  workspace: WorkspaceWire;
  planKey: PlanKey | null;
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

export interface ConnectorGrantInput {
  pairingCredentialHash: string;
  origin: string;
  connectorVersion: string;
  requestedScopes: McpScope[];
}

export interface ConnectorGrantResult {
  entitlementGrant: string;
  expiresAt: string;
}

export interface RedeemGrantInput extends ConnectorGrantInput {
  entitlementGrant: string;
}

const personalWorkspaceId = (uid: string): string => `personal_${uid}`;

const timestampToIso = (value: unknown): string | null =>
  value instanceof Timestamp ? value.toDate().toISOString() : null;

const audit = (
  action: string,
  workspaceId: string,
  actor: string,
  metadata: Record<string, unknown> = {},
): DocumentData => ({
  action,
  workspaceId,
  actor,
  metadata,
  createdAt: FieldValue.serverTimestamp(),
});

export const ensurePersonalWorkspace = async (
  principal: AuthenticatedPrincipal,
): Promise<WorkspaceWire> => {
  const db = getFirestore();
  const workspaceId = personalWorkspaceId(principal.uid);
  const workspaceRef = db.collection('workspaces').doc(workspaceId);
  const memberRef = db.collection('workspaceMembers').doc(`${workspaceId}_${principal.uid}`);

  await db.runTransaction(async (transaction) => {
    const [workspace, member] = await Promise.all([
      transaction.get(workspaceRef),
      transaction.get(memberRef),
    ]);
    if (!workspace.exists) {
      transaction.create(workspaceRef, {
        ownerUid: principal.uid,
        displayName: principal.displayName ? `${principal.displayName}'s workspace` : 'Personal workspace',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    if (!member.exists) {
      transaction.create(memberRef, {
        workspaceId,
        uid: principal.uid,
        role: 'owner',
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  });

  const workspace = await workspaceRef.get();
  return {
    id: workspaceId,
    name: String(workspace.data()?.displayName ?? 'Personal workspace'),
    role: 'owner',
  };
};

export const getBillingStatus = async (
  principal: AuthenticatedPrincipal,
): Promise<BillingStatusWire> => {
  const db = getFirestore();
  const workspace = await ensurePersonalWorkspace(principal);
  const [subscription, entitlement] = await Promise.all([
    db.collection('subscriptions').doc(workspace.id).get(),
    db.collection('entitlements').doc(workspace.id).get(),
  ]);
  const subscriptionData = subscription.data();
  const entitlementData = entitlement.data();
  const accessUntil = entitlementData?.accessUntil;
  const accessIsCurrent = accessUntil instanceof Timestamp && accessUntil.toMillis() > Date.now();
  const storedAccess = entitlementData?.mcpAccess === true;

  return {
    workspace,
    planKey: typeof subscriptionData?.planKey === 'string' ? subscriptionData.planKey as PlanKey : null,
    provider: subscriptionData?.provider === 'stripe' || subscriptionData?.provider === 'razorpay'
      ? subscriptionData.provider
      : null,
    providerStatus: typeof subscriptionData?.providerStatus === 'string' ? subscriptionData.providerStatus : null,
    entitlement: {
      mcpAccess: storedAccess && accessIsCurrent,
      status: typeof entitlementData?.status === 'string' ? entitlementData.status as EntitlementStatus : 'locked',
      currentPeriodEnd: timestampToIso(entitlementData?.currentPeriodEnd),
      gracePeriodEnd: timestampToIso(entitlementData?.gracePeriodEnd),
      accessUntil: timestampToIso(accessUntil),
      cancelAtPeriodEnd: entitlementData?.cancelAtPeriodEnd === true,
      version: Number(entitlementData?.version ?? 0),
    },
  };
};

export const reserveCheckout = async (
  principal: AuthenticatedPrincipal,
  plan: PlanDefinition,
): Promise<{ workspace: WorkspaceWire; attemptId: string; existingCustomerId?: string }> => {
  const db = getFirestore();
  const workspace = await ensurePersonalWorkspace(principal);
  const subscriptionRef = db.collection('subscriptions').doc(workspace.id);
  const entitlementRef = db.collection('entitlements').doc(workspace.id);
  const customerRef = db.collection('billingCustomers').doc(`${workspace.id}_${plan.provider}`);
  const attemptId = randomUUID();

  const existingCustomerId = await db.runTransaction(async (transaction) => {
    const [subscription, entitlement, customer] = await Promise.all([
      transaction.get(subscriptionRef),
      transaction.get(entitlementRef),
      transaction.get(customerRef),
    ]);
    const current = subscription.data();
    const accessUntil = entitlement.data()?.accessUntil;
    const activeAccess = entitlement.data()?.mcpAccess === true
      && accessUntil instanceof Timestamp
      && accessUntil.toMillis() > Date.now();
    const pendingUntil = current?.checkoutPendingUntil;
    const checkoutPending = pendingUntil instanceof Timestamp && pendingUntil.toMillis() > Date.now();
    if (activeAccess || checkoutPending) {
      throw new HttpError(409, 'This workspace already has an active or pending subscription.');
    }
    transaction.set(subscriptionRef, {
      workspaceId: workspace.id,
      ownerUid: principal.uid,
      provider: plan.provider,
      planKey: plan.key,
      providerStatus: 'checkout_pending',
      checkoutAttemptId: attemptId,
      checkoutPendingUntil: Timestamp.fromMillis(Date.now() + 15 * 60 * 1_000),
      createdAt: current?.createdAt ?? FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.create(db.collection('auditLogs').doc(), audit(
      'billing.checkout_reserved',
      workspace.id,
      principal.uid,
      { planKey: plan.key, provider: plan.provider, attemptId },
    ));
    return typeof customer.data()?.providerCustomerId === 'string'
      ? customer.data()?.providerCustomerId as string
      : undefined;
  });

  return { workspace, attemptId, existingCustomerId };
};

export const completeCheckout = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  attemptId: string,
  plan: PlanDefinition,
  result: CheckoutResult,
): Promise<void> => {
  const db = getFirestore();
  const subscriptionRef = db.collection('subscriptions').doc(workspaceId);
  await db.runTransaction(async (transaction) => {
    const customerRef = result.providerCustomerId
      ? db.collection('billingCustomers').doc(`${workspaceId}_${result.provider}`)
      : null;
    const [subscription, customer] = await Promise.all([
      transaction.get(subscriptionRef),
      customerRef ? transaction.get(customerRef) : Promise.resolve(null),
    ]);
    if (subscription.data()?.checkoutAttemptId !== attemptId) {
      throw new HttpError(409, 'The checkout reservation is no longer valid.');
    }
    transaction.set(subscriptionRef, {
      provider: result.provider,
      planKey: plan.key,
      providerStatus: 'payment_verification_pending',
      ...(result.providerSubscriptionId ? { providerSubscriptionId: result.providerSubscriptionId } : {}),
      ...(result.providerCustomerId ? { providerCustomerId: result.providerCustomerId } : {}),
      checkoutPendingUntil: Timestamp.fromMillis(Date.now() + 60 * 60 * 1_000),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    if (result.providerCustomerId && customerRef) {
      transaction.set(customerRef, {
        workspaceId,
        provider: result.provider,
        providerCustomerId: result.providerCustomerId,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: customer?.data()?.createdAt ?? FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    transaction.create(db.collection('auditLogs').doc(), audit(
      'billing.checkout_created',
      workspaceId,
      principal.uid,
      { planKey: plan.key, provider: result.provider, attemptId },
    ));
  });
};

export const releaseCheckout = async (workspaceId: string, attemptId: string): Promise<void> => {
  const db = getFirestore();
  const ref = db.collection('subscriptions').doc(workspaceId);
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.data()?.checkoutAttemptId !== attemptId) return;
    transaction.set(ref, {
      providerStatus: 'checkout_failed',
      checkoutPendingUntil: Timestamp.fromMillis(0),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
};

export const subscriptionForCancellation = async (
  principal: AuthenticatedPrincipal,
): Promise<{ workspaceId: string; provider: BillingProvider; providerSubscriptionId: string }> => {
  const workspace = await ensurePersonalWorkspace(principal);
  const snapshot = await getFirestore().collection('subscriptions').doc(workspace.id).get();
  const data = snapshot.data();
  if ((data?.provider !== 'stripe' && data?.provider !== 'razorpay')
    || typeof data.providerSubscriptionId !== 'string') {
    throw new HttpError(409, 'There is no cancellable subscription for this workspace.');
  }
  return {
    workspaceId: workspace.id,
    provider: data.provider,
    providerSubscriptionId: data.providerSubscriptionId,
  };
};

export const markCancellationRequested = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
): Promise<void> => {
  const db = getFirestore();
  await Promise.all([
    db.collection('subscriptions').doc(workspaceId).set({
      cancelAtPeriodEnd: true,
      cancellationRequestedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
    db.collection('auditLogs').add(audit('billing.cancellation_requested', workspaceId, principal.uid)),
  ]);
};

const shouldApplyProviderEvent = (
  current: DocumentData | undefined,
  event: NormalizedProviderEvent,
): boolean => {
  if (event.transition === 'revoke') return true;
  const terminallyRevokedSameSubscription = current?.terminalRevocationAt instanceof Timestamp
    && current.provider === event.provider
    && current.providerSubscriptionId === event.providerSubscriptionId;
  if (terminallyRevokedSameSubscription) return false;
  const prior = current?.lastProviderEventAt;
  return !(prior instanceof Timestamp) || event.occurredAtMs >= prior.toMillis();
};

export const applyProviderEvent = async (
  event: NormalizedProviderEvent,
  rawPayloadHash: string,
): Promise<'processed' | 'duplicate' | 'stale' | 'conflict'> => {
  const db = getFirestore();
  const eventRef = db.collection('paymentEvents').doc(sha256(`${event.provider}:${event.eventId}`));
  const intake = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(eventRef);
    if (snapshot.exists && snapshot.data()?.rawPayloadHash !== rawPayloadHash) {
      transaction.create(db.collection('auditLogs').doc(), audit(
        'billing.event_payload_conflict', event.workspaceId, 'webhook',
        { provider: event.provider, eventType: event.eventType, providerEventIdHash: sha256(event.eventId) },
      ));
      return 'conflict' as const;
    }
    if (snapshot.exists && snapshot.data()?.processingStatus === 'processed') return 'duplicate' as const;
    if (!snapshot.exists) {
      transaction.create(eventRef, {
        provider: event.provider,
        providerEventId: event.eventId,
        eventType: event.eventType,
        workspaceId: event.workspaceId,
        providerSubscriptionId: event.providerSubscriptionId,
        occurredAt: Timestamp.fromMillis(event.occurredAtMs),
        rawPayloadHash,
        processingStatus: 'received',
        receivedAt: FieldValue.serverTimestamp(),
      });
    }
    return 'process' as const;
  });
  if (intake !== 'process') return intake;

  return db.runTransaction(async (transaction) => {
    const subscriptionRef = db.collection('subscriptions').doc(event.workspaceId);
    const entitlementRef = db.collection('entitlements').doc(event.workspaceId);
    const [eventSnapshot, subscription, entitlement] = await Promise.all([
      transaction.get(eventRef),
      transaction.get(subscriptionRef),
      transaction.get(entitlementRef),
    ]);
    if (eventSnapshot.data()?.processingStatus === 'processed') return 'duplicate';
    const current = subscription.data();
    const currentProvider = current?.provider;
    const currentAccessUntil = entitlement.data()?.accessUntil;
    const activeDifferentProvider = currentProvider
      && currentProvider !== event.provider
      && current?.providerSubscriptionId
      && entitlement.data()?.mcpAccess === true
      && currentAccessUntil instanceof Timestamp
      && currentAccessUntil.toMillis() > Date.now();
    if (activeDifferentProvider) {
      transaction.set(eventRef, {
        processingStatus: 'processed',
        outcome: 'provider_conflict',
        processedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.create(db.collection('auditLogs').doc(), audit(
        'billing.provider_conflict', event.workspaceId, 'webhook',
        { provider: event.provider, eventType: event.eventType },
      ));
      return 'conflict';
    }
    if (!shouldApplyProviderEvent(current, event)) {
      transaction.set(eventRef, {
        processingStatus: 'processed',
        outcome: 'stale_ignored',
        processedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return 'stale';
    }

    const effectiveEvent: NormalizedProviderEvent = {
      ...event,
      planKey: event.planKey ?? (typeof current?.planKey === 'string' ? current.planKey as PlanKey : undefined),
      currentPeriodEndMs: event.currentPeriodEndMs
        ?? (current?.currentPeriodEnd instanceof Timestamp ? current.currentPeriodEnd.toMillis() : undefined),
    };
    const projection = projectEntitlement(effectiveEvent, Date.now());
    const existingGraceEnd = entitlement.data()?.gracePeriodEnd;
    if (projection.status === 'grace' && existingGraceEnd instanceof Timestamp) {
      projection.gracePeriodEndMs = existingGraceEnd.toMillis();
      projection.accessUntilMs = existingGraceEnd.toMillis();
    }
    const nextVersion = Number(entitlement.data()?.version ?? 0) + 1;

    transaction.set(subscriptionRef, {
      workspaceId: event.workspaceId,
      provider: event.provider,
      providerSubscriptionId: event.providerSubscriptionId,
      ...(event.providerCustomerId ? { providerCustomerId: event.providerCustomerId } : {}),
      ...(effectiveEvent.planKey ? { planKey: effectiveEvent.planKey } : {}),
      providerStatus: event.providerStatus,
      cancelAtPeriodEnd: event.cancelAtPeriodEnd,
      ...(effectiveEvent.currentPeriodEndMs
        ? { currentPeriodEnd: Timestamp.fromMillis(effectiveEvent.currentPeriodEndMs) }
        : {}),
      lastProviderEventAt: Timestamp.fromMillis(event.occurredAtMs),
      lastProviderEventId: event.eventId,
      terminalRevocationAt: event.transition === 'revoke'
        ? Timestamp.fromMillis(event.occurredAtMs)
        : FieldValue.delete(),
      terminalRevocationReason: event.transition === 'revoke'
        ? event.revocationReason ?? 'security'
        : FieldValue.delete(),
      checkoutPendingUntil: Timestamp.fromMillis(0),
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: current?.createdAt ?? FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(entitlementRef, {
      workspaceId: event.workspaceId,
      mcpAccess: projection.mcpAccess,
      status: projection.status,
      sourceSubscription: subscriptionRef.path,
      sourceProvider: event.provider,
      sourceProviderSubscriptionId: event.providerSubscriptionId,
      currentPeriodEnd: projection.currentPeriodEndMs
        ? Timestamp.fromMillis(projection.currentPeriodEndMs)
        : FieldValue.delete(),
      gracePeriodEnd: projection.gracePeriodEndMs
        ? Timestamp.fromMillis(projection.gracePeriodEndMs)
        : FieldValue.delete(),
      accessUntil: projection.accessUntilMs
        ? Timestamp.fromMillis(projection.accessUntilMs)
        : Timestamp.fromMillis(Date.now()),
      cancelAtPeriodEnd: projection.cancelAtPeriodEnd,
      revocationReason: projection.revocationReason ?? FieldValue.delete(),
      version: nextVersion,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.set(eventRef, {
      processingStatus: 'processed',
      outcome: 'applied',
      entitlementVersion: nextVersion,
      processedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.create(db.collection('auditLogs').doc(), audit(
      'billing.entitlement_changed', event.workspaceId, 'webhook',
      { eventType: event.eventType, status: projection.status, version: nextVersion },
    ));
    return 'processed';
  });
};

export const createConnectorGrant = async (
  principal: AuthenticatedPrincipal,
  input: ConnectorGrantInput,
): Promise<ConnectorGrantResult> => {
  const db = getFirestore();
  const workspace = await ensurePersonalWorkspace(principal);
  const rawGrant = randomBytes(32).toString('base64url');
  const grantHash = sha256(rawGrant);
  const expiresAtMs = Date.now() + CONNECTOR_GRANT_TTL_MS;
  const entitlementRef = db.collection('entitlements').doc(workspace.id);
  const grantRef = db.collection('connectorGrants').doc(grantHash);

  await db.runTransaction(async (transaction) => {
    const entitlement = await transaction.get(entitlementRef);
    const accessUntil = entitlement.data()?.accessUntil;
    if (entitlement.data()?.mcpAccess !== true
      || !(accessUntil instanceof Timestamp)
      || accessUntil.toMillis() <= Date.now()) {
      throw new HttpError(402, 'A paid MCP entitlement is required.');
    }
    transaction.create(grantRef, {
      grantHash,
      workspaceId: workspace.id,
      ownerUid: principal.uid,
      pairingCredentialHash: input.pairingCredentialHash,
      origin: input.origin,
      connectorVersion: input.connectorVersion,
      requestedScopes: input.requestedScopes,
      entitlementVersion: Number(entitlement.data()?.version ?? 0),
      entitlementExpiresAt: accessUntil,
      expiresAt: Timestamp.fromMillis(expiresAtMs),
      consumedAt: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.create(db.collection('auditLogs').doc(), audit(
      'connector.grant_created', workspace.id, principal.uid,
      { connectorVersion: input.connectorVersion, scopes: input.requestedScopes },
    ));
  });

  return { entitlementGrant: rawGrant, expiresAt: new Date(expiresAtMs).toISOString() };
};

export const redeemConnectorGrant = async (
  input: RedeemGrantInput,
): Promise<{ workspaceId: string; allowedScopes: McpScope[]; entitlementExpiresAt: string; entitlementVersion: number }> => {
  const db = getFirestore();
  const grantHash = sha256(input.entitlementGrant);
  const grantRef = db.collection('connectorGrants').doc(grantHash);

  return db.runTransaction(async (transaction) => {
    const grant = await transaction.get(grantRef);
    const data = grant.data();
    if (!grant.exists || !data || data.consumedAt) throw new HttpError(401, 'The connector grant is invalid or already used.');
    if (!(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now()) {
      throw new HttpError(410, 'The connector grant has expired.');
    }
    const requestedScopes = Array.isArray(data.requestedScopes)
      ? data.requestedScopes.filter(isMcpScope)
      : [];
    const bindingsMatch = data.pairingCredentialHash === input.pairingCredentialHash
      && data.origin === input.origin
      && data.connectorVersion === input.connectorVersion
      && JSON.stringify(requestedScopes) === JSON.stringify(input.requestedScopes);
    if (!bindingsMatch) throw new HttpError(403, 'The connector grant binding does not match.');

    const entitlementRef = db.collection('entitlements').doc(String(data.workspaceId));
    const entitlement = await transaction.get(entitlementRef);
    const accessUntil = entitlement.data()?.accessUntil;
    if (entitlement.data()?.mcpAccess !== true
      || !(accessUntil instanceof Timestamp)
      || accessUntil.toMillis() <= Date.now()) {
      throw new HttpError(402, 'A paid MCP entitlement is required.');
    }
    const version = Number(entitlement.data()?.version ?? 0);
    transaction.set(grantRef, {
      consumedAt: FieldValue.serverTimestamp(),
      consumedEntitlementVersion: version,
    }, { merge: true });
    transaction.create(db.collection('auditLogs').doc(), audit(
      'connector.paid_session_authorized', String(data.workspaceId), 'connector',
      { connectorVersion: input.connectorVersion, scopes: requestedScopes, entitlementVersion: version },
    ));
    return {
      workspaceId: String(data.workspaceId),
      allowedScopes: requestedScopes,
      entitlementExpiresAt: accessUntil.toDate().toISOString(),
      entitlementVersion: version,
    };
  });
};

export const listReconciliationCandidates = async (): Promise<Array<{
  workspaceId: string;
  provider: BillingProvider;
  providerSubscriptionId: string;
  planKey?: PlanKey;
}>> => {
  const db = getFirestore();
  const cursorRef = db.collection('billingJobs').doc('reconciliation');
  const cursor = await cursorRef.get();
  const cursorWorkspaceId = typeof cursor.data()?.cursorWorkspaceId === 'string'
    ? cursor.data()?.cursorWorkspaceId as string
    : null;
  const baseQuery = db.collection('subscriptions').orderBy(FieldPath.documentId()).limit(250);
  let snapshot = cursorWorkspaceId
    ? await baseQuery.startAfter(cursorWorkspaceId).get()
    : await baseQuery.get();
  if (snapshot.empty && cursorWorkspaceId) snapshot = await baseQuery.get();
  await cursorRef.set({
    cursorWorkspaceId: snapshot.docs.at(-1)?.id ?? null,
    scannedAt: FieldValue.serverTimestamp(),
    candidateCount: snapshot.size,
  }, { merge: true });
  return snapshot.docs.flatMap((document) => {
    const data = document.data();
    if ((data.provider !== 'stripe' && data.provider !== 'razorpay')
      || typeof data.providerSubscriptionId !== 'string') return [];
    return [{
      workspaceId: document.id,
      provider: data.provider,
      providerSubscriptionId: data.providerSubscriptionId,
      planKey: typeof data.planKey === 'string' ? data.planKey as PlanKey : undefined,
    }];
  });
};

export const applyReconciliationSnapshot = async (
  candidate: { workspaceId: string; planKey?: PlanKey },
  snapshot: ProviderSubscriptionSnapshot,
): Promise<void> => {
  const now = Date.now();
  await applyProviderEvent({
    provider: snapshot.provider,
    eventId: `reconcile_${snapshot.providerSubscriptionId}_${Math.floor(now / 3_600_000)}`,
    eventType: 'subscription.reconciled',
    occurredAtMs: now,
    workspaceId: candidate.workspaceId,
    providerSubscriptionId: snapshot.providerSubscriptionId,
    providerCustomerId: snapshot.providerCustomerId,
    planKey: candidate.planKey,
    providerStatus: snapshot.providerStatus,
    currentPeriodEndMs: snapshot.currentPeriodEndMs,
    cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
    transition: snapshot.transition,
  }, sha256(JSON.stringify(snapshot)));
};

export const expireElapsedEntitlements = async (): Promise<number> => {
  const db = getFirestore();
  const now = Timestamp.now();
  const snapshot = await db.collection('entitlements')
    .where('mcpAccess', '==', true)
    .where('accessUntil', '<=', now)
    .limit(250)
    .get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  for (const document of snapshot.docs) {
    batch.set(document.ref, {
      mcpAccess: false,
      status: 'locked',
      revocationReason: 'expired',
      version: Number(document.data().version ?? 0) + 1,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    batch.create(db.collection('auditLogs').doc(), audit(
      'billing.entitlement_expired', document.id, 'scheduler',
    ));
  }
  await batch.commit();
  return snapshot.size;
};
