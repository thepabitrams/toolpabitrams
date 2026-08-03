// src/tools/image/background-remove/hooks/useBRAdd.ts

import { useState, useCallback } from 'react';

export function useBRAdd() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // ─── Get image metadata (DPI, dimensions) ──────────────────
  const getImageMetadata = useCallback((img: HTMLImageElement) => {
    // Try to read EXIF/DPI from the image
    // Default to 96 DPI if not available
    let dpi = 96;
    let width = img.width;
    let height = img.height;

    // Check for natural dimensions
    if (img.naturalWidth) width = img.naturalWidth;
    if (img.naturalHeight) height = img.naturalHeight;

    return { dpi, width, height };
  }, []);

  // ─── Apply Background Color (preserves dimensions) ──────────
  const applyBackground = useCallback(
    (originalFile: File, maskData: ImageData, color: string): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(originalFile);

        img.onload = () => {
          URL.revokeObjectURL(url);

          // ─── Preserve original dimensions ──────────────────
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;

          // Fill background with solid color
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, width, height);

          // Draw original image (object) on top
          ctx.drawImage(img, 0, 0, width, height);

          // ─── Apply mask as alpha channel ──────────────────
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          const maskBuffer = maskData.data;

          for (let i = 0; i < data.length; i += 4) {
            const alpha = maskBuffer[i + 3] / 255;
            data[i] = data[i] * alpha;
            data[i + 1] = data[i + 1] * alpha;
            data[i + 2] = data[i + 2] * alpha;
            data[i + 3] = Math.max(data[i + 3], maskBuffer[i + 3]);
          }

          ctx.putImageData(imageData, 0, 0);

          // ─── Export with original quality ──────────────────
          // Use PNG for transparency preservation
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas export failed'));
          }, 'image/png');
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };

        img.src = url;
      });
    },
    []
  );

  // ─── Export Image ─────────────────────────────────────────────
  const exportImage = useCallback(
    async (originalFile: File, maskData: ImageData, color: string): Promise<Blob> => {
      return await applyBackground(originalFile, maskData, color);
    },
    [applyBackground]
  );

  return {
    backgroundColor,
    setBackgroundColor,
    applyBackground,
    exportImage,
  };
}