// core/motion/compositions/removeButton.ts

import { transitionClass } from '../tokens';

/**
 * Remove button composition
 * Used for delete/remove buttons (X buttons on cards, modals, etc.)
 * - Hover: turns red background + icon turns red
 * - Active: scales down with spring effect
 */
export const removeButtonMotion = () => ({
  className: `
    group // 👈 ADD THIS
    ${transitionClass('all')}
    hover:bg-red-50 dark:hover:bg-red-950/20
    active:scale-[0.95]
    active:duration-150
    active:ease-[cubic-bezier(0.34,1.56,0.64,1)]
  `,
});