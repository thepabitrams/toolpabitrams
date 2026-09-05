// src/core/services/toolDB.ts

import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ToolPabitraMS_ToolDB';
const DB_VERSION = 1;
const STORE_NAME = 'toolData';
const RECORD_ID = 'main';

let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

export interface ToolData {
  favorites: string[];
  usageCounts: Record<string, number>;
  currentToolId: string | null;
}

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

export async function loadToolData(): Promise<ToolData | null> {
  try {
    const db = await getDB();
    const record = await db.get(STORE_NAME, RECORD_ID);
    if (!record) return null;

    const { id, ...data } = record;
    return data as ToolData;
  } catch (error) {
    console.error('[toolDB] Failed to load tool data:', error);
    return null;
  }
}

export async function clearToolData(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, RECORD_ID);
  } catch (error) {
    console.error('[toolDB] Failed to clear tool data:', error);
    throw error;
  }
}

export async function hasToolData(): Promise<boolean> {
  try {
    const db = await getDB();
    const record = await db.get(STORE_NAME, RECORD_ID);
    return record !== undefined;
  } catch {
    return false;
  }
}