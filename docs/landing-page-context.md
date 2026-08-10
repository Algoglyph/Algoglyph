# Archived Algoglyph Landing-Page Context

The Algoglyph landing page was intentionally cleared on August 10, 2026 so its next design can start from a blank slate. The former site header was restored afterward, but everything beneath it remains empty. This document preserves the former page's product story, exact hero copy, information architecture, interactions, and visual direction.

## Product and brand

- Product name: **Algoglyph**
- Legacy repository name: **dsadelta**
- Product category: local-first notes, infinite canvas, code runner, algorithm visualizer, and computer-science learning roadmap.
- Core promise: learners should be able to write, draw, execute, and visualize without moving between disconnected tools.
- Logo constraint: keep the existing `/favicon.png` asset unchanged in any future landing page.
- The browser landing page launches the shared React workspace; Electron skips the landing page.

## Former navigation

Brand:

> Algoglyph

Navigation items:

- Features
- Visualizers
- Use Cases
- Roadmap

Header action:

> Launch Workspace

The launch action called `onLaunch`. The roadmap action called `onViewRoadmap`.

## Former hero copy

Eyebrow:

> Visual Computer Science Workspace

Headline:

> Learn computer science visually.  
> with seamless note-making.  
> Connect AI agents through MCP.

Supporting paragraph:

> Notes, an infinite whiteboard, a code runner, and live visualizers, all in one place. Stop juggling six tabs and start seeing how computer science actually works, then check out the roadmap for 1000+ articles.

Actions:

- `Launch Free Workspace`
- `Explore CS Roadmap`

MCP connector content:

- Label: `Connect local agents`
- Runtime: `Node 20+`
- Command: `npx @algoglyph/mcp-connector`
- Connection note: `Auto-pairs with Algoglyph on 127.0.0.1:4319`
- Clipboard states: `Copy` and `Copied`

Small system labels:

- `Local-first / agent-ready`
- `Scroll to inspect the system ↓`

Former proof points:

- `4` — Tools in one workspace
- `∞` — Infinite canvas
- `13+` — Roadmap topics

Capability ticker:

- Notebook
- Infinite Canvas
- Sandbox Compiler
- State Visualizer
- Spatial Memory
- CS Roadmap

## Former connected product showcase

Heading:

> Watch an agent build a complete study board.

Supporting copy:

> Notes, canvas, and visualizer stay in sync while MCP turns intent into a workspace you can keep editing.

The showcase told one synchronized Dijkstra story instead of presenting four unrelated marketing cards:

1. The local MCP connector becomes ready.
2. An agent asks: `Build a Dijkstra study board for graph A–E. Add notes, draw the graph, then run the visualizer.`
3. Algoglyph creates a note explaining Dijkstra's shortest-path algorithm.
4. Algoglyph draws a rough, Excalidraw-style weighted graph on the infinite canvas.
5. The live visualizer starts at node A, updates its priority queue, and calculates the shortest paths.

The four synchronized panels were Agent/MCP, Notes, Infinite Canvas, and Live Visualizer. The animation provided Pause, Play, and Replay controls and resolved to its completed state for reduced-motion users.

## Former page structure and copy themes

### Workspace fragmentation

Heading:

> Why CS study can feel scattered across tools

The section contrasted a disconnected stack—YouTube walkthroughs, Notion or Markdown files, a local compiler terminal, and a physical sketchbook—with Algoglyph's unified feedback loop of canvas, notes, and compiler output.

### Infinite canvas

Heading:

> Infinite canvas for notes and templates

Key points:

- Pan, zoom, and build multi-structure diagrams.
- Excalidraw drawing engines integrated.
- Maintain coordinate states permanently.

### Notebook

Heading:

> Notebooks built for computer science

Key points:

- TipTap-powered rich-text workspace.
- LaTeX equation rendering.
- Hyperlink notebook sentences to canvas targets.

### Compiler

Heading:

> An Active Compiler

The page described running C++, Python, Java, and JavaScript through the Wandbox API, with output and execution logs shown beside diagrams.

### Visualizer

Heading:

> Watch memory reshape itself

The interactive stage transformed the same five values through these structures:

1. Array — contiguous memory, O(1) access, O(N) shifts.
2. Linked list — pointer relinking, O(1) modification, O(N) traversal.
3. Stack — LIFO push and pop operations.
4. Balanced binary-search tree — O(log N) search and rotations.
5. Graph — mesh relationships, BFS, and Dijkstra traversal.

### Concept lessons portal

Heading:

> Build a real intuition for algorithms

Roadmap cards covered Dynamic Programming, Pathfinding & Graphs, and Self-Balancing Trees.

### Connected learning cycle

The workflow was:

1. Read Concept — break down complex logic.
2. Draft Notes — detail variables in text.
3. Map Canvas — draw relationships visually.
4. Run Compiler — compile active logs.
5. Build Intuition — retain memory.

### Use cases

Heading:

> Designed for engineers, students, and educators

Use cases:

- Interview Prep
- Class Notes
- Self-Taught Learning
- Teaching & Demos
- Competitive Coding
- Quick Reference

### About

Heading:

> The mission behind Algoglyph

The mission copy explained that Algoglyph was built to replace fragmented notes and constant switching among tutorials, textbooks, editors, and scratchpads with one visual workspace.

### Contact

Heading:

> Get in touch

The page used a Formspree form with name, email, and message fields.

### FAQ topics

- What is Algoglyph?
- How is Algoglyph different from Notion?
- Can users create visual computer-science notes?
- Does Algoglyph include interactive algorithm visualizers?
- Does it include a complete computer-science roadmap?
- Can notes connect across topics?
- Can users write code while studying?
- Is Algoglyph free?

### Final call to action

> Don't just use pen and paper. Use a workspace to connect the dots.

Supporting copy invited users to launch Algoglyph to build mental models, write code, and take seamless notes in a unified CS sandbox.

## Previous visual direction

The last design used a dark, Composio-inspired developer-tool composition without copying Composio assets or branding:

- Full-viewport black hero.
- Mirrored diagonal ASCII streams concentrated at the left and right edges.
- Wide, quiet center for the primary statement.
- Geist and Geist Mono typography.
- White primary actions, hairline borders, and restrained blue, cyan, and emerald accents.
- Square or minimally rounded controls instead of pill-heavy floating cards.
- Dense product-instrument panels across the rest of the page.
- No large video, heavy 3D, generic gradient blobs, or glass-card collage.

The design intentionally prioritized strong product evidence, restrained motion, accessibility, and a clear visual hierarchy over decorative effects.

## Technical context for a future implementation

- Landing route component: `src/components/LandingPage.tsx`
- The component still accepts `onLaunch`, `onViewRoadmap`, and optional `onViewBlog` callbacks for compatibility with `App.tsx`.
- Styling stack: Tailwind CSS v4 and the landing-page token namespace in `src/index.css`.
- Motion library: Framer Motion.
- Icons: Lucide React.
- Code samples previously used CodeMirror.
- Any new hero animation must respect `prefers-reduced-motion`, pause while off-screen, and avoid expensive continuous React state updates.
- The page must remain responsive at narrow mobile widths and keyboard accessible.

## Current state

`src/components/LandingPage.tsx` currently renders only the restored dark site header: the original favicon logo and Algoglyph wordmark, Features/Visualizers/Use Cases links, the Roadmap action, and the Launch Workspace action. No hero, showcase, feature section, form, footer, or background animation is rendered beneath it. This document remains the source of truth for the removed landing-page context.
