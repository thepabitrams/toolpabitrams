// core/motion/presets/fadeOut.ts

export const fadeOut = {
  name: 'fade-out',
  keyframes: `
    0% { opacity: 1; }
    100% { opacity: 0; }
  `,
  duration: 200,
  easing: 'ease-in-out',
};