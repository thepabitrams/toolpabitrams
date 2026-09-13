// src/tools/image/image-filters/Slider.tsx
import React from 'react';

interface SliderProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = React.memo(({
  icon,
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = parseFloat(event.target.value);
    onChange(nextValue);
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <span
        tabIndex={0}
        aria-label={label}
        className="group relative w-5 flex items-center justify-center text-gray-500 dark:text-gray-400 outline-none cursor-help select-none"
      >
        {icon}
        <span
          role="tooltip"
          className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-20 whitespace-nowrap rounded-md bg-gray-900 dark:bg-gray-100 px-2 py-1 text-[10px] font-medium text-white dark:text-gray-900 opacity-0 scale-95 transition-all duration-100 group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100"
        >
          {label}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label={label}
        className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800"
      />
      <span className="w-10 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
        {value}{suffix}
      </span>
    </div>
  );
});

Slider.displayName = 'Slider';