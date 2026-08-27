// src/tools/image/adjust-size/strategies/padding.ts
export async function padding(file: File, targetKB: number): Promise<Blob> {
  const targetBytes = targetKB * 1024;
  const originalBytes = file.size;

  if (originalBytes >= targetBytes) return file;

  const arrayBuffer = await file.arrayBuffer();
  const originalData = new Uint8Array(arrayBuffer);
  const extraBytes = targetBytes - originalBytes;

  const isJPEG = file.type === 'image/jpeg' || file.type === 'image/jpg' || detectJPEG(originalData);
  const isPNG = file.type === 'image/png' || detectPNG(originalData);
  const isWebP = file.type === 'image/webp' || detectWebP(originalData);
  const isAVIF = file.type === 'image/avif' || detectAVIF(originalData);
  const isGIF = file.type === 'image/gif' || detectGIF(originalData);
  const isBMP = file.type === 'image/bmp' || detectBMP(originalData);

  if (isJPEG) return padJPEG(originalData, extraBytes, file.type);
  if (isPNG) return padPNG(originalData, extraBytes, file.type);
  if (isWebP) return padWebP(originalData, extraBytes, file.type);
  if (isAVIF) return padAVIF(originalData, extraBytes, file.type);
  if (isGIF) return padGIF(originalData, extraBytes, file.type);
  if (isBMP) return padBMP(originalData, extraBytes, file.type);

  return fallbackPad(originalData, extraBytes, file.type);
}

function detectJPEG(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0xFF && data[1] === 0xD8;
}

function detectPNG(data: Uint8Array): boolean {
  return data.length >= 8 &&
    data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47 &&
    data[4] === 0x0D && data[5] === 0x0A && data[6] === 0x1A && data[7] === 0x0A;
}

function detectWebP(data: Uint8Array): boolean {
  return data.length >= 12 &&
    data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
    data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50;
}

function detectAVIF(data: Uint8Array): boolean {
  if (data.length < 12) return false;
  if (data[0] !== 0x00 || data[1] !== 0x00 || data[2] !== 0x00) return false;
  const size = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | data[3];
  if (size < 8) return false;
  const type = String.fromCharCode(data[4], data[5], data[6], data[7]);
  return type === 'ftyp' && data[8] === 0x61 && data[9] === 0x76 && data[10] === 0x69 && data[11] === 0x66;
}

function detectGIF(data: Uint8Array): boolean {
  return data.length >= 6 && data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38;
}

function detectBMP(data: Uint8Array): boolean {
  return data.length >= 2 && data[0] === 0x42 && data[1] === 0x4D;
}

function padJPEG(original: Uint8Array, extraBytes: number, mime: string): Blob {
  let eoiIndex = -1;
  for (let i = original.length - 2; i >= 0; i--) {
    if (original[i] === 0xFF && original[i + 1] === 0xD9) {
      eoiIndex = i;
      break;
    }
  }
  const result = new Uint8Array(original.length + extraBytes);
  if (eoiIndex !== -1) {
    const eoiEnd = eoiIndex + 2;
    result.set(original.subarray(0, eoiEnd), 0);
    for (let i = eoiEnd; i < eoiEnd + extraBytes; i++) result[i] = 0x00;
  } else {
    result.set(original, 0);
    for (let i = original.length; i < result.length; i++) result[i] = 0x00;
  }
  return new Blob([result], { type: mime });
}

function padPNG(original: Uint8Array, extraBytes: number, mime: string): Blob {
  const iendStart = original.length - 12;
  const iendChunk = original.subarray(iendStart);
  const keyword = 'Padding';
  const keywordBytes = new TextEncoder().encode(keyword);
  const nullByte = new Uint8Array([0x00]);
  const paddingBytes = new Uint8Array(extraBytes);
  const chunkData = new Uint8Array([...keywordBytes, ...nullByte, ...paddingBytes]);
  const chunkLength = chunkData.length;
  const chunkType = new TextEncoder().encode('tEXt');
  const chunkCrc = crc32(chunkType, chunkData);
  const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, chunkLength, false);
  chunk.set(chunkType, 4);
  chunk.set(chunkData, 8);
  view.setUint32(8 + chunkData.length, chunkCrc, false);
  const result = new Uint8Array(iendStart + chunk.length + 12);
  result.set(original.subarray(0, iendStart), 0);
  result.set(chunk, iendStart);
  result.set(iendChunk, iendStart + chunk.length);
  return new Blob([result], { type: mime });
}

// FIXED: Just append, don't update RIFF size
function padWebP(original: Uint8Array, extraBytes: number, mime: string): Blob {
  const result = new Uint8Array(original.length + extraBytes);
  result.set(original, 0);
  for (let i = original.length; i < result.length; i++) result[i] = 0x00;
  return new Blob([result], { type: mime });
}

function padAVIF(original: Uint8Array, extraBytes: number, mime: string): Blob {
  const freeBoxSize = 8 + extraBytes;
  const freeBox = new Uint8Array(freeBoxSize);
  const view = new DataView(freeBox.buffer);
  view.setUint32(0, freeBoxSize, false);
  freeBox[4] = 0x66; freeBox[5] = 0x72; freeBox[6] = 0x65; freeBox[7] = 0x65;
  const result = new Uint8Array(original.length + freeBoxSize);
  result.set(original, 0);
  result.set(freeBox, original.length);
  return new Blob([result], { type: mime });
}

function padGIF(original: Uint8Array, extraBytes: number, mime: string): Blob {
  let trailerIndex = -1;
  for (let i = original.length - 1; i >= 0; i--) {
    if (original[i] === 0x3B) { trailerIndex = i; break; }
  }
  const result = new Uint8Array(original.length + extraBytes);
  if (trailerIndex !== -1) {
    result.set(original.subarray(0, trailerIndex + 1), 0);
    for (let i = trailerIndex + 1; i < trailerIndex + 1 + extraBytes; i++) result[i] = 0x00;
  } else {
    result.set(original, 0);
    for (let i = original.length; i < result.length; i++) result[i] = 0x00;
  }
  return new Blob([result], { type: mime });
}

function padBMP(original: Uint8Array, extraBytes: number, mime: string): Blob {
  const result = new Uint8Array(original.length + extraBytes);
  result.set(original, 0);
  for (let i = original.length; i < result.length; i++) result[i] = 0x00;
  return new Blob([result], { type: mime });
}

function fallbackPad(original: Uint8Array, extraBytes: number, mime: string): Blob {
  const result = new Uint8Array(original.length + extraBytes);
  result.set(original, 0);
  for (let i = original.length; i < result.length; i++) result[i] = 0x00;
  return new Blob([result], { type: mime });
}

function crc32(type: Uint8Array, data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  const table = makeCrcTable();
  for (const byte of type) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  for (const byte of data) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return crc ^ 0xFFFFFFFF;
}

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
}