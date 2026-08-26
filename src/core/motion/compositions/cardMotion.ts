// src/core/motion/compositions/cardMotion.ts
import { transitionClass } from '../tokens';

export const cardMotion = () => ({
  className: `
    ${transitionClass('shadow')} 
    shadow-md 
    hover:shadow-xl 
    dark:shadow-white/10 
    dark:hover:shadow-white/20
  `,
});