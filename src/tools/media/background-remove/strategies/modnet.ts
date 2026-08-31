// src/tools/image/background-remove/strategies/modnet.strategy.ts

import { AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';
import type { ModelStrategy } from './base';

export const modnet: ModelStrategy = {
  id: 'modnet',
  name: 'MODNet',
  license: 'Apache-2.0 ✅',
  size: '~10 MB',
  description: 'Fastest, smallest, portraits',

  run: async (file: File, onProgress: (progress: number, speed: number, loaded?: number, total?: number) => void): Promise<Blob> => {
  
    onProgress(10, 0, 0, 0);

    const model = await AutoModel.from_pretrained('Xenova/modnet', {
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
    onProgress(50, 0, 0, 0);

    const processor = await AutoProcessor.from_pretrained('Xenova/modnet');
    onProgress(65, 0, 0, 0);

    const image = await RawImage.fromBlob(file);
    const { pixel_values } = await processor(image);
    onProgress(80, 0, 0, 0);

    const { output } = await model({ input: pixel_values });
    onProgress(90, 0, 0, 0);

    const maskImage = await RawImage
      .fromTensor(output[0].mul(255).to('uint8'))
      .resize(image.width, image.height);

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;

    const img = await createImageBitmap(file);
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = image.width;
    maskCanvas.height = image.height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.drawImage(await maskImage.toCanvas(), 0, 0);
    const maskData = maskCtx.getImageData(0, 0, image.width, image.height).data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = maskData[i] / 255;
      data[i + 3] = Math.min(data[i + 3], alpha * 255);
    }

    ctx.putImageData(imageData, 0, 0);

    const transparentBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });

    onProgress(100, 0, 0, 0);

  
    return transparentBlob;
  },
};