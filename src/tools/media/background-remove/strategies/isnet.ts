// src/tools/image/background-remove/strategies/isnet.strategy.ts

import { pipeline } from '@huggingface/transformers';
import type { ModelStrategy } from './base';

export const isnet: ModelStrategy = {
  id: 'isnet',
  name: 'ISNet (ONNX)',

  run: async (file: File, onProgress: (progress: number, speed: number, loaded?: number, total?: number) => void): Promise<Blob> => {
    onProgress(10, 0, 0, 0);

    const pipe = await pipeline('background-removal', 'onnx-community/ISNet-ONNX', { dtype: 'fp32' });
    onProgress(60, 0, 0, 0);

    const url = URL.createObjectURL(file);
    const output = await pipe([url]);
    URL.revokeObjectURL(url);

    onProgress(85, 0, 0, 0);

    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('[ISNet] Pipeline returned empty output:', output);
      throw new Error('ISNet pipeline returned empty output');
    }

    const blob = await output[0].toBlob();
    onProgress(100, 0, 0, 0);

    return blob;
  },
};