// src/tools/image/adjust-size/strategies/brightnessAdjust.ts
export function brightnessAdjust(imageData: ImageData, amount: number): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, data[i] - amount);
    data[i + 1] = Math.max(0, data[i + 1] - amount);
    data[i + 2] = Math.max(0, data[i + 2] - amount);
  }
  return imageData;
}