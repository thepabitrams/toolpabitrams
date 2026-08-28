// src/entities/image/canvas/crop.ts
// ONLY function here, types imported

import { CropArea } from '../types/crop';

export async function cropCanvas(
  blob: Blob,
  cropArea: CropArea,
  rotation: number = 0
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        ctx.imageSmoothingEnabled = true;
        if ('imageSmoothingQuality' in ctx) {
          ctx.imageSmoothingQuality = 'high';
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);

        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          -canvas.width / 2,
          -canvas.height / 2,
          canvas.width,
          canvas.height
        );

        const mimeType = blob.type || 'image/jpeg';
        const quality = mimeType === 'image/jpeg' || mimeType === 'image/webp' ? 0.92 : undefined;

        canvas.toBlob(
          (croppedBlob) => {
            URL.revokeObjectURL(url);
            if (croppedBlob) resolve(croppedBlob);
            else reject(new Error("Canvas toBlob returned null"));
          },
          mimeType,
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}