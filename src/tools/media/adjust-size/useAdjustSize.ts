// src/tools/image/adjust-size/useAdjustSize.ts
import { useState, useCallback } from 'react';
import { extractImageMetadata } from '@/entities/image/services/readMetadata';
import { injectDPI } from './utils/dpi';
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
        const metadata = await extractImageMetadata(file);
        const dpi = metadata.dpi || 300;
        const originalSizeKB = file.size / 1024;
        const midpointKB = (minKB + maxKB) / 2;

        const { detectedFormat, hasAlpha } = await detectFormatAndAlpha(file);
        const originalFormat = detectedFormat || 'image/png';
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

        const finalFormat = resultBlob.type || originalFormat;
        let finalBlob: Blob;

        if (finalFormat === 'image/jpeg' || finalFormat === 'image/jpg') {
          const finalFile = new File([resultBlob], 'output.jpg', { type: finalFormat });
          finalBlob = await injectDPI(finalFile, dpi, finalFormat);
        } else {
          finalBlob = resultBlob;
        }

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

async function detectFormatAndAlpha(file: File): Promise<{ detectedFormat: string; hasAlpha: boolean }> {
  if (file.type && file.type !== '') {
    const hasAlpha = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif';
    return { detectedFormat: file.type, hasAlpha };
  }

  try {
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
      .toUpperCase();

    if (hex.startsWith('FF D8 FF')) {
      return { detectedFormat: 'image/jpeg', hasAlpha: false };
    }
    if (hex.startsWith('89 50 4E 47')) {
      return { detectedFormat: 'image/png', hasAlpha: true };
    }
    if (hex.startsWith('47 49 46 38')) {
      return { detectedFormat: 'image/gif', hasAlpha: true };
    }
    if (hex.startsWith('52 49 46 46')) {
      return { detectedFormat: 'image/webp', hasAlpha: true };
    }
    if (hex.includes('66 74 79 70 61 76 69 66')) {
      return { detectedFormat: 'image/avif', hasAlpha: false };
    }
    if (hex.startsWith('42 4D')) {
      return { detectedFormat: 'image/bmp', hasAlpha: false };
    }
  } catch {
    // silent
  }

  return { detectedFormat: 'image/png', hasAlpha: true };
}