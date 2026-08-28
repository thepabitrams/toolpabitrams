// src/entities/image/metadata/read/dpi.ts

import { parseMetadata } from '@uswriting/exiftool';

export async function readDpi(
  file: File
): Promise<{ dpi?: number; unit?: string }> {
  try {
    const result = await parseMetadata(file, {
      args: ['-json', '-n'],
      transform: (data: string) => JSON.parse(data),
    });

    if (result.success && result.data) {
      const exif = result.data[0] || {};
      let dpi = undefined;
      let unit = 'px';

      if (exif.XResolution && exif.YResolution) {
        const xRes = parseFloat(exif.XResolution);
        const yRes = parseFloat(exif.YResolution);
        if (!isNaN(xRes) && !isNaN(yRes)) {
          dpi = Math.round((xRes + yRes) / 2);
        }
      }

      if (!dpi && exif.PixelsPerUnitX && exif.PixelsPerUnitY) {
        const ppuX = parseFloat(exif.PixelsPerUnitX);
        const ppuY = parseFloat(exif.PixelsPerUnitY);
        if (!isNaN(ppuX) && !isNaN(ppuY)) {
          const avgPpu = (ppuX + ppuY) / 2;
          dpi = Math.round(avgPpu * 0.0254);
        }
      }

      if (exif.ResolutionUnit) {
        const resUnit = parseInt(exif.ResolutionUnit, 10);
        if (resUnit === 2) unit = 'inch';
        else if (resUnit === 3) unit = 'cm';
      }

      return { dpi, unit };
    }
  } catch {}

  return { dpi: undefined, unit: 'px' };
}