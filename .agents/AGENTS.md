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
  - Optional Firebase Google authentication on the web; identity never gates or synchronizes the local workspace

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

9. **Optional Web Authentication (`AuthProvider.tsx` & `firebaseAuth.ts`)**
   - The shared provider lazily loads the modular Firebase SDK after the initial app render and exposes Google sign-in state/actions to the landing and workspace account controls.
   - Authentication is optional and identity-only. It never gates `/workspace`, uploads IndexedDB content, or identifies users to PostHog.
   - Missing `VITE_FIREBASE_*` values and Electron disable authentication cleanly; there is no mock-user fallback.

---

## 3. Technical Blog Ecosystem & Content Architecture

The application contains an extensive technical blog catalog integrated directly into the Roadmap interface:

1. **Blog Data Storage**:
   - `src/config/blogData.ts`: Core `BlogPost` interface and primary article catalog (`BLOG_POSTS`) covering Data Structures, Algorithms, Systems, Databases, Networks, OS, System Design, Software Engineering, and Theoretical CS.
   - `src/config/deBlogData.ts`: Dictionary (`deBlogData: Record<string, string>`) storing Data Engineering, Distributed Systems, Message Brokers, CDC, Consensus (Raft/Paxos), and Backend articles.
   - `src/config/mlBlogData.ts`: Dictionary (`ML_BLOG_DATA: Record<string, string>`) storing Machine Learning, Deep Learning, Transformers, LLM RAG/Fine-Tuning, Quantization, and MLOps articles.
   - `src/config/roadmapData.ts`: Connects every subtopic in the roadmap to its designated `blogSlug`, `visualizerId`, code snippet, and difficulty rating.
   - **Illustration Assets** (`illustrationData.ts`, `deIllustrationData.ts`, `mlIllustrationData.ts`, `topicIllustrationData.ts`): Inline SVG visual diagrams mapped to topics for rich rendering.

2. **BlogPost Data Contract**:
   - `slug`: Unique identifier string (e.g. `arrays`, `de-message-tools`, `kmp-algorithm`).
   - `title` & `tagline`: Article title and summary subtitle.
   - `markdown`: In-depth technical Markdown text containing LaTeX math equations (`$$...$$` or `$...$`), inline SVG architecture diagrams, hardware cache locality insights, comparative C++/Python implementations, concept check Q&A, and LeetCode practice problems.
   - `category`, `readTime`, `lastUpdated`, `prerequisites`, `related`, `nextTopic`, `prevTopic`, `practiceProblems`, `visualizerId`.

3. **Blog Reader & Markdown Rendering Engine (`RoadmapPage.tsx`)**:
   - `articleMarkdownToHtml` parses Markdown strings into formatted HTML:
     - **Code Blocks**: Highlighted using `Highlight.js` with language detection.
     - **Math Expressions**: Parsed with `KaTeX` for inline (`$x$`) and display (`$$E=mc^2$$`) formulas.
     - **SVG Diagrams**: Embeds theme-aware SVG illustrations (`#light` and `#dark` hash tags for automatic dark/light mode toggles).
     - **Visualizer Links**: Integrates direct action buttons jumping to interactive visualizer nodes (`visualizerId`).

---

## 4. Mechanisms Used to Write, Generate & Manage Blogs

Writing and maintaining hundreds of deep technical articles in the project is driven by an automated Python and Node.js scripting pipeline:

1. **Structured Content Generation**:
   - Python generation scripts (`.scratch_gen.py`, `generate_json.py`, `generate_json_correct.py`, `make_json.py`, `save_batch_V.py`) construct structured Markdown articles containing LaTeX math, inline SVGs, code implementations, hardware analysis, and concept check questions.
   - Output files are generated into JSON batch structures (`scratch/batch_*.json`, `articles.json`, `extracted_articles.json`, `scratch/system_design_batch*.py`).

2. **Batch Integration & Injection Pipeline**:
   - `integrate_batch.py` & `integrate_scratch.py`: Python scripts that read JSON batch files, safely escape string literals (e.g., backticks `\`` and template strings `${}`), and dynamically replace empty slot placeholders (`'de-xxx': ''`) in `deBlogData.ts` with complete raw Markdown template literals.
   - `add_backend_batch1_entries.cjs` & `add_backend_batch2_entries.cjs`: Node.js scripts that dynamically register new backend and game development blog entries into `blogData.ts` and `roadmapData.ts`.
   - `inject_batch2.cjs`, `inject_phase1.cjs`, `inject_phase2.cjs`: Node.js scripts for bulk appending article objects into `blogData.ts`.
   - `update_deBlogData.py`, `update_de_blog_data.py`, `update_AB.py`, `update_batch_m.py`: Python helper utilities for maintaining synchronization across dictionary entries.

3. **Backtick Fixers & Code Block Cleaners**:
   - `fix_backticks.py` & `fix_backticks_new.py`: Python cleanup tools that inspect TypeScript configuration files, repair corrupted Markdown code fences, escape inner backticks, and ensure valid JS/TS template literal syntax.
   - `fix_blogs.cjs`: Node.js utility for formatting code snippets and escaping special characters.

4. **Auditing & Verification Tools**:
   - `check_articles.py`, `check_code.py`, `check_backend_status.cjs`, `find_missing_blogs.cjs`: Audit scripts that verify that every roadmap concept maps to a valid non-empty blog slug, ensure syntax highlighting blocks compile without syntax errors, and flag missing articles.
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
- **Blog Content Maintenance**: When adding or updating blog posts in `blogData.ts`, `deBlogData.ts`, or `mlBlogData.ts`, ensure template literal backticks are properly escaped (`\``) and run `check_articles.py` / `check_code.py` to confirm slug mapping and syntax highlighting validity.
