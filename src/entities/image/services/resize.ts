// src/entities/image/services/resize.ts

/**
 * Resizes an image Blob to exact target pixel dimensions.
 * Uses Canvas built-in high-quality interpolation.
 * 
 * @param blob - The source image blob (e.g., cropped 850x340)
 * @param targetWidth - Desired output width in pixels (e.g., 150)
 * @param targetHeight - Desired output height in pixels (e.g., 60)
 * @returns Promise<Blob> - The resized image blob
 */
export async function resizeImage(
  blob: Blob,
  targetWidth: number,
  targetHeight: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        canvas.width = Math.round(targetWidth);
        canvas.height = Math.round(targetHeight);

        ctx.imageSmoothingEnabled = true;
        if ('imageSmoothingQuality' in ctx) {
          ctx.imageSmoothingQuality = 'high';
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mimeType = blob.type || 'image/jpeg';
        const quality = mimeType === 'image/jpeg' || mimeType === 'image/webp' ? 0.92 : undefined;

        canvas.toBlob(
          (resizedBlob) => {
            URL.revokeObjectURL(url);
            if (resizedBlob) {
              resolve(resizedBlob);
            } else {
              reject(new Error('Canvas toBlob returned null during resize'));
            }
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
      reject(new Error('Failed to load image for resize'));
    };

    img.src = url;
  });
}