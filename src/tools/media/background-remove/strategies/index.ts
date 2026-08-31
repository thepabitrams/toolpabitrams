// src/tools/image/background-remove/strategies/index.ts

export type { ModelStrategy } from './base';

import { birefnetStrategy } from './birefnet';
import { isnetStrategy } from './isnet';
import { modnetStrategy } from './modnet';
import { ormbgStrategy } from './ormbg';
import { mvanetStrategy } from './mvanet';

export {
  birefnetStrategy,
  isnetStrategy,
  modnetStrategy,
  ormbgStrategy,
  mvanetStrategy,
};

export const strategies = {
  birefnet: birefnetStrategy,
  isnet: isnetStrategy,
  modnet: modnetStrategy,
  ormbg: ormbgStrategy,
  mvanet: mvanetStrategy,
};

export const strategyList = Object.values(strategies);