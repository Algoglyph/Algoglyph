import { create } from 'zustand';
import { saveWorkspace, loadWorkspace } from '../db/indexedDB';
import type { WorkspaceData } from '../db/indexedDB';

export type LayoutMode = 'split' | 'canvas-only' | 'notes-only';
export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface Notification {
  message: string;
  type: 'info' | 'error' | 'success';
}

interface WorkspaceState {
  notes: string;
  canvasElements: any[];
  canvasAppState: any;
  canvasFiles: Record<string, any>;
  layoutMode: LayoutMode;
  splitWidth: number; // percentage of screen for canvas (0 to 100)
  lastSplitWidth: number; // last split width before toggling to full screens
  saveStatus: SaveStatus;
  isLoading: boolean;
  activeCanvasTool: string;
  lastImportTime: number; // timestamp to coordinate canvas updates
  notification: Notification | null;

  // Actions
  initializeWorkspace: () => Promise<void>;
  updateNotes: (notes: string) => void;
  updateCanvas: (elements: any[], appState: any, files?: any) => void;
  setSplitWidth: (width: number) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleLayoutMode: () => void;
  setActiveCanvasTool: (tool: string) => void;
  saveCurrentWorkspace: () => Promise<void>;
  importWorkspace: (data: WorkspaceData) => Promise<void>;
  showNotification: (message: string, type?: 'info' | 'error' | 'success') => void;
  hideNotification: () => void;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let notificationTimeout: ReturnType<typeof setTimeout> | null = null;

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  const scheduleAutoSave = () => {
    set({ saveStatus: 'saving' });
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        await get().saveCurrentWorkspace();
        set({ saveStatus: 'saved' });
      } catch (error) {
        console.error('Failed to auto-save:', error);
        set({ saveStatus: 'error' });
      }
    }, 1000); // 1-second debounce to keep drawing and typing smooth
  };

  return {
    notes: '',
    canvasElements: [],
    canvasAppState: {},
    canvasFiles: {},
    layoutMode: 'split',
    splitWidth: 65,
    lastSplitWidth: 65,
    saveStatus: 'idle',
    isLoading: true,
    activeCanvasTool: 'selection',
    lastImportTime: 0,
    notification: null,

    initializeWorkspace: async () => {
      try {
        const saved = await loadWorkspace();
        if (saved) {
          set({
            notes: saved.notes || '',
            canvasElements: saved.canvasElements || [],
            canvasAppState: saved.canvasAppState || {},
            canvasFiles: saved.canvasFiles || {},
            lastImportTime: Date.now(),
            isLoading: false,
            saveStatus: 'saved',
          });
        } else {
          set({ isLoading: false, saveStatus: 'idle' });
        }
      } catch (error) {
        console.error('Failed to initialize workspace from database:', error);
        set({ isLoading: false, saveStatus: 'error' });
      }
    },

    updateNotes: (notes) => {
      set({ notes });
      scheduleAutoSave();
    },

    updateCanvas: (elements, appState, files = {}) => {
      // Ephemeral appState properties can change excessively (e.g. mouse cursor positions, hover states).
      // We only serialize essential canvas states to keep saves fast.
      const persistedAppState = {
        theme: appState.theme || 'dark',
        viewBackgroundColor: appState.viewBackgroundColor,
        gridSize: appState.gridSize,
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
        zoom: appState.zoom,
      };

      set({
        canvasElements: elements,
        canvasAppState: persistedAppState,
        canvasFiles: { ...get().canvasFiles, ...files },
      });
      scheduleAutoSave();
    },

    setSplitWidth: (splitWidth) => {
      if (splitWidth < 5) splitWidth = 0;
      if (splitWidth > 95) splitWidth = 100;

      const layoutMode = splitWidth === 0
        ? 'notes-only'
        : splitWidth === 100
          ? 'canvas-only'
          : 'split';

      set({
        splitWidth,
        layoutMode,
        ...(layoutMode === 'split' ? { lastSplitWidth: splitWidth } : {})
      });
    },

    setLayoutMode: (mode) => {
      const { lastSplitWidth } = get();
      if (mode === 'canvas-only') {
        set({ layoutMode: mode, splitWidth: 100 });
      } else if (mode === 'notes-only') {
        set({ layoutMode: mode, splitWidth: 0 });
      } else {
        set({ layoutMode: mode, splitWidth: lastSplitWidth });
      }
    },

    toggleLayoutMode: () => {
      const { layoutMode } = get();
      if (layoutMode === 'split') {
        get().setLayoutMode('canvas-only');
      } else if (layoutMode === 'canvas-only') {
        get().setLayoutMode('notes-only');
      } else {
        get().setLayoutMode('split');
      }
    },

    setActiveCanvasTool: (activeCanvasTool) => {
      set({ activeCanvasTool });
    },

    saveCurrentWorkspace: async () => {
      const state = get();
      const workspaceData: WorkspaceData = {
        notes: state.notes,
        canvasElements: state.canvasElements,
        canvasAppState: state.canvasAppState,
        canvasFiles: state.canvasFiles,
        updatedAt: Date.now(),
      };
      await saveWorkspace(workspaceData);
    },

    importWorkspace: async (data) => {
      set({
        notes: data.notes || '',
        canvasElements: data.canvasElements || [],
        canvasAppState: data.canvasAppState || {},
        canvasFiles: data.canvasFiles || {},
        lastImportTime: Date.now(),
        saveStatus: 'saved',
      });
      await saveWorkspace(data);
    },

    showNotification: (message, type = 'info') => {
      set({ notification: { message, type } });
      if (notificationTimeout) clearTimeout(notificationTimeout);
      notificationTimeout = setTimeout(() => {
        set({ notification: null });
      }, 4000);
    },

    hideNotification: () => {
      if (notificationTimeout) clearTimeout(notificationTimeout);
      set({ notification: null });
    },
  };
});
