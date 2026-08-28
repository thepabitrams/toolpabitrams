// src/entities/image/metadata/write/dpi.ts

import { writeMetadata } from '@uswriting/exiftool';

const DPI_WRITABLE_FORMATS = new Set([
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

export async function writeDpi(file: File, dpi: number): Promise<Blob> {
  if (!DPI_WRITABLE_FORMATS.has(file.type)) {
    return file;
  }

  const tags: any = {
    'XResolution': Math.round(dpi),
    'YResolution': Math.round(dpi),
    'ResolutionUnit': 'inches',
  };

  if (file.type === 'image/png') {
    const pixelsPerMeter = Math.round(dpi * 10000 / 254);
    tags['PixelsPerUnitX'] = pixelsPerMeter;
    tags['PixelsPerUnitY'] = pixelsPerMeter;
    tags['PixelUnits'] = 'meters';
  }

  try {
    const result = await writeMetadata(file, tags);
    if (result.success) {
      return new Blob([result.data], { type: file.type });
    }
  } catch {}

  return file;
}