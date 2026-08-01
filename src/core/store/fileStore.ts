// src/core/store/fileStore.ts
import { create } from 'zustand';
import { write, read, remove, listAll, readFile as opfsReadFile } from '@/core/services/opfs';
import { saveCatalog, loadCatalog } from '@/core/services/indexeddb';

/**
 * FileRef: The lightweight metadata entry for each file.
 * This is what lives in Zustand and IndexedDB.
 * The actual file bytes stay in OPFS.
 */
export interface FileRef {
  id: string;
  toolId: string;
  name: string;
  storageKey: string;
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
  read: (name: string) => Promise<Blob | null>;
  readFile: (storageKey: string) => Promise<File | null>;
  remove: (name: string) => Promise<void>;
  clear: () => Promise<void>;
  promote: (fileName?: string, targetToolId?: string) => Promise<void>; // 👈 CHANGED
  findDescendants: (parentId: string) => FileRef[];
  garbageCollect: () => Promise<void>;
}

// ================================================================
// 🧠 GLOBAL CONTEXT SWITCH
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
  // 2. UPLOAD
  // ============================================================
  upload: async (files) => {
    const toolId = __currentToolId;
    const newRefs: FileRef[] = [];

    for (const file of files) {
      const id = crypto.randomUUID();
      const storageKey = `orig-${id}`;
      await write(storageKey, await file.arrayBuffer());

      const myOriginals = get().original.filter(f => f.toolId === toolId);

      newRefs.push({
        id,
        toolId,
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
  // 3. SAVE
  // ============================================================
  save: async (files, parentId) => {
    const toolId = __currentToolId;
    const newRefs: FileRef[] = [];

    for (const file of files) {
      const id = crypto.randomUUID();
      const storageKey = `proc-${id}`;
      await write(storageKey, await file.arrayBuffer());

      const myProcess = get().process.filter(f => f.toolId === toolId);

      newRefs.push({
        id,
        toolId,
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
  // 4. GET
  // ============================================================
  get: (name) => {
    const toolId = __currentToolId;
    return get().original.find(f => f.name === name && f.toolId === toolId) ||
           get().process.find(f => f.name === name && f.toolId === toolId);
  },

  // ============================================================
  // 5. LIST
  // ============================================================
  list: (type) => {
    const toolId = __currentToolId;
    const array = type === 'original' ? get().original : get().process;
    return array.filter(f => f.toolId === toolId);
  },

  // ============================================================
  // 6. READ
  // ============================================================
  read: async (name) => {
    const ref = get().get(name);
    if (!ref) return null;
    const bytes = await read(ref.storageKey);
    return new Blob([bytes], { type: ref.type });
  },

  // ============================================================
  // 6.5 READ FILE (RETURNS NATIVE FILE)
  // ============================================================
  readFile: async (storageKey: string) => {
    try {
      return await opfsReadFile(storageKey);
    } catch (error) {
      console.warn('Failed to read file from OPFS:', error);
      return null;
    }
  },

  // ============================================================
  // 7. FIND DESCENDANTS
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

  // ============================================================
  // 8. REMOVE
  // ============================================================
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
  // 9. CLEAR
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
  // 10. PROMOTE (Moves process files to target tool's original) 🔥 UPDATED
  // ============================================================
  promote: async (fileName?: string, targetToolId?: string) => {
    const sourceToolId = __currentToolId;
    const targetId = targetToolId || sourceToolId;

    const { process, original } = get();

    // Get source tool's process files
    const myProcess = process.filter(f => f.toolId === sourceToolId);
    if (myProcess.length === 0) return;

    // Which files to promote?
    const filesToPromote = fileName
      ? myProcess.filter(f => f.name === fileName)
      : myProcess;

    if (fileName && filesToPromote.length === 0) {
      console.warn(`No file found with name: ${fileName}`);
      return;
    }

    // Get target tool's existing originals for naming
    const targetOriginals = original.filter(f => f.toolId === targetId);
    let nextIndex = targetOriginals.length > 0
      ? Math.max(...targetOriginals.map(f => parseInt(f.name.replace('original', ''), 10)))
      : 0;

    // Create new original entries with TARGET tool ID
    const newOriginals = filesToPromote.map((ref) => ({
      ...ref,
      id: crypto.randomUUID(),
      toolId: targetId,
      name: `original${++nextIndex}`,
      parentId: undefined,
      createdAt: Date.now(),
    }));

    // Move: remove from source process, add to target original
    const movedIds = new Set(filesToPromote.map(f => f.id));
    set((state) => ({
      original: [...state.original, ...newOriginals],
      process: state.process.filter(f => !movedIds.has(f.id)),
    }));
    await syncToDB(get().original, get().process);
  },

  // ============================================================
  // 11. GARBAGE COLLECTION
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