// src/tools/image/adjust-size/utils/dpi.ts
import { extractImageMetadata } from '@/entities/image/services/readMetadata';
import { injectImageMetadata } from '@/entities/image/services/writeMetadata';

export async function extractDPI(file: File): Promise<number> {
  try {
    const meta = await extractImageMetadata(file);
    return meta.dpi || 300;
  } catch {
    return 300;
  }
}

export async function injectDPI(blob: Blob, dpi: number, format: string): Promise<Blob> {
  if (format === 'image/jpeg' || format === 'image/jpg') {
    const file = new File([blob], 'output.jpg', { type: format });
    return await injectImageMetadata(file, dpi);
  }
  return blob;
}