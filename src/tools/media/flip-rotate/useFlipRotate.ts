// src/tools/image/flip-rotate/useFlipRotate.ts

import { useState, useCallback, useMemo } from 'react';
import { readDpi, writeDpi } from '@/entities/image/metadata';
import { detectFormatAndAlpha } from '@/entities/image';
import { loadImage, exportCanvas, prepareCanvas, resizeCanvas } from '@/lib/browser';

interface UseFlipRotateReturn {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  rotateLeft: () => void;
  rotateRight: () => void;
  toggleFlipH: () => void;
  toggleFlipV: () => void;
  reset: () => void;
  computedTransform: string;
  normalizedRotation: number;
  hasChanges: boolean;
  processImage: (file: File) => Promise<Blob>;
}

export function useFlipRotate(): UseFlipRotateReturn {
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const rotateLeft = useCallback(() => setRotation((prev) => prev - 90), []);
  const rotateRight = useCallback(() => setRotation((prev) => prev + 90), []);
  const toggleFlipH = useCallback(() => setFlipH((prev) => !prev), []);
  const toggleFlipV = useCallback(() => setFlipV((prev) => !prev), []);
  const reset = useCallback(() => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const computedTransform = useMemo(() => {
    return `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;
  }, [rotation, flipH, flipV]);

  const normalizedRotation = useMemo(() => {
    return ((rotation % 360) + 360) % 360;
  }, [rotation]);

  const hasChanges = rotation !== 0 || flipH || flipV;

  const processImage = useCallback(async (file: File): Promise<Blob> => {
    // ─── READ METADATA ────────────────────────────────────
    let originalDpi = 96;
    try {
      const dpi = await readDpi(file);
      if (dpi.dpi) originalDpi = dpi.dpi;
    } catch {}

    // ─── DETECT FORMAT ────────────────────────────────────
    const { format: originalFormat, hasAlpha } = await detectFormatAndAlpha(file);
    const outputFormat = hasAlpha ? originalFormat : 'image/jpeg';
    const quality = outputFormat === 'image/jpeg' ? 0.95 : undefined;

    // ─── LOAD IMAGE ──────────────────────────────────────
    const img = await loadImage(file);

    // ─── CALCULATE DIMENSIONS ────────────────────────────
    let outW = img.width;
    let outH = img.height;
    const rot = ((rotation % 360) + 360) % 360;
    if (rot === 90 || rot === 270) [outW, outH] = [outH, outW];

    // ─── CREATE CANVAS ──────────────────────────────────
    const canvas = document.createElement('canvas');
    resizeCanvas(canvas, outW, outH);
    const ctx = prepareCanvas(canvas, hasAlpha);

    // ─── APPLY TRANSFORMS ──────────────────────────────
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // ─── EXPORT ─────────────────────────────────────────
    const blob = await exportCanvas(canvas, outputFormat, quality);

    // ─── INJECT DPI ─────────────────────────────────────
    const ext = outputFormat.split('/')[1] || 'png';
    const finalFile = new File([blob], `transformed.${ext}`, { type: outputFormat });
    return writeDpi(finalFile, originalDpi);
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
    computedTransform,
    normalizedRotation,
    hasChanges,
    processImage,
  };
}