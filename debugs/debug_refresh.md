# 🔄 Debug: State Lost on Page Refresh

## Problem
When a user refreshes the browser tab, several pieces of app state are silently wiped because they are never written to IndexedDB. The user loses their current view, visualizer work, and is forced back to the landing page.

---

## Audit: What Survives vs. What Dies

| State | Persisted? | Where | Status |
|---|---|---|---|
| Notes (markdown) | ✅ Yes | IndexedDB → `tabs[].notes` | **OK** |
| Canvas elements | ✅ Yes | IndexedDB → `tabs[].canvasElements` | **OK** |
| Canvas appState (zoom, scroll, bg) | ✅ Yes | IndexedDB → `tabs[].canvasAppState` | **OK** |
| Canvas files (images) | ✅ Yes | IndexedDB → `tabs[].canvasFiles` | **OK** |
| Code editor content | ✅ Yes | IndexedDB → `tabs[].code` | **OK** |
| Code language selection | ✅ Yes | IndexedDB → `tabs[].codeLanguage` | **OK** |
| Active tab ID | ✅ Yes | IndexedDB → `activeTabId` | **OK** |
| All tabs | ✅ Yes | IndexedDB → `tabs[]` | **OK** |
| Theme (light/dark) | ✅ Yes | `localStorage` → `scratchpad-theme` | **OK** |
| **Layout mode** (split/canvas/notes/code/visualizer) | ❌ **NO** | Hardcoded to `'split'` on init | **LOST** |
| **Split width** (canvas/notes ratio) | ❌ **NO** | Hardcoded to `65` on init | **LOST** |
| **Last split width** | ❌ **NO** | Hardcoded to `65` on init | **LOST** |
| **Visualizer nodes** (algorithm cards on canvas) | ❌ **NO** | Hardcoded to `[]` on init | **LOST** |
| **Landing page bypass** | ❌ **NO** | `useState(!isElectron)` — always `true` on web | **LOST** |
| Structures panel open/width | ❌ No | React state only | Acceptable (UI pref) |
| Search palette state | ❌ No | React state only | Acceptable (ephemeral) |

---

## Root Cause Analysis

### 1. `WorkspaceData` interface is too narrow

In [indexedDB.ts](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/db/indexedDB.ts#L17-L26), the `WorkspaceData` type only defines:

```typescript
export interface WorkspaceData {
  tabs: TabData[];
  activeTabId: string;
  updatedAt: number;
  // legacy fields...
}
```

It has **no fields** for `layoutMode`, `splitWidth`, `lastSplitWidth`, or `visualizerNodes`.

### 2. `saveCurrentWorkspace()` only saves tabs

In [workspaceStore.ts](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/store/workspaceStore.ts#L350-L358):

```typescript
saveCurrentWorkspace: async () => {
  const tabs = reconcileTabs();
  const workspaceData: WorkspaceData = {
    tabs,
    activeTabId: get().activeTabId,
    updatedAt: Date.now(),
  };
  await saveWorkspace(workspaceData);
},
```

`layoutMode`, `splitWidth`, `lastSplitWidth`, and `visualizerNodes` are simply never included.

### 3. `initializeWorkspace()` never restores them

In [workspaceStore.ts](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/store/workspaceStore.ts#L243-L255), the `set()` call on load only restores tab data:

```typescript
set({
  tabs, activeTabId,
  notes: active.notes,
  canvasElements: active.canvasElements,
  // ... but NO layoutMode, splitWidth, visualizerNodes
});
```

### 4. Landing page state is ephemeral React state

In [App.tsx](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/App.tsx#L34):

```typescript
const [isLandingActive, setIsLandingActive] = useState(!isElectron);
```

This always evaluates to `true` on web browsers, so every refresh shows the hero page.

---

## Fix Plan

### Fix 1: Expand `WorkspaceData` in `indexedDB.ts`

Add optional fields to the interface (optional keeps backward compat with existing saved data):

```diff
 export interface WorkspaceData {
   tabs: TabData[];
   activeTabId: string;
   updatedAt: number;
+  layoutMode?: string;
+  splitWidth?: number;
+  lastSplitWidth?: number;
+  visualizerNodes?: Array<{ id: string; algorithmId: string; x: number; y: number }>;
   // Legacy fields...
 }
```

---

### Fix 2: Save the missing state in `saveCurrentWorkspace()`

```diff
 saveCurrentWorkspace: async () => {
   const tabs = reconcileTabs();
+  const { layoutMode, splitWidth, lastSplitWidth, visualizerNodes } = get();
   const workspaceData: WorkspaceData = {
     tabs,
     activeTabId: get().activeTabId,
+    layoutMode,
+    splitWidth,
+    lastSplitWidth,
+    visualizerNodes,
     updatedAt: Date.now(),
   };
   await saveWorkspace(workspaceData);
 },
```

---

### Fix 3: Restore the state in `initializeWorkspace()`

Inside the `set()` call after loading from IndexedDB:

```diff
 set({
   tabs,
   activeTabId,
   notes: active.notes,
   canvasElements: active.canvasElements,
   canvasAppState: active.canvasAppState,
   canvasFiles: active.canvasFiles,
   code: active.code ?? '',
   codeLanguage: active.codeLanguage ?? 'cpp',
+  layoutMode: (saved as any).layoutMode || 'split',
+  splitWidth: (saved as any).splitWidth ?? 65,
+  lastSplitWidth: (saved as any).lastSplitWidth ?? 65,
+  visualizerNodes: (saved as any).visualizerNodes || [],
   lastImportTime: Date.now(),
   isLoading: false,
   saveStatus: 'saved',
 });
```

> [!NOTE]
> The fallback defaults (`'split'`, `65`, `[]`) guarantee that users with old IndexedDB data (before this fix) still get a working app — no migrations needed.

---

### Fix 4: Skip landing page on return visits via `localStorage`

**In `App.tsx`**, change the landing state initialization:

```diff
- const [isLandingActive, setIsLandingActive] = useState(!isElectron);
+ const [isLandingActive, setIsLandingActive] = useState(
+   !isElectron && !localStorage.getItem('dsadelta_launched')
+ );
```

**In the `onLaunch` callback** (the hero page "Launch App" button):

```diff
 onLaunch={() => {
+  localStorage.setItem('dsadelta_launched', '1');
   if (document.startViewTransition) {
     document.startViewTransition(() => setIsLandingActive(false));
   } else {
     setIsLandingActive(false);
   }
 }}
```

> [!IMPORTANT]
> The DSADelta logo click (`goToLanding`) should **NOT** clear this localStorage flag. That way clicking the logo shows the hero temporarily, but the next refresh still goes straight to the workspace.

---

## Files to Modify

| File | Change |
|---|---|
| [indexedDB.ts](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/db/indexedDB.ts) | Add 4 optional fields to `WorkspaceData` |
| [workspaceStore.ts](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/store/workspaceStore.ts) | Save & restore `layoutMode`, `splitWidth`, `lastSplitWidth`, `visualizerNodes` |
| [App.tsx](file:///Users/vansh_uni/Documents/GitClone_Projects/ScratchPad/src/App.tsx) | Use `localStorage` to skip landing on return visits |

## After the Fix

| State | Before Fix | After Fix |
|---|---|---|
| Layout mode | ❌ Resets to `split` | ✅ Restored from IndexedDB |
| Split width | ❌ Resets to `65%` | ✅ Restored from IndexedDB |
| Visualizer nodes | ❌ All gone | ✅ Restored from IndexedDB |
| Landing page | ❌ Always shown | ✅ Skipped after first launch |
| Notes / Canvas / Code / Tabs | ✅ Already works | ✅ Still works |

## Verification

After applying the fix:
1. Open the app → click "Launch App" → switch to **Visualizer** → add an algorithm node → refresh the page
2. **Expected**: App loads directly into the Visualizer with the algorithm node still present
3. Switch to **Split** view → drag the divider to 30/70 → refresh
4. **Expected**: App loads in Split view at the same 30/70 ratio
