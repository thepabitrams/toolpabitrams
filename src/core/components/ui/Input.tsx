// src/core/components/ui/Input.tsx
import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import inputMotion from '@/core/motion/compositions/inputMotion';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      prefix,
      suffix,
      fullWidth = true,
      id,
      disabled = false,
      required = false,
      type = 'text',
      onDoubleClick,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      e.currentTarget.select();
      if (onDoubleClick) onDoubleClick(e);
    };

    return (
      <div className={`${inputMotion.wrapper} ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        <div className={inputMotion.container(!!error, className)}>
          {prefix && (
            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400 text-sm">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            className={inputMotion.field()}
            onDoubleClick={handleDoubleClick}
            {...props}
          />
          {suffix && (
            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400 text-sm">
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="text-xs">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };