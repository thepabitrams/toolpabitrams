// src/tools/productivity/bulletin-board/store/taskStore.ts
import { create } from 'zustand';
import { writeFile, readFile, deleteFile } from '../lib/opfs';
import { saveMetadata, getMetadata, deleteMetadata } from '../lib/indexeddb';
import { getTaskWindow } from '../lib/helpers';

const STORAGE_KEY = 'bulletin-board-tasks.json';
const ORDER_KEY = 'bulletin-board-order.json';

export interface Task {
  id: string;
  title: string;
  type: 'permanent' | 'temporary';
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
  startDate: string;
  endDate?: string | null;
  checkedDates: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isTrash: boolean;
  trashDays?: number | null;
}

export interface TaskStore {
  tasks: Task[];
  taskOrder: string[];
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'checkedDates' | 'deletedAt' | 'isTrash' | 'trashDays'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  moveTask: (id: string, targetIndex: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  deleteAllTasks: () => Promise<void>;
  exportTasks: () => Promise<void>;
  importTasks: () => Promise<void>;
  cleanup: () => Promise<void>;
}

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function readTasks(): Promise<Task[]> {
  const storageKey = await getMetadata();
  if (storageKey) {
    try {
      const buffer = await readFile(storageKey);
      const text = new TextDecoder().decode(buffer);
      const data = JSON.parse(text);
      if (Array.isArray(data)) return data;
    } catch {}
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { return []; }
  }
  return [];
}

async function readOrder(): Promise<string[]> {
  const saved = localStorage.getItem(ORDER_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch { return []; }
  }
  return [];
}

async function writeTasksAndOrder(tasks: Task[], order: string[]): Promise<void> {
  const jsonTasks = JSON.stringify(tasks, null, 2);
  const jsonOrder = JSON.stringify(order, null, 2);
  const encoder = new TextEncoder();
  try {
    await writeFile(STORAGE_KEY, encoder.encode(jsonTasks).buffer);
    await writeFile(ORDER_KEY, encoder.encode(jsonOrder).buffer);
    await saveMetadata(STORAGE_KEY);
  } catch (opfsError) {
    console.error('OPFS write failed, aborting persistence:', opfsError);
    throw opfsError;
  }
  localStorage.setItem(STORAGE_KEY, jsonTasks);
  localStorage.setItem(ORDER_KEY, jsonOrder);
}

async function deleteAllData(): Promise<void> {
  try { await deleteFile(STORAGE_KEY); } catch {}
  try { await deleteFile(ORDER_KEY); } catch {}
  try { await deleteMetadata(); } catch {}
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ORDER_KEY);
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  taskOrder: [],

  cleanup: async () => {
    const state = get();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasChanges = false;
    const cleaned = state.tasks
      .map((t) => {
        if (t.isTrash) {
          const deletedDate = new Date(t.deletedAt!);
          if (t.trashDays !== undefined && t.trashDays !== null) {
            const daysSinceDelete = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceDelete >= t.trashDays) {
              hasChanges = true;
              return null;
            }
          } else {
            if (deletedDate <= thirtyDaysAgo) {
              hasChanges = true;
              return null;
            }
          }
          return t;
        }

        if (t.type === 'temporary' && t.endDate) {
          const end = new Date(t.endDate);
          end.setHours(23, 59, 59, 999);
          if (now > end) {
            hasChanges = true;
            return null;
          }
        }

        if (t.checkedDates && t.checkedDates.length > 0) {
          try {
            const tempTask = { ...t } as Task;
            const window = getTaskWindow(tempTask, today);
            if (window && window.length > 0) {
              const oldestWindowDate = new Date(window[0].date);
              oldestWindowDate.setHours(0, 0, 0, 0);
              const filtered = t.checkedDates.filter((dateStr) => {
                const d = new Date(dateStr);
                d.setHours(0, 0, 0, 0);
                return d >= oldestWindowDate;
              });
              if (filtered.length !== t.checkedDates.length) {
                hasChanges = true;
                return { ...t, checkedDates: filtered };
              }
            }
          } catch {}
        }
        return t;
      })
      .filter((t) => t !== null) as Task[];

    if (hasChanges) {
      const validIds = new Set(cleaned.map((t) => t.id));
      const order = state.taskOrder.filter((id) => validIds.has(id));
      try {
        await writeTasksAndOrder(cleaned, order);
        set({ tasks: cleaned, taskOrder: order });
      } catch (error) {
        console.error('cleanup write failed:', error);
      }
    }
  },

  loadTasks: async () => {
    const tasks = await readTasks();
    let order = await readOrder();
    const validIds = new Set(tasks.map((t) => t.id));
    order = order.filter((id) => validIds.has(id));
    const missing = tasks
      .filter((t) => !order.includes(t.id) && !t.isTrash)
      .map((t) => t.id);
    order = [...order, ...missing];
    set({ tasks, taskOrder: order });
    await get().cleanup();
  },

  addTask: async (taskData) => {
    const state = get();
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      checkedDates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      isTrash: false,
      trashDays: null,
    };
    const tasks = [...state.tasks, newTask];
    const order = [...state.taskOrder, newTask.id];
    try {
      await writeTasksAndOrder(tasks, order);
      set({ tasks, taskOrder: order });
      await get().cleanup();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  },

  updateTask: async (id, data) => {
    const state = get();
    const tasks = state.tasks.map((t) =>
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    );
    try {
      await writeTasksAndOrder(tasks, state.taskOrder);
      set({ tasks });
      await get().cleanup();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  moveTask: async (id, targetIndex) => {
    const state = get();
    const order = [...state.taskOrder];
    const currentIndex = order.indexOf(id);
    if (currentIndex === -1) return;
    order.splice(currentIndex, 1);
    const clamped = Math.max(0, Math.min(order.length, targetIndex));
    order.splice(clamped, 0, id);
    try {
      await writeTasksAndOrder(state.tasks, order);
      set({ taskOrder: order });
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  },

  deleteTask: async (id) => {
    const state = get();
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    let trashDays = 30;

    if (task.type === 'temporary' && task.endDate) {
      const now = new Date();
      const end = new Date(task.endDate);
      end.setHours(23, 59, 59, 999);
      const diffMs = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        const filtered = state.tasks.filter(t => t.id !== id);
        const order = state.taskOrder.filter(oid => oid !== id);
        try {
          await writeTasksAndOrder(filtered, order);
          set({ tasks: filtered, taskOrder: order });
        } catch (error) {
          console.error('Failed to delete expired task:', error);
        }
        return;
      }
      trashDays = Math.max(1, diffDays);
    }

    const tasks = state.tasks.map(t =>
      t.id === id
        ? {
            ...t,
            isTrash: true,
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            trashDays: trashDays,
          }
        : t
    );
    const order = state.taskOrder.filter(oid => oid !== id);
    try {
      await writeTasksAndOrder(tasks, order);
      set({ tasks, taskOrder: order });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },

  restoreTask: async (id) => {
    const state = get();
    const tasks = state.tasks.map((t) =>
      t.id === id
        ? { ...t, isTrash: false, deletedAt: null, updatedAt: new Date().toISOString(), trashDays: null }
        : t
    );
    const order = [...state.taskOrder, id];
    try {
      await writeTasksAndOrder(tasks, order);
      set({ tasks, taskOrder: order });
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  },

  permanentDelete: async (id) => {
    const state = get();
    const tasks = state.tasks.filter((t) => t.id !== id);
    const order = state.taskOrder.filter((oid) => oid !== id);
    try {
      await writeTasksAndOrder(tasks, order);
      set({ tasks, taskOrder: order });
    } catch (error) {
      console.error('Failed to permanently delete task:', error);
    }
  },

  deleteAllTasks: async () => {
    set({ tasks: [], taskOrder: [] });
    await deleteAllData();
  },

  exportTasks: async () => {
    const state = get();
    const data = { tasks: state.tasks, order: state.taskOrder };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulletin-board-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importTasks: async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.tasks && Array.isArray(data.tasks) && data.order && Array.isArray(data.order)) {
          const tasks = data.tasks;
          const order = data.order.filter((id: string) => tasks.some((t: Task) => t.id === id));
          await writeTasksAndOrder(tasks, order);
          set({ tasks, taskOrder: order });
          await get().cleanup();
          alert('Import successful!');
        } else {
          alert('Invalid format');
        }
      } catch {
        alert('Invalid file');
      }
    };
    input.click();
  },
}));