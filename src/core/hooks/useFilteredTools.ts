// src/core/hooks/useFilteredTools.ts
import { useMemo, useDeferredValue } from 'react';
import { useToolStore } from '@/core/store/toolStore';
import type { Tool } from '@/core/registry/toolRegistry';

interface ToolFilters {
  category?: string | null;
  input?: string | null;
}

export function useFilteredTools(
  tools: Tool[],
  searchQuery: string,
  filters: ToolFilters = {}
) {
  const { favorites, usageCounts } = useToolStore();
  const deferredQuery = useDeferredValue(searchQuery);

  return useMemo(() => {
    let result = tools;

    // 🔥 Filter by category
    if (filters.category) {
      result = result.filter((tool) => tool.category === filters.category);
    }

    // 🔥 Filter by input
    if (filters.input) {
      result = result.filter((tool) => tool.input === filters.input);
    }

    // Apply search
    if (deferredQuery.trim()) {
      const lower = deferredQuery.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(lower) ||
          tool.description.toLowerCase().includes(lower)
      );
    }

    // Sort: Favorites → Most Used → Alphabetical
    return result.sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;
      const aUsage = usageCounts[a.id] || 0;
      const bUsage = usageCounts[b.id] || 0;
      if (aUsage !== bUsage) return bUsage - aUsage;
      return a.name.localeCompare(b.name);
    });
  }, [tools, deferredQuery, filters, favorites, usageCounts]);
}