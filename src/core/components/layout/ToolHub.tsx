import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from '@/core/components/ui/Search';
import { ToolCatalog } from '@/core/components/ui/ToolCatalog';
import { Container } from '@/core/components/ui/Container';
import { useTools } from '@/core/hooks/useTools';
import { useFilteredTools } from '@/core/hooks/useFilteredTools';
import { useToolUsage } from '@/core/hooks/useToolUsage';
import { preloadTool } from '@/core/registry/toolRegistry';

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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { tools, loading } = useTools();
  const filteredTools = useFilteredTools(tools, searchQuery, { category, input });
  const { currentToolId } = useToolUsage();

  const handleSelect = (toolId: string) => {
    if (onToolSelect) {
      onToolSelect(toolId);
    } else {
      navigate(`/${toolId}`);
    }
  };

  const handleHover = (toolId: string) => {
    preloadTool(toolId);
  };

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
          onToolSelect={handleSelect}
          onToolHover={handleHover}
        />
      </Container>
    </div>
  );
}