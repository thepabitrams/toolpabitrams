// src/entities/image/detect.ts

import { FormatResult } from './types/format';

export async function detectFormatAndAlpha(
  file: File
): Promise<FormatResult> {
  if (file.type && file.type !== '') {
    const hasAlpha = file.type === 'image/png' || 
                     file.type === 'image/webp' || 
                     file.type === 'image/gif';
    return { format: file.type, hasAlpha };
  }

  try {
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
      .toUpperCase();

    if (hex.startsWith('FF D8 FF')) return { format: 'image/jpeg', hasAlpha: false };
    if (hex.startsWith('89 50 4E 47')) return { format: 'image/png', hasAlpha: true };
    if (hex.startsWith('47 49 46 38')) return { format: 'image/gif', hasAlpha: true };
    if (hex.startsWith('52 49 46 46')) return { format: 'image/webp', hasAlpha: true };
    if (hex.includes('66 74 79 70 61 76 69 66')) return { format: 'image/avif', hasAlpha: false };
    if (hex.startsWith('42 4D')) return { format: 'image/bmp', hasAlpha: false };
  } catch {}

  return { format: 'image/png', hasAlpha: true };
}