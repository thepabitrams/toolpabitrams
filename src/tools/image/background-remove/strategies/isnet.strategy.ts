// src/tools/image/background-remove/strategies/isnet.strategy.ts

import { pipeline } from '@huggingface/transformers';
import type { ModelStrategy } from './base.strategy';

export const isnetStrategy: ModelStrategy = {
  id: 'isnet',
  name: 'ISNet (ONNX)',
  license: 'Apache-2.0 ✅',
  size: '~80 MB',
  description: 'Best "just works" default',

  run: async (file: File, onProgress: (progress: number, speed: number) => void): Promise<Blob> => {
    console.log('[ISNet] Loading model...');
    onProgress(10, 0);

    const pipe = await pipeline('background-removal', 'onnx-community/ISNet-ONNX', {
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
    // ✅ FIX: Pass as ARRAY (ISNet requires array)
    const output = await pipe([url]);
    URL.revokeObjectURL(url);

    onProgress(85, 0);

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error('ISNet pipeline returned empty output');
    }

    const blob = await output[0].toBlob();
    onProgress(100, 0);

    console.log('[ISNet] Complete ✅');
    return blob;
  },
};