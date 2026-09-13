// src/entities/image/metadata/write/dpi.ts

import { writeExif } from './writeExif';
import type { ExifTags } from '../types';

const DPI_WRITABLE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/tif',
  'image/avif',
  'image/heic',
  'image/webp',
  'image/jp2',
  'image/j2c',
]);

export function buildDpiTags(dpi: number, mimeType: string): ExifTags {
  const tags: ExifTags = {
    XResolution: Math.round(dpi),
    YResolution: Math.round(dpi),
    ResolutionUnit: 'inches',
  };

  if (mimeType === 'image/png') {
    const pixelsPerMeter = Math.round((dpi * 10000) / 254);
    tags.PixelsPerUnitX = pixelsPerMeter;
    tags.PixelsPerUnitY = pixelsPerMeter;
    tags.PixelUnits = 'meters';
  }

  return tags;
}

export async function writeDpi(file: File, dpi: number): Promise<Blob> {
  if (!DPI_WRITABLE_MIME_TYPES.has(file.type)) {
    return file;
  }
  const tags = buildDpiTags(dpi, file.type);
  return writeExif(file, tags);
}