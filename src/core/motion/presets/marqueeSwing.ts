// core/motion/presets/marqueeSwing.ts
export const marqueeSwing = {
  name: 'marquee-swing', // 👈 USE DASHES
  keyframes: `
    0% {
      transform: translateX(0);
    }
    40% {
      transform: translateX(-30px);
    }
    60% {
      transform: translateX(-30px);
    }
    100% {
      transform: translateX(0);
    }
  `,
  duration: 4000,
  easing: 'ease-in-out',
};