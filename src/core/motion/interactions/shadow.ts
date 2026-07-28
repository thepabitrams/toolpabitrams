// core/motion/interactions/shadow.ts

/**
 * Makes the element lift on hover (cards, buttons, containers)
 * @param size - 'sm' | 'md' | 'lg' | 'xl' | '2xl' (default: 'lg')
 * @returns Tailwind hover shadow class
 */
export const hoverShadow = (size: string = 'xl') => `hover:shadow-${size}`;
;

/**
 * Makes the element glow on focus (inputs, search bars, textareas)
 * @param size - 'sm' | 'md' | 'lg' | 'xl' | '2xl' (default: 'md')
 * @returns Tailwind focus shadow class
 */
export const focusShadow = (size: string = 'md') => {
  return `focus:shadow-${size}`;
};