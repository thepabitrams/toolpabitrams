// src/tools/image/adjust-size/strategies/binarySearch.ts

import { loadImage } from '@/lib/browser'; // 👈 ADDED IMPORT

export async function binarySearchCompress(
  file: File,
  targetKB: number,
  format: string,
  onStep?: (data: { quality: number; sizeKB: number; iteration: number }) => void
): Promise<Blob> {
  const targetBytes = targetKB * 1024;
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  let low = 0.05;
  let high = 0.95;
  let bestBlob: Blob | null = null;
  let bestSize = Infinity;
  const iterations = 10;

  for (let i = 0; i < iterations; i++) {
    const mid = (low + high) / 2;
    const blob = await encodeCanvas(canvas, mid, format);
    const size = blob.size;

    if (onStep) {
      onStep({ quality: mid * 100, sizeKB: size / 1024, iteration: i + 1 });
    }

    if (size <= targetBytes) {
      if (size < bestSize) {
        bestBlob = blob;
        bestSize = size;
      }
      low = mid;
    } else {
      high = mid;
    }
  }

  if (!bestBlob) {
    bestBlob = await encodeCanvas(canvas, 0.05, format);
  }

  return bestBlob;
}

// ❌ DELETED local loadImage function

function encodeCanvas(canvas: HTMLCanvasElement, quality: number, format: string): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), format, quality);
  });
}