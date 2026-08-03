// src/tools/image/image-filters/useIFLogic.ts
import { useState, useCallback, useMemo } from 'react';
import { extractImageMetadata } from '@/entities/image/services/readMetadata';
import { injectImageMetadata } from '@/entities/image/services/writeMetadata';
import { FILTER_DEFAULTS, DEFAULT_DPI } from './core/constants';
import { generateCSSFilter } from './core/cssGenerator';
import { processCanvas } from './core/canvasProcessor';
import { loadImage } from './core/utils/loadImage';
import { exportCanvas } from './core/utils/exportCanvas';
import type { FilterState } from './core/types';

export interface IFLogicReturn {
  filters: FilterState;
  updateFilter: (key: keyof FilterState, value: any) => void;
  resetFilters: () => void;
  getCSSFilterString: () => string;
  hasChanges: boolean;
  processImage: (file: File) => Promise<Blob>;
}

export function useIFLogic(): IFLogicReturn {
  const [filters, setFilters] = useState<FilterState>(FILTER_DEFAULTS);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(FILTER_DEFAULTS);
  }, []);

  const getCSSFilterString = useCallback(() => {
    return generateCSSFilter(filters);
  }, [filters]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(FILTER_DEFAULTS);
  }, [filters]);

  const processImage = useCallback(async (file: File): Promise<Blob> => {
    const img = await loadImage(file);
    const w = img.width;
    const h = img.height;

    let originalDpi = DEFAULT_DPI;
    try {
      const meta = await extractImageMetadata(file);
      if (meta.dpi) originalDpi = meta.dpi;
    } catch {}

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    processCanvas(ctx, canvas, img, filters);

    const format = file.type || 'image/jpeg';
    const quality = format === 'image/jpeg' || format === 'image/webp' ? 0.95 : undefined;
    const blob = await exportCanvas(canvas, format, quality);

    const fileWithName = new File([blob], file.name, { type: blob.type });
    return injectImageMetadata(fileWithName, originalDpi);
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    getCSSFilterString,
    hasChanges,
    processImage,
  };
}