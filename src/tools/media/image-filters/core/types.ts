// src/tools/image/image-filters/core/types.ts
export interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sharpness: number;
  blur: number;
  highlights: number;
  shadows: number;
  grayscale: boolean;
  sepia: boolean;
  vintage: boolean;
  noir: boolean;
  vignette: boolean;
  hdr: boolean;
}

export type FilterKey = keyof FilterState;
export type NumericFilterKey = Exclude<FilterKey, 'grayscale' | 'sepia' | 'vintage' | 'noir' | 'vignette' | 'hdr'>;
export type BooleanFilterKey = Extract<FilterKey, 'grayscale' | 'sepia' | 'vintage' | 'noir' | 'vignette' | 'hdr'>;

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface FilterLayer {
  id: string;
  type: FilterKey;
  value: number | boolean;
  enabled: boolean;
}