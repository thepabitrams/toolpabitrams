// src/core/motion/presets/shimmer.ts

export const shimmer = {
  initial: { 
    transform: 'translateX(-100%)',
    opacity: 0.3,
  },
  animate: { 
    transform: 'translateX(100%)',
    opacity: 0.6,
  },
  transition: {
    duration: 2,
    ease: 'easeInOut',
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
};