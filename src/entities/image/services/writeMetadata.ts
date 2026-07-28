// src/entities/image/services/writeMetadata.ts
import { writeMetadata } from '@uswriting/exiftool';

/**
 * Injects DPI metadata ONLY into the image.
 * 
 * 🔥 FIX: ResolutionUnit expects a STRING ('inches' or 'cm'), not a number!
 * 
 * @param file - The image as a File object (NOT a Blob!)
 * @param dpi - Target DPI (e.g., 96 or 200)
 * @returns Promise<Blob> - The image blob with injected DPI metadata
 */
export async function injectImageMetadata(
  file: File,
  dpi: number
): Promise<Blob> {
  const tags = {
    'XResolution': Math.round(dpi),
    'YResolution': Math.round(dpi),
    'ResolutionUnit': 'inches', // ✅ STRING, not number!
  };

  console.log(`📝 Injecting DPI ONLY: ${Math.round(dpi)} DPI`);

  try {
    const result = await writeMetadata(file, tags);
    if (result.success) {
      console.log('✅ DPI injected successfully');
      return new Blob([result.data], { type: file.type });
    } else {
      console.warn('⚠️ DPI injection failed:', result.error);
      return file;
    }
  } catch (error) {
    console.error('❌ DPI injection error:', error);
    return file;
  }
}