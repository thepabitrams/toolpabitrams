// src/core/motion/interactions/focus.ts
import { scale } from '../tokens';

export const focusRing = () =>
  'outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

export const focusScale = (factor: number = scale.hoverSmall) =>
  `focus-visible:scale-[${factor}]`;