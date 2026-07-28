// src/core/hooks/useTools.ts
import { useState, useEffect } from 'react';
import { getToolRegistry } from '@/core/registry/toolRegistry';
import type { Tool } from '@/core/registry/toolRegistry';

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToolRegistry().then((registry) => {
      setTools(registry);
      setLoading(false);
    });
  }, []);

  return { tools, loading };
}