// src/core/store/fileStore.ts
import { create } from 'zustand';
import { write, read, remove, listAll, readFile as opfsReadFile } from '@/core/services/opfs'; // 👈 NEW IMPORT
import { saveCatalog, loadCatalog } from '@/core/services/indexeddb';

/**
 * FileRef: The lightweight metadata entry for each file.
 * This is what lives in Zustand and IndexedDB.
 * The actual file bytes stay in OPFS.
 */
export interface FileRef {
  id: string;
  toolId: string;        // 👈 NEW: Isolates files per tool
  name: string;          // "original1", "process1" (scoped per tool)
  storageKey: string;    // Path in OPFS (flat: "orig-abc123" or "proc-abc123")
  size: number;
  type: string;
  createdAt: number;
  parentId?: string;
}

interface FileStore {
  original: FileRef[];
  process: FileRef[];

  init: () => Promise<void>;
  upload: (files: File[]) => Promise<void>;
  save: (files: File[], parentId?: string) => Promise<void>;
  get: (name: string) => FileRef | undefined;
  list: (type: 'original' | 'process') => FileRef[];
  
  // ---- EXISTING METHODS (100% UNCHANGED) ----
  read: (name: string) => Promise<Blob | null>;        // ✅ KEEP THIS for video/PDF/high-perf
  
  // ---- NEW METHOD (ADDED FOR EXIF) ----
  readFile: (storageKey: string) => Promise<File | null>; // 👈 NEW: Returns native File for metadata

  remove: (name: string) => Promise<void>;
  clear: () => Promise<void>;
  promote: () => Promise<void>;

  findDescendants: (parentId: string) => FileRef[];
  garbageCollect: () => Promise<void>;
}

// ================================================================
// 🧠 GLOBAL CONTEXT SWITCH (Invisible Room Number)
// ================================================================
let __currentToolId: string = 'default';

export const setCurrentToolId = (id: string) => {
  __currentToolId = id;
};

// ================================================================
// 🏷️ Auto-increment naming (SCOPED BY TOOL)
// ================================================================
function getNextName(existing: FileRef[], prefix: string): string {
  const numbers = existing
    .filter(f => f.name.startsWith(prefix))
    .map(f => parseInt(f.name.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `${prefix}${max + 1}`;
}

async function syncToDB(original: FileRef[], process: FileRef[]) {
  await saveCatalog({ original, process });
}

export const useFileStore = create<FileStore>((set, get) => ({
  original: [],
  process: [],

  // ============================================================
  // 1. INIT
  // ============================================================
  init: async () => {
    const data = await loadCatalog();
    if (data) {
      set({
        original: data.original || [],
        process: data.process || []
      });
    }
    await get().garbageCollect();
  },

  // ============================================================
  // 2. UPLOAD (Stamps files with the current Tool ID)
  // ============================================================
  upload: async (files) => {
    const toolId = __currentToolId;
    const newRefs: FileRef[] = [];

    for (const file of files) {
      const id = crypto.randomUUID();
      const storageKey = `orig-${id}`;
      await write(storageKey, await file.arrayBuffer());

      // 👇 Only count files belonging to THIS tool
      const myOriginals = get().original.filter(f => f.toolId === toolId);

      newRefs.push({
        id,
        toolId, // 👈 STAMP
        name: getNextName(myOriginals, 'original'),
        storageKey,
        size: file.size,
        type: file.type,
        createdAt: Date.now(),
      });
    }

    set((state) => ({ original: [...state.original, ...newRefs] }));
    await syncToDB(get().original, get().process);
  },

  // ============================================================
  // 3. SAVE (Stamps processed files with the current Tool ID)
  // ============================================================
  save: async (files, parentId) => {
    const toolId = __currentToolId;
    const newRefs: FileRef[] = [];

    for (const file of files) {
      const id = crypto.randomUUID();
      const storageKey = `proc-${id}`;
      await write(storageKey, await file.arrayBuffer());

      // 👇 Only count process files belonging to THIS tool
      const myProcess = get().process.filter(f => f.toolId === toolId);

      newRefs.push({
        id,
        toolId, // 👈 STAMP
        name: getNextName(myProcess, 'process'),
        storageKey,
        size: file.size,
        type: file.type,
        createdAt: Date.now(),
        parentId,
      });
    }

    set((state) => ({ process: [...state.process, ...newRefs] }));
    await syncToDB(get().original, get().process);
  },

  // ============================================================
  // 4. GET (Only returns files for the current tool)
  // ============================================================
  get: (name) => {
    const toolId = __currentToolId;
    return get().original.find(f => f.name === name && f.toolId === toolId) ||
           get().process.find(f => f.name === name && f.toolId === toolId);
  },

  // ============================================================
  // 5. LIST (Only returns files for the current tool) ⭐ MAGIC
  // ============================================================
  list: (type) => {
    const toolId = __currentToolId;
    const array = type === 'original' ? get().original : get().process;
    return array.filter(f => f.toolId === toolId);
  },

  // ============================================================
  // 6. READ (UNCHANGED - RETURNS BLOB FOR VIDEO/PDF TOOLS)
  // ============================================================
  read: async (name) => {
    const ref = get().get(name);
    if (!ref) return null;
    const bytes = await read(ref.storageKey);
    return new Blob([bytes], { type: ref.type });
  },

  // ============================================================
  // 6.5 👈 NEW METHOD: READ FILE (RETURNS NATIVE FILE FOR EXIF)
  // ============================================================
  readFile: async (storageKey: string) => {
    try {
      // Directly call the OPFS readFile (which returns a native File)
      return await opfsReadFile(storageKey);
    } catch (error) {
      console.warn('Failed to read file from OPFS:', error);
      return null;
    }
  },

  // ============================================================
  // 7. REMOVE (Deletes only the current tool's files)
  // ============================================================
  findDescendants: (parentId) => {
    const result: FileRef[] = [];
    const process = get().process;
    const queue = [parentId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = process.filter(p => p.parentId === current);
      for (const child of children) {
        result.push(child);
        queue.push(child.id);
      }
    }
    return result;
  },

  remove: async (name) => {
    const toolId = __currentToolId;
    const ref = get().original.find(f => f.name === name && f.toolId === toolId) ||
                get().process.find(f => f.name === name && f.toolId === toolId);
    if (!ref) return;

    const isOriginal = get().original.some(f => f.name === name && f.toolId === toolId);
    const allDescendants = get().findDescendants(ref.id).filter(f => f.toolId === toolId);

    for (const child of allDescendants) {
      await remove(child.storageKey);
    }
    await remove(ref.storageKey);

    if (isOriginal) {
      set((state) => ({
        original: state.original.filter(f => !(f.name === name && f.toolId === toolId)),
        process: state.process.filter(p => !allDescendants.some(d => d.id === p.id)),
      }));
    } else {
      set((state) => ({
        process: state.process.filter(f => !(f.name === name && f.toolId === toolId) && !allDescendants.some(d => d.id === f.id)),
      }));
    }

    await syncToDB(get().original, get().process);
  },

  // ============================================================
  // 8. CLEAR (Deletes ONLY the current tool's files) 🔥 FIXED
  // ============================================================
  clear: async () => {
    const toolId = __currentToolId;
    const myOriginals = get().original.filter(f => f.toolId === toolId);
    const myProcess = get().process.filter(f => f.toolId === toolId);

    for (const ref of [...myOriginals, ...myProcess]) {
      await remove(ref.storageKey);
    }

    set((state) => ({
      original: state.original.filter(f => f.toolId !== toolId),
      process: state.process.filter(f => f.toolId !== toolId),
    }));
    await syncToDB(get().original, get().process);
  },

  // ============================================================
  // 9. PROMOTE (Moves ONLY the current tool's process) 🔥 FIXED
  // ============================================================
  promote: async () => {
    const toolId = __currentToolId;
    const { process, original } = get();

    const myProcess = process.filter(f => f.toolId === toolId);
    if (myProcess.length === 0) return;

    const myOriginals = original.filter(f => f.toolId === toolId);
    let nextIndex = myOriginals.length > 0
      ? Math.max(...myOriginals.map(f => parseInt(f.name.replace('original', ''), 10)))
      : 0;

    const newOriginals = myProcess.map((ref) => ({
      ...ref,
      id: crypto.randomUUID(),
      toolId: toolId, // Stays in the same tool
      name: `original${++nextIndex}`,
      parentId: undefined,
      createdAt: Date.now(),
      // storageKey stays the SAME!
    }));

    const movedIds = new Set(myProcess.map(f => f.id));
    set((state) => ({
      original: [...state.original, ...newOriginals],
      process: state.process.filter(f => !movedIds.has(f.id)),
    }));
    await syncToDB(get().original, get().process);
  },

  // ============================================================
  // 10. GARBAGE COLLECTION (Unchanged - cleans global OPFS)
  // ============================================================
  garbageCollect: async () => {
    const state = get();
    const validKeys = new Set([
      ...state.original.map(f => f.storageKey),
      ...state.process.map(f => f.storageKey),
    ]);
    const allFiles = await listAll();
    for (const file of allFiles) {
      if (!validKeys.has(file)) {
        await remove(file);
      }
    }
  },
}));