// src/tools/image/image-filters/core/filters/saturation.ts
import { clamp } from '../utils/clamp';

export function applySaturation(pixels: Uint8ClampedArray, value: number): void {
  const factor = value / 100;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    pixels[i] = clamp(gray + (r - gray) * factor, 0, 255);
    pixels[i + 1] = clamp(gray + (g - gray) * factor, 0, 255);
    pixels[i + 2] = clamp(gray + (b - gray) * factor, 0, 255);
  }
}