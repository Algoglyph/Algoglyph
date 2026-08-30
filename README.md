# Scratchpad

Scratchpad combines notes and an infinite canvas in a single workspace.

It is a local-first desktop application designed for developers, students, and problem solvers to organize diagrams, code notes, and algorithmic templates side-by-side. By integrating a spatial canvas with a rich markdown editor, Scratchpad provides a distraction-free environment for visual thinking.

## Screenshots

![Main Workspace](./screenshots/main.png)

![Canvas](./screenshots/canvas.png)

![Notes](./screenshots/notes.png)

## Core Features

- **Infinite Canvas**: Draw diagrams, construct custom flowcharts, and sketch designs on an unconstrained canvas powered by Excalidraw.
- **Markdown Notes**: Write structured documentation, tables, and code snippets in a rich markdown pane powered by TipTap.
- **Workspace Tabs**: Keep multiple scratchpads open in one window. Each tab holds its own notes, canvas, and code, with double-click rename and one-click close.
- **Code Runner**: A LeetCode-style code editor (the **Code** view) with syntax highlighting, a language picker, stdin, and a Run button that compiles and runs your code via the public Wandbox API — C++, C, Python, Java, JavaScript, TypeScript, Go, and Rust. (This view requires internet, since execution happens on a remote runner.)
- **Search Palette**: One command-palette UI for finding text across your notes and canvas, then jumping straight to a match — switching tabs, revealing the right pane, and selecting the matched note text or canvas element automatically. `Ctrl/Cmd+F` scopes it to the current tab; `Ctrl/Cmd+Shift+F` (or the tab-bar search icon) searches every open tab.
- **Local-First Architecture**: Your workspace data is saved entirely on your local machine using client-side storage.
- **Offline Support**: Fully functional without internet connectivity, ensuring you can work from anywhere.
- **Import / Export**: Save work as portable JSON files, export notes to Markdown, or save canvas sketches as images.
- **Structure Templates**: Quickly drag, drop, and edit pre-built templates for common data structures and algorithm patterns.
- **Fast Performance**: Optimized rendering ensures typing, drawing, and UI resizing remain responsive.
- **Dark Mode**: A unified dark interface designed to reduce eye strain during long-duration sessions.

## Use Cases

- **DSA Practice**: Visualize tree traversals, stack behaviors, or queue operations alongside implementation notes.
- **LeetCode Problem Solving**: Map out problem logic and edge cases visually before writing code.
- **Interview Preparation**: Practice system design or coding interviews in a mock whiteboard environment.
- **System Design**: Draft network diagrams, database schemas, and application architecture.
- **Brainstorming**: Sketch ideas, wireframes, and concept maps dynamically.
- **Learning and Note Taking**: Maintain structured programming notes alongside conceptual drawings.

## Keyboard Shortcuts

| Command | Action |
|:---|:---|
| `Ctrl + K` / `Cmd + K` | Open the DSA structure command palette |
| `Ctrl + F` / `Cmd + F` | Open the search palette scoped to the current tab |
| `Ctrl + Shift + F` / `Cmd + Shift + F` | Open the search palette across all tabs |
| `Ctrl + T` / `Cmd + T` | Open a new tab |
| `Ctrl + B` / `Cmd + B` | Cycle layout modes (Split, Canvas Only, Notes Only) |
| `Ctrl + S` / `Cmd + S` | Force manual workspace save |
| `T` | Select Text tool (Canvas focused) |
| `D` | Select Freedraw tool (Canvas focused) |
| `E` | Select Eraser tool (Canvas focused) |
| `A` | Select Arrow tool (Canvas focused) |
| `L` | Select Line tool (Canvas focused) |
| `R` | Select Rectangle tool (Canvas focused) |

## Tech Stack

- **React**: Frontend UI framework.
- **TypeScript**: Static typing for robust application state.
- **Electron**: Desktop container for cross-platform execution.
- **Excalidraw**: High-performance canvas drawing engine.
- **TipTap**: Extensible rich-text editor toolkit.
- **Tailwind CSS**: Utility-first styling framework.
- **Firebase Authentication**: Optional Google identity for the web app; workspace content remains local.

## Philosophy

- **Local-first**: You own your data. Files are kept on your hard drive, not on third-party servers.
- **No account required**: Optional Google sign-in never gates the workspace; anonymous use remains available instantly.
- **No workspace cloud dependency**: Notes, canvas data, and code remain local even when a user signs in.
- **No distractions**: A minimalist, utility-focused layout designed to keep you in flow.
- **Fast and lightweight**: Debounced auto-saves and targeted React updates to ensure smooth operation on standard developer hardware.

## Download

Pre-built Windows installers are available under [GitHub Releases](https://github.com/VarunArora24/Scratchpad/releases). Download the executable to run the desktop application natively.

## Installation & Development

To clone, set up, and run the development environment locally:

```bash
# Clone the repository
git clone https://github.com/VarunArora24/Scratchpad.git
cd Scratchpad

# Install project dependencies
npm install

# Start the local development server
npm run dev
```

### Optional Google authentication

Copy `.env.example` to `.env.local` and fill it with the web-app configuration from Firebase Console. Enable the Google provider in Firebase Authentication and authorize the domains used for development and deployment (`localhost`, `algoglyph.com`, and any preview domain that should support sign-in). Without these variables, the app continues to run anonymously and hides its account controls.

The `VITE_FIREBASE_*` values are Firebase web-app identifiers, not Admin SDK credentials. Never put a service-account key, OAuth client secret, or other server credential in a `VITE_*` variable. Keep the Firebase API key restricted to Firebase APIs and remove authorized domains that are no longer used.

To show the AlgoGlyph name and icon on Google's sign-in and consent screens:

1. Open the Firebase project's Google Cloud project, then go to **Google Auth Platform → Branding**.
2. Set the app name to **AlgoGlyph**, upload `public/favicon.png` as the square app logo, and set the support email.
3. Set the homepage to `https://algoglyph.com`, privacy policy to `https://algoglyph.com/privacy`, and terms to `https://algoglyph.com/terms`.
4. Add and verify `algoglyph.com` as an authorized domain, choose the intended audience, then submit the branding for verification. Google does not display a custom production name/logo until brand verification is approved.

Firebase uses the configured `VITE_FIREBASE_AUTH_DOMAIN` as the OAuth helper domain. If the Google flow still says it is continuing to a `*.firebaseapp.com` address, serve Firebase's `/__/auth/` helper on a verified custom domain (for example, `auth.algoglyph.com`), authorize `https://auth.algoglyph.com/__/auth/handler` for the OAuth client, and use that host as `VITE_FIREBASE_AUTH_DOMAIN`. Do not change this value until the custom helper domain or transparent proxy is live, or sign-in will fail.

## Build Instructions

To build and package the application for desktop distribution:

```bash
# Compile and package binaries
npm run build
```

This compiles the frontend assets and packages the Electron application into the `release/` directory using `electron-builder`.

## Project Directory Structure

```
Scratchpad/
├── src/
│   ├── assets/           # Media assets and desktop icons
│   ├── components/       # Core UI and layout components
│   │   ├── Canvas.tsx          # Excalidraw drawing wrapper
│   │   ├── Editor.tsx          # TipTap rich-text editor
│   │   ├── CodeEditor.tsx      # CodeMirror code runner (Wandbox API)
│   │   ├── Toolbar.tsx         # Workspace controls and actions
│   │   ├── TabBar.tsx          # Workspace tab strip (switch/add/rename/close)
│   │   ├── StructuresPanel.tsx # DSA template sidebar
│   │   ├── CommandPalette.tsx  # DSA structure insertion palette
│   │   ├── SearchPalette.tsx   # Cross-tab notes search palette
│   │   └── NotificationToast.tsx # Custom system feedback notifications
│   ├── config/           # Static configurations and structures
│   ├── db/               # IndexedDB database wrappers
│   ├── store/            # Zustand global workspace store
│   ├── index.css         # Styling and custom theme configuration
│   ├── main.tsx          # Application entry point
│   └── App.tsx           # Layout workspace resizer
├── index.html            # Main HTML document
├── package.json          # Dependency and build scripts
└── vite.config.ts        # Vite building configurations
```

## Roadmap

- **Better Structure Templates**: Expand templates for recursion trees, matrix systems, and custom graphs.
- **Command Palette**: Add direct shortcuts, theme switching, and quick navigation capabilities.
- **Improved Export Options**: Add direct PDF and JSON schema export features, including multi-tab workspace export.

## Repository Improvements

### Ignored Compiler Output and Packaged Binaries
- **Current issue**: The workspace generates typescript build cache files (`.tsbuildinfo`) and local configuration files, which can accidentally get committed if they are not explicitly listed in `.gitignore`.
- **Why it matters**: Accidental commits of build cache files or developer environment files pollute the history, bloat the repository size, and cause unnecessary merge conflicts.
- **Recommended fix**: Extend the `.gitignore` configuration to explicitly exclude all TypeScript caches, environment configurations, and build/compilation artifacts.

