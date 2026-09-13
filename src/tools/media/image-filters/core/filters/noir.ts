// src/tools/image/image-filters/core/filters/noir.ts
import { applyGrayscale } from './grayscale';
import { applyContrast } from './contrast';

export function applyNoir(pixels: Uint8ClampedArray): void {
  applyGrayscale(pixels);
  applyContrast(pixels, 150);
}