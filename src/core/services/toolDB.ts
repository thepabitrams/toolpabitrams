// src/core/services/toolDB.ts
/**
 * 🗄️ toolDB — IndexedDB Service for Tool Data
 *
 * Stores user-specific tool metadata:
 * - Favorites (list of tool IDs)
 * - Usage counts (tool ID → number of uses)
 * - Current tool ID (for resume-on-refresh)
 *
 * Industry-grade design:
 * - Clean database naming: ToolPabitraMS_ToolDB
 * - Versioned for future migrations
 * - Single record pattern (id: 'main')
 * - Async operations
 * - Error handling
 */

import { openDB, IDBPDatabase } from 'idb';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DB_NAME = 'ToolPabitraMS_ToolDB';
const DB_VERSION = 1;
const STORE_NAME = 'toolData';

// The single record ID (like a singleton)
const RECORD_ID = 'main';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Database Connection (Singleton)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let dbInstance: IDBPDatabase | null = null;

/**
 * Get or create the database connection
 */
async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create object store with 'id' as keyPath (for singleton record)
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Public API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ToolData {
  favorites: string[];
  usageCounts: Record<string, number>;
  currentToolId: string | null;
}

/**
 * 💾 Save tool data to IndexedDB
 * @param data - The tool data to persist
 */
export async function saveToolData(data: ToolData): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, {
      id: RECORD_ID,
      ...data,
    });
  } catch (error) {
    console.error('[toolDB] Failed to save tool data:', error);
    throw error;
  }
}

/**
 * 🔄 Load tool data from IndexedDB
 * @returns The persisted tool data, or null if not found
 */
export async function loadToolData(): Promise<ToolData | null> {
  try {
    const db = await getDB();
    const record = await db.get(STORE_NAME, RECORD_ID);
    if (!record) return null;

    // Return only the data fields (exclude the 'id' field)
    const { id, ...data } = record;
    return data as ToolData;
  } catch (error) {
    console.error('[toolDB] Failed to load tool data:', error);
    return null;
  }
}

/**
 * 🗑️ Clear all tool data (factory reset)
 */
export async function clearToolData(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, RECORD_ID);
  } catch (error) {
    console.error('[toolDB] Failed to clear tool data:', error);
    throw error;
  }
}

/**
 * 🔍 Check if tool data exists
 */
export async function hasToolData(): Promise<boolean> {
  try {
    const db = await getDB();
    const record = await db.get(STORE_NAME, RECORD_ID);
    return record !== undefined;
  } catch {
    return false;
  }
}