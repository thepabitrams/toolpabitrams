// core/motion/presets/slideUp.ts

export const slideUp = {
  name: 'slide-up',
  keyframes: `
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  `,
  duration: 300,
  easing: 'ease-out',
};