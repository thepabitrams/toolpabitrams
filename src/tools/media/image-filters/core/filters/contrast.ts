// src/tools/image/image-filters/core/filters/contrast.ts
import { clamp } from '../utils/clamp';

export function applyContrast(pixels: Uint8ClampedArray, value: number): void {
  const factor = value / 100;
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = clamp((pixels[i] - 128) * factor + 128, 0, 255);
    pixels[i + 1] = clamp((pixels[i + 1] - 128) * factor + 128, 0, 255);
    pixels[i + 2] = clamp((pixels[i + 2] - 128) * factor + 128, 0, 255);
  }
}