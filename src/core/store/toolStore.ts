// src/core/store/toolStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Tool } from '@/core/registry/toolRegistry';
import {
  saveToolData,
  loadToolData,
  clearToolData,
  type ToolData,
} from '@/core/services/toolDB';

const toolIndexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const data = await loadToolData();
    return data ? JSON.stringify(data) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const data = JSON.parse(value) as ToolData;
    await saveToolData(data);
  },
  removeItem: async (name: string): Promise<void> => {
    await clearToolData();
  },
};

interface ToolStore {
  favorites: string[];
  usageCounts: Record<string, number>;
  currentTool: Tool | null;
  currentToolId: string | null;

  toggleFavorite: (toolId: string) => void;
  incrementUsage: (toolId: string) => void;
  setCurrentTool: (tool: Tool | null) => void;
  reset: () => void;
}

export const useToolStore = create<ToolStore>()(
  persist(
    (set) => ({
      favorites: [],
      usageCounts: {},
      currentTool: null,
      currentToolId: null,

      toggleFavorite: (toolId: string) =>
        set((state) => {
          const favs = state.favorites.includes(toolId)
            ? state.favorites.filter((id) => id !== toolId)
            : [...state.favorites, toolId];
          return { favorites: favs };
        }),

      incrementUsage: (toolId: string) =>
        set((state) => ({
          usageCounts: {
            ...state.usageCounts,
            [toolId]: (state.usageCounts[toolId] || 0) + 1,
          },
        })),

      setCurrentTool: (tool: Tool | null) =>
        set({
          currentTool: tool,
          currentToolId: tool?.id || null,
        }),

      reset: () =>
        set({
          favorites: [],
          usageCounts: {},
          currentTool: null,
          currentToolId: null,
        }),
    }),
    {
      name: 'tool-storage',
      storage: createJSONStorage(() => toolIndexedDBStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        usageCounts: state.usageCounts,
        currentToolId: state.currentToolId,
      }),
    }
  )
);