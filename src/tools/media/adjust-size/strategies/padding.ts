// src/tools/image/adjust-size/strategies/padding.ts
export async function padding(file: File, targetKB: number): Promise<Blob> {
  const targetBytes = targetKB * 1024;
  const originalBytes = file.size;

  if (originalBytes >= targetBytes) {
    return file;
  }

  const arrayBuffer = await file.arrayBuffer();
  const originalData = new Uint8Array(arrayBuffer);
  const paddedData = new Uint8Array(targetBytes);

  paddedData.set(originalData, 0);

  for (let i = originalBytes; i < targetBytes; i++) {
    paddedData[i] = 0x00;
  }

  return new Blob([paddedData], { type: file.type });
}