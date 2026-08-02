// core/motion/compositions/input.ts
import { transitionClass, scale } from '../tokens';
import { hoverScale } from '../interactions/hover';
import { pressScale } from '../interactions/press';
import { focusRing } from '../interactions/focus';

/**
 * A shared motion for all text/number inputs
 * - Focus ring (blue glow)
 * - Hover scale (subtle lift)
 * - Press scale (spring down)
 * - Smooth colour transitions
 * - Applies default styling (white/dark backgrounds, padding, etc.)
 */
export const inputFieldMotion = () => ({
  className: `
    ${transitionClass('all')}
    ${focusRing()}
    ${hoverScale(scale.hoverSmall)}
    ${pressScale(scale.press)}
    hover:border-gray-400 dark:hover:border-gray-500
    transition-colors
    bg-white dark:bg-gray-800
    border border-gray-300 dark:border-gray-600
    rounded-lg
    text-gray-900 dark:text-white
    text-sm
    w-full
    px-3 py-2.5
    [appearance:textfield]
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
  `,
});