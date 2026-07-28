// src/entities/image/services/readMetadata.ts
import { parseMetadata } from '@uswriting/exiftool';

export async function extractImageMetadata(
  fileInput: File | Blob,
  fileName?: string
): Promise<{
  width?: number;
  height?: number;
  dpi?: number;
  unit?: string;
}> {
  // If it's a Blob, wrap it in a File
  let file: File;
  if (fileInput instanceof Blob && !('name' in fileInput)) {
    file = new File([fileInput], fileName || 'image', { type: fileInput.type });
  } else {
    file = fileInput as File;
  }

  try {
    const result = await parseMetadata(file, {
      args: ['-json', '-n'],
      transform: (data: string) => JSON.parse(data),
    });

    if (result.success && result.data) {
      const exif = result.data[0] || {};
      let width = exif.ImageWidth ? parseInt(exif.ImageWidth, 10) : undefined;
      let height = exif.ImageHeight ? parseInt(exif.ImageHeight, 10) : undefined;
      let dpi = undefined;
      let unit = 'px';

      if (exif.XResolution && exif.YResolution) {
        const xRes = parseFloat(exif.XResolution);
        const yRes = parseFloat(exif.YResolution);
        if (!isNaN(xRes) && !isNaN(yRes)) {
          dpi = Math.round((xRes + yRes) / 2);
        }
      }
      if (exif.ResolutionUnit) {
        const resUnit = parseInt(exif.ResolutionUnit, 10);
        if (resUnit === 2) unit = 'inch';
        else if (resUnit === 3) unit = 'cm';
      }
      return { width, height, dpi, unit };
    }
  } catch (error) {
    console.debug('EXIF extraction failed, falling back to dimensions.');
  }

  // Fallback: get dimensions from image
  return getDimensionsFromBlob(file);
}

function getDimensionsFromBlob(blob: Blob): Promise<{
  width?: number;
  height?: number;
  unit?: string;
}> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        unit: 'px',
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}