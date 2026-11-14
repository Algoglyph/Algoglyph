import { getApp } from 'firebase/app';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export interface CollaboratorPresence {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export type CanvasSyncStatus = 'connecting' | 'live' | 'syncing' | 'error';

interface CollaborationOptions {
  workspaceId: string;
  canvasId: string;
  user: { uid: string; displayName: string | null; photoURL: string | null };
  onElements: (elements: readonly OrderedExcalidrawElement[]) => void;
  onPresence: (people: CollaboratorPresence[]) => void;
  onStatus: (status: CanvasSyncStatus, message?: string) => void;
  onError: (message: string) => void;
}

const isExcalidrawElement = (value: unknown): value is OrderedExcalidrawElement => {
  if (!value || typeof value !== 'object') return false;
  const element = value as Record<string, unknown>;
  return typeof element.id === 'string'
    && typeof element.type === 'string'
    && typeof element.index === 'string'
    && Number.isSafeInteger(element.version)
    && Number.isSafeInteger(element.versionNonce)
    && typeof element.x === 'number'
    && typeof element.y === 'number';
};

const SERIALIZED_ELEMENT_FIELD = '__algoglyphSerializedElementV1';

const decodeStoredElement = (value: unknown): OrderedExcalidrawElement | null => {
  if (isExcalidrawElement(value)) return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const serialized = (value as Record<string, unknown>)[SERIALIZED_ELEMENT_FIELD];
  if (typeof serialized !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(serialized);
    return isExcalidrawElement(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const encodeStoredElement = (element: OrderedExcalidrawElement) => ({
  id: element.id,
  version: element.version,
  versionNonce: element.versionNonce,
  [SERIALIZED_ELEMENT_FIELD]: JSON.stringify(element),
});

const clock = (element: Pick<OrderedExcalidrawElement, 'version' | 'versionNonce'>): [number, number] => [
  Number(element.version) || 0,
  Number(element.versionNonce) || 0,
];
const wins = (incoming: OrderedExcalidrawElement, existing?: OrderedExcalidrawElement): boolean => {
  if (!existing) return true;
  const [iv, inonce] = clock(incoming);
  const [ev, enonce] = clock(existing);
  return iv > ev || (iv === ev && inonce < enonce);
};
const fingerprint = (element: OrderedExcalidrawElement) => `${element.id}:${element.version || 0}:${element.versionNonce || 0}:${element.isDeleted === true}`;

export const connectCanvasCollaboration = (options: CollaborationOptions) => {
  const db = getFirestore(getApp());
  const canvasRef = doc(db, 'workspaces', options.workspaceId, 'canvases', options.canvasId);
  const elementsRef = collection(canvasRef, 'elements');
  const presenceRef = collection(canvasRef, 'presence');
  const ownPresenceRef = doc(presenceRef, options.user.uid);
  const known = new Map<string, string>();
  let ready = false;
  let disposed = false;
  let hasServerSnapshot = false;
  let lastWriteFailed = false;
  let queued: readonly OrderedExcalidrawElement[] | null = null;
  let queuedFingerprint: string | null = null;
  let failedFingerprint: string | null = null;
  const inFlightFingerprints = new Set<string>();
  let debounce: number | undefined;

  const flush = async (elements: readonly OrderedExcalidrawElement[]) => {
    if (disposed) return;
    const changed = elements.filter((element) => known.get(element.id) !== fingerprint(element));
    if (!changed.length) {
      options.onStatus('live');
      return;
    }
    options.onStatus('syncing');
    for (let offset = 0; offset < changed.length; offset += 100) {
      const chunk = changed.slice(offset, offset + 100);
      const writtenIds = await runTransaction(db, async (transaction) => {
        const refs = chunk.map((element) => doc(elementsRef, element.id));
        const snapshots = await Promise.all(refs.map((reference) => transaction.get(reference)));
        const written: string[] = [];
        chunk.forEach((element, index) => {
          const stored = snapshots[index]?.data()?.element as unknown;
          const existing = decodeStoredElement(stored) ?? undefined;
          const reference = refs[index];
          if (!reference || !wins(element, existing)) return;
          const [version, versionNonce] = clock(element);
          transaction.set(reference, {
            workspaceId: options.workspaceId,
            canvasId: options.canvasId,
            elementId: element.id,
            element: encodeStoredElement(element),
            version,
            versionNonce,
            isDeleted: element.isDeleted === true,
            updatedBy: options.user.uid,
            updatedAt: serverTimestamp(),
          });
          written.push(element.id);
        });
        return written;
      });
      for (const element of chunk) {
        if (writtenIds.includes(element.id)) known.set(element.id, fingerprint(element));
      }
    }
    lastWriteFailed = false;
    options.onStatus('live');
  };

  const publish = (elements: readonly OrderedExcalidrawElement[]) => {
    if (!ready || disposed) {
      queued = elements;
      return;
    }
    const changed = elements.filter((element) => known.get(element.id) !== fingerprint(element));
    if (!changed.length) return;
    const nextFingerprint = changed.map(fingerprint).sort().join('|');
    if (failedFingerprint && failedFingerprint !== nextFingerprint) {
      failedFingerprint = null;
      lastWriteFailed = false;
    }
    if (failedFingerprint === nextFingerprint || inFlightFingerprints.has(nextFingerprint)) return;
    queued = elements;
    if (queuedFingerprint === nextFingerprint) return;
    queuedFingerprint = nextFingerprint;
    options.onStatus('syncing');
    if (debounce) window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      const next = queued;
      const nextFingerprint = queuedFingerprint;
      queued = null;
      queuedFingerprint = null;
      if (next && nextFingerprint) {
        inFlightFingerprints.add(nextFingerprint);
        void flush(next).catch((error: unknown) => {
          lastWriteFailed = true;
          failedFingerprint = nextFingerprint;
          const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
            ? error.code
            : null;
          const detail = error instanceof Error ? error.message.slice(0, 180) : '';
          const message = code === 'invalid-argument'
            ? `Firestore rejected a canvas value: ${detail || 'unsupported data in an element.'}`
            : code === 'permission-denied'
              ? 'Firestore denied this canvas write. Check this account’s workspace role.'
              : code
                ? `Canvas update failed (${code}). Check your connection and workspace access.`
                : 'Canvas update could not be synced. Check your connection and try editing again.';
          options.onStatus('error', message);
          options.onError(message);
        }).finally(() => inFlightFingerprints.delete(nextFingerprint));
      }
    }, 150);
  };

  const unsubscribeElements = onSnapshot(elementsRef, (snapshot) => {
    const remote: OrderedExcalidrawElement[] = [];
    snapshot.docs.forEach((item) => {
      const element = decodeStoredElement(item.data().element);
      if (!element) return;
      remote.push(element);
      // Firestore emits latency-compensated snapshots before a write is accepted.
      // Only acknowledge committed snapshots so a rejected optimistic write stays retryable.
      if (!item.metadata.hasPendingWrites) known.set(element.id, fingerprint(element));
    });
    ready = true;
    if (snapshot.metadata.fromCache) {
      if (!hasServerSnapshot && !lastWriteFailed) options.onStatus('connecting');
    } else {
      hasServerSnapshot = true;
      if (!snapshot.metadata.hasPendingWrites && !lastWriteFailed) options.onStatus('live');
    }
    options.onElements(remote);
    if (queued) publish(queued);
  }, (error) => {
    lastWriteFailed = true;
    const code = typeof error.code === 'string' ? error.code : 'unknown';
    const message = `Live canvas updates failed (${code}). Check your workspace membership and connection.`;
    options.onStatus('error', message);
    options.onError(message);
  });

  const unsubscribePresence = onSnapshot(presenceRef, (snapshot) => {
    const now = Date.now();
    options.onPresence(snapshot.docs.map((item) => item.data()).filter((value) => {
      return value.expiresAt instanceof Timestamp && value.expiresAt.toMillis() > now;
    }).map((value) => ({ uid: value.uid, displayName: value.displayName ?? null, photoURL: value.photoURL ?? null })));
  });

  const heartbeat = () => runTransaction(db, async (transaction) => {
    transaction.set(ownPresenceRef, {
      uid: options.user.uid,
      displayName: options.user.displayName,
      photoURL: options.user.photoURL,
      activeAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 90_000),
    });
  }).catch(() => undefined);
  void heartbeat();
  const heartbeatTimer = window.setInterval(() => void heartbeat(), 30_000);

  return {
    publish,
    dispose: () => {
      disposed = true;
      if (debounce) window.clearTimeout(debounce);
      window.clearInterval(heartbeatTimer);
      unsubscribeElements();
      unsubscribePresence();
      void deleteDoc(ownPresenceRef).catch(() => undefined);
    },
  };
};
