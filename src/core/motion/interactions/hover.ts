// core/motion/interactions/hover.ts

import { scale } from '../tokens';

export const hoverScale = (factor: number = scale.hoverMedium) =>
  `hover:scale-[${factor}]`;