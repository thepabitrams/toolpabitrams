// src/tools/image/image-filters/core/filters/vintage.ts
import { applySepia } from './sepia';
import { applyContrast } from './contrast';
import { applyVignette } from './vignette';

export function applyVintage(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): void {
  applySepia(pixels);
  applyContrast(pixels, 120);
  applyVignette(pixels, width, height);
}