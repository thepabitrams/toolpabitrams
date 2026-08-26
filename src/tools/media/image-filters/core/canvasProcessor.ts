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

/**
 * Process canvas for export only.
 * 
 * BLUR IS APPLIED HERE (EXPORT ONLY)
 * CSS preview does NOT show blur.
 * 
 * Performance optimized: ONE getImageData + ONE putImageData.
 */
export function processCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  filters: FilterState
): void {
  const w = img.width;
  const h = img.height;

  // ─── STEP 1: Draw the original image ──────────────────
  ctx.drawImage(img, 0, 0, w, h);

  // ─── STEP 2: Get pixel data (ONCE) ────────────────────
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;

  // ─── STEP 3: Apply ALL filters (ONLY ONCE) ──────────

  // Temperature (CSS doesn't support)
  if (filters.temperature !== 0) {
    applyTemperature(data, filters.temperature);
  }

  // Brightness
  if (filters.brightness !== 0) {
    applyBrightness(data, filters.brightness);
  }

  // Contrast
  if (filters.contrast !== 100) {
    applyContrast(data, filters.contrast);
  }

  // Saturation
  if (filters.saturation !== 100) {
    applySaturation(data, filters.saturation);
  }

  // ─── BLUR APPLIED HERE (EXPORT ONLY) ──────────────────
  if (filters.blur > 0) {
    applyBlur(data, w, h, filters.blur);
  }

  // Highlights (CSS doesn't support)
  if (filters.highlights !== 0) {
    applyHighlights(data, filters.highlights);
  }

  // Shadows (CSS doesn't support)
  if (filters.shadows !== 0) {
    applyShadows(data, filters.shadows);
  }

  // Sharpen (CSS doesn't support)
  if (filters.sharpness > 0) {
    applySharpen(data, w, h, filters.sharpness);
  }

  // Grayscale
  if (filters.grayscale) {
    applyGrayscale(data);
  }

  // Sepia
  if (filters.sepia) {
    applySepia(data);
  }

  // Noir (grayscale + contrast)
  if (filters.noir) {
    applyNoir(data);
  }

  // Vintage (sepia + contrast + vignette)
  if (filters.vintage) {
    applyVintage(data, w, h);
  }

  // Vignette (CSS doesn't support)
  if (filters.vignette && !filters.vintage) {
    applyVignette(data, w, h);
  }

  // HDR (contrast + saturation)
  if (filters.hdr) {
    applyHDR(data);
  }

  // ─── STEP 4: Put processed data back (ONCE) ──────────
  ctx.putImageData(imageData, 0, 0);
}