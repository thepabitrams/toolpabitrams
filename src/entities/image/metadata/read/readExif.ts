// src/entities/image/metadata/read/readExif.ts

import { parseMetadata } from '@uswriting/exiftool';
import type { ExifTags } from '../types';

let inFlightRead: { file: File; promise: Promise<ExifTags> } | null = null;

export async function readExif(file: File): Promise<ExifTags> {
  if (inFlightRead && inFlightRead.file === file) {
    return inFlightRead.promise;
  }

  const promise = performRead(file);
  inFlightRead = { file, promise };

  try {
    return await promise;
  } finally {
    if (inFlightRead && inFlightRead.promise === promise) {
      inFlightRead = null;
    }
  }
}

async function performRead(file: File): Promise<ExifTags> {
  try {
    const result = await parseMetadata(file, {
      args: ['-json', '-n'],
      transform: (data: string) => JSON.parse(data),
    });
    if (result.success && result.data) {
      return (result.data[0] as ExifTags) || {};
    }
  } catch (error) {
    console.debug('[readExif] Failed:', error);
  }
  return {};
}