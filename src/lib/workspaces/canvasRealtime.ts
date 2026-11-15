import { getApp } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore';
import type { OrderedExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { CanvasPointer, CollaboratorPresence } from './canvasCollaboration';

interface RealtimeOptions {
  workspaceId: string;
  canvasId: string;
  user: { uid: string };
  sessionId: string;
  onElements: (elements: readonly OrderedExcalidrawElement[]) => void;
  onPointer: (uid: string, pointer: CanvasPointer) => void;
  onAgentPointer: (uid: string, pointer: CanvasPointer | null) => void;
  onPeerState: (uid: string, connected: boolean) => void;
  onError: (message: string) => void;
}

interface Participant {
  uid: string;
  sessionId: string;
}

interface Peer {
  uid: string;
  sessionId: string;
  sessionRef: DocumentReference;
  connection: RTCPeerConnection;
  channel: RTCDataChannel | null;
  localOffer: boolean;
  signalingReady: boolean;
  remoteDescriptionReady: boolean;
  answerApplied: boolean;
  pendingLocalCandidates: RTCIceCandidateInit[];
  pendingRemoteCandidates: RTCIceCandidateInit[];
  receivedCandidates: Set<string>;
  unsubscribeCandidates: Unsubscribe | null;
}

interface FragmentSet {
  parts: Array<Uint8Array | undefined>;
  received: number;
  timer: number;
}

const MAX_PEERS = 8;
const REALTIME_FLUSH_MS = 16;
const MAX_DATA_CHANNEL_BUFFER = 512_000;
const MAX_DIRECT_MESSAGE_BYTES = 48_000;
const FRAGMENT_BYTES = 24_000;
const MAX_REALTIME_PAYLOAD_BYTES = 1_000_000;
const MAX_FRAGMENT_SETS = 32;

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object';

const isElement = (value: unknown): value is OrderedExcalidrawElement => {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.type === 'string'
    && typeof value.index === 'string'
    && Number.isSafeInteger(value.version)
    && Number.isSafeInteger(value.versionNonce)
    && typeof value.x === 'number'
    && typeof value.y === 'number';
};

const isPointer = (value: unknown): value is CanvasPointer => {
  if (!isRecord(value)) return false;
  return typeof value.x === 'number' && Number.isFinite(value.x)
    && typeof value.y === 'number' && Number.isFinite(value.y)
    && (value.tool === 'pointer' || value.tool === 'laser')
    && (value.button === 'up' || value.button === 'down');
};

const decodeDescription = (value: unknown, expectedType: 'offer' | 'answer'): RTCSessionDescriptionInit | null => {
  if (!isRecord(value) || value.type !== expectedType || typeof value.sdp !== 'string' || value.sdp.length > 60_000) return null;
  return { type: expectedType, sdp: value.sdp };
};

const decodeCandidate = (value: unknown): RTCIceCandidateInit | null => {
  if (!isRecord(value) || typeof value.candidate !== 'string' || value.candidate.length > 4096) return null;
  if (value.sdpMid !== null && value.sdpMid !== undefined && typeof value.sdpMid !== 'string') return null;
  if (value.sdpMLineIndex !== null && value.sdpMLineIndex !== undefined && typeof value.sdpMLineIndex !== 'number') return null;
  if (value.usernameFragment !== null && value.usernameFragment !== undefined && typeof value.usernameFragment !== 'string') return null;
  return {
    candidate: value.candidate,
    sdpMid: value.sdpMid as string | null | undefined,
    sdpMLineIndex: value.sdpMLineIndex as number | null | undefined,
    usernameFragment: value.usernameFragment as string | null | undefined,
  };
};

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

export const connectCanvasRealtime = (options: RealtimeOptions) => {
  const db = getFirestore(getApp());
  const canvasPath = ['workspaces', options.workspaceId, 'canvases', options.canvasId] as const;
  const sessionsRef = collection(db, ...canvasPath, 'rtcSessions');
  const activePeers = new Map<string, Peer>();
  const participants = new Map<string, Participant>();
  const retryAfter = new Map<string, number>();
  const fragments = new Map<string, FragmentSet>();
  const pendingElements = new Map<string, OrderedExcalidrawElement>();
  let pendingPointer: CanvasPointer | null = null;
  let pendingAgentPointer: CanvasPointer | null | undefined;
  let elementTimer: number | undefined;
  let pointerTimer: number | undefined;
  let agentPointerTimer: number | undefined;
  let disposed = false;
  let permissionErrorShown = false;
  let fallbackParticipantCount = 0;

  const sendJson = (peer: Peer, message: unknown) => {
    const channel = peer.channel;
    if (!channel || channel.readyState !== 'open' || channel.bufferedAmount > MAX_DATA_CHANNEL_BUFFER) return;
    try {
      const encoded = JSON.stringify(message);
      const bytes = new TextEncoder().encode(encoded);
      if (bytes.byteLength <= MAX_DIRECT_MESSAGE_BYTES) {
        channel.send(encoded);
        return;
      }
      if (bytes.byteLength > MAX_REALTIME_PAYLOAD_BYTES) return;
      const messageId = crypto.randomUUID();
      const count = Math.ceil(bytes.byteLength / FRAGMENT_BYTES);
      for (let index = 0; index < count; index += 1) {
        if (channel.bufferedAmount > MAX_DATA_CHANNEL_BUFFER) return;
        const data = toBase64(bytes.subarray(index * FRAGMENT_BYTES, Math.min((index + 1) * FRAGMENT_BYTES, bytes.byteLength)));
        channel.send(JSON.stringify({ kind: 'fragment', messageId, index, count, data }));
      }
    } catch {
      // Direct updates are opportunistic; the durable Firestore sync remains active.
    }
  };

  const handlePayload = (peer: Peer, encoded: string) => {
    let message: unknown;
    try { message = JSON.parse(encoded); } catch { return; }
    if (!isRecord(message) || typeof message.kind !== 'string') return;
    if (message.kind === 'fragment') {
      if (typeof message.messageId !== 'string' || message.messageId.length > 64
        || typeof message.index !== 'number' || !Number.isInteger(message.index)
        || typeof message.count !== 'number' || !Number.isInteger(message.count) || typeof message.data !== 'string'
        || message.count < 1 || message.count > 64 || message.index < 0 || message.index >= message.count
        || message.data.length > 40_000) return;
      let set = fragments.get(message.messageId);
      if (!set) {
        if (fragments.size >= MAX_FRAGMENT_SETS) {
          const oldest = fragments.entries().next().value as [string, FragmentSet] | undefined;
          if (oldest) {
            window.clearTimeout(oldest[1].timer);
            fragments.delete(oldest[0]);
          }
        }
        set = {
          parts: Array.from({ length: message.count }),
          received: 0,
          timer: window.setTimeout(() => fragments.delete(message.messageId as string), 5_000),
        };
        fragments.set(message.messageId, set);
      }
      if (set.parts.length !== message.count || set.parts[message.index]) return;
      try {
        set.parts[message.index] = fromBase64(message.data);
        set.received += 1;
      } catch { return; }
      if (set.received === set.parts.length) {
        window.clearTimeout(set.timer);
        fragments.delete(message.messageId);
        const total = set.parts.reduce((sum, part) => sum + (part?.byteLength ?? 0), 0);
        if (total > MAX_REALTIME_PAYLOAD_BYTES) return;
        const bytes = new Uint8Array(total);
        let offset = 0;
        set.parts.forEach((part) => {
          if (!part) return;
          bytes.set(part, offset);
          offset += part.byteLength;
        });
        handlePayload(peer, new TextDecoder().decode(bytes));
      }
      return;
    }
    if (message.kind === 'elements' && Array.isArray(message.elements)) {
      const elements = message.elements.filter(isElement);
      if (elements.length) options.onElements(elements);
    } else if (message.kind === 'pointer' && isPointer(message.pointer)) {
      options.onPointer(peer.uid, message.pointer);
    } else if (message.kind === 'agent-pointer' && (message.pointer === null || isPointer(message.pointer))) {
      options.onAgentPointer(peer.uid, message.pointer as CanvasPointer | null);
    }
  };

  const sendCandidate = (peer: Peer, candidate: RTCIceCandidateInit) => {
    const normalizedCandidate: RTCIceCandidateInit = {
      candidate: candidate.candidate ?? '',
      sdpMid: candidate.sdpMid ?? null,
      sdpMLineIndex: candidate.sdpMLineIndex ?? null,
      usernameFragment: candidate.usernameFragment ?? null,
    };
    if (!normalizedCandidate.candidate) return;
    if (!peer.signalingReady || disposed) {
      peer.pendingLocalCandidates.push(candidate);
      return;
    }
    const candidateRef = doc(collection(peer.sessionRef, 'candidates'));
    void setDoc(candidateRef, {
      uid: options.user.uid,
      fromSessionId: options.sessionId,
      candidate: normalizedCandidate,
      createdAt: serverTimestamp(),
    }).catch(() => undefined);
  };

  const flushLocalCandidates = (peer: Peer) => {
    peer.signalingReady = true;
    peer.pendingLocalCandidates.splice(0).forEach((candidate) => sendCandidate(peer, candidate));
  };

  const addRemoteCandidate = (peer: Peer, id: string, value: unknown) => {
    if (peer.receivedCandidates.has(id) || !isRecord(value)) return;
    const candidate = decodeCandidate(value.candidate);
    if (!candidate) return;
    peer.receivedCandidates.add(id);
    if (!peer.remoteDescriptionReady) {
      peer.pendingRemoteCandidates.push(candidate);
      return;
    }
    void peer.connection.addIceCandidate(candidate).catch(() => undefined);
  };

  const flushRemoteCandidates = (peer: Peer) => {
    peer.remoteDescriptionReady = true;
    peer.pendingRemoteCandidates.splice(0).forEach((candidate) => {
      void peer.connection.addIceCandidate(candidate).catch(() => undefined);
    });
  };

  const attachCandidateListener = (peer: Peer) => {
    peer.unsubscribeCandidates = onSnapshot(collection(peer.sessionRef, 'candidates'), (snapshot) => {
      snapshot.docs.forEach((candidate) => {
        const data = candidate.data();
        if (data.uid !== options.user.uid) addRemoteCandidate(peer, candidate.id, data);
      });
    }, () => undefined);
  };

  const createPeer = (participant: Participant, sessionRef: DocumentReference, localOffer: boolean): Peer => {
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
    });
    const peer: Peer = {
      uid: participant.uid,
      sessionId: participant.sessionId,
      sessionRef,
      connection,
      channel: null,
      localOffer,
      signalingReady: false,
      remoteDescriptionReady: false,
      answerApplied: false,
      pendingLocalCandidates: [],
      pendingRemoteCandidates: [],
      receivedCandidates: new Set(),
      unsubscribeCandidates: null,
    };
    activePeers.set(participant.uid, peer);
    attachCandidateListener(peer);

    const attachChannel = (channel: RTCDataChannel) => {
      peer.channel = channel;
      channel.onmessage = (event) => {
        if (typeof event.data === 'string') handlePayload(peer, event.data);
      };
      channel.onopen = () => options.onPeerState(peer.uid, true);
      channel.onclose = () => options.onPeerState(peer.uid, false);
      channel.onerror = () => options.onPeerState(peer.uid, false);
    };

    if (localOffer) attachChannel(connection.createDataChannel('algoglyph-canvas', { ordered: true }));
    else connection.ondatachannel = (event) => attachChannel(event.channel);

    connection.onicecandidate = (event) => {
      if (event.candidate) sendCandidate(peer, event.candidate.toJSON());
    };
    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'failed') {
        retryAfter.set(peer.uid, Date.now() + 5_000);
        closePeer(peer, true);
      } else if (connection.connectionState === 'closed') {
        options.onPeerState(peer.uid, false);
      }
    };
    return peer;
  };

  const deleteSessionRef = async (sessionRef: DocumentReference) => {
    try {
      const candidatesRef = collection(sessionRef, 'candidates');
      while (true) {
        const candidateSnapshot = await getDocs(query(candidatesRef, limit(400)));
        if (candidateSnapshot.empty) break;
        const batch = writeBatch(db);
        candidateSnapshot.docs.forEach((candidate) => batch.delete(candidate.ref));
        await batch.commit();
        if (candidateSnapshot.size < 400) break;
      }
      await deleteDoc(sessionRef);
    } catch {
      // A stale signaling record is harmless; it expires and is ignored by new sessions.
    }
  };

  const deleteSession = (peer: Peer) => deleteSessionRef(peer.sessionRef);

  const closePeer = (peer: Peer, removeSignal: boolean) => {
    if (activePeers.get(peer.uid) === peer) activePeers.delete(peer.uid);
    peer.unsubscribeCandidates?.();
    peer.channel?.close();
    peer.connection.close();
    options.onPeerState(peer.uid, false);
    if (removeSignal) void deleteSession(peer);
  };

  const prepareAnswer = async (peer: Peer, offerValue: unknown) => {
    const offer = decodeDescription(offerValue, 'offer');
    if (!offer) throw new Error('Invalid WebRTC offer.');
    await peer.connection.setRemoteDescription(offer);
    flushRemoteCandidates(peer);
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);
    const localDescription = peer.connection.localDescription;
    if (!localDescription?.sdp) throw new Error('Could not create a WebRTC answer.');
    await updateDoc(peer.sessionRef, {
      answer: { type: localDescription.type, sdp: localDescription.sdp },
      answeredBy: options.user.uid,
      answeredAt: serverTimestamp(),
    });
    flushLocalCandidates(peer);
  };

  const startOffer = async (participant: Participant) => {
    if (disposed || typeof RTCPeerConnection === 'undefined' || activePeers.has(participant.uid) || activePeers.size >= MAX_PEERS) return;
    const sessionRef = doc(sessionsRef, `${options.sessionId}_${participant.sessionId}`);
    let peer: Peer | null = null;
    try {
      peer = createPeer(participant, sessionRef, true);
      const offer = await peer.connection.createOffer();
      await peer.connection.setLocalDescription(offer);
      const localDescription = peer.connection.localDescription;
      if (!localDescription?.sdp) throw new Error('Could not create a WebRTC offer.');
      await setDoc(sessionRef, {
        workspaceId: options.workspaceId,
        canvasId: options.canvasId,
        fromUid: options.user.uid,
        fromSessionId: options.sessionId,
        toUid: participant.uid,
        toSessionId: participant.sessionId,
        offer: { type: localDescription.type, sdp: localDescription.sdp },
        answer: null,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 2 * 60_000),
      });
      flushLocalCandidates(peer);
    } catch (error) {
      retryAfter.set(participant.uid, Date.now() + 5_000);
      const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
      if (code === 'permission-denied' && !permissionErrorShown) {
        permissionErrorShown = true;
        options.onError('Direct canvas sync was blocked by Firestore rules. Deploy the latest firestore.rules; regular saving will keep working meanwhile.');
      }
      if (peer) closePeer(peer, true);
    }
  };

  const acceptOffer = async (sessionId: string, data: Record<string, unknown>) => {
    if (disposed || typeof RTCPeerConnection === 'undefined' || typeof data.fromUid !== 'string' || typeof data.fromSessionId !== 'string'
      || activePeers.has(data.fromUid) || activePeers.size >= MAX_PEERS) return;
    const expiresAt = data.expiresAt;
    if (expiresAt instanceof Timestamp && expiresAt.toMillis() <= Date.now()) return;
    let peer: Peer | null = null;
    try {
      peer = createPeer(
        { uid: data.fromUid, sessionId: data.fromSessionId },
        doc(sessionsRef, sessionId),
        false,
      );
      await prepareAnswer(peer, data.offer);
    } catch (error) {
      if (peer) retryAfter.set(peer.uid, Date.now() + 5_000);
      const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
      if (code === 'permission-denied' && !permissionErrorShown) {
        permissionErrorShown = true;
        options.onError('Direct canvas sync was blocked by Firestore rules. Deploy the latest firestore.rules; regular saving will keep working meanwhile.');
      }
      if (peer) closePeer(peer, true);
    }
  };

  const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
    snapshot.docs.forEach((item) => {
      const data = item.data();
      if (data.expiresAt instanceof Timestamp && data.expiresAt.toMillis() <= Date.now()) {
        void deleteSessionRef(item.ref);
        return;
      }
      if (data.toUid === options.user.uid && data.toSessionId === options.sessionId) {
        if (typeof data.fromUid === 'string' && !activePeers.has(data.fromUid)) void acceptOffer(item.id, data);
        return;
      }
      if (data.fromUid !== options.user.uid || data.fromSessionId !== options.sessionId || !data.answer) return;
      const peer = [...activePeers.values()].find((candidate) => candidate.localOffer && candidate.sessionRef.id === item.id);
      if (!peer || peer.answerApplied) return;
      const answer = decodeDescription(data.answer, 'answer');
      if (!answer) return;
      peer.answerApplied = true;
      void peer.connection.setRemoteDescription(answer).then(() => flushRemoteCandidates(peer)).catch(() => {
        retryAfter.set(peer.uid, Date.now() + 5_000);
        closePeer(peer, true);
      });
    });
  }, () => undefined);

  const updateParticipants = (people: CollaboratorPresence[]) => {
    if (disposed || typeof RTCPeerConnection === 'undefined') return;
    const nextParticipants = new Map<string, Participant>();
    fallbackParticipantCount = 0;
    people.forEach((person) => {
      if (person.uid === options.user.uid) return;
      if (person.sessionId) {
        nextParticipants.set(person.uid, { uid: person.uid, sessionId: person.sessionId });
      } else {
        fallbackParticipantCount += 1;
      }
    });
    participants.clear();
    nextParticipants.forEach((participant, uid) => participants.set(uid, participant));

    activePeers.forEach((peer) => {
      const participant = participants.get(peer.uid);
      if (!participant || participant.sessionId !== peer.sessionId) closePeer(peer, true);
    });
    participants.forEach((participant) => {
      const localKey = `${options.user.uid}:${options.sessionId}`;
      const remoteKey = `${participant.uid}:${participant.sessionId}`;
      if (localKey >= remoteKey || activePeers.has(participant.uid)
        || (retryAfter.get(participant.uid) ?? 0) > Date.now()) return;
      void startOffer(participant);
    });
  };

  const publishElements = (elements: readonly OrderedExcalidrawElement[]) => {
    elements.forEach((element) => pendingElements.set(element.id, element));
    if (elementTimer !== undefined || !pendingElements.size) return;
    elementTimer = window.setTimeout(() => {
      elementTimer = undefined;
      const latest = [...pendingElements.values()];
      pendingElements.clear();
      activePeers.forEach((peer) => sendJson(peer, { kind: 'elements', elements: latest }));
    }, REALTIME_FLUSH_MS);
  };

  const publishPointer = (pointer: CanvasPointer) => {
    pendingPointer = pointer;
    if (pointerTimer !== undefined) return;
    pointerTimer = window.setTimeout(() => {
      pointerTimer = undefined;
      const latest = pendingPointer;
      pendingPointer = null;
      if (latest) activePeers.forEach((peer) => sendJson(peer, { kind: 'pointer', pointer: latest }));
    }, 16);
  };

  const publishAgentPointer = (pointer: CanvasPointer | null) => {
    pendingAgentPointer = pointer;
    if (agentPointerTimer !== undefined) return;
    agentPointerTimer = window.setTimeout(() => {
      agentPointerTimer = undefined;
      const latest = pendingAgentPointer;
      pendingAgentPointer = undefined;
      if (latest !== undefined) activePeers.forEach((peer) => sendJson(peer, { kind: 'agent-pointer', pointer: latest }));
    }, 16);
  };

  return {
    sessionId: options.sessionId,
    updateParticipants,
    publishElements,
    publishPointer,
    publishAgentPointer,
    isPeerConnected: (uid: string) => activePeers.get(uid)?.channel?.readyState === 'open',
    hasAllPeersConnected: () => participants.size > 0
      && fallbackParticipantCount === 0
      && [...participants.keys()].every((uid) => activePeers.get(uid)?.channel?.readyState === 'open'),
    dispose: () => {
      disposed = true;
      if (elementTimer !== undefined) window.clearTimeout(elementTimer);
      if (pointerTimer !== undefined) window.clearTimeout(pointerTimer);
      if (agentPointerTimer !== undefined) window.clearTimeout(agentPointerTimer);
      fragments.forEach((fragment) => window.clearTimeout(fragment.timer));
      fragments.clear();
      unsubscribeSessions();
      activePeers.forEach((peer) => closePeer(peer, true));
      activePeers.clear();
    },
  };
};
