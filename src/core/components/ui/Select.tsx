import React, { useEffect } from 'react';
import { Motion } from '@/core/motion/motion';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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

  useEffect(() => {
    const styleId = 'select-open-glow';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* 🔥 GLOW ONLY WHEN DROPDOWN IS OPEN! */
        select:open {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <Motion
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
        transition-colors duration-200 ease-out
        focus:outline-none
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