# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Scratchpad (legacy name: **dsadelta**) is a local-first notes + infinite-canvas workspace for DSA practice. It runs both as a web app (Vite dev server) and as an Electron desktop app from the same `src/` bundle. There is also a more granular architecture write-up in [.agents/AGENTS.md](.agents/AGENTS.md) — keep both in sync when changing structure.

## Commands

```bash
npm run dev            # Vite dev server on http://localhost:5173 (web app)
npm run build          # tsc -b (typecheck) then vite build → dist/
npm run lint           # eslint . (flat config in eslint.config.js)
npm run electron       # launch Electron against a RUNNING dev server (see below)
npm run electron:build # npm run build + electron-builder → release/ (nsis/dmg)
```

- **Running the desktop app in dev requires two processes**: `main.cjs` loads `http://localhost:5173` when not packaged, so run `npm run dev` first, then `npm run electron` in a second shell. The packaged build instead loads `dist/index.html`. The dev URL in `main.cjs` is **hardcoded to 5173** even though `vite.config.ts` honors a `PORT` env var — so don't override `PORT`, or Electron will point at the wrong (empty) port.
- **There is no test runner.** "Verification" here means `npm run lint` plus the typecheck that `npm run build` performs (`tsc -b`). `tsconfig.app.json` enables `noUnusedLocals`/`noUnusedParameters`, so unused code fails the build.
- `vite.config.ts` sets `base: './'` (relative asset paths) so the same build works under Electron's `file://`.
- **`build/icon.png` is a committed *source* asset, not generated output** — it's the electron-builder app icon (`package.json` → `build.{win,mac}.icon`). The generated outputs are `dist/` (web bundle) and `release/` (packaged installers); only those are gitignored. Don't delete or gitignore `build/`.

## Architecture

### State + persistence (the core to understand first)
- **`src/store/workspaceStore.ts`** (Zustand) is the single source of truth: tabs, active-tab content, layout, theme, visualizer nodes, notifications.
- **Live-mirror pattern (non-obvious, easy to break):** the *active* tab's content lives in flat top-level store fields (`notes`, `canvasElements`, `canvasAppState`, `canvasFiles`, `code`, `codeLanguage`). The matching entry inside `tabs[]` is **stale** until `reconcileTabs()` folds the mirror back in — which happens on save, tab switch, tab close, and import. When you switch/close/create a tab, you must reconcile first or you lose the current tab's edits. Editor/Canvas/CodeEditor read and write these mirror fields, never `tabs[]` directly.
- **Persistence** (`src/db/indexedDB.ts`): one IndexedDB record under a fixed key, autosaved via a 1s debounce (`scheduleAutoSave`). The DB is opened *without a fixed version* on purpose (forcing a version throws `VersionError` against DBs created by newer builds). `toCloneSafe()` deep-copies the snapshot dropping functions/cycles/non-cloneable values so a single bad value can't permanently break every save. `initializeWorkspace`/`importWorkspace` migrate the legacy single-document format into the multi-tab format.
- Theme is persisted separately in `localStorage` (`scratchpad-theme`) and reflected onto `<html class="dark">`.

### Layout (`src/App.tsx`)
`layoutMode` ∈ `split | canvas-only | notes-only | code | visualizer`. Split mode resizes the Canvas/Notes panes via `splitWidth` (a draggable divider); `code` and `visualizer` are full-area panes. Global shortcuts are registered here (Ctrl/Cmd: B=cycle layout, S=save, T=new tab, K=DSA command palette, F=search this tab, Shift+F=search all tabs). **Bare single-key tool shortcuts** (no modifier) are registered separately in `Canvas.tsx` and only fire when the canvas is focused: T=text, D=freedraw, E=eraser, A=arrow, L=line, R=rectangle. On mobile (`useIsMobile`) it collapses to one pane + `MobileNav`. The **landing page** (`LandingPage.tsx`) only shows in the browser, never in Electron (`isLandingActive = !isElectron`).

### Cross-component coordination via `window` globals
Several modules talk through globals instead of props: `window.excalidrawAPI` (set by `Canvas.tsx`, used by structure insertion + search), `window.notesEditor` (TipTap instance, used by search), `window.useWorkspaceStore`, and `window.goToLanding`. The `SearchPalette` drives both of these to jump to and highlight matches across tabs.

### Render-independence of the heavy editors (do not regress)
- **`Canvas.tsx`** deliberately does *not* subscribe to `canvasElements`/`canvasAppState`/tool state. It reads them imperatively (`useWorkspaceStore.getState()`) and only re-syncs the Excalidraw scene when `lastImportTime` bumps. Treat Excalidraw as externally managed: update it with `excalidrawAPI.updateScene(...)`, not React re-renders.
- Both `Canvas` and `CodeEditor` are mounted with `key={activeTabId}` so they remount per tab instead of leaking a previous tab's scene/buffer through a stale `onChange`.
- **`Editor.tsx`** (TipTap) treats the stored `notes` as a **markdown string** (`contentType: 'markdown'`) — both on init and on `setContent`. Don't switch it to HTML or remounts will render raw markdown source.

### Two distinct "DSA" systems — don't conflate them
1. **Canvas structures** — `src/config/dsaStructures.ts` generates static Excalidraw element skeletons (rectangles/circles/arrows) dropped onto the drawing canvas; `src/lib/insertStructure.ts` places them without overlap.
2. **Algorithm visualizer** — `src/config/algorithms.ts` is the catalog (metadata only); `src/lib/algorithmFrames.ts` turns sample inputs into ordered immutable *frames*; `src/components/visualizers/Visualizers.tsx` renders each frame type (array bars, graphs, grids, DP tables…). The visualizer is a **global** workspace (not per-tab), which is why `TabBar` is hidden in that mode. **Each `VisualizerNode` owns its playback timer in local component state** — keep rapid playback state out of the Zustand store to avoid re-rendering siblings.

### Code runner (the only non-local-first feature)
`CodeEditor.tsx` + `src/lib/wandbox.ts` send code to the public **Wandbox** API for remote compile/run; this is the only feature that needs the network. `src/config/languages.ts` maps each language to its Wandbox compiler (`wandboxLanguage` + optional `preferPattern` regex), its CodeMirror highlighting extension, and a starter template.

### Auth (optional, mostly dormant)
`src/lib/auth.ts` wraps Firebase Google sign-in but falls back to a **mock auth mode** when `VITE_FIREBASE_*` env vars are absent (the default). Storage/user keys still use the legacy `dsadelta-` prefix.

## Conventions
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with design tokens defined via `@theme` in `src/index.css` — use the semantic token classes (`text-ink`, `text-body`, `bg-canvas`, `bg-canvas-soft`, `border-hairline`, `text-link`, etc.) rather than raw hex. The token set follows a Vercel/Geist look; light + `:root.dark` variants exist. The landing page uses a **separate** token namespace (`[data-landing-theme]` → `--lp-*`).
- New persisted store state must be initialized in `workspaceStore.ts`, included in `saveCurrentWorkspace`, and kept backward-compatible in `indexedDB.ts` migration.
- React 19; icons from `lucide-react`; animations from `framer-motion`.
