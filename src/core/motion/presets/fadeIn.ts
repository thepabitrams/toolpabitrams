// core/motion/presets/fadeIn.ts

export const fadeIn = {
  name: 'fade-in',
  keyframes: `
    0% { opacity: 0; }
    100% { opacity: 1; }
  `,
  duration: 200,
  easing: 'ease-in-out',
};