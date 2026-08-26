// src/tools/image/flip-rotate/useFRLogic.ts
import { useState, useCallback, useMemo } from 'react';
import { extractImageMetadata } from '@/entities/image/services/readMetadata'; // 👈 READ
import { injectImageMetadata } from '@/entities/image/services/writeMetadata'; // 👈 WRITE

interface UseFRLogicReturn {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  rotateLeft: () => void;
  rotateRight: () => void;
  toggleFlipH: () => void;
  toggleFlipV: () => void;
  reset: () => void;
  cssTransform: string;
  hasChanges: boolean;
  processImage: (file: File) => Promise<Blob>; // 👈 Back to just (file)
}

export function useFRLogic(): UseFRLogicReturn {
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const rotateLeft = useCallback(() => setRotation((prev) => (prev - 90) % 360), []);
  const rotateRight = useCallback(() => setRotation((prev) => (prev + 90) % 360), []);
  const toggleFlipH = useCallback(() => setFlipH((prev) => !prev), []);
  const toggleFlipV = useCallback(() => setFlipV((prev) => !prev), []);
  const reset = useCallback(() => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const cssTransform = useMemo(() => {
    return `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;
  }, [rotation, flipH, flipV]);

  const hasChanges = rotation !== 0 || flipH || flipV;

  // ─── THE MASTER EXPORT FUNCTION ──────────────────────
  const processImage = useCallback(async (file: File): Promise<Blob> => {
    // 1️⃣ READ THE ORIGINAL DPI
    let originalDpi = 96; // Default fallback
    try {
      const meta = await extractImageMetadata(file);
      if (meta.dpi) originalDpi = meta.dpi;
    } catch {
      // If metadata reading fails, stick with 96.
    }

    // 2️⃣ GENERATE THE TRANSFORMED IMAGE (Canvas)
    const transformedBlob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url); // 🧹 Free memory

        let outW = img.width;
        let outH = img.height;
        const rot = ((rotation % 360) + 360) % 360;
        if (rot === 90 || rot === 270) [outW, outH] = [outH, outW];

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d')!;

        // White background (for JPEG)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outW, outH);

        // Apply rotation + flip
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas export failed'));
        }, 'image/jpeg', 0.95);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });

    // 3️⃣ WRITE THE ORIGINAL DPI BACK INTO THE FINAL BLOB
    const fileWithName = new File([transformedBlob], file.name, { type: transformedBlob.type });
    const finalBlob = await injectImageMetadata(fileWithName, originalDpi);

    // 🎉 DONE: Fully transformed image with preserved DPI
    return finalBlob;
  }, [rotation, flipH, flipV]);

  return {
    rotation,
    flipH,
    flipV,
    rotateLeft,
    rotateRight,
    toggleFlipH,
    toggleFlipV,
    reset,
    cssTransform,
    hasChanges,
    processImage,
  };
}