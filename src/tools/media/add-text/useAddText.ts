// src/tools/image/add-text/useAddText.ts

import { useState, useCallback, useMemo } from 'react';
import { readDpi, writeDpi } from '@/entities/image/metadata';
import { detectFormatAndAlpha } from '@/entities/image';
import { loadImage, exportCanvas } from '@/lib/browser';

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

export interface AddTextReturn {
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

export function useAddText(): AddTextReturn {
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

  const processImage = useCallback(async (file: File): Promise<Blob> => {
    const img = await loadImage(file);
    const w = img.width;
    const h = img.height;

    let originalDpi = 96;
    try {
      const dpi = await readDpi(file);
      if (dpi.dpi) originalDpi = dpi.dpi;
    } catch {}

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

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

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';

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
      } else {
        boxY = h - totalHeight - padding * 2;
        boxH = totalHeight + padding * 2;
      }

      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;

    let yStart;
    if (position === 'top') {
      ctx.textBaseline = 'top';
      yStart = padding;
    } else {
      ctx.textBaseline = 'bottom';
      yStart = h - padding;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || ' ';
      const yPos = position === 'top'
        ? yStart + i * lineHeight
        : yStart - (lines.length - 1 - i) * lineHeight;
      ctx.fillText(line, w / 2, yPos);
    }

    ctx.restore();

    const { format, hasAlpha } = await detectFormatAndAlpha(file);
    const outputFormat = hasAlpha ? format : 'image/jpeg';
    const quality = outputFormat === 'image/jpeg' ? 0.95 : undefined;
    const blob = await exportCanvas(canvas, outputFormat, quality);

    const ext = outputFormat.split('/')[1] || 'png';
    const finalFile = new File([blob], `text-added.${ext}`, { type: outputFormat });
    return writeDpi(finalFile, originalDpi);
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