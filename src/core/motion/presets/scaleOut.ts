// core/motion/presets/scaleOut.ts

export const scaleOut = {
  name: 'scale-out',
  keyframes: `
    0% { transform: scale(1); }
    100% { transform: scale(0.9); }
  `,
  duration: 200,
  easing: 'ease-in',
};