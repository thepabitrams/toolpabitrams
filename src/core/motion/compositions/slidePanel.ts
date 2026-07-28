// core/motion/compositions/slidePanel.ts

import { transitionClass } from '../tokens';

/**
 * Slide Panel Composition
 * Used for sliding panels that stay between header and footer
 * - Slides up from bottom on open
 * - Slides down on close
 */
export const slidePanelMotion = () => ({
  className: `
    ${transitionClass('all')}
    transform-gpu
    will-change-transform
  `,
});

/**
 * Slide panel overlay (backdrop)
 */
export const slidePanelOverlayMotion = () => ({
  className: `
    fixed inset-0 z-40
    transition-opacity duration-300 ease-out
  `,
});

/**
 * Slide panel wrapper (positions it below header)
 */
export const slidePanelWrapperMotion = () => ({
  className: `
    fixed left-0 right-0 z-40
    flex justify-center
    pointer-events-none
  `,
});