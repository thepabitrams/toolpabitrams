// core/motion/interactions/shadow.ts

export const hoverShadow = (size: string = 'xl') => `hover:shadow-${size}`;
;

export const focusShadow = (size: string = 'md') => {
  return `focus:shadow-${size}`;
};