# Debug Plan — Scratchpad Codebase Fixes

> All fixes from the systematic codebase review. Execute each section in order.
> Every fix includes the **file**, **line range**, **root cause**, and the **exact change**.

---

## 🔴 FIX-01: Export Silently Drops Non-Active Tabs (BUG-02)

**Severity:** High — silent data loss for multi-tab users

### Root Cause

[`Toolbar.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/Toolbar.tsx#L33-L51) reads only the live mirror fields (`state.notes`, `state.canvasElements`, etc.), which hold **only the active tab's** data. The `tabs[]` array in the store may be stale (it's reconciled only on save/switch/close via the private `reconcileTabs()` helper). A user with multiple tabs who exports gets only 1 tab back.

### Fix

**Step 1:** Add a `getExportData()` action to the store that reconciles and returns the full workspace.

**File:** [`src/store/workspaceStore.ts`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/store/workspaceStore.ts)

Add to the `WorkspaceState` interface (after line 66):
```typescript
getExportData: () => WorkspaceData;
```

Add the implementation inside the `return { ... }` block (after `saveCurrentWorkspace`, around line 358):
```typescript
getExportData: () => {
  const tabs = reconcileTabs();
  return {
    tabs,
    activeTabId: get().activeTabId,
    updatedAt: Date.now(),
  };
},
```

**Step 2:** Update `handleExportWorkspace` in Toolbar to use the new action.

**File:** [`src/components/Toolbar.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/Toolbar.tsx#L33-L51)

Replace the entire `handleExportWorkspace` function body:
```typescript
const handleExportWorkspace = () => {
  const state = useWorkspaceStore.getState();
  const data = {
    ...state.getExportData(),
    version: 2,
    exportedAt: Date.now(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scratchpad-workspace-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Verify

- Open app, create 3 tabs with different content in each.
- Export workspace JSON.
- Open the JSON file — it should contain a `tabs` array with 3 entries and each tab's `notes`, `canvasElements`, `code`.

---

## 🔴 FIX-02: Side-Effect During Render in Canvas.tsx (BUG-01)

**Severity:** High — canvas can render blank on first load under React Strict Mode

### Root Cause

[`Canvas.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/Canvas.tsx#L26-L32) runs a side-effect (reading store state and writing refs) directly inside the render body, gated by `if (!isLoading && !hasLoadedInitialData.current)`. React Strict Mode double-invokes renders: the first pass sets `hasLoadedInitialData.current = true`, so the second pass skips the capture entirely.

### Fix

**File:** [`src/components/Canvas.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/Canvas.tsx)

Remove lines 26–32 (the bare `if` block in the render body):
```diff
-  if (!isLoading && !hasLoadedInitialData.current) {
-    const state = useWorkspaceStore.getState();
-    initialElements.current = state.canvasElements || [];
-    initialAppState.current = state.canvasAppState || {};
-    initialFiles.current = state.canvasFiles || {};
-    hasLoadedInitialData.current = true;
-  }
```

Replace with a `useLayoutEffect` (add it right after the `hasLoadedInitialData` ref declaration, around line 25):
```typescript
useLayoutEffect(() => {
  if (!isLoading && !hasLoadedInitialData.current) {
    const state = useWorkspaceStore.getState();
    initialElements.current = state.canvasElements || [];
    initialAppState.current = state.canvasAppState || {};
    initialFiles.current = state.canvasFiles || {};
    hasLoadedInitialData.current = true;
  }
}, [isLoading]);
```

Also add `useLayoutEffect` to the import on line 1:
```diff
-import React, { useEffect, useState, useRef, useMemo } from 'react';
+import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from 'react';
```

### Verify

- Run `npm run dev` (Vite dev mode enables React Strict Mode by default).
- Load the app — canvas should render correctly with existing content, not blank.
- Switch tabs — canvas should reload correctly for each tab.

---

## 🟡 FIX-03: Import Rejects Valid Multi-Tab Export Files (BUG-03)

**Severity:** Medium — after FIX-01, the new export format would be rejected by the old import guard

### Root Cause

[`Toolbar.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/Toolbar.tsx#L61-L67) only accepts files with `data.notes` or `data.canvasElements` at the root. The new multi-tab format (from FIX-01) has `{tabs: [...]}` without those legacy root fields.

### Fix

**File:** [`src/components/Toolbar.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/Toolbar.tsx#L60-L67)

Replace the validation condition:
```diff
-        if (data && (data.notes !== undefined || data.canvasElements !== undefined)) {
+        if (data && (data.notes !== undefined || data.canvasElements !== undefined || (Array.isArray(data.tabs) && data.tabs.length > 0))) {
```

### Verify

- Export workspace (produces new multi-tab JSON).
- Import the same file — should succeed with "Workspace imported successfully" toast.
- Also test importing a legacy single-tab JSON file — should still work.

---

## 🟡 FIX-04: Stale Closure Over `jumpTo` in SearchPalette Keyboard Handler (BUG-04)

**Severity:** Medium — latent correctness issue; `jumpTo` captures stale `layoutMode`, `activeTabId`, etc.

### Root Cause

[`SearchPalette.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/SearchPalette.tsx#L217-L240) registers a `keydown` handler in a `useEffect` whose dependency array is `[isOpen, results, selectedIndex]`. The handler calls `jumpTo`, which is defined inline and captures `query`, `layoutMode`, `activeTabId`, `switchTab`, `setLayoutMode`, `onClose`. These are not in the effect's deps.

### Fix

**File:** [`src/components/SearchPalette.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/SearchPalette.tsx)

**Step 1:** Add `useCallback` to the React import:
```diff
-import React, { useEffect, useMemo, useRef, useState } from 'react';
+import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
```

**Step 2:** Wrap `jumpTo` in a `useCallback`. Replace the existing `jumpTo` function (around line 190) with:
```typescript
const jumpTo = useCallback((result: SearchResult) => {
  if (result.source === 'canvas') {
    if (layoutMode === 'notes-only') {
      setLayoutMode('split');
    }
    if (result.tabId !== activeTabId) {
      switchTab(result.tabId);
    }
    onClose();
    if (result.elementId) waitAndSelectOnCanvas(result.elementId);
    return;
  }

  const needle = query.trim().toLowerCase();
  if (layoutMode === 'canvas-only') {
    setLayoutMode('split');
  }
  if (result.tabId !== activeTabId) {
    switchTab(result.tabId);
  }
  onClose();
  waitAndSelect(needle, result.occurrence);
}, [query, layoutMode, activeTabId, switchTab, setLayoutMode, onClose]);
```

**Step 3:** Add `jumpTo` to the keyboard handler `useEffect` dependency array:

```diff
-  }, [isOpen, results, selectedIndex]);
+  }, [isOpen, results, selectedIndex, jumpTo]);
```

### Verify

- Open search palette, type a query.
- Toggle layout mode while palette is open (e.g. Cmd+B).
- Press Enter on a result — it should navigate correctly using the latest layout state.

---

## 🟡 FIX-05: No Cancellation in `waitAndSelect` / `waitAndSelectOnCanvas` Polls (BUG-05)

**Severity:** Medium — potential stale calls after unmount

### Root Cause

[`SearchPalette.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/SearchPalette.tsx#L145-L188) uses recursive `setTimeout` to poll until an editor/canvas is ready. If the component unmounts while polling, the timeouts fire on stale/unmounted state.

### Fix

**File:** [`src/components/SearchPalette.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/SearchPalette.tsx)

**Step 1:** Add a cancellation ref at the top of the component (after the `inputRef` declaration, around line 39):
```typescript
const cancelledRef = useRef(false);
```

**Step 2:** Reset the ref when the palette opens/closes. Update the existing `useEffect` at line 52:
```diff
  useEffect(() => {
    if (isOpen) {
+     cancelledRef.current = false;
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
+   } else {
+     cancelledRef.current = true;
    }
  }, [isOpen]);
```

**Step 3:** Guard both polling functions with the cancellation check.

Update `waitAndSelect` (around line 145):
```typescript
const waitAndSelect = (needle: string, occurrence: number, attempts = 0) => {
  if (cancelledRef.current) return;
  const editor = (window as any).notesEditor;
  const ready = editor && editor.getText().toLowerCase().includes(needle);
  if (ready) {
    selectInEditor(editor, needle, occurrence);
    return;
  }
  if (attempts >= 40) {
    if (editor) selectInEditor(editor, needle, occurrence);
    return;
  }
  setTimeout(() => waitAndSelect(needle, occurrence, attempts + 1), 25);
};
```

Update `waitAndSelectOnCanvas` (around line 176):
```typescript
const waitAndSelectOnCanvas = (elementId: string, attempts = 0) => {
  if (cancelledRef.current) return;
  const api = (window as any).excalidrawAPI;
  const el = api && api.getSceneElements().find((e: any) => e.id === elementId && !e.isDeleted);
  if (api && el) {
    applyCanvasSelection(elementId, true);
    setTimeout(() => { if (!cancelledRef.current) applyCanvasSelection(elementId, false); }, 200);
    setTimeout(() => { if (!cancelledRef.current) applyCanvasSelection(elementId, false); }, 450);
    return;
  }
  if (attempts >= 40) return;
  setTimeout(() => waitAndSelectOnCanvas(elementId, attempts + 1), 25);
};
```

### Verify

- Open search palette, type a query, press Enter on a result, then quickly press Escape.
- No console errors or stale selections should appear.

---

## 🟡 FIX-06: `toggleNotes` Clobbers Code Layout Mode (BUG-06)

**Severity:** Medium — user accidentally loses Code view

### Root Cause

[`TabBar.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/TabBar.tsx#L22) defines `toggleNotes` as always toggling between `split` and `canvas-only`. In `code` mode, the tab bar is visible, but clicking the notes toggle switches away from Code view unexpectedly.

### Fix

**File:** [`src/components/TabBar.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/TabBar.tsx#L22)

Replace the `toggleNotes` definition:
```diff
-  const toggleNotes = () => setLayoutMode(layoutMode === 'split' ? 'canvas-only' : 'split');
+  const toggleNotes = () => {
+    if (layoutMode === 'code' || layoutMode === 'visualizer') return;
+    setLayoutMode(layoutMode === 'split' ? 'canvas-only' : 'split');
+  };
```

### Verify

- Switch to Code view from the toolbar.
- Click the notes toggle button in the tab bar — nothing should happen.
- Switch to Split or Canvas-only — the toggle should work normally.

---

## 🟢 FIX-07: `canvasFiles` Accumulates Deleted Image Blobs (DESIGN-02)

**Severity:** Low — gradual storage bloat leading to `QuotaExceededError`

### Root Cause

[`workspaceStore.ts`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/store/workspaceStore.ts#L297-L299) merges `canvasFiles` via spread without ever removing orphaned entries. Deleted images remain in the store and get persisted to IndexedDB on every save.

### Fix

**File:** [`src/store/workspaceStore.ts`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/store/workspaceStore.ts#L283-L301)

Replace the `updateCanvas` action:
```typescript
updateCanvas: (elements, appState, files = {}) => {
  const persistedAppState = {
    theme: appState.theme || 'dark',
    viewBackgroundColor: appState.viewBackgroundColor,
    gridSize: appState.gridSize,
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
    zoom: appState.zoom,
  };

  // Merge new files into the pool, then prune any files no longer
  // referenced by the current set of elements so deleted images
  // don't accumulate in storage indefinitely.
  const mergedFiles = { ...get().canvasFiles, ...files };
  const referencedIds = new Set(
    elements
      .filter((el: any) => !el.isDeleted && el.fileId)
      .map((el: any) => el.fileId)
  );
  const prunedFiles: Record<string, any> = {};
  for (const [id, file] of Object.entries(mergedFiles)) {
    if (referencedIds.has(id)) {
      prunedFiles[id] = file;
    }
  }

  set({
    canvasElements: elements,
    canvasAppState: persistedAppState,
    canvasFiles: prunedFiles,
  });
  scheduleAutoSave();
},
```

### Verify

- Add an image to the Excalidraw canvas.
- Delete the image.
- Export workspace JSON and inspect — the file blob should NOT appear in `canvasFiles`.

---

## 🟢 FIX-08: `.gitignore` Missing `*.tsbuildinfo` (DESIGN-04)

**Severity:** Low — build cache files could be accidentally committed

### Fix

**File:** [`.gitignore`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/.gitignore)

Add after the `dist-ssr` line:
```diff
 dist
 dist-ssr
+*.tsbuildinfo
 *.local
```

### Verify

- Run `npm run build` — confirm `*.tsbuildinfo` files are generated but `git status` doesn't show them.

---

## 🟢 FIX-09: Dead `IS_PREACT` Define in `vite.config.ts` (DESIGN-05)

**Severity:** Low — misleading dead configuration

### Fix

**File:** [`vite.config.ts`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/vite.config.ts)

Remove the `define` block entirely:
```diff
 export default defineConfig({
   base: './',
   server: { port: Number(process.env.PORT) || 5173 },
   plugins: [react(), tailwindcss()],
-  define: {
-    'process.env.IS_PREACT': JSON.stringify('true'),
-  },
 })
```

### Verify

- Run `npm run dev` — app should start normally.
- Run `npm run build` — build should succeed.

---

## 🟢 FIX-10: No React Error Boundary (DESIGN-06)

**Severity:** Low — any unhandled error in a child component blanks the entire app

### Fix

**Step 1:** Create a new file `src/components/ErrorBoundary.tsx`:

```typescript
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error in React tree:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-canvas text-ink font-mono">
          <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
            <div className="text-2xl">⚠️</div>
            <h1 className="text-sm font-semibold">Something went wrong</h1>
            <p className="text-xs text-mute leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="px-4 py-2 text-xs rounded-md bg-link text-white hover:bg-link-deep transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-[11px] text-mute hover:text-ink cursor-pointer"
            >
              Reload the app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2:** Wrap `<App />` in the error boundary in [`src/main.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/main.tsx):

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
```

### Verify

- Temporarily throw an error inside a component (e.g. add `throw new Error('test')` in `VisualizerNode`).
- The error boundary should catch it and show a recovery UI instead of a blank screen.
- Click "Try Again" — the app should attempt to re-render.

---

## 🟢 FIX-11: `CommandPalette` Keyboard Handler Has Same Stale Closure Pattern (Bonus)

**Severity:** Low — same pattern as BUG-04 but lower impact since no layout/tab state is captured

**File:** [`src/components/CommandPalette.tsx`](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/components/CommandPalette.tsx#L43-L66)

### Fix

Add missing dependencies to the keyboard handler `useEffect`:

```diff
-  }, [isOpen, filteredStructures, selectedIndex]);
+  }, [isOpen, filteredStructures, selectedIndex, onClose, showNotification]);
```

### Verify

- Open command palette (Ctrl+K), use arrow keys and Enter — structures should insert correctly.

---

## Execution Order

Run fixes in this exact order to avoid conflicts:

| Step | Fix | File(s) Modified |
|------|-----|-----------------|
| 1 | FIX-01 | `workspaceStore.ts`, `Toolbar.tsx` |
| 2 | FIX-03 | `Toolbar.tsx` |
| 3 | FIX-02 | `Canvas.tsx` |
| 4 | FIX-04 + FIX-05 | `SearchPalette.tsx` (apply together) |
| 5 | FIX-06 | `TabBar.tsx` |
| 6 | FIX-07 | `workspaceStore.ts` |
| 7 | FIX-08 | `.gitignore` |
| 8 | FIX-09 | `vite.config.ts` |
| 9 | FIX-10 | New `ErrorBoundary.tsx`, `main.tsx` |
| 10 | FIX-11 | `CommandPalette.tsx` |

> [!IMPORTANT]
> FIX-01 and FIX-03 both modify `Toolbar.tsx` — apply them together.
> FIX-04 and FIX-05 both modify `SearchPalette.tsx` — apply them together.
> FIX-01 and FIX-07 both modify `workspaceStore.ts` — apply them together.

## Final Verification

After all fixes, run:
```bash
npm run build
```
The TypeScript compiler + Vite build should succeed with zero errors. Then run `npm run dev` and manually verify:

1. Multi-tab export/import round-trips correctly (3 tabs → export → clear → import → 3 tabs back)
2. Canvas loads correctly on first load (no blank canvas)
3. Search palette works (Ctrl+F, Ctrl+Shift+F) with correct navigation
4. Code view toggle doesn't get clobbered by the notes toggle
5. Error boundary catches errors gracefully
