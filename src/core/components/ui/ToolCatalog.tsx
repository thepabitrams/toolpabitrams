// src/core/components/ui/ToolCatalog.tsx
import { ToolCard } from './ToolCard';
import { Grid } from './Grid';
import type { Tool } from '@/core/registry/toolRegistry';

interface ToolCatalogProps {
  tools: Tool[];
  variant: 'grid' | 'list';
  loading: boolean;
  currentToolId: string | null;
  onToolSelect?: (toolId: string) => void;
}

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xs border border-gray-200/50 dark:border-gray-800/50 animate-pulse w-full max-w-[280px] mx-auto">
    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 ml-auto mb-4" />
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
  </div>
);

const SkeletonRow = () => (
  <div className="flex items-center gap-3 px-4 py-2 rounded-lg animate-pulse">
    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
  </div>
);

export function ToolCatalog({
  tools,
  variant,
  loading,
  currentToolId,
  onToolSelect,
}: ToolCatalogProps) {
  // 🔥 LOADING STATE
  if (loading) {
    if (variant === 'list') {
      return (
        <div className="space-y-1">
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      );
    }
    return (
      <Grid minCardWidth={200} gap={16} className="pt-6">
        {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
      </Grid>
    );
  }

  // 🔥 EMPTY STATE
  if (tools.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No tools found. Try a different search.</p>
      </div>
    );
  }

  // 🔥 LIST VIEW
  if (variant === 'list') {
    return (
      <div className="space-y-1">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`rounded-lg transition-colors ${
              currentToolId === tool.id
                ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                : ''
            }`}
          >
            <ToolCard
              tool={tool}
              variant="list"
              onToolSelect={onToolSelect}
            />
          </div>
        ))}
      </div>
    );
  }

  // 🔥 GRID VIEW
  return (
    <Grid minCardWidth={200} gap={16} className="pt-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          variant="grid"
          onToolSelect={onToolSelect}
        />
      ))}
    </Grid>
  );
}