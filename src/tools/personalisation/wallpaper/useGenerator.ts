// src/tools/personalisation/wallpaper/useGenerator.ts

import { exportCanvas } from '@/lib/browser';
import { writeDpi } from '@/entities/image/metadata';

export function useGenerator() {
  const generateWallpaper = async (
    color: string,
    width: number,
    height: number,
    fileType: 'png' | 'jpeg' | 'webp'
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mimeType = `image/${fileType}`;
    const quality = fileType === 'png' ? undefined : 0.95;

    const blob = await exportCanvas(canvas, mimeType, quality);

    const ext = fileType === 'jpeg' ? 'jpg' : fileType;
    const file = new File([blob], `wallpaper.${ext}`, { type: mimeType });
    return writeDpi(file, 96);
  };

  return { generateWallpaper };
}