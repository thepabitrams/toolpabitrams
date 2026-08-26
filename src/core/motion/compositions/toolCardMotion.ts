// core/motion/compositions/toolCardMotion.ts
import { transitionClass, scale } from '../tokens';
import { hoverScale } from '../interactions/hover';
import { pressScale } from '../interactions/press';

export const toolCardGridMotion = () => ({
  className: `
    ${transitionClass()} 
    ${hoverScale(scale.hoverMedium)} 
    ${pressScale(scale.press)}
    
    /* 🔥 SAME SHADOW PATTERN AS CARD & SEARCH */
    shadow-md 
    dark:shadow-white/10 
    hover:shadow-xl 
    dark:hover:shadow-white/20
  `,
});

export const toolCardListMotion = () => ({
  className: `
    ${transitionClass()} 
    ${pressScale(scale.listPress)}
    hover:bg-gray-100 dark:hover:bg-gray-800
  `,
});