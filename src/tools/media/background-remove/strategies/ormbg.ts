// src/tools/image/background-remove/strategies/ormbg.strategy.ts

import { pipeline } from '@huggingface/transformers';
import type { ModelStrategy } from './base';

export const ormbgStrategy: ModelStrategy = {
  id: 'ormbg',
  name: 'ormbg',
  license: 'Apache-2.0 ✅',
  size: '~? MB',
  description: 'Photorealistic cut-out, Apache-2.0',

  run: async (file: File, onProgress: (progress: number, speed: number, loaded?: number, total?: number) => void): Promise<Blob> => {
    
    onProgress(10, 0, 0, 0);

    const segmenter = await pipeline('background-removal', 'onnx-community/ormbg-ONNX', {
      dtype: 'fp32',
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
    const output = await segmenter([url]);
    URL.revokeObjectURL(url);

    onProgress(85, 0, 0, 0);

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('ormbg pipeline returned empty output');
    }

    const blob = await output[0].toBlob();
    onProgress(100, 0, 0, 0);

   
    return blob;
  },
};