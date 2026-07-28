// src/core/components/ui/Grid.tsx

import React, { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  /** Minimum width of each column (px) – default: 360px */
  minCardWidth?: number;
  /** Gap between cards (px) – default: 8px */
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
        // 🟢 COLUMNS: auto-fit creates as many columns as fit, minmax controls min width
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
        gap: `${gap}px`,
        width: '100%',
        // 🟢 ROWS: auto height based on the tallest card in each row
        gridAutoRows: 'auto',
        // 🟢 CRITICAL FIX: Cards keep their own height (no stretching)
        alignItems: 'start',
      }}
    >
      {children}
    </div>
  );
}