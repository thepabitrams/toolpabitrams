// src/tools/image/image-filters/core/utils/exportCanvas.ts
export function exportCanvas(
  canvas: HTMLCanvasElement,
  format: string = 'image/jpeg',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      },
      format,
      quality
    );
  });
}