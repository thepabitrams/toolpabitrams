// src/tools/image/background-remove/strategies/isnet.strategy.ts

import { pipeline } from '@huggingface/transformers';
import type { ModelStrategy } from './base.strategy';

export const isnetStrategy: ModelStrategy = {
  id: 'isnet',
  name: 'ISNet (ONNX)',
  license: 'Apache-2.0 ✅',
  size: '~80 MB',
  description: 'Best "just works" default',

  run: async (file: File, onProgress: (progress: number, speed: number, loaded?: number, total?: number) => void): Promise<Blob> => {
   
    onProgress(10, 0, 0, 0);

    const pipe = await pipeline('background-removal', 'onnx-community/ISNet-ONNX', {
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

    // ✅ FIX: Pass as ARRAY (same as MVANet and ormbg)
    const url = URL.createObjectURL(file);
    const output = await pipe([url]);  // ← Changed to array
    URL.revokeObjectURL(url);

    onProgress(85, 0, 0, 0);

    // ✅ Robust check
    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('[ISNet] Pipeline returned empty output:', output);
      throw new Error('ISNet pipeline returned empty output');
    }

    // ✅ Get the first result and convert to blob
    const blob = await output[0].toBlob();
    onProgress(100, 0, 0, 0);

  
    return blob;
  },
};