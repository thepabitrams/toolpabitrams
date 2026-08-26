// src/core/components/ui/Card.tsx
import React, { ReactNode, HTMLAttributes } from 'react';
import { Motion } from '@/core/motion/motion';
import { cardMotion } from '@/core/motion/compositions/cardMotion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean; // 👈 Explicitly define it so we can filter it
  preset?: typeof cardMotion;
}

export const Card = ({
  children,
  className = '',
  onClick,
  hover, // 👈 Explicitly destructure (we won't use it yet, but we capture it)
  preset = cardMotion,
  ...rest // 👈 Rest now contains ONLY valid HTML attributes
}: CardProps) => {
  return (
    <Motion
      preset={preset}
      as="div"
      className={`
        bg-white dark:bg-gray-900 
        rounded-2xl 
        border border-gray-200/50 dark:border-gray-800/50
        focus:outline-none
        ${className}
      `}
      onClick={onClick}
      {...rest} // 👈 `hover` is NOT in `rest` anymore, so it won't reach the DOM!
    >
      {children}
    </Motion>
  );
};