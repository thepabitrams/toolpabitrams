// src/entities/image/metadata/write/writeExif.ts

import { writeMetadata } from '@uswriting/exiftool';
import type { ExifTags } from '../types';

export async function writeExif(file: File, tags: ExifTags): Promise<Blob> {
  try {
    const result = await writeMetadata(file, tags);
    if (result.success) {
      return new Blob([result.data], { type: file.type });
    }
  } catch (error) {
    console.debug('[writeExif] Failed:', error);
  }
  return file;
}