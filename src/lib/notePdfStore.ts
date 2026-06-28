/**
 * notePdfStore — a tiny, self-contained IndexedDB store for PDFs embedded in
 * notes.
 *
 * Why a separate store (and not the note markdown itself): a lecture PDF is
 * easily several MB. Inlining it as base64 in the note's markdown would mean
 * re-serializing megabytes on every keystroke (the editor calls `getMarkdown()`
 * in `onUpdate`) and bloating every autosave snapshot. Instead the note only
 * keeps a short `pdfstore:<id>` reference, while the bytes live here, written
 * once on import. This keeps the feature fully local-first and the typing path
 * fast. It is owned entirely by the notes feature — nothing else touches it.
 */

const DB_NAME = 'scratchpad-note-pdfs';
const STORE = 'pdfs';

export interface StoredPdf {
  name: string;
  type: string;
  data: ArrayBuffer;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

/** Generate a short, collision-resistant id for a stored PDF. */
export function createPdfId(): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return rand.replace(/-/g, '').slice(0, 16);
}

export async function putPdf(id: string, pdf: StoredPdf): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(pdf, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getPdf(id: string): Promise<StoredPdf | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as StoredPdf | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePdf(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Read a File into the store and return the `pdfstore:<id>` reference string
 * that gets persisted in the note markdown.
 */
export async function importPdfFile(file: File): Promise<{ ref: string; name: string }> {
  const id = createPdfId();
  const data = await file.arrayBuffer();
  await putPdf(id, { name: file.name, type: file.type || 'application/pdf', data });
  return { ref: `pdfstore:${id}`, name: file.name };
}
