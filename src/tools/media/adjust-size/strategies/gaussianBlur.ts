// src/tools/image/adjust-size/strategies/gaussianBlur.ts
export function gaussianBlur(imageData: ImageData, radius: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const output = new Uint8ClampedArray(data);

  const kernelSize = Math.max(3, Math.ceil(radius * 2.5));
  const kernel = new Float32Array(kernelSize);
  let sum = 0;
  const sigma = radius / 2;
  for (let i = 0; i < kernelSize; i++) {
    const x = i - (kernelSize - 1) / 2;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }

  const half = Math.floor(kernelSize / 2);
  const temp = new Uint8ClampedArray(data);

  const blurHorizontal = () => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;
        for (let k = 0; k < kernelSize; k++) {
          const sx = Math.min(width - 1, Math.max(0, x + k - half));
          const idx = (y * width + sx) * 4;
          const weight = kernel[k];
          r += temp[idx] * weight;
          g += temp[idx + 1] * weight;
          b += temp[idx + 2] * weight;
        }
        const idx = (y * width + x) * 4;
        output[idx] = r;
        output[idx + 1] = g;
        output[idx + 2] = b;
      }
    }
  };

  blurHorizontal();
  temp.set(output);

  const blurVertical = () => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;
        for (let k = 0; k < kernelSize; k++) {
          const sy = Math.min(height - 1, Math.max(0, y + k - half));
          const idx = (sy * width + x) * 4;
          const weight = kernel[k];
          r += temp[idx] * weight;
          g += temp[idx + 1] * weight;
          b += temp[idx + 2] * weight;
        }
        const idx = (y * width + x) * 4;
        output[idx] = r;
        output[idx + 1] = g;
        output[idx + 2] = b;
      }
    }
  };

  blurVertical();

  return new ImageData(output, width, height);
}