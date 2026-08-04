// src/core/components/ui/ColorPicker.tsx

import React, { useRef } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  label,
  showLabel = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={`flex items-center gap-1.5 flex-shrink-0 ${className}`}>
      {showLabel && label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          ${sizeClass}
          p-0 border-0 rounded-lg cursor-pointer bg-transparent
          focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed
          flex-shrink-0
        `}
      />
    </div>
  );
};

export default ColorPicker;