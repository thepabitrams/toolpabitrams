// src/tools/image/image-filters/core/filters/vintage.ts
import { applySepia } from './sepia';
import { applyContrast } from './contrast';
import { applyVignette } from './vignette';

export function applyVintage(
  data: Uint8ClampedArray,
  width: number,
  height: number
): void {
  applySepia(data);
  applyContrast(data, 120);
  applyVignette(data, width, height);
}