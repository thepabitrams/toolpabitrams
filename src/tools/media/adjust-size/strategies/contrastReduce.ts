// src/tools/image/adjust-size/strategies/contrastReduce.ts
export function contrastReduce(imageData: ImageData, factor: number): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 128 + (data[i] - 128) * factor;
    data[i + 1] = 128 + (data[i + 1] - 128) * factor;
    data[i + 2] = 128 + (data[i + 2] - 128) * factor;
  }
  return imageData;
}