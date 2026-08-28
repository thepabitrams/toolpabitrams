// src/lib/browser/drawImage.ts

export function drawImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width?: number,
  height?: number
): void {
  if (width && height) {
    ctx.drawImage(img, x, y, width, height);
  } else {
    ctx.drawImage(img, x, y);
  }
}