// src/core/motion/compositions/inputMotion.ts
const cx = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

const inputMotion = {
  wrapper: 'flex flex-col gap-1.5 w-full',

  container: (error?: boolean, className?: string) =>
    cx(
      'flex items-center gap-2 rounded-xl border bg-white dark:bg-gray-800 px-3 py-2.5',
      'transition-all duration-200 ease-out',
      'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
      'hover:border-gray-400 dark:hover:border-gray-500',
      error
        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20'
        : 'border-gray-300 dark:border-gray-600',
      className
    ),

  field: (className?: string) =>
    cx(
      'w-full bg-transparent outline-none text-base text-gray-900 dark:text-white',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'disabled:cursor-not-allowed disabled:text-gray-400 dark:disabled:text-gray-500',
      'min-w-0',
      'selection:bg-blue-500/30 dark:selection:bg-blue-400/30',
      className
    ),
};

export default inputMotion;