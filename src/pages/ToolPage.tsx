// src/pages/ToolPage.tsx
import { useParams, Navigate } from 'react-router-dom';
import { Header } from '@/core/components/layout/Header';
import { Footer } from '@/core/components/layout/Footer';
import { ToolViewer } from '@/core/components/layout/ToolViewer';
import { Container } from '@/core/components/ui/Container';
import { useToolStore } from '@/core/store/toolStore';
import { ToolProvider } from '@/contexts/ToolContext';

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const currentTool = useToolStore((state) => state.currentTool);
  const toolName = currentTool?.name || 'Tool';

  if (!toolId) {
    return <Navigate to="/" replace />;
  }

  return (
    <ToolProvider toolId={toolId}>
      <div className="min-h-screen flex flex-col">
        <Header variant="list" toolName={toolName} />
        <main
          className="flex-1 py-8"
          data-tool-container
        >
          <Container>
            <div className="mt-4">
              <ToolViewer />
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    </ToolProvider>
  );
}