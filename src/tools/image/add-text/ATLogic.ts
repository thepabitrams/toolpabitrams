// src/tools/image/add-text/ATLogic.ts
import { useState, useCallback, useMemo } from 'react';
import { extractImageMetadata } from '@/entities/image/services/readMetadata';
import { injectImageMetadata } from '@/entities/image/services/writeMetadata';

export interface TextConfig {
  content: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  opacity: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  position: 'top' | 'bottom';
}

export interface ATLogicReturn {
  config: TextConfig;
  updateText: (content: string) => void;
  updateFontSize: (size: number) => void;
  updateColor: (color: string) => void;
  updateBackgroundColor: (color: string) => void;
  updateOpacity: (opacity: number) => void;
  updateFontFamily: (font: string) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  updatePosition: (pos: 'top' | 'bottom') => void;
  reset: () => void;
  hasChanges: boolean;
  processImage: (file: File) => Promise<Blob>;
}

// ─── HELPERS ──────────────────────────────────────────────
function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function exportCanvas(
  canvas: HTMLCanvasElement,
  format: string = 'image/jpeg',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      },
      format,
      quality
    );
  });
}

const defaultConfig: TextConfig = {
  content: 'Add your text here',
  fontSize: 48,
  color: '#ffffff',
  backgroundColor: 'transparent',
  opacity: 1,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  position: 'bottom',
};

export function useATLogic(): ATLogicReturn {
  const [config, setConfig] = useState<TextConfig>(defaultConfig);

  const updateText = useCallback((content: string) => {
    setConfig((prev) => ({ ...prev, content }));
  }, []);

  const updateFontSize = useCallback((fontSize: number) => {
    setConfig((prev) => ({ ...prev, fontSize }));
  }, []);

  const updateColor = useCallback((color: string) => {
    setConfig((prev) => ({ ...prev, color }));
  }, []);

  const updateBackgroundColor = useCallback((backgroundColor: string) => {
    setConfig((prev) => ({ ...prev, backgroundColor }));
  }, []);

  const updateOpacity = useCallback((opacity: number) => {
    setConfig((prev) => ({ ...prev, opacity }));
  }, []);

  const updateFontFamily = useCallback((fontFamily: string) => {
    setConfig((prev) => ({ ...prev, fontFamily }));
  }, []);

  const toggleBold = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold',
    }));
  }, []);

  const toggleItalic = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic',
    }));
  }, []);

  const updatePosition = useCallback((position: 'top' | 'bottom') => {
    setConfig((prev) => ({ ...prev, position }));
  }, []);

  const reset = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  const hasChanges = useMemo(() => {
    return config.content !== defaultConfig.content ||
           config.fontSize !== defaultConfig.fontSize ||
           config.color !== defaultConfig.color ||
           config.backgroundColor !== defaultConfig.backgroundColor ||
           config.opacity !== defaultConfig.opacity ||
           config.fontFamily !== defaultConfig.fontFamily ||
           config.fontWeight !== defaultConfig.fontWeight ||
           config.fontStyle !== defaultConfig.fontStyle ||
           config.position !== defaultConfig.position;
  }, [config]);

  // ─── Export Logic ──────────────────────────────────────
  const processImage = useCallback(async (file: File): Promise<Blob> => {
    const img = await loadImage(file);
    const w = img.width;
    const h = img.height;

    // Read DPI
    let originalDpi = 96;
    try {
      const meta = await extractImageMetadata(file);
      if (meta.dpi) originalDpi = meta.dpi;
    } catch {}

    // Create canvas with image size
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Draw image
    ctx.drawImage(img, 0, 0, w, h);

    const {
      content,
      fontSize,
      color,
      backgroundColor,
      opacity,
      fontFamily,
      fontWeight,
      fontStyle,
      position,
    } = config;

    const lines = content.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const padding = 4;

    // ─── Set font for measurements ──────────────────────
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';

    // ─── Measure max text width ──────────────────────────
    let maxWidth = 0;
    for (const line of lines) {
      const metrics = ctx.measureText(line || ' ');
      maxWidth = Math.max(maxWidth, metrics.width);
    }

    // ─── Draw background (edge‑to‑edge full width) ──────
    if (backgroundColor !== 'transparent' && backgroundColor !== '') {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = backgroundColor;

      const boxX = 0;
      const boxW = w;
      let boxY, boxH;

      if (position === 'top') {
        boxY = 0;
        boxH = totalHeight + padding * 2;
      } else { // bottom
        boxY = h - totalHeight - padding * 2;
        boxH = totalHeight + padding * 2;
      }

      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.restore();
    }

    // ─── Draw text ────────────────────────────────────────
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;

    let yStart;
    if (position === 'top') {
      // Top: lines start from top + padding, go downward
      ctx.textBaseline = 'top';
      yStart = padding;
    } else {
      // Bottom: lines start from bottom - padding, go upward
      ctx.textBaseline = 'bottom';
      yStart = h - padding;
    }

    // Draw each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || ' ';
      const yPos = position === 'top' 
        ? yStart + i * lineHeight 
        : yStart - (lines.length - 1 - i) * lineHeight;
      ctx.fillText(line, w / 2, yPos);
    }

    ctx.restore();

    // ─── Export ──────────────────────────────────────────
    const format = file.type || 'image/jpeg';
    const quality = format === 'image/jpeg' || format === 'image/webp' ? 0.95 : undefined;
    const blob = await exportCanvas(canvas, format, quality);

    const fileWithName = new File([blob], file.name, { type: blob.type });
    return injectImageMetadata(fileWithName, originalDpi);
  }, [config]);

  return {
    config,
    updateText,
    updateFontSize,
    updateColor,
    updateBackgroundColor,
    updateOpacity,
    updateFontFamily,
    toggleBold,
    toggleItalic,
    updatePosition,
    reset,
    hasChanges,
    processImage,
  };
}