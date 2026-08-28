// src/lib/browser/blobToUrl.ts

export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}