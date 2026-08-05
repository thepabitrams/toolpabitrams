import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Icon or text shown before the input (e.g., ₹, $) */
  prefix?: ReactNode;
  /** Icon or text shown after the input (e.g., kg, px) */
  suffix?: ReactNode;
  /** Makes input take full width of parent */
  fullWidth?: boolean;
}

/**
 * A Google-style Input component with label, error, prefix, suffix support.
 * Double-click to select all text.
 */
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

    const joinClasses = (...classes: (string | boolean | undefined | null)[]) => {
      return classes.filter(Boolean).join(' ');
    };

    const wrapperClasses = joinClasses(
      'flex flex-col gap-1.5',
      fullWidth && 'w-full'
    );

    const containerClasses = joinClasses(
      'flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2.5',
      'transition-all duration-200 ease-out',
      'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      error
        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20'
        : 'border-gray-300 dark:border-gray-600',
      disabled && 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed',
      className
    );

    const inputClasses = joinClasses(
      'w-full bg-transparent outline-none text-base text-gray-900 dark:text-white',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500',
      'min-w-0',
      // Add selection styling (Google-style blue highlight)
      'selection:bg-blue-500/30 dark:selection:bg-blue-400/30'
    );

    // Handle double-click to select all text
    const handleDoubleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      // Select all text in the input
      e.currentTarget.select();
      // Call the original onDoubleClick if provided
      if (onDoubleClick) {
        onDoubleClick(e);
      }
    };

    return (
      <div className={wrapperClasses}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className={containerClasses}>
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
            className={inputClasses}
            onDoubleClick={handleDoubleClick}
            {...props}
          />

          {suffix && (
            <span className="flex-shrink-0 text-gray-500 dark:text-gray-400 text-sm">
              {suffix}
            </span>
          )}
        </div>

        {/* Error message */}
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