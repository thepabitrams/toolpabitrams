import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getToolRegistry } from '@/core/registry/toolRegistry';
import type { Tool } from '@/core/registry/toolRegistry';
import { useToolStore } from '@/core/store/toolStore';

export function ToolViewer() {
  const { toolId } = useParams<{ toolId: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const setCurrentTool = useToolStore((state) => state.setCurrentTool);

  useEffect(() => {
    if (!toolId) {
      setLoading(false);
      setCurrentTool(null);
      return;
    }

    getToolRegistry().then((registry) => {
      const found = registry.find((t) => t.id === toolId);
      setTool(found || null);
      setCurrentTool(found || null);
      setLoading(false);
    });
  }, [toolId, setCurrentTool]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="w-full max-w-7xl mx-auto text-center py-12">
        <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300">
          Tool not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The tool you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const ToolComponent = tool.component;
  return (
    <div className="w-full max-w-7xl mx-auto">
      <ToolComponent
        category={tool.category}
        toolId={toolId}
      />
    </div>
  );
}