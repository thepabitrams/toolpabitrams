// src/core/store/toolStore.ts
/**
 * 🏪 ToolStore — Zustand Store for Tool Data
 *
 * Manages:
 * - Favorites (tools the user has starred)
 * - Usage counts (how many times each tool is used)
 * - Current tool (for resume-on-refresh)
 *
 * Persistence:
 * - Uses IndexedDB via toolDB (not localStorage)
 * - Auto-saves on every state change
 * - Auto-loads on app initialization
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Tool } from '@/core/registry/toolRegistry';
import {
  saveToolData,
  loadToolData,
  clearToolData,
  type ToolData,
} from '@/core/services/toolDB'; // ✅ UPDATED: lowercase 'toolDB'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Custom Storage Adapter (Zustand ↔ IndexedDB)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Store Interface
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ToolStore {
  // ── State ──
  favorites: string[];
  usageCounts: Record<string, number>;
  currentTool: Tool | null;
  currentToolId: string | null;

  // ── Actions ──
  toggleFavorite: (toolId: string) => void;
  incrementUsage: (toolId: string) => void;
  setCurrentTool: (tool: Tool | null) => void;
  reset: () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Store Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useToolStore = create<ToolStore>()(
  persist(
    (set) => ({
      // ── Initial State ──
      favorites: [],
      usageCounts: {},
      currentTool: null,
      currentToolId: null,

      // ── Actions ──

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
      // ── Persist Configuration ──
      name: 'tool-storage',
      storage: createJSONStorage(() => toolIndexedDBStorage),
      // 🔥 Only persist these fields (exclude currentTool which is a reference)
      partialize: (state) => ({
        favorites: state.favorites,
        usageCounts: state.usageCounts,
        currentToolId: state.currentToolId,
      }),
    }
  )
);