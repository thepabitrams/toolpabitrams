// src/tools/image/image-filters/components/IFPresetButton.tsx
import React from 'react';

interface IFPresetButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const IFPresetButton: React.FC<IFPresetButtonProps> = ({
  label,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-xs font-medium rounded-lg transition-all
        ${active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
      `}
    >
      {label}
    </button>
  );
};