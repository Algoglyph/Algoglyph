import { randomUUID } from 'node:crypto';
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
  NormalizedProviderEvent,
  PlanDefinition,
  PlanKey,
} from './model.js';
import { projectEntitlement } from './model.js';
import { HttpError, requirePersonalWorkspaceAccess, sha256 } from './security.js';
import type { AuthenticatedPrincipal } from './security.js';
import type { CheckoutResult, ProviderSubscriptionSnapshot } from './providers.js';

export interface WorkspaceWire {
  id: string;
  name: string;
  kind: 'individual' | 'organization';
  role: 'owner' | 'billing_admin' | 'member';
  organizationId?: string;
  canManageBilling: boolean;
}

export interface BillingStatusWire {
  workspace: WorkspaceWire;
  planKey: PlanKey | null;
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

const personalWorkspaceId = (uid: string): string => `personal_${uid}`;
const organizationWorkspaceId = (organizationId: string): string => `organization_${organizationId}`;
const ORGANIZATION_ID_PATTERN = /^[A-Za-z0-9_-]{6,80}$/;

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
  requirePersonalWorkspaceAccess(principal, workspaceId);
  const workspaceRef = db.collection('workspaces').doc(workspaceId);
  const memberRef = db.collection('workspaceMembers').doc(`${workspaceId}_${principal.uid}`);

  await db.runTransaction(async (transaction) => {
    const [workspace, member] = await Promise.all([
      transaction.get(workspaceRef),
      transaction.get(memberRef),
    ]);
    if (workspace.exists && workspace.data()?.ownerUid !== principal.uid) {
      throw new HttpError(403, 'Workspace access denied.');
    }
    if (member.exists
      && (member.data()?.uid !== principal.uid
        || member.data()?.workspaceId !== workspaceId
        || member.data()?.role !== 'owner')) {
      throw new HttpError(403, 'Workspace membership is invalid.');
    }
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
    kind: 'individual',
    role: 'owner',
    canManageBilling: true,
  };
};

const resolveOrganizationWorkspace = async (
  principal: AuthenticatedPrincipal,
  organizationId: string,
  requireBillingManager = false,
): Promise<WorkspaceWire> => {
  if (!ORGANIZATION_ID_PATTERN.test(organizationId)) throw new HttpError(400, 'Invalid organization identifier.');
  const db = getFirestore();
  const workspaceId = organizationWorkspaceId(organizationId);
  const organizationRef = db.collection('organizations').doc(organizationId);
  const organizationMemberRef = db.collection('organizationMembers').doc(`${organizationId}_${principal.uid}`);
  const workspaceRef = db.collection('workspaces').doc(workspaceId);
  const workspaceMemberRef = db.collection('workspaceMembers').doc(`${workspaceId}_${principal.uid}`);
  const [organization, organizationMember, workspace, workspaceMember] = await Promise.all([
    organizationRef.get(),
    organizationMemberRef.get(),
    workspaceRef.get(),
    workspaceMemberRef.get(),
  ]);
  const organizationData = organization.data();
  const membership = organizationMember.data();
  const role = membership?.role;
  const validRole = role === 'owner' || role === 'billing_admin' || role === 'member';
  if (!organization.exists
    || organizationData?.status !== 'active'
    || !organizationMember.exists
    || membership?.organizationId !== organizationId
    || membership?.uid !== principal.uid
    || membership?.status !== 'active'
    || !validRole) {
    throw new HttpError(403, 'Organization access denied.');
  }
  const canManageBilling = role === 'owner' || role === 'billing_admin';
  if (requireBillingManager && !canManageBilling) throw new HttpError(403, 'Organization billing access denied.');
  if (!workspace.exists || workspace.data()?.organizationId !== organizationId) {
    throw new HttpError(403, 'Organization workspace is invalid.');
  }
  if (!workspaceMember.exists || workspaceMember.data()?.workspaceId !== workspaceId
    || workspaceMember.data()?.uid !== principal.uid
    || workspaceMember.data()?.status !== 'active') {
    throw new HttpError(403, 'Workspace membership is invalid.');
  }
  return {
    id: workspaceId,
    name: String(organizationData?.name ?? 'Organization'),
    kind: 'organization',
    role,
    organizationId,
    canManageBilling,
  };
};

const resolveBillingWorkspace = async (
  principal: AuthenticatedPrincipal,
  organizationId?: string,
  requireBillingManager = false,
): Promise<WorkspaceWire> => organizationId
  ? resolveOrganizationWorkspace(principal, organizationId, requireBillingManager)
  : ensurePersonalWorkspace(principal);

export const listBillingWorkspaces = async (principal: AuthenticatedPrincipal): Promise<WorkspaceWire[]> => {
  const db = getFirestore();
  const personal = await ensurePersonalWorkspace(principal);
  const memberships = await db.collection('organizationMembers').where('uid', '==', principal.uid).limit(100).get();
  const organizationIds = memberships.docs.flatMap((document) => {
    const data = document.data();
    return data.status === 'active' && typeof data.organizationId === 'string' ? [data.organizationId] : [];
  });
  const organizations = await Promise.all(organizationIds.map(async (organizationId) => {
    try {
      return await resolveOrganizationWorkspace(principal, organizationId);
    } catch {
      return null;
    }
  }));
  return [personal, ...organizations.filter((workspace): workspace is WorkspaceWire => workspace !== null)];
};

export const getBillingStatus = async (
  principal: AuthenticatedPrincipal,
  organizationId?: string,
): Promise<BillingStatusWire> => {
  const db = getFirestore();
  const workspace = await resolveBillingWorkspace(principal, organizationId);
  const [subscription, entitlement] = await Promise.all([
    db.collection('subscriptions').doc(workspace.id).get(),
    db.collection('entitlements').doc(workspace.id).get(),
  ]);
  const subscriptionData = subscription.data();
  const entitlementData = entitlement.data();
  const accessUntil = entitlementData?.accessUntil;
  const accessIsCurrent = accessUntil instanceof Timestamp && accessUntil.toMillis() > Date.now();
  const storedAccess = entitlementData?.managedAgentAccess === true;

  return {
    workspace,
    planKey: typeof subscriptionData?.planKey === 'string' ? subscriptionData.planKey as PlanKey : null,
    provider: subscriptionData?.provider === 'stripe' || subscriptionData?.provider === 'razorpay'
      ? subscriptionData.provider
      : null,
    providerStatus: typeof subscriptionData?.providerStatus === 'string' ? subscriptionData.providerStatus : null,
    entitlement: {
      managedAgentAccess: storedAccess && accessIsCurrent,
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
  organizationId?: string,
): Promise<{ workspace: WorkspaceWire; attemptId: string; existingCustomerId?: string }> => {
  const db = getFirestore();
  const workspace = await resolveBillingWorkspace(principal, organizationId, true);
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
    const activeAccess = entitlement.data()?.managedAgentAccess === true
      && accessUntil instanceof Timestamp
      && accessUntil.toMillis() > Date.now();
    const pendingUntil = current?.checkoutPendingUntil;
    const checkoutPending = pendingUntil instanceof Timestamp && pendingUntil.toMillis() > Date.now();
    if (activeAccess || checkoutPending) {
      throw new HttpError(409, 'This workspace already has an active or pending subscription.');
    }
    transaction.set(subscriptionRef, {
      workspaceId: workspace.id,
      billingSubjectType: workspace.kind,
      billingSubjectId: workspace.id,
      purchaserUid: principal.uid,
      ...(workspace.kind === 'individual' ? { ownerUid: principal.uid } : { organizationId: workspace.organizationId }),
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
  workspace: WorkspaceWire,
  attemptId: string,
  plan: PlanDefinition,
  result: CheckoutResult,
): Promise<void> => {
  if (result.provider !== plan.provider) throw new HttpError(500, 'Billing provider mismatch.');
  await resolveBillingWorkspace(principal, workspace.organizationId, true);
  const workspaceId = workspace.id;
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
      ...(result.providerCheckoutId ? { providerCheckoutId: result.providerCheckoutId } : {}),
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

export const subscriptionForRazorpayVerification = async (
  principal: AuthenticatedPrincipal,
  suppliedSubscriptionId: string,
  organizationId?: string,
): Promise<{ workspaceId: string; planKey: PlanKey; providerSubscriptionId: string }> => {
  const workspace = await resolveBillingWorkspace(principal, organizationId, true);
  const snapshot = await getFirestore().collection('subscriptions').doc(workspace.id).get();
  const data = snapshot.data();
  if (data?.provider !== 'razorpay'
    || typeof data.providerSubscriptionId !== 'string'
    || data.providerSubscriptionId !== suppliedSubscriptionId
    || data.billingSubjectId !== workspace.id
    || (data.planKey !== 'pro_monthly' && data.planKey !== 'pro_annual')) {
    throw new HttpError(403, 'Payment verification does not match this account checkout.');
  }
  return {
    workspaceId: workspace.id,
    planKey: data.planKey,
    providerSubscriptionId: data.providerSubscriptionId,
  };
};

export const recordRazorpayCheckoutVerification = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
  providerSubscriptionId: string,
  paymentId: string,
  paymentStatus: string,
  amount: number,
  currency: string,
): Promise<void> => {
  const db = getFirestore();
  const subscriptionRef = db.collection('subscriptions').doc(workspaceId);
  await db.runTransaction(async (transaction) => {
    const subscription = await transaction.get(subscriptionRef);
    const data = subscription.data();
    if (data?.provider !== 'razorpay'
      || data?.providerSubscriptionId !== providerSubscriptionId) {
      throw new HttpError(403, 'Payment verification does not match this account checkout.');
    }
    transaction.set(subscriptionRef, {
      callbackVerifiedAt: FieldValue.serverTimestamp(),
      callbackPaymentIdHash: sha256(paymentId),
      callbackPaymentStatus: paymentStatus,
      callbackAmount: amount,
      callbackCurrency: currency,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    transaction.create(db.collection('auditLogs').doc(), audit(
      'billing.razorpay_callback_verified', workspaceId, principal.uid,
      { providerSubscriptionIdHash: sha256(providerSubscriptionId), paymentStatus, amount, currency },
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
  organizationId?: string,
): Promise<{ workspaceId: string; provider: BillingProvider; providerSubscriptionId: string }> => {
  const workspace = await resolveBillingWorkspace(principal, organizationId, true);
  const snapshot = await getFirestore().collection('subscriptions').doc(workspace.id).get();
  const data = snapshot.data();
  if ((data?.provider !== 'stripe' && data?.provider !== 'razorpay')
    || typeof data.providerSubscriptionId !== 'string'
    || data.billingSubjectId !== workspace.id) {
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
  if (event.transition === 'recover') {
    const prior = current?.lastProviderEventAt;
    return current?.terminalRevocationReason === 'dispute'
      && current.provider === event.provider
      && current.providerSubscriptionId === event.providerSubscriptionId
      && (!(prior instanceof Timestamp) || event.occurredAtMs >= prior.toMillis());
  }
  const terminallyRevokedSameSubscription = current?.terminalRevocationAt instanceof Timestamp
    && current.provider === event.provider
    && current.providerSubscriptionId === event.providerSubscriptionId;
  if (terminallyRevokedSameSubscription) return false;
  const prior = current?.lastProviderEventAt;
  return !(prior instanceof Timestamp) || event.occurredAtMs >= prior.toMillis();
};

const isProviderEventBound = (current: DocumentData | undefined, event: NormalizedProviderEvent): boolean => {
  if (!current || current.provider !== event.provider) return false;
  if (typeof current.planKey === 'string' && event.planKey && current.planKey !== event.planKey) return false;
  if (typeof current.providerCustomerId === 'string'
    && event.providerCustomerId
    && current.providerCustomerId !== event.providerCustomerId) return false;
  if (current.providerSubscriptionId === event.providerSubscriptionId) return true;
  return event.provider === 'stripe'
    && event.eventType === 'checkout.session.completed'
    && typeof current.providerCheckoutId === 'string'
    && current.providerCheckoutId === event.providerCheckoutId
    && typeof current.providerCustomerId === 'string'
    && current.providerCustomerId === event.providerCustomerId;
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
    if (!isProviderEventBound(current, event)) {
      transaction.set(eventRef, {
        processingStatus: 'processed',
        outcome: 'unbound_event',
        processedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      transaction.create(db.collection('auditLogs').doc(), audit(
        'billing.unbound_provider_event', event.workspaceId, 'webhook',
        { provider: event.provider, eventType: event.eventType },
      ));
      return 'conflict';
    }
    const currentProvider = current?.provider;
    const currentAccessUntil = entitlement.data()?.accessUntil;
    const activeDifferentProvider = currentProvider
      && currentProvider !== event.provider
      && current?.providerSubscriptionId
      && entitlement.data()?.managedAgentAccess === true
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
    const priorAccessUntil = entitlement.data()?.accessUntil;
    const priorEntitlementStatus = entitlement.data()?.status;
    const hadActivatedSubscription = current?.hasActivated === true
      || (
        entitlement.data()?.managedAgentAccess === true
        && ['active', 'canceled'].includes(priorEntitlementStatus)
      )
      || (
        entitlement.data()?.managedAgentAccess === true
        && priorEntitlementStatus === 'grace'
        && priorAccessUntil instanceof Timestamp
        && priorAccessUntil.toMillis() > Date.now()
      );
    const projection = projectEntitlement(effectiveEvent, Date.now(), hadActivatedSubscription);
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
      hasActivated: current?.hasActivated === true
        || event.transition === 'activate'
        || event.transition === 'renewed',
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
      managedAgentAccess: projection.managedAgentAccess,
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

const currentManagedAgentEntitlement = (data: DocumentData | undefined): boolean => {
  const accessUntil = data?.accessUntil;
  return data?.managedAgentAccess === true
    && accessUntil instanceof Timestamp
    && accessUntil.toMillis() > Date.now();
};

export const canUseManagedAgent = async (
  principal: AuthenticatedPrincipal,
  workspaceId: string,
): Promise<{
  managedAgentAccess: true;
  source: 'individual' | 'organization';
  subjectId: string;
  accessUntil: string;
}> => {
  const db = getFirestore();
  let organizationId: string | undefined;
  if (workspaceId === personalWorkspaceId(principal.uid)) {
    await ensurePersonalWorkspace(principal);
  } else if (workspaceId.startsWith('organization_')) {
    organizationId = workspaceId.slice('organization_'.length);
    const organizationWorkspace = await resolveOrganizationWorkspace(principal, organizationId);
    if (organizationWorkspace.id !== workspaceId) throw new HttpError(403, 'Workspace access denied.');
  } else {
    throw new HttpError(403, 'Workspace access denied.');
  }

  const individualSubjectId = personalWorkspaceId(principal.uid);
  const individual = await db.collection('entitlements').doc(individualSubjectId).get();
  if (currentManagedAgentEntitlement(individual.data())) {
    return {
      managedAgentAccess: true,
      source: 'individual',
      subjectId: individualSubjectId,
      accessUntil: timestampToIso(individual.data()?.accessUntil) as string,
    };
  }
  if (organizationId) {
    const organizationSubjectId = organizationWorkspaceId(organizationId);
    const organization = await db.collection('entitlements').doc(organizationSubjectId).get();
    if (currentManagedAgentEntitlement(organization.data())) {
      return {
        managedAgentAccess: true,
        source: 'organization',
        subjectId: organizationSubjectId,
        accessUntil: timestampToIso(organization.data()?.accessUntil) as string,
      };
    }
  }
  throw new HttpError(402, 'An active managed-agent subscription is required.');
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
    .where('managedAgentAccess', '==', true)
    .where('accessUntil', '<=', now)
    .limit(250)
    .get();
  if (snapshot.empty) return 0;
  const batch = db.batch();
  for (const document of snapshot.docs) {
    batch.set(document.ref, {
      managedAgentAccess: false,
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
