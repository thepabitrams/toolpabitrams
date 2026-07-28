// core/motion/interactions/press.ts

import { scale } from '../tokens';

export const pressScale = (factor: number = scale.press) =>
  `active:scale-[${factor}]`;