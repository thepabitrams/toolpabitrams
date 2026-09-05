// src/core/services/opfs.ts

let root: FileSystemDirectoryHandle | null = null;

async function getRoot() {
  if (!root) {
    root = await navigator.storage.getDirectory();
  }
  return root;
}

export async function write(path: string, data: ArrayBuffer) {
  const root = await getRoot();
  const handle = await root.getFileHandle(path, { create: true });
  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
}

export async function read(path: string): Promise<ArrayBuffer> {
  const root = await getRoot();
  const handle = await root.getFileHandle(path);
  const file = await handle.getFile();
  return await file.arrayBuffer();
}

export async function remove(path: string) {
  try {
    const root = await getRoot();
    await root.removeEntry(path);
  } catch {
    // File doesn't exist—ignore (silent cleanup)
  }
}

export async function listAll(): Promise<string[]> {
  const root = await getRoot();
  const entries: string[] = [];
  for await (const [name] of root.entries()) {
    entries.push(name);
  }
  return entries;
}

export async function readFile(path: string): Promise<File> {
  const root = await getRoot();
  const handle = await root.getFileHandle(path);
  return await handle.getFile();
}