// src/core/components/ui/Grid.tsx

import React, { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  minCardWidth?: number;
  gap?: number;
  className?: string;
}

export function Grid({ 
  children, 
  minCardWidth = 360, 
  gap = 8,
  className = '',
}: GridProps) {
  return (
    <div 
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
        gap: `${gap}px`,
        width: '100%',
        gridAutoRows: 'auto',
        alignItems: 'start',
      }}
    >
      {children}
    </div>
  );
}