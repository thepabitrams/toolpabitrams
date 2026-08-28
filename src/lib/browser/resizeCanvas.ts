// src/lib/browser/resizeCanvas.ts

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void {
  canvas.width = width;
  canvas.height = height;
}