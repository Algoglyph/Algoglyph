# ADR-001: Membership-scoped cloud canvases with element-level convergence

Status: accepted

## Context

AlgoGlyph's original `/workspace` is a local-first multi-tab document. Its active canvas is a full Excalidraw element array in a Zustand live mirror and the complete workspace snapshot is debounced into one IndexedDB record. That model is intentionally retained for anonymous and desktop use, but a stale whole-array write is unsafe for multi-user editing.

## Decision

Cloud collaboration is a separate authenticated surface at `/workspaces` and `/workspace/:workspaceId/canvas/:canvasId`. A workspace is the authorization root and owns canvas subcollections. Flat `workspaceMembers/{workspaceId}_{uid}` records provide cheap, explicit authorization checks. URLs identify resources but never authorize them.

Canvas elements are independent Firestore documents. Excalidraw's `(version, versionNonce)` tuple is the deterministic last-writer clock; a higher version wins, and the lower nonce wins an equal-version tie to match Excalidraw reconciliation. Deleted elements remain as tombstones. Transactions reject/ignore stale or duplicate mutations. Snapshot listeners use Excalidraw reconciliation and remote changes are applied without adding them to local undo history. Writes are debounced, diffed by element clock, chunked, and listeners/timers are disposed on unmount.

Presence is a short-lived, user-owned UX record. It is never consulted for authorization.

Invites contain 256 random bits. Only SHA-256 hashes are stored. Acceptance is a backend transaction that validates status, expiry, scope, use count, workspace state, and the authenticated Firebase UID before creating membership.

## Alternatives considered

- Whole-canvas snapshots were rejected because stale clients can silently overwrite unrelated changes.
- A new CRDT dependency was deferred because Excalidraw already supplies element clocks and reconciliation appropriate to the current data model.
- Public-link access was rejected because possession of a URL is not an identity or membership grant.

## Consequences

Unrelated edits converge without replacing the canvas. Simultaneous edits to the same element resolve deterministically, but this is element-level last-writer-wins rather than character-level collaborative text. Binary Excalidraw files are not yet cloud-synchronized.
