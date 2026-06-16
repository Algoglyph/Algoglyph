# Scratchpad

Scratchpad is a fast, local-first thinking workspace designed for developers, students, and problem solvers. Inspired by the simplicity of Obsidian, the drawing capability of Excalidraw, and the feel of a rough notebook on a desk, it links an infinite drawing canvas and a rich markdown notes editor side-by-side on a single screen.

There is no onboarding, no templates gallery, no accounts, and no cloud dependency. The workspace opens instantly, persisting everything locally in the browser.

---

## 🚀 Key Features

*   **Split-Screen Workspace**: Resizable double-pane layout initializing at a **65:35 (Canvas : Notes)** ratio to provide maximum drawing space.
*   **Infinite Drawing Canvas**: Powered by a heavily customized dark-themed Excalidraw instance. All Excalidraw branding, default menu links, welcome screen graphics, social buttons, and help overlays have been completely removed for a clean, distraction-free product feel.
*   **Rich Markdown Editor**: Built with TipTap, supporting standard Markdown styling, resizable tables, task checklists, and code blocks with syntax highlighting. Includes a custom floating monospace search/find panel (`Ctrl+F`).
*   **DSA Structures Panel**: A collapsable sidebar displaying 14 custom DSA templates (Data Structures & Algorithm concepts). Items can be **clicked** to center on the canvas or **dragged-and-dropped** directly, with mouse coordinates translated dynamically through viewport zoom/scroll spaces.
    *   *Data Structures*: Array, Linked List, Doubly Linked List, Binary Tree, BST, Heap, Stack, Queue, Graph.
    *   *Algorithm Templates*: Sliding Window, Fast-Slow Pointer, DFS, BFS, Two Pointers.
*   **Fully Editable Structures**: Generated components are built from native Excalidraw elements. All text labels and values are bound and grouped with their parent shapes, allowing you to double-click nodes to edit their values natively and move them together.
*   **Global Command Palette (`Ctrl+K`)**: Monospace keyboard-first search menu to fuzzy match, navigate (arrow keys), and instantly insert structures at the center of the canvas viewport.
*   **Offline-First Autosave**: State is managed via Zustand and automatically autosaved to browser-native IndexedDB. Saves are debounced to ensure layout resizing, typing, and drawing remain lag-free.
*   **Custom Toast Popups**: Standard browser alerts have been replaced with a monospace, floating notification popup component aligned to the bottom-center, themed according to the notification type (`success`, `error`, `info`).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Toggle the DSA Command Palette |
| `Ctrl + B` / `Cmd + B` | Cycle layout modes (`Split` ⇄ `Canvas Only` ⇄ `Notes Only`) |
| `Ctrl + S` / `Cmd + S` | Force manual workspace save |
| `Ctrl + F` / `Cmd + F` | Toggle floating find/search menu in Notes editor |
| `T` | Switch Canvas to **Text tool** (when editor is not focused) |
| `D` | Switch Canvas to **Freedraw tool** (when editor is not focused) |
| `E` | Switch Canvas to **Eraser tool** (when editor is not focused) |
| `A` | Switch Canvas to **Arrow tool** (when editor is not focused) |
| `L` | Switch Canvas to **Line tool** (when editor is not focused) |
| `R` | Switch Canvas to **Rectangle tool** (when editor is not focused) |

---

## 🛠️ Technology Stack

*   **Frontend Framework**: React 19 + TypeScript + Vite
*   **Styling**: Tailwind CSS v4 (Vanilla styling tokens)
*   **Drawing Engine**: `@excalidraw/excalidraw`
*   **Rich Text Editor**: `@tiptap/react` + `@tiptap/starter-kit` + `lowlight` (syntax highlighting)
*   **State Management**: `zustand` (granular selectors optimized to prevent canvas pointer loop re-renders)
*   **Database**: Native browser IndexedDB
*   **Icons**: `lucide-react`

---

## ⚙️ Installation & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```
The application will start running on [http://localhost:5173/](http://localhost:5173/).

### 3. Build for Production
```bash
npm run build
```
Generates optimized code-split production bundles inside the `dist` folder.

---

## 📂 Project Architecture

```
Scratchpad/
├── src/
│   ├── assets/           # Application assets & favicons
│   ├── components/       # React UI Components
│   │   ├── Canvas.tsx          # Excalidraw Canvas wrapper & drops
│   │   ├── Editor.tsx          # TipTap Notes Editor & find panel
│   │   ├── Toolbar.tsx         # Header, Layout controls, Import/Export
│   │   ├── StructuresPanel.tsx # Sidebar drag-and-drop DSA items
│   │   ├── CommandPalette.tsx  # Ctrl+K Command overlay
│   │   └── NotificationToast.tsx # Monospace custom popups
│   ├── config/           # Configuration files
│   │   └── dsaStructures.ts    # 14 DSA element definitions & text binding
│   ├── db/               # Database wrapper
│   │   └── indexedDB.ts        # Promise-based IndexedDB manager
│   ├── store/            # State management
│   │   └── workspaceStore.ts   # Zustand state, auto-save & notifications
│   ├── index.css         # Tailwind v4 imports, Obsidian styles, & brand overrides
│   ├── main.tsx          # Application bootstrapper
│   └── App.tsx           # Layout shell, resizer, global key hooks
├── index.html            # Main HTML document
├── package.json          # Dependency manifest
└── vite.config.ts        # Vite, Tailwind CSS v4, define-inject configs
```

---

## 🔒 Local & Secure

Scratchpad is 100% serverless. All notebooks, canvas vector strokes, uploaded files, and markdown documents remain entirely inside your local browser storage. You can safely import and export your workspaces as raw JSON files, or export notes as markdown (`.md`) and canvas sheets as images (`.png`).
