// src/tools/image/image-filters/core/filters/hdr.ts
import { applyContrast } from './contrast';
import { applySaturation } from './saturation';

export function applyHDR(data: Uint8ClampedArray): void {
  applyContrast(data, 130);
  applySaturation(data, 120);
}