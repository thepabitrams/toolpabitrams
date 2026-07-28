// src/core/services/indexeddb.ts
import { openDB } from 'idb';

// ✅ Clean, professional database name
const DB_NAME = 'ToolPabitraMSDB';
const DB_VERSION = 1;

export const db = await openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('fileStore')) {
      // Object store for our file metadata catalog
      db.createObjectStore('fileStore', { keyPath: 'id' });
    }
  },
});

/**
 * 💾 Save metadata to IndexedDB
 * @param data - The catalog data with original and process arrays
 */
export async function saveCatalog(data: { original: any[]; process: any[] }) {
  await db.put('fileStore', { id: 'main', ...data });
}

/**
 * 🔄 Load metadata from IndexedDB
 * @returns The catalog data or null if not found
 */
export async function loadCatalog() {
  const record = await db.get('fileStore', 'main');
  return record || null;
}