import React from 'react';
import { Motion } from '@/core/motion/motion';
import { inputFieldMotion } from '@/core/motion/compositions/input';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;          // shows as disabled first option
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className = '',
  ...rest
}) => {
  return (
    <Motion
      preset={inputFieldMotion}
      as="select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        px-2 py-1.5
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg
        text-sm text-gray-900 dark:text-gray-100
        truncate
        ${className}
      `}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Motion>
  );
};