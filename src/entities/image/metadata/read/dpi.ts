// src/entities/image/metadata/read/dpi.ts

import { readExif } from './readExif';
import type { ExifTags } from '../types';

export function extractDpi(tags: ExifTags): { dpi?: number; unit?: string } {
  let dpi: number | undefined = undefined;
  let unit = 'px';

  const xResolution = toNumber(tags.XResolution);
  const yResolution = toNumber(tags.YResolution);
  if (xResolution != null && yResolution != null) {
    dpi = Math.round((xResolution + yResolution) / 2);
  }

  if (!dpi) {
    const pixelsPerUnitX = toNumber(tags.PixelsPerUnitX);
    const pixelsPerUnitY = toNumber(tags.PixelsPerUnitY);
    if (pixelsPerUnitX != null && pixelsPerUnitY != null) {
      const averagePixelsPerUnit = (pixelsPerUnitX + pixelsPerUnitY) / 2;
      dpi = Math.round(averagePixelsPerUnit * 0.0254);
    }
  }

  const resolutionUnit = toNumber(tags.ResolutionUnit);
  if (resolutionUnit === 2) unit = 'inch';
  else if (resolutionUnit === 3) unit = 'cm';

  return { dpi, unit };
}

export async function readDpi(
  file: File
): Promise<{ dpi?: number; unit?: string }> {
  const tags = await readExif(file);
  return extractDpi(tags);
}

function toNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}