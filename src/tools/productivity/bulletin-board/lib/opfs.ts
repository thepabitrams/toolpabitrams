// src/tools/productivity/bulletin-board/lib/opfs.ts
let root: FileSystemDirectoryHandle | null = null;

async function getRoot() {
  if (!root) {
    root = await navigator.storage.getDirectory();
  }
  return root;
}

export async function writeFile(path: string, data: ArrayBuffer): Promise<void> {
  const root = await getRoot();
  const handle = await root.getFileHandle(path, { create: true });
  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
}

export async function readFile(path: string): Promise<ArrayBuffer> {
  const root = await getRoot();
  const handle = await root.getFileHandle(path);
  const file = await handle.getFile();
  return await file.arrayBuffer();
}

export async function deleteFile(path: string): Promise<void> {
  try {
    const root = await getRoot();
    await root.removeEntry(path);
  } catch {
  }
}