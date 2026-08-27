// src/tools/image/adjust-size/compression/qualityOptimizer.ts
export async function optimizeQuality(
  canvas: HTMLCanvasElement,
  format: string,
  targetKB: number,
  startQuality: number = 0.8
): Promise<Blob> {
  const targetBytes = targetKB * 1024;
  let quality = startQuality;
  let bestBlob: Blob | null = null;
  let bestSize = Infinity;

  while (quality >= 0.05) {
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), format, quality);
    });

    if (blob.size <= targetBytes) {
      if (blob.size < bestSize) {
        bestBlob = blob;
        bestSize = blob.size;
      }
      break;
    }

    if (blob.size < bestSize) {
      bestBlob = blob;
      bestSize = blob.size;
    }

    quality -= 0.05;
  }

  return bestBlob || (await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), format, 0.0)));
}