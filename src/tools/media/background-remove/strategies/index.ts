// src/tools/image/background-remove/strategies/index.ts

export type { ModelStrategy } from './base.strategy';

// ─── Import all strategies ──────────────────────────────────
import { birefnetStrategy } from './birefnet.strategy';
import { isnetStrategy } from './isnet.strategy';
import { modnetStrategy } from './modnet.strategy';
import { ormbgStrategy } from './ormbg.strategy';
import { mvanetStrategy } from './mvanet.strategy';
// ❌ U²-Netp REMOVED — 401 Unauthorized, not worth the hassle

// ─── Export individual strategies ──────────────────────────
export { birefnetStrategy } from './birefnet.strategy';
export { isnetStrategy } from './isnet.strategy';
export { modnetStrategy } from './modnet.strategy';
export { ormbgStrategy } from './ormbg.strategy';
export { mvanetStrategy } from './mvanet.strategy';

// ─── Registry ──────────────────────────────────────────────
export const strategies = {
  birefnet: birefnetStrategy,
  isnet: isnetStrategy,
  modnet: modnetStrategy,
  ormbg: ormbgStrategy,
  mvanet: mvanetStrategy,
};

// ─── List for dropdown ──────────────────────────────────────
export const strategyList = Object.values(strategies);