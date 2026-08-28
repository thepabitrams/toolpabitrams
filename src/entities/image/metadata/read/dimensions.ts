// src/entities/image/metadata/read/dimensions.ts

import { parseMetadata } from '@uswriting/exiftool';

export async function readDimensions(
  file: File
): Promise<{ width?: number; height?: number; unit?: string }> {
  try {
    const result = await parseMetadata(file, {
      args: ['-json', '-n'],
      transform: (data: string) => JSON.parse(data),
    });

    if (result.success && result.data) {
      const exif = result.data[0] || {};
      let width = exif.ImageWidth ? parseInt(exif.ImageWidth, 10) : undefined;
      let height = exif.ImageHeight ? parseInt(exif.ImageHeight, 10) : undefined;
      let unit = 'px';

      if (exif.ResolutionUnit) {
        const resUnit = parseInt(exif.ResolutionUnit, 10);
        if (resUnit === 2) unit = 'inch';
        else if (resUnit === 3) unit = 'cm';
      }
      return { width, height, unit };
    }
  } catch {}

  return getDimensionsFromBlob(file);
}

function getDimensionsFromBlob(blob: Blob): Promise<{ width?: number; height?: number; unit?: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight, unit: 'px' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}