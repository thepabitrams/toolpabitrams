// src/tools/image/image-filters/core/cssGenerator.ts
import type { FilterState } from './types';

/**
 * Generate CSS filter string for live preview.
 * 
 * BLUR IS REMOVED FROM PREVIEW – export only.
 */
export function generateCSSFilter(filters: FilterState): string {
  const parts: string[] = [];

  // Live CSS filters (BLUR REMOVED)
  if (filters.brightness !== 0) {
    parts.push(`brightness(${100 + filters.brightness}%)`);
  }
  if (filters.contrast !== 100) {
    parts.push(`contrast(${filters.contrast}%)`);
  }
  if (filters.saturation !== 100) {
    parts.push(`saturate(${filters.saturation}%)`);
  }

  // Vintage (sepia + contrast)
  if (filters.vintage) {
    parts.push(`sepia(80%)`, `contrast(120%)`);
  } else if (filters.sepia) {
    parts.push(`sepia(100%)`);
  }

  // Noir (grayscale + contrast)
  if (filters.noir) {
    parts.push(`grayscale(100%)`, `contrast(150%)`);
  } else if (filters.grayscale) {
    parts.push(`grayscale(100%)`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}