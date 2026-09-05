// core/motion/tokens.ts

export const duration = 200;

export const easing = [0.4, 0, 0.2, 1];

export const scale = {
  press: 0.97,
  hoverSmall: 1.01,
  hoverMedium: 1.02,
  hoverLarge: 1.05,
  iconPress: 0.95,
  listPress: 0.98,
} as const;

export const transitionClass = (properties = 'all') =>
  `transition-${properties} duration-${duration} ease-[cubic-bezier(${easing.join(',')})]`;

export const animationClass = (name: string, duration: number, easing: string) =>
  `animate-[${name}_${duration}ms_${easing}]`;