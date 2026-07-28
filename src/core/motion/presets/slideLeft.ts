// core/motion/presets/slideLeft.ts

export const slideLeft = {
  name: 'slide-left',
  keyframes: `
    0% { transform: translateX(20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  `,
  duration: 300,
  easing: 'ease-out',
};