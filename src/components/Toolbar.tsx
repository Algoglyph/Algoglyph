import React, { useRef, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { exportToBlob } from '@excalidraw/excalidraw';
import {
  Upload,
  Download,
  Image as ImageIcon,
  Monitor,
  Maximize2,
  Code2,
  Workflow,
  Loader2,
  Check,
  AlertCircle,
  Sun,
  Moon,
  MoreHorizontal
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  // Subscribe reactively ONLY to layout changes and save states
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);
  const saveStatus = useWorkspaceStore((state) => state.saveStatus);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const importWorkspace = useWorkspaceStore((state) => state.importWorkspace);
  const showNotification = useWorkspaceStore((state) => state.showNotification);
  const theme = useWorkspaceStore((state) => state.theme);
  const toggleTheme = useWorkspaceStore((state) => state.toggleTheme);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportingCanvas, setExportingCanvas] = useState(false);
  // Mobile-only overflow menu holding the Import/Export actions.
  const [menuOpen, setMenuOpen] = useState(false);

  // Trigger MD download for workspace
  const handleExportWorkspace = () => {
    // Retrieve static workspace details from store without subscribing the render loop to changes
    const state = useWorkspaceStore.getState();
    const data = {
      canvasElements: state.canvasElements,
      canvasAppState: state.canvasAppState,
      canvasFiles: state.canvasFiles,
      visualizerNodes: state.visualizerNodes,
      layoutMode: state.layoutMode,
      version: 2,
      exportedAt: Date.now(),
    };
    
    const fileContent = `${state.notes}

---
<!-- SCRATCHPAD_WORKSPACE_DATA_START -->
<details>
<summary>Workspace Data (Do not edit)</summary>

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
</details>
<!-- SCRATCHPAD_WORKSPACE_DATA_END -->
`;

    const blob = new Blob([fileContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scratchpad-workspace-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trigger MD upload/import
  const handleImportWorkspace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        
        let data: any = null;
        let isLegacyJson = false;
        
        if (file.name.endsWith('.json')) {
          try {
            data = JSON.parse(content);
            isLegacyJson = true;
          } catch(err) {}
        }

        if (!isLegacyJson) {
          const startIndex = content.indexOf('<!-- SCRATCHPAD_WORKSPACE_DATA_START -->');
          const endIndex = content.indexOf('<!-- SCRATCHPAD_WORKSPACE_DATA_END -->');

          if (startIndex !== -1 && endIndex !== -1) {
            const jsonSection = content.substring(startIndex, endIndex);
            const jsonMatch = jsonSection.match(/```json\n([\s\S]*?)\n```/);
            
            if (jsonMatch) {
              data = JSON.parse(jsonMatch[1]);
              let notesContent = content.substring(0, startIndex).trim();
              if (notesContent.endsWith('---')) {
                notesContent = notesContent.slice(0, -3).trim();
              }
              data.notes = notesContent;
            }
          } else {
             // Treat as a plain markdown file - only update notes
             const state = useWorkspaceStore.getState();
             data = {
               notes: content,
               canvasElements: state.canvasElements,
               canvasAppState: state.canvasAppState,
               canvasFiles: state.canvasFiles,
               visualizerNodes: state.visualizerNodes,
               layoutMode: state.layoutMode
             };
          }
        }

        if (data && (data.notes !== undefined || data.canvasElements !== undefined)) {
          await importWorkspace(data);
          showNotification('Workspace imported successfully', 'success');
        } else {
          showNotification('Invalid workspace file format', 'error');
        }
      } catch (err) {
        console.error('Import error:', err);
        showNotification('Failed to parse workspace file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Trigger MD download for notes
  const handleExportNotes = () => {
    const state = useWorkspaceStore.getState();
    const blob = new Blob([state.notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scratchpad-notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Excalidraw canvas as PNG
  const handleExportCanvas = async () => {
    const api = (window as any).excalidrawAPI;
    if (!api) {
      showNotification('Canvas is not ready for export yet', 'error');
      return;
    }

    const elements = api.getSceneElements();
    if (!elements || elements.length === 0) {
      showNotification('Canvas is empty. Draw something first!', 'error');
      return;
    }

    try {
      setExportingCanvas(true);
      const appState = api.getAppState();
      const files = api.getFiles();

      const blob = await exportToBlob({
        elements,
        appState: {
          ...appState,
          exportBackground: true,
          viewBackgroundColor: appState.viewBackgroundColor || (theme === 'dark' ? '#0a0a0a' : '#ffffff'),
        },
        files,
        mimeType: 'image/png',
        exportPadding: 20,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scratchpad-canvas-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Canvas exported as PNG', 'success');
    } catch (err) {
      console.error('Canvas export error:', err);
      showNotification('Failed to export canvas', 'error');
    } finally {
      setExportingCanvas(false);
    }
  };

  return (
    <header className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between px-4 py-2 bg-canvas/70 backdrop-blur-md border-b border-hairline text-body select-none h-12 flex-shrink-0 z-40">
      {/* Wordmark & save status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          {/* Brand mark — using the original favicon */}
          <span className="grid h-5 w-5 place-items-center" aria-hidden>
            <img src="/favicon.png" alt="dsadelta logo" className="w-full h-full object-contain" />
          </span>
          <h1 className="font-display text-sm font-semibold tracking-[-0.02em] text-ink">dsadelta</h1>
        </div>

        <div className="h-3.5 w-px bg-hairline" />

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {saveStatus === 'saving' && (
            <>
              <Loader2 size={11} className="animate-spin text-link" />
              <span className="hidden sm:inline text-mute">saving</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="hidden sm:inline text-mute">saved locally</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle size={11} className="text-rose-400" />
              <span className="hidden sm:inline text-rose-300">save failed</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <span className="text-mute/70">ready</span>
          )}
        </div>
      </div>

      {/* Center: layout segmented control — white pill on a soft track.
          Hidden on mobile, where the bottom nav handles view switching. */}
      <div className="hidden md:flex items-center gap-0.5 bg-canvas-soft border border-hairline rounded-lg p-0.5 text-[13px]">
        {([
          ['canvas-only', 'Canvas', <Maximize2 key="c" size={12} className="rotate-45" />, 'Canvas only'],
          ['split', 'Split', <Monitor key="s" size={12} />, 'Split view  ·  ⌘B'],
          ['notes-only', 'Notes', <Maximize2 key="n" size={12} className="-rotate-45" />, 'Notes only'],
          ['code', 'Code', <Code2 key="code" size={12} />, 'Code Runner'],
          ['visualizer', 'Visualizer', <Workflow key="viz" size={12} />, 'Algorithm Visualizer'],
        ] as const).map(([mode, label, icon, title]) => (
          <button
            key={mode}
            onClick={() => setLayoutMode(mode as any)}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer font-medium ${
              layoutMode === mode
                ? 'bg-canvas text-ink shadow-[var(--shadow-soft)] ring-1 ring-hairline'
                : 'text-body hover:text-ink'
            }`}
            title={title}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Actions (Export, Import) */}
      <div className="flex items-center justify-end gap-2">
        {/* Hidden File Input for Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.json"
          onChange={handleImportWorkspace}
          className="hidden"
        />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center cursor-pointer"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Desktop action cluster — collapses into the overflow menu on mobile. */}
        <div className="hidden md:flex items-center gap-2">
          <div className="h-3.5 w-px bg-hairline mx-1" />

          {/* Import MD */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title="Import workspace MD"
          >
            <Upload size={13} />
            <span>Import</span>
          </button>

          {/* Export MD */}
          <button
            onClick={handleExportWorkspace}
            className="px-2.5 py-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title="Export workspace MD"
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          <div className="h-3.5 w-px bg-hairline mx-1" />

          {/* Export Notes */}
          <button
            onClick={handleExportNotes}
            className="px-2.5 py-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            title="Download notes as Markdown"
          >
            <Download size={13} />
            <span>.md</span>
          </button>

          {/* Export Drawing */}
          <button
            onClick={handleExportCanvas}
            disabled={exportingCanvas}
            className="px-2.5 py-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1.5 text-xs font-mono disabled:opacity-50 cursor-pointer"
            title="Export canvas as PNG"
          >
            {exportingCanvas ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ImageIcon size={13} />
            )}
            <span>.png</span>
          </button>
        </div>

        {/* Mobile overflow menu — same actions as the desktop cluster. */}
        <div className="md:hidden relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center cursor-pointer"
            title="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={16} />
          </button>

          {menuOpen && (
            <>
              {/* Click-away backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 z-50 min-w-44 rounded-lg border border-hairline bg-canvas shadow-[var(--shadow-soft)] py-1 text-xs font-mono"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-body hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer"
                >
                  <Upload size={13} /> Import workspace
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleExportWorkspace();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-body hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer"
                >
                  <Download size={13} /> Export workspace
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleExportNotes();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-body hover:text-ink hover:bg-canvas-soft transition-colors cursor-pointer"
                >
                  <Download size={13} /> Export notes (.md)
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    handleExportCanvas();
                  }}
                  disabled={exportingCanvas}
                  className="w-full px-3 py-2 flex items-center gap-2 text-body hover:text-ink hover:bg-canvas-soft transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ImageIcon size={13} /> Export canvas (.png)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
