// src/tools/image/image-filters/core/filters/saturation.ts
import { clamp } from '../utils/clamp';

export function applySaturation(data: Uint8ClampedArray, value: number): void {
  const factor = value / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = clamp(gray + (r - gray) * factor, 0, 255);
    data[i + 1] = clamp(gray + (g - gray) * factor, 0, 255);
    data[i + 2] = clamp(gray + (b - gray) * factor, 0, 255);
  }
}