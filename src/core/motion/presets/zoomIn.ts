// core/motion/presets/zoomIn.ts

export const zoomIn = {
  name: 'zoom-in',
  keyframes: `
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  `,
  duration: 250,
  easing: 'ease-out',
};