// src/core/components/layout/ToolHub.tsx
import { useState } from 'react';
import { Search } from '@/core/components/ui/Search';
import { ToolCatalog } from '@/core/components/ui/ToolCatalog';
import { Container } from '@/core/components/ui/Container';
import { useTools } from '@/core/hooks/useTools';
import { useFilteredTools } from '@/core/hooks/useFilteredTools';
import { useToolUsage } from '@/core/hooks/useToolUsage';

interface ToolHubProps {
  variant?: 'grid' | 'list';
  category?: string | null;
  input?: string | null;
  onToolSelect?: (toolId: string) => void;
}

export function ToolHub({
  variant = 'grid',
  category = null,
  input = null,
  onToolSelect,
}: ToolHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { tools, loading } = useTools();
  const filteredTools = useFilteredTools(tools, searchQuery, { category, input });
  const { currentToolId } = useToolUsage();

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950">
      <Container className="px-0">
        <Search value={searchQuery} onChange={setSearchQuery} />
      </Container>
      <Container className="px-0">
        <ToolCatalog
          tools={filteredTools}
          variant={variant}
          loading={loading}
          currentToolId={currentToolId}
          onToolSelect={onToolSelect}
        />
      </Container>
    </div>
  );
}