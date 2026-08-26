// src/tools/image/image-filters/components/IFSlider.tsx
import React from 'react';

interface IFSliderProps {
  label: string;
  keyName: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  note?: string;
  onChange: (value: number) => void;
}

export const IFSlider: React.FC<IFSliderProps> = React.memo(({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  note = '',
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(val);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20 truncate">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-10 text-right">
        {value}{suffix}
      </span>
      {note && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 w-16 text-right">
          {note}
        </span>
      )}
    </div>
  );
});

IFSlider.displayName = 'IFSlider';