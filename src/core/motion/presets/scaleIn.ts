// core/motion/presets/scaleIn.ts

export const scaleIn = {
  name: 'scale-in',
  keyframes: `
    0% { transform: scale(0.9); }
    100% { transform: scale(1); }
  `,
  duration: 200,
  easing: 'ease-out',
};