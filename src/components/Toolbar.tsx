import React, { useRef, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { exportToBlob } from '@excalidraw/excalidraw';
import {
  Upload,
  Download,
  Image as ImageIcon,
  Monitor,
  Maximize2,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  // Subscribe reactively ONLY to layout changes and save states
  const layoutMode = useWorkspaceStore((state) => state.layoutMode);
  const saveStatus = useWorkspaceStore((state) => state.saveStatus);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const importWorkspace = useWorkspaceStore((state) => state.importWorkspace);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

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
          viewBackgroundColor: appState.viewBackgroundColor || '#121214',
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
    <header className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-900 text-zinc-400 select-none h-12 flex-shrink-0 z-40">
      {/* Title & Status indicator */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-mono font-bold text-zinc-100 tracking-wider">SCRATCHPAD</h1>

        {/* Save status badge */}
        <div className="flex items-center gap-1.5 text-xs font-mono border border-zinc-800/80 bg-zinc-900/40 rounded-full px-2.5 py-0.5">
          {saveStatus === 'saving' && (
            <>
              <Loader2 size={11} className="animate-spin text-purple-400" />
              <span className="text-zinc-500">saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check size={11} className="text-emerald-500" />
              <span className="text-zinc-500">saved offline</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle size={11} className="text-rose-500" />
              <span className="text-rose-400">save error</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <span className="text-zinc-600">idle</span>
          )}
        </div>
      </div>

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

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
          title="Import Workspace JSON"
        >
          <Upload size={13} />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExportWorkspace}
          className="p-1.5 rounded hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
          title="Export Workspace JSON"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Export JSON</span>
        </button>

        <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

        {/* Export Notes */}
        <button
          onClick={handleExportNotes}
          className="p-1.5 rounded hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
          title="Download Notes as Markdown"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Notes (.md)</span>
        </button>

        {/* Export Drawing */}
        <button
          onClick={handleExportCanvas}
          disabled={exportingCanvas}
          className="p-1.5 rounded hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
          title="Export Canvas as PNG"
        >
          {exportingCanvas ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ImageIcon size={13} />
          )}
          <span className="hidden sm:inline">Canvas (.png)</span>
        </button>
      </div>
    </header>
  );
};
