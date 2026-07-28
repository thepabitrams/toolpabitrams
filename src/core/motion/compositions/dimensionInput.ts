// core/motion/compositions/dimensionInput.ts
import { transitionClass, scale } from '../tokens';
import { hoverScale } from '../interactions/hover';
import { pressScale } from '../interactions/press';
import { focusRing } from '../interactions/focus';
// ❌ REMOVED: import { focusShadow } from '../interactions/shadow';

/**
 * Composition for input fields in the dimension input component
 * - Focus ring (blue glow)
 * - Hover scale (subtle lift)
 * - Press scale (spring down)
 */
export const dimensionInputMotion = () => ({
  className: `
    ${transitionClass('all')}
    ${focusRing()}
    ${hoverScale(scale.hoverSmall)}
    ${pressScale(scale.press)}
    hover:border-gray-400 dark:hover:border-gray-500
    transition-colors
  `,
});

/**
 * Composition for unit toggle buttons
 * - Hover scale (medium)
 * - Press scale (icon press)
 */
export const dimensionButtonMotion = () => ({
  className: `
    ${transitionClass('all')}
    ${hoverScale(scale.hoverMedium)}
    ${pressScale(scale.iconPress)}
  `,
});

/**
 * Composition for the DPI input
 */
export const dpiInputMotion = () => ({
  className: `
    ${transitionClass('all')}
    ${focusRing()}
    ${hoverScale(scale.hoverSmall)}
    ${pressScale(scale.press)}
    hover:border-gray-400 dark:hover:border-gray-500
    transition-colors
  `,
});