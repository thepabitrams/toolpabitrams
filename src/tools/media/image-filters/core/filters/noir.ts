// src/tools/image/image-filters/core/filters/noir.ts
import { applyGrayscale } from './grayscale';
import { applyContrast } from './contrast';

export function applyNoir(data: Uint8ClampedArray): void {
  applyGrayscale(data);
  applyContrast(data, 150);
}