// src/core/components/ui/Textarea.tsx
import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import textareaMotion from '@/core/motion/compositions/textareaMotion';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 2, error, ...rest }, ref) => {
    const combined = `
      ${textareaMotion.container(error, className)}
      ${textareaMotion.field()}
      ${textareaMotion.resize}
    `;
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={combined}
        {...rest}
      />
    );
  }
);

Textarea.displayName = 'Textarea';