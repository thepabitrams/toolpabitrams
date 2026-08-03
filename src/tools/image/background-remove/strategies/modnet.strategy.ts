// src/tools/image/background-remove/strategies/modnet.strategy.ts

import { AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';
import type { ModelStrategy } from './base.strategy';

export const modnetStrategy: ModelStrategy = {
  id: 'modnet',
  name: 'MODNet',
  license: 'Apache-2.0 ✅',
  size: '~10 MB',
  description: 'Fastest, smallest, portraits',

  run: async (file: File, onProgress: (progress: number, speed: number) => void): Promise<Blob> => {
    console.log('[MODNet] Loading model with AutoModel...');
    onProgress(10, 0);

    // 1. 加载模型和处理器
    const model = await AutoModel.from_pretrained('Xenova/modnet', {
      dtype: 'fp32',
      progress_callback: (info: any) => {
        if (info.status === 'downloading') {
          const percent = Math.round((info.progress || 0) * 100);
          const speed = info.speed || 0;
          onProgress(percent, speed);
        }
      },
    });
    onProgress(50, 0);

    const processor = await AutoProcessor.from_pretrained('Xenova/modnet');
    onProgress(65, 0);

    // 2. 加载并预处理图片
    const image = await RawImage.fromBlob(file);
    const { pixel_values } = await processor(image);
    onProgress(80, 0);

    // 3. 运行推理
    const { output } = await model({ input: pixel_values });
    onProgress(90, 0);

    // 4. 从 output[0] 生成掩码
    const maskImage = await RawImage
      .fromTensor(output[0].mul(255).to('uint8'))
      .resize(image.width, image.height);

    // 5. 将掩码应用到原图，生成透明 PNG
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;

    // 绘制原图
    const img = await createImageBitmap(file);
    ctx.drawImage(img, 0, 0);

    // 获取像素数据
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    // 获取掩码像素数据
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = image.width;
    maskCanvas.height = image.height;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.drawImage(await maskImage.toCanvas(), 0, 0);
    const maskData = maskCtx.getImageData(0, 0, image.width, image.height).data;

    // 应用掩码作为 alpha 通道
    for (let i = 0; i < data.length; i += 4) {
      const alpha = maskData[i] / 255;
      data[i + 3] = Math.min(data[i + 3], alpha * 255);
    }

    ctx.putImageData(imageData, 0, 0);

    // 导出为透明 PNG
    const transparentBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });

    onProgress(100, 0);

    console.log('[MODNet] Complete ✅');
    return transparentBlob;
  },
};