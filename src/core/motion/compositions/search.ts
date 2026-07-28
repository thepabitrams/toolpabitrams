// core/motion/compositions/search.ts
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
    
    /* 🔥 SPRING PRESS EFFECT - On the container! */
    active:scale-[0.98]
    active:duration-150
    active:ease-[cubic-bezier(0.34,1.56,0.64,1)]
    
    /* 🔥 DEFAULT SHADOW (like Card) */
    shadow-md                      
    dark:shadow-white/10           
    
    /* 🔥 HOVER SHADOW */
    ${hoverShadow('lg')}            
    dark:hover:shadow-white/20      
    
    /* 🔥 FOCUS SHADOW */
    ${focusShadow('xl')}            
    dark:focus:shadow-white/20      
  `,
});