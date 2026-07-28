// src/core/services/opfs.ts

let root: FileSystemDirectoryHandle | null = null;

async function getRoot() {
  if (!root) {
    root = await navigator.storage.getDirectory();
  }
  return root;
}

/**
 * 🏠 Save raw bytes to OPFS
 * @param path - The storage key path (e.g., "original/abc-123")
 * @param data - The raw bytes to save
 */
export async function write(path: string, data: ArrayBuffer) {
  const root = await getRoot();
  const handle = await root.getFileHandle(path, { create: true });
  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
}

/**
 * 📦 Get raw bytes from OPFS
 * @param path - The storage key path (e.g., "original/abc-123")
 * @returns The raw bytes as ArrayBuffer
 */
export async function read(path: string): Promise<ArrayBuffer> {
  const root = await getRoot();
  const handle = await root.getFileHandle(path);
  const file = await handle.getFile();
  return await file.arrayBuffer();
}

/**
 * 🗑️ Delete a file from OPFS (silently fails if not found)
 * @param path - The storage key path to delete
 */
export async function remove(path: string) {
  try {
    const root = await getRoot();
    await root.removeEntry(path);
  } catch {
    // File doesn't exist—ignore (silent cleanup)
  }
}

/**
 * 📋 List ALL files in OPFS (used for garbage collection)
 * @returns Array of all storage key paths in OPFS
 */
export async function listAll(): Promise<string[]> {
  const root = await getRoot();
  const entries: string[] = [];
  for await (const [name] of root.entries()) {
    entries.push(name);
  }
  return entries;
}

// ================================================================
// 🆕 NEW FUNCTION: Get the actual File object directly from OPFS
// ================================================================

/**
 * 📄 Get a native File object directly from OPFS
 * @param path - The storage key path (e.g., "orig-abc123")
 * @returns Promise<File> - The actual File object (with name, type, size, lastModified)
 * 
 * ⚡ WHY: Bypasses ArrayBuffer conversion. This File object is ready for
 *    EXIF libraries (like @uswriting/exiftool) without type errors.
 *    Use this for metadata extraction and government portal crops.
 */
export async function readFile(path: string): Promise<File> {
  const root = await getRoot();
  const handle = await root.getFileHandle(path);
  // 👇 `handle.getFile()` returns a native File object!
  return await handle.getFile();
}