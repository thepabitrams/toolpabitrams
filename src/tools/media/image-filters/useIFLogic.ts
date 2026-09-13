// src/tools/image/image-filters/useIFLogic.ts
import { useState, useCallback, useMemo } from 'react';
import { readDpi } from '@/entities/image/metadata';
import { writeDpi } from '@/entities/image/metadata';
import { loadImage, exportCanvas } from '@/lib/browser';
import { FILTER_DEFAULTS, DEFAULT_DPI } from './core/constants';
import { generateCSSFilter } from './core/cssGenerator';
import { processCanvas } from './core/canvasProcessor';
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
    const image = await loadImage(file);
    const width = image.width;
    const height = image.height;

    let originalDpi = DEFAULT_DPI;
    try {
      const dpiResult = await readDpi(file);
      if (dpiResult.dpi) originalDpi = dpiResult.dpi;
    } catch {}

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d')!;

    processCanvas(context, canvas, image, filters);

    const format = file.type || 'image/jpeg';
    const quality = format === 'image/jpeg' || format === 'image/webp' ? 0.95 : undefined;
    const blob = await exportCanvas(canvas, format, quality);

    const fileWithName = new File([blob], file.name, { type: blob.type });
    return writeDpi(fileWithName, originalDpi);
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