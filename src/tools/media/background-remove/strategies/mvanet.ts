// src/tools/image/background-remove/strategies/mvanet.strategy.ts

import { pipeline } from '@huggingface/transformers';
import type { ModelStrategy } from './base';

export const mvanet: ModelStrategy = {
  id: 'mvanet',
  name: 'MVANet',

  run: async (file: File, onProgress: (progress: number, speed: number, loaded?: number, total?: number) => void): Promise<Blob> => {
    onProgress(10, 0, 0, 0);

    const segmenter = await pipeline('background-removal', 'onnx-community/MVANet-ONNX', { dtype: 'fp32' });
    onProgress(60, 0, 0, 0);

    const url = URL.createObjectURL(file);
    const output = await segmenter([url]);
    URL.revokeObjectURL(url);

    onProgress(85, 0, 0, 0);

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('MVANet pipeline returned empty output');
    }

    const blob = await output[0].toBlob();
    onProgress(100, 0, 0, 0);

    return blob;
  },
};