// src/tools/image/image-filters/core/filters/hdr.ts
import { applyContrast } from './contrast';
import { applySaturation } from './saturation';

export function applyHDR(pixels: Uint8ClampedArray): void {
  applyContrast(pixels, 130);
  applySaturation(pixels, 120);
}