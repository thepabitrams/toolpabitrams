// src/tools/image/adjust-size/useAdjustSize.ts

import { useState, useCallback } from 'react';
import { readDimensions, readDpi, writeDpi } from '@/entities/image/metadata';
import { detectFormatAndAlpha } from '@/entities/image';
import { binarySearchCompress, padding } from './strategies';
import { compressProgressive } from './compression';

export interface ProcessResult {
  blob: Blob;
  sizeKB: number;
  minKB: number;
  maxKB: number;
  isWithinRange: boolean;
  smallestPossible: number;
  error?: string;
  outputFormat: string;
}

export function useAdjustSize() {
  const [isProcessing, setIsProcessing] = useState(false);

  const process = useCallback(
    async (file: File, minKB: number, maxKB: number, onProgress?: (data: any) => void) => {
      setIsProcessing(true);
      try {
        const [dims, dpiResult] = await Promise.all([
          readDimensions(file),
          readDpi(file),
        ]);
        const dpi = dpiResult.dpi || 300;

        const originalSizeKB = file.size / 1024;
        const midpointKB = (minKB + maxKB) / 2;

        const { format: originalFormat, hasAlpha } = await detectFormatAndAlpha(file);
        const isLossyFormat = ['image/jpeg', 'image/webp', 'image/avif'].includes(originalFormat);

        let resultBlob: Blob = file;

        if (originalSizeKB < minKB) {
          resultBlob = await padding(file, midpointKB);
        } else if (originalSizeKB > maxKB) {
          let compressed: Blob = file;

          if (isLossyFormat) {
            compressed = await binarySearchCompress(file, maxKB, originalFormat, (data) => {
              onProgress?.({ ...data, type: 'compress', strategy: 'binarySearch' });
            });
          }

          if (compressed.size / 1024 > maxKB) {
            compressed = await compressProgressive(
              compressed,
              maxKB,
              originalFormat,
              hasAlpha,
              isLossyFormat,
              onProgress
            );
          }

          if (compressed.size / 1024 < minKB) {
            compressed = await padding(compressed, midpointKB);
          }

          resultBlob = compressed;
        }

        // ─── FIX: Write DPI for ALL formats ────────────────
        const finalFormat = resultBlob.type || originalFormat;
        const ext = finalFormat.split('/')[1] || 'png';
        const finalFile = new File([resultBlob], `output.${ext}`, { type: finalFormat });
        const finalBlob = await writeDpi(finalFile, dpi);

        const finalSizeKB = finalBlob.size / 1024;

        return {
          blob: finalBlob,
          sizeKB: finalSizeKB,
          minKB,
          maxKB,
          isWithinRange: finalSizeKB >= minKB && finalSizeKB <= maxKB,
          smallestPossible: finalSizeKB,
          error: finalSizeKB > maxKB ? `Cannot compress below ${maxKB}KB. Smallest: ${finalSizeKB.toFixed(1)}KB.` : undefined,
          outputFormat: originalFormat,
        };
      } catch (err) {
        return {
          blob: file,
          sizeKB: file.size / 1024,
          minKB,
          maxKB,
          isWithinRange: false,
          smallestPossible: file.size / 1024,
          error: err instanceof Error ? err.message : String(err),
          outputFormat: 'image/png',
        };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return { process, isProcessing };
}