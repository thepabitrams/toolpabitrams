// src/core/components/ui/Container.tsx
import { ReactNode } from 'react';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}