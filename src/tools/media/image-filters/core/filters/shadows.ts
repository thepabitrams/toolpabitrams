// src/tools/image/image-filters/core/filters/shadows.ts
import { clamp } from '../utils/clamp';

export function applyShadows(pixels: Uint8ClampedArray, value: number): void {
  const factor = (value / 100) * 50;
  for (let i = 0; i < pixels.length; i += 4) {
    const brightness = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    if (brightness < 100) {
      pixels[i] = clamp(pixels[i] + factor, 0, 255);
      pixels[i + 1] = clamp(pixels[i + 1] + factor, 0, 255);
      pixels[i + 2] = clamp(pixels[i + 2] + factor, 0, 255);
    }
  }
}