// core/motion/presets/slideRight.ts

export const slideRight = {
  name: 'slide-right',
  keyframes: `
    0% { transform: translateX(-20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  `,
  duration: 300,
  easing: 'ease-out',
};