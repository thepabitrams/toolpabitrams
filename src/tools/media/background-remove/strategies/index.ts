// src/tools/image/background-remove/strategies/index.ts

export type { ModelStrategy } from './base';

import { birefnet } from './birefnet';
import { isnet } from './isnet';
import { modnet } from './modnet';
import { ormbg } from './ormbg';
import { mvanet } from './mvanet';

export {
  birefnet,
  isnet,
  modnet,
  ormbg,
  mvanet,
};

export const strategies = {
  birefnet: birefnet,
  isnet: isnet,
  modnet: modnet,
  ormbg: ormbg,
  mvanet: mvanet,
};

export const strategyList = Object.values(strategies);