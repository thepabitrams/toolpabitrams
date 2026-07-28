// src/core/hooks/useToolUsage.ts
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToolStore } from '@/core/store/toolStore';

export function useToolUsage() {
  const { toolId } = useParams();
  const incrementUsage = useToolStore((state) => state.incrementUsage);

  useEffect(() => {
    if (toolId) incrementUsage(toolId);
  }, [toolId]);

  return { currentToolId: toolId || null };
}