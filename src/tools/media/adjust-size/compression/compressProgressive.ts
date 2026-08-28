// src/tools/image/adjust-size/compression/compressProgressive.ts

import { loadImage } from '@/lib/browser'; // 👈 ADDED IMPORT
import {
  posterize,
  contrastReduce,
  brightnessAdjust,
  gaussianBlur,
  chromaSubsampling,
} from '../strategies';
import {
  BRIGHTNESS_VALUES,
  CONTRAST_VALUES,
  POSTERIZE_VALUES,
  BLUR_VALUES,
} from './compressionConfig';

export async function compressProgressive(
  blob: Blob,
  targetKB: number,
  format: string,
  hasAlpha: boolean,
  isLossyFormat: boolean,
  onProgress?: (data: any) => void
): Promise<Blob> {
  const img = await loadImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.drawImage(img, 0, 0);
  const baseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let bestBlob = blob;
  let bestSize = blob.size / 1024;

  const strategies: Strategy[] = [];

  if (isLossyFormat && !hasAlpha) {
    strategies.push({ name: 'chroma', values: [1] });
  }
  if (!hasAlpha) {
    strategies.push({ name: 'blur', values: BLUR_VALUES });
  }
  strategies.push({ name: 'posterize', values: POSTERIZE_VALUES });
  strategies.push({ name: 'contrast', values: CONTRAST_VALUES });
  strategies.push({ name: 'brightness', values: BRIGHTNESS_VALUES });

  async function applyStrategyToImageData(
    sourceData: ImageData,
    strategyName: string,
    value: number
  ): Promise<Blob> {
    const dataCopy = new Uint8ClampedArray(sourceData.data);
    const imageData = new ImageData(dataCopy, sourceData.width, sourceData.height);

    switch (strategyName) {
      case 'blur':
        if (!hasAlpha) gaussianBlur(imageData, value);
        break;
      case 'posterize':
        posterize(imageData, value);
        break;
      case 'contrast':
        contrastReduce(imageData, value);
        break;
      case 'brightness':
        brightnessAdjust(imageData, value);
        break;
      case 'chroma':
        chromaSubsampling(imageData, '4:2:0');
        break;
      default:
        return blob;
    }

    ctx.putImageData(imageData, 0, 0);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), format));
  }

  async function testStrategyAlone(
    strategy: Strategy,
    targetKB: number,
    onProgress?: (data: any) => void
  ): Promise<Blob | null> {
    const minVal = strategy.values[0];
    const resultMin = await applyStrategyToImageData(baseImageData, strategy.name, minVal);
    onProgress?.({ strategy: strategy.name, value: minVal, sizeKB: resultMin.size / 1024 });
    if (resultMin.size / 1024 <= targetKB) return resultMin;

    const maxVal = strategy.values[strategy.values.length - 1];
    const resultMax = await applyStrategyToImageData(baseImageData, strategy.name, maxVal);
    onProgress?.({ strategy: strategy.name, value: maxVal, sizeKB: resultMax.size / 1024 });
    if (resultMax.size / 1024 <= targetKB) return resultMax;

    return null;
  }

  async function testCombination(
    strategies: Strategy[],
    targetKB: number,
    onProgress?: (data: any) => void
  ): Promise<Blob | null> {
    const valueCombinations = generateCombinations(strategies);
    for (const values of valueCombinations) {
      let currentData = new ImageData(
        new Uint8ClampedArray(baseImageData.data),
        baseImageData.width,
        baseImageData.height
      );

      for (let i = 0; i < strategies.length; i++) {
        const strat = strategies[i];
        const val = values[i];
        switch (strat.name) {
          case 'blur':
            if (!hasAlpha) gaussianBlur(currentData, val);
            break;
          case 'posterize':
            posterize(currentData, val);
            break;
          case 'contrast':
            contrastReduce(currentData, val);
            break;
          case 'brightness':
            brightnessAdjust(currentData, val);
            break;
          case 'chroma':
            chromaSubsampling(currentData, '4:2:0');
            break;
          default:
            break;
        }
      }

      ctx.putImageData(currentData, 0, 0);
      const result = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), format));
      const sizeKB = result.size / 1024;
      onProgress?.({
        strategy: 'combination',
        names: strategies.map(s => s.name).join('+'),
        values: values,
        sizeKB: sizeKB,
      });

      if (sizeKB <= targetKB) return result;
      if (result.size < bestSize) {
        bestBlob = result;
        bestSize = result.size;
      }
    }
    return null;
  }

  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    const result = await testStrategyAlone(strategy, targetKB, onProgress);
    if (result) {
      onProgress?.({ strategy: strategy.name, sizeKB: result.size / 1024, done: true });
      return result;
    }
    if (result && result.size < bestSize) {
      bestBlob = result;
      bestSize = result.size;
    }
  }

  for (let comboSize = 2; comboSize <= strategies.length; comboSize++) {
    const combos = getCombinations(strategies, comboSize);
    for (const combo of combos) {
      const result = await testCombination(combo, targetKB, onProgress);
      if (result) {
        onProgress?.({
          strategy: 'combination',
          names: combo.map(s => s.name).join('+'),
          sizeKB: result.size / 1024,
          done: true,
        });
        return result;
      }
    }
  }

  const fallback = await applyFallback(bestBlob, format, isLossyFormat);
  onProgress?.({ strategy: 'smallestPossible', sizeKB: fallback.size / 1024 });
  return fallback;
}

interface Strategy {
  name: string;
  values: number[];
}

function generateCombinations(strategies: Strategy[]): number[][] {
  if (strategies.length === 0) return [];
  let combinations: number[][] = [[]];
  for (const strategy of strategies) {
    const newCombinations: number[][] = [];
    for (const combo of combinations) {
      for (const value of strategy.values) {
        newCombinations.push([...combo, value]);
      }
    }
    combinations = newCombinations;
  }
  return combinations;
}

function getCombinations(strategies: Strategy[], size: number): Strategy[][] {
  if (size === 0) return [[]];
  if (strategies.length === 0) return [];
  const result: Strategy[][] = [];
  const [first, ...rest] = strategies;
  const combosWithoutFirst = getCombinations(rest, size);
  const combosWithFirst = getCombinations(rest, size - 1).map(combo => [first, ...combo]);
  return [...combosWithoutFirst, ...combosWithFirst];
}

async function applyFallback(blob: Blob, format: string, isLossyFormat: boolean): Promise<Blob> {
  const img = await loadImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.drawImage(img, 0, 0);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  imageData = posterize(imageData, 2);
  if (!isLossyFormat) {
    imageData = brightnessAdjust(imageData, 50);
    imageData = contrastReduce(imageData, 0.35);
  }
  ctx.putImageData(imageData, 0, 0);
  if (isLossyFormat) {
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), format, 0.0));
  }
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), format));
}

// ❌ DELETED local loadImage function