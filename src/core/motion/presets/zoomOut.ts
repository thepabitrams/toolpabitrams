// core/motion/presets/zoomOut.ts

export const zoomOut = {
  name: 'zoom-out',
  keyframes: `
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.5); opacity: 0; }
  `,
  duration: 250,
  easing: 'ease-in',
};