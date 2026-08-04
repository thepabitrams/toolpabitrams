// src/tools/image/background-remove/hooks/useBRAdd.ts

import { useState, useCallback } from 'react';
import { injectImageMetadata } from '@/entities/image/services/writeMetadata';

// ✅ NEW: Supported export formats
export type OutputFormat = 'png' | 'jpeg' | 'webp';

export function useBRAdd() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png'); // ✅ NEW

  // ─── Get image metadata (DPI, dimensions) ──────────────────
  const getImageMetadata = useCallback((img: HTMLImageElement) => {
    let dpi = 96;
    let width = img.width;
    let height = img.height;

    if (img.naturalWidth) width = img.naturalWidth;
    if (img.naturalHeight) height = img.naturalHeight;

    return { dpi, width, height };
  }, []);

  // ─── Apply Background Color ──────────────────────────
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

          // 1. Fill with color
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, width, height);

          // 2. Draw cutout on top
          ctx.drawImage(img, 0, 0, width, height);

          // Determine MIME type and quality
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

  // ─── Apply Background + Inject Metadata ──────────────────
  const applyBackgroundWithMetadata = useCallback(
    async (
      cutoutBlob: Blob,
      color: string,
      dpi: number | undefined,
      format: OutputFormat // ✅ NEW: pass format
    ): Promise<Blob> => {
      // 1. Apply background with selected format
      let finalBlob = await applyBackground(cutoutBlob, color, format);

      // 2. Inject DPI metadata if provided
      if (dpi) {
        // Determine extension
        let ext = 'png';
        if (format === 'jpeg') ext = 'jpg';
        else if (format === 'webp') ext = 'webp';
        else ext = 'png';

        // Create File with correct extension and MIME
        const tempFile = new File([finalBlob], `final.${ext}`, {
          type: finalBlob.type,
        });
        finalBlob = await injectImageMetadata(tempFile, dpi);
      }

      return finalBlob;
    },
    [applyBackground]
  );

  // ─── Generate Live Preview ──────────────────────────────
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
    outputFormat,        // ✅ NEW
    setOutputFormat,     // ✅ NEW
    getImageMetadata,
    applyBackground,
    applyBackgroundWithMetadata,
    generatePreview,
  };
}