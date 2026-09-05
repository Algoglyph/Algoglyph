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
import { HttpError, sha256 } from './security.js';
import type { AuthenticatedPrincipal } from './security.js';
import type { CheckoutResult, ProviderSubscriptionSnapshot } from './providers.js';
import {
  listOrganizations,
  requireOrganizationAccess,
  requireWorkspaceAccess,
  upsertIdentity,
} from './workspaces.js';

export interface BillingSubjectWire {
  id: string;
  name: string;
  kind: 'individual' | 'organization';
  role: 'owner' | 'admin' | 'billing_admin' | 'member';
  organizationId?: string;
  canManageBilling: boolean;
}

export interface BillingStatusWire {
  subject: BillingSubjectWire;
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

export const personalBillingSubjectId = (uid: string): string => `user_${uid}`;
export const organizationBillingSubjectId = (organizationId: string): string => `organization_${organizationId}`;

const timestampToIso = (value: unknown): string | null =>
  value instanceof Timestamp ? value.toDate().toISOString() : null;

const audit = (
  action: string,
  billingSubjectId: string,
  actor: string,
  metadata: Record<string, unknown> = {},
): DocumentData => ({
  action,
  billingSubjectId,
  actor,
  metadata,
  createdAt: FieldValue.serverTimestamp(),
});

export const ensurePersonalBillingSubject = async (
  principal: AuthenticatedPrincipal,
): Promise<BillingSubjectWire> => {
  await upsertIdentity(principal);
  return {
    id: personalBillingSubjectId(principal.uid),
    name: principal.displayName ? `${principal.displayName}'s account` : 'Personal account',
    kind: 'individual',
    role: 'owner',
    canManageBilling: true,
  };
};

const resolveOrganizationBillingSubject = async (
  principal: AuthenticatedPrincipal,
  organizationId: string,
  requireBillingManager = false,
): Promise<BillingSubjectWire> => {
  const { organization, role } = await requireOrganizationAccess(
    principal,
    organizationId,
    { billing: requireBillingManager },
  );
  const canManageBilling = role === 'owner' || role === 'billing_admin';
  return {
    id: organizationBillingSubjectId(organizationId),
    name: String(organization.name ?? 'Organization'),
    kind: 'organization',
    role,
    organizationId,
    canManageBilling,
  };
};

const resolveBillingSubject = async (
  principal: AuthenticatedPrincipal,
  organizationId?: string,
  requireBillingManager = false,
): Promise<BillingSubjectWire> => organizationId
  ? resolveOrganizationBillingSubject(principal, organizationId, requireBillingManager)
  : ensurePersonalBillingSubject(principal);

export const listBillingSubjects = async (principal: AuthenticatedPrincipal): Promise<BillingSubjectWire[]> => {
  const personal = await ensurePersonalBillingSubject(principal);
  const organizations = await listOrganizations(principal);
  return [personal, ...organizations.map((organization) => ({
    id: organizationBillingSubjectId(organization.id),
    name: organization.name,
    kind: 'organization' as const,
    role: organization.role,
    organizationId: organization.id,
    canManageBilling: organization.role === 'owner' || organization.role === 'billing_admin',
  }))];
};

export const getBillingStatus = async (
  principal: AuthenticatedPrincipal,
  organizationId?: string,
): Promise<BillingStatusWire> => {
  const db = getFirestore();
  const subject = await resolveBillingSubject(principal, organizationId);
  const [subscription, entitlement] = await Promise.all([
    db.collection('subscriptions').doc(subject.id).get(),
    db.collection('entitlements').doc(subject.id).get(),
  ]);
  const subscriptionData = subscription.data();
  const entitlementData = entitlement.data();
  const accessUntil = entitlementData?.accessUntil;
  const accessIsCurrent = accessUntil instanceof Timestamp && accessUntil.toMillis() > Date.now();
  const storedAccess = entitlementData?.managedAgentAccess === true;

  return {
    subject,
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
): Promise<{ subject: BillingSubjectWire; attemptId: string; existingCustomerId?: string }> => {
  const db = getFirestore();
  const subject = await resolveBillingSubject(principal, organizationId, true);
  const subscriptionRef = db.collection('subscriptions').doc(subject.id);
  const entitlementRef = db.collection('entitlements').doc(subject.id);
  const customerRef = db.collection('billingCustomers').doc(`${subject.id}_${plan.provider}`);
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
      throw new HttpError(409, 'This billing subject already has an active or pending subscription.');
    }
    transaction.set(subscriptionRef, {
      billingSubjectType: subject.kind,
      billingSubjectId: subject.id,
      purchaserUid: principal.uid,
      ...(subject.kind === 'individual' ? { ownerUid: principal.uid } : { organizationId: subject.organizationId }),
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
      subject.id,
      principal.uid,
      { planKey: plan.key, provider: plan.provider, attemptId },
    ));
    return typeof customer.data()?.providerCustomerId === 'string'
      ? customer.data()?.providerCustomerId as string
      : undefined;
  });

  return { subject, attemptId, existingCustomerId };
};

export const completeCheckout = async (
  principal: AuthenticatedPrincipal,
  subject: BillingSubjectWire,
  attemptId: string,
  plan: PlanDefinition,
  result: CheckoutResult,
): Promise<void> => {
  if (result.provider !== plan.provider) throw new HttpError(500, 'Billing provider mismatch.');
  await resolveBillingSubject(principal, subject.organizationId, true);
  const billingSubjectId = subject.id;
  const db = getFirestore();
  const subscriptionRef = db.collection('subscriptions').doc(billingSubjectId);
  await db.runTransaction(async (transaction) => {
    const customerRef = result.providerCustomerId
      ? db.collection('billingCustomers').doc(`${billingSubjectId}_${result.provider}`)
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
        billingSubjectId,
        provider: result.provider,
        providerCustomerId: result.providerCustomerId,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: customer?.data()?.createdAt ?? FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    transaction.create(db.collection('auditLogs').doc(), audit(
      'billing.checkout_created',
      billingSubjectId,
      principal.uid,
      { planKey: plan.key, provider: result.provider, attemptId },
    ));
  });
};

export const subscriptionForRazorpayVerification = async (
  principal: AuthenticatedPrincipal,
  suppliedSubscriptionId: string,
  organizationId?: string,
): Promise<{ billingSubjectId: string; planKey: PlanKey; providerSubscriptionId: string }> => {
  const subject = await resolveBillingSubject(principal, organizationId, true);
  const snapshot = await getFirestore().collection('subscriptions').doc(subject.id).get();
  const data = snapshot.data();
  if (data?.provider !== 'razorpay'
    || typeof data.providerSubscriptionId !== 'string'
    || data.providerSubscriptionId !== suppliedSubscriptionId
    || data.billingSubjectId !== subject.id
    || (data.planKey !== 'pro_monthly' && data.planKey !== 'pro_annual')) {
    throw new HttpError(403, 'Payment verification does not match this account checkout.');
  }
  return {
    billingSubjectId: subject.id,
    planKey: data.planKey,
    providerSubscriptionId: data.providerSubscriptionId,
  };
};

export const recordRazorpayCheckoutVerification = async (
  principal: AuthenticatedPrincipal,
  billingSubjectId: string,
  providerSubscriptionId: string,
  paymentId: string,
  paymentStatus: string,
  amount: number,
  currency: string,
): Promise<void> => {
  const db = getFirestore();
  const subscriptionRef = db.collection('subscriptions').doc(billingSubjectId);
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
      'billing.razorpay_callback_verified', billingSubjectId, principal.uid,
      { providerSubscriptionIdHash: sha256(providerSubscriptionId), paymentStatus, amount, currency },
    ));
  });
};

export const releaseCheckout = async (billingSubjectId: string, attemptId: string): Promise<void> => {
  const db = getFirestore();
  const ref = db.collection('subscriptions').doc(billingSubjectId);
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
): Promise<{ billingSubjectId: string; provider: BillingProvider; providerSubscriptionId: string }> => {
  const subject = await resolveBillingSubject(principal, organizationId, true);
  const snapshot = await getFirestore().collection('subscriptions').doc(subject.id).get();
  const data = snapshot.data();
  if ((data?.provider !== 'stripe' && data?.provider !== 'razorpay')
    || typeof data.providerSubscriptionId !== 'string'
    || data.billingSubjectId !== subject.id) {
    throw new HttpError(409, 'There is no cancellable subscription for this billing subject.');
  }
  return {
    billingSubjectId: subject.id,
    provider: data.provider,
    providerSubscriptionId: data.providerSubscriptionId,
  };
};

export const markCancellationRequested = async (
  principal: AuthenticatedPrincipal,
  billingSubjectId: string,
): Promise<void> => {
  const db = getFirestore();
  await Promise.all([
    db.collection('subscriptions').doc(billingSubjectId).set({
      cancelAtPeriodEnd: true,
      cancellationRequestedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
    db.collection('auditLogs').add(audit('billing.cancellation_requested', billingSubjectId, principal.uid)),
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
        'billing.event_payload_conflict', event.billingSubjectId, 'webhook',
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
        billingSubjectId: event.billingSubjectId,
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
    const subscriptionRef = db.collection('subscriptions').doc(event.billingSubjectId);
    const entitlementRef = db.collection('entitlements').doc(event.billingSubjectId);
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
        'billing.unbound_provider_event', event.billingSubjectId, 'webhook',
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
        'billing.provider_conflict', event.billingSubjectId, 'webhook',
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
      billingSubjectId: event.billingSubjectId,
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
      billingSubjectId: event.billingSubjectId,
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
      'billing.entitlement_changed', event.billingSubjectId, 'webhook',
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
  const access = await requireWorkspaceAccess(principal, workspaceId);
  const organizationId = typeof access.workspace.organizationId === 'string'
    ? access.workspace.organizationId
    : undefined;

  const individualSubjectId = personalBillingSubjectId(principal.uid);
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
    await requireOrganizationAccess(principal, organizationId);
    const organizationSubjectId = organizationBillingSubjectId(organizationId);
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
  billingSubjectId: string;
  provider: BillingProvider;
  providerSubscriptionId: string;
  planKey?: PlanKey;
}>> => {
  const db = getFirestore();
  const cursorRef = db.collection('billingJobs').doc('reconciliation');
  const cursor = await cursorRef.get();
  const cursorBillingSubjectId = typeof cursor.data()?.cursorBillingSubjectId === 'string'
    ? cursor.data()?.cursorBillingSubjectId as string
    : null;
  const baseQuery = db.collection('subscriptions').orderBy(FieldPath.documentId()).limit(250);
  let snapshot = cursorBillingSubjectId
    ? await baseQuery.startAfter(cursorBillingSubjectId).get()
    : await baseQuery.get();
  if (snapshot.empty && cursorBillingSubjectId) snapshot = await baseQuery.get();
  await cursorRef.set({
    cursorBillingSubjectId: snapshot.docs.at(-1)?.id ?? null,
    scannedAt: FieldValue.serverTimestamp(),
    candidateCount: snapshot.size,
  }, { merge: true });
  return snapshot.docs.flatMap((document) => {
    const data = document.data();
    if ((data.provider !== 'stripe' && data.provider !== 'razorpay')
      || typeof data.providerSubscriptionId !== 'string') return [];
    return [{
      billingSubjectId: document.id,
      provider: data.provider,
      providerSubscriptionId: data.providerSubscriptionId,
      planKey: typeof data.planKey === 'string' ? data.planKey as PlanKey : undefined,
    }];
  });
};

export const applyReconciliationSnapshot = async (
  candidate: { billingSubjectId: string; planKey?: PlanKey },
  snapshot: ProviderSubscriptionSnapshot,
): Promise<void> => {
  const now = Date.now();
  await applyProviderEvent({
    provider: snapshot.provider,
    eventId: `reconcile_${snapshot.providerSubscriptionId}_${Math.floor(now / 3_600_000)}`,
    eventType: 'subscription.reconciled',
    occurredAtMs: now,
    billingSubjectId: candidate.billingSubjectId,
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
