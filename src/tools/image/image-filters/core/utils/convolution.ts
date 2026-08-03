// src/tools/image/image-filters/core/utils/convolution.ts
import { clamp } from './clamp';

export function convolution(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[],
  kernelSize: number
): void {
  const half = Math.floor(kernelSize / 2);
  const tempData = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const px = clamp(x + kx, 0, width - 1);
          const py = clamp(y + ky, 0, height - 1);
          const idx = (py * width + px) * 4;
          const k = kernel[(ky + half) * kernelSize + (kx + half)];
          r += tempData[idx] * k;
          g += tempData[idx + 1] * k;
          b += tempData[idx + 2] * k;
        }
      }
      const idx = (y * width + x) * 4;
      data[idx] = clamp(r, 0, 255);
      data[idx + 1] = clamp(g, 0, 255);
      data[idx + 2] = clamp(b, 0, 255);
    }
  }
}