import React from 'react';
import { Button } from '@/core/components/ui/Button';
import { ToolHub } from '@/core/components/layout/ToolHub';
import { useAction } from '@/shared/hooks/useAction';
import { Overlay } from '@/core/components/ui/Overlay';

interface ActionButtonProps {
  toolId: string;
  variant: 'single' | 'multiple';
  className?: string;
  onToolSelect: (selectedToolId: string, variant: 'single' | 'multiple') => Promise<void>;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  toolId,
  variant,
  className = '',
  onToolSelect,
}) => {
  const {
    isOpen,
    open,
    close,
    filter,
  } = useAction({ toolId });

  const handleSelect = async (selectedToolId: string) => {
    if (!selectedToolId) return;
    await onToolSelect(selectedToolId, variant);
    close();
  };

  return (
    <>
      <Button
        onClick={open}
        variant="ghost"
        className={`
          relative flex items-center justify-center gap-1.5 px-3 py-2 
          text-sm font-medium text-gray-600 dark:text-gray-300 
          hover:text-blue-600 dark:hover:text-blue-400 
          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 
          active:scale-[0.97]
          min-w-[80px]
          ${className}
        `}
      >
        <span>{variant === 'single' ? 'Action' : 'Action (All)'}</span>
      </Button>

      <Overlay isOpen={isOpen} onClose={close}>
        <ToolHub variant="grid" filter={filter} onToolSelect={handleSelect} />
      </Overlay>
    </>
  );
};