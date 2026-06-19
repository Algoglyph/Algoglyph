import { create } from 'zustand';
import { saveWorkspace, loadWorkspace } from '../db/indexedDB';
import type { WorkspaceData, TabData } from '../db/indexedDB';

export type LayoutMode = 'split' | 'canvas-only' | 'notes-only' | 'code';
export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface Notification {
  message: string;
  type: 'info' | 'error' | 'success';
}

interface WorkspaceState {
  // Live data for the ACTIVE tab. Editor/Canvas/CodeEditor read these directly.
  notes: string;
  canvasElements: any[];
  canvasAppState: any;
  canvasFiles: Record<string, any>;
  code: string;
  codeLanguage: string;

  // Multi-tab state.
  tabs: TabData[];
  activeTabId: string;

  layoutMode: LayoutMode;
  splitWidth: number; // percentage of screen for canvas (0 to 100)
  lastSplitWidth: number; // last split width before toggling to full screens
  saveStatus: SaveStatus;
  isLoading: boolean;
  activeCanvasTool: string;
  lastImportTime: number; // timestamp to coordinate canvas updates
  notification: Notification | null;

  // UI state (not persisted)
  structuresPanelOpen: boolean;
  searchPaletteOpen: boolean; // the search palette overlay
  searchScope: 'all' | 'current'; // 'current' = Ctrl+F (this tab), 'all' = Ctrl+Shift+F

  // Actions
  initializeWorkspace: () => Promise<void>;
  updateNotes: (notes: string) => void;
  updateCode: (code: string) => void;
  setCodeLanguage: (language: string) => void;
  updateCanvas: (elements: any[], appState: any, files?: any) => void;
  setSplitWidth: (width: number) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleLayoutMode: () => void;
  setActiveCanvasTool: (tool: string) => void;
  saveCurrentWorkspace: () => Promise<void>;
  importWorkspace: (data: WorkspaceData) => Promise<void>;
  showNotification: (message: string, type?: 'info' | 'error' | 'success') => void;
  hideNotification: () => void;

  // UI actions
  toggleStructuresPanel: () => void;
  setStructuresPanelOpen: (open: boolean) => void;
  openSearchPalette: (scope: 'all' | 'current') => void;
  setSearchPaletteOpen: (open: boolean) => void;

  // Tab actions
  createTab: () => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let notificationTimeout: ReturnType<typeof setTimeout> | null = null;

const genId = () =>
  `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const makeTab = (partial: Partial<TabData> = {}): TabData => ({
  id: genId(),
  title: 'Untitled',
  notes: '',
  canvasElements: [],
  canvasAppState: {},
  canvasFiles: {},
  code: '',
  codeLanguage: 'cpp',
  updatedAt: Date.now(),
  ...partial,
});

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

  // Fold the live (mirror) data of the active tab back into the tabs array.
  // The mirror fields are the source of truth for the active tab; the matching
  // entry in `tabs` may be stale until reconciled here (on save / switch / close).
  const reconcileTabs = (): TabData[] => {
    const { tabs, activeTabId, notes, canvasElements, canvasAppState, canvasFiles, code, codeLanguage } = get();
    return tabs.map((t) =>
      t.id === activeTabId
        ? { ...t, notes, canvasElements, canvasAppState, canvasFiles, code, codeLanguage, updatedAt: Date.now() }
        : t
    );
  };

  // Load a tab's content into the live mirror and trigger Canvas/Editor resync.
  const loadTabIntoMirror = (tab: TabData, extra: Partial<WorkspaceState> = {}) => {
    set({
      notes: tab.notes,
      canvasElements: tab.canvasElements,
      canvasAppState: tab.canvasAppState,
      canvasFiles: tab.canvasFiles,
      code: tab.code ?? '',
      codeLanguage: tab.codeLanguage ?? 'cpp',
      lastImportTime: Date.now(),
      ...extra,
    });
  };

  return {
    notes: '',
    canvasElements: [],
    canvasAppState: {},
    canvasFiles: {},
    code: '',
    codeLanguage: 'cpp',
    tabs: [],
    activeTabId: '',
    layoutMode: 'split',
    splitWidth: 65,
    lastSplitWidth: 65,
    saveStatus: 'idle',
    isLoading: true,
    activeCanvasTool: 'selection',
    lastImportTime: 0,
    notification: null,
    structuresPanelOpen: true,
    searchPaletteOpen: false,
    searchScope: 'all',

    initializeWorkspace: async () => {
      try {
        const saved = await loadWorkspace();
        let tabs: TabData[];
        let activeTabId: string;

        if (saved && Array.isArray(saved.tabs) && saved.tabs.length > 0) {
          // New multi-tab format.
          tabs = saved.tabs.map((t) => makeTab(t));
          activeTabId = tabs.some((t) => t.id === saved.activeTabId)
            ? saved.activeTabId
            : tabs[0].id;
        } else if (saved && (saved.notes !== undefined || saved.canvasElements !== undefined)) {
          // Legacy single-document format → migrate into one tab.
          tabs = [
            makeTab({
              title: 'Scratchpad',
              notes: saved.notes || '',
              canvasElements: saved.canvasElements || [],
              canvasAppState: saved.canvasAppState || {},
              canvasFiles: saved.canvasFiles || {},
            }),
          ];
          activeTabId = tabs[0].id;
        } else {
          // Fresh start.
          tabs = [makeTab({ title: 'Scratchpad' })];
          activeTabId = tabs[0].id;
        }

        const active = tabs.find((t) => t.id === activeTabId)!;
        set({
          tabs,
          activeTabId,
          notes: active.notes,
          canvasElements: active.canvasElements,
          canvasAppState: active.canvasAppState,
          canvasFiles: active.canvasFiles,
          code: active.code ?? '',
          codeLanguage: active.codeLanguage ?? 'cpp',
          lastImportTime: Date.now(),
          isLoading: false,
          saveStatus: 'saved',
        });
      } catch (error) {
        console.error('Failed to initialize workspace from database:', error);
        const tabs = [makeTab({ title: 'Scratchpad' })];
        set({
          tabs,
          activeTabId: tabs[0].id,
          isLoading: false,
          saveStatus: 'error',
        });
      }
    },

    updateNotes: (notes) => {
      set({ notes });
      scheduleAutoSave();
    },

    updateCode: (code) => {
      set({ code });
      scheduleAutoSave();
    },

    setCodeLanguage: (codeLanguage) => {
      set({ codeLanguage });
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
      } else if (mode === 'code') {
        // Full-area code editor; split width is irrelevant here.
        set({ layoutMode: mode });
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
      const tabs = reconcileTabs();
      const workspaceData: WorkspaceData = {
        tabs,
        activeTabId: get().activeTabId,
        updatedAt: Date.now(),
      };
      await saveWorkspace(workspaceData);
    },

    importWorkspace: async (data) => {
      if (data && Array.isArray(data.tabs) && data.tabs.length > 0) {
        // Full multi-tab workspace.
        const tabs = data.tabs.map((t) => makeTab(t));
        const activeTabId = tabs.some((t) => t.id === data.activeTabId)
          ? data.activeTabId
          : tabs[0].id;
        const active = tabs.find((t) => t.id === activeTabId)!;
        loadTabIntoMirror(active, { tabs, activeTabId, saveStatus: 'saved' });
      } else {
        // Legacy single-document export → add as a new tab and focus it.
        const tabs = reconcileTabs();
        const tab = makeTab({
          title: 'Imported',
          notes: data.notes || '',
          canvasElements: data.canvasElements || [],
          canvasAppState: data.canvasAppState || {},
          canvasFiles: data.canvasFiles || {},
        });
        loadTabIntoMirror(tab, {
          tabs: [...tabs, tab],
          activeTabId: tab.id,
          saveStatus: 'saved',
        });
      }
      await get().saveCurrentWorkspace();
    },

    createTab: () => {
      const tabs = reconcileTabs();
      const tab = makeTab();
      loadTabIntoMirror(tab, { tabs: [...tabs, tab], activeTabId: tab.id });
      scheduleAutoSave();
    },

    closeTab: (id) => {
      const tabs = reconcileTabs();
      if (tabs.length <= 1) {
        get().showNotification('At least one tab must stay open', 'info');
        return;
      }

      const idx = tabs.findIndex((t) => t.id === id);
      if (idx === -1) return;

      const newTabs = tabs.filter((t) => t.id !== id);
      const wasActive = id === get().activeTabId;

      if (wasActive) {
        // Focus the neighbour to the left (or the new first tab).
        const next = newTabs[Math.max(0, idx - 1)];
        loadTabIntoMirror(next, { tabs: newTabs, activeTabId: next.id });
      } else {
        set({ tabs: newTabs });
      }
      scheduleAutoSave();
    },

    switchTab: (id) => {
      if (id === get().activeTabId) return;
      const tabs = reconcileTabs();
      const target = tabs.find((t) => t.id === id);
      if (!target) return;
      loadTabIntoMirror(target, { tabs, activeTabId: id });
      scheduleAutoSave();
    },

    renameTab: (id, title) => {
      const clean = title.trim() || 'Untitled';
      set({ tabs: get().tabs.map((t) => (t.id === id ? { ...t, title: clean } : t)) });
      scheduleAutoSave();
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

    toggleStructuresPanel: () => {
      set({ structuresPanelOpen: !get().structuresPanelOpen });
    },

    setStructuresPanelOpen: (structuresPanelOpen) => {
      set({ structuresPanelOpen });
    },

    openSearchPalette: (scope) => {
      set({ searchScope: scope, searchPaletteOpen: true });
    },

    setSearchPaletteOpen: (searchPaletteOpen) => {
      set({ searchPaletteOpen });
    },
  };
});
