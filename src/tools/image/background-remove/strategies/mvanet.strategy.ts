// src/tools/image/background-remove/strategies/mvanet.strategy.ts

import { pipeline } from '@huggingface/transformers';
import type { ModelStrategy } from './base.strategy';

export const mvanetStrategy: ModelStrategy = {
  id: 'mvanet',
  name: 'MVANet',
  license: 'MIT ✅',
  size: '~? MB',
  description: 'Lightweight, MIT licensed',

  run: async (file: File, onProgress: (progress: number, speed: number) => void): Promise<Blob> => {
    console.log('[MVANet] Loading model...');
    onProgress(10, 0);

    const segmenter = await pipeline('background-removal', 'onnx-community/MVANet-ONNX', {
      dtype: 'fp32',
      progress_callback: (info: any) => {
        if (info.status === 'downloading') {
          const percent = Math.round((info.progress || 0) * 100);
          const speed = info.speed || 0;
          onProgress(percent, speed);
        }
      },
    });
    onProgress(60, 0);

    const url = URL.createObjectURL(file);

    // ✅ Official way: pass as array
    const output = await segmenter([url]);
    URL.revokeObjectURL(url);

    onProgress(85, 0);

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('MVANet pipeline returned empty output');
    }

    const blob = await output[0].toBlob();
    onProgress(100, 0);

    console.log('[MVANet] Complete ✅');
    return blob;
  },
};