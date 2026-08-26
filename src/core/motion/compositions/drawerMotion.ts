// core/motion/compositions/drawer.ts
import { transitionClass } from '../tokens';

export const drawerMotion = () => ({
  className: `
    fixed top-[60px] left-0 w-72 h-[calc(100vh-60px)] z-40 overflow-y-auto
    bg-white/90 dark:bg-gray-950/90 backdrop-blur-md 
    border-r border-gray-200/50 dark:border-gray-800/50
    ${transitionClass()}
    
    /* 🔥 SAME SHADOW PATTERN AS CARD, SEARCH & TOOLCARD */
    shadow-lg                    // 👈 Light mode: deep shadow
    dark:shadow-white/10         // 👈 Dark mode: white glow (subtle)
  `,
});