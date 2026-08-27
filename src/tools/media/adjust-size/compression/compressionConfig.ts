// src/tools/image/adjust-size/compression/compressionConfig.ts
export const BRIGHTNESS_VALUES = [10, 15, 20, 25, 30, 35, 40, 45, 50];
export const CONTRAST_VALUES = [0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35];
export const POSTERIZE_VALUES = [24, 20, 16, 12, 8, 6, 4];
export const BLUR_VALUES = [0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.5];
export const AGGRESSIVE_COMPRESSION_LEVELS = [
  { brightness: 30, contrast: 0.5, posterize: 12, blur: 1.5 },
  { brightness: 40, contrast: 0.4, posterize: 8, blur: 2.0 },
  { brightness: 50, contrast: 0.35, posterize: 4, blur: 2.5 },
];