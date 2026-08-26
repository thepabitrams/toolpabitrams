// src/core/components/ui/Button.tsx
import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { Motion } from '@/core/motion/motion';
import { buttonMotion } from '@/core/motion/compositions/buttonMotion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
}

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...rest
}: ButtonProps) => {
  const variantStyles = {
    primary: `
      bg-blue-600 hover:bg-blue-700 
      dark:bg-blue-700 dark:hover:bg-blue-600
      text-white
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 
      dark:bg-gray-800 dark:hover:bg-gray-700
      text-gray-800 dark:text-gray-200
      hover:shadow-sm
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 
      dark:hover:bg-gray-800
      text-gray-700 dark:text-gray-300
    `,
    danger: `
      bg-red-600 hover:bg-red-700 
      dark:bg-red-700 dark:hover:bg-red-600
      text-white
      shadow-sm hover:shadow-md
    `,
  };

  return (
    <Motion
      preset={buttonMotion}
      as="button"
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        px-6 py-2.5
        text-sm font-medium
        rounded-lg
        select-none
        cursor-pointer
        disabled:opacity-50 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </Motion>
  );
};