import { getApp } from 'firebase/app';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { BinaryFiles } from '@excalidraw/excalidraw/types';
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  setDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

export interface CollaboratorPresence {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  pointer: { x: number; y: number; tool: 'pointer' | 'laser'; button: 'up' | 'down' } | null;
}

export interface CanvasPointer {
  x: number;
  y: number;
  tool: 'pointer' | 'laser';
  button: 'up' | 'down';
}

export type CanvasSyncStatus = 'connecting' | 'live' | 'syncing' | 'error';

interface CollaborationOptions {
  workspaceId: string;
  canvasId: string;
  user: { uid: string; displayName: string | null; photoURL: string | null };
  onElements: (elements: readonly OrderedExcalidrawElement[]) => void;
  onFiles: (files: BinaryFiles) => void;
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
const FILE_CHUNK_SIZE = 700_000;
const MAX_FILE_CHUNKS = 30;
const POINTER_WRITE_INTERVAL = 100;
const POINTER_VISIBLE_MS = 20_000;

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

const fileStamp = (file: BinaryFiles[string]): string => `${file.mimeType}:${file.created}:${file.version ?? 0}:${file.dataURL.length}`;

const isCanvasPointer = (value: unknown): value is CanvasPointer => {
  if (!value || typeof value !== 'object') return false;
  const pointer = value as Record<string, unknown>;
  return typeof pointer.x === 'number' && Number.isFinite(pointer.x)
    && typeof pointer.y === 'number' && Number.isFinite(pointer.y)
    && (pointer.tool === 'pointer' || pointer.tool === 'laser')
    && (pointer.button === 'up' || pointer.button === 'down');
};

const isBinaryFile = (value: unknown): value is BinaryFiles[string] => {
  if (!value || typeof value !== 'object') return false;
  const file = value as Record<string, unknown>;
  return typeof file.id === 'string' && typeof file.mimeType === 'string'
    && typeof file.dataURL === 'string' && typeof file.created === 'number';
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
  const filesRef = collection(canvasRef, 'files');
  const presenceRef = collection(canvasRef, 'presence');
  const ownPresenceRef = doc(presenceRef, options.user.uid);
  const known = new Map<string, string>();
  const knownFiles = new Map<string, { stamp: string; dataURL: string }>();
  let ready = false;
  let disposed = false;
  let hasServerSnapshot = false;
  let lastWriteFailed = false;
  let queued: { elements: readonly OrderedExcalidrawElement[]; files: BinaryFiles } | null = null;
  let queuedFingerprint: string | null = null;
  let failedFingerprint: string | null = null;
  const inFlightFingerprints = new Set<string>();
  let debounce: number | undefined;
  let localPointer: CanvasPointer | null = null;
  let pointerWriteTimer: number | undefined;
  let lastPointerWriteAt = 0;
  let pointerWriteBlocked = false;
  let pointerErrorNotified = false;

  const writePointer = () => {
    pointerWriteTimer = undefined;
    if (pointerWriteBlocked) return;
    lastPointerWriteAt = Date.now();
    void setDoc(ownPresenceRef, {
      uid: options.user.uid,
      displayName: options.user.displayName,
      photoURL: options.user.photoURL,
      activeAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 90_000),
      ...(localPointer ? { pointer: localPointer, pointerUpdatedAt: serverTimestamp() } : {}),
    }, { merge: true }).then(() => {
      pointerErrorNotified = false;
    }).catch((error: unknown) => {
      const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
        ? error.code
        : null;
      if (code === 'permission-denied') pointerWriteBlocked = true;
      if (pointerErrorNotified) return;
      pointerErrorNotified = true;
      options.onError(code === 'permission-denied'
        ? 'Live cursors are blocked by Firestore rules. Deploy the latest firestore.rules, then reload this canvas.'
        : 'Could not sync the live cursor. Check the connection and reload the canvas if it continues.');
    });
  };

  const storePointer = (pointer: CanvasPointer) => {
    localPointer = pointer;
    const delay = Math.max(0, POINTER_WRITE_INTERVAL - (Date.now() - lastPointerWriteAt));
    if (delay === 0) writePointer();
    else if (pointerWriteTimer === undefined) pointerWriteTimer = window.setTimeout(writePointer, delay);
  };

  const storeFile = async (file: BinaryFiles[string]) => {
    const chunkCount = Math.max(1, Math.ceil(file.dataURL.length / FILE_CHUNK_SIZE));
    if (chunkCount > MAX_FILE_CHUNKS) {
      throw new Error(`Image is too large to sync (${Math.ceil(file.dataURL.length / 1_000_000)} MB). Use an image smaller than 21 MB.`);
    }
    const safeFileId = encodeURIComponent(file.id);
    let batch = writeBatch(db);
    for (let index = 0; index < chunkCount; index += 1) {
      // Keep each request well below Firestore's 10 MiB commit limit.
      if (index > 0 && index % 10 === 0) {
        // Commit the preceding group before starting another one. The listener
        // only exposes a file after it has received every chunk in its revision.
        await batch.commit();
        batch = writeBatch(db);
      }
      const reference = doc(filesRef, `${safeFileId}_${String(index).padStart(4, '0')}`);
      batch.set(reference, {
        workspaceId: options.workspaceId,
        canvasId: options.canvasId,
        fileId: file.id,
        revision: `${fileStamp(file)}:${chunkCount}`,
        chunkIndex: index,
        chunkCount,
        mimeType: file.mimeType,
        created: file.created,
        data: file.dataURL.slice(index * FILE_CHUNK_SIZE, (index + 1) * FILE_CHUNK_SIZE),
        updatedBy: options.user.uid,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    knownFiles.set(file.id, { stamp: fileStamp(file), dataURL: file.dataURL });
  };

  const flush = async (elements: readonly OrderedExcalidrawElement[], files: BinaryFiles) => {
    if (disposed) return;
    const changed = elements.filter((element) => known.get(element.id) !== fingerprint(element));
    const changedFiles = Object.values(files).filter(isBinaryFile).filter((file) => {
      const stored = knownFiles.get(file.id);
      return !stored || stored.stamp !== fileStamp(file) || stored.dataURL !== file.dataURL;
    });
    if (!changed.length && !changedFiles.length) {
      options.onStatus('live');
      return;
    }
    options.onStatus('syncing');
    // Upload images first so collaborators have the bytes by the time their element arrives.
    for (const file of changedFiles) await storeFile(file);
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

  const publish = (elements: readonly OrderedExcalidrawElement[], files: BinaryFiles = {}) => {
    if (!ready || disposed) {
      queued = { elements, files };
      return;
    }
    const changed = elements.filter((element) => known.get(element.id) !== fingerprint(element));
    const changedFiles = Object.values(files).filter(isBinaryFile).filter((file) => {
      const stored = knownFiles.get(file.id);
      return !stored || stored.stamp !== fileStamp(file) || stored.dataURL !== file.dataURL;
    });
    if (!changed.length && !changedFiles.length) return;
    const nextFingerprint = [
      ...changed.map((element) => `element:${fingerprint(element)}`),
      ...changedFiles.map((file) => `file:${file.id}:${fileStamp(file)}:${file.dataURL.length}`),
    ].sort().join('|');
    if (failedFingerprint && failedFingerprint !== nextFingerprint) {
      failedFingerprint = null;
      lastWriteFailed = false;
    }
    if (failedFingerprint === nextFingerprint || inFlightFingerprints.has(nextFingerprint)) return;
    queued = { elements, files };
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
        void flush(next.elements, next.files).catch((error: unknown) => {
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
                : detail || 'Canvas update could not be synced. Check your connection and try editing again.';
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
    if (queued) publish(queued.elements, queued.files);
  }, (error) => {
    lastWriteFailed = true;
    const code = typeof error.code === 'string' ? error.code : 'unknown';
    const message = `Live canvas updates failed (${code}). Check your workspace membership and connection.`;
    options.onStatus('error', message);
    options.onError(message);
  });

  const unsubscribeFiles = onSnapshot(filesRef, (snapshot) => {
    const groups = new Map<string, { fileId: string; revision: string; count: number; mimeType: string; created: number; chunks: Map<number, string>; complete: boolean }>();
    snapshot.docs.forEach((item) => {
      const value = item.data();
      if (typeof value.fileId !== 'string' || typeof value.chunkIndex !== 'number'
        || typeof value.chunkCount !== 'number' || typeof value.mimeType !== 'string'
        || typeof value.created !== 'number' || typeof value.revision !== 'string' || typeof value.data !== 'string'
        || value.chunkCount < 1 || value.chunkCount > MAX_FILE_CHUNKS
        || value.chunkIndex < 0 || value.chunkIndex >= value.chunkCount) return;
      const groupKey = `${value.fileId}\u0000${value.revision}`;
      let group = groups.get(groupKey);
      if (!group) {
        group = { fileId: value.fileId, revision: value.revision, count: value.chunkCount, mimeType: value.mimeType, created: value.created, chunks: new Map(), complete: true };
        groups.set(groupKey, group);
      }
      if (group.count !== value.chunkCount || group.mimeType !== value.mimeType || group.created !== value.created) return;
      group.chunks.set(value.chunkIndex, value.data);
      if (item.metadata.hasPendingWrites) group.complete = false;
    });
    const files: BinaryFiles = {};
    groups.forEach((group) => {
      if (!group.complete || group.chunks.size !== group.count) return;
      const dataURL = Array.from({ length: group.count }, (_, index) => group.chunks.get(index) ?? '').join('');
      if (!dataURL) return;
      files[group.fileId] = { id: group.fileId as BinaryFiles[string]['id'], mimeType: group.mimeType as BinaryFiles[string]['mimeType'], created: group.created, dataURL: dataURL as BinaryFiles[string]['dataURL'] };
      knownFiles.set(group.fileId, { stamp: fileStamp(files[group.fileId]!), dataURL });
    });
    options.onFiles(files);
    if (queued) publish(queued.elements, queued.files);
  }, (error) => {
    const code = typeof error.code === 'string' ? error.code : 'unknown';
    const message = `Live image sync failed (${code}). Check your workspace membership and connection.`;
    options.onStatus('error', message);
    options.onError(message);
  });

  const unsubscribePresence = onSnapshot(presenceRef, (snapshot) => {
    const now = Date.now();
    options.onPresence(snapshot.docs.map((item) => item.data()).filter((value) => {
      return value.expiresAt instanceof Timestamp && value.expiresAt.toMillis() > now;
    }).map((value) => ({
      uid: value.uid,
      displayName: value.displayName ?? null,
      photoURL: value.photoURL ?? null,
      pointer: isCanvasPointer(value.pointer) && value.pointerUpdatedAt instanceof Timestamp
        && now - value.pointerUpdatedAt.toMillis() < POINTER_VISIBLE_MS
        ? value.pointer
        : null,
    })));
  });

  const heartbeat = () => setDoc(ownPresenceRef, {
      uid: options.user.uid,
      displayName: options.user.displayName,
      photoURL: options.user.photoURL,
      activeAt: serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 90_000),
    }, { merge: true }).catch(() => undefined);
  void heartbeat();
  const heartbeatTimer = window.setInterval(() => void heartbeat(), 30_000);

  return {
    publish,
    publishPointer: (pointer: CanvasPointer) => { if (!disposed && isCanvasPointer(pointer)) storePointer(pointer); },
    dispose: () => {
      disposed = true;
      if (debounce) window.clearTimeout(debounce);
      if (pointerWriteTimer !== undefined) window.clearTimeout(pointerWriteTimer);
      window.clearInterval(heartbeatTimer);
      unsubscribeElements();
      unsubscribeFiles();
      unsubscribePresence();
      void deleteDoc(ownPresenceRef).catch(() => undefined);
    },
  };
};
