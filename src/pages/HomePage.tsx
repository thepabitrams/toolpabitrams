// src/pages/HomePage.tsx
import { Header } from '@/core/components/layout/Header';
import { Footer } from '@/core/components/layout/Footer';
import { ToolHub } from '@/core/components/layout/ToolHub';
import { Container } from '@/core/components/ui/Container';

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="grid" />
      <main className="flex-1">
        <Container>
          <ToolHub variant="grid" />
        </Container>
      </main>
      <Footer />
    </div>
  );
}