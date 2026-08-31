// src/tools/image/background-remove/add/useAdd.ts

import { useState, useCallback } from 'react';
import { writeDpi } from '@/entities/image/metadata/write';
import { loadImage, createCanvas, exportCanvas } from '@/lib/browser';

export type OutputFormat = 'png' | 'jpeg' | 'webp';

export function useAdd() {
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');

  const applyBackground = useCallback(
    async (cutoutBlob: Blob, format: OutputFormat): Promise<Blob> => {
      if (backgroundColor === null && format === 'png') {
        return new Blob([cutoutBlob], { type: 'image/png' });
      }

      const img = await loadImage(cutoutBlob);
      const width = img.width;
      const height = img.height;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = backgroundColor || '#ffffff';
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

      return await exportCanvas(canvas, mimeType, quality);
    },
    [backgroundColor]
  );

  const applyBackgroundWithMetadata = useCallback(
    async (
      cutoutBlob: Blob,
      dpi: number | undefined,
      format: OutputFormat
    ): Promise<Blob> => {
      let finalBlob = await applyBackground(cutoutBlob, format);

      if (dpi) {
        let ext = format === 'jpeg' ? 'jpg' : format;
        const tempFile = new File([finalBlob], `final.${ext}`, {
          type: finalBlob.type || 'image/png',
        });
        finalBlob = await writeDpi(tempFile, dpi);
      }

      return finalBlob;
    },
    [applyBackground]
  );

  return {
    backgroundColor,
    setBackgroundColor,
    outputFormat,
    setOutputFormat,
    applyBackground,
    applyBackgroundWithMetadata,
  };
}