// src/tools/image/adjust-size/strategies/chromaSubsampling.ts
export function chromaSubsampling(
  imageData: ImageData,
  mode: '4:4:4' | '4:2:2' | '4:2:0' | '4:1:1'
): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data);

  if (mode === '4:4:4') {
    return imageData;
  }

  if (mode === '4:2:2') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x += 2) {
        const idx1 = (y * width + x) * 4;
        const idx2 = (y * width + Math.min(x + 1, width - 1)) * 4;
        const avgR = (data[idx1] + data[idx2]) / 2;
        const avgG = (data[idx1 + 1] + data[idx2 + 1]) / 2;
        const avgB = (data[idx1 + 2] + data[idx2 + 2]) / 2;
        output[idx1] = avgR;
        output[idx1 + 1] = avgG;
        output[idx1 + 2] = avgB;
        output[idx2] = avgR;
        output[idx2 + 1] = avgG;
        output[idx2 + 2] = avgB;
      }
    }
    return new ImageData(output, width, height);
  }

  if (mode === '4:2:0') {
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx1 = (y * width + x) * 4;
        const idx2 = (y * width + Math.min(x + 1, width - 1)) * 4;
        const idx3 = (Math.min(y + 1, height - 1) * width + x) * 4;
        const idx4 = (Math.min(y + 1, height - 1) * width + Math.min(x + 1, width - 1)) * 4;
        const avgR = (data[idx1] + data[idx2] + data[idx3] + data[idx4]) / 4;
        const avgG = (data[idx1 + 1] + data[idx2 + 1] + data[idx3 + 1] + data[idx4 + 1]) / 4;
        const avgB = (data[idx1 + 2] + data[idx2 + 2] + data[idx3 + 2] + data[idx4 + 2]) / 4;
        output[idx1] = avgR;
        output[idx1 + 1] = avgG;
        output[idx1 + 2] = avgB;
        output[idx2] = avgR;
        output[idx2 + 1] = avgG;
        output[idx2 + 2] = avgB;
        output[idx3] = avgR;
        output[idx3 + 1] = avgG;
        output[idx3 + 2] = avgB;
        output[idx4] = avgR;
        output[idx4 + 1] = avgG;
        output[idx4 + 2] = avgB;
      }
    }
    return new ImageData(output, width, height);
  }

  if (mode === '4:1:1') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x += 4) {
        const indices = [];
        for (let k = 0; k < 4; k++) {
          const px = Math.min(x + k, width - 1);
          indices.push((y * width + px) * 4);
        }
        let sumR = 0,
          sumG = 0,
          sumB = 0;
        for (const idx of indices) {
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
        }
        const avgR = sumR / indices.length;
        const avgG = sumG / indices.length;
        const avgB = sumB / indices.length;
        for (const idx of indices) {
          output[idx] = avgR;
          output[idx + 1] = avgG;
          output[idx + 2] = avgB;
        }
      }
    }
    return new ImageData(output, width, height);
  }

  return imageData;
}