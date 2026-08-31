# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

Scratchpad (legacy name: **dsadelta**) is a local-first notes + infinite-canvas workspace for DSA practice. It runs both as a web app (Vite dev server) and as an Electron desktop app from the same `src/` bundle. There is also a more granular architecture write-up in [.agents/AGENTS.md](.agents/AGENTS.md) — keep both in sync when changing structure.

## Commands

```bash
npm run dev            # Vite dev server on http://localhost:5173 (web app)
npm run build          # tsc -b (typecheck) then vite build → dist/
npm run test:mcp       # MCP connector integration/security baseline
npm run lint:mcp       # MCP connector, browser client, and install-command UI lint
npm run build:functions # Typecheck the Firebase billing backend
npm run test:billing   # Billing/provider unit tests
npm run test:firebase  # Firestore rules + transactional backend tests (Java 21+)
npm run test:diagrams  # Deterministic diagram layout and overlap regressions
npm run preview        # serve the built dist/ locally (verify a production build)
npm run lint           # eslint . (flat config in eslint.config.js)
npm run electron       # launch Electron against a RUNNING dev server (see below)
npm run electron:build # npm run build + electron-builder → release/ (nsis/dmg)
```

- **Running the desktop app in dev requires two processes**: `main.cjs` loads `http://localhost:5173` when not packaged, so run `npm run dev` first, then `npm run electron` in a second shell. The packaged build instead loads `dist/index.html`. The dev URL in `main.cjs` is **hardcoded to 5173** even though `vite.config.ts` honors a `PORT` env var — so don't override `PORT`, or Electron will point at the wrong (empty) port.
- **Testing is focused rather than repository-wide.** `npm run test:mcp` uses Node's built-in test runner against a real temporary loopback connector process; `npm run test:mcp:package -- --install-smoke` verifies the packed package, dependency signatures/audit, clean install, health, and native PTY; `npm run lint:mcp` checks the release surface. Billing changes also require `npm run test:billing` and the Java-21-backed `npm run test:firebase` emulator gate. `npm run test:diagrams` checks deterministic layout/overlap regressions. General verification still includes `npm run lint` plus the typecheck that `npm run build` performs (`tsc -b`). `tsconfig.app.json` enables `noUnusedLocals`/`noUnusedParameters`, so unused code fails the build. Production MCP publishing is gated by `.github/workflows/publish-mcp.yml` after configuring npm trusted publishing for that exact workflow; only its minimal post-verification job receives OIDC publish authority.
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

### Public discovery surfaces
Public routes include the landing page, `/about`, `/workspace`, the `/roadmap` hierarchy, privacy, terms, and the 404 page. Canonical brand facts live in `src/config/siteIdentity.ts`; reusable route metadata/schema lives in `src/components/SEO.tsx`. `scripts/generateSitemap.js` submits only canonical finished resources, while `scripts/generateStaticSeoPages.mjs` emits route-specific crawlable HTML after the Vite build (unfinished syllabus entries remain reachable but `noindex`). Run `npm run test:seo` after changing routing, public content, metadata, sitemap logic, or static generation.

### Cross-component coordination via `window` globals
Several modules talk through globals instead of props: `window.excalidrawAPI` (set by `Canvas.tsx`, used by structure insertion + search), `window.notesEditor` (TipTap instance, used by search), `window.useWorkspaceStore`, and `window.goToLanding`. The `SearchPalette` drives both of these to jump to and highlight matches across tabs.

### Render-independence of the heavy editors (do not regress)
- **`Canvas.tsx`** deliberately does *not* subscribe to `canvasElements`/`canvasAppState`/tool state. It reads them imperatively (`useWorkspaceStore.getState()`) and only re-syncs the Excalidraw scene when `lastImportTime` bumps. Treat Excalidraw as externally managed: update it with `excalidrawAPI.updateScene(...)`, not React re-renders.
- Both `Canvas` and `CodeEditor` are mounted with `key={activeTabId}` so they remount per tab instead of leaking a previous tab's scene/buffer through a stale `onChange`.
- **`Editor.tsx`** (TipTap) treats the stored `notes` as a **markdown string** (`contentType: 'markdown'`) — both on init and on `setContent`. Don't switch it to HTML or remounts will render raw markdown source.

### Two distinct "DSA" systems — don't conflate them
1. **Canvas structures** — `src/config/dsaStructures.ts` generates static Excalidraw element skeletons (rectangles/circles/arrows) dropped onto the drawing canvas; `src/lib/insertStructure.ts` places them without overlap. Imported libraries live in `public/libraries/*.json`; `scripts/generateLibraryCatalog.mjs` builds their compact metadata index. Canvas AI resolves requested CS components contextually through `src/lib/ai/libraryAssets.ts`, clones and parameterizes matching assets for requested labels/counts/order/dimensions, lays them out using invisible grouped anchors, and falls back to generated primitives when no asset is available.
2. **Algorithm visualizer** — `src/config/algorithms.ts` is the catalog (metadata only); `src/lib/algorithmFrames.ts` turns sample inputs into ordered immutable *frames*; `src/components/visualizers/Visualizers.tsx` renders each frame type (array bars, graphs, grids, DP tables…). The UI chain is `VisualizerWorkspace.tsx` (picks algos from `AlgorithmSidebar.tsx`) → `VisualizerCanvas.tsx` (infinite pan/zoom plane) → `VisualizerNode.tsx` (one movable playback card per active algorithm). The visualizer is a **global** workspace (not per-tab), which is why `TabBar` is hidden in that mode. **Each `VisualizerNode` owns its playback timer in local component state** — keep rapid playback state out of the Zustand store to avoid re-rendering siblings.
   - **Frame generation dispatch (`getFrames` in `algorithmFrames.ts`):** a per-id entry in the `GENERATORS` map wins if present; otherwise it falls back to `generateDynamicFrames(id, category, …)`, a big `category`-keyed switch. Short sequences are padded to ≥20 frames by `expandFrames`. Graph-based frames reuse a fixed shared `TRAVERSAL_GRAPH`, and `snapshotGraph` keys edge highlights by exact `${from}-${to}` — referencing an edge that doesn't exist in the spec silently renders nothing, so check the spec's edge list when highlighting.

### Code runner (the only non-local-first feature)
`CodeEditor.tsx` + `src/lib/wandbox.ts` send code to the public **Wandbox** API for remote compile/run; this is the only feature that needs the network. `src/config/languages.ts` maps each language to its Wandbox compiler (`wandboxLanguage` + optional `preferPattern` regex), its CodeMirror highlighting extension, and a starter template.

### Auth + paid MCP (optional, web only)
`src/components/AuthProvider.tsx` owns shared identity and narrowly scoped ID-token/App Check retrieval while lazily loading `src/lib/firebaseAuth.ts`. Google sign-in never gates `/workspace`, uploads IndexedDB workspace data, or identifies users to PostHog; it is required only when a user opens paid MCP. Missing Firebase configuration and Electron disable auth/billing without affecting the local workspace.

`firebase-functions/` is the trusted boundary for personal billing workspaces, Stripe/Razorpay hosted checkout, raw-body webhook verification, canonical subscriptions, 72-hour renewal grace, entitlements, and single-use connector grants. Firestore client rules deny every direct read/write. `src/lib/billing/` is only a typed authenticated API client; never place prices, provider secrets, payment truth, or entitlement mutation in the browser. The official connector is protocol v3: it redeems an origin/pairing/version/scope-bound grant directly against the fixed production backend, creates sessions for at most 30 minutes, rejects the operator token on browser-origin requests, and fails closed on entitlement outages. Keep workspace content and prompts out of Firebase and billing logs. Deployment and incident procedures live in `docs/billing-deployment.md`.

The project-scoped `.mcp.json` registers the official Firebase MCP server through pinned `firebase-tools@15.28.1` with `--only auth`. Claude Code must approve the project server once, and the server then uses the Firebase CLI user's credentials. Treat `auth_update_user` and other mutating Firebase tools as production changes: confirm the active project and exact user before approving them. Do not broaden the enabled feature groups unless the application starts using those Firebase services.

## Conventions
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with design tokens defined via `@theme` in `src/index.css` — use the semantic token classes (`text-ink`, `text-body`, `bg-canvas`, `bg-canvas-soft`, `border-hairline`, `text-link`, etc.) rather than raw hex. The token set follows a Vercel/Geist look; light + `:root.dark` variants exist. The landing page uses a **separate** token namespace (`[data-landing-theme]` → `--lp-*`).
- New persisted store state must be initialized in `workspaceStore.ts`, included in `saveCurrentWorkspace`, and kept backward-compatible in `indexedDB.ts` migration.
- React 19; icons from `lucide-react`; animations from `framer-motion`.

## Imported Claude Cowork project instructions

Give me Plans, Ideas and Functionality of how to execute this project into claude code
