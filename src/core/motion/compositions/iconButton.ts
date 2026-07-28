// core/motion/compositions/iconButton.ts
import { transitionClass, scale } from '../tokens';
import { hoverScale } from '../interactions/hover';
import { pressScale } from '../interactions/press';

export const iconButtonMotion = () => ({
  className: `${transitionClass()} ${hoverScale(scale.hoverLarge)} ${pressScale(scale.iconPress)}`,
});