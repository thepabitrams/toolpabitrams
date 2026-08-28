// src/lib/browser/revokeUrl.ts

export function revokeUrl(url: string): void {
  URL.revokeObjectURL(url);
}