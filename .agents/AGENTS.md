# ScratchPad / dsadelta - Project Overview & Agent Guidelines

This document provides comprehensive context, architectural guidelines, and technical documentation for AI agents working on the ScratchPad (dsadelta) codebase.

---

## 1. Tech Stack & Integration Overview

- **Frontend**: React 19, TypeScript, Vite
- **Desktop Packaging**: Electron, electron-builder (entry point: `main.cjs`)
- **Styling**: Tailwind CSS v4, Framer Motion, Vanilla CSS (`src/index.css`)
- **State Management**: Zustand (`src/store/workspaceStore.ts`)
- **Persistence**: IndexedDB (`src/db/indexedDB.ts`) with debounced auto-saving & structural cloning
- **Routing, SEO & Analytics**: React Router v7 (`App.tsx`), PostHog (`posthog-js`), `SEO.tsx`, `seoRoutes.ts`, dynamic `sitemap.xml` generation, Google AdSense auto-ads integration
- **Core Component Integrations**:
  - `Excalidraw` for canvas drawing and architectural diagramming
  - `Tiptap` v3 for rich-text Markdown notes editing with KaTeX LaTeX math support (`MathExtensions.tsx`) and embedded PDFs (`PdfEmbed.tsx`)
  - `CodeMirror` 6 + `Wandbox API` (`src/lib/wandbox.ts`) for multi-language code editing and remote execution (C++, Java, Python, Go, Rust, JavaScript)
  - `KaTeX` & `Highlight.js` for rendering math formulas and syntax-highlighted code blocks within blogs and notes

---

## 2. Architecture & Application Flow

1. **Global State Hub (`Zustand`)**
   - Managed in `src/store/workspaceStore.ts`.
   - Serves as the single source of truth for open workspace tabs, active view modes, color themes (dark/light), visualizer nodes, search palette states, and split pane widths.

2. **Local Persistence (`IndexedDB`)**
   - Managed in `src/db/indexedDB.ts`.
   - Debounces workspace state changes and persists them locally.
   - Employs structural cloning during serialization to handle circular references safely.

3. **Application Layout & View Routing (`App.tsx`)**
   - **Workspace Route (`/workspace`)**: Dynamic multi-pane environment supporting:
     - *Canvas-only view*
     - *Notes-only view*
     - *Split View* (interactive resizable divider)
     - *Code Runner* (full-screen CodeMirror editor connected to Wandbox)
     - *Algorithm Visualizer* (full-screen infinite pan/zoom canvas)
   - **Landing Page (`/`, `LandingPage.tsx`)**: High-converting showcase page with interactive mock workspace (`MockWorkspace.tsx`), visual morphing arena (`MorphingArena.tsx`), and hero search (`SearchHeroes.tsx`).
   - **Roadmap & Knowledge Graph Hub (`/roadmap`, `RoadmapPage.tsx`)**: Interactive domain learning roadmap with integrated article reader and dynamic routing (`/blog/:slug` redirects to the canonical roadmap concept).
   - **About / entity surface (`/about`, `AboutPage.tsx`)**: Canonical public description of AlgoGlyph, its audience, coverage, and product distinction.
   - **Public SEO build**: `SEO.tsx` owns reusable route metadata/schema, `siteIdentity.ts` owns canonical brand facts, `generateSitemap.js` includes only canonical finished content, and `generateStaticSeoPages.mjs` emits route-specific crawlable HTML after Vite builds. Unfinished syllabus articles remain reachable but are `noindex` and absent from the sitemap. `npm run test:seo` validates the contract.
   - **Global Keyboard Shortcuts**: Registered in `App.tsx`:
     - `Ctrl+B`: Toggle layout modes
     - `Ctrl+S`: Manual workspace save
     - `Ctrl+T`: Create new tab
     - `Ctrl+K`: Toggle Command Palette (`CommandPalette.tsx`)
     - `Ctrl+F`: Open global Search Palette (`SearchPalette.tsx`)

4. **Drawing Canvas (`Canvas.tsx` & `StructuresPanel.tsx`)**
   - Wraps Excalidraw.
   - Features pre-built Data Structures & Algorithms components (`src/config/dsaStructures.ts`).
   - `src/lib/insertStructure.ts` calculates non-overlapping coordinates when inserting new elements onto the board.
   - Imported Excalidraw libraries live in `public/libraries/*.json`; `scripts/generateLibraryCatalog.mjs` produces their compact searchable catalog. Canvas AI uses `src/lib/ai/libraryAssets.ts` to resolve prompt-context matches, clone and parameterize matching artwork for requested labels/counts/order/dimensions, place it behind grouped connector anchors, and fall back to generated primitives when nothing matches.

5. **Notes Editor (`Editor.tsx`, `MathExtensions.tsx`, `PdfEmbed.tsx`)**
   - Implements Tiptap v3.
   - Synchronizes raw Markdown content into `workspaceStore.ts`.
   - Exposed globally to allow cross-tab full-text search.

6. **Code Execution Engine (`CodeEditor.tsx` & `wandbox.ts`)**
   - Uses CodeMirror 6 with custom light/dark editor themes (`editorTheme.ts`).
   - Connects to the public Wandbox API (`src/lib/wandbox.ts`) for compiling and running code across multiple languages with stdout/stderr display.

7. **Algorithm Visualizer (`VisualizerWorkspace.tsx` / `VisualizerCanvas.tsx`)**
   - Operates on an infinite pan/zoom plane (`VisualizerCanvas.tsx`).
   - Cataloged in `src/config/algorithms.ts`, documentation in `src/config/algorithmDocs.ts`, and snippets in `src/config/algorithmSnippets.ts`.
   - `VisualizerNode.tsx` acts as an independent card hosting a playback timer.
   - Frame generator (`src/lib/algorithmFrames.ts`) produces step-by-step state snapshots rendered via DOM/SVG views (`src/components/visualizers/Visualizers.tsx`) (Array Bars, DP Tables, N-Queens Grid, Union-Find Trees, Graph Traversals).

8. **Learning Roadmap & Knowledge Graphs (`RoadmapPage.tsx`, `SystemDesignGraph.tsx`, `TopicDesignGraph.tsx`, `RoadmapConvergence.tsx`)**
   - Organizes knowledge into 6 core technical domains (`roadmapData.ts`):
     - Data Structures & Algorithms
     - System Design & Backend Systems
     - Machine Learning & AI Engineering
     - Operating Systems & Computer Architecture
     - Computer Networks & Protocols
     - Game Development & Graphics Engineering
   - Interactive node graphs and drawer detail views.

---

## 3. Technical Blog Ecosystem & Content Architecture

The application contains an extensive technical blog catalog integrated directly into the Roadmap interface:

1. **Canonical article bodies**:
   - Canonical long-form articles are separate Markdown files under `content/<topic>/<public-slug>.md`, with no nested topic/subtopic folders. DSA uses `content/dsa/`; topics not yet migrated retain their roadmap-zone folder. `src/config/contentScope.json` is the reversible live-content allowlist shared by the UI and SEO/build scripts; `src/config/activeContent.ts` filters the current website without deleting the complete catalogs.
   - `scripts/auditArticleInventory.mjs` reports the full roadmap article inventory against the populated canonical Markdown corpus. Its strict mode is the final-corpus gate.
   - `scripts/generateArticleIndex.mjs` validates those one-level sources and generates `src/generated/articleContent.ts`. The generated module is derived build input, never an editorial source.
   - `src/config/blogData.ts` retains the existing `BlogPost` metadata catalog and overlays each matching post with its canonical Markdown by public slug. Do not embed duplicate bodies in this file.
   - `src/config/deBlogData.ts` and `src/config/mlBlogData.ts` remain separate legacy catalogs for content not yet part of the canonical 26-article corpus.
   - `src/config/roadmapData.ts` connects roadmap subtopics to stable public `blogSlug` values, visualizers, snippets, and difficulty metadata. Physical topic folders do not change public URLs.
   - Primary article visuals are mapped deterministically from the public slug under `public/images/dsa/`, with the existing format fallback where applicable. Inline explanatory SVGs remain inside their canonical Markdown files.

2. **Canonical article contract**:
   - Each source has one H1 and the eight subject-specific semantic H2 stages documented in `docs/article-authoring.md`.
   - Markdown uses `$...$` and `$$...$$` for KaTeX, renderer-safe code-fence labels, and safe inline SVG only.
   - The eight-stage structure must organize real topic-specific material; never manufacture filler, copy a shared template body, or add placeholder sections.

3. **Blog Reader & Markdown Rendering Engine (`RoadmapPage.tsx`)**:
   - `articleMarkdownToHtml` parses Markdown strings into formatted HTML:
     - **Code Blocks**: Highlighted using `Highlight.js` with language detection.
     - **Math Expressions**: Parsed with `KaTeX` for inline (`$x$`) and display (`$$E=mc^2$$`) formulas.
     - **SVG Diagrams**: Embeds theme-aware SVG illustrations (`#light` and `#dark` hash tags for automatic dark/light mode toggles).
     - **Visualizer Links**: Integrates direct action buttons jumping to interactive visualizer nodes (`visualizerId`).

---

## 4. Writing, Generating & Validating Canonical Articles

The canonical workflow is intentionally direct:

1. Create or edit exactly one source at `content/<topic>/<public-slug>.md` using `docs/article-authoring.md`; DSA articles belong directly in `content/dsa/`.
2. Preserve topic-specific substance and normalize only genuine structure, Markdown, LaTeX, code, trace, or visual defects. Do not use the retired JSON batch/extraction/injection pipeline.
3. Run `npm run content:index` to regenerate `src/generated/articleContent.ts` from Markdown.
4. Run `npm run content:inventory`, `npm run test:content`, `npm run build`, and `npm run test:seo`. The content validator checks source uniqueness, headings, KaTeX, fenced languages, SVG safety, deterministic images, metadata, roadmap routes, generated-index freshness, one-level folder structure, and sitemap inclusion.

Production discovery and SEO remain handled by the existing tools:

   - `scripts/generateSitemap.js`: Generates `public/sitemap.xml` from canonical public routes and finished roadmap content, with source-derived modification dates.
   - `scripts/generateStaticSeoPages.mjs`: Emits per-route HTML metadata, H1/intro content, breadcrumbs, internal links, and JSON-LD for direct deep-route requests.
   - `npm run test:seo`: Validates sitemap uniqueness, static route coverage, canonicals, JSON-LD, H1s, robots discovery, and internal route links.
   - `npm run test:mcp`: Runs the MCP connector's Node integration/security baseline against an isolated temporary loopback connector.
   - `npm run test:mcp:package -- --install-smoke`: Packs the npm artifact, performs an isolated clean install and production audit, then exercises connector health and the native Antigravity PTY path.
   - `npm run lint:mcp`: Lints the MCP connector, browser client, and production install-command UI without coupling a package release to unrelated generated-content lint debt.
   - `.github/workflows/publish-mcp.yml`: Manually publishes the verified connector from `main` with npm trusted publishing/OIDC after the npm package is configured to trust that exact workflow. Dependency installation and tests run without OIDC; only the minimal downstream publish job receives that permission.
   - `npm run test:diagrams`: Runs deterministic diagram layout, routing, and overlap regressions.

---

## 5. Agent Guidelines & Engineering Rules

- **Modifying Global State**: Any new global state properties must be declared in `src/store/workspaceStore.ts`. If they should persist across reloads, add them to `saveCurrentWorkspace` and ensure backward compatibility in `indexedDB.ts`.
- **Visualizer Nodes Playback**: Each `VisualizerNode.tsx` must keep its own rapid playback timer in local React state. Do not move high-frequency animation frames into the global Zustand store to avoid unnecessary root re-renders.
- **Excalidraw Integration**: Treat Excalidraw as an externally managed canvas. When updating drawings programmatically, call `updateScene` rather than triggering React state updates on the Excalidraw component.
- **Styling Standards**: Use Tailwind CSS v4 utility classes combined with custom CSS design tokens defined in `src/index.css`.
- **Search System**: Keep search indexing updated in `src/components/SearchPalette.tsx` whenever adding new user data forms or documentation modules.
- **Canonical Article Maintenance**: Edit canonical long-form bodies only under `content/<topic>/<public-slug>.md`, regenerate with `npm run content:index`, audit all-topic coverage with `npm run content:inventory` and DSA coverage with `npm run content:inventory:dsa`, then validate with `npm run test:content` plus `npm run test:seo`. Never edit `src/generated/articleContent.ts` directly or duplicate canonical bodies in `blogData.ts`.
