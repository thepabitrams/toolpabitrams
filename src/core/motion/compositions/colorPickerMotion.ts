// src/core/motion/compositions/colorPickerMotion.ts
const cx = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

const colorPickerMotion = {
  sizes: {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  },

  base: (size: 'sm' | 'md' | 'lg' = 'sm', className?: string) =>
    cx(
      colorPickerMotion.sizes[size],
      'p-0 border-0 rounded-lg cursor-pointer bg-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'flex-shrink-0',
      className
    ),

  label: 'text-xs font-medium text-gray-600 dark:text-gray-400',
};

export default colorPickerMotion;