// core/motion/presets/spring.ts

export const spring = {
  name: 'spring',
  keyframes: `
    0% { transform: scale(0.8); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `,
  duration: 500,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};