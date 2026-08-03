// src/tools/image/image-filters/core/constants.ts
import type { FilterState } from './types';

export const FILTER_DEFAULTS: FilterState = {
  brightness: 0,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  sharpness: 0,
  blur: 0,
  highlights: 0,
  shadows: 0,
  grayscale: false,
  sepia: false,
  vintage: false,
  noir: false,
  vignette: false,
  hdr: false,
};

export const FILTER_RANGES = {
  brightness: { min: -100, max: 100, step: 1, default: 0 },
  contrast: { min: 0, max: 200, step: 1, default: 100 },
  saturation: { min: 0, max: 200, step: 1, default: 100 },
  temperature: { min: -100, max: 100, step: 1, default: 0 },
  sharpness: { min: 0, max: 100, step: 1, default: 0 },
  blur: { min: 0, max: 10, step: 0.5, default: 0 },
  highlights: { min: -100, max: 100, step: 1, default: 0 },
  shadows: { min: -100, max: 100, step: 1, default: 0 },
};

export const DEFAULT_DPI = 96;

export const PRESETS = [
  { key: 'grayscale', label: 'Grayscale' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'noir', label: 'Noir' },
  { key: 'vignette', label: 'Vignette' },
  { key: 'hdr', label: 'HDR' },
] as const;