// src/tools/image/image-filters/core/filters/sharpen.ts
import { clamp } from '../utils/clamp';
import { convolution } from '../utils/convolution';

export function applySharpen(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number
): void {
  if (strength <= 0) return;

  const factor = strength / 100;
  const kernel = [
    0, -1 * factor, 0,
    -1 * factor, 1 + 4 * factor, -1 * factor,
    0, -1 * factor, 0
  ];

  convolution(data, width, height, kernel, 3);
}