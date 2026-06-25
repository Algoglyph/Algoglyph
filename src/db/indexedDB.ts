const DB_NAME = 'scratchpad-db';
const STORE_NAME = 'workspace-store';
const WORKSPACE_KEY = 'current-workspace';

export interface TabData {
  id: string;
  title: string;
  notes: string;
  canvasElements: any[];
  canvasAppState: any;
  canvasFiles: Record<string, any>;
  code: string;
  codeLanguage: string;
  updatedAt: number;
}

export interface WorkspaceData {
  tabs: TabData[];
  activeTabId: string;
  updatedAt: number;
  roadmapProgress?: Record<string, 'Not Started' | 'In Progress' | 'Completed'>;
  // Legacy single-document fields kept optional for backward-compatible migration.
  notes?: string;
  canvasElements?: any[];
  canvasAppState?: any;
  canvasFiles?: Record<string, any>;
}

// Add the object store, bumping the version by one if it's missing.
function createStore(db: IDBDatabase): Promise<IDBDatabase> {
  const nextVersion = db.version + 1;
  db.close();
  return new Promise((resolve, reject) => {
    const upgrade = indexedDB.open(DB_NAME, nextVersion);
    upgrade.onupgradeneeded = () => {
      const udb = upgrade.result;
      if (!udb.objectStoreNames.contains(STORE_NAME)) udb.createObjectStore(STORE_NAME);
    };
    upgrade.onsuccess = () => resolve(upgrade.result);
    upgrade.onerror = () => reject(upgrade.error);
    upgrade.onblocked = () => reject(new Error('IndexedDB upgrade blocked'));
  });
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Open WITHOUT a fixed version so we adopt whatever version already exists.
    // Forcing version 1 throws VersionError ("requested version (1) is less than
    // the existing version") if an earlier build created the DB at a higher
    // version — which breaks BOTH load and save and leaves the app showing
    // "save failed" with a fallback single tab.
    const request = indexedDB.open(DB_NAME);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB open blocked'));
    request.onupgradeneeded = () => {
      // Fires only for a brand-new DB (version 0 → 1); create our store here.
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        resolve(db);
      } else {
        // DB exists at some version but predates our store (schema drift) —
        // add the store via a one-step version bump.
        createStore(db).then(resolve, reject);
      }
    };
  });
}

// Produce a structured-clone-safe deep copy of the workspace snapshot.
// Drops non-cloneable values (functions, symbols, bigint, undefined) and breaks
// any accidental circular references, so neither this step nor IDBObjectStore.put
// can throw on the data. Mirrors JSON semantics (the app's persistence format),
// but — unlike JSON.stringify — never throws on cycles. Without this, a single
// non-cloneable value in any tab makes every save fail permanently.
function toCloneSafe(value: unknown): any {
  const seen = new WeakSet<object>();
  const walk = (v: any): any => {
    if (v === null) return null;
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return v;
    if (t !== 'object') return undefined; // function / symbol / bigint / undefined
    if (seen.has(v)) return undefined; // circular reference
    seen.add(v);
    if (Array.isArray(v)) return v.map((item) => walk(item) ?? null);
    const out: Record<string, any> = {};
    for (const key of Object.keys(v)) {
      const cleaned = walk((v as Record<string, any>)[key]);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return out;
  };
  return walk(value);
}

export async function saveWorkspace(data: WorkspaceData): Promise<void> {
  const db = await getDB();

  const safeData: WorkspaceData = toCloneSafe(data);

  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction(STORE_NAME, 'readwrite');
    } catch (err) {
      reject(err);
      return;
    }
    const store = transaction.objectStore(STORE_NAME);
    let request: IDBRequest;
    try {
      request = store.put(safeData, WORKSPACE_KEY);
    } catch (err) {
      // put() can throw synchronously (DataCloneError / DataError).
      reject(err);
      return;
    }
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    // Quota overflow typically surfaces as a transaction abort, not put.onerror.
    transaction.onabort = () => reject(transaction.error ?? new Error('save aborted'));
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
