// src/contexts/ToolContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { setCurrentToolId } from '@/core/store/fileStore';

const ToolContext = createContext<string | null>(null);

export const ToolProvider = ({ 
  toolId, 
  children 
}: { 
  toolId: string; 
  children: React.ReactNode;
}) => {
  // Every time the tool changes, update the global store variable.
  useEffect(() => {
    setCurrentToolId(toolId);
  }, [toolId]);

  return (
    <ToolContext.Provider value={toolId}>
      {children}
    </ToolContext.Provider>
  );
};

export const useToolId = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolId must be used within a ToolProvider');
  }
  return context;
};