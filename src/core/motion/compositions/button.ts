// core/motion/compositions/button.ts
import { transitionClass } from '../tokens';
import { pressScale } from '../interactions/press';
import { focusRing } from '../interactions/focus';

export const buttonMotion = () => ({
  className: `${transitionClass()} ${pressScale()} ${focusRing()}`,
});