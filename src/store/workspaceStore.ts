import { create } from 'zustand';
import type { Workspace, ProblemMeta, TestCase } from '../db/indexedDB';
import {
  migrateLegacyData,
  saveWorkspace,
  getAllWorkspaces,
  deleteWorkspace,
  saveGlobalState,
  loadGlobalState
} from '../db/indexedDB';

export type LayoutMode = 'split' | 'canvas-only' | 'notes-only' | 'code';
export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface Notification {
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  leetcodeUsername?: string;
  codeforcesUsername?: string;
  cfRating?: number;
  cfRank?: string;
  cfMaxRating?: number;
  cfMaxRank?: string;
}

interface WorkspaceState {
  // Live data for the ACTIVE tab. Editor/Canvas/CodeEditor read these directly.
  notes: string;
  canvasElements: any[];
  canvasAppState: any;
  canvasFiles: Record<string, any>;
  code: string;
  codeLanguage: string;
  problemMeta?: ProblemMeta;
  testCases: TestCase[];

  // Multi-tab state.
  tabs: Workspace[];
  activeTabId: string;
  allWorkspaces: Workspace[];

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
  problemsSidebarOpen: boolean; // problems browser sidebar
  searchPaletteOpen: boolean; // the search palette overlay
  searchScope: 'all' | 'current'; // 'current' = Ctrl+F (this tab), 'all' = Ctrl+Shift+F
  leftPaneView: 'description' | 'notes' | 'canvas';
  userProfile: UserProfile | null;

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
  importWorkspace: (data: any) => Promise<void>;
  showNotification: (message: string, type?: 'info' | 'error' | 'success') => void;
  hideNotification: () => void;

  // UI actions
  toggleStructuresPanel: () => void;
  setStructuresPanelOpen: (open: boolean) => void;
  toggleProblemsSidebar: () => void;
  setProblemsSidebarOpen: (open: boolean) => void;
  openSearchPalette: (scope: 'all' | 'current') => void;
  setSearchPaletteOpen: (open: boolean) => void;
  setLeftPaneView: (view: 'description' | 'notes' | 'canvas') => void;
  toggleLeftPaneView: () => void;

  // Tab actions
  createTab: () => void;
  createWorkspaceTab: (
    title: string,
    platform?: 'leetcode' | 'codeforces' | 'custom',
    platformId?: string,
    difficulty?: string,
    url?: string,
    templateCode?: string,
    testCases?: TestCase[],
    tags?: string[],
    statement?: string,
    constraints?: string[],
    examples?: TestCase[]
  ) => Promise<string>;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
  deleteWorkspaceItem: (id: string) => Promise<void>;
  updateActiveWorkspaceTestCases: (testCases: TestCase[]) => void;
  updateActiveWorkspaceProblemMeta: (meta: ProblemMeta) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  saveHandles: (leetcodeUsername: string, codeforcesUsername: string) => void;
  updateCodeforcesStats: (stats: { rating?: number; rank?: string; maxRating?: number; maxRank?: string }) => void;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let notificationTimeout: ReturnType<typeof setTimeout> | null = null;

const genId = () =>
  `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const makeWorkspace = (partial: Partial<Workspace> = {}): Workspace => ({
  id: genId(),
  title: 'Untitled',
  notes: '',
  canvasElements: [],
  canvasAppState: {},
  canvasFiles: {},
  code: '',
  codeLanguage: 'cpp',
  testCases: [],
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
    }, 1000);
  };

  const reconcileTabs = (): Workspace[] => {
    const { tabs, activeTabId, notes, canvasElements, canvasAppState, canvasFiles, code, codeLanguage, problemMeta, testCases } = get();
    return tabs.map((t) =>
      t.id === activeTabId
        ? { ...t, notes, canvasElements, canvasAppState, canvasFiles, code, codeLanguage, problemMeta, testCases, updatedAt: Date.now() }
        : t
    );
  };

  const loadTabIntoMirror = (tab: Workspace, extra: Partial<WorkspaceState> = {}) => {
    const defaultLeftView = tab.problemMeta ? 'description' : 'notes';
    set({
      notes: tab.notes,
      canvasElements: tab.canvasElements,
      canvasAppState: tab.canvasAppState,
      canvasFiles: tab.canvasFiles,
      code: tab.code ?? '',
      codeLanguage: tab.codeLanguage ?? 'cpp',
      problemMeta: tab.problemMeta,
      testCases: tab.testCases ?? [],
      lastImportTime: Date.now(),
      leftPaneView: defaultLeftView,
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
    testCases: [],
    tabs: [],
    activeTabId: '',
    allWorkspaces: [],
    layoutMode: 'split',
    splitWidth: 50,
    lastSplitWidth: 50,
    saveStatus: 'idle',
    isLoading: true,
    activeCanvasTool: 'selection',
    lastImportTime: 0,
    notification: null,
    structuresPanelOpen: true,
    problemsSidebarOpen: false,
    searchPaletteOpen: false,
    searchScope: 'all',
    leftPaneView: 'notes',
    userProfile: null,

    initializeWorkspace: async () => {
      try {
        await migrateLegacyData();

        const all = await getAllWorkspaces();
        const state = await loadGlobalState();
        let tabs: Workspace[] = [];
        let activeTabId = '';

        if (state && Array.isArray(state.openTabIds) && state.openTabIds.length > 0) {
          for (const id of state.openTabIds) {
            const ws = all.find((w) => w.id === id);
            if (ws) {
              tabs.push(ws);
            }
          }
          activeTabId = state.activeTabId;
        }

        if (tabs.length === 0) {
          let scratchpadWs = all.find((w) => w.title === 'Scratchpad');
          if (!scratchpadWs) {
            scratchpadWs = makeWorkspace({ title: 'Scratchpad' });
            await saveWorkspace(scratchpadWs);
          }
          tabs = [scratchpadWs];
          activeTabId = scratchpadWs.id;
        }

        let active = tabs.find((t) => t.id === activeTabId);
        if (!active) {
          active = tabs[0];
          activeTabId = active.id;
        }

        const splitWidth = state?.splitWidth !== undefined ? state.splitWidth : 50;
        const leftPaneView = state?.leftPaneView || 'notes';

        // Subscribe to Firebase Authentication changes
        const { subscribeToAuthChanges } = await import('../services/authService');
        subscribeToAuthChanges((firebaseUser) => {
          if (firebaseUser) {
            const leetcodeUsername = localStorage.getItem('leetcode_username') || '';
            const codeforcesUsername = localStorage.getItem('codeforces_username') || '';
            const cfRating = localStorage.getItem('codeforces_rating') ? parseInt(localStorage.getItem('codeforces_rating')!) : undefined;
            const cfRank = localStorage.getItem('codeforces_rank') || undefined;
            const cfMaxRating = localStorage.getItem('codeforces_max_rating') ? parseInt(localStorage.getItem('codeforces_max_rating')!) : undefined;
            const cfMaxRank = localStorage.getItem('codeforces_max_rank') || undefined;

            set({
              userProfile: {
                uid: firebaseUser.uid,
                name: firebaseUser.name,
                email: firebaseUser.email,
                avatarUrl: firebaseUser.avatarUrl,
                leetcodeUsername,
                codeforcesUsername,
                cfRating,
                cfRank,
                cfMaxRating,
                cfMaxRank
              }
            });
          } else {
            set({ userProfile: null });
          }
        });

        loadTabIntoMirror(active, {
          tabs,
          activeTabId,
          allWorkspaces: all,
          splitWidth,
          leftPaneView,
          isLoading: false,
          saveStatus: 'saved',
        });
      } catch (error) {
        console.error('Failed to initialize V3 workspace:', error);
        const fallback = makeWorkspace({ title: 'Scratchpad' });
        set({
          tabs: [fallback],
          activeTabId: fallback.id,
          allWorkspaces: [fallback],
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

      let layoutMode: LayoutMode = 'split';
      if (splitWidth === 0) {
        layoutMode = 'code';
      } else if (splitWidth === 100) {
        const view = get().leftPaneView;
        layoutMode = view === 'notes' ? 'notes-only' : 'canvas-only';
      }

      set({
        splitWidth,
        layoutMode,
        ...(layoutMode === 'split' ? { lastSplitWidth: splitWidth } : {})
      });
    },

    setLayoutMode: (mode) => {
      const { lastSplitWidth } = get();
      if (mode === 'canvas-only') {
        set({ layoutMode: mode, splitWidth: 100, leftPaneView: 'canvas' });
      } else if (mode === 'notes-only') {
        set({ layoutMode: mode, splitWidth: 100, leftPaneView: 'notes' });
      } else if (mode === 'code') {
        set({ layoutMode: mode, splitWidth: 0 });
      } else {
        set({ layoutMode: mode, splitWidth: lastSplitWidth });
      }
    },

    toggleLayoutMode: () => {
      const { layoutMode } = get();
      if (layoutMode === 'split') {
        get().setLayoutMode('code');
      } else if (layoutMode === 'code') {
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
      const activeTabId = get().activeTabId;
      const active = tabs.find((t) => t.id === activeTabId);

      if (active) {
        await saveWorkspace(active);
      }

      const openTabIds = tabs.map((t) => t.id);
      await saveGlobalState({
        activeTabId,
        openTabIds,
        leftPaneView: get().leftPaneView,
        splitWidth: get().splitWidth
      });

      const all = await getAllWorkspaces();
      set({ tabs, allWorkspaces: all });
    },

    importWorkspace: async (data) => {
      const title = data.title || data.problemMeta?.title || 'Imported';
      const code = data.code || '';
      const notes = data.notes || '';
      const canvasElements = data.canvasElements || [];
      const canvasAppState = data.canvasAppState || {};
      const canvasFiles = data.canvasFiles || {};
      const testCases = data.testCases || [];
      const problemMeta = data.problemMeta;

      const ws = makeWorkspace({
        title,
        notes,
        canvasElements,
        canvasAppState,
        canvasFiles,
        code,
        codeLanguage: data.codeLanguage || 'cpp',
        testCases,
        problemMeta,
      });

      await saveWorkspace(ws);
      const tabs = reconcileTabs();
      const newTabs = [...tabs, ws];

      loadTabIntoMirror(ws, {
        tabs: newTabs,
        activeTabId: ws.id,
        saveStatus: 'saved',
      });

      await get().saveCurrentWorkspace();
    },

    createTab: () => {
      get().createWorkspaceTab('Untitled');
    },

    createWorkspaceTab: async (
      title,
      platform,
      platformId,
      difficulty,
      url,
      templateCode,
      testCases,
      tags,
      statement,
      constraints,
      examples
    ) => {
      await get().saveCurrentWorkspace();
      
      const tabs = reconcileTabs();
      const newWs = makeWorkspace({
        title,
        problemMeta: platform ? {
          title,
          platform,
          platformId,
          difficulty,
          url,
          tags,
          statement,
          constraints,
          examples
        } : undefined,
        code: templateCode || '',
        codeLanguage: 'cpp',
        testCases: testCases || examples || []
      });

      await saveWorkspace(newWs);
      const newTabs = [...tabs, newWs];

      loadTabIntoMirror(newWs, {
        tabs: newTabs,
        activeTabId: newWs.id
      });

      await get().saveCurrentWorkspace();
      return newWs.id;
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
        const next = newTabs[Math.max(0, idx - 1)];
        loadTabIntoMirror(next, { tabs: newTabs, activeTabId: next.id });
      } else {
        set({ tabs: newTabs });
      }
      scheduleAutoSave();
    },

    switchTab: async (id) => {
      if (id === get().activeTabId) return;
      await get().saveCurrentWorkspace();

      const { tabs } = get();
      const target = tabs.find((t) => t.id === id);
      if (!target) return;

      loadTabIntoMirror(target);
      set({ activeTabId: id });
      scheduleAutoSave();
    },

    renameTab: (id, title) => {
      const clean = title.trim() || 'Untitled';
      set({ tabs: get().tabs.map((t) => (t.id === id ? { ...t, title: clean } : t)) });
      scheduleAutoSave();
    },

    deleteWorkspaceItem: async (id) => {
      await deleteWorkspace(id);

      const { tabs, activeTabId } = get();
      const openIdx = tabs.findIndex((t) => t.id === id);

      if (openIdx !== -1) {
        const newTabs = tabs.filter((t) => t.id !== id);
        if (newTabs.length === 0) {
          const fallback = makeWorkspace({ title: 'Scratchpad' });
          await saveWorkspace(fallback);
          loadTabIntoMirror(fallback, {
            tabs: [fallback],
            activeTabId: fallback.id
          });
        } else if (activeTabId === id) {
          const next = newTabs[Math.max(0, openIdx - 1)];
          loadTabIntoMirror(next, {
            tabs: newTabs,
            activeTabId: next.id
          });
        } else {
          set({ tabs: newTabs });
        }
      }

      const all = await getAllWorkspaces();
      set({ allWorkspaces: all });
      scheduleAutoSave();
    },

    updateActiveWorkspaceTestCases: (testCases) => {
      set({ testCases });
      scheduleAutoSave();
    },

    updateActiveWorkspaceProblemMeta: (problemMeta) => {
      set({ problemMeta });
      scheduleAutoSave();
    },

    setUserProfile: (userProfile) => {
      set({ userProfile });
    },

    saveHandles: (leetcodeUsername, codeforcesUsername) => {
      localStorage.setItem('leetcode_username', leetcodeUsername);
      localStorage.setItem('codeforces_username', codeforcesUsername);

      const currentProfile = get().userProfile;
      if (currentProfile) {
        set({
          userProfile: {
            ...currentProfile,
            leetcodeUsername,
            codeforcesUsername
          }
        });
      }
    },

    updateCodeforcesStats: (stats) => {
      if (stats.rating !== undefined) localStorage.setItem('codeforces_rating', String(stats.rating));
      else localStorage.removeItem('codeforces_rating');

      if (stats.rank !== undefined) localStorage.setItem('codeforces_rank', stats.rank);
      else localStorage.removeItem('codeforces_rank');

      if (stats.maxRating !== undefined) localStorage.setItem('codeforces_max_rating', String(stats.maxRating));
      else localStorage.removeItem('codeforces_max_rating');

      if (stats.maxRank !== undefined) localStorage.setItem('codeforces_max_rank', stats.maxRank);
      else localStorage.removeItem('codeforces_max_rank');

      const currentProfile = get().userProfile;
      if (currentProfile) {
        set({
          userProfile: {
            ...currentProfile,
            cfRating: stats.rating,
            cfRank: stats.rank,
            cfMaxRating: stats.maxRating,
            cfMaxRank: stats.maxRank
          }
        });
      }
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

    toggleProblemsSidebar: () => {
      set({ problemsSidebarOpen: !get().problemsSidebarOpen });
    },

    setProblemsSidebarOpen: (problemsSidebarOpen) => {
      set({ problemsSidebarOpen });
    },

    openSearchPalette: (scope) => {
      set({ searchScope: scope, searchPaletteOpen: true });
    },

    setSearchPaletteOpen: (searchPaletteOpen) => {
      set({ searchPaletteOpen });
    },

    setLeftPaneView: (view) => {
      set({ leftPaneView: view });
    },

    toggleLeftPaneView: () => {
      set((state) => {
        const hasMeta = !!state.problemMeta;
        if (state.leftPaneView === 'description') {
          return { leftPaneView: 'notes' };
        } else if (state.leftPaneView === 'notes') {
          return { leftPaneView: 'canvas' };
        } else {
          return { leftPaneView: hasMeta ? 'description' : 'notes' };
        }
      });
    },
  };
});
