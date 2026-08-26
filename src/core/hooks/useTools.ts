import { useEffect, useState } from 'react';
import { FallbackComponent } from '@/core/registry/toolRegistry';
import type { Tool } from '@/core/registry/toolRegistry';

let cachedTools: Tool[] | null = null;

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cachedTools) {
      setTools(cachedTools);
      setLoading(false);
      return;
    }

    fetch('/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error('Manifest not found');
        return res.json();
      })
      .then((data) => {
        const mapped: Tool[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || 'No description provided',
          category: item.category || 'file',
          input: 'single',
          component: FallbackComponent,
        }));
        cachedTools = mapped;
        setTools(mapped);
        setLoading(false);
      })
      .catch(() => {
        setTools([]);
        setLoading(false);
      });
  }, []);

  return { tools, loading };
}