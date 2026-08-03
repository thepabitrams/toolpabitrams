// src/tools/image/image-filters/core/filters/blur.ts
import { clamp } from '../utils/clamp';

/**
 * FAST SEPARABLE GAUSSIAN BLUR
 * 
 * 1. Horizontal blur pass
 * 2. Vertical blur pass
 * 
 * Same result as 2D convolution, 10x faster.
 * Kernel size is capped for performance.
 */
export function applyBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): void {
  if (radius <= 0) return;

  // ─── BOOST RADIUS (for strong blur) ──────────────────
  const STRONG_BLUR_BOOST = 3.0;
  const boostedRadius = radius * STRONG_BLUR_BOOST;

  // ─── KERNEL SIZE (capped for performance) ────────────
  // Max kernel size = 31px (blur radius ~10px)
  // This is enough for most use cases
  const rawSize = Math.ceil(boostedRadius * 2) * 2 + 1;
  const kernelSize = Math.min(rawSize, 31); // Cap at 31
  const half = Math.floor(kernelSize / 2);

  // Generate 1D Gaussian kernel
  const sigma = boostedRadius * 0.4;
  const kernel = generate1DGaussianKernel(kernelSize, sigma);

  // ─── SEPARABLE BLUR ──────────────────────────────────
  // Pass 1: Horizontal blur
  const tempData = new Uint8ClampedArray(data);
  applyHorizontalBlur(tempData, data, width, height, kernel, half);

  // Pass 2: Vertical blur (using the horizontally blurred data)
  const tempData2 = new Uint8ClampedArray(data);
  applyVerticalBlur(tempData2, data, width, height, kernel, half);
}

/**
 * Generate 1D Gaussian kernel
 */
function generate1DGaussianKernel(size: number, sigma: number): number[] {
  const kernel: number[] = [];
  const half = Math.floor(size / 2);
  let sum = 0;

  for (let i = -half; i <= half; i++) {
    const value = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(value);
    sum += value;
  }

  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}

/**
 * Horizontal blur pass
 */
function applyHorizontalBlur(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[],
  half: number
): void {
  const kernelLen = kernel.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      let weightSum = 0;

      for (let kx = 0; kx < kernelLen; kx++) {
        const px = clamp(x + kx - half, 0, width - 1);
        const idx = (y * width + px) * 4;
        const k = kernel[kx];

        r += src[idx] * k;
        g += src[idx + 1] * k;
        b += src[idx + 2] * k;
        a += src[idx + 3] * k;
        weightSum += k;
      }

      const idx = (y * width + x) * 4;
      if (weightSum > 0) {
        dst[idx] = clamp(Math.round(r / weightSum), 0, 255);
        dst[idx + 1] = clamp(Math.round(g / weightSum), 0, 255);
        dst[idx + 2] = clamp(Math.round(b / weightSum), 0, 255);
        dst[idx + 3] = clamp(Math.round(a / weightSum), 0, 255);
      } else {
        dst[idx] = src[idx];
        dst[idx + 1] = src[idx + 1];
        dst[idx + 2] = src[idx + 2];
        dst[idx + 3] = src[idx + 3];
      }
    }
  }
}

/**
 * Vertical blur pass
 */
function applyVerticalBlur(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[],
  half: number
): void {
  const kernelLen = kernel.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      let weightSum = 0;

      for (let ky = 0; ky < kernelLen; ky++) {
        const py = clamp(y + ky - half, 0, height - 1);
        const idx = (py * width + x) * 4;
        const k = kernel[ky];

        r += src[idx] * k;
        g += src[idx + 1] * k;
        b += src[idx + 2] * k;
        a += src[idx + 3] * k;
        weightSum += k;
      }

      const idx = (y * width + x) * 4;
      if (weightSum > 0) {
        dst[idx] = clamp(Math.round(r / weightSum), 0, 255);
        dst[idx + 1] = clamp(Math.round(g / weightSum), 0, 255);
        dst[idx + 2] = clamp(Math.round(b / weightSum), 0, 255);
        dst[idx + 3] = clamp(Math.round(a / weightSum), 0, 255);
      } else {
        dst[idx] = src[idx];
        dst[idx + 1] = src[idx + 1];
        dst[idx + 2] = src[idx + 2];
        dst[idx + 3] = src[idx + 3];
      }
    }
  }
}