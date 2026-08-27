// src/tools/image/adjust-size/useAdjustSize.ts
import { useState, useCallback } from 'react';
import { extractImageMetadata } from '@/entities/image/services/readMetadata';
import { injectImageMetadata } from '@/entities/image/services/writeMetadata';

interface ProgressData {
  quality: number;
  sizeKB: number;
  type: 'compress' | 'upscale' | 'idle';
  iteration: number;
  strategy: string;
}

export interface ProcessResult {
  blob: Blob;
  sizeKB: number;
  minKB: number;
  maxKB: number;
  isWithinRange: boolean;
  smallestPossible: number;
  error?: string;
}

export function useAdjustSize() { // ✅ RENAMED FUNCTION
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  // ─── Helper: encode with canvas ──────────────────────────────
  const encodeWithCanvas = useCallback((
    imageData: ImageData,
    width: number,
    height: number,
    quality: number,
    strategy: 'quality' | 'subsample' | 'posterize' | 'blur' | 'all'
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Draw original
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0, width, height);

      // Apply strategy
      let imageData2 = ctx.getImageData(0, 0, width, height);

      if (strategy === 'posterize' || strategy === 'all') {
        const data = imageData2.data;
        const levels = Math.floor(quality / 10) + 2;
        const step = 255 / (levels - 1);
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] / step) * step;
          data[i + 1] = Math.round(data[i + 1] / step) * step;
          data[i + 2] = Math.round(data[i + 2] / step) * step;
        }
        ctx.putImageData(imageData2, 0, 0);
      }

      if (strategy === 'blur' || strategy === 'all') {
        const blurAmount = 1 + (1 - quality / 100) * 4;
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(tempCanvas, 0, 0, width, height);
        ctx.filter = 'none';
      }

      const format = 'image/jpeg';
      const qualityParam = quality / 100;
      canvas.toBlob((blob) => resolve(blob!), format, qualityParam);
    });
  }, []);

  // ─── Helper: increase size ──────────────────────────────────
  const increaseSize = useCallback((
    imageData: ImageData,
    width: number,
    height: number,
    targetKB: number
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Draw original
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0, width, height);

      let bestBlob: Blob | null = null;
      let bestSize = 0;

      // Try qualities from 1.0 down to 0.5
      for (let q = 1.0; q >= 0.5; q -= 0.05) {
        canvas.toBlob((blob) => {
          if (blob) {
            const kb = blob.size / 1024;
            if (kb > bestSize) {
              bestBlob = blob;
              bestSize = kb;
            }
          }
        }, 'image/jpeg', q);
      }

      // If still too small, add subtle padding (invisible text)
      if (bestBlob && bestBlob.size / 1024 < targetKB) {
        ctx.fillStyle = 'rgba(0,0,0,0.01)';
        ctx.font = '10px Arial';
        ctx.fillText(' ', 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 1.0);
      } else if (bestBlob) {
        resolve(bestBlob);
      } else {
        // Fallback: return original canvas as blob
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 1.0);
      }
    });
  }, []);

  // ─── Helper: create result object ──────────────────────────
  const createResult = useCallback((
    blob: Blob,
    minKB: number,
    maxKB: number,
    error?: string
  ): ProcessResult => {
    const sizeKB = blob.size / 1024;
    return {
      blob,
      sizeKB,
      minKB,
      maxKB,
      isWithinRange: sizeKB >= minKB && sizeKB <= maxKB,
      smallestPossible: sizeKB,
      error,
    };
  }, []);

  // ─── Main process ──────────────────────────────────────────────
  const process = useCallback(
    async (
      file: File,
      minKB: number,
      maxKB: number,
      onProgress?: (data: ProgressData) => void
    ): Promise<ProcessResult> => {
      setIsProcessing(true);
      setProgress(null);

      try {
        // ─── 1. Read metadata ──────────────────────────────────────
        const metadata = await extractImageMetadata(file);
        const dpi = metadata.dpi || 300;
        const originalWidth = metadata.width || 0;
        const originalHeight = metadata.height || 0;

        if (originalWidth === 0 || originalHeight === 0) {
          throw new Error('Could not read image dimensions');
        }

        // ─── 2. Load image ─────────────────────────────────────────
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = reject;
          el.src = URL.createObjectURL(file);
        });

        const canvas = document.createElement('canvas');
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, originalWidth, originalHeight);
        URL.revokeObjectURL(img.src);

        const originalSizeKB = file.size / 1024;

        // ─── 3. Already in range? ──────────────────────────────────
        if (originalSizeKB >= minKB && originalSizeKB <= maxKB) {
          const finalFile = new File([file], 'output.jpg', { type: file.type });
          const finalBlob = await injectImageMetadata(finalFile, dpi);
          setIsProcessing(false);
          return createResult(finalBlob, minKB, maxKB);
        }

        // ─── 4. Too small – INCREASE ──────────────────────────────
        if (originalSizeKB < minKB) {
          const blob = await increaseSize(imageData, originalWidth, originalHeight, minKB);
          const finalFile = new File([blob], 'output.jpg', { type: blob.type });
          const finalBlob = await injectImageMetadata(finalFile, dpi);
          const sizeKB = finalBlob.size / 1024;
          const isWithin = sizeKB >= minKB && sizeKB <= maxKB;
          setIsProcessing(false);
          return createResult(finalBlob, minKB, maxKB,
            isWithin ? undefined : `Cannot increase to ${minKB}KB. Max possible is ${sizeKB.toFixed(1)}KB.`
          );
        }

        // ─── 5. Too large – COMPRESS ──────────────────────────────
        const strategies: Array<'quality' | 'subsample' | 'posterize' | 'blur' | 'all'> = [
          'quality', 'subsample', 'posterize', 'blur', 'all'
        ];

        let globalBestBlob: Blob | null = null;
        let globalBestSize = Infinity;
        let iterations = 0;
        const MAX_ITERATIONS = 30;

        for (const strategy of strategies) {
          let low = 1, high = 100;
          let strategyBestBlob: Blob | null = null;
          let strategyBestSize = Infinity;
          let stuck = 0, prevSize = Infinity;

          while (low <= high && iterations < MAX_ITERATIONS) {
            iterations++;
            const quality = Math.floor((low + high) / 2);

            const blob = await encodeWithCanvas(imageData, originalWidth, originalHeight, quality, strategy);
            const sizeKB = blob.size / 1024;

            // Progress
            const progressData: ProgressData = { quality, sizeKB, type: 'compress', iteration: iterations, strategy };
            setProgress(progressData);
            onProgress?.(progressData);

            // Global best
            if (sizeKB < globalBestSize) {
              globalBestBlob = blob;
              globalBestSize = sizeKB;
            }

            // Within range?
            if (sizeKB >= minKB && sizeKB <= maxKB) {
              const finalFile = new File([blob], 'output.jpg', { type: blob.type });
              const finalBlob = await injectImageMetadata(finalFile, dpi);
              setIsProcessing(false);
              return createResult(finalBlob, minKB, maxKB);
            }

            // Stuck?
            if (Math.abs(sizeKB - prevSize) < 0.1) {
              if (++stuck >= 3) break;
            } else { stuck = 0; }
            prevSize = sizeKB;

            // Save strategy best (closest to max without exceeding)
            if (sizeKB <= maxKB && sizeKB > strategyBestSize) {
              strategyBestBlob = blob;
              strategyBestSize = sizeKB;
            }

            // Binary search
            if (sizeKB > maxKB) high = quality - 1;
            else low = quality + 1;
            if (high - low < 1) break;
          }

          // If strategy found a good result within range, return
          if (strategyBestBlob && strategyBestSize >= minKB) {
            const finalFile = new File([strategyBestBlob], 'output.jpg', { type: strategyBestBlob.type });
            const finalBlob = await injectImageMetadata(finalFile, dpi);
            setIsProcessing(false);
            return createResult(finalBlob, minKB, maxKB);
          }

          // If strategy got size <= max, we can stop (since we want smallest)
          if (strategyBestBlob && strategyBestSize <= maxKB) {
            break;
          }
        }

        // ─── Return global best ──────────────────────────────────
        if (globalBestBlob) {
          const finalFile = new File([globalBestBlob], 'output.jpg', { type: globalBestBlob.type });
          const finalBlob = await injectImageMetadata(finalFile, dpi);
          const sizeKB = finalBlob.size / 1024;
          const isWithin = sizeKB >= minKB && sizeKB <= maxKB;
          setIsProcessing(false);
          return createResult(finalBlob, minKB, maxKB,
            isWithin ? undefined : `Cannot compress below ${maxKB}KB. Smallest: ${sizeKB.toFixed(1)}KB.`
          );
        }

        // ─── Absolute fallback ────────────────────────────────────
        const finalFile = new File([file], 'output.jpg', { type: file.type });
        const finalBlob = await injectImageMetadata(finalFile, dpi);
        setIsProcessing(false);
        return createResult(finalBlob, minKB, maxKB, 'Processing failed. Original returned.');

      } catch (err) {
        setIsProcessing(false);
        // Return original file as fallback
        const fallbackBlob = file;
        return createResult(fallbackBlob, minKB, maxKB, `Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsProcessing(false);
        setProgress(null);
      }
    },
    [encodeWithCanvas, increaseSize, createResult]
  );

  return { process, isProcessing, progress };
}