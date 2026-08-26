// src/tools/image/background-remove/strategies/birefnet.strategy.ts

import { pipeline } from '@huggingface/transformers';
import type { ModelStrategy } from './base.strategy';

export const birefnetStrategy: ModelStrategy = {
  id: 'birefnet',
  name: 'BiRefNet-lite-512',
  license: 'MIT ✅',
  size: '94 MB',
  description: 'Highest quality, MIT licensed',

    run: async (file: File, onProgress: (progress: number, speed: number, loaded?: number, total?: number) => void): Promise<Blob> => {
    
    onProgress(10, 0, 0, 0);

    try {
      const pipe = await pipeline('image-segmentation', 'studioludens/birefnet-lite-512', {
      progress_callback: (info: any) => {
      if (info.status === 'downloading') {
         const percent = Math.round((info.progress || 0) * 100);
         const speed = (info.speed || 0) / (1024 * 1024); // MB/s
         const loaded = (info.loaded || 0) / (1024 * 1024); // MB
         const total = (info.total || 0) / (1024 * 1024); // MB
    
         onProgress(percent, speed, loaded, total);
          }
        },
      });
      onProgress(60, 0, 0, 0);

      const url = URL.createObjectURL(file);
      const output = await pipe(url);
      URL.revokeObjectURL(url);
      onProgress(85, 0, 0, 0);

      // Typical pipeline output: [{ mask, score, label }, ...]
      const candidateMask = output?.[0]?.mask;
      if (!candidateMask) {
        console.error('[BiRefNet] Pipeline returned no mask. Full output:', output);
        throw new Error('BiRefNet pipeline returned no mask');
      }

      const maskImageData = await normalizeMaskToImageData(candidateMask, file);
      if (!maskImageData) {
        console.error('[BiRefNet] Failed to normalize mask to ImageData. Candidate:', candidateMask);
        throw new Error('Failed to process BiRefNet mask');
      }

      const blob = await applyMaskToImage(file, maskImageData);
      onProgress(100, 0, 0, 0);

      
      return blob;

    } catch (error) {
      console.error('[BiRefNet] Error:', error);
      throw error;
    }
  },
};

// ─── Normalize mask candidate into ImageData sized to original image ──────────────────────
async function normalizeMaskToImageData(candidate: any, file: File): Promise<ImageData> {
  const img = await loadImageFromFile(file);
  const targetW = img.width;
  const targetH = img.height;

  // If already ImageData
  if (candidate instanceof ImageData) {
    return (candidate.width === targetW && candidate.height === targetH)
      ? candidate
      : resizeImageDataNearest(candidate, targetW, targetH);
  }

  // If candidate is canvas or image element
  if (candidate instanceof HTMLCanvasElement) {
    const ctx = candidate.getContext('2d')!;
    const src = ctx.getImageData(0, 0, candidate.width, candidate.height);
    return (candidate.width === targetW && candidate.height === targetH)
      ? src
      : resizeImageDataNearest(src, targetW, targetH);
  }
  if (candidate instanceof HTMLImageElement) {
    const c = document.createElement('canvas');
    c.width = candidate.width;
    c.height = candidate.height;
    c.getContext('2d')!.drawImage(candidate, 0, 0);
    const src = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
    return (c.width === targetW && c.height === targetH)
      ? src
      : resizeImageDataNearest(src, targetW, targetH);
  }

  // If candidate is a data URL (base64 PNG)
  if (typeof candidate === 'string' && candidate.startsWith('data:image')) {
    const imgEl = await loadImageFromUrl(candidate);
    const c = document.createElement('canvas');
    c.width = imgEl.width;
    c.height = imgEl.height;
    c.getContext('2d')!.drawImage(imgEl, 0, 0);
    const src = c.getContext('2d')!.getImageData(0, 0, c.width, c.height);
    return (c.width === targetW && c.height === targetH)
      ? src
      : resizeImageDataNearest(src, targetW, targetH);
  }

  // NEW: Handle _RawImage-like objects: { data: Uint8ClampedArray, width, height, channels }
  if (candidate && typeof candidate === 'object' && candidate.data && candidate.width && candidate.height) {
    const w = candidate.width;
    const h = candidate.height;
    const ch = candidate.channels ?? 1;
    const raw = candidate.data;

    // If it's already an RGBA buffer and matches size, wrap directly
    if (ch === 4 && raw.length === w * h * 4) {
      const src = new ImageData(new Uint8ClampedArray(raw), w, h);
      return (w === targetW && h === targetH) ? src : resizeImageDataNearest(src, targetW, targetH);
    }

    // If single-channel or multi-channel not RGBA, expand to RGBA
    if ((ch === 1 && raw.length === w * h) || (raw.length === w * h * ch)) {
      const rgba = new Uint8ClampedArray(w * h * 4);
      if (ch === 1) {
        for (let i = 0; i < w * h; ++i) {
          const v = raw[i];
          const j = i * 4;
          rgba[j + 0] = v;
          rgba[j + 1] = v;
          rgba[j + 2] = v;
          rgba[j + 3] = 255;
        }
      } else {
        // If candidate has channels >1 but not 4, take first channel as mask
        const channelStride = w * h;
        for (let i = 0; i < w * h; ++i) {
          const v = raw[i]; // default fallback
          const j = i * 4;
          rgba[j + 0] = v;
          rgba[j + 1] = v;
          rgba[j + 2] = v;
          rgba[j + 3] = 255;
        }
      }
      const src = new ImageData(rgba, w, h);
      return (w === targetW && h === targetH) ? src : resizeImageDataNearest(src, targetW, targetH);
    }

    // If we reach here, log and continue to other handlers
    console.warn('[BiRefNet] Candidate looked like RawImage but had unexpected layout:', candidate);
  }

  // Otherwise, try to extract tensor-like info (handles proxies, ort_tensor, dims/data, arrays)
  const info = extractTensorInfo(candidate);
  if (!info) {
    console.error('[BiRefNet] Unrecognized mask candidate format:', candidate);
    throw new Error('Unrecognized mask format');
  }

  const raw = await info.getData(); // TypedArray or nested arrays
  const shape = Array.isArray(info.shape) ? info.shape.slice() : [];

  // Normalize raw to Float32Array
  let flat: Float32Array;
  if (Array.isArray(raw)) {
    flat = new Float32Array(flattenArray(raw));
  } else if (ArrayBuffer.isView(raw)) {
    if (raw instanceof Float32Array) flat = raw;
    else flat = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / Float32Array.BYTES_PER_ELEMENT);
  } else if (raw && raw.buffer) {
    flat = new Float32Array(raw.buffer);
  } else {
    console.error('[BiRefNet] Unsupported raw tensor data format:', raw);
    throw new Error('Unsupported raw tensor data format');
  }

  // Interpret dims: common shapes [B,C,H,W], [C,H,W], [B,H,W], [H,W]
  let B = 1, C = 1, H = 0, W = 0;
  if (shape.length === 4) {
    [B, C, H, W] = shape;
  } else if (shape.length === 3) {
    if (shape[0] === 1) { B = 1; C = 1; H = shape[1]; W = shape[2]; }
    else { B = 1; C = shape[0]; H = shape[1]; W = shape[2]; }
  } else if (shape.length === 2) {
    H = shape[0]; W = shape[1]; C = 1; B = 1;
  } else {
    const approx = Math.round(Math.sqrt(flat.length));
    H = approx; W = approx; C = 1; B = 1;
    console.warn('[BiRefNet] Fallback inferred dims HxW:', H, W);
  }

  if (H === 0 || W === 0) throw new Error('Invalid mask dimensions');

  // Collapse channels to single-channel mask (mean across channels)
  const pixelCount = H * W;
  const mask = new Uint8ClampedArray(pixelCount);

  if (C === 1) {
    const offset = 0;
    for (let i = 0; i < pixelCount; ++i) {
      let v = flat[offset + i];
      if (Math.abs(v) > 1) v = 1 / (1 + Math.exp(-v));
      v = Math.max(0, Math.min(1, v));
      mask[i] = Math.round(v * 255);
    }
  } else {
    const channelStride = H * W;
    const base = 0;
    for (let p = 0; p < pixelCount; ++p) {
      let sum = 0;
      for (let ch = 0; ch < C; ++ch) {
        const idx = base + ch * channelStride + p;
        let v = flat[idx];
        if (Math.abs(v) > 1) v = 1 / (1 + Math.exp(-v));
        v = Math.max(0, Math.min(1, v));
        sum += v;
      }
      const avg = sum / C;
      mask[p] = Math.round(avg * 255);
    }
  }

  // Build RGBA ImageData (R/G/B = mask, A = 255)
  const rgba = new Uint8ClampedArray(pixelCount * 4);
  for (let i = 0; i < pixelCount; ++i) {
    const m = mask[i];
    const j = i * 4;
    rgba[j + 0] = m;
    rgba[j + 1] = m;
    rgba[j + 2] = m;
    rgba[j + 3] = 255;
  }

  const srcImageData = new ImageData(rgba, W, H);
  return (W === targetW && H === targetH) ? srcImageData : resizeImageDataNearest(srcImageData, targetW, targetH);
}

// ─── Extract tensor info from various wrappers ──────────────────────
function extractTensorInfo(candidate: any): { shape: number[]; getData: () => Promise<any> } | null {
  if (!candidate) return null;

  // 1) High-level tensor-like with .shape and .array() or .data
  if (candidate.shape && (typeof candidate.array === 'function' || candidate.data)) {
    return { shape: candidate.shape, getData: async () => candidate.data ?? await candidate.array() };
  }

  // 2) ONNX Runtime proxy: candidate.ort_tensor
  if (candidate.ort_tensor) {
    const ort = candidate.ort_tensor;
    if (ort.dims && (ort.data || typeof ort.dataSync === 'function')) {
      return { shape: ort.dims, getData: async () => ort.data ?? (typeof ort.dataSync === 'function' ? ort.dataSync() : null) };
    }
  }

  // 3) Plain object with dims/data
  if (candidate.dims && candidate.data) {
    return { shape: candidate.dims, getData: async () => candidate.data };
  }

  // 4) Nested search
  if (typeof candidate === 'object') {
    for (const k of Object.keys(candidate)) {
      const nested = candidate[k];
      if (nested && nested.shape && nested.data) return { shape: nested.shape, getData: async () => nested.data };
      if (nested && nested.ort_tensor && nested.ort_tensor.dims && nested.ort_tensor.data) {
        return { shape: nested.ort_tensor.dims, getData: async () => nested.ort_tensor.data };
      }
    }
  }

  return null;
}

// ─── Utilities ──────────────────────
function flattenArray(arr: any[]): number[] {
  const out: number[] = [];
  const stack = [...arr];
  while (stack.length) {
    const v = stack.shift();
    if (Array.isArray(v)) stack.unshift(...v);
    else out.push(Number(v));
  }
  return out;
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image from file')); };
    img.src = url;
  });
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image from url'));
    img.src = url;
  });
}

function resizeImageDataNearest(src: ImageData, targetW: number, targetH: number): ImageData {
  const sCanvas = document.createElement('canvas');
  sCanvas.width = src.width;
  sCanvas.height = src.height;
  const sCtx = sCanvas.getContext('2d')!;
  sCtx.putImageData(src, 0, 0);

  const tCanvas = document.createElement('canvas');
  tCanvas.width = targetW;
  tCanvas.height = targetH;
  const tCtx = tCanvas.getContext('2d')!;
  tCtx.imageSmoothingEnabled = false;
  tCtx.drawImage(sCanvas, 0, 0, targetW, targetH);

  return tCtx.getImageData(0, 0, targetW, targetH);
}

// ─── Apply mask to original image ──────────────────────
async function applyMaskToImage(file: File, maskData: ImageData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // Ensure maskData matches image size
      let mask = maskData;
      if (maskData.width !== img.width || maskData.height !== img.height) {
        mask = resizeImageDataNearest(maskData, img.width, img.height);
      }
      const maskBuffer = mask.data;

      // Apply mask: replace alpha channel with mask value (use R channel)
      for (let y = 0; y < img.height; ++y) {
        for (let x = 0; x < img.width; ++x) {
          const idx = y * img.width + x;
          const imgOffset = idx * 4;
          const maskOffset = idx * 4;
          const maskVal = maskBuffer[maskOffset]; // 0..255
          const alpha = maskVal / 255;
          data[imgOffset + 3] = Math.round(alpha * 255);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
