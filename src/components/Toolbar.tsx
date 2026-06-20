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
  Loader2,
  Check,
  AlertCircle,
  Sun,
  Moon
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

  // Trigger JSON download for workspace
  const handleExportWorkspace = () => {
    // Retrieve static workspace details from store without subscribing the render loop to changes
    const state = useWorkspaceStore.getState();
    const data = {
      notes: state.notes,
      canvasElements: state.canvasElements,
      canvasAppState: state.canvasAppState,
      canvasFiles: state.canvasFiles,
      version: 1,
      exportedAt: Date.now(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scratchpad-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trigger JSON upload/import
  const handleImportWorkspace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && (data.notes !== undefined || data.canvasElements !== undefined)) {
          await importWorkspace(data);
          showNotification('Workspace imported successfully', 'success');
        } else {
          showNotification('Invalid workspace file format', 'error');
        }
      } catch (err) {
        console.error('Import error:', err);
        showNotification('Failed to parse workspace JSON file', 'error');
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
    <header className="flex items-center justify-between px-4 py-2 bg-canvas/70 backdrop-blur-md border-b border-hairline text-body select-none h-12 flex-shrink-0 z-40">
      {/* Wordmark & save status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          {/* Brand mark — ink square with a crosshair, echoing the canvas grid */}
          <span className="grid h-5 w-5 place-items-center rounded-[5px] bg-ink text-canvas" aria-hidden>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 1.5v9M1.5 6h9" strokeLinecap="round" />
              <rect x="3.4" y="3.4" width="5.2" height="5.2" rx="0.6" />
            </svg>
          </span>
          <h1 className="font-display text-sm font-semibold tracking-[-0.02em] text-ink">Scratchpad</h1>
        </div>

        <div className="h-3.5 w-px bg-hairline" />

        {/* Save status */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {saveStatus === 'saving' && (
            <>
              <Loader2 size={11} className="animate-spin text-link" />
              <span className="text-mute">saving</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-mute">saved locally</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle size={11} className="text-rose-400" />
              <span className="text-rose-300">save failed</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <span className="text-mute/70">ready</span>
          )}
        </div>
      </div>

<<<<<<< Updated upstream
      {/* Center Layout Switchers */}
      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs">
        <button
          onClick={() => setLayoutMode('canvas-only')}
          className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            layoutMode === 'canvas-only'
              ? 'bg-zinc-800 text-zinc-100 font-medium'
              : 'hover:text-zinc-200'
          }`}
          title="Canvas Only"
        >
          <Maximize2 size={12} className="rotate-45" />
          <span>Canvas</span>
        </button>
        <button
          onClick={() => setLayoutMode('split')}
          className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            layoutMode === 'split'
              ? 'bg-zinc-800 text-zinc-100 font-medium'
              : 'hover:text-zinc-200'
          }`}
          title="Split View (Ctrl+B)"
        >
          <Monitor size={12} />
          <span>Split</span>
        </button>
        <button
          onClick={() => setLayoutMode('notes-only')}
          className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            layoutMode === 'notes-only'
              ? 'bg-zinc-800 text-zinc-100 font-medium'
              : 'hover:text-zinc-200'
          }`}
          title="Notes Only"
        >
          <Maximize2 size={12} className="-rotate-45" />
          <span>Notes</span>
        </button>
        <button
          onClick={() => setLayoutMode('code')}
          className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
            layoutMode === 'code'
              ? 'bg-zinc-800 text-zinc-100 font-medium'
              : 'hover:text-zinc-200'
          }`}
          title="Code Runner"
        >
          <Code2 size={12} />
          <span>Code</span>
        </button>
=======
      {/* Center: layout segmented control — white pill on a soft track */}
      <div className="flex items-center gap-0.5 bg-canvas-soft border border-hairline rounded-lg p-0.5 text-[13px]">
        {([
          ['canvas-only', 'Canvas', <Maximize2 key="c" size={12} className="rotate-45" />, 'Canvas only'],
          ['split', 'Split', <Monitor key="s" size={12} />, 'Split view  ·  ⌘B'],
          ['notes-only', 'Notes', <Maximize2 key="n" size={12} className="-rotate-45" />, 'Notes only'],
        ] as const).map(([mode, label, icon, title]) => (
          <button
            key={mode}
            onClick={() => setLayoutMode(mode)}
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
>>>>>>> Stashed changes
      </div>

      {/* Actions (Export, Import) */}
      <div className="flex items-center gap-2">
        {/* Hidden File Input for Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
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

        <div className="h-3.5 w-px bg-hairline mx-1" />

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          title="Import workspace JSON"
        >
          <Upload size={13} />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportWorkspace}
          className="px-2.5 py-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          title="Export workspace JSON"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export</span>
        </button>

        <div className="h-3.5 w-px bg-hairline mx-1" />

        {/* Export Notes */}
        <button
          onClick={handleExportNotes}
          className="px-2.5 py-1.5 rounded-md text-body hover:text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          title="Download notes as Markdown"
        >
          <Download size={13} />
          <span className="hidden sm:inline">.md</span>
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
          <span className="hidden sm:inline">.png</span>
        </button>
      </div>
    </header>
  );
};
