// src/tools/image/image-filters/core/filters/contrast.ts
import { clamp } from '../utils/clamp';

export function applyContrast(data: Uint8ClampedArray, value: number): void {
  const factor = value / 100;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] - 128) * factor + 128, 0, 255);
    data[i + 1] = clamp((data[i + 1] - 128) * factor + 128, 0, 255);
    data[i + 2] = clamp((data[i + 2] - 128) * factor + 128, 0, 255);
  }
}