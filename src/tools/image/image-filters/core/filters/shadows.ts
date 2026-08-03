// src/tools/image/image-filters/core/filters/shadows.ts
import { clamp } from '../utils/clamp';

export function applyShadows(data: Uint8ClampedArray, value: number): void {
  const factor = (value / 100) * 50;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (brightness < 100) {
      data[i] = clamp(data[i] + factor, 0, 255);
      data[i + 1] = clamp(data[i + 1] + factor, 0, 255);
      data[i + 2] = clamp(data[i + 2] + factor, 0, 255);
    }
  }
}