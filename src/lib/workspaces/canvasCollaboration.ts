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

interface CollaborationOptions {
  workspaceId: string;
  canvasId: string;
  user: { uid: string; displayName: string | null; photoURL: string | null };
  onElements: (elements: readonly OrderedExcalidrawElement[]) => void;
  onPresence: (people: CollaboratorPresence[]) => void;
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
  let queued: readonly OrderedExcalidrawElement[] | null = null;
  let debounce: number | undefined;

  const flush = async (elements: readonly OrderedExcalidrawElement[]) => {
    if (disposed) return;
    const changed = elements.filter((element) => known.get(element.id) !== fingerprint(element));
    if (!changed.length) return;
    for (let offset = 0; offset < changed.length; offset += 100) {
      const chunk = changed.slice(offset, offset + 100);
      await runTransaction(db, async (transaction) => {
        const refs = chunk.map((element) => doc(elementsRef, element.id));
        const snapshots = await Promise.all(refs.map((reference) => transaction.get(reference)));
        chunk.forEach((element, index) => {
          const stored = snapshots[index]?.data()?.element as unknown;
          const existing = isExcalidrawElement(stored) ? stored : undefined;
          const reference = refs[index];
          if (!reference || !wins(element, existing)) return;
          const [version, versionNonce] = clock(element);
          transaction.set(reference, {
            workspaceId: options.workspaceId,
            canvasId: options.canvasId,
            elementId: element.id,
            element,
            version,
            versionNonce,
            isDeleted: element.isDeleted === true,
            updatedBy: options.user.uid,
            updatedAt: serverTimestamp(),
          });
        });
      });
    }
  };

  const publish = (elements: readonly OrderedExcalidrawElement[]) => {
    queued = elements;
    if (!ready || disposed) return;
    if (debounce) window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      const next = queued;
      queued = null;
      if (next) void flush(next).catch(() => options.onError('A canvas update could not be synced. The current server state was kept.'));
    }, 150);
  };

  const unsubscribeElements = onSnapshot(elementsRef, (snapshot) => {
    const remote = snapshot.docs.map((item) => item.data().element as unknown).filter(isExcalidrawElement);
    remote.forEach((element) => known.set(element.id, fingerprint(element)));
    ready = true;
    options.onElements(remote);
    if (queued) publish(queued);
  }, () => options.onError('Live canvas updates are unavailable. Check your workspace membership and connection.'));

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
