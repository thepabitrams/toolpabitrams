// src/tools/image/background-remove/add/useAdd.ts

import { useState, useCallback } from 'react';
import { injectImageMetadata } from '@/entities/image/services/writeMetadata';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

export function useAdd() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');

  const getImageMetadata = useCallback((img: HTMLImageElement) => {
    let dpi = 96;
    let width = img.width;
    let height = img.height;

    if (img.naturalWidth) width = img.naturalWidth;
    if (img.naturalHeight) height = img.naturalHeight;

    return { dpi, width, height };
  }, []);

  const applyBackground = useCallback(
    async (cutoutBlob: Blob, color: string, format: OutputFormat): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(cutoutBlob);

        img.onload = () => {
          URL.revokeObjectURL(url);

          const width = img.width;
          const height = img.height;

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;

          ctx.fillStyle = color;
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let mimeType = 'image/png';
          let quality: number | undefined = undefined;
          if (format === 'jpeg') {
            mimeType = 'image/jpeg';
            quality = 0.95;
          } else if (format === 'webp') {
            mimeType = 'image/webp';
            quality = 0.95;
          } else {
            mimeType = 'image/png';
          }

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to export image'));
          }, mimeType, quality);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load cutout image'));
        };

        img.src = url;
      });
    },
    []
  );

  const applyBackgroundWithMetadata = useCallback(
    async (
      cutoutBlob: Blob,
      color: string,
      dpi: number | undefined,
      format: OutputFormat
    ): Promise<Blob> => {
      let finalBlob = await applyBackground(cutoutBlob, color, format);

      if (dpi) {
        let ext = 'png';
        if (format === 'jpeg') ext = 'jpg';
        else if (format === 'webp') ext = 'webp';
        else ext = 'png';

        const tempFile = new File([finalBlob], `final.${ext}`, {
          type: finalBlob.type,
        });
        finalBlob = await injectImageMetadata(tempFile, dpi);
      }

      return finalBlob;
    },
    [applyBackground]
  );

  const generatePreview = useCallback(
    async (cutoutBlob: Blob, color: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(cutoutBlob);

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;

          ctx.fillStyle = color;
          ctx.fillRect(0, 0, img.width, img.height);
          ctx.drawImage(img, 0, 0, img.width, img.height);

          canvas.toBlob((blob) => {
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              resolve(previewUrl);
            } else {
              reject(new Error('Failed to generate preview'));
            }
          }, 'image/png');

          URL.revokeObjectURL(url);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load cutout image'));
        };

        img.src = url;
      });
    },
    []
  );

  return {
    backgroundColor,
    setBackgroundColor,
    outputFormat,
    setOutputFormat,
    getImageMetadata,
    applyBackground,
    applyBackgroundWithMetadata,
    generatePreview,
  };
}