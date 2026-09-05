// src/tools/productivity/bulletin-board/lib/indexeddb.ts

import { db } from '@/core/services/indexeddb';

const METADATA_ID = 'bulletin-board-tasks';

export async function saveMetadata(storageKey: string): Promise<void> {
  await db.put('fileStore', { id: METADATA_ID, storageKey });
}

export async function getMetadata(): Promise<string | null> {
  const record = await db.get('fileStore', METADATA_ID);
  return record?.storageKey || null;
}

export async function deleteMetadata(): Promise<void> {
  await db.delete('fileStore', METADATA_ID);
}