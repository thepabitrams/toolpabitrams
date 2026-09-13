// src/entities/image/metadata/read/dimensions.ts

import { readExif } from './readExif';
import type { ExifTags } from '../types';

export function extractDimensions(tags: ExifTags): {
  width?: number;
  height?: number;
  unit?: string;
} {
  const width = toNumber(tags.ImageWidth);
  const height = toNumber(tags.ImageHeight);
  let unit = 'px';

  const resolutionUnit = toNumber(tags.ResolutionUnit);
  if (resolutionUnit === 2) unit = 'inch';
  else if (resolutionUnit === 3) unit = 'cm';

  return { width, height, unit };
}

export async function readDimensions(
  file: File
): Promise<{ width?: number; height?: number; unit?: string }> {
  const tags = await readExif(file);
  const dimensions = extractDimensions(tags);

  if (dimensions.width != null && dimensions.height != null) {
    return dimensions;
  }

  return getDimensionsFromBlob(file);
}

function getDimensionsFromBlob(blob: Blob): Promise<{ width?: number; height?: number; unit?: string }> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight, unit: 'px' });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({});
    };
    image.src = objectUrl;
  });
}

function toNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}