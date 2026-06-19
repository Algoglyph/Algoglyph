const DB_NAME = 'scratchpad-db';
const DB_VERSION = 2;

export interface ProblemMeta {
  title: string;
  platform: 'leetcode' | 'codeforces' | 'custom';
  platformId?: string;
  difficulty?: string;
  url?: string;
  tags?: string[];
  statement?: string;
  constraints?: string[];
  examples?: TestCase[];
}


export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isCustom?: boolean;
}

export interface Workspace {
  id: string;
  title: string;
  notes: string;
  canvasElements: any[];
  canvasAppState: any;
  canvasFiles: Record<string, any>;
  code: string;
  codeLanguage: string;
  problemMeta?: ProblemMeta;
  testCases?: TestCase[];
  updatedAt: number;
}

export interface GlobalState {
  activeTabId: string;
  openTabIds: string[];
  leftPaneView?: 'description' | 'notes' | 'canvas';
  splitWidth?: number;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (!db.objectStoreNames.contains('workspaces')) {
        db.createObjectStore('workspaces', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('global-state')) {
        db.createObjectStore('global-state');
      }
      // Ensure the legacy object store remains for migration block checks if upgrading
      if (oldVersion === 1 && !db.objectStoreNames.contains('workspace-store')) {
        // Fallback for visual safety
      }
    };
  });
}

export async function migrateLegacyData(): Promise<void> {
  const db = await getDB();
  
  if (!db.objectStoreNames.contains('workspace-store')) return;

  const legacyData = await new Promise<any>((resolve) => {
    try {
      const tx = db.transaction('workspace-store', 'readonly');
      const store = tx.objectStore('workspace-store');
      const req = store.get('current-workspace');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  if (!legacyData) return;

  const workspacesTx = db.transaction(['workspaces', 'global-state', 'workspace-store'], 'readwrite');
  const workspacesStore = workspacesTx.objectStore('workspaces');
  const stateStore = workspacesTx.objectStore('global-state');
  const legacyStore = workspacesTx.objectStore('workspace-store');

  const tabs = legacyData.tabs || [];
  const openTabIds: string[] = [];

  for (const tab of tabs) {
    const ws: Workspace = {
      id: tab.id,
      title: tab.title || 'Untitled',
      notes: tab.notes || '',
      canvasElements: tab.canvasElements || [],
      canvasAppState: tab.canvasAppState || {},
      canvasFiles: tab.canvasFiles || {},
      code: tab.code || '',
      codeLanguage: tab.codeLanguage || 'cpp',
      updatedAt: tab.updatedAt || Date.now(),
      testCases: []
    };
    workspacesStore.put(ws);
    openTabIds.push(tab.id);
  }

  if (openTabIds.length > 0) {
    const activeTabId = legacyData.activeTabId || openTabIds[0];
    const globalState: GlobalState = {
      activeTabId,
      openTabIds,
      leftPaneView: 'notes',
      splitWidth: 50
    };
    stateStore.put(globalState, 'workspace-state');
  }

  // Delete legacy key to prevent repeating migration
  legacyStore.delete('current-workspace');
}

export async function saveWorkspace(workspace: Workspace): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('workspaces', 'readwrite');
    const store = tx.objectStore('workspaces');
    const req = store.put(workspace);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadWorkspace(id: string): Promise<Workspace | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('workspaces', 'readonly');
    const store = tx.objectStore('workspaces');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllWorkspaces(): Promise<Workspace[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('workspaces', 'readonly');
    const store = tx.objectStore('workspaces');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteWorkspace(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('workspaces', 'readwrite');
    const store = tx.objectStore('workspaces');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveGlobalState(state: GlobalState): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('global-state', 'readwrite');
    const store = tx.objectStore('global-state');
    const req = store.put(state, 'workspace-state');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadGlobalState(): Promise<GlobalState | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('global-state', 'readonly');
    const store = tx.objectStore('global-state');
    const req = store.get('workspace-state');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
