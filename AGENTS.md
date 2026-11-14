# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

Scratchpad (legacy name: **dsadelta**) is a local-first notes + infinite-canvas workspace for DSA practice. It runs both as a web app (Vite dev server) and as an Electron desktop app from the same `src/` bundle. There is also a more granular architecture write-up in [.agents/AGENTS.md](.agents/AGENTS.md) — keep both in sync when changing structure.

## Commands

```bash
npm run dev            # Vite dev server on http://localhost:5173 (web app)
npm run build          # tsc -b (typecheck) then vite build → dist/
npm run test:mcp       # MCP connector integration/security baseline
npm run lint:mcp       # MCP connector, browser client, and install-command UI lint
npm run test:diagrams  # Deterministic diagram layout and overlap regressions
npm run content:inventory # Report roadmap article inventory vs canonical Markdown coverage
npm run test:content   # Canonical article, Markdown/LaTeX/SVG, route, image, and sitemap checks
npm run preview        # serve the built dist/ locally (verify a production build)
npm run lint           # eslint . (flat config in eslint.config.js)
npm run electron       # launch Electron against a RUNNING dev server (see below)
npm run electron:build # npm run build + electron-builder → release/ (nsis/dmg)
```

- **Running the desktop app in dev requires two processes**: `main.cjs` loads `http://localhost:5173` when not packaged, so run `npm run dev` first, then `npm run electron` in a second shell. The packaged build instead loads `dist/index.html`. The dev URL in `main.cjs` is **hardcoded to 5173** even though `vite.config.ts` honors a `PORT` env var — so don't override `PORT`, or Electron will point at the wrong (empty) port.
- **Testing is focused rather than repository-wide.** `npm run test:mcp` uses Node's built-in test runner against a real temporary loopback connector process; `npm run test:mcp:package -- --install-smoke` verifies the packed package, dependency signatures/audit, clean install, health, and native PTY; `npm run lint:mcp` checks the release surface; `npm run test:diagrams` checks deterministic layout/overlap regressions. General verification still includes `npm run lint` plus the typecheck that `npm run build` performs (`tsc -b`). `tsconfig.app.json` enables `noUnusedLocals`/`noUnusedParameters`, so unused code fails the build. Production MCP publishing is gated by `.github/workflows/publish-mcp.yml` after configuring npm trusted publishing for that exact workflow; only its minimal post-verification job receives OIDC publish authority.
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

Canonical long-form article bodies live only in `content/<topic>/<public-slug>.md`, with no nested topic/subtopic folders. DSA uses `content/dsa/`; topics not yet migrated retain their roadmap-zone folder. `src/config/contentScope.json` is the reversible live-content allowlist shared by the UI and SEO/build scripts; `src/config/activeContent.ts` applies it without deleting the full roadmap or article catalogs. `scripts/generateArticleIndex.mjs` builds the derived `src/generated/articleContent.ts` module consumed by `src/config/blogData.ts`; article metadata and stable public roadmap routes remain owned by the existing TypeScript catalogs. Never edit the generated module or reintroduce independent article-body copies in JSON/TypeScript. Use `npm run content:inventory` for the full roadmap and `npm run content:inventory:dsa` for the normalized DSA corpus. See `docs/article-authoring.md`, run `npm run content:index` after editing articles, and run `npm run test:content` plus `npm run test:seo` after content, route, image, or metadata changes.

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

### Code runner
`CodeEditor.tsx` + `src/lib/wandbox.ts` send code to the public **Wandbox** API for remote compile/run. `src/config/languages.ts` maps each language to its Wandbox compiler (`wandboxLanguage` + optional `preferPattern` regex), its CodeMirror highlighting extension, and a starter template.

### Auth (optional, web only)
`src/components/AuthProvider.tsx` owns the shared identity state and lazily imports `src/lib/firebaseAuth.ts`, keeping the Firebase SDK out of the initial bundle. The landing header and workspace toolbar consume that provider through explicit account-control variants. Google sign-in is optional and identity-only: it never gates `/workspace`, uploads IndexedDB workspace data, or identifies users to PostHog. Missing `VITE_FIREBASE_*` configuration and Electron both disable the auth controls without mock users or workspace impact.

The project-scoped `.mcp.json` registers the official Firebase MCP server through pinned `firebase-tools@15.28.1` with `--only auth`. Claude Code must approve the project server once, and the server then uses the Firebase CLI user's credentials. Treat `auth_update_user` and other mutating Firebase tools as production changes: confirm the active project and exact user before approving them. Do not broaden the enabled feature groups unless the application starts using those Firebase services.

### Billing and managed-agent entitlement (web only)
`src/components/BillingDialog.tsx` and `src/lib/billing/billingClient.ts` are an untrusted browser client for the Firebase Functions API under `firebase-functions/`. Stripe and Razorpay hosted checkout use server-owned plan identifiers and verified provider events to update server-owned `subscriptions` and `entitlements`; browser returns never grant access. The paid entitlement is `managedAgentAccess`, for either an individual or organization billing subject, and must be checked server-side through `canUseManagedAgent` before a hosted managed-agent operation. The local MCP connector is free and must never depend on billing. Provider credentials belong only in Firebase Functions secrets, never in `VITE_*` variables. BillDesk remains disabled until a real merchant contract and signing specification exist.

### Cloud workspaces and collaboration (web only)
`/workspace` remains the anonymous/local IndexedDB workspace. Authenticated cloud workspaces live at `/workspaces` and `/workspace/:workspaceId/canvas/:canvasId`. Core workspace and organization create/list/open operations use the Firebase client SDK and Firestore Security Rules, so they work on the Firebase Spark plan without Cloud Functions. Rules only allow an authenticated owner to atomically create their own organization/workspace and initial membership; workspace creation also creates its first canvas. Single-use invite links are random, stored as hashes, and accepted/revoked through rules-validated Firestore transactions. Cloudflare Pages serves `/workspaces` from `workspaces.html`; `functions/_middleware.ts` serves that app shell for direct workspace, canvas, and invite links so refreshes keep working. Workspace membership, not URL possession, authorizes access. All active canvases in a workspace are visible to its members and the canvas list is live; switching canvases remounts the Excalidraw scene. Collaborative elements remain independent Firestore documents reconciled by `(version, versionNonce)` with retained deletion tombstones. Image data is stored in bounded chunks under each canvas's `files` subcollection, and live cursors use expiring documents under `presence`; `src/lib/workspaces/canvasCollaboration.ts` owns these listeners and write lifecycles. Owner-initiated workspace deletion removes its canvases, assets, invites, and memberships. Organization deletion preserves and unlinks its workspaces. Deletion progresses through a resumable `deleting` status. Cloud MCP token operations, billing, and hosted-agent authorization still use `firebase-functions/src/workspaces.ts` and `firebase-functions/src/index.ts` when that API is deployed. Cloud MCP bearer tokens are workspace-scoped, stored only as hashes, and never consult billing. The paid hosted execution endpoint separately rechecks `managedAgentAccess` on every run.

## Conventions
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with design tokens defined via `@theme` in `src/index.css` — use the semantic token classes (`text-ink`, `text-body`, `bg-canvas`, `bg-canvas-soft`, `border-hairline`, `text-link`, etc.) rather than raw hex. The token set follows a Vercel/Geist look; light + `:root.dark` variants exist. The landing page uses a **separate** token namespace (`[data-landing-theme]` → `--lp-*`).
- New persisted store state must be initialized in `workspaceStore.ts`, included in `saveCurrentWorkspace`, and kept backward-compatible in `indexedDB.ts` migration.
- React 19; icons from `lucide-react`; animations from `framer-motion`.

## Imported Claude Cowork project instructions

Give me Plans, Ideas and Functionality of how to execute this project into claude code
