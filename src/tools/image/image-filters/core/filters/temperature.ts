// src/tools/image/image-filters/core/filters/temperature.ts
import { clamp } from '../utils/clamp';

export function applyTemperature(data: Uint8ClampedArray, value: number): void {
  const factor = (value / 100) * 30;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + factor, 0, 255);
    data[i + 2] = clamp(data[i + 2] - factor, 0, 255);
  }
}