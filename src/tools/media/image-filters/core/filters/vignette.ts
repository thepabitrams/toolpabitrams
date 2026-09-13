// src/tools/image/image-filters/core/filters/vignette.ts
import { clamp } from '../utils/clamp';

export function applyVignette(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = 1 - (dist / maxDist) * 0.8;
      pixels[idx] = clamp(pixels[idx] * factor, 0, 255);
      pixels[idx + 1] = clamp(pixels[idx + 1] * factor, 0, 255);
      pixels[idx + 2] = clamp(pixels[idx + 2] * factor, 0, 255);
    }
  }
}