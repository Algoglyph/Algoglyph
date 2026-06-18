const DB_NAME = 'scratchpad-db';
const DB_VERSION = 1;
const STORE_NAME = 'workspace-store';
const WORKSPACE_KEY = 'current-workspace';

export interface TabData {
  id: string;
  title: string;
  notes: string;
  canvasElements: any[];
  canvasAppState: any;
  canvasFiles: Record<string, any>;
  updatedAt: number;
}

export interface WorkspaceData {
  tabs: TabData[];
  activeTabId: string;
  updatedAt: number;
  // Legacy single-document fields kept optional for backward-compatible migration.
  notes?: string;
  canvasElements?: any[];
  canvasAppState?: any;
  canvasFiles?: Record<string, any>;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveWorkspace(data: WorkspaceData): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, WORKSPACE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function loadWorkspace(): Promise<WorkspaceData | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(WORKSPACE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearWorkspace(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(WORKSPACE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
