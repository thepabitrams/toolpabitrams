// src/tools/image/image-filters/core/filters/sepia.ts
import { clamp } from '../utils/clamp';

export function applySepia(pixels: Uint8ClampedArray): void {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    pixels[i] = clamp(r * 0.393 + g * 0.769 + b * 0.189, 0, 255);
    pixels[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168, 0, 255);
    pixels[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131, 0, 255);
  }
}