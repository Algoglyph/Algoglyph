# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Scratchpad is a local-first React + Electron desktop app that pairs an Excalidraw canvas, a TipTap markdown editor, a remote-execution code runner, and an algorithm visualizer in a tabbed workspace.

A detailed architecture/guidelines doc already exists at [.agents/AGENTS.md](.agents/AGENTS.md) — read it for deep dives. This file is the quick-start summary.

## Commands

```bash
npm run dev            # Vite dev server (web) on http://localhost:5173
npm run electron       # Launch Electron — in dev it loads localhost:5173, so run `npm run dev` first
npm run build          # tsc -b && vite build → emits web bundle to dist/ (does NOT package a desktop app)
npm run electron:build # build + electron-builder → packaged installers in release/ (nsis on Win, dmg on Mac)
npm run lint           # eslint . over all .ts/.tsx
npm run preview        # serve the built dist/ locally
```

Notes:
- There is **no test runner** configured — `lint` and `tsc -b` (via `build`) are the only automated checks.
- `tsconfig.app.json` sets `noUnusedLocals` / `noUnusedParameters`, so unused variables fail the build, not just lint.
- The README says `npm run build` "packages binaries" — that is inaccurate; use `electron:build` for installers.

## Run modes (web vs. Electron)

`main.cjs` is the Electron entry. In dev (`!app.isPackaged`) it loads `http://localhost:5173`; when packaged it loads `dist/index.html`. So the typical desktop dev loop is two terminals: `npm run dev` then `npm run electron`.

The app detects Electron via the user-agent string ([App.tsx](src/App.tsx)). When **not** in Electron (i.e. the browser), it shows [LandingPage.tsx](src/components/LandingPage.tsx) first (`isLandingActive = !isElectron`); inside Electron it boots straight into the workspace.

## Architecture

Single source of truth is a Zustand store; everything else is a view over it. Data flow: UI components → store actions → debounced persist to IndexedDB.

- **Store** — [src/store/workspaceStore.ts](src/store/workspaceStore.ts): all workspace state (tabs, active tab, notes/canvas/code per tab, layout mode, theme, visualizer nodes, search palette, notifications). New persistent state must be added to the `WorkspaceData` shape, `saveCurrentWorkspace`, and remain backward-compatible in the DB layer.
- **Persistence** — [src/db/indexedDB.ts](src/db/indexedDB.ts): one IndexedDB store with a single key `current-workspace` holding the whole `WorkspaceData` (all tabs). Auto-saves are debounced; state is structurally cloned before write to avoid circular-reference errors. Legacy single-document fields are kept optional for migration.
- **Layout** — [src/App.tsx](src/App.tsx): coordinates the panes and registers global shortcuts. `LayoutMode` is `'split' | 'canvas-only' | 'notes-only' | 'code' | 'visualizer'`; the draggable divider sets `splitWidth`.
- **Canvas** — [src/components/Canvas.tsx](src/components/Canvas.tsx) + [StructuresPanel.tsx](src/components/StructuresPanel.tsx): Excalidraw wrapper. Treat the Excalidraw instance as externally managed — push programmatic changes via its `updateScene` API, don't force React re-renders. Drag-drop DSA templates from [src/config/dsaStructures.ts](src/config/dsaStructures.ts); placement is computed by [src/lib/insertStructure.ts](src/lib/insertStructure.ts) to avoid overlaps.
- **Notes** — [src/components/Editor.tsx](src/components/Editor.tsx): TipTap v3; Markdown text is the source of truth synced back to the store. Exposed globally so the search palette can reach it.
- **Code runner** — [src/components/CodeEditor.tsx](src/components/CodeEditor.tsx) + [src/lib/wandbox.ts](src/lib/wandbox.ts): CodeMirror editor; compiles/runs via the public **wandbox.org** API. This is the **only** non-offline part of the app — it sends user code to a third party. Languages/compilers are declared in [src/config/languages.ts](src/config/languages.ts) (each entry maps to a Wandbox language + optional `preferPattern` to pin a compiler).
- **Visualizer** — [VisualizerWorkspace.tsx](src/components/VisualizerWorkspace.tsx) / [VisualizerCanvas.tsx](src/components/VisualizerCanvas.tsx): pan/zoom plane of movable [VisualizerNode.tsx](src/components/VisualizerNode.tsx) cards. Algorithms catalogued in [src/config/algorithms.ts](src/config/algorithms.ts); the engine [src/lib/algorithmFrames.ts](src/lib/algorithmFrames.ts) emits step frames rendered by [visualizers/Visualizers.tsx](src/components/visualizers/Visualizers.tsx). **Each node keeps its own playback timer in local state** — do not lift rapid playback into the Zustand store (avoids global re-renders).
- **Search** — [src/components/SearchPalette.tsx](src/components/SearchPalette.tsx): global text search across canvas text elements and markdown notes in all open tabs, then jumps to the match (switches tab, reveals pane, selects the element/text). `Ctrl/Cmd+F` = current tab, `Ctrl/Cmd+Shift+F` = all tabs. Integrate new searchable data forms here.

## Auth (optional Firebase)

[src/lib/auth.ts](src/lib/auth.ts) initializes Firebase Google sign-in **only if** `VITE_FIREBASE_API_KEY` is set (env vars live in a gitignored `.env`, prefixed `VITE_FIREBASE_*`). Without that config the app runs unauthenticated/local — auth is additive and not required for the core local-first workspace.

## Conventions

- Styling: Tailwind CSS v4 utilities (via `@tailwindcss/vite`) plus custom CSS tokens in [src/index.css](src/index.css). Theme is toggled by adding `.dark` to `<html>`.
- Canvas/app-state fields are intentionally typed `any[]` / `any` because they mirror Excalidraw's opaque scene format.
- For debugging, the store and the editor are attached to `window` at runtime.
