// src/core/motion/compositions/searchMotion.ts
import { transitionClass, scale } from '../tokens';
import { hoverScale } from '../interactions/hover';
import { focusScale } from '../interactions/focus';
import { focusRing } from '../interactions/focus';
import { hoverShadow } from '../interactions/shadow';
import { focusShadow } from '../interactions/shadow';

export const searchMotion = () => ({
  className: `
    ${transitionClass()} 
    ${hoverScale(scale.hoverSmall)} 
    ${focusScale(scale.hoverSmall)}
    ${focusRing()}                    
    shadow-md                      
    dark:shadow-white/10           
    ${hoverShadow('lg')}            
    dark:hover:shadow-white/20      
    ${focusShadow('xl')}            
    dark:focus:shadow-white/20      
  `,
});