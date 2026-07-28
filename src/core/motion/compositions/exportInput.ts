// core/motion/compositions/exportInput.ts

import { transitionClass } from '../tokens';

/**
 * Export panel input composition
 * Used for the file name input in ExportPanel
 * - Focus ring (blue glow)
 * - Hover border change
 * - Disabled state
 */
export const exportInputMotion = () => ({
  className: `
    w-full px-3 py-2 text-sm
    bg-gray-50 dark:bg-gray-700/50
    border border-gray-200 dark:border-gray-600
    rounded-lg outline-none
    ${transitionClass('all')}
    hover:border-gray-400 dark:hover:border-gray-500
    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
});