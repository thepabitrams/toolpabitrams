// src/core/components/ui/IconButton.tsx
import React from 'react';
import { Motion } from '@/core/motion/motion';
import { iconButtonMotion } from '@/core/motion/compositions/iconButtonMotion';

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface IconButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const iconSizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  variant = 'standard',
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel,
}) => {
  const variantStyles = {
    standard: `
      bg-transparent
      text-gray-600 dark:text-gray-300
      hover:text-blue-600 dark:hover:text-blue-400
      hover:bg-gray-100/50 dark:hover:bg-gray-800/50
      disabled:text-gray-400 dark:disabled:text-gray-500
    `,
    filled: `
      bg-blue-600 dark:bg-blue-700
      text-white
      hover:bg-blue-700 dark:hover:bg-blue-600
      disabled:bg-gray-300 dark:disabled:bg-gray-600
      disabled:text-gray-400 dark:disabled:text-gray-400
    `,
    tonal: `
      bg-blue-50 dark:bg-blue-950/50
      text-blue-600 dark:text-blue-300
      hover:text-blue-700 dark:hover:text-blue-200
      hover:bg-blue-100 dark:hover:bg-blue-900/50
      disabled:bg-gray-100 dark:disabled:bg-gray-800
      disabled:text-gray-400 dark:disabled:text-gray-500
    `,
    outlined: `
      bg-transparent
      border border-gray-300 dark:border-gray-600
      text-gray-600 dark:text-gray-300
      hover:text-blue-600 dark:hover:text-blue-400
      hover:border-blue-500 dark:hover:border-blue-400
      hover:bg-gray-50/50 dark:hover:bg-gray-800/50
      disabled:border-gray-200 dark:disabled:border-gray-700
      disabled:text-gray-400 dark:disabled:text-gray-500
    `,
  };

  const sizeClass = sizeMap[size];
  const iconSizeClass = iconSizeMap[size];

  return (
    <Motion
      preset={iconButtonMotion}
      as="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center
        rounded-full
        select-none
        cursor-pointer
        focus:outline-none
        disabled:opacity-50 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeClass}
        ${className}
      `}
    >
      <span className={iconSizeClass}>
        {children}
      </span>
    </Motion>
  );
};