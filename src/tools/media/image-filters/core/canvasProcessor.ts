// src/tools/image/image-filters/core/canvasProcessor.ts
import type { FilterState } from './types';
import { applyBrightness } from './filters/brightness';
import { applyContrast } from './filters/contrast';
import { applySaturation } from './filters/saturation';
import { applyTemperature } from './filters/temperature';
import { applyGrayscale } from './filters/grayscale';
import { applySepia } from './filters/sepia';
import { applyBlur } from './filters/blur';
import { applySharpen } from './filters/sharpen';
import { applyHighlights } from './filters/highlights';
import { applyShadows } from './filters/shadows';
import { applyVignette } from './filters/vignette';
import { applyNoir } from './filters/noir';
import { applyVintage } from './filters/vintage';
import { applyHDR } from './filters/hdr';

export function processCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  filters: FilterState
): void {
  const width = img.width;
  const height = img.height;

  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  if (filters.temperature !== 0) {
    applyTemperature(pixels, filters.temperature);
  }

  if (filters.brightness !== 0) {
    applyBrightness(pixels, filters.brightness);
  }

  if (filters.contrast !== 100) {
    applyContrast(pixels, filters.contrast);
  }

  if (filters.saturation !== 100) {
    applySaturation(pixels, filters.saturation);
  }

  if (filters.blur > 0) {
    applyBlur(pixels, width, height, filters.blur);
  }

  if (filters.highlights !== 0) {
    applyHighlights(pixels, filters.highlights);
  }

  if (filters.shadows !== 0) {
    applyShadows(pixels, filters.shadows);
  }

  if (filters.sharpness > 0) {
    applySharpen(pixels, width, height, filters.sharpness);
  }

  if (filters.grayscale) {
    applyGrayscale(pixels);
  }

  if (filters.sepia) {
    applySepia(pixels);
  }

  if (filters.noir) {
    applyNoir(pixels);
  }

  if (filters.vintage) {
    applyVintage(pixels, width, height);
  }

  if (filters.vignette && !filters.vintage) {
    applyVignette(pixels, width, height);
  }

  if (filters.hdr) {
    applyHDR(pixels);
  }

  ctx.putImageData(imageData, 0, 0);
}