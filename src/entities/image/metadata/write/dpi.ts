// src/entities/image/metadata/write/dpi.ts

import { writeMetadata } from '@uswriting/exiftool';

export async function writeDpi(file: File, dpi: number): Promise<Blob> {
  const tags = {
    'XResolution': Math.round(dpi),
    'YResolution': Math.round(dpi),
    'ResolutionUnit': 'inches',
  };

  try {
    const result = await writeMetadata(file, tags);
    if (result.success) {
      return new Blob([result.data], { type: file.type });
    }
  } catch {}
  
  return file;
}