// src/core/services/indexeddb.ts
import { openDB } from 'idb';

const DB_NAME = 'ToolPabitraMSDB';
const DB_VERSION = 1;

export const db = await openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('fileStore')) {
      db.createObjectStore('fileStore', { keyPath: 'id' });
    }
  },
});

export async function saveCatalog(data: { original: any[]; process: any[] }) {
  await db.put('fileStore', { id: 'main', ...data });
}

export async function loadCatalog() {
  const record = await db.get('fileStore', 'main');
  return record || null;
}