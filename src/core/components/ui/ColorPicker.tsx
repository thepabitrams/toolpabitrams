// src/core/components/ui/ColorPicker.tsx
import React, { useRef } from 'react';
import colorPickerMotion from '@/core/motion/compositions/colorPickerMotion';

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
  size = 'sm',
  className = '',
  label,
  showLabel = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`flex items-center gap-1.5 flex-shrink-0 ${className}`}>
      {showLabel && label && (
        <label className={colorPickerMotion.label}>{label}</label>
      )}
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={colorPickerMotion.base(size)}
      />
    </div>
  );
};

export default ColorPicker;